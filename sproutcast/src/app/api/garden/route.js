// src/app/api/garden/route.js
// Example of a protected CRUD route. Pattern to copy for /plants, /users/me, etc.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { requireUser } from '@/lib/session';

// ---------- GET /api/garden ----------
// Return the current user's garden (joined with plant info).
export async function GET() {
  try {
    const { userId } = await requireUser();
    const rows = await query(
      `SELECT g.id, g.notes, g.position, g.added_at,
              p.id AS plant_id, p.common_name, p.scientific_name,
              p.image_url, p.min_temp_f, p.max_temp_f,
              p.watering, p.sunlight, p.seasons
       FROM garden_entries g
       JOIN plants p ON p.id = g.plant_id
       WHERE g.user_id = $1
       ORDER BY g.position NULLS LAST, g.added_at DESC`,
      [userId],
    );
    return NextResponse.json({ entries: rows });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}

// ---------- POST /api/garden ----------
// Add a plant to the current user's garden.
const AddSchema = z.object({
  plant_id: z.number().int().positive(),
  notes: z.string().max(1000).optional(),
});

export async function POST(req) {
  try {
    const { userId } = await requireUser();
    const body = AddSchema.parse(await req.json());

    const rows = await query(
      `INSERT INTO garden_entries (user_id, plant_id, notes)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, plant_id) DO NOTHING
       RETURNING id, plant_id, notes, added_at`,
      [userId, body.plant_id, body.notes ?? null],
    );

    if (!rows.length) {
      return NextResponse.json(
        { error: 'Plant already in garden' },
        { status: 409 },
      );
    }
    return NextResponse.json({ entry: rows[0] }, { status: 201 });
  } catch (err) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}

// ---------- DELETE /api/garden?id=123 ----------
// Remove one of the current user's entries. Row-level scoping prevents
// a logged-in user from deleting someone else's entry.
export async function DELETE(req) {
  try {
    const { userId } = await requireUser();
    const id = Number(new URL(req.url).searchParams.get('id'));
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    const rows = await query(
      'DELETE FROM garden_entries WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId],
    );
    if (!rows.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}