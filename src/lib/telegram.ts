import { env } from "@/lib/env";

type TelegramAuthPayload = {
  id: string;
  first_name: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
};

function buildDataCheckString(payload: Record<string, string | undefined>) {
  return Object.entries(payload)
    .filter(([key, value]) => key !== "hash" && value)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

export async function verifyTelegramAuth(payload: TelegramAuthPayload) {
  if (!env.TELEGRAM_BOT_TOKEN) {
    return { ok: false, error: "Telegram bot token is not configured." } as const;
  }

  const authAgeSeconds = Math.abs(Date.now() / 1000 - Number(payload.auth_date));
  if (!Number.isFinite(authAgeSeconds) || authAgeSeconds > 86_400) {
    return { ok: false, error: "Telegram auth payload is expired." } as const;
  }

  const encoder = new TextEncoder();
  const compute = async () => {
    const secretHash = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(env.TELEGRAM_BOT_TOKEN),
    );
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      secretHash,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      encoder.encode(buildDataCheckString(payload)),
    );
    return Array.from(new Uint8Array(signature))
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
  };

  const computedHash = await compute();
  if (computedHash !== payload.hash) {
    return { ok: false, error: "Telegram auth hash is invalid." } as const;
  }

  return {
    ok: true,
    data: {
      id: payload.id,
      firstName: payload.first_name,
      username: payload.username ?? null,
      photoUrl: payload.photo_url ?? null,
    },
  } as const;
}

export async function sendTelegramMessage(chatId: string, text: string) {
  if (!env.TELEGRAM_BOT_TOKEN) {
    return { ok: false, error: "Telegram bot token is not configured." } as const;
  }

  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    return { ok: false, error: errorText } as const;
  }

  return { ok: true } as const;
}
