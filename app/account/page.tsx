"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/features/auth/hooks";
import { useGetMySessionsQuery, useRevokeSessionMutation, useUpdateProfileMutation } from "@/features/auth/authApi";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";
import { LogOut } from "@/components/icons";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function ProfileSection() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateProfile({
        userId: user.id,
        patch: { name: name.trim(), phone: phone.trim() || undefined, avatarUrl: avatarUrl.trim() || null },
      }).unwrap();
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h2 className="font-display text-h3 font-bold text-text">Profile</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-h3 font-bold text-white">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-entered URL, same reasoning as BannerStrip.tsx
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </span>
          <div className="flex-1">
            <label className="text-caption font-semibold text-text-muted">Avatar URL (optional)</label>
            <input
              value={avatarUrl ?? ""}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
              className="mt-1 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-caption font-semibold text-text-muted">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          />
        </div>

        <div>
          <label className="text-caption font-semibold text-text-muted">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234…"
            className="mt-1 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          />
        </div>

        <div>
          <label className="text-caption font-semibold text-text-muted">Email</label>
          <input
            value={user?.email ?? ""}
            disabled
            className="mt-1 w-full rounded-md border border-border bg-black/[0.03] px-3.5 py-2.5 text-small text-text-subtle outline-none"
          />
          <p className="mt-1 text-caption text-text-subtle">Email can&apos;t be changed here.</p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-primary px-5 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Saving…" : "Save changes"}
        </button>
      </form>
    </section>
  );
}

function SessionsSection() {
  const { data: sessions, isLoading } = useGetMySessionsQuery();
  const [revokeSession, { isLoading: isRevoking }] = useRevokeSessionMutation();
  const toast = useToast();

  const handleRevoke = async (id: string) => {
    try {
      await revokeSession(id).unwrap();
      toast.success("Session revoked.");
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  return (
    <section className="mt-6 rounded-lg border border-border bg-surface p-5">
      <h2 className="font-display text-h3 font-bold text-text">Active sessions</h2>
      <p className="mt-1 text-small text-text-muted">Devices currently signed in to your account.</p>

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <div className="h-14 animate-pulse rounded-lg bg-black/5" />
        ) : (
          sessions?.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3.5">
              <div>
                <p className="text-small font-semibold text-text">
                  {s.userAgent} {s.current && <span className="ml-1 text-caption font-normal text-success">(this device)</span>}
                </p>
                <p className="text-caption text-text-subtle">Last active {formatDateTime(s.lastActiveAt)}</p>
              </div>
              {!s.current && (
                <button
                  type="button"
                  onClick={() => handleRevoke(s.id)}
                  disabled={isRevoking}
                  className="flex items-center gap-1.5 rounded-md border border-error/30 px-3 py-1.5 text-caption font-semibold text-error transition-colors hover:bg-error-bg disabled:opacity-60"
                >
                  <LogOut size={13} aria-hidden />
                  Sign out
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function AccountContent() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-h1 font-bold text-text">Account</h1>
      <p className="mt-1 text-small text-text-muted">Manage your profile and active sessions.</p>

      <div className="mt-6 space-y-6">
        <ProfileSection />
        <SessionsSection />
      </div>
    </main>
  );
}

export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountContent />
    </RequireAuth>
  );
}
