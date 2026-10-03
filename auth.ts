import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import argon2 from "argon2";
import { prisma } from "@/lib/prisma";

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) throw new Error("AUTH_SECRET must be set in production.");
export const { handlers, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  callbacks: {
    jwt({ token, user }) { if (user?.id) { token.sub = user.id; token.role = user.role; } return token; },
    session({ session, token }) { session.user.id = token.sub ?? ""; session.user.role = token.role === "ADMIN" ? "ADMIN" : "CUSTOMER"; return session; }
  },
  providers: [Credentials({ credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } }, async authorize(credentials) {
    const email = typeof credentials.email === "string" ? credentials.email.trim().toLowerCase() : "";
    const password = typeof credentials.password === "string" ? credentials.password : "";
    if (!email || !password) return null;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await argon2.verify(user.passwordHash, password))) return null;
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  } })]
});
