// src/lib/db.js
// Singleton pg Pool. Next.js dev mode reloads modules on every request,
// which would leak connections without this globalThis trick.

import { Pool } from 'pg';

const globalForPg = globalThis;

export const db =
  globalForPg._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Neon requires SSL. If you swap to the shared CSE264 RDS, keep this on.
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPg._pgPool = db;
}

// Small helper so route handlers don't have to write db.query every time.
export async function query(text, params) {
  const res = await db.query(text, params);
  return res.rows;
}