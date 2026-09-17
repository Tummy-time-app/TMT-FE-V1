"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "@/features/auth/hooks";
import { useProfile } from "@/lib/ProfileContext";
import {
  useCreateShopperRequestMutation,
  useListMyShopperRequestsQuery,
} from "@/features/personalShopper/personalShopperApi";
import type { ShopperRequest } from "@/features/personalShopper/types";
import { normalizeApiError } from "@/lib/utils/apiError";

const STATUS_TONE: Record<ShopperRequest["status"], string> = {
  submitted: "pending",
  assigned: "active",
  shopping: "active",
  completed: "success",
  cancelled: "stopped",
};

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

const EMPTY_FORM = {
  itemName: "",
  quantity: "1",
  preferredBrand: "",
  budget: "",
  preferredStore: "",
  deliveryAddress: "",
  photoDataUrl: "",
};

/**
 * Blueprint §40-42's Personal Shopper: a request form → status view, no
 * fake shopper photo/rating/ETA UI since there's no real shopper workforce —
 * status only advances through the admin dashboard's manual stand-in (see
 * components/admin-portal/AdminShopperRequestsView.tsx).
 */
export function PersonalShopperView() {
  const router = useRouter();
  const { user, isAuthenticated, isSessionLoading } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/login?redirect=/personal-shopper");
    }
  }, [isSessionLoading, isAuthenticated, router]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [justSubmittedId, setJustSubmittedId] = useState<string | null>(null);
  const [createRequest, { isLoading: isSubmitting }] = useCreateShopperRequestMutation();
  const { data: requests = [], isLoading, isError } = useListMyShopperRequestsQuery(user?.id ?? "", { skip: !user });

  const patch = (update: Partial<typeof EMPTY_FORM>) => setForm((prev) => ({ ...prev, ...update }));

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => patch({ photoDataUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!user) return;
    if (!form.itemName.trim() || !form.deliveryAddress.trim()) {
      setFormError("Item name and delivery address are required.");
      return;
    }
    try {
      const created = await createRequest({
        customerId: user.id,
        itemName: form.itemName.trim(),
        quantity: Number(form.quantity) || 1,
        preferredBrand: form.preferredBrand.trim() || undefined,
        budget: form.budget ? Number(form.budget) : undefined,
        preferredStore: form.preferredStore.trim() || undefined,
        deliveryAddress: form.deliveryAddress.trim(),
        photoDataUrl: form.photoDataUrl || undefined,
      }).unwrap();
      setJustSubmittedId(created.id);
      setForm({ ...EMPTY_FORM, deliveryAddress: form.deliveryAddress });
    } catch (err) {
      setFormError(normalizeApiError(err as never).message);
    }
  };

  if (isSessionLoading || !isAuthenticated) {
    return (
      <main className="ps-root">
        <p className="vp-empty">Loading…</p>
      </main>
    );
  }

  return (
    <main className="ps-root">
      <header className="ps-header">
        <h1 className="ps-title">Personal Shopper</h1>
        <p className="ps-subtitle">Tell us what you need — a TummyTime shopper will pick and deliver it.</p>
      </header>

      {justSubmittedId && (
        <p className="ps-success">
          Request submitted! We&apos;ll assign a shopper shortly — track its status in &quot;My Requests&quot; below.
        </p>
      )}

      <div className="ps-card">
        <form className="ps-form" onSubmit={handleSubmit}>
          <div className="ps-field">
            <label htmlFor="itemName">What do you need?</label>
            <input
              id="itemName"
              type="text"
              placeholder="e.g. Basmati rice, 5kg"
              value={form.itemName}
              onChange={(e) => patch({ itemName: e.target.value })}
              required
            />
          </div>

          <div className="ps-row">
            <div className="ps-field">
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => patch({ quantity: e.target.value })}
              />
            </div>
            <div className="ps-field">
              <label htmlFor="budget">Budget (optional)</label>
              <input
                id="budget"
                type="number"
                min={0}
                placeholder="₦"
                value={form.budget}
                onChange={(e) => patch({ budget: e.target.value })}
              />
            </div>
          </div>

          <div className="ps-row">
            <div className="ps-field">
              <label htmlFor="preferredBrand">Preferred brand (optional)</label>
              <input
                id="preferredBrand"
                type="text"
                value={form.preferredBrand}
                onChange={(e) => patch({ preferredBrand: e.target.value })}
              />
            </div>
            <div className="ps-field">
              <label htmlFor="preferredStore">Preferred store (optional)</label>
              <input
                id="preferredStore"
                type="text"
                value={form.preferredStore}
                onChange={(e) => patch({ preferredStore: e.target.value })}
              />
            </div>
          </div>

          <div className="ps-field">
            <label htmlFor="deliveryAddress">Delivery address</label>
            <input
              id="deliveryAddress"
              type="text"
              placeholder={profile.address.line1 || "Where should we deliver this?"}
              value={form.deliveryAddress}
              onChange={(e) => patch({ deliveryAddress: e.target.value })}
              required
            />
          </div>

          <div className="ps-field">
            <label htmlFor="photo">Photo of the item (optional)</label>
            <input id="photo" type="file" accept="image/*" onChange={handlePhoto} />
            {form.photoDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.photoDataUrl} alt="Item preview" className="ps-photo-preview" />
            )}
          </div>

          {formError && <p className="op-error">{formError}</p>}

          <button type="submit" className="ps-submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit request"}
          </button>
        </form>
      </div>

      <h2 className="ps-section-title">My Requests</h2>

      {isLoading ? (
        <p className="vp-empty">Loading your requests…</p>
      ) : isError ? (
        <div className="vp-empty">
          <p className="vp-empty-title">Couldn&apos;t load your requests</p>
          <p className="vp-empty-sub">Please check your connection and try again.</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="vp-empty">
          <div className="vp-empty-icon">🛍️</div>
          <p className="vp-empty-title">No requests yet</p>
          <p className="vp-empty-sub">Submit one above and it&apos;ll show up here.</p>
        </div>
      ) : (
        <div className="op-list">
          {requests.map((r) => (
            <div key={r.id} className="op-card">
              <div className="op-card__top">
                <div>
                  <p className="op-card__vendor">
                    {r.quantity}× {r.itemName}
                  </p>
                  <p className="op-card__date">{formatDate(r.createdAt)}</p>
                </div>
                <span className={`op-badge op-badge--${STATUS_TONE[r.status]}`}>{r.status}</span>
              </div>
              <p className="op-card__items">
                Delivering to {r.deliveryAddress}
                {r.assignedShopperName && ` · Shopper: ${r.assignedShopperName}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
