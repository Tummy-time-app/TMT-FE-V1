"use client";

import { useState } from "react";
import { Users as UsersIcon } from "lucide-react";
import { useGetAllUsersQuery, useSetUserActiveMutation } from "@/features/auth/authApi";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import type { User, UserRole } from "@/features/auth/types";

const ROLE_FILTERS: { key: UserRole | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "customer", label: "Customers" },
  { key: "vendor", label: "Vendors" },
  { key: "rider", label: "Riders" },
  { key: "admin", label: "Admins" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminUsersPage() {
  const { data: users, isLoading, error, refetch } = useGetAllUsersQuery();
  const [setUserActive, { isLoading: isUpdating }] = useSetUserActiveMutation();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null);
  const toast = useToast();

  const filtered =
    users?.filter((u) => {
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    }) ?? [];

  const handleActivate = async (userId: string) => {
    try {
      await setUserActive({ userId, active: true }).unwrap();
      toast.success("Account reactivated.");
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await setUserActive({ userId: deactivateTarget.id, active: false }).unwrap();
      toast.success(`${deactivateTarget.name}'s account deactivated.`);
      setDeactivateTarget(null);
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
      setDeactivateTarget(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-h1 font-bold text-text">Users</h1>
      <p className="mt-1 text-small text-text-muted">Every account on the platform.</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full max-w-xs rounded-md border border-border bg-surface px-3.5 py-2 text-small text-text outline-none transition-colors focus:border-primary"
        />
        <div className="flex flex-wrap gap-2">
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setRoleFilter(f.key)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-caption font-semibold transition-colors",
                roleFilter === f.key
                  ? "border-primary bg-primary text-white"
                  : "border-border text-text-muted hover:border-primary/40 hover:text-primary"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users found" description="Try a different search or filter." />
        ) : (
          filtered.map((u) => (
            <div key={u.id} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-small font-bold text-primary">
                {u.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-small font-semibold text-text">{u.name}</p>
                <p className="truncate text-caption text-text-subtle">
                  {u.email} · Joined {formatDate(u.createdAt)}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-black/5 px-3 py-1 text-caption font-semibold capitalize text-text-muted">
                {u.role}
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-caption font-semibold",
                  u.active ? "bg-success-bg text-success" : "bg-error-bg text-error"
                )}
              >
                {u.active ? "Active" : "Deactivated"}
              </span>
              {u.active ? (
                <button
                  type="button"
                  onClick={() => setDeactivateTarget(u)}
                  disabled={isUpdating}
                  className="shrink-0 rounded-md border border-error/30 px-3 py-1.5 text-caption font-semibold text-error transition-colors hover:bg-error-bg"
                >
                  Deactivate
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleActivate(u.id)}
                  disabled={isUpdating}
                  className="shrink-0 rounded-md border border-success/30 px-3 py-1.5 text-caption font-semibold text-success transition-colors hover:bg-success-bg"
                >
                  Reactivate
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!deactivateTarget}
        title={`Deactivate ${deactivateTarget?.name}?`}
        description="They won't be able to log in until reactivated."
        confirmLabel="Deactivate"
        cancelLabel="Cancel"
        destructive
        isConfirming={isUpdating}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  );
}
