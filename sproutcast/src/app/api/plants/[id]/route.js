// src/app/api/plants/[id]/route.js
// Single plant by id.
// GET - public (anyone can view a plant detail page)
// PATCH/DELETE - admin only
//
// Note on Next.js 15+: the second arg's `params` is now a Promise you must await.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/session';

// ---------- GET /api/plants/:id ----------
export async function GET(_req, { params }) {
  const { id } = await params;
  const rows = await query('SELECT * FROM plants WHERE id = $1', [Number(id)]);
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ plant: rows[0] });
}

// ---------- PATCH /api/plants/:id ----------
const UpdateSchema = z.object({
  common_name: z.string().min(1).max(200).optional(),
  scientific_name: z.string().max(200).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  min_temp_f: z.number().int().nullable().optional(),
  max_temp_f: z.number().int().nullable().optional(),
  watering: z.enum(['frequent', 'average', 'minimum', 'none']).nullable().optional(),
  sunlight: z.string().max(100).nullable().optional(),
  image_url: z.string().url().max(2000).nullable().optional(),
  seasons: z.string().max(100).nullable().optional(),
});

export async function PATCH(req, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = UpdateSchema.parse(await req.json());

    const fields = [];
    const values = [];
    let i = 1;
    for (const [key, val] of Object.entries(body)) {
      fields.push(`${key} = $${i++}`);
      values.push(val);
    }
    if (!fields.length) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    fields.push('updated_at = NOW()');
    values.push(Number(id));

    const rows = await query(
      `UPDATE plants SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values,
    );
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ plant: rows[0] });
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

// ---------- DELETE /api/plants/:id ----------
export async function DELETE(_req, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const rows = await query('DELETE FROM plants WHERE id = $1 RETURNING id', [Number(id)]);
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}