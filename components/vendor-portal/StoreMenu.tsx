"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useVendorGuard } from "./useVendorGuard";
import { useGetMenuQuery } from "@/features/restaurants/restaurantsApi";
import {
  useCreateCategoryMutation,
  useCreateExtraMutation,
  useCreateMenuItemMutation,
  useCreateVariantMutation,
  useGetCategoriesQuery,
} from "@/features/vendor/menuApi";
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

export function StoreMenu({ storeId }: { storeId: string }) {
  const { isReady, isSessionLoading, isVendor } = useVendorGuard();

  const { data: categories = [] } = useGetCategoriesQuery(storeId, { skip: !isReady || !isVendor });
  const { data: menuItems = [], isLoading: isLoadingMenu } = useGetMenuQuery(storeId, { skip: !isReady || !isVendor });

  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const [createMenuItem, { isLoading: isCreatingItem }] = useCreateMenuItemMutation();

  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemError, setItemError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof menuItems>();
    for (const item of menuItems) {
      const cat = item.category || "Uncategorized";
      map.set(cat, [...(map.get(cat) ?? []), item]);
    }
    return map;
  }, [menuItems]);

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

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError(null);
    try {
      await createCategory({ restaurantId: storeId, name: categoryName }).unwrap();
      setCategoryName("");
    } catch (err) {
      setCategoryError(normalizeApiError(err as never).message);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setItemError(null);
    try {
      await createMenuItem({
        restaurantId: storeId,
        name: itemName,
        description: itemDescription || undefined,
        price: Number(itemPrice),
        category: itemCategory || undefined,
      }).unwrap();
      setItemName("");
      setItemDescription("");
      setItemPrice("");
      setItemCategory("");
    } catch (err) {
      setItemError(normalizeApiError(err as never).message);
    }
  };

  return (
    <div className="vd-root">
      <Link href={`/vendor/${storeId}`} className="vd-back-link">
        ← Back to store settings
      </Link>

      <header className="vd-header">
        <h1 className="vd-title">Menu</h1>
        <p className="vd-subtitle">
          {menuItems.length} item{menuItems.length !== 1 ? "s" : ""} across {categories.length} categor
          {categories.length !== 1 ? "ies" : "y"}
        </p>
      </header>

      <div className="vd-section">
        <h2 className="vd-section-title">Categories</h2>
        {categories.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {categories.map((c) => (
              <span key={c.id} className="op-badge op-badge--active">
                {c.name}
              </span>
            ))}
          </div>
        )}
        <form onSubmit={handleAddCategory} style={{ display: "flex", gap: 8 }}>
          <input
            className="vd-input"
            placeholder="New category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <button type="submit" className="vd-submit-btn" style={{ marginTop: 0, flexShrink: 0, width: "auto", padding: "11px 20px" }} disabled={isCreatingCategory || !categoryName.trim()}>
            Add
          </button>
        </form>
        {categoryError && <p className="vd-error" style={{ marginTop: 8 }}>{categoryError}</p>}
      </div>

      <div className="vd-section">
        <h2 className="vd-section-title">Add a menu item</h2>
        <form onSubmit={handleAddItem}>
          <div className="vd-field">
            <label htmlFor="item-name">Name</label>
            <input id="item-name" className="vd-input" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
          </div>
          <div className="vd-field">
            <label htmlFor="item-desc">Description</label>
            <input id="item-desc" className="vd-input" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} />
          </div>
          <div className="vd-field-row">
            <div className="vd-field">
              <label htmlFor="item-price">Price (₦)</label>
              <input id="item-price" type="number" min={0} className="vd-input" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} required />
            </div>
            <div className="vd-field">
              <label htmlFor="item-cat">Category</label>
              <select id="item-cat" className="vd-select" value={itemCategory} onChange={(e) => setItemCategory(e.target.value)}>
                <option value="">Main</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {itemError && <p className="vd-error">{itemError}</p>}
          <button type="submit" className="vd-submit-btn" disabled={isCreatingItem || !itemName.trim() || !itemPrice}>
            {isCreatingItem ? "Adding…" : "Add menu item"}
          </button>
        </form>
      </div>

      <div className="vd-section">
        <h2 className="vd-section-title">Current menu</h2>
        {isLoadingMenu ? (
          <p className="vp-empty">Loading menu…</p>
        ) : menuItems.length === 0 ? (
          <p className="vp-empty">No menu items yet — add your first one above.</p>
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
    </div>
  );
}
