
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
  // Updated password validation to match frontend rules
  password: z.string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain at least one capital letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol"),
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
    return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
  }

  const hash = await hashPassword(body.password);
  const rows = await query(
    `INSERT INTO users (email, password_hash, name, role)
   VALUES ($1, $2, $3, $4)
   RETURNING id, email, name, role, created_at`,
    [body.email, hash, body.name ?? null, 'user'],
  );
  const user = rows[0];

  const token = await signSessionToken({
    userId: user.id,
    role: user.role,
    name: user.name
  })

  const res = NextResponse.json({ user }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}