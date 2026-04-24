import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// We will set up auth last

// import { PrismaAdapter } from "@auth/prisma-adapter"
// import { PrismaClient } from "@prisma/client"

// const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
    // adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // TODO Replace this with actual password hashing/checking logic later
                if (credentials?.email === "admin@sproutcast.com") {
                    return { id: "1", name: "Admin", email: "admin@sproutcast.com", role: "ADMIN" }
                } else if (credentials?.email === "user@sproutcast.com") {
                    return { id: "2", name: "Plant Fan", email: "user@sproutcast.com", role: "USER" }
                }
                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role;
            }
            return session;
        }
    }
})