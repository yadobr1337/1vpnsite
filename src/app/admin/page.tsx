import { Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PendingButton } from "@/components/ui/pending-button";
import {
  adjustUserBalanceAction,
  createSquadAction,
  deleteSquadAction,
  runSyncNowAction,
  toggleBanAction,
  updateSettingsAction,
  updateUserHwidAction,
  updateSquadLimitAction,
} from "@/app/actions";
import { requireAdmin } from "@/lib/auth";
import { runLifecycleSweep } from "@/lib/billing";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatCurrency, formatDays } from "@/lib/utils";

export default async function AdminPage() {
  await requireAdmin();
  await runLifecycleSweep();

  const [settings, users, squads] = await Promise.all([
    getSettings(),
    db.user.findMany({
      include: {
        squad: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.squad.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const totalBalance = users.reduce((sum, user) => sum + user.balanceKopeks, 0);
  const activeUsers = users.filter((user) => user.role === Role.USER).length;

  return (
    <main className="dashboard-shell min-h-screen px-6 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge>Admin console</Badge>
            <h1 className="mt-4 text-3xl font-bold uppercase tracking-[0.08em] text-white">
              Управление 1VPN
            </h1>
          </div>
          <form action={runSyncNowAction}>
            <PendingButton>Запустить синхронизацию сейчас</PendingButton>
          </form>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Пользователи</p>
            <p className="mt-3 text-3xl font-bold text-white">{activeUsers}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Суммарный баланс</p>
            <p className="mt-3 text-3xl font-bold text-white">{formatCurrency(totalBalance)}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Цена за день</p>
            <p className="mt-3 text-3xl font-bold text-white">
              {formatCurrency(settings.pricePerDayKopeks)}
            </p>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <Badge>Настройки</Badge>
            <form action={updateSettingsAction} className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm text-zinc-300">
                Цена за 1 день, RUB
                <input
                  className="h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                  defaultValue={settings.pricePerDayKopeks / 100}
                  name="pricePerDay"
                  step="0.01"
                  type="number"
                />
              </label>
              <label className="grid gap-2 text-sm text-zinc-300">
                Дней в trial
                <input
                  className="h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                  defaultValue={settings.trialDays}
                  name="trialDays"
                  type="number"
                />
              </label>
              <label className="grid gap-2 text-sm text-zinc-300">
                Grace period, часы
                <input
                  className="h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                  defaultValue={settings.deletionGraceHours}
                  name="deletionGraceHours"
                  type="number"
                />
              </label>
              <label className="grid gap-2 text-sm text-zinc-300">
                HWID по умолчанию, устройств
                <input
                  className="h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                  defaultValue={settings.defaultHwidDeviceLimit}
                  name="defaultHwidDeviceLimit"
                  type="number"
                />
              </label>
              <label className="grid gap-2 text-sm text-zinc-300">
                Ссылка на поддержку Telegram
                <input
                  className="h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                  defaultValue={settings.supportTelegramUrl ?? ""}
                  name="supportTelegramUrl"
                  type="url"
                />
              </label>
              <label className="grid gap-2 text-sm text-zinc-300">
                Hero-анонс
                <input
                  className="h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                  defaultValue={settings.heroAnnouncement ?? ""}
                  name="heroAnnouncement"
                  type="text"
                />
              </label>
              <label className="flex items-center gap-3 text-sm text-zinc-300">
                <input name="captchaEnabled" type="checkbox" defaultChecked={settings.captchaEnabled} />
                Включить CAPTCHA
              </label>
              <PendingButton>Сохранить настройки</PendingButton>
            </form>
          </Card>

          <Card>
            <Badge>Сквады</Badge>
            <h2 className="mt-4 text-2xl font-bold uppercase tracking-[0.08em] text-white">
              Группы пользователей
            </h2>
            <form action={createSquadAction} className="mt-6 grid gap-4 md:grid-cols-[1fr_180px_auto]">
              <input
                className="h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                name="name"
                placeholder="Название сквада"
                required
              />
              <input
                className="h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                name="memberLimit"
                placeholder="Лимит"
                required
                type="number"
              />
              <PendingButton>Создать</PendingButton>
            </form>
            <div className="mt-6 space-y-3">
              {squads.map((squad) => (
                <div key={squad.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{squad.name}</p>
                      <p className="text-sm text-zinc-400">
                        {squad._count.users}/{squad.memberLimit} пользователей
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <form action={updateSquadLimitAction} className="flex items-center gap-3">
                        <input type="hidden" name="squadId" value={squad.id} />
                        <input
                          className="h-11 w-28 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                          name="memberLimit"
                          type="number"
                          defaultValue={squad.memberLimit}
                        />
                        <label className="flex items-center gap-2 text-sm text-zinc-300">
                          <input defaultChecked={squad.isActive} name="isActive" type="checkbox" />
                          active
                        </label>
                        <PendingButton variant="ghost">Обновить</PendingButton>
                      </form>
                      <form action={deleteSquadAction}>
                        <input type="hidden" name="squadId" value={squad.id} />
                        <PendingButton variant="danger">Удалить</PendingButton>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="space-y-3">
            <Badge>Пользователи</Badge>
            <h2 className="text-2xl font-bold uppercase tracking-[0.08em] text-white">
              Баланс, дни, ссылка, бан и ручные начисления
            </h2>
          </div>

          <div className="grid gap-4">
            {users.map((user) => {
              const remainingDays =
                settings.pricePerDayKopeks > 0
                  ? user.balanceKopeks /
                    (settings.pricePerDayKopeks *
                      Math.max(1, user.hwidDeviceLimit ?? settings.defaultHwidDeviceLimit))
                  : 0;

              return (
                <Card key={user.id} className="space-y-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-white">{user.email}</p>
                      <p className="text-sm text-zinc-400">
                        {user.role} • Сквад: {user.squad?.name ?? "нет"} • {user.vpnProvisionState}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {user.subscriptionUrl ? user.subscriptionUrl : "Ссылка еще не сгенерирована"}
                      </p>
                    </div>
                    <div className="grid gap-2 text-right text-sm text-zinc-300">
                      <p>Баланс: {formatCurrency(user.balanceKopeks)}</p>
                      <p>Дней: {formatDays(remainingDays)}</p>
                      <p>HWID: {user.hwidDeviceLimit ?? settings.defaultHwidDeviceLimit}</p>
                      <p>{user.isBanned ? "Бан активен" : "Аккаунт активен"}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 xl:grid-cols-[auto_1fr]">
                    <form action={toggleBanAction} className="flex items-center gap-3">
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="ban" value={String(!user.isBanned)} />
                      <PendingButton variant={user.isBanned ? "ghost" : "danger"}>
                        {user.isBanned ? "Разбанить" : "Забанить"}
                      </PendingButton>
                    </form>

                    <form action={adjustUserBalanceAction} className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
                      <input type="hidden" name="userId" value={user.id} />
                      <input
                        className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                        defaultValue="100"
                        name="amount"
                        step="0.01"
                        type="number"
                      />
                      <input
                        className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                        defaultValue="Admin balance adjustment"
                        name="description"
                        type="text"
                      />
                      <PendingButton variant="ghost">Изменить баланс</PendingButton>
                    </form>
                  </div>

                  <form action={updateUserHwidAction} className="grid gap-3 md:grid-cols-[220px_auto]">
                    <input type="hidden" name="userId" value={user.id} />
                    <input
                      className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                      defaultValue={user.hwidDeviceLimit ?? ""}
                      name="hwidDeviceLimit"
                      placeholder={`По умолчанию: ${settings.defaultHwidDeviceLimit}`}
                      type="number"
                    />
                    <PendingButton variant="ghost">Обновить HWID</PendingButton>
                  </form>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
