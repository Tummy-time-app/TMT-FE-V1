import { cn } from "@/lib/utils/cn";

/** Minimal full-page loading indicator for gates like session restoration — not the marketing splash. */
export function PageSpinner({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex min-h-[60vh] w-full flex-col items-center justify-center gap-3", className)}
    >
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
      <span className="text-small font-medium text-text-muted">{label}</span>
    </div>
  );
}
