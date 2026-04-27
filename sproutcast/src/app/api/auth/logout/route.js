import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
}