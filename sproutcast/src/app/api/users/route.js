// src/app/api/users/route.js
// Admin-only: list all users for the admin dashboard.
// Regular users hit /api/users/me instead — this endpoint is only for admins.

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/session';

// ---------- GET /api/users ----------
export async function GET() {
  try {
    await requireAdmin();
    const rows = await query(
      `SELECT id, email, name, role, saved_city, created_at
       FROM users ORDER BY created_at DESC`,
    );
    return NextResponse.json({ users: rows });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}