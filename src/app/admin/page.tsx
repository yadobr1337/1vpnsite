import Link from "next/link";
import { Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PendingButton } from "@/components/ui/pending-button";
import {
  adjustUserBalanceAction,
  createSquadAction,
  deleteSquadAction,
  runSyncNowAction,
  toggleBanAction,
  updateSettingsAction,
  updateSquadLimitAction,
  updateUserHwidAction,
} from "@/app/actions";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatCurrency, formatDays } from "@/lib/utils";

export default async function AdminPage() {
  await requireAdmin();

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
          <div className="space-y-4">
            <Badge>Admin console</Badge>
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-[0.08em] text-white">
                Управление 1VPN
              </h1>
              <p className="mt-2 text-sm text-zinc-400">
                Сквады привязываются к уже созданным группам Remnawave по UUID.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="inline-flex">
              <Button variant="ghost">Вернуться в кабинет</Button>
            </Link>
            <form action={runSyncNowAction}>
              <PendingButton>Запустить синхронизацию</PendingButton>
            </form>
          </div>
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
                Устройства по умолчанию
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
              Привязка к Remnawave
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Сквад создается в панели, а здесь вы только добавляете его UUID, лимит пользователей
              и удобное название.
            </p>

            <form
              action={createSquadAction}
              className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_1fr_180px_auto]"
            >
              <input
                className="h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                name="remnawaveInternalSquadUuid"
                placeholder="UUID сквада Remnawave"
                required
              />
              <input
                className="h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                name="name"
                placeholder="Название для админки"
              />
              <input
                className="h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                name="memberLimit"
                placeholder="Лимит"
                required
                type="number"
              />
              <PendingButton>Добавить сквад</PendingButton>
            </form>

            <div className="mt-6 space-y-3">
              {squads.length ? (
                squads.map((squad) => (
                  <div key={squad.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <form action={updateSquadLimitAction} className="grid gap-3 xl:grid-cols-[1fr_1.2fr_160px_auto_auto]">
                      <input type="hidden" name="squadId" value={squad.id} />
                      <input
                        className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                        defaultValue={squad.name}
                        name="name"
                        placeholder="Название"
                      />
                      <input
                        className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                        defaultValue={squad.remnawaveInternalSquadUuid ?? ""}
                        name="remnawaveInternalSquadUuid"
                        placeholder="UUID сквада"
                        required
                      />
                      <input
                        className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                        defaultValue={squad.memberLimit}
                        name="memberLimit"
                        type="number"
                      />
                      <label className="flex items-center gap-2 text-sm text-zinc-300">
                        <input defaultChecked={squad.isActive} name="isActive" type="checkbox" />
                        active
                      </label>
                      <div className="flex gap-3">
                        <PendingButton variant="ghost">Обновить</PendingButton>
                        <button
                          formAction={deleteSquadAction}
                          name="squadId"
                          value={squad.id}
                          className="inline-flex h-11 items-center justify-center rounded-full border border-red-400/35 bg-red-500/10 px-5 text-sm font-medium text-red-100 transition duration-300 hover:border-red-400/60 hover:bg-red-500/20"
                        >
                          Удалить
                        </button>
                      </div>
                    </form>
                    <p className="mt-3 text-sm text-zinc-400">
                      Занято {squad._count.users} из {squad.memberLimit} мест
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-5 text-sm text-zinc-400">
                  Сквады еще не добавлены. Пока что пользователи будут создаваться без назначения, а
                  выдача VPN останется в ожидании.
                </div>
              )}
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="space-y-3">
            <Badge>Пользователи</Badge>
            <h2 className="text-2xl font-bold uppercase tracking-[0.08em] text-white">
              Баланс, устройства и статус доступа
            </h2>
            <p className="text-sm text-zinc-400">
              Пополнение выполняется прямо в карточке пользователя. Для поиска и идентификации
              отображается локальный ID.
            </p>
          </div>

          <Card>
            <Badge>Быстрое пополнение</Badge>
            <form action={adjustUserBalanceAction} className="mt-5 grid gap-3 xl:grid-cols-[1.1fr_180px_1fr_auto]">
              <input
                className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                name="userId"
                placeholder="Вставьте user ID"
                required
                type="text"
              />
              <input
                className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                defaultValue="100"
                name="amount"
                step="0.01"
                type="number"
              />
              <input
                className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-white"
                defaultValue="Ручное пополнение из админки"
                name="description"
                type="text"
              />
              <PendingButton>Начислить баланс</PendingButton>
            </form>
          </Card>

          <div className="grid gap-4">
            {users.map((user) => {
              const effectiveDeviceCount = Math.max(
                1,
                user.hwidDeviceLimit ?? settings.defaultHwidDeviceLimit,
              );
              const remainingDays =
                settings.pricePerDayKopeks > 0
                  ? user.balanceKopeks / (settings.pricePerDayKopeks * effectiveDeviceCount)
                  : 0;

              return (
                <Card key={user.id} className="space-y-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                      <p className="font-mono text-lg font-semibold text-white">{user.id}</p>
                      <p className="text-sm text-zinc-400">{user.email}</p>
                      <p className="text-sm text-zinc-500">
                        Role: {user.role} • Сквад: {user.squad?.name ?? "не назначен"}
                      </p>
                      <p className="text-sm text-zinc-500">
                        Remnawave user UUID: {user.remnawaveUserUuid ?? "еще не создан"}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {user.subscriptionUrl ?? "Ссылка подписки еще не сгенерирована"}
                      </p>
                    </div>
                    <div className="grid gap-2 text-right text-sm text-zinc-300">
                      <p>Баланс: {formatCurrency(user.balanceKopeks)}</p>
                      <p>Остаток: {formatDays(remainingDays)} дн.</p>
                      <p>Устройства: {effectiveDeviceCount}</p>
                      <p>{user.isBanned ? "Бан активен" : "Аккаунт активен"}</p>
                      <p>VPN: {user.vpnStatusMessage ?? user.vpnProvisionState}</p>
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
                        defaultValue="Ручное пополнение из админки"
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
                    <PendingButton variant="ghost">Обновить устройства</PendingButton>
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
