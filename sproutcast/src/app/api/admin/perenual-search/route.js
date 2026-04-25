// src/app/api/admin/perenual-search/route.js
// Admin-only: search Perenual for plants to import into our db.
// Workflow:
//   1. Admin searches Perenual via this endpoint -> sees candidate plants
//   2. Admin fills in hardiness/seasons/description (Perenual free tier omits these)
//   3. Admin POSTs to /api/plants with the completed data; external_id dedupes

import { NextResponse } from 'next/server';
import { searchPerenual } from '@/lib/api/perenual';
import { requireAdmin } from '@/lib/session';

export async function GET(req) {
  try {
    await requireAdmin();
    const q = new URL(req.url).searchParams.get('q');
    if (!q) return NextResponse.json({ error: 'Missing q' }, { status: 400 });

    const results = await searchPerenual(q);
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}