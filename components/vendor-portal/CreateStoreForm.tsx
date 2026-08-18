"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateStoreMutation } from "@/features/vendor/vendorApi";
import { normalizeApiError } from "@/lib/utils/apiError";

export function CreateStoreForm({ ownerId }: { ownerId: string }) {
  const router = useRouter();
  const [createStore, { isLoading }] = useCreateStoreMutation();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const store = await createStore({ ownerId, name, address, phone, cuisine }).unwrap();
      router.push(`/vendor/${store.id}`);
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  return (
    <div className="vd-form-card">
      <p className="vd-form-card__title">Set up your store</p>
      <p className="vd-form-card__sub">You can fill in the rest of your profile after this.</p>

      <form onSubmit={handleSubmit}>
        <div className="vd-field">
          <label htmlFor="store-name">Restaurant name</label>
          <input
            id="store-name"
            className="vd-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Burger Crafters"
            required
          />
        </div>

        <div className="vd-field">
          <label htmlFor="store-address">Address</label>
          <input
            id="store-address"
            className="vd-input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address"
            required
          />
        </div>

        <div className="vd-field-row">
          <div className="vd-field">
            <label htmlFor="store-phone">Phone</label>
            <input
              id="store-phone"
              className="vd-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="vd-field">
            <label htmlFor="store-cuisine">Cuisine</label>
            <input
              id="store-cuisine"
              className="vd-input"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              placeholder="e.g. Burgers"
            />
          </div>
        </div>

        {error && <p className="vd-error">{error}</p>}

        <button type="submit" className="vd-submit-btn" disabled={isLoading || !name.trim() || !address.trim()}>
          {isLoading ? "Creating…" : "Create store"}
        </button>
      </form>
    </div>
  );
}
