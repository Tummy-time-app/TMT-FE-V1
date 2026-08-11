"use client";

import { useState } from "react";
import { ArrowUpRight, Wallet } from "@/components/icons";
import { useCreateWithdrawalMutation, useGetWithdrawalsQuery } from "@/features/payouts/payoutsApi";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

interface WithdrawSectionProps {
  actorId: string;
  availableBalance: number;
}

/** Shared withdraw UI for vendor payouts and rider earnings — same ledger, same interaction. */
export function WithdrawSection({ actorId, availableBalance }: WithdrawSectionProps) {
  const { data: withdrawals, isLoading, error, refetch } = useGetWithdrawalsQuery(actorId, { skip: !actorId });
  const [createWithdrawal, { isLoading: isWithdrawing }] = useCreateWithdrawalMutation();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState<number | "">("");
  const [formError, setFormError] = useState("");
  const toast = useToast();

  const handleWithdraw = async () => {
    setFormError("");
    if (!amount || amount <= 0) {
      setFormError("Enter an amount greater than zero.");
      return;
    }
    try {
      await createWithdrawal({ actorId, amount: Number(amount), availableBalance }).unwrap();
      toast.success(`${formatNaira(Number(amount))} withdrawn.`);
      setShowForm(false);
      setAmount("");
    } catch (err) {
      setFormError(normalizeApiError(err as never).message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-h3 font-bold text-text">Withdrawals</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          <ArrowUpRight size={15} aria-hidden />
          Withdraw
        </button>
      </div>

      {showForm && (
        <div className="mt-3 rounded-lg border border-border bg-surface p-4">
          <p className="text-caption text-text-subtle">Available: {formatNaira(availableBalance)}</p>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
            placeholder="Amount to withdraw"
            className="mt-2 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          />
          {formError && <p className="mt-2 text-small font-semibold text-error">{formError}</p>}
          <button
            type="button"
            onClick={handleWithdraw}
            disabled={isWithdrawing}
            className="mt-3 rounded-md bg-primary px-5 py-2 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isWithdrawing ? "Processing…" : "Confirm withdrawal"}
          </button>
        </div>
      )}

      <div className="mt-3 space-y-2">
        {isLoading ? (
          <div className="h-14 animate-pulse rounded-lg bg-black/5" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !withdrawals || withdrawals.length === 0 ? (
          <EmptyState icon={Wallet} title="No withdrawals yet" description="Your withdrawal history will show up here." />
        ) : (
          withdrawals.map((w) => (
            <div key={w.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
              <p className="text-caption text-text-subtle">{formatDate(w.createdAt)}</p>
              <span className="text-small font-semibold text-text">−{formatNaira(w.amount)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
