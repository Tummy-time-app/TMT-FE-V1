"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Plus, Trash2, UtensilsCrossed } from "@/components/icons";
import { useAuth } from "@/features/auth/hooks";
import { useDeleteProductMutation, useGetVendorProductsQuery, useUpdateProductMutation } from "@/features/products/productsApi";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

export default function VendorProductsPage() {
  const { user } = useAuth();
  const vendorId = user?.vendorId ?? "";
  const { data: products, isLoading, error, refetch } = useGetVendorProductsQuery(vendorId, { skip: !vendorId });
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const toast = useToast();

  const handleToggleAvailable = async (id: number, available: boolean) => {
    try {
      await updateProduct({ vendorId, id, patch: { available: !available } }).unwrap();
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct({ vendorId, id: deleteTarget.id }).unwrap();
      toast.success(`${deleteTarget.name} removed.`);
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
          <h1 className="font-display text-h1 font-bold text-text">Products</h1>
          <p className="mt-1 text-small text-text-muted">Manage your menu and availability.</p>
        </div>
        <Link
          href="/vendor/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          <Plus size={16} aria-hidden />
          Add product
        </Link>
      </div>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !products || products.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="No products yet"
            description="Add your first menu item to start taking orders."
          />
        ) : (
          products.map((product) => (
            <div key={product.id} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
                <Image src={product.image} alt={product.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-small font-semibold text-text">{product.name}</p>
                <p className="text-caption text-text-subtle">
                  {product.category} · {formatNaira(product.price)}
                </p>
              </div>

              <label className="flex shrink-0 items-center gap-2 text-caption font-semibold text-text-muted">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--crimson)]"
                  checked={product.available}
                  onChange={() => handleToggleAvailable(product.id, product.available)}
                />
                Available
              </label>

              <Link
                href={`/vendor/products/${product.id}`}
                aria-label={`Edit ${product.name}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:border-primary hover:text-primary"
              >
                <Pencil size={15} aria-hidden />
              </Link>
              <button
                type="button"
                aria-label={`Delete ${product.name}`}
                onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
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
        title={`Delete ${deleteTarget?.name}?`}
        description="This removes it from your menu immediately. This can't be undone."
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
