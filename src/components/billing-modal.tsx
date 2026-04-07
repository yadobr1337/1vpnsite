"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PendingButton } from "@/components/ui/pending-button";

type BillingModalProps = {
  canClaimTrial: boolean;
  transactions: Array<{
    id: string;
    description: string;
    amount: string;
    createdAt: string;
  }>;
  topUpAction: (formData: FormData) => Promise<void>;
  claimTrialAction: () => Promise<void>;
};

export function BillingModal({
  canClaimTrial,
  transactions,
  topUpAction,
  claimTrialAction,
}: BillingModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="lg">
        Пополнить баланс
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[90]">
          <button
            type="button"
            aria-label="Закрыть панель пополнения"
            className="absolute inset-0 bg-black/72 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />

          <div className="absolute inset-0 overflow-y-auto">
            <div className="min-h-full p-3 sm:p-5">
              <div className="mx-auto flex min-h-[calc(100dvh-24px)] w-full max-w-6xl flex-col rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,18,28,0.97),rgba(7,9,14,0.98))] shadow-[0_24px_120px_rgba(0,0,0,0.62)] backdrop-blur-xl sm:min-h-[calc(100dvh-40px)] sm:rounded-[34px]">
                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-[28px] border-b border-white/10 bg-[linear-gradient(180deg,rgba(16,20,29,0.98),rgba(16,20,29,0.84))] px-4 py-4 backdrop-blur-xl sm:rounded-t-[34px] sm:px-6 sm:py-5">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Billing</p>
                    <h3 className="mt-2 text-xl font-bold uppercase tracking-[0.08em] text-white sm:text-3xl">
                      Баланс и пополнения
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                      Пополнение и история платежей открываются поверх кабинета на весь экран.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setOpen(false)}
                    type="button"
                    className="shrink-0"
                  >
                    Назад
                  </Button>
                </div>

                <div className="grid flex-1 gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-5">
                  <div className="space-y-4">
                    <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                        Пополнение
                      </p>

                      <form action={topUpAction} className="mt-4 space-y-3">
                        <label className="block text-sm text-zinc-300">
                          Сумма пополнения
                          <input
                            className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-cyan-300/40"
                            defaultValue="199"
                            min="10"
                            name="amount"
                            step="1"
                            type="number"
                          />
                        </label>
                        <PendingButton className="w-full">Пополнить баланс</PendingButton>
                      </form>
                    </div>

                    {canClaimTrial ? (
                      <div className="rounded-[26px] border border-cyan-300/15 bg-cyan-400/[0.05] p-4 sm:p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                          Бонус
                        </p>
                        <p className="mt-3 text-sm leading-6 text-zinc-300">
                          Один раз можно активировать пробный день прямо из этой панели.
                        </p>
                        <form action={claimTrialAction} className="mt-4">
                          <PendingButton className="w-full" variant="ghost">
                            Получить пробный день
                          </PendingButton>
                        </form>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                        История пополнений
                      </p>
                      <span className="text-xs text-zinc-500">{transactions.length} записей</span>
                    </div>

                    <div className="mt-4 max-h-[52dvh] space-y-3 overflow-y-auto pr-1 sm:max-h-[60dvh]">
                      {transactions.length ? (
                        transactions.map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {transaction.description}
                              </p>
                              <p className="mt-1 text-xs text-zinc-500">{transaction.createdAt}</p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold text-cyan-200">
                              +{transaction.amount}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-400">
                          Пополнений пока не было.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
