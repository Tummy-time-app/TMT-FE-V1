"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Plus, Wallet as WalletIcon } from "@/components/icons";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/features/auth/hooks";
import { useGetWalletQuery, useGetWalletTransactionsQuery, useTopUpWalletMutation } from "@/features/wallet/walletApi";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { WithdrawSection } from "@/components/finance/WithdrawSection";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import type { TopUpMethod } from "@/features/wallet/types";

function formatNaira(n: number) {
  return `₦${Math.abs(n).toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

const QUICK_AMOUNTS = [1000, 2500, 5000, 10000];

function WalletContent() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const toast = useToast();

  const { data: wallet, isLoading: balanceLoading } = useGetWalletQuery(userId, { skip: !userId });
  const { data: transactions, isLoading: txLoading, error, refetch } = useGetWalletTransactionsQuery(userId, { skip: !userId });
  const [topUp, { isLoading: isToppingUp }] = useTopUpWalletMutation();

  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState<number | "">("");
  const [method, setMethod] = useState<TopUpMethod>("card");
  const [formError, setFormError] = useState("");

  const handleTopUp = async () => {
    setFormError("");
    if (!amount || amount <= 0) {
      setFormError("Enter an amount greater than zero.");
      return;
    }
    try {
      await topUp({ userId, amount: Number(amount), method }).unwrap();
      toast.success(`${formatNaira(Number(amount))} added to your wallet.`);
      setShowTopUp(false);
      setAmount("");
    } catch (err) {
      setFormError(normalizeApiError(err as never).message);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-h1 font-bold text-text">Wallet</h1>
      <p className="mt-1 text-small text-text-muted">Top up your balance and pay for orders instantly.</p>

      <section className="mt-6 rounded-lg bg-primary p-6 text-white">
        <p className="text-small font-medium text-white/80">Wallet balance</p>
        <p className="mt-1 font-display text-display font-bold tabular-nums">
          {balanceLoading ? "…" : formatNaira(wallet?.balance ?? 0)}
        </p>
        <button
          type="button"
          onClick={() => setShowTopUp((v) => !v)}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-small font-semibold text-primary transition-transform duration-fast hover:-translate-y-0.5"
        >
          <Plus size={16} aria-hidden />
          Top up
        </button>
      </section>

      {showTopUp && (
        <section className="mt-4 rounded-lg border border-border bg-surface p-5">
          <p className="text-small font-semibold text-text">Amount</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-small font-semibold transition-colors",
                  amount === amt ? "border-primary bg-primary text-white" : "border-border text-text-muted hover:border-primary/40"
                )}
              >
                {formatNaira(amt)}
              </button>
            ))}
          </div>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
            placeholder="Or enter a custom amount"
            className="mt-3 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          />

          <p className="mt-4 text-small font-semibold text-text">Pay with</p>
          <div className="mt-2 flex gap-3">
            {(["card", "bank_transfer"] as TopUpMethod[]).map((m) => (
              <label
                key={m}
                className={cn(
                  "flex flex-1 cursor-pointer items-center gap-2 rounded-md border px-4 py-2.5 text-small font-medium transition-colors",
                  method === m ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <input type="radio" name="topup-method" checked={method === m} onChange={() => setMethod(m)} className="accent-[var(--crimson)]" />
                {m === "card" ? "Card" : "Bank transfer"}
              </label>
            ))}
          </div>

          {formError && <p className="mt-3 text-small font-semibold text-error">{formError}</p>}

          <button
            type="button"
            onClick={handleTopUp}
            disabled={isToppingUp}
            className="mt-4 rounded-md bg-primary px-6 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isToppingUp ? "Processing…" : "Confirm top up"}
          </button>
        </section>
      )}

      {userId && (
        <div className="mt-8">
          <WithdrawSection actorId={userId} availableBalance={wallet?.balance ?? 0} />
        </div>
      )}

      <h2 className="mt-8 font-display text-h3 font-bold text-text">Transaction history</h2>
      <div className="mt-3 space-y-2">
        {txLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !transactions || transactions.length === 0 ? (
          <EmptyState icon={WalletIcon} title="No transactions yet" description="Your top-ups and payments will show up here." />
        ) : (
          transactions.map((tx) => {
            const isCredit = tx.amount >= 0;
            return (
              <div key={tx.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    isCredit ? "bg-success-bg text-success" : "bg-error-bg text-error"
                  )}
                >
                  {isCredit ? <ArrowDownLeft size={16} aria-hidden /> : <ArrowUpRight size={16} aria-hidden />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-small font-semibold text-text">{tx.description}</p>
                  <p className="text-caption text-text-subtle">{formatDate(tx.createdAt)}</p>
                </div>
                <span className={cn("shrink-0 text-small font-semibold tabular-nums", isCredit ? "text-success" : "text-error")}>
                  {isCredit ? "+" : "−"}
                  {formatNaira(tx.amount)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}

export default function WalletPage() {
  return (
    <RequireAuth>
      <WalletContent />
    </RequireAuth>
  );
}
