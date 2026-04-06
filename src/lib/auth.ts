import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Role } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyTelegramAuth } from "@/lib/telegram";
import { ensureUserSquad } from "@/lib/squads";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required.");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user?.passwordHash) {
          throw new Error("Account not found.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid password.");
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          balanceKopeks: user.balanceKopeks,
          telegramId: user.telegramId,
          subscriptionUrl: user.subscriptionUrl,
        };
      },
    }),
    CredentialsProvider({
      id: "telegram",
      name: "Telegram",
      credentials: {
        id: { label: "Telegram ID", type: "text" },
        first_name: { label: "First name", type: "text" },
        username: { label: "Username", type: "text" },
        photo_url: { label: "Photo URL", type: "text" },
        auth_date: { label: "Auth date", type: "text" },
        hash: { label: "Hash", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Telegram payload is missing.");
        }

        const verification = await verifyTelegramAuth({
          id: credentials.id,
          first_name: credentials.first_name,
          username: credentials.username,
          photo_url: credentials.photo_url,
          auth_date: credentials.auth_date,
          hash: credentials.hash,
        });

        if (!verification.ok) {
          throw new Error(verification.error);
        }

        const email = `telegram-${verification.data.id}@1vpn.local`;
        const user = await db.$transaction(async (tx) => {
          const existing = await tx.user.findFirst({
            where: {
              OR: [{ telegramId: verification.data.id }, { email }],
            },
          });

          const persisted = existing
            ? await tx.user.update({
                where: { id: existing.id },
                data: {
                  telegramId: verification.data.id,
                  telegramFirstName: verification.data.firstName,
                  telegramUsername: verification.data.username,
                  telegramPhotoUrl: verification.data.photoUrl,
                  email,
                },
              })
            : await tx.user.create({
                data: {
                  email,
                  role: Role.USER,
                  telegramId: verification.data.id,
                  telegramFirstName: verification.data.firstName,
                  telegramUsername: verification.data.username,
                  telegramPhotoUrl: verification.data.photoUrl,
                },
              });

          await ensureUserSquad(persisted.id, tx);

          return tx.user.findUniqueOrThrow({
            where: { id: persisted.id },
            include: { squad: true },
          });
        }, { timeout: 15_000, maxWait: 10_000 });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          balanceKopeks: user.balanceKopeks,
          telegramId: user.telegramId,
          subscriptionUrl: user.subscriptionUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      const userId = token.id ?? token.sub;
      if (!userId) {
        return token;
      }

      const freshUser = await db.user.findUnique({
        where: { id: userId },
      });

      if (!freshUser) {
        return token;
      }

      token.role = freshUser.role;
      token.balanceKopeks = freshUser.balanceKopeks;
      token.telegramId = freshUser.telegramId;
      token.subscriptionUrl = freshUser.subscriptionUrl;

      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        return session;
      }

      session.user.id = String(token.id ?? token.sub ?? "");
      session.user.role = token.role ?? Role.USER;
      session.user.balanceKopeks = token.balanceKopeks ?? 0;
      session.user.telegramId = token.telegramId;
      session.user.subscriptionUrl = token.subscriptionUrl;

      return session;
    },
  },
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.user.role !== Role.ADMIN) {
    redirect("/dashboard");
  }
  return session;
}
