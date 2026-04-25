// src/app/api/plants/route.js
// GET  - public plant list with optional filters (everyone, even logged-out)
// POST - create plant (admin only)

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/session';

// ---------- GET /api/plants ----------
// Optional query params:
//   ?q=tomato           - search common_name / scientific_name
//   ?season=spring      - CSV seasons field contains this token
//   ?temp=55            - only plants whose range covers this temp
//   ?limit=50           - defaults to 50, max 200
export async function GET(req) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q');
  const season = url.searchParams.get('season');
  const temp = url.searchParams.get('temp');
  const limit = Math.min(Number(url.searchParams.get('limit')) || 50, 200);

  const where = [];
  const params = [];
  let i = 1;

  if (q) {
    where.push(`(common_name ILIKE $${i} OR scientific_name ILIKE $${i})`);
    params.push(`%${q}%`);
    i++;
  }
  if (season) {
    // seasons is CSV, e.g. 'spring,summer' — match token with commas as delimiters
    where.push(`(',' || seasons || ',') ILIKE $${i}`);
    params.push(`%,${season},%`);
    i++;
  }
  if (temp && Number.isFinite(Number(temp))) {
    where.push(`min_temp_f <= $${i} AND max_temp_f >= $${i}`);
    params.push(Number(temp));
    i++;
  }

  const sql = `
    SELECT id, external_id, common_name, scientific_name, description,
           min_temp_f, max_temp_f, watering, sunlight, image_url, seasons
    FROM plants
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY common_name
    LIMIT $${i}
  `;
  params.push(limit);

  const rows = await query(sql, params);
  return NextResponse.json({ plants: rows });
}

// ---------- POST /api/plants ----------
const CreateSchema = z.object({
  common_name: z.string().min(1).max(200),
  scientific_name: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  min_temp_f: z.number().int().optional(),
  max_temp_f: z.number().int().optional(),
  watering: z.enum(['frequent', 'average', 'minimum', 'none']).optional(),
  sunlight: z.string().max(100).optional(),        // CSV
  image_url: z.string().url().max(2000).optional(),
  seasons: z.string().max(100).optional(),         // CSV
  external_id: z.number().int().optional(),        // from Perenual
});

export async function POST(req) {
  try {
    await requireAdmin();
    const body = CreateSchema.parse(await req.json());

    const rows = await query(
      `INSERT INTO plants
        (external_id, common_name, scientific_name, description,
         min_temp_f, max_temp_f, watering, sunlight, image_url, seasons)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (external_id) DO UPDATE SET
         common_name = EXCLUDED.common_name,
         scientific_name = EXCLUDED.scientific_name,
         description = EXCLUDED.description,
         min_temp_f = EXCLUDED.min_temp_f,
         max_temp_f = EXCLUDED.max_temp_f,
         watering = EXCLUDED.watering,
         sunlight = EXCLUDED.sunlight,
         image_url = EXCLUDED.image_url,
         seasons = EXCLUDED.seasons,
         updated_at = NOW()
       RETURNING *`,
      [
        body.external_id ?? null,
        body.common_name,
        body.scientific_name ?? null,
        body.description ?? null,
        body.min_temp_f ?? null,
        body.max_temp_f ?? null,
        body.watering ?? null,
        body.sunlight ?? null,
        body.image_url ?? null,
        body.seasons ?? null,
      ],
    );
    return NextResponse.json({ plant: rows[0] }, { status: 201 });
  } catch (err) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}