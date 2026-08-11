import type { IconComponent } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  label: string;
  value: string;
  icon: IconComponent;
  accent?: "primary" | "success" | "warning";
  className?: string;
}

const ACCENT_CLASSES = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
} as const;

export function StatCard({ label, value, icon: Icon, accent = "primary", className }: StatCardProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-5", className)}>
      <div className="flex items-center justify-between">
        <p className="text-small text-text-muted">{label}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", ACCENT_CLASSES[accent])}>
          <Icon size={16} aria-hidden />
        </span>
      </div>
      <p className="mt-3 truncate font-display text-h2 font-bold text-text">{value}</p>
    </div>
  );
}
