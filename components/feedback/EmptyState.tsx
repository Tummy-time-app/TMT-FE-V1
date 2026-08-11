import type { IconComponent } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: IconComponent;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

/** Meaningful empty state for lists/tables with nothing to show. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 px-6 py-16 text-center",
        className
      )}
    >
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/8 text-primary">
          <Icon size={26} aria-hidden />
        </div>
      )}
      <div className="space-y-1">
        <p className="font-display text-h3 font-semibold text-text">{title}</p>
        {description && <p className="mx-auto max-w-sm text-small text-text-muted">{description}</p>}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 rounded-md bg-primary px-6 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
