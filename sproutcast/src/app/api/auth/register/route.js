
// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import {
  hashPassword,
  signSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '@/lib/auth';

const RegisterSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(200),
  name: z.string().max(100).optional(),
});

export async function POST(req) {
  let body;
  try {
    body = RegisterSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid input', details: err.errors },
      { status: 400 },
    );
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [body.email]);
  if (existing.length) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const hash = await hashPassword(body.password);
  const rows = await query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, role, created_at`,
    [body.email, hash, body.name ?? null],
  );
  const user = rows[0];

  const token = await signSessionToken({ userId: user.id, role: user.role });

  const res = NextResponse.json({ user }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}