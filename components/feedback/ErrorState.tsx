import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { SerializedError } from "@reduxjs/toolkit";
import { AlertCircle, RefreshCw, WifiOff } from "@/components/icons";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";

interface ErrorStateProps {
  error?: FetchBaseQueryError | SerializedError | null;
  /** Overrides the message derived from `error`. */
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/** Consistent, retry-capable error UI for any failed API interaction. */
export function ErrorState({ error, message, onRetry, className }: ErrorStateProps) {
  const normalized = error ? normalizeApiError(error) : null;
  const displayMessage = message ?? normalized?.message ?? "Something went wrong. Please try again.";
  const isOffline = normalized?.status === "FETCH_ERROR";
  const Icon = isOffline ? WifiOff : AlertCircle;

  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-16 text-center", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-bg text-error">
        <Icon size={26} aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="font-display text-h3 font-semibold text-text">
          {isOffline ? "Connection lost" : "Something went wrong"}
        </p>
        <p className="mx-auto max-w-sm text-small text-text-muted">{displayMessage}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 rounded-md border-2 border-primary px-6 py-2.5 text-small font-semibold text-primary transition-colors duration-fast hover:bg-primary hover:text-white"
        >
          <RefreshCw size={16} aria-hidden />
          Try again
        </button>
      )}
    </div>
  );
}
