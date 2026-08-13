"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store } from "@/components/icons";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/features/auth/hooks";
import { useCreateVendorMutation } from "@/features/vendors/vendorsApi";
import { CATEGORIES } from "@/lib/vendordata";
import { DEFAULT_MAP_CENTER } from "@/lib/maps/config";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";

const CATEGORY_OPTIONS = CATEGORIES.filter((c) => c.id !== "all");

function jitteredCenterCoords() {
  return {
    lat: DEFAULT_MAP_CENTER.lat + (Math.random() - 0.5) * 0.05,
    lng: DEFAULT_MAP_CENTER.lng + (Math.random() - 0.5) * 0.05,
  };
}

function OnboardingForm() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [createVendor, { isLoading }] = useCreateVendorMutation();

  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim() || !cuisine.trim() || !category) {
      setError("Fill in every field.");
      return;
    }
    setError("");
    try {
      await createVendor({
        ownerId: user.id,
        payload: {
          name: name.trim(),
          cuisine: cuisine.trim(),
          category,
          businessType: "restaurant",
          description: description.trim(),
          image: image.trim() || "/images/restaurant.jpg",
          location: jitteredCenterCoords(),
        },
      }).unwrap();
      toast.success("Store created — pending admin approval.");
      router.push("/vendor");
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Store size={26} aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-h1 font-bold text-text">Set up your store</h1>
        <p className="mt-1 text-small text-text-muted">
          Tell us about your business — an admin reviews every new store before it goes live.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-lg border border-border bg-surface p-6">
        <div>
          <label className="text-caption font-semibold text-text-muted">Store name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mama's Kitchen"
            className="mt-1 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          />
        </div>

        <div>
          <label className="text-caption font-semibold text-text-muted">Cuisine</label>
          <input
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            placeholder="Nigerian, Continental…"
            className="mt-1 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          />
        </div>

        <div>
          <label className="text-caption font-semibold text-text-muted">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-caption font-semibold text-text-muted">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What makes your food worth ordering?"
            rows={3}
            className="mt-1 w-full resize-none rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          />
        </div>

        <div>
          <label className="text-caption font-semibold text-text-muted">Cover image URL (optional)</label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="/images/restaurant.jpg"
            className="mt-1 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          />
        </div>

        {error && <p className="text-small font-semibold text-error">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-primary px-5 py-3 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Creating your store…" : "Create store"}
        </button>
      </form>
    </main>
  );
}

export default function VendorOnboardingPage() {
  return (
    <RequireAuth allowedRoles={["vendor"]}>
      <OnboardingForm />
    </RequireAuth>
  );
}
