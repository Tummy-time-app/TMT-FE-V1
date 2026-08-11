"use client";

import { useState } from "react";
import { Check, Copy, Tag } from "lucide-react";
import { useGetPromotionsQuery } from "@/features/promotions/promotionsApi";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import type { Promotion } from "@/features/promotions/types";

function discountLabel(promo: Promotion) {
  return promo.discountType === "percentage" ? `${promo.discountValue}% off` : `₦${promo.discountValue.toLocaleString("en-NG")} off`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function PromoCard({ promo }: { promo: Promotion }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access can fail (permissions/insecure context) — the code is still visible to copy manually
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Tag size={20} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-h3 font-bold text-primary">{discountLabel(promo)}</p>
        <p className="mt-0.5 text-small text-text-muted">{promo.description}</p>
        {promo.minOrderAmount && (
          <p className="mt-0.5 text-caption text-text-subtle">
            Min. order ₦{promo.minOrderAmount.toLocaleString("en-NG")} · Valid until {formatDate(promo.expiresAt)}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="flex shrink-0 items-center gap-1.5 rounded-md border border-primary/30 bg-white px-3 py-2 text-small font-bold text-primary transition-colors hover:bg-primary hover:text-white"
      >
        {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
        {copied ? "Copied" : promo.code}
      </button>
    </div>
  );
}

export default function PromotionsPage() {
  const { data: promotions, isLoading, error, refetch } = useGetPromotionsQuery();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-h1 font-bold text-text">Promotions</h1>
      <p className="mt-1 text-small text-text-muted">Available offers — copy a code and apply it at checkout.</p>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !promotions || promotions.length === 0 ? (
          <EmptyState icon={Tag} title="No promotions right now" description="Check back soon for new offers." />
        ) : (
          promotions.map((promo) => <PromoCard key={promo.id} promo={promo} />)
        )}
      </div>
    </main>
  );
}
