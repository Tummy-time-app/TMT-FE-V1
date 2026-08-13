"use client";

import { useState } from "react";
import { Check, Copy, Users, Wallet } from "@/components/icons";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/features/auth/hooks";
import { useGetReferralSummaryQuery, useGetReferralsQuery } from "@/features/referrals/referralsApi";
import { EmptyState } from "@/components/feedback/EmptyState";
import { StatCard } from "@/components/data-display/StatCard";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function ReferralsContent() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [copied, setCopied] = useState(false);

  const { data: summary } = useGetReferralSummaryQuery(userId, { skip: !userId });
  const { data: referrals, isLoading } = useGetReferralsQuery(userId, { skip: !userId });

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access can fail — the link is still visible to copy manually
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-h1 font-bold text-text">Refer & earn</h1>
      <p className="mt-1 text-small text-text-muted">
        Share your code — you both win when a friend joins TummyTime.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <StatCard label="Friends referred" value={String(summary?.totalReferred ?? 0)} icon={Users} />
        <StatCard label="Total earned" value={formatNaira(summary?.totalEarned ?? 0)} icon={Wallet} accent="success" />
      </div>

      <section className="mt-6 rounded-lg border border-border bg-surface p-5">
        <p className="text-small font-semibold text-text">Your referral code</p>
        <p className="mt-1 font-display text-h2 font-bold tracking-widest text-primary">{summary?.code ?? "…"}</p>

        <p className="mt-4 text-small font-semibold text-text">Share link</p>
        <div className="mt-1.5 flex items-center gap-2">
          <input
            readOnly
            value={summary?.shareUrl ?? ""}
            className="flex-1 truncate rounded-md border border-border bg-background px-3.5 py-2.5 text-caption text-text-muted outline-none"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-small font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </section>

      <h2 className="mt-8 font-display text-h3 font-bold text-text">Your referrals</h2>
      <div className="mt-3 space-y-2">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-black/5" />)
        ) : !referrals || referrals.length === 0 ? (
          <EmptyState icon={Users} title="No referrals yet" description="Share your link above to start earning." />
        ) : (
          referrals.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
              <div>
                <p className="text-small font-semibold text-text">{r.referredName}</p>
                <p className="text-caption text-text-subtle">{formatDate(r.createdAt)}</p>
              </div>
              <span
                className={
                  r.status === "completed"
                    ? "text-small font-semibold text-success"
                    : "text-small font-semibold text-text-muted"
                }
              >
                {r.status === "completed" ? `+${formatNaira(r.rewardAmount)}` : "Pending"}
              </span>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

export default function ReferralsPage() {
  return (
    <RequireAuth>
      <ReferralsContent />
    </RequireAuth>
  );
}
