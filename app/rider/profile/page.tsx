"use client";

import { useRef, useState } from "react";
import { Paperclip, CheckCircle2, Clock, XCircle } from "@/components/icons";
import { useAuth } from "@/features/auth/hooks";
import { useGetRiderProfileQuery, useUpdateRiderProfileMutation, useUploadRiderDocumentMutation } from "@/features/riders/ridersApi";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import type { RiderProfile, VerificationStatus } from "@/features/riders/types";

const VEHICLE_OPTIONS: { value: "bike" | "bicycle" | "car"; label: string }[] = [
  { value: "bike", label: "Motorbike" },
  { value: "bicycle", label: "Bicycle" },
  { value: "car", label: "Car" },
];

const STATUS_META: Record<VerificationStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  approved: { label: "Verified", className: "bg-success-bg text-success", icon: CheckCircle2 },
  pending: { label: "Pending review", className: "bg-warning-bg text-warning", icon: Clock },
  rejected: { label: "Rejected — re-upload needed", className: "bg-error-bg text-error", icon: XCircle },
};

function DocumentUpload({
  label,
  fileName,
  onUpload,
  isUploading,
}: {
  label: string;
  fileName: string | null;
  onUpload: (fileName: string) => void;
  isUploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-small font-semibold text-text">{label}</p>
        <p className="mt-0.5 truncate text-caption text-text-subtle">{fileName ?? "No file uploaded"}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const name = e.target.files?.[0]?.name;
          if (name) onUpload(name);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="ml-3 flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-caption font-semibold text-text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
      >
        <Paperclip size={12} aria-hidden />
        {fileName ? "Replace" : "Upload"}
      </button>
    </div>
  );
}

/** Only mounted once `profile` is loaded (see the page component below) — its form fields can safely use fetched data as `useState` initializers with no sync effect needed. */
function ProfileForm({ userId, profile }: { userId: string; profile: RiderProfile }) {
  const [updateProfile, { isLoading: isSaving }] = useUpdateRiderProfileMutation();
  const [uploadDocument, { isLoading: isUploading }] = useUploadRiderDocumentMutation();
  const toast = useToast();

  const [vehicleType, setVehicleType] = useState(profile.vehicleType);
  const [licenseNumber, setLicenseNumber] = useState(profile.licenseNumber);

  const handleSave = async () => {
    try {
      await updateProfile({ userId, patch: { vehicleType, licenseNumber } }).unwrap();
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  const handleUpload = async (kind: "idDocument" | "vehicleDoc", fileName: string) => {
    try {
      await uploadDocument({ userId, kind, fileName }).unwrap();
      toast.success("Document uploaded — pending review.");
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  const status = STATUS_META[profile.verificationStatus];
  const StatusIcon = status.icon;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-h1 font-bold text-text">Profile</h1>
        <span className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption font-semibold", status.className)}>
          <StatusIcon size={13} aria-hidden />
          {status.label}
        </span>
      </div>

      <section className="mt-6 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-h3 font-bold text-text">Vehicle</h2>
        <div className="mt-3 flex gap-2">
          {VEHICLE_OPTIONS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => setVehicleType(v.value)}
              className={cn(
                "flex-1 rounded-md border px-3 py-2.5 text-small font-semibold transition-colors",
                vehicleType === v.value ? "border-primary bg-primary/5 text-primary" : "border-border text-text-muted"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="text-caption font-semibold text-text-muted">License number</label>
          <input
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="e.g. LAG-04521"
            className="mt-1 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="mt-4 rounded-md bg-primary px-5 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </section>

      <section className="mt-6 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-h3 font-bold text-text">Documents</h2>
        <p className="mt-1 text-small text-text-muted">Uploading a new document sends it for review again.</p>

        <div className="mt-4 space-y-2">
          <DocumentUpload
            label="Government ID"
            fileName={profile.idDocumentName}
            onUpload={(name) => handleUpload("idDocument", name)}
            isUploading={isUploading}
          />
          <DocumentUpload
            label="Vehicle registration"
            fileName={profile.vehicleDocName}
            onUpload={(name) => handleUpload("vehicleDoc", name)}
            isUploading={isUploading}
          />
        </div>
      </section>
    </div>
  );
}

export default function RiderProfilePage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const { data: profile, isLoading } = useGetRiderProfileQuery(
    { userId, vehicleType: user?.vehicleType ?? "bike" },
    { skip: !userId }
  );

  if (isLoading || !profile) {
    return <div className="h-64 animate-pulse rounded-lg bg-black/5" />;
  }

  return <ProfileForm userId={userId} profile={profile} />;
}
