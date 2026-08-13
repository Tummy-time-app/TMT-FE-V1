"use client";

import { useState } from "react";
import { MapPin, Plus, Star, StarSolid, Trash2, Pencil } from "@/components/icons";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/features/auth/hooks";
import {
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useUpdateAddressMutation,
} from "@/features/addresses/addressesApi";
import { formatAddressLine, type Address, type CreateAddressPayload } from "@/features/addresses/types";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";

/** Lagos-centered jitter — stands in for a real map picker (no Google Maps key required to use this page). */
function placeholderCoords() {
  return { lat: 6.45 + (Math.random() - 0.5) * 0.08, lng: 3.4 + (Math.random() - 0.5) * 0.08 };
}

const EMPTY_FORM: CreateAddressPayload = { label: "", line1: "", line2: "", city: "", state: "Lagos", lat: 0, lng: 0 };

function AddressForm({
  initial,
  onCancel,
  onSubmit,
  isSubmitting,
}: {
  initial: CreateAddressPayload;
  onCancel: () => void;
  onSubmit: (values: CreateAddressPayload) => void;
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState("");

  const set = <K extends keyof CreateAddressPayload>(key: K, value: CreateAddressPayload[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.label.trim() || !values.line1.trim() || !values.city.trim() || !values.state.trim()) {
      setError("Fill in every field.");
      return;
    }
    setError("");
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 rounded-lg border border-border bg-surface p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-caption font-semibold text-text-muted">Label</label>
          <input
            value={values.label}
            onChange={(e) => set("label", e.target.value)}
            placeholder="Home, Office…"
            className="mt-1 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          />
        </div>
        <div>
          <label className="text-caption font-semibold text-text-muted">Street address</label>
          <input
            value={values.line1}
            onChange={(e) => set("line1", e.target.value)}
            placeholder="23 Awolowo Road"
            className="mt-1 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          />
        </div>
        <div>
          <label className="text-caption font-semibold text-text-muted">City</label>
          <input
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="Ikoyi"
            className="mt-1 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          />
        </div>
        <div>
          <label className="text-caption font-semibold text-text-muted">State</label>
          <input
            value={values.state}
            onChange={(e) => set("state", e.target.value)}
            placeholder="Lagos"
            className="mt-1 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-small font-semibold text-error">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-5 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Saving…" : "Save address"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border px-5 py-2.5 text-small font-semibold text-text-muted transition-colors hover:border-primary/40"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddressesContent() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const toast = useToast();

  const { data: addresses, isLoading, error, refetch } = useGetAddressesQuery(userId, { skip: !userId });
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);

  const handleCreate = async (values: CreateAddressPayload) => {
    try {
      const coords = placeholderCoords();
      await createAddress({ userId, payload: { ...values, lat: coords.lat, lng: coords.lng } }).unwrap();
      toast.success("Address saved.");
      setShowForm(false);
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  const handleUpdate = async (values: CreateAddressPayload) => {
    if (!editing) return;
    try {
      await updateAddress({ userId, payload: { id: editing.id, ...values } }).unwrap();
      toast.success("Address updated.");
      setEditing(null);
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  const handleSetDefault = async (address: Address) => {
    try {
      await updateAddress({ userId, payload: { id: address.id, isDefault: true } }).unwrap();
      toast.success(`${address.label} set as default.`);
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAddress({ userId, id: deleteTarget.id }).unwrap();
      toast.success("Address removed.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-h1 font-bold text-text">Addresses</h1>
          <p className="mt-1 text-small text-text-muted">Manage the delivery addresses you order to.</p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark"
          >
            <Plus size={15} aria-hidden />
            Add address
          </button>
        )}
      </div>

      {showForm && (
        <AddressForm initial={EMPTY_FORM} onCancel={() => setShowForm(false)} onSubmit={handleCreate} isSubmitting={isCreating} />
      )}

      <div className="mt-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !addresses || addresses.length === 0 ? (
          <EmptyState icon={MapPin} title="No saved addresses" description="Add one so checkout can skip straight to payment next time." />
        ) : (
          addresses.map((address) =>
            editing?.id === address.id ? (
              <AddressForm
                key={address.id}
                initial={address}
                onCancel={() => setEditing(null)}
                onSubmit={handleUpdate}
                isSubmitting={false}
              />
            ) : (
              <div key={address.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin size={16} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-small font-semibold text-text">{address.label}</p>
                    {address.isDefault && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-caption font-semibold text-primary">Default</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-caption text-text-subtle">{formatAddressLine(address)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(address)}
                      aria-label={`Set ${address.label} as default`}
                      title="Set as default"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-text-subtle transition-colors hover:bg-black/5 hover:text-secondary"
                    >
                      <Star size={15} aria-hidden />
                    </button>
                  )}
                  {address.isDefault && (
                    <span className="flex h-8 w-8 items-center justify-center text-secondary" aria-hidden>
                      <StarSolid size={15} />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditing(address)}
                    aria-label={`Edit ${address.label}`}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-text-subtle transition-colors hover:bg-black/5 hover:text-primary"
                  >
                    <Pencil size={15} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(address)}
                    aria-label={`Delete ${address.label}`}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-text-subtle transition-colors hover:bg-error-bg hover:text-error"
                  >
                    <Trash2 size={15} aria-hidden />
                  </button>
                </div>
              </div>
            )
          )
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.label}"?`}
        description="You can always add it again later."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  );
}

export default function AddressesPage() {
  return (
    <RequireAuth>
      <AddressesContent />
    </RequireAuth>
  );
}
