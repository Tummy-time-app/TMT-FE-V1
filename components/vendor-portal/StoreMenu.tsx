"use client";

import { useMemo, useState } from "react";
import { useGetMenuQuery } from "@/features/restaurants/restaurantsApi";
import { useCreateExtraMutation, useCreateVariantMutation, useGetCategoriesQuery } from "@/features/vendor/menuApi";
import type { ProductExtra, ProductVariant } from "@/features/vendor/types";
import { normalizeApiError } from "@/lib/utils/apiError";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

/** Per-item "+ Size" / "+ Extra" mini-forms. No GET endpoint exists for
 *  variants/extras on the real backend, so what's shown here is only
 *  what's been added this session — an honest reflection of what the
 *  backend actually supports, not a UI limitation. */
function ItemExtras({ menuItemId }: { menuItemId: string }) {
  const [createVariant] = useCreateVariantMutation();
  const [createExtra] = useCreateExtraMutation();
  const [open, setOpen] = useState<"variant" | "extra" | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [required, setRequired] = useState(false);
  const [added, setAdded] = useState<(ProductVariant | ProductExtra)[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setOpen(null);
    setName("");
    setPrice("");
    setRequired(false);
  };

  const handleAdd = async () => {
    setError(null);
    try {
      if (open === "variant") {
        const variant = await createVariant({ menuItemId, name, price: Number(price) }).unwrap();
        setAdded((prev) => [...prev, variant]);
      } else if (open === "extra") {
        const extra = await createExtra({ menuItemId, name, price: Number(price), isRequired: required }).unwrap();
        setAdded((prev) => [...prev, extra]);
      }
      reset();
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  return (
    <div style={{ marginTop: 8 }}>
      {added.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
          {added.map((a) => (
            <span key={a.id} className="op-badge op-badge--pending">
              {a.name} · {formatNaira(Number(a.price))}
            </span>
          ))}
        </div>
      )}

      {open ? (
        <div className="vd-field-row" style={{ alignItems: "end" }}>
          <input
            className="vd-input"
            placeholder={open === "variant" ? "Size name (e.g. Large)" : "Extra name (e.g. Extra cheese)"}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="vd-input"
            type="number"
            min={0}
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          {open === "extra" && (
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "#777" }}>
              <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
              Required
            </label>
          )}
          <button type="button" className="vd-submit-btn" style={{ marginTop: 0 }} onClick={handleAdd} disabled={!name.trim() || !price}>
            Add
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="vd-back-link" onClick={() => setOpen("variant")}>
            + Size
          </button>
          <button type="button" className="vd-back-link" onClick={() => setOpen("extra")}>
            + Extra
          </button>
        </div>
      )}
      {error && <p className="vd-error">{error}</p>}
    </div>
  );
}

/**
 * "All Menus" — the Menu section's default/index view (secondary link
 * under the Menu primary nav item; see VendorStoreShell.tsx). Item
 * creation moved to StoreMenuNew.tsx, availability editing to
 * StoreMenuEdit.tsx — this is read-focused, listing what already exists.
 *
 * Rendered inside VendorStoreShell, which already guarantees a signed-in
 * vendor before mounting this.
 */
export function StoreMenu({ storeId }: { storeId: string }) {
  const { data: menuItems = [], isLoading: isLoadingMenu } = useGetMenuQuery(storeId);
  const { data: categories = [] } = useGetCategoriesQuery(storeId);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof menuItems>();
    for (const item of menuItems) {
      const cat = item.category || "Uncategorized";
      map.set(cat, [...(map.get(cat) ?? []), item]);
    }
    return map;
  }, [menuItems]);

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">All Menus</h1>
        <p className="vd-subtitle">
          {menuItems.length} item{menuItems.length !== 1 ? "s" : ""} across {categories.length} categor
          {categories.length !== 1 ? "ies" : "y"}
        </p>
      </header>

      <div className="vd-section">
        {isLoadingMenu ? (
          <p className="vp-empty">Loading menu…</p>
        ) : menuItems.length === 0 ? (
          <div className="vp-empty">
            <p className="vp-empty-title">No menu items yet</p>
            <p className="vp-empty-sub">Add your first one from New Menu.</p>
          </div>
        ) : (
          Array.from(grouped.entries()).map(([category, items]) => (
            <div key={category} style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "#999", marginBottom: 8 }}>{category}</p>
              {items.map((item) => (
                <div key={item.id} className="op-item-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <div>
                      <p className="op-item-row__name">{item.name}</p>
                      {item.description && <p className="op-item-row__qty">{item.description}</p>}
                    </div>
                    <span className="op-item-row__price">{formatNaira(Number(item.price))}</span>
                  </div>
                  <ItemExtras menuItemId={item.id} />
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </>
  );
}
