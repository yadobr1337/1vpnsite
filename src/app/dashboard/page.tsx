import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PendingButton } from "@/components/ui/pending-button";
import { CopyButton } from "@/components/copy-button";
import { DeviceStepperForm } from "@/components/device-stepper-form";
import { claimTrialAction, topUpBalanceAction, updateOwnHwidAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { getUserOverview } from "@/lib/billing";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { ensureUserPublicId } from "@/lib/user-identity";
import { formatCurrency, formatDays } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await requireUser();
  const [overview, publicId, transactions] = await Promise.all([
    getUserOverview(session.user.id),
    ensureUserPublicId(session.user.id),
    db.balanceTransaction.findMany({
      where: {
        userId: session.user.id,
        amountKopeks: {
          gt: 0,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  if (!overview) {
    return null;
  }

  const canClaimTrial = !overview.user.trialClaimedAt;

  return (
    <main className="dashboard-shell min-h-screen px-6 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge>Client dashboard</Badge>
            <h1 className="mt-4 text-3xl font-bold uppercase tracking-[0.08em] text-white">
              {publicId}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">{overview.user.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/">
              <Button variant="ghost">Главная</Button>
            </Link>
            <Link href="/dashboard/account">
              <Button variant="ghost">Настройки аккаунта</Button>
            </Link>
            {session.user.role === "ADMIN" ? (
              <Link href="/admin">
                <Button variant="ghost">Админ</Button>
              </Link>
            ) : null}
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="space-y-5">
            <Badge>Подписка</Badge>
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
                <div className="flex flex-wrap gap-3">
                  <a
                    href={overview.user.subscriptionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/15 px-5 text-sm font-medium text-cyan-100 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/70 hover:bg-cyan-400/25"
                  >
                    Подключиться
                  </a>
                  <CopyButton value={overview.user.subscriptionUrl} />
                </div>
              </div>
            ) : (
              <p className="text-sm leading-7 text-zinc-400">
                Ссылка появится после оплаты и успешной синхронизации с Remnawave.
              </p>
            )}
          </Card>

          <div className="grid gap-4">
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
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Статус VPN</p>
              <p className="mt-3 text-xl font-bold text-white">
                {overview.user.balanceKopeks > 0 ? "Активный" : "Ожидает оплаты"}
              </p>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="space-y-5">
            <Badge>Устройства</Badge>
            <h2 className="text-2xl font-bold uppercase tracking-[0.08em] text-white">
              Количество устройств
            </h2>
            <p className="text-sm leading-7 text-zinc-400">
              Лимит устройств сразу влияет на расчет дней и обновляется в Remnawave.
            </p>
            <DeviceStepperForm
              action={updateOwnHwidAction}
              currentValue={overview.effectiveHwidDeviceLimit}
            />
          </Card>

          <Card className="space-y-5">
            <Badge>Пополнение</Badge>
            <h2 className="text-2xl font-bold uppercase tracking-[0.08em] text-white">
              Пополнить баланс
            </h2>
            <form action={topUpBalanceAction} className="flex flex-col gap-3 sm:flex-row">
              <input
                className="h-12 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none"
                defaultValue="199"
                min="10"
                name="amount"
                step="1"
                type="number"
              />
              <PendingButton>
                {env.PAYMENTS_AUTO_APPROVE === "true"
                  ? "Пополнить баланс"
                  : "Платежный провайдер не подключен"}
              </PendingButton>
            </form>

            {canClaimTrial ? (
              <form action={claimTrialAction}>
                <PendingButton className="w-full" variant="ghost">
                  Получить 1 бесплатный день
                </PendingButton>
              </form>
            ) : null}

            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
                История пополнений
              </p>
              {transactions.length ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{transaction.description}</p>
                        <p className="text-xs text-zinc-500">
                          {transaction.createdAt.toLocaleString("ru-RU")}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-cyan-200">
                        +{formatCurrency(transaction.amountKopeks)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-400">
                  Пополнений пока нет.
                </div>
              )}
            </div>
          </Card>
        </section>

        <Card>
          <Badge>Инфо</Badge>
          <div className="mt-4 space-y-2 text-sm text-zinc-300">
            <p>Цена за день: {formatCurrency(overview.settings.pricePerDayKopeks)}</p>
            <p>Telegram ID: {overview.user.telegramId ?? "не привязан"}</p>
            <p>
              При нулевом балансе ссылка отключается и удаляется через{" "}
              {overview.settings.deletionGraceHours} часов.
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
