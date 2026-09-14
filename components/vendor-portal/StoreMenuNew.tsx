"use client";

import Link from "next/link";
import { useState } from "react";
import {
  useCreateCategoryMutation,
  useCreateMenuItemMutation,
  useGetCategoriesQuery,
} from "@/features/vendor/menuApi";
import { normalizeApiError } from "@/lib/utils/apiError";

/**
 * "New Menu" — secondary link under the Menu primary nav item (see
 * VendorStoreShell.tsx), split out of what used to be one combined
 * StoreMenu.tsx: category management + the add-item form, both creation
 * flows. Listing/editing existing items live in StoreMenu.tsx (All
 * Menus) and StoreMenuEdit.tsx instead.
 *
 * Rendered inside VendorStoreShell, which already guarantees a signed-in
 * vendor before mounting this.
 */
export function StoreMenuNew({ storeId }: { storeId: string }) {
  const { data: categories = [] } = useGetCategoriesQuery(storeId);
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const [createMenuItem, { isLoading: isCreatingItem }] = useCreateMenuItemMutation();

  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemError, setItemError] = useState<string | null>(null);
  const [itemAdded, setItemAdded] = useState(false);

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
    setItemAdded(false);
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
      setItemAdded(true);
    } catch (err) {
      setItemError(normalizeApiError(err as never).message);
    }
  };

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">New Menu</h1>
        <p className="vd-subtitle">Add categories and menu items.</p>
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
          <button
            type="submit"
            className="vd-submit-btn"
            style={{ marginTop: 0, flexShrink: 0, width: "auto", padding: "11px 20px" }}
            disabled={isCreatingCategory || !categoryName.trim()}
          >
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
          {itemAdded && <p className="vd-success">Added! Find it in All Menus.</p>}
          <button type="submit" className="vd-submit-btn" disabled={isCreatingItem || !itemName.trim() || !itemPrice}>
            {isCreatingItem ? "Adding…" : "Add menu item"}
          </button>
        </form>
      </div>

      <Link href={`/vendor/${storeId}/menu`} className="vd-back-link">
        View all menus →
      </Link>
    </>
  );
}
