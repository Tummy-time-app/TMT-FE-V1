"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks";
import {
  useGetMyStoresQuery,
  useUpdateStoreProfileMutation,
  useUpdateStoreStatusMutation,
} from "@/features/vendor/vendorApi";
import type { BusinessType, StoreStatus } from "@/features/vendor/types";
import { normalizeApiError } from "@/lib/utils/apiError";

const DAYS: { key: string; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: "restaurant", label: "Restaurant" },
  { value: "grocery", label: "Grocery" },
  { value: "retail", label: "Retail" },
  { value: "market", label: "Market stall" },
  { value: "other", label: "Other" },
];

interface FormState {
  name: string;
  businessType: BusinessType;
  businessCategory: string;
  ownerName: string;
  address: string;
  landmark: string;
  additionalDirections: string;
  state: string;
  city: string;
  phone: string;
  email: string;
  cuisine: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  averagePrepTime: string;
  minimumOrder: string;
  openingHours: Record<string, string>;
  verificationBusinessId: string;
  verificationGovId: string;
  verificationRegDoc: string;
  verificationBankDetails: string;
  /** One URL per line — parsed to an array on submit. */
  verificationStoreImages: string;
}

const emptyForm: FormState = {
  name: "",
  businessType: "restaurant",
  businessCategory: "",
  ownerName: "",
  address: "",
  landmark: "",
  additionalDirections: "",
  state: "",
  city: "",
  phone: "",
  email: "",
  cuisine: "",
  description: "",
  logoUrl: "",
  coverImageUrl: "",
  averagePrepTime: "",
  minimumOrder: "",
  openingHours: {},
  verificationBusinessId: "",
  verificationGovId: "",
  verificationRegDoc: "",
  verificationBankDetails: "",
  verificationStoreImages: "",
};

