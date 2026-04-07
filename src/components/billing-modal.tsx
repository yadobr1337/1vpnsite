"use client";

import { useState } from "react";
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

  return (
    <>
      <Button onClick={() => setOpen(true)} size="lg">
        Пополнить баланс
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-3xl rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,19,28,0.96),rgba(8,10,16,0.96))] p-5 shadow-[0_24px_100px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Billing</p>
                <h3 className="mt-2 text-2xl font-bold uppercase tracking-[0.08em] text-white">
                  Баланс и платежи
                </h3>
              </div>
              <Button variant="ghost" onClick={() => setOpen(false)} type="button">
                Закрыть
              </Button>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
              <div className="space-y-4">
                <form action={topUpAction} className="space-y-3">
                  <label className="block text-sm text-zinc-300">
                    Сумма пополнения
                    <input
                      className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none"
                      defaultValue="199"
                      min="10"
                      name="amount"
                      step="1"
                      type="number"
                    />
                  </label>
                  <PendingButton className="w-full">Пополнить баланс</PendingButton>
                </form>

                {canClaimTrial ? (
                  <form action={claimTrialAction}>
                    <PendingButton className="w-full" variant="ghost">
                      Получить пробный день
                    </PendingButton>
                  </form>
                ) : null}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  История пополнений
                </p>
                <div className="max-h-[48vh] space-y-3 overflow-y-auto pr-1">
                  {transactions.length ? (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{transaction.description}</p>
                          <p className="text-xs text-zinc-500">{transaction.createdAt}</p>
                        </div>
                        <p className="text-sm font-semibold text-cyan-200">+{transaction.amount}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-400">
                      Пополнений пока не было.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
