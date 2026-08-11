import Link from "next/link";
import { Bell, CreditCard, Package, Tag } from "@/components/icons";
import { relativeTime } from "@/lib/utils/relativeTime";
import { cn } from "@/lib/utils/cn";
import type { AppNotification, NotificationType } from "@/features/notifications/types";

const TYPE_ICON: Record<NotificationType, typeof Package> = {
  order: Package,
  payment: CreditCard,
  promotion: Tag,
  system: Bell,
};

const TYPE_CLASSES: Record<NotificationType, string> = {
  order: "bg-primary/10 text-primary",
  payment: "bg-success-bg text-success",
  promotion: "bg-secondary/20 text-primary-dark",
  system: "bg-info-bg text-info",
};

interface NotificationItemProps {
  notification: AppNotification;
  onClick?: () => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const Icon = TYPE_ICON[notification.type];

  const content = (
    <div
      className={cn(
        "flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-black/[0.03]",
        !notification.read && "bg-primary/[0.04]"
      )}
    >
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", TYPE_CLASSES[notification.type])}>
        <Icon size={14} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-small", !notification.read ? "font-semibold text-text" : "font-medium text-text-muted")}>
          {notification.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-caption text-text-subtle">{notification.message}</p>
        <p className="mt-1 text-caption text-text-subtle">{relativeTime(notification.createdAt)}</p>
      </div>
      {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />}
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={onClick} className="block">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="block w-full">
      {content}
    </button>
  );
}
