import Link from "next/link";
import { getCurrentUser } from "@/lib/session"; // Grabbing the NextAuth session

export default async function Navbar() {
    // Check if the user is currently logged in
    const session = await getCurrentUser();

    return (
        <nav className="bg-green-700 text-white p-4 shadow-md">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                {/* Logo / Brand */}
                <Link href="/" className="text-2xl font-bold tracking-wider">
                    Sproutcast
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center space-x-6 font-semibold">
                    <Link href="/" className="hover:text-green-200 transition">
                        Home
                    </Link>

                    {/* Conditional Rendering based on Authentication */}
                    {session?.user ? (
                        <>
                            <Link href="/garden" className="hover:text-green-200 transition">
                                My Garden
                            </Link>
                            {/* For now, linking to the logout API your team built */}
                            <Link
                                href="/api/auth/logout"
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                            >
                                Logout
                            </Link>
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