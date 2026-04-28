// src/components/NavBar.jsx
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

export const dynamic = 'force-dynamic';

export default async function NavBar() {
    const user = await getCurrentUser();

    return (
        <nav className="bg-green-700 text-white p-4 shadow-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex justify-between items-center">

                <div className="flex items-center space-x-8">
                    <span className="text-2xl font-extrabold tracking-tight">
                        🌱 SproutCast
                    </span>

                    {/* Always visible public navigation */}
                    <div className="hidden sm:flex space-x-6 font-medium text-green-100">
                        <Link href="/" className="hover:text-white transition">
                            Thriving Now
                        </Link>
                        <Link href="/library" className="hover:text-white transition">
                            Plant Library
                        </Link>
                    </div>
                </div>

                {/* Auth & Private Links */}
                <div className="flex items-center space-x-6 font-semibold">
                    {user ? (
                        <>
                            {/* Logged In: Name, Garden, and Logout */}
                            <span className="text-green-100 font-normal hidden md:inline">
                                Welcome, <span className="font-bold text-white">{user.name || 'Gardener'}</span>
                            </span>

                            <Link href="/garden" className="hover:text-green-200 transition">
                                My Garden
                            </Link>

                            <a
                                href="/api/auth/logout"
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition shadow-sm text-sm"
                            >
                                Logout
                            </a>
                        </>
                    ) : (
                        <>
                            {/* Login and Sign Up */}
                            <Link href="/login" className="hover:text-green-200 transition">
                                Log In
                            </Link>
                            <Link
                                href="/register"
                                className="bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition shadow-sm"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}