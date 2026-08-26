import type { ReactNode } from "react";
import type { IconComponent } from "@/components/icons";
import "./EmptyState.css";

/** Replaces the ad hoc `.vp-empty`/`.rp-*-empty` markup copied across the listing, detail, cart, and order pages with one component. */
export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: IconComponent;
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="tmt-empty">
      <div className="tmt-empty__icon-wrap">
        <Icon className="tmt-empty__icon" aria-hidden />
      </div>
      <p className="tmt-empty__title">{title}</p>
      {message && <p className="tmt-empty__message">{message}</p>}
      {action && <div className="tmt-empty__action">{action}</div>}
    </div>
  );
}
