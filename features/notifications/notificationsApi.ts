import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetNotifications } from "@/lib/mocks/orders.mock";
import type { NotificationLogEntry } from "./types";

/**
 * TMT-BE-V1's notification-service (services/notification-service/src/
 * index.ts). GET /api/notifications returns one **global** event log — no
 * per-user scoping on the backend at all. Consumers of this hook must
 * filter client-side (e.g. by cross-referencing `orderId` against the
 * signed-in user's own orders from ordersApi's listOrders) before
 * displaying anything to a specific user.
 *
 * Also note: the Postman collection documents this route as
 * `{{BASE_URL}}/api/notifications/api/notifications` — that's a doubled-path
 * bug in the collection, not the real route. The gateway proxies
 * `/api/notifications/*` to the service, whose own route is registered at
 * `/api/notifications` — so the correct full path is just `/api/notifications` once.
 */
export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationLogEntry[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetNotifications() };
          const result = await fetchWithBQ("/api/notifications");
          if (result.error) return { error: result.error };
          return { data: (result.data as { notifications: NotificationLogEntry[] }).notifications };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Notifications"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetNotificationsQuery } = notificationsApi;
