import { auth } from "./auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const role = req.auth?.user?.role;
    const { pathname } = req.nextUrl;

    // Protect Admin Dashboard
    if (pathname.startsWith('/admin')) {
        if (!isLoggedIn || role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', req.nextUrl));
        }
    }

    // Protect Virtual Garden
    if (pathname.startsWith('/garden')) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/login', req.nextUrl));
        }
    }

    return NextResponse.next();
})

export const config = {
    matcher: ["/admin/:path*", "/garden/:path*"]
}