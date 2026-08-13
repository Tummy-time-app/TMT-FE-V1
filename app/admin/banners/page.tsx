"use client";

import { useState } from "react";
import { Picture, Plus, Trash2 } from "@/components/icons";
import {
  useCreateBannerMutation,
  useDeleteBannerMutation,
  useGetAllBannersQuery,
  useUpdateBannerMutation,
} from "@/features/banners/bannersApi";
import type { BannerPlacement, CreateBannerPayload } from "@/features/banners/types";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}
function inAYearInputValue() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

const EMPTY_FORM: CreateBannerPayload = {
  title: "",
  imageUrl: "",
  linkUrl: "/promotions",
  placement: "home",
  isActive: true,
  startsAt: `${todayInputValue()}T00:00:00.000Z`,
  endsAt: `${inAYearInputValue()}T00:00:00.000Z`,
};

const PLACEMENTS: BannerPlacement[] = ["home", "checkout", "search"];

export default function AdminBannersPage() {
  const { data: banners, isLoading, error, refetch } = useGetAllBannersQuery();
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateBannerPayload>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const toast = useToast();

  const set = <K extends keyof CreateBannerPayload>(key: K, value: CreateBannerPayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.imageUrl.trim()) {
      setFormError("Title and image URL are required.");
      return;
    }
    setFormError("");
    try {
      await createBanner(form).unwrap();
      toast.success("Banner created.");
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setFormError(normalizeApiError(err as never).message);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateBanner({ id, isActive: !isActive }).unwrap();
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBanner(deleteTarget.id).unwrap();
      toast.success("Banner deleted.");
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-h1 font-bold text-text">Banners</h1>
          <p className="mt-1 text-small text-text-muted">Promotional banners shown across the app.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          <Plus size={16} aria-hidden />
          New banner
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-5 rounded-lg border border-border bg-surface p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-caption font-semibold text-text-muted">Title</label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="20% off your first order"
                className="mt-1 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-caption font-semibold text-text-muted">Placement</label>
              <select
                value={form.placement}
                onChange={(e) => set("placement", e.target.value as BannerPlacement)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none focus:border-primary"
              >
                {PLACEMENTS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-caption font-semibold text-text-muted">Image URL</label>
              <input
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="/images/jollof-spaghetti.jpg"
                className="mt-1 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none focus:border-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-caption font-semibold text-text-muted">Link URL</label>
              <input
                value={form.linkUrl}
                onChange={(e) => set("linkUrl", e.target.value)}
                placeholder="/promotions"
                className="mt-1 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none focus:border-primary"
              />
            </div>
          </div>

          {formError && <p className="mt-3 text-small font-semibold text-error">{formError}</p>}

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-md bg-primary px-5 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreating ? "Saving…" : "Create banner"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md border border-border px-5 py-2.5 text-small font-semibold text-text-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-2">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !banners || banners.length === 0 ? (
          <EmptyState icon={Picture} title="No banners yet" description="Create one to promote something on the homepage." />
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
              <div className="h-12 w-20 shrink-0 overflow-hidden rounded-md bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-entered URL, see BannerStrip.tsx */}
                <img src={banner.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-small font-semibold text-text">{banner.title}</p>
                <p className="text-caption text-text-subtle">
                  {banner.placement} · links to {banner.linkUrl}
                </p>
              </div>
              <label className="flex shrink-0 items-center gap-2 text-caption font-semibold text-text-muted">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--crimson)]"
                  checked={banner.isActive}
                  onChange={() => handleToggleActive(banner.id, banner.isActive)}
                />
                Active
              </label>
              <button
                type="button"
                aria-label={`Delete ${banner.title}`}
                onClick={() => setDeleteTarget({ id: banner.id, title: banner.title })}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-error/30 text-error transition-colors hover:bg-error-bg"
              >
                <Trash2 size={15} aria-hidden />
              </button>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        destructive
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
