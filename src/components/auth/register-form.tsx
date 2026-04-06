"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { publicEnv } from "@/lib/public-env";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
        },
      ) => void;
    };
  }
}

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<HTMLDivElement>(null);
  const shouldRenderCaptcha = useMemo(() => Boolean(publicEnv.TURNSTILE_SITE_KEY), []);

  useEffect(() => {
    if (!shouldRenderCaptcha || !captchaRef.current || !publicEnv.TURNSTILE_SITE_KEY) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      window.turnstile?.render(captchaRef.current as HTMLElement, {
        sitekey: publicEnv.TURNSTILE_SITE_KEY!,
        callback: setCaptchaToken,
      });
    };
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [shouldRenderCaptcha]);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "");
        const password = String(formData.get("password") ?? "");

        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            captchaToken,
          }),
        });

        const payload = (await response.json()) as { error?: string };
        if (!response.ok) {
          setError(payload.error ?? "Registration failed.");
          setPending(false);
          return;
        }

        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl: "/dashboard",
        });

        setPending(false);
        if (result?.error) {
          setError(result.error);
          return;
        }

        window.location.href = "/dashboard";
      }}
    >
      <div className="space-y-2">
        <label className="text-sm text-zinc-300">Email</label>
        <Input name="email" type="email" placeholder="you@domain.com" required />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-zinc-300">Пароль</label>
        <Input name="password" type="password" placeholder="Минимум 8 символов" minLength={8} required />
      </div>

      {shouldRenderCaptcha ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div ref={captchaRef} />
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
          CAPTCHA отключена, пока не заполнен `TURNSTILE_SITE_KEY`.
        </p>
      )}

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <Button className="w-full" disabled={pending}>
        {pending ? "Создание..." : "Создать аккаунт"}
      </Button>

      <p className="text-sm text-zinc-400">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-cyan-300 transition hover:text-cyan-200">
          Войти
        </Link>
      </p>
    </form>
  );
}
