"use client";

import { useState } from "react";
import { Package } from "@/components/icons";
import { useAuth } from "@/features/auth/hooks";
import { useGetVendorProductsQuery, useUpdateProductMutation } from "@/features/products/productsApi";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";
import type { MenuItem } from "@/features/vendors/types";

function InventoryRow({ vendorId, item }: { vendorId: string; item: MenuItem }) {
  const [updateProduct] = useUpdateProductMutation();
  const [stock, setStock] = useState(item.stockQuantity ?? 0);
  const toast = useToast();

  const handleToggleTrack = async (trackInventory: boolean) => {
    try {
      await updateProduct({
        vendorId,
        id: item.id,
        patch: { trackInventory, stockQuantity: trackInventory ? stock : null },
      }).unwrap();
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  const handleStockBlur = async () => {
    if (!item.trackInventory) return;
    try {
      await updateProduct({ vendorId, id: item.id, patch: { stockQuantity: stock } }).unwrap();
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-small font-semibold text-text">{item.name}</p>
        <p className="text-caption text-text-subtle">{item.category}</p>
      </div>

      <label className="flex shrink-0 items-center gap-2 text-caption font-semibold text-text-muted">
        <input
          type="checkbox"
          checked={!!item.trackInventory}
          onChange={(e) => handleToggleTrack(e.target.checked)}
          className="h-4 w-4 accent-[var(--crimson)]"
        />
        Track stock
      </label>

      {item.trackInventory ? (
        <input
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          onBlur={handleStockBlur}
          className="w-20 shrink-0 rounded-md border border-border bg-background px-2.5 py-1.5 text-small text-text outline-none focus:border-primary"
        />
      ) : (
        <span className="shrink-0 text-caption text-text-subtle">Made to order</span>
      )}

      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-caption font-semibold ${
          item.available ? "bg-success-bg text-success" : "bg-error-bg text-error"
        }`}
      >
        {item.available ? "Available" : "Unavailable"}
      </span>
    </div>
  );
}

export default function VendorInventoryPage() {
  const { user } = useAuth();
  const vendorId = user?.vendorId ?? "";
  const { data: products, isLoading } = useGetVendorProductsQuery(vendorId, { skip: !vendorId });

  return (
    <div>
      <h1 className="font-display text-h1 font-bold text-text">Inventory</h1>
      <p className="mt-1 text-small text-text-muted">
        Track stock for items that run out — everything else stays &ldquo;made to order.&rdquo;
      </p>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-black/5" />)
        ) : !products || products.length === 0 ? (
          <EmptyState icon={Package} title="No products yet" description="Add products from the Products page first." />
        ) : (
          products.map((item) => <InventoryRow key={item.id} vendorId={vendorId} item={item} />)
        )}
      </div>
    </div>
  );
}
