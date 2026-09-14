"use client";

import { useState } from "react";
import { useGetMenuQuery } from "@/features/restaurants/restaurantsApi";
import { useUpdateStockMutation } from "@/features/vendor/inventoryApi";
import type { MenuItem } from "@/features/restaurants/types";
import { normalizeApiError } from "@/lib/utils/apiError";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function EditableItemRow({ item, storeId }: { item: MenuItem; storeId: string }) {
  const [updateStock, { isLoading }] = useUpdateStockMutation();
  const { refetch } = useGetMenuQuery(storeId);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    setError(null);
    try {
      await updateStock({ menuItemId: item.id, available: !item.available }).unwrap();
      refetch();
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  return (
    <div className="op-item-row">
      <div>
        <p className="op-item-row__name">{item.name}</p>
        <p className="op-item-row__qty">
          {formatNaira(Number(item.price))}
          {item.category ? ` · ${item.category}` : ""}
        </p>
        {error && (
          <p className="vd-error" style={{ marginTop: 4, marginBottom: 0 }}>
            {error}
          </p>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className={`op-badge op-badge--${item.available ? "success" : "stopped"}`}>
          {item.available ? "Available" : "Hidden"}
        </span>
        <button
          type="button"
          className={`vd-switch ${item.available ? "vd-switch--on" : ""}`}
          aria-label={item.available ? "Hide from customers" : "Make available to customers"}
          aria-pressed={item.available}
          onClick={handleToggle}
          disabled={isLoading}
        >
          <span className="vd-switch__thumb" />
        </button>
      </div>
    </div>
  );
}

/**
 * "Edit Menu" — secondary link under the Menu primary nav item (see
 * VendorStoreShell.tsx). Deliberately limited: restaurant-service has no
 * route to change an existing item's name/description/price/category —
 * only `PATCH /menu/:id/stock` exists, which covers stock and
 * `available`. Rather than build a form that implies full editing and
 * silently fails on the fields the backend ignores, this is honestly
 * scoped to the one thing that's real: toggling whether an item is
 * available to customers. Full editing needs a new backend route first.
 *
 * Rendered inside VendorStoreShell, which already guarantees a signed-in
 * vendor before mounting this.
 */
export function StoreMenuEdit({ storeId }: { storeId: string }) {
  const { data: menuItems = [], isLoading } = useGetMenuQuery(storeId);

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">Edit Menu</h1>
        <p className="vd-subtitle">Show or hide items from customers.</p>
      </header>

      <div className="vd-form-card" style={{ marginBottom: 20, background: "rgba(172, 0, 0, 0.04)" }}>
        <p style={{ fontSize: "0.82rem", color: "#777", margin: 0 }}>
          Only availability can be changed here today — renaming an item, changing its price or
          description, or moving it to a different category isn&apos;t supported by the backend yet.
        </p>
      </div>

      <div className="vd-section">
        {isLoading ? (
          <p className="vp-empty">Loading menu…</p>
        ) : menuItems.length === 0 ? (
          <p className="vp-empty">No menu items yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {menuItems.map((item) => (
              <EditableItemRow key={item.id} item={item} storeId={storeId} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
