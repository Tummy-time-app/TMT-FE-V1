"use client";

import { useState } from "react";
import { useGetMenuQuery } from "@/features/restaurants/restaurantsApi";
import { useGetPromotionsQuery, useCreatePromotionMutation } from "@/features/vendor/promotionsApi";
import type { Promotion, PromotionDiscountType } from "@/features/vendor/types";
import { normalizeApiError } from "@/lib/utils/apiError";

const DISCOUNT_TYPES: { value: PromotionDiscountType; label: string }[] = [
  { value: "discount", label: "Fixed discount (₦)" },
  { value: "percentage", label: "Percentage off (%)" },
  { value: "buy_one_get_one", label: "Buy one, get one" },
  { value: "free_item", label: "Free item" },
  { value: "free_delivery", label: "Free delivery" },
];

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function discountSummary(promo: Promotion) {
  switch (promo.discountType) {
    case "percentage":
      return `${promo.discountAmount}% off`;
    case "discount":
      return `${formatNaira(Number(promo.discountAmount))} off`;
    case "buy_one_get_one":
      return "Buy one, get one";
    case "free_item":
      return "Free item";
    case "free_delivery":
      return "Free delivery";
  }
}

const STATUS_TONE: Record<Promotion["status"], "active" | "pending" | "stopped"> = {
  active: "active",
  scheduled: "pending",
  expired: "stopped",
};

/** Rendered inside VendorStoreShell, which already guarantees a signed-in vendor before mounting this. */
export function StorePromotions({ storeId }: { storeId: string }) {
  const { data: promotions = [], isLoading, isError } = useGetPromotionsQuery(storeId);
  const { data: menuItems = [] } = useGetMenuQuery(storeId);
  const [createPromotion, { isLoading: isCreating }] = useCreatePromotionMutation();

  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState<PromotionDiscountType>("discount");
  const [discountAmount, setDiscountAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [eligibleIds, setEligibleIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleEligible = (id: string) => {
    setEligibleIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const resetForm = () => {
    setName("");
    setDiscountAmount("");
    setStartDate("");
    setEndDate("");
    setMinOrderAmount("");
    setMaxRedemptions("");
    setEligibleIds([]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createPromotion({
        restaurantId: storeId,
        name,
        discountType,
        discountAmount: Number(discountAmount) || 0,
        eligibleProductIds: eligibleIds.length ? eligibleIds : undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
        maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
      }).unwrap();
      resetForm();
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">Promotions</h1>
        <p className="vd-subtitle">Run deals to bring in more orders.</p>
      </header>

      <div className="vd-section">
        <h2 className="vd-section-title">Active &amp; scheduled</h2>
        {isLoading ? (
          <p className="vp-empty">Loading promotions…</p>
        ) : isError ? (
          <div className="vp-empty">
            <p className="vp-empty-title">Couldn&apos;t load promotions</p>
            <p className="vp-empty-sub">Please check your connection and try again.</p>
          </div>
        ) : promotions.length === 0 ? (
          <p className="vp-empty">No promotions yet — create one below.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {promotions.map((promo) => (
              <div key={promo.id} className="vd-form-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div>
                    <p className="vd-form-card__title" style={{ marginBottom: 2 }}>{promo.name}</p>
                    <p className="vd-form-card__sub" style={{ marginBottom: 0 }}>
                      {discountSummary(promo)} · {formatDate(promo.startDate)} – {formatDate(promo.endDate)}
                    </p>
                  </div>
                  <span className={`op-badge op-badge--${STATUS_TONE[promo.status]}`}>{promo.status}</span>
                </div>
                <p className="vd-subtitle" style={{ marginTop: 10, marginBottom: 0 }}>
                  {promo.eligibleProductIds?.length ? `${promo.eligibleProductIds.length} product(s)` : "Store-wide"}
                  {Number(promo.minOrderAmount) > 0 && ` · Min order ${formatNaira(Number(promo.minOrderAmount))}`}
                  {promo.maxRedemptions ? ` · Max ${promo.maxRedemptions} uses` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="vd-section">
        <h2 className="vd-section-title">Create a promotion</h2>
        <form onSubmit={handleCreate}>
          <div className="vd-field">
            <label htmlFor="promo-name">Name</label>
            <input id="promo-name" className="vd-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="vd-field-row">
            <div className="vd-field">
              <label htmlFor="promo-type">Type</label>
              <select
                id="promo-type"
                className="vd-select"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as PromotionDiscountType)}
              >
                {DISCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="vd-field">
              <label htmlFor="promo-amount">Amount</label>
              <input
                id="promo-amount"
                type="number"
                min={0}
                className="vd-input"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="vd-field-row">
            <div className="vd-field">
              <label htmlFor="promo-start">Start date</label>
              <input id="promo-start" type="date" className="vd-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div className="vd-field">
              <label htmlFor="promo-end">End date</label>
              <input id="promo-end" type="date" className="vd-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>

          <div className="vd-field-row">
            <div className="vd-field">
              <label htmlFor="promo-min-order">Minimum order (₦, optional)</label>
              <input
                id="promo-min-order"
                type="number"
                min={0}
                className="vd-input"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
              />
            </div>
            <div className="vd-field">
              <label htmlFor="promo-max-redemptions">Max redemptions (optional)</label>
              <input
                id="promo-max-redemptions"
                type="number"
                min={0}
                className="vd-input"
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(e.target.value)}
              />
            </div>
          </div>

          <div className="vd-field">
            <label>Eligible products (leave unchecked for store-wide)</label>
            {menuItems.length === 0 ? (
              <p className="vd-subtitle" style={{ marginTop: 4 }}>Add menu items first to target specific products.</p>
            ) : (
              <div style={{ maxHeight: 180, overflowY: "auto", border: "1.5px solid rgba(172, 0, 0, 0.15)", borderRadius: 10, padding: 10 }}>
                {menuItems.map((item) => (
                  <label key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: "0.85rem" }}>
                    <input type="checkbox" checked={eligibleIds.includes(item.id)} onChange={() => toggleEligible(item.id)} />
                    {item.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && <p className="vd-error">{error}</p>}

          <button type="submit" className="vd-submit-btn" disabled={isCreating || !name.trim() || !startDate || !endDate}>
            {isCreating ? "Creating…" : "Create promotion"}
          </button>
        </form>
      </div>
    </>
  );
}
