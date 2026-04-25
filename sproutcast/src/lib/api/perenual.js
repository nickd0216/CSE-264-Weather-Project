// src/lib/api/perenual.js
// Thin wrapper around Perenual's species search. Used by the admin panel to
// import plant data — we don't hit Perenual from public routes because:
//   1. free tier has a tight rate limit (100/day)
//   2. we want plants cached in OUR db so searches are fast
//
// Docs: https://perenual.com/docs/api

const BASE = 'https://perenual.com/api';

function getKey() {
  const k = process.env.PERENUAL_API_KEY;
  if (!k) {
    const err = new Error('PERENUAL_API_KEY is not set');
    err.status = 500;
    throw err;
  }
  return k;
}

// Search species by name. Returns an array in our db-ready shape.
export async function searchPerenual(query) {
  const key = getKey();
  const res = await fetch(
    `${BASE}/species-list?key=${key}&q=${encodeURIComponent(query)}`,
  );
  if (!res.ok) {
    const err = new Error('Perenual request failed');
    err.status = 502;
    throw err;
  }
  const data = await res.json();
  return (data.data ?? []).map(normalizeSpecies);
}

function normalizeSpecies(s) {
  return {
    external_id: s.id,
    common_name: s.common_name ?? 'Unknown',
    scientific_name: Array.isArray(s.scientific_name)
      ? s.scientific_name[0]
      : s.scientific_name,
    watering: (s.watering ?? '').toLowerCase() || null,
    sunlight: Array.isArray(s.sunlight) ? s.sunlight.join(',') : s.sunlight,
    image_url: s.default_image?.regular_url ?? s.default_image?.original_url ?? null,
    // Perenual's free tier doesn't return hardiness range — admin fills those in.
    min_temp_f: null,
    max_temp_f: null,
    seasons: null,
    description: null,
  };
}