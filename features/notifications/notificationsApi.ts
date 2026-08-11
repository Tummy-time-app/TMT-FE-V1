import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import {
  mockGetNotifications,
  mockMarkAllNotificationsRead,
  mockMarkNotificationRead,
} from "@/lib/mocks/notifications.mock";
import type { AppNotification } from "./types";

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<AppNotification[], string>({
      queryFn: async (userId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetNotifications(userId) };
          const result = await fetchWithBQ("/notifications");
          if (result.error) return { error: result.error };
          return { data: result.data as AppNotification[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Notifications"],
    }),

    markNotificationRead: builder.mutation<AppNotification[], { userId: string; id: string }>({
      queryFn: async ({ userId, id }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockMarkNotificationRead(userId, id) };
          const result = await fetchWithBQ({ url: `/notifications/${id}/read`, method: "PATCH" });
          if (result.error) return { error: result.error };
          return { data: result.data as AppNotification[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Notifications"],
    }),

    markAllNotificationsRead: builder.mutation<AppNotification[], string>({
      queryFn: async (userId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockMarkAllNotificationsRead(userId) };
          const result = await fetchWithBQ({ url: "/notifications/read-all", method: "PATCH" });
          if (result.error) return { error: result.error };
          return { data: result.data as AppNotification[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Notifications"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;
