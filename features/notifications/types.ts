/**
 * Mirrors TMT-BE-V1's notification-service (services/notification-service/
 * src/index.ts). It's a RabbitMQ consumer building a single **global,
 * in-memory event log** — GET /api/notifications returns every order event
 * across every customer/restaurant, with no per-user filtering at all.
 * Filter client-side against the signed-in user's own order/restaurant IDs
 * before displaying these — see notificationsApi.ts's doc comment.
 */
export interface NotificationLogEntry {
  id: string;
  event: "ORDER_CREATED" | "ORDER_STATUS_UPDATED";
  orderId: string;
  message: string;
  timestamp: string;
}
