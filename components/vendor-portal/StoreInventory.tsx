"use client";

import Link from "next/link";
import { useState } from "react";
import { useVendorGuard } from "./useVendorGuard";
import { useGetInventoryQuery, useUpdateStockMutation } from "@/features/vendor/inventoryApi";
import type { VendorMenuItem } from "@/features/vendor/types";
import { normalizeApiError } from "@/lib/utils/apiError";

function StockRow({ item, restaurantId }: { item: VendorMenuItem; restaurantId: string }) {
  const [updateStock, { isLoading }] = useUpdateStockMutation();
  const { refetch } = useGetInventoryQuery(restaurantId);
  const [qty, setQty] = useState(String(item.stockQuantity ?? 0));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const badgeTone = item.stockStatus === "AVAILABLE" ? "success" : item.stockStatus === "LOW_STOCK" ? "pending" : "stopped";

  const handleSave = async () => {
    setError(null);
    setSaved(false);
    try {
      await updateStock({ menuItemId: item.id, stockQuantity: Number(qty) }).unwrap();
      setSaved(true);
      refetch();
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  return (
    <div className="op-item-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <div>
          <p className="op-item-row__name">{item.name}</p>
          <p className="op-item-row__qty">Alert below {item.lowStockThreshold ?? 10} units</p>
        </div>
        <span className={`op-badge op-badge--${badgeTone}`}>{item.stockStatus.replace(/_/g, " ")}</span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="number"
          min={0}
          className="vd-input"
          style={{ maxWidth: 120 }}
          value={qty}
          onChange={(e) => {
            setQty(e.target.value);
            setSaved(false);
          }}
        />
        <button
          type="button"
          className="vd-submit-btn"
          style={{ marginTop: 0, width: "auto", padding: "10px 18px" }}
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving…" : "Update"}
        </button>
        {saved && <span className="vd-success" style={{ marginBottom: 0 }}>Saved!</span>}
      </div>
      {error && <p className="vd-error" style={{ marginBottom: 0 }}>{error}</p>}
    </div>
  );
}

export function StoreInventory({ storeId }: { storeId: string }) {
  const { isReady, isSessionLoading, isVendor } = useVendorGuard();
  const { data, isLoading, isError } = useGetInventoryQuery(storeId, { skip: !isReady || !isVendor });

  if (isSessionLoading || !isReady) {
    return (
      <div className="vd-root">
        <p className="vp-empty">Loading…</p>
      </div>
    );
  }

  if (!isVendor) {
    return (
      <div className="vd-root">
        <div className="vp-empty">
          <p className="vp-empty-title">This isn&apos;t a vendor account</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vd-root">
      <Link href={`/vendor/${storeId}`} className="vd-back-link">
        ← Back to store settings
      </Link>

      <header className="vd-header">
        <h1 className="vd-title">Inventory</h1>
        <p className="vd-subtitle">Stock levels across your menu</p>
      </header>

      {isLoading ? (
        <p className="vp-empty">Loading inventory…</p>
      ) : isError ? (
        <div className="vp-empty">
          <div className="vp-empty-icon">⚠️</div>
          <p className="vp-empty-title">Couldn&apos;t load inventory</p>
          <p className="vp-empty-sub">Please check your connection and try again.</p>
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="vp-empty">
          <p className="vp-empty-title">No menu items yet</p>
          <p className="vp-empty-sub">Add items to your menu before tracking stock.</p>
          <Link href={`/vendor/${storeId}/menu`} className="vp-empty-cta">
            Manage menu
          </Link>
        </div>
      ) : (
        <>
          <div className="vd-field-row" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 24 }}>
            {[
              { label: "Total", value: data.summary.total },
              { label: "Available", value: data.summary.available },
              { label: "Low stock", value: data.summary.lowStock },
              { label: "Out of stock", value: data.summary.outOfStock },
            ].map((stat) => (
              <div key={stat.label} className="vd-form-card" style={{ padding: "14px 16px", textAlign: "center" }}>
                <p className="vd-title" style={{ fontSize: "1.4rem" }}>{stat.value}</p>
                <p className="vd-subtitle" style={{ marginTop: 0 }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="vd-section">
            <h2 className="vd-section-title">Menu items</h2>
            {data.items.map((item) => (
              <StockRow key={item.id} item={item} restaurantId={storeId} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
