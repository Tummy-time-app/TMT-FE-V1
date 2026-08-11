"use client";

import { useState } from "react";
import Image from "next/image";
import { Store } from "lucide-react";
import { useGetAllVendorsAdminQuery, useSetVendorApprovalStatusMutation } from "@/features/vendors/vendorsApi";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import type { Vendor, VendorApprovalStatus } from "@/features/vendors/types";

const STATUS_CLASSES: Record<VendorApprovalStatus, string> = {
  pending: "bg-warning-bg text-warning",
  approved: "bg-success-bg text-success",
  suspended: "bg-error-bg text-error",
};

interface PendingAction {
  vendor: Vendor;
  status: VendorApprovalStatus;
  title: string;
  description: string;
  destructive?: boolean;
}

export default function AdminVendorsPage() {
  const { data: vendors, isLoading, error, refetch } = useGetAllVendorsAdminQuery();
  const [setStatus, { isLoading: isUpdating }] = useSetVendorApprovalStatusMutation();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const toast = useToast();

  const handleConfirm = async () => {
    if (!pendingAction) return;
    try {
      await setStatus({ vendorId: pendingAction.vendor.id, status: pendingAction.status }).unwrap();
      toast.success(`${pendingAction.vendor.name} ${pendingAction.status}.`);
      setPendingAction(null);
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
      setPendingAction(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-h1 font-bold text-text">Vendors</h1>
      <p className="mt-1 text-small text-text-muted">Approve, suspend, or reinstate vendors on the platform.</p>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !vendors || vendors.length === 0 ? (
          <EmptyState icon={Store} title="No vendors yet" description="Vendors will show up here once onboarded." />
        ) : (
          vendors.map((vendor) => (
            <div key={vendor.id} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                <Image src={vendor.image} alt={vendor.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-small font-semibold text-text">{vendor.name}</p>
                <p className="truncate text-caption text-text-subtle">
                  {vendor.cuisine} · {vendor.rating.toFixed(1)} ★ ({vendor.reviewCount})
                </p>
              </div>
              <span className={cn("shrink-0 rounded-full px-3 py-1 text-caption font-semibold capitalize", STATUS_CLASSES[vendor.approvalStatus])}>
                {vendor.approvalStatus}
              </span>

              <div className="flex shrink-0 gap-2">
                {vendor.approvalStatus === "pending" && (
                  <button
                    type="button"
                    onClick={() =>
                      setPendingAction({
                        vendor,
                        status: "approved",
                        title: `Approve ${vendor.name}?`,
                        description: "They'll immediately become visible to customers.",
                      })
                    }
                    disabled={isUpdating}
                    className="rounded-md border border-success/30 px-3 py-1.5 text-caption font-semibold text-success transition-colors hover:bg-success-bg"
                  >
                    Approve
                  </button>
                )}
                {vendor.approvalStatus === "approved" && (
                  <button
                    type="button"
                    onClick={() =>
                      setPendingAction({
                        vendor,
                        status: "suspended",
                        title: `Suspend ${vendor.name}?`,
                        description: "They'll disappear from customer browse/search immediately.",
                        destructive: true,
                      })
                    }
                    disabled={isUpdating}
                    className="rounded-md border border-error/30 px-3 py-1.5 text-caption font-semibold text-error transition-colors hover:bg-error-bg"
                  >
                    Suspend
                  </button>
                )}
                {vendor.approvalStatus === "suspended" && (
                  <button
                    type="button"
                    onClick={() =>
                      setPendingAction({
                        vendor,
                        status: "approved",
                        title: `Reinstate ${vendor.name}?`,
                        description: "They'll become visible to customers again.",
                      })
                    }
                    disabled={isUpdating}
                    className="rounded-md border border-success/30 px-3 py-1.5 text-caption font-semibold text-success transition-colors hover:bg-success-bg"
                  >
                    Reinstate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!pendingAction}
        title={pendingAction?.title ?? ""}
        description={pendingAction?.description}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        destructive={pendingAction?.destructive}
        isConfirming={isUpdating}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}
