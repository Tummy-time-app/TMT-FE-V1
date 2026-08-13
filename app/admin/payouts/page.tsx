"use client";

import { Wallet, Check, X } from "@/components/icons";
import { useGetAllWithdrawalsQuery, useSetWithdrawalStatusMutation } from "@/features/payouts/payoutsApi";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import type { Withdrawal, WithdrawalStatus } from "@/features/payouts/types";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

const STATUS_CLASSES: Record<WithdrawalStatus, string> = {
  pending: "bg-warning-bg text-warning",
  processing: "bg-info-bg text-info",
  paid: "bg-success-bg text-success",
  failed: "bg-error-bg text-error",
};

export default function AdminPayoutsPage() {
  const { data: withdrawals, isLoading, error, refetch } = useGetAllWithdrawalsQuery();
  const [setStatus] = useSetWithdrawalStatusMutation();
  const toast = useToast();

  const handleSetStatus = async (w: Withdrawal, status: WithdrawalStatus) => {
    if (!w.actorId) return;
    try {
      await setStatus({ actorId: w.actorId, id: w.id, status }).unwrap();
      toast.success(`Withdrawal ${status}.`);
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  return (
    <div>
      <h1 className="font-display text-h1 font-bold text-text">Payouts</h1>
      <p className="mt-1 text-small text-text-muted">Approve or reject vendor and rider withdrawal requests.</p>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !withdrawals || withdrawals.length === 0 ? (
          <EmptyState icon={Wallet} title="No withdrawals yet" description="Requests from vendors and riders will show up here." />
        ) : (
          withdrawals.map((w) => (
            <div key={w.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-4">
              <div className="min-w-0 flex-1">
                <p className="text-small font-semibold text-text">
                  {formatNaira(w.amount)} · <span className="text-text-muted">{w.actorId}</span>
                </p>
                <p className="text-caption text-text-subtle">{formatDate(w.createdAt)}</p>
              </div>

              <span className={cn("rounded-full px-2.5 py-1 text-caption font-semibold capitalize", STATUS_CLASSES[w.status])}>
                {w.status}
              </span>

              {w.status === "pending" && (
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetStatus(w, "processing")}
                    className="flex items-center gap-1 rounded-md border border-success/30 px-3 py-1.5 text-caption font-semibold text-success transition-colors hover:bg-success-bg"
                  >
                    <Check size={13} aria-hidden />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetStatus(w, "failed")}
                    className="flex items-center gap-1 rounded-md border border-error/30 px-3 py-1.5 text-caption font-semibold text-error transition-colors hover:bg-error-bg"
                  >
                    <X size={13} aria-hidden />
                    Reject
                  </button>
                </div>
              )}

              {w.status === "processing" && (
                <button
                  type="button"
                  onClick={() => handleSetStatus(w, "paid")}
                  className="flex shrink-0 items-center gap-1 rounded-md border border-success/30 px-3 py-1.5 text-caption font-semibold text-success transition-colors hover:bg-success-bg"
                >
                  <Check size={13} aria-hidden />
                  Mark paid
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
