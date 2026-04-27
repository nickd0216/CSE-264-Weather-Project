import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Updated metadata for your specific project!
export const metadata = {
  title: "SproutCast",
  description: "Weather-based plant recommendations for your virtual garden",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        
        {/* --- GLOBAL TAB NAVIGATION --- */}
        <header className="bg-white border-b border-green-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
            <div className="font-extrabold text-2xl text-green-700 tracking-tight">
              🌱 SproutCast
            </div>
            
            <nav className="flex space-x-1">
              <Link href="/">
                <button className="px-4 py-2 rounded-md font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition">
                  Thriving Now
                </button>
              </Link>
              <Link href="/library">
                <button className="px-4 py-2 rounded-md font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition">
                  Plant Library
                </button>
              </Link>
              <Link href="/garden">
                <button className="px-4 py-2 rounded-md font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition">
                  Virtual Garden
                </button>
              </Link>
            </nav>
            
            {/* Placeholder for Chris's Login/Logout button */}
            <div className="w-20"></div> 
          </div>
        </header>

        {/* --- PAGE CONTENT Renders Here --- */}
        <main className="flex-1">
          {children}
        </main>

      </body>
    </html>
  );
}