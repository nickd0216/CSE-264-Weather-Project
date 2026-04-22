// src/app/api/users/me/route.js
// The logged-in user's own profile. Self-serve read + limited update.
// Things a user CAN change here: name, saved_city, saved_lat, saved_lon.
// Things they CANNOT: email (needs verify flow), password (needs current-pw check),
// role (admin-only). Those would each get their own dedicated endpoint.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { requireUser } from '@/lib/session';

// ---------- GET /api/users/me ----------
export async function GET() {
  try {
    const { userId } = await requireUser();
    const rows = await query(
      `SELECT id, email, name, role, saved_city, saved_lat, saved_lon, created_at
       FROM users WHERE id = $1`,
      [userId],
    );
    if (!rows.length) {
      // User id in valid JWT but no row? Token is stale (account deleted).
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ user: rows[0] });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}

// ---------- PATCH /api/users/me ----------
const UpdateSchema = z.object({
  name: z.string().max(100).optional(),
  saved_city: z.string().max(100).nullable().optional(),
  saved_lat: z.number().min(-90).max(90).nullable().optional(),
  saved_lon: z.number().min(-180).max(180).nullable().optional(),
});

export async function PATCH(req) {
  try {
    const { userId } = await requireUser();
    const body = UpdateSchema.parse(await req.json());

    // Only update fields the client actually sent. Build the SET clause dynamically.
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
    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const rows = await query(
      `UPDATE users SET ${fields.join(', ')}
       WHERE id = $${i}
       RETURNING id, email, name, role, saved_city, saved_lat, saved_lon`,
      values,
    );
    return NextResponse.json({ user: rows[0] });
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