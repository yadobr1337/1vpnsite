import "server-only";
import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(16),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  REMNAWAVE_BASE_URL: z.string().url().optional(),
  REMNAWAVE_API_TOKEN: z.string().optional(),
  REMNAWAVE_DEFAULT_INBOUND_UUIDS: z.string().optional(),
  CRON_SECRET: z.string().min(16).optional(),
  PAYMENTS_AUTO_APPROVE: z.enum(["true", "false"]).optional(),
});

export const env = serverSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  REMNAWAVE_BASE_URL: process.env.REMNAWAVE_BASE_URL,
  REMNAWAVE_API_TOKEN: process.env.REMNAWAVE_API_TOKEN,
  REMNAWAVE_DEFAULT_INBOUND_UUIDS: process.env.REMNAWAVE_DEFAULT_INBOUND_UUIDS,
  CRON_SECRET: process.env.CRON_SECRET,
  PAYMENTS_AUTO_APPROVE: process.env.PAYMENTS_AUTO_APPROVE,
});
