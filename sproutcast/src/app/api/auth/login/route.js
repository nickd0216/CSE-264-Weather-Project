// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import {
  verifyPassword,
  signSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '@/lib/auth';

const LoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200),
});

export async function POST(req) {
  let body;
  try {
    body = LoginSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid input', details: err.errors },
      { status: 400 },
    );
  }

  const rows = await query(
    'SELECT id, email, name, role, password_hash FROM users WHERE email = $1',
    [body.email],
  );
  const user = rows[0];

  // Same error either way so attackers can't enumerate valid emails.
  if (!user || !(await verifyPassword(body.password, user.password_hash))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = await signSessionToken({ userId: user.id, role: user.role });

  const res = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}