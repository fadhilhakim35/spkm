import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null;
      role?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const admin = await prisma.adminUser.findUnique({
          where: { email },
        });

        if (!admin) {
          return null;
        }

        const isValidPassword = await compare(password, admin.passwordHash);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: admin.id,
          email: admin.email,
          name: admin.email,
          role: admin.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const jwtToken = token as typeof token & { role?: string };

      if (user) {
        jwtToken.role = (user as typeof user & { role?: string }).role ?? "admin";
      }

      return jwtToken;
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as typeof session.user & {
          id?: string | null;
          role?: string | null;
        };
        const jwtToken = token as typeof token & { role?: string };

        sessionUser.id = token.sub ?? "";
        sessionUser.role = typeof jwtToken.role === "string" ? jwtToken.role : "admin";
      }

      return session;
    },
  },
});
