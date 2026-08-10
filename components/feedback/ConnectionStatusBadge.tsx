import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { cn } from "@/lib/utils/cn";

const CONFIG = {
  connected: { label: "Live", dotClass: "bg-success", textClass: "text-success", pulse: true },
  reconnecting: { label: "Reconnecting…", dotClass: "bg-warning", textClass: "text-warning", pulse: true },
  offline: { label: "Offline", dotClass: "bg-text-subtle", textClass: "text-text-subtle", pulse: false },
} as const;

export function ConnectionStatusBadge({ className }: { className?: string }) {
  const status = useConnectionStatus();
  const { label, dotClass, textClass, pulse } = CONFIG[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-caption font-semibold", textClass, className)}>
      <span className="relative flex h-2 w-2">
        {pulse && <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", dotClass)} />}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", dotClass)} />
      </span>
      {label}
    </span>
  );
}
