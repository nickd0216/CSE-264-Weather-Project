// src/lib/api/openweather.js
// Thin wrapper around the OpenWeather free-tier endpoints. Two reasons to centralize:
//   1. the API key stays in one place, never leaks to the client
//   2. we can normalize OpenWeather's verbose response to our own shape so the
//      frontend doesn't have to know what nested fields like list[0].main.temp mean
//
// Free tier endpoints used:
//   /data/2.5/weather   - current weather
//   /data/2.5/forecast  - 5 day / 3 hour forecast

const BASE = 'https://api.openweathermap.org/data/2.5';

function getKey() {
  const k = process.env.OPENWEATHER_API_KEY;
  if (!k) {
    const err = new Error('OPENWEATHER_API_KEY is not set');
    err.status = 500;
    throw err;
  }
  return k;
}

// Fetch current weather + 5-day forecast for a lat/lon, return our normalized shape.
export async function fetchWeather({ lat, lon }) {
  const key = getKey();
  const qs = `lat=${lat}&lon=${lon}&units=imperial&appid=${key}`;

  const [curRes, fcRes] = await Promise.all([
    fetch(`${BASE}/weather?${qs}`),
    fetch(`${BASE}/forecast?${qs}`),
  ]);

  if (!curRes.ok || !fcRes.ok) {
    const err = new Error('OpenWeather request failed');
    err.status = 502;
    throw err;
  }

  const cur = await curRes.json();
  const fc = await fcRes.json();

  return {
    location: {
      name: cur.name,
      lat: cur.coord.lat,
      lon: cur.coord.lon,
      country: cur.sys?.country,
    },
    current: {
      temp_f: Math.round(cur.main.temp),
      feels_like_f: Math.round(cur.main.feels_like),
      humidity: cur.main.humidity,
      description: cur.weather[0]?.description,
      icon: cur.weather[0]?.icon,
      wind_mph: Math.round(cur.wind?.speed ?? 0),
    },
    forecast: summarizeDailyForecast(fc.list),
  };
}

// The 5-day/3-hour endpoint returns 40 entries of 3-hour slots.
// Roll them up into 5 daily summaries (min/max temp + midday icon).
function summarizeDailyForecast(list) {
  const byDay = new Map();
  for (const slot of list) {
    const day = slot.dt_txt.slice(0, 10); // 'YYYY-MM-DD'
    if (!byDay.has(day)) {
      byDay.set(day, { day, min: Infinity, max: -Infinity, middaySlot: null });
    }
    const bucket = byDay.get(day);
    bucket.min = Math.min(bucket.min, slot.main.temp_min);
    bucket.max = Math.max(bucket.max, slot.main.temp_max);
    // Pick the 12:00 slot as representative if we see it, else fall back to first.
    if (slot.dt_txt.endsWith('12:00:00') || !bucket.middaySlot) {
      bucket.middaySlot = slot;
    }
  }
  return [...byDay.values()].slice(0, 5).map((b) => ({
    date: b.day,
    temp_min_f: Math.round(b.min),
    temp_max_f: Math.round(b.max),
    description: b.middaySlot.weather[0]?.description,
    icon: b.middaySlot.weather[0]?.icon,
  }));
}

// Geocoding: city name -> lat/lon. Handy for the search bar.
export async function geocodeCity(city) {
  const key = getKey();
  const res = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${key}`,
  );
  if (!res.ok) {
    const err = new Error('Geocoding failed');
    err.status = 502;
    throw err;
  }
  const results = await res.json();
  if (!results.length) return null;
  const r = results[0];
  return { name: r.name, lat: r.lat, lon: r.lon, country: r.country, state: r.state };
}