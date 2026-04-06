import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: z.string().optional(),
  TURNSTILE_SITE_KEY: z.string().optional(),
});

export const publicEnv = clientSchema.parse({
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
  TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY,
});