/** Rendered inside VendorStoreShell, which already guarantees a signed-in vendor before mounting this. */
export function StoreSettings({ storeId }: { storeId: string }) {
  const { user } = useAuth();
  const { data: stores = [], isLoading } = useGetMyStoresQuery(user?.id ?? "", { skip: !user });
  const store = stores.find((s) => s.id === storeId);

  const [updateProfile, { isLoading: isSaving }] = useUpdateStoreProfileMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateStoreStatusMutation();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!store) return;
    const docs = store.verificationDocs ?? {};
    setForm({
      name: store.name ?? "",
      businessType: store.businessType ?? "restaurant",
      businessCategory: store.businessCategory ?? "",
      ownerName: store.ownerName ?? "",
      address: store.address ?? "",
      landmark: store.landmark ?? "",
      additionalDirections: store.additionalDirections ?? "",
      state: store.state ?? "",
      city: store.city ?? "",
      phone: store.phone ?? "",
      email: store.email ?? "",
      cuisine: store.cuisine ?? "",
      description: store.description ?? "",
      logoUrl: store.logoUrl ?? "",
      coverImageUrl: store.coverImageUrl ?? "",
      averagePrepTime: store.averagePrepTime != null ? String(store.averagePrepTime) : "",
      minimumOrder: store.minimumOrder != null ? String(store.minimumOrder) : "",
      openingHours: store.openingHours ?? {},
      verificationBusinessId: docs.businessId ?? "",
      verificationGovId: docs.govId ?? "",
      verificationRegDoc: docs.regDoc ?? "",
      verificationBankDetails: docs.bankDetails ?? "",
      verificationStoreImages: docs.storeImages?.join("\n") ?? "",
    });
  }, [store]);

  const patch = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const patchDay = (day: string, value: string) => {
    setForm((prev) => ({ ...prev, openingHours: { ...prev.openingHours, [day]: value } }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const openingHoursEntries = Object.entries(form.openingHours).filter(([, v]) => v.trim());
    const storeImages = form.verificationStoreImages
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const hasVerificationDocs =
      form.verificationBusinessId || form.verificationGovId || form.verificationRegDoc || form.verificationBankDetails || storeImages.length > 0;

    try {
      await updateProfile({
        id: storeId,
        patch: {
          name: form.name,
          businessType: form.businessType,
          businessCategory: form.businessCategory || undefined,
          ownerName: form.ownerName || undefined,
          address: form.address,
          landmark: form.landmark || undefined,
          additionalDirections: form.additionalDirections || undefined,
          state: form.state || undefined,
          city: form.city || undefined,
          phone: form.phone || undefined,
          email: form.email || undefined,
          cuisine: form.cuisine || undefined,
          description: form.description || undefined,
          logoUrl: form.logoUrl || undefined,
          coverImageUrl: form.coverImageUrl || undefined,
          averagePrepTime: form.averagePrepTime ? Number(form.averagePrepTime) : undefined,
          minimumOrder: form.minimumOrder ? Number(form.minimumOrder) : undefined,
          openingHours: openingHoursEntries.length ? Object.fromEntries(openingHoursEntries) : undefined,
          verificationDocs: hasVerificationDocs
            ? {
                businessId: form.verificationBusinessId || undefined,
                govId: form.verificationGovId || undefined,
                regDoc: form.verificationRegDoc || undefined,
                bankDetails: form.verificationBankDetails || undefined,
                storeImages: storeImages.length ? storeImages : undefined,
              }
            : undefined,
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

  if (isLoading) {
    return <p className="vp-empty">Loading store…</p>;
  }

  if (!store) {
    return (
      <div className="vp-empty">
        <p className="vp-empty-title">Store not found</p>
      </div>
    );
  }

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">{store.name}</h1>
        <p className="vd-subtitle">
          {store.verificationStatus === "VERIFIED"
            ? "Verified"
            : store.verificationStatus === "REJECTED"
              ? "Verification rejected"
              : "Verification pending"}
        </p>
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
          <h2 className="vd-section-title">Business details</h2>
          <div className="vd-field-row">
            <div className="vd-field">
              <label htmlFor="businessType">Business type</label>
              <select
                id="businessType"
                className="vd-select"
                value={form.businessType}
                onChange={(e) => patch("businessType", e.target.value)}
              >
                {BUSINESS_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="vd-field">
              {/* For a "market" stall, this doubles as the market's name (e.g. "Mile 12 Fresh Market") — see the marketplace-expansion implementation plan; stalls sharing that name are grouped together on the customer-facing Markets page. */}
              <label htmlFor="businessCategory">{form.businessType === "market" ? "Market name" : "Category"}</label>
              <input
                id="businessCategory"
                className="vd-input"
                placeholder={form.businessType === "market" ? "e.g. Mile 12 Fresh Market" : undefined}
                value={form.businessCategory}
                onChange={(e) => patch("businessCategory", e.target.value)}
              />
            </div>
          </div>
          <div className="vd-field">
            <label htmlFor="ownerName">Owner name</label>
            <input id="ownerName" className="vd-input" value={form.ownerName} onChange={(e) => patch("ownerName", e.target.value)} />
          </div>
        </div>

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
          <div className="vd-field">
            <label htmlFor="additionalDirections">Additional directions</label>
            <textarea
              id="additionalDirections"
              className="vd-textarea"
              value={form.additionalDirections}
              onChange={(e) => patch("additionalDirections", e.target.value)}
              placeholder="Anything that helps a rider find you — gate color, floor number, etc."
            />
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
          <h2 className="vd-section-title">Branding</h2>
          <p className="vd-subtitle" style={{ marginTop: -4, marginBottom: 12 }}>
            Paste a hosted image URL — there&apos;s no upload here yet.
          </p>
          <div className="vd-field-row">
            <div className="vd-field">
              <label htmlFor="logoUrl">Logo URL</label>
              <input id="logoUrl" className="vd-input" value={form.logoUrl} onChange={(e) => patch("logoUrl", e.target.value)} />
              {form.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary external URL, not a served asset
                <img src={form.logoUrl} alt="" className="vd-image-preview" />
              )}
            </div>
            <div className="vd-field">
              <label htmlFor="coverImageUrl">Cover image URL</label>
              <input
                id="coverImageUrl"
                className="vd-input"
                value={form.coverImageUrl}
                onChange={(e) => patch("coverImageUrl", e.target.value)}
              />
              {form.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary external URL, not a served asset
                <img src={form.coverImageUrl} alt="" className="vd-image-preview" />
              )}
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

        <div className="vd-section">
          <h2 className="vd-section-title">Opening hours</h2>
          {DAYS.map((day) => (
            <div className="vd-field" key={day.key}>
              <label htmlFor={`hours-${day.key}`}>{day.label}</label>
              <input
                id={`hours-${day.key}`}
                className="vd-input"
                placeholder="e.g. 8:00 AM - 10:00 PM"
                value={form.openingHours[day.key] ?? ""}
                onChange={(e) => patchDay(day.key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="vd-section">
          <h2 className="vd-section-title">Verification documents</h2>
          <p className="vd-subtitle" style={{ marginTop: -4, marginBottom: 12 }}>
            Free-form for now — paste references or hosted document URLs.
          </p>
          <div className="vd-field-row">
            <div className="vd-field">
              <label htmlFor="verBusinessId">Business ID</label>
              <input
                id="verBusinessId"
                className="vd-input"
                value={form.verificationBusinessId}
                onChange={(e) => patch("verificationBusinessId", e.target.value)}
              />
            </div>
            <div className="vd-field">
              <label htmlFor="verGovId">Government ID</label>
              <input id="verGovId" className="vd-input" value={form.verificationGovId} onChange={(e) => patch("verificationGovId", e.target.value)} />
            </div>
          </div>
          <div className="vd-field-row">
            <div className="vd-field">
              <label htmlFor="verRegDoc">Registration document</label>
              <input id="verRegDoc" className="vd-input" value={form.verificationRegDoc} onChange={(e) => patch("verificationRegDoc", e.target.value)} />
            </div>
            <div className="vd-field">
              <label htmlFor="verBankDetails">Bank details</label>
              <input
                id="verBankDetails"
                className="vd-input"
                value={form.verificationBankDetails}
                onChange={(e) => patch("verificationBankDetails", e.target.value)}
              />
            </div>
          </div>
          <div className="vd-field">
            <label htmlFor="verStoreImages">Store images (one URL per line)</label>
            <textarea
              id="verStoreImages"
              className="vd-textarea"
              value={form.verificationStoreImages}
              onChange={(e) => patch("verificationStoreImages", e.target.value)}
            />
          </div>
        </div>

        {error && <p className="vd-error">{error}</p>}
        {saved && <p className="vd-success">Saved!</p>}

        <button type="submit" className="vd-submit-btn" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </>
  );
}
