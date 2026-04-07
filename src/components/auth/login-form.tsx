"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TelegramLogin } from "@/components/auth/telegram-login";

type AuthMode = "password" | "code";

export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("password");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 rounded-full border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("password");
            setError(null);
            setMessage(null);
          }}
          className={`h-11 rounded-full text-sm font-medium transition ${
            mode === "password" ? "bg-cyan-400/15 text-white" : "text-zinc-400 hover:text-white"
          }`}
        >
          Пароль
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("code");
            setError(null);
            setMessage(null);
          }}
          className={`h-11 rounded-full text-sm font-medium transition ${
            mode === "code" ? "bg-cyan-400/15 text-white" : "text-zinc-400 hover:text-white"
          }`}
        >
          Код из email
        </button>
      </div>

      {mode === "password" ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            setMessage(null);
            const form = event.currentTarget;

            startTransition(async () => {
              const formData = new FormData(form);
              const result = await signIn("credentials", {
                email: String(formData.get("email") ?? ""),
                password: String(formData.get("password") ?? ""),
                redirect: false,
                callbackUrl: "/dashboard",
              });

              if (result?.error) {
                setError(result.error);
                return;
              }

              window.location.href = "/dashboard";
            });
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
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            setMessage(null);
            const form = event.currentTarget;

            startTransition(async () => {
              const formData = new FormData(form);
              const email = String(formData.get("email") ?? "");
              const code = String(formData.get("code") ?? "");

              const result = await signIn("email-code", {
                email,
                code,
                redirect: false,
                callbackUrl: "/dashboard",
              });

              if (result?.error) {
                setError(result.error);
                return;
              }

              window.location.href = "/dashboard";
            });
          }}
        >
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Email</label>
            <Input name="email" type="email" placeholder="you@domain.com" required />
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Код</label>
              <Input name="code" inputMode="numeric" placeholder="123456" required />
            </div>
            <button
              type="button"
              onClick={(event) => {
                const form = event.currentTarget.form;
                if (!form) {
                  return;
                }

                const formData = new FormData(form);
                const email = String(formData.get("email") ?? "").trim();
                if (!email) {
                  setError("Введите email, чтобы получить код.");
                  return;
                }

                setError(null);
                setMessage(null);
                startTransition(async () => {
                  const response = await fetch("/api/auth/email-code/request", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                  });

                  const payload = (await response.json()) as { error?: string };
                  if (!response.ok) {
                    setError(payload.error ?? "Не удалось отправить код.");
                    return;
                  }

                  setMessage("Код отправлен на email.");
                });
              }}
              className="mt-7 inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Получить код
            </button>
          </div>
          {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <Button className="w-full" disabled={pending}>
            {pending ? "Проверка..." : "Войти по коду"}
          </Button>
        </form>
      )}

      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-zinc-500">
        <span className="h-px flex-1 bg-white/10" />
        Telegram
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <TelegramLogin mode="login" />

      <p className="text-sm text-zinc-400">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-cyan-300 transition hover:text-cyan-200">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
