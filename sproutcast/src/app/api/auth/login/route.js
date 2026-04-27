// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { 
  verifyPassword, 
  signSessionToken, 
  SESSION_COOKIE, 
  sessionCookieOptions 
} from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Fetch the user - MAKE SURE 'name' IS IN THE SELECT
    const rows = await query(
      'SELECT id, email, password_hash, name, role FROM users WHERE email = $1', 
      [email]
    );
    const user = rows[0];

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isCorrect = await verifyPassword(password, user.password_hash);
    if (!isCorrect) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // SIGN THE TOKEN - THIS IS WHERE THE NAME IS ADDED
    const token = await signSessionToken({ 
      userId: user.id, 
      role: user.role, 
      name: user.name 
    });

    const res = NextResponse.json({ 
      user: { id: user.id, email: user.email, name: user.name, role: user.role } 
    });

    // Set the cookie
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}