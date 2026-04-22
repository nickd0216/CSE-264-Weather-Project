// src/lib/session.js
// Call getCurrentUser() inside any API route that needs the logged-in user.

import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from './auth.js';

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  return { userId: payload.userId, role: payload.role };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin') {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  return user;
}