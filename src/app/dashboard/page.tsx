import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PendingButton } from "@/components/ui/pending-button";
import { LogoutButton } from "@/components/logout-button";
import { CopyButton } from "@/components/copy-button";
import { claimTrialAction, topUpBalanceAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getUserOverview } from "@/lib/billing";
import { formatCurrency, formatDays } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await requireUser();
  const overview = await getUserOverview(session.user.id);

  if (!overview) {
    return null;
  }

  const transactions = await db.balanceTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const canClaimTrial = !overview.user.trialClaimedAt;

  return (
    <main className="dashboard-shell min-h-screen px-6 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge>Client dashboard</Badge>
            <h1 className="mt-4 text-3xl font-bold uppercase tracking-[0.08em] text-white">
              {overview.user.email}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Сквад: {overview.user.squad?.name ?? "Не назначен"} • Статус:{" "}
              {overview.user.isBanned ? "Заморожен" : overview.user.vpnProvisionState}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {session.user.role === "ADMIN" ? (
              <Link href="/admin" className="inline-flex">
                <Button variant="ghost">Админ-панель</Button>
              </Link>
            ) : null}
            <LogoutButton />
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Баланс</p>
            <p className="mt-3 text-3xl font-bold text-white">
              {formatCurrency(overview.user.balanceKopeks)}
            </p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Остаток дней</p>
            <p className="mt-3 text-3xl font-bold text-white">{formatDays(overview.remainingDays)}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Цена за день</p>
            <p className="mt-3 text-3xl font-bold text-white">
              {formatCurrency(overview.settings.pricePerDayKopeks)}
            </p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">VPN</p>
            <p className="mt-3 text-xl font-bold text-white">{overview.user.vpnStatusMessage ?? "Pending"}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">HWID / устройства</p>
            <p className="mt-3 text-3xl font-bold text-white">{overview.effectiveHwidDeviceLimit}</p>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="space-y-5">
            <Badge>Subscription</Badge>
            <h2 className="text-2xl font-bold uppercase tracking-[0.08em] text-white">
              Ссылка доступа
            </h2>
            {overview.user.subscriptionUrl ? (
              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                  <p className="break-all font-mono text-xs leading-6 text-cyan-200">
                    {overview.user.subscriptionUrl}
                  </p>
                </div>
                <CopyButton value={overview.user.subscriptionUrl} />
              </div>
            ) : (
              <p className="text-sm leading-7 text-zinc-400">
                После первого пополнения бекенд создаст VPN-пользователя в Remnawave и выдаст
                уникальную ссылку подписки.
              </p>
            )}
          </Card>

          <Card className="space-y-5">
            <Badge>Пополнение</Badge>
            <h2 className="text-2xl font-bold uppercase tracking-[0.08em] text-white">
              Управление балансом
            </h2>
            <form action={topUpBalanceAction} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Сумма пополнения, RUB</label>
                <input
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none"
                  defaultValue="199"
                  min="10"
                  name="amount"
                  step="0.01"
                  type="number"
                />
              </div>
              <PendingButton className="w-full">
                {env.PAYMENTS_AUTO_APPROVE === "true"
                  ? "Мгновенно пополнить баланс"
                  : "Платежный провайдер не подключен"}
              </PendingButton>
            </form>

            <form action={claimTrialAction}>
              <PendingButton className="w-full" variant="ghost" disabled={!canClaimTrial}>
                {canClaimTrial ? "Получить 1 бесплатный день" : "Пробный день уже использован"}
              </PendingButton>
            </form>

            <p className="text-sm leading-7 text-zinc-400">
              При нулевом балансе ссылка отключается. Через {overview.settings.deletionGraceHours} часов
              после окончания доступа она удаляется, если баланс не пополнен.
            </p>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <Badge>Telegram</Badge>
            <h2 className="mt-4 text-2xl font-bold uppercase tracking-[0.08em] text-white">
              Уведомления
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
              <p>Пополнение баланса.</p>
              <p>Предупреждение за 1 день до окончания.</p>
              <p>Окончание подписки.</p>
              <p>Предупреждение об удалении ссылки.</p>
            </div>
            <p className="mt-6 text-sm text-zinc-400">
              Telegram ID: {overview.user.telegramId ? overview.user.telegramId : "не привязан"}
            </p>
          </Card>

          <Card>
            <Badge>История операций</Badge>
            <div className="mt-5 space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{transaction.description}</p>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                      {transaction.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        transaction.amountKopeks >= 0 ? "text-cyan-200" : "text-zinc-200"
                      }`}
                    >
                      {transaction.amountKopeks >= 0 ? "+" : ""}
                      {formatCurrency(transaction.amountKopeks)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {transaction.createdAt.toLocaleString("ru-RU")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
