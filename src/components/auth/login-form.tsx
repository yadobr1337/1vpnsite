"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TelegramLogin } from "@/components/auth/telegram-login";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="space-y-6">
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setError(null);

          const formData = new FormData(event.currentTarget);
          const result = await signIn("credentials", {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
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
          <Input name="password" type="password" placeholder="••••••••" required />
        </div>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <Button className="w-full" disabled={pending}>
          {pending ? "Вход..." : "Войти"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-zinc-500">
        <span className="h-px flex-1 bg-white/10" />
        Telegram
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <TelegramLogin />

      <p className="text-sm text-zinc-400">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-cyan-300 transition hover:text-cyan-200">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
