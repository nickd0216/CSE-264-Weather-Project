// src/lib/auth.js
// JWT + bcrypt helpers. Uses `jose` (Web Crypto) so it works in both
// Node (API routes) and Edge (middleware) runtimes.

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const COOKIE_NAME = 'sc_session';
const JWT_ALG = 'HS256';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export async function signSessionToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: [JWT_ALG],
    });
    return payload; // { userId, role, iat, exp }
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = COOKIE_NAME;

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: MAX_AGE,
};