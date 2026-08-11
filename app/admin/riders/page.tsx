"use client";

import { useState } from "react";
import { Bike } from "lucide-react";
import { useGetAllUsersQuery, useSetUserActiveMutation } from "@/features/auth/authApi";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import type { User } from "@/features/auth/types";

export default function AdminRidersPage() {
  const { data: users, isLoading, error, refetch } = useGetAllUsersQuery();
  const [setUserActive, { isLoading: isUpdating }] = useSetUserActiveMutation();
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null);
  const toast = useToast();

  const riders = users?.filter((u) => u.role === "rider") ?? [];

  const handleActivate = async (userId: string) => {
    try {
      await setUserActive({ userId, active: true }).unwrap();
      toast.success("Rider reactivated.");
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await setUserActive({ userId: deactivateTarget.id, active: false }).unwrap();
      toast.success(`${deactivateTarget.name} deactivated.`);
      setDeactivateTarget(null);
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
      setDeactivateTarget(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-h1 font-bold text-text">Riders</h1>
      <p className="mt-1 text-small text-text-muted">Every rider account on the platform.</p>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : riders.length === 0 ? (
          <EmptyState icon={Bike} title="No riders yet" description="Riders will show up here once onboarded." />
        ) : (
          riders.map((rider) => (
            <div key={rider.id} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bike size={16} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-small font-semibold text-text">{rider.name}</p>
                <p className="truncate text-caption text-text-subtle">
                  {rider.email} · {rider.vehicleType ?? "—"}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-caption font-semibold",
                  rider.active ? "bg-success-bg text-success" : "bg-error-bg text-error"
                )}
              >
                {rider.active ? "Active" : "Deactivated"}
              </span>
              {rider.active ? (
                <button
                  type="button"
                  onClick={() => setDeactivateTarget(rider)}
                  disabled={isUpdating}
                  className="shrink-0 rounded-md border border-error/30 px-3 py-1.5 text-caption font-semibold text-error transition-colors hover:bg-error-bg"
                >
                  Deactivate
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleActivate(rider.id)}
                  disabled={isUpdating}
                  className="shrink-0 rounded-md border border-success/30 px-3 py-1.5 text-caption font-semibold text-success transition-colors hover:bg-success-bg"
                >
                  Reactivate
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!deactivateTarget}
        title={`Deactivate ${deactivateTarget?.name}?`}
        description="They won't be able to log in or receive delivery requests until reactivated."
        confirmLabel="Deactivate"
        cancelLabel="Cancel"
        destructive
        isConfirming={isUpdating}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  );
}
