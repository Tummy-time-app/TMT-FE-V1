"use client";

import { useState } from "react";
import { Plus, Tag, Trash2 } from "@/components/icons";
import {
  useCreatePromotionMutation,
  useDeletePromotionMutation,
  useGetAllPromotionsQuery,
  useUpdatePromotionMutation,
} from "@/features/promotions/promotionsApi";
import { PromotionForm } from "@/features/promotions/components/PromotionForm";
import type { PromotionFormValues } from "@/features/promotions/schemas";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";

function discountLabel(discountType: "percentage" | "fixed", discountValue: number) {
  return discountType === "percentage" ? `${discountValue}% off` : `₦${discountValue.toLocaleString("en-NG")} off`;
}

export default function AdminPromotionsPage() {
  const { data: promotions, isLoading, error, refetch } = useGetAllPromotionsQuery();
  const [createPromotion, { isLoading: isCreating }] = useCreatePromotionMutation();
  const [updatePromotion] = useUpdatePromotionMutation();
  const [deletePromotion, { isLoading: isDeleting }] = useDeletePromotionMutation();

  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; code: string } | null>(null);
  const [submitError, setSubmitError] = useState("");
  const toast = useToast();

  const handleSubmit = async (values: PromotionFormValues) => {
    setSubmitError("");
    try {
      // No vendorId — admin-created promotions are platform-wide.
      await createPromotion(values).unwrap();
      toast.success(`${values.code.toUpperCase()} created.`);
      setShowForm(false);
    } catch (err) {
      setSubmitError(normalizeApiError(err as never).message);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await updatePromotion({ id, patch: { active: !active } }).unwrap();
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePromotion(deleteTarget.id).unwrap();
      toast.success(`${deleteTarget.code} deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-h1 font-bold text-text">Promotions</h1>
          <p className="mt-1 text-small text-text-muted">Every promo code on the platform.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          <Plus size={16} aria-hidden />
          New platform-wide promotion
        </button>
      </div>

      {showForm && (
        <div className="mt-5">
          <PromotionForm onSubmit={handleSubmit} isSubmitting={isCreating} submitError={submitError} />
        </div>
      )}

      <div className="mt-6 space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !promotions || promotions.length === 0 ? (
          <EmptyState icon={Tag} title="No promotions yet" description="Create the first platform-wide promo code." />
        ) : (
          promotions.map((promo) => (
            <div key={promo.id} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Tag size={16} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-small font-semibold text-text">
                  {promo.code} — {discountLabel(promo.discountType, promo.discountValue)}
                </p>
                <p className="text-caption text-text-subtle">
                  {promo.description} ·{" "}
                  {promo.applicableVendorIds?.length ? `Vendor: ${promo.applicableVendorIds.join(", ")}` : "Platform-wide"} · Used{" "}
                  {promo.timesUsed}
                  {promo.usageLimit ? `/${promo.usageLimit}` : ""} times
                </p>
              </div>
              <label className="flex shrink-0 items-center gap-2 text-caption font-semibold text-text-muted">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--crimson)]"
                  checked={promo.active}
                  onChange={() => handleToggleActive(promo.id, promo.active)}
                />
                Active
              </label>
              <button
                type="button"
                aria-label={`Delete ${promo.code}`}
                onClick={() => setDeleteTarget({ id: promo.id, code: promo.code })}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-error/30 text-error transition-colors hover:bg-error-bg"
              >
                <Trash2 size={15} aria-hidden />
              </button>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.code}?`}
        description="This code will stop working immediately. This can't be undone."
        confirmLabel="Delete"
        cancelLabel="Keep it"
        destructive
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
