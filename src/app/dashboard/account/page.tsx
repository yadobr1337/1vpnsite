import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PendingButton } from "@/components/ui/pending-button";
import { LogoutButton } from "@/components/logout-button";
import { TelegramLogin } from "@/components/auth/telegram-login";
import {
  resendOwnEmailVerificationAction,
  togglePasswordlessAction,
  updateOwnEmailAction,
  updateOwnPasswordAction,
  verifyOwnEmailAction,
} from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { ensureUserPublicId } from "@/lib/user-identity";

export default async function DashboardAccountPage() {
  const session = await requireUser();
  const [user, publicId] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        pendingEmail: true,
        emailVerified: true,
        passwordHash: true,
        telegramId: true,
        telegramUsername: true,
        isEmailPlaceholder: true,
        passwordlessEnabled: true,
      },
    }),
    ensureUserPublicId(session.user.id),
  ]);

  if (!user) {
    return null;
  }

  const hasRealEmail = !user.isEmailPlaceholder;
  const emailLabel = hasRealEmail ? user.email : "Email не привязан";

  return (
    <main className="dashboard-shell min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge>Account settings</Badge>
            <h1 className="mt-4 text-3xl font-bold uppercase tracking-[0.08em] text-white">
              {publicId}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">{emailLabel}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/">
              <Button variant="ghost">Главная</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost">Назад</Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-5">
            <Badge>Email</Badge>
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-[0.08em] text-white">
                Почта и подтверждение
              </h2>
              <p className="mt-2 text-sm leading-7 text-zinc-400">
                После привязки и подтверждения email можно включить вход по коду без пароля.
              </p>
            </div>

            <form action={updateOwnEmailAction} className="space-y-4">
              <label className="grid gap-2 text-sm text-zinc-300">
                {hasRealEmail ? "Изменить email" : "Добавить email"}
                <input
                  className="h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                  defaultValue={user.pendingEmail ?? (hasRealEmail ? user.email : "")}
                  name="email"
                  placeholder="you@domain.com"
                  type="email"
                />
              </label>
              <PendingButton>{hasRealEmail ? "Отправить код на новый email" : "Отправить код"}</PendingButton>
            </form>

            {user.pendingEmail || (hasRealEmail && !user.emailVerified) ? (
              <div className="space-y-4 rounded-3xl border border-cyan-300/15 bg-cyan-400/8 p-4">
                <p className="text-sm text-zinc-200">
                  {user.pendingEmail
                    ? `Ожидает подтверждения: ${user.pendingEmail}`
                    : "Текущий email еще не подтвержден."}
                </p>
                <form action={verifyOwnEmailAction} className="flex flex-col gap-3 sm:flex-row">
                  <input
                    className="h-12 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                    name="code"
                    placeholder="Код из письма"
                    type="text"
                  />
                  <PendingButton>Подтвердить</PendingButton>
                </form>
                <form action={resendOwnEmailVerificationAction}>
                  <PendingButton variant="ghost">Отправить код повторно</PendingButton>
                </form>
              </div>
            ) : (
              <p className="text-sm text-emerald-300">Email подтвержден.</p>
            )}
          </Card>

          <Card className="space-y-5">
            <Badge>Login</Badge>
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-[0.08em] text-white">
                Вход по коду
              </h2>
              <p className="mt-2 text-sm leading-7 text-zinc-400">
                Если включено, вход выполняется по email и одноразовому коду вместо пароля.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-zinc-300">
                Текущий режим:{" "}
                <span className="font-semibold text-white">
                  {user.passwordlessEnabled ? "вход по коду" : "стандартный пароль"}
                </span>
              </p>
            </div>

            <form action={togglePasswordlessAction}>
              <input type="hidden" name="enabled" value={String(!user.passwordlessEnabled)} />
              <PendingButton
                disabled={!hasRealEmail || !user.emailVerified}
                variant={user.passwordlessEnabled ? "ghost" : "primary"}
              >
                {user.passwordlessEnabled ? "Вернуть вход по паролю" : "Включить вход по коду"}
              </PendingButton>
            </form>

            {!hasRealEmail || !user.emailVerified ? (
              <p className="text-sm text-zinc-400">
                Сначала добавьте и подтвердите реальный email.
              </p>
            ) : null}
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-5">
            <Badge>Password</Badge>
            <h2 className="text-2xl font-bold uppercase tracking-[0.08em] text-white">
              Пароль
            </h2>
            <form action={updateOwnPasswordAction} className="space-y-4">
              {user.passwordHash ? (
                <label className="grid gap-2 text-sm text-zinc-300">
                  Текущий пароль
                  <input
                    className="h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                    name="currentPassword"
                    type="password"
                  />
                </label>
              ) : null}
              <label className="grid gap-2 text-sm text-zinc-300">
                Новый пароль
                <input
                  className="h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                  name="newPassword"
                  type="password"
                />
              </label>
              <PendingButton>Сохранить пароль</PendingButton>
            </form>
          </Card>

          <Card className="space-y-5">
            <Badge>Telegram</Badge>
            <h2 className="text-2xl font-bold uppercase tracking-[0.08em] text-white">
              Привязка Telegram
            </h2>
            <p className="text-sm leading-7 text-zinc-400">
              Используйте Telegram Login Widget, чтобы привязать бот к текущему аккаунту.
            </p>
            <p className="text-sm text-zinc-300">
              Текущее состояние:{" "}
              <span className="font-semibold text-white">
                {user.telegramId
                  ? `@${user.telegramUsername ?? user.telegramId}`
                  : "Telegram не привязан"}
              </span>
            </p>
            <TelegramLogin mode="link" />
          </Card>
        </section>

        <Card>
          <Badge>Support</Badge>
          <div className="mt-4 flex flex-wrap gap-3">
            {env.NEXT_PUBLIC_SUPPORT_TELEGRAM_URL ? (
              <Link href={env.NEXT_PUBLIC_SUPPORT_TELEGRAM_URL} target="_blank" rel="noreferrer">
                <Button>Поддержка в Telegram</Button>
              </Link>
            ) : null}
            {env.SUPPORT_EMAIL ? (
              <Link href={`mailto:${env.SUPPORT_EMAIL}`}>
                <Button variant="ghost">{env.SUPPORT_EMAIL}</Button>
              </Link>
            ) : null}
          </div>
        </Card>

        <div className="flex justify-end">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
