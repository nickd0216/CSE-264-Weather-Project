import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Make sure this spelling exactly matches your file name (NavBar vs Navbar)
import NavBar from "@/components/NavBar"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        
        {/* --- THIS IS WHERE YOUR REAL NAVBAR GOES --- */}
        <NavBar />

        {/* --- PAGE CONTENT Renders Here --- */}
        <main className="flex-1">
          {children}
        </main>

      </body>
    </html>
  );
}