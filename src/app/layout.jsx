import { Inter } from "next/font/google"
// import "./globals.css"
import Link from "next/link"
import { auth, signOut } from "../auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
    title: "SproutCast",
    description: "Weather forecasts and local plant recommendations.",
}

export default async function RootLayout({ children }) {
    const session = await auth();
    const role = session?.user?.role;

    return (
        <html lang="en">
            <body className={inter.className}>
                <nav className="flex justify-between p-4 bg-green-700 text-white">
                    <div className="flex gap-4">
                        <Link href="/" className="font-bold">SproutCast</Link>
                        {session && <Link href="/garden">My Garden</Link>}
                        {role === "ADMIN" && <Link href="/admin">Admin Panel</Link>}
                    </div>
                    <div>
                        {session ? (
                            <form action={async () => { "use server"; await signOut(); }}>
                                <button type="submit">Log Out</button>
                            </form>
                        ) : (
                            <Link href="/login">Log In</Link>
                        )}
                    </div>
                </nav>
                <main className="p-8">
                    {children}
                </main>
            </body>
        </html>
    );
}