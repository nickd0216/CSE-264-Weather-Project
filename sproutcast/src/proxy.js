// src/middleware.js
// Runs on the Edge before every matching request.
// Redirects unauthenticated users away from /dashboard and /admin.

import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './lib/auth.js';

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;

  // Not logged in? Bounce to login.
  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Non-admin trying to hit /admin? Send to their dashboard.
  if (pathname.startsWith('/admin') && payload.role !== 'admin') {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};