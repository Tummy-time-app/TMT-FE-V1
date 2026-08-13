"use client";

import { useMemo, useState } from "react";
import { CreditCard } from "@/components/icons";
import { useGetAllTransactionsQuery } from "@/features/wallet/walletApi";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { cn } from "@/lib/utils/cn";
import type { WalletTransactionStatus, WalletTransactionType } from "@/features/wallet/types";

function formatNaira(n: number) {
  return `${n < 0 ? "−" : ""}₦${Math.abs(n).toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

const TYPE_LABEL: Record<WalletTransactionType, string> = {
  wallet_topup: "Top-up",
  order_payment: "Order payment",
  refund: "Refund",
  wallet_withdrawal: "Withdrawal",
};

const STATUS_CLASSES: Record<WalletTransactionStatus, string> = {
  pending: "bg-warning-bg text-warning",
  success: "bg-success-bg text-success",
  failed: "bg-error-bg text-error",
  reversed: "bg-black/5 text-text-muted",
};

const TYPE_FILTERS: (WalletTransactionType | "all")[] = ["all", "wallet_topup", "order_payment", "refund", "wallet_withdrawal"];

export default function AdminPaymentsPage() {
  const { data: transactions, isLoading, error, refetch } = useGetAllTransactionsQuery();
  const [typeFilter, setTypeFilter] = useState<WalletTransactionType | "all">("all");

  const filtered = useMemo(
    () => (typeFilter === "all" ? transactions : transactions?.filter((t) => t.type === typeFilter)),
    [transactions, typeFilter]
  );

  const totalVolume = filtered?.reduce((sum, t) => sum + Math.abs(t.amount), 0) ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-h1 font-bold text-text">Payments</h1>
          <p className="mt-1 text-small text-text-muted">
            {filtered?.length ?? 0} transaction{filtered?.length === 1 ? "" : "s"} · {formatNaira(totalVolume)} total volume
          </p>
        </div>
        <div className="flex flex-wrap gap-1 rounded-full border border-border bg-surface p-1">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={cn(
                "rounded-full px-3 py-1.5 text-caption font-semibold capitalize transition-colors",
                typeFilter === t ? "bg-primary text-white" : "text-text-muted hover:text-text"
              )}
            >
              {t === "all" ? "All" : TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !filtered || filtered.length === 0 ? (
          <EmptyState icon={CreditCard} title="No transactions yet" description="Wallet activity across the platform will show up here." />
        ) : (
          filtered.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-4">
              <div className="min-w-0 flex-1">
                <p className="text-small font-semibold text-text">
                  {TYPE_LABEL[t.type]} · <span className="text-text-muted">{t.userId}</span>
                </p>
                <p className="text-caption text-text-subtle">
                  {t.description} · {formatDate(t.createdAt)}
                  {t.providerReference && ` · ${t.providerReference}`}
                </p>
              </div>
              <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-caption font-semibold capitalize", STATUS_CLASSES[t.status])}>
                {t.status}
              </span>
              <span className={cn("shrink-0 text-small font-semibold tabular-nums", t.amount >= 0 ? "text-success" : "text-text")}>
                {formatNaira(t.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
