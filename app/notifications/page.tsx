import type { Metadata } from "next";
import { NotificationsView } from "@/components/notifications/NotificationsView";

export const metadata: Metadata = {
  title: "Notifications — TummyTime",
  description: "Updates about your TummyTime orders.",
};

export default function NotificationsPage() {
  return <NotificationsView />;
}
