"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { publicEnv } from "@/lib/env";

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, string>) => void;
  }
}

export function TelegramLogin() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const botUsername = publicEnv.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    if (!botUsername || !containerRef.current) {
      return;
    }

    window.onTelegramAuth = async (user) => {
      const result = await signIn("telegram", {
        ...user,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      window.location.href = "/dashboard";
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "999");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
    };
  }, []);

  if (!publicEnv.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME) {
    return (
      <p className="text-sm text-zinc-400">
        Telegram login появится после заполнения `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div ref={containerRef} className="min-h-12" />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
