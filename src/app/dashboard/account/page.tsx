import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PendingButton } from "@/components/ui/pending-button";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateOwnEmailAction, updateOwnPasswordAction } from "@/app/actions";

export default async function DashboardAccountPage() {
  const session = await requireUser();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      telegramId: true,
    },
  });

  if (!user) {
    return null;
  }

  return (
    <main className="dashboard-shell min-h-screen px-6 py-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge>Account settings</Badge>
            <h1 className="mt-4 text-3xl font-bold uppercase tracking-[0.08em] text-white">
              {user.id}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">{user.email}</p>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost">Вернуться в кабинет</Button>
          </Link>
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <Badge>Email</Badge>
            <h2 className="mt-4 text-2xl font-bold uppercase tracking-[0.08em] text-white">
              Изменить почту
            </h2>
            <form action={updateOwnEmailAction} className="mt-6 space-y-4">
              <label className="grid gap-2 text-sm text-zinc-300">
                Новый email
                <input
                  className="h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                  defaultValue={user.email}
                  name="email"
                  type="email"
                />
              </label>
              <PendingButton>Сохранить email</PendingButton>
            </form>
          </Card>

          <Card>
            <Badge>Password</Badge>
            <h2 className="mt-4 text-2xl font-bold uppercase tracking-[0.08em] text-white">
              Изменить пароль
            </h2>
            <form action={updateOwnPasswordAction} className="mt-6 space-y-4">
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
        </section>

        <Card>
          <Badge>Info</Badge>
          <div className="mt-4 space-y-2 text-sm text-zinc-300">
            <p>ID пользователя: {user.id}</p>
            <p>Telegram ID: {user.telegramId ?? "не привязан"}</p>
          </div>
        </Card>
      </div>
    </main>
  );
}
