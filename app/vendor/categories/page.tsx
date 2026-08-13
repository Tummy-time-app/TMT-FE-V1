"use client";

import { useState } from "react";
import { ListChecks, Plus, Trash2, Pencil } from "@/components/icons";
import { useAuth } from "@/features/auth/hooks";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/features/categories/categoriesApi";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";
import type { ProductCategory } from "@/features/categories/types";

export default function VendorCategoriesPage() {
  const { user } = useAuth();
  const vendorId = user?.vendorId ?? "";
  const { data: categories, isLoading, error, refetch } = useGetCategoriesQuery(vendorId, { skip: !vendorId });
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const toast = useToast();

  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ProductCategory | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createCategory({ vendorId, name: newName.trim() }).unwrap();
      setNewName("");
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  const handleRename = async () => {
    if (!editing || !editValue.trim()) return;
    try {
      await updateCategory({ id: editing.id, vendorId, name: editValue.trim() }).unwrap();
      setEditing(null);
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory({ vendorId, id: deleteTarget.id }).unwrap();
      toast.success(`${deleteTarget.name} removed.`);
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-h1 font-bold text-text">Categories</h1>
      <p className="mt-1 text-small text-text-muted">Organize your menu into sections customers can browse.</p>

      <form onSubmit={handleCreate} className="mt-5 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="e.g. Grills, Sides, Drinks"
          className="flex-1 rounded-md border border-border bg-surface px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
        />
        <button
          type="submit"
          disabled={isCreating || !newName.trim()}
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Plus size={15} aria-hidden />
          Add
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !categories || categories.length === 0 ? (
          <EmptyState icon={ListChecks} title="No categories yet" description="Add one above to start organizing your menu." />
        ) : (
          categories.map((cat) =>
            editing?.id === cat.id ? (
              <div key={cat.id} className="flex gap-2 rounded-lg border border-border bg-surface p-3">
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                  className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-small text-text outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleRename}
                  className="rounded-md bg-primary px-3 py-2 text-caption font-semibold text-white"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-md border border-border px-3 py-2 text-caption font-semibold text-text-muted"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div key={cat.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3.5">
                <span className="text-small font-semibold text-text">{cat.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(cat);
                      setEditValue(cat.name);
                    }}
                    aria-label={`Rename ${cat.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-text-subtle transition-colors hover:bg-black/5 hover:text-primary"
                  >
                    <Pencil size={14} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(cat)}
                    aria-label={`Delete ${cat.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-text-subtle transition-colors hover:bg-error-bg hover:text-error"
                  >
                    <Trash2 size={14} aria-hidden />
                  </button>
                </div>
              </div>
            )
          )
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        description="Products already in this category keep their category label — this only removes it from the list."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
