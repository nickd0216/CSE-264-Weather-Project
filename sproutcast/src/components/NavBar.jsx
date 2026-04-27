import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

// Forces Next.js to check the cookie on every single request 
// rather than serving a cached (logged-out) version of the bar.
export const dynamic = 'force-dynamic';

export default async function Navbar() {
    const user = await getCurrentUser();

    return (
        <nav className="bg-green-700 text-white p-4 shadow-md">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold tracking-wider">
                    🌱 Sproutcast
                </Link>

                <div className="flex items-center space-x-6 font-semibold">
                    {user ? (
                        <>
                            {/* Displaying the user's name from the JWT payload */}
                            <span className="text-green-100 font-normal">
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