"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useVendorGuard } from "./useVendorGuard";
import {
  useGetMyStoresQuery,
  useUpdateStoreProfileMutation,
  useUpdateStoreStatusMutation,
} from "@/features/vendor/vendorApi";
import type { StoreStatus } from "@/features/vendor/types";
import { normalizeApiError } from "@/lib/utils/apiError";

interface FormState {
  name: string;
  address: string;
  landmark: string;
  state: string;
  city: string;
  phone: string;
  email: string;
  cuisine: string;
  description: string;
  averagePrepTime: string;
  minimumOrder: string;
}

const emptyForm: FormState = {
  name: "",
  address: "",
  landmark: "",
  state: "",
  city: "",
  phone: "",
  email: "",
  cuisine: "",
  description: "",
  averagePrepTime: "",
  minimumOrder: "",
};

export function StoreSettings({ storeId }: { storeId: string }) {
  const { user, isReady, isSessionLoading, isVendor } = useVendorGuard();
  const { data: stores = [], isLoading } = useGetMyStoresQuery(user?.id ?? "", {
    skip: !isReady || !isVendor,
  });
  const store = stores.find((s) => s.id === storeId);

  const [updateProfile, { isLoading: isSaving }] = useUpdateStoreProfileMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateStoreStatusMutation();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!store) return;
    setForm({
      name: store.name ?? "",
      address: store.address ?? "",
      landmark: store.landmark ?? "",
      state: store.state ?? "",
      city: store.city ?? "",
      phone: store.phone ?? "",
      email: store.email ?? "",
      cuisine: store.cuisine ?? "",
      description: store.description ?? "",
      averagePrepTime: store.averagePrepTime != null ? String(store.averagePrepTime) : "",
      minimumOrder: store.minimumOrder != null ? String(store.minimumOrder) : "",
    });
  }, [store]);

  const patch = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await updateProfile({
        id: storeId,
        patch: {
          name: form.name,
          address: form.address,
          landmark: form.landmark || undefined,
          state: form.state || undefined,
          city: form.city || undefined,
          phone: form.phone || undefined,
          email: form.email || undefined,
          cuisine: form.cuisine || undefined,
          description: form.description || undefined,
          averagePrepTime: form.averagePrepTime ? Number(form.averagePrepTime) : undefined,
          minimumOrder: form.minimumOrder ? Number(form.minimumOrder) : undefined,
        },
      }).unwrap();
      setSaved(true);
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  const handleStatusChange = async (storeStatus: StoreStatus) => {
    setError(null);
    try {
      await updateStatus({ id: storeId, storeStatus }).unwrap();
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

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
          <Link href="/" className="vp-empty-cta">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="vd-root">
        <p className="vp-empty">Loading store…</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="vd-root">
        <div className="vp-empty">
          <p className="vp-empty-title">Store not found</p>
          <Link href="/vendor" className="vp-empty-cta">
            ← Back to your stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="vd-root">
      <Link href="/vendor" className="vd-back-link">
        ← Back to your stores
      </Link>

      <header className="vd-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 className="vd-title">{store.name}</h1>
          <p className="vd-subtitle">
            {store.verificationStatus === "VERIFIED" ? "Verified" : "Verification pending"}
          </p>
        </div>
        <Link href={`/vendor/${storeId}/menu`} className="vd-submit-btn" style={{ marginTop: 0, width: "auto", padding: "10px 18px", textDecoration: "none", display: "inline-block" }}>
          Manage menu
        </Link>
      </header>

      <div className="vd-section">
        <h2 className="vd-section-title">Store status</h2>
        <div className="vd-field-row" style={{ gridTemplateColumns: "1fr" }}>
          <select
            className="vd-select"
            value={store.storeStatus}
            disabled={isUpdatingStatus}
            onChange={(e) => handleStatusChange(e.target.value as StoreStatus)}
          >
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="TEMPORARILY_CLOSED">Temporarily closed</option>
          </select>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="vd-section">
          <h2 className="vd-section-title">Basic info</h2>
          <div className="vd-field">
            <label htmlFor="name">Restaurant name</label>
            <input id="name" className="vd-input" value={form.name} onChange={(e) => patch("name", e.target.value)} required />
          </div>
          <div className="vd-field">
            <label htmlFor="cuisine">Cuisine</label>
            <input id="cuisine" className="vd-input" value={form.cuisine} onChange={(e) => patch("cuisine", e.target.value)} />
          </div>
          <div className="vd-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className="vd-textarea"
              value={form.description}
              onChange={(e) => patch("description", e.target.value)}
              placeholder="Tell customers what makes your store worth ordering from."
            />
          </div>
        </div>

        <div className="vd-section">
          <h2 className="vd-section-title">Location</h2>
          <div className="vd-field">
            <label htmlFor="address">Address</label>
            <input id="address" className="vd-input" value={form.address} onChange={(e) => patch("address", e.target.value)} required />
          </div>
          <div className="vd-field">
            <label htmlFor="landmark">Landmark</label>
            <input id="landmark" className="vd-input" value={form.landmark} onChange={(e) => patch("landmark", e.target.value)} />
          </div>
          <div className="vd-field-row">
            <div className="vd-field">
              <label htmlFor="city">City</label>
              <input id="city" className="vd-input" value={form.city} onChange={(e) => patch("city", e.target.value)} />
            </div>
            <div className="vd-field">
              <label htmlFor="state">State</label>
              <input id="state" className="vd-input" value={form.state} onChange={(e) => patch("state", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="vd-section">
          <h2 className="vd-section-title">Contact</h2>
          <div className="vd-field-row">
            <div className="vd-field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" className="vd-input" value={form.phone} onChange={(e) => patch("phone", e.target.value)} />
            </div>
            <div className="vd-field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" className="vd-input" value={form.email} onChange={(e) => patch("email", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="vd-section">
          <h2 className="vd-section-title">Operations</h2>
          <div className="vd-field-row">
            <div className="vd-field">
              <label htmlFor="prepTime">Avg. prep time (mins)</label>
              <input
                id="prepTime"
                type="number"
                min={0}
                className="vd-input"
                value={form.averagePrepTime}
                onChange={(e) => patch("averagePrepTime", e.target.value)}
              />
            </div>
            <div className="vd-field">
              <label htmlFor="minOrder">Minimum order (₦)</label>
              <input
                id="minOrder"
                type="number"
                min={0}
                className="vd-input"
                value={form.minimumOrder}
                onChange={(e) => patch("minimumOrder", e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && <p className="vd-error">{error}</p>}
        {saved && <p className="vd-success">Saved!</p>}

        <button type="submit" className="vd-submit-btn" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
