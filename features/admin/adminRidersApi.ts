import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockListRiders, mockVerifyRider } from "@/lib/mocks/adminRiders.mock";
import type { AdminRider, Paginated } from "./types";

/** TMT-BE-V1's user-service adminRoutes.ts (mounted at /api/admin/riders). Shares no tag with the rider's own RiderProfile query — different shape (joined + paginated) and different consumer. */
export const adminRidersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listRiders: builder.query<Paginated<AdminRider>, { page: number; limit: number }>({
      queryFn: async ({ page, limit }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockListRiders(page, limit) };
          const result = await fetchWithBQ(`/api/admin/riders?page=${page}&limit=${limit}`);
          if (result.error) return { error: result.error };
          return { data: result.data as Paginated<AdminRider> };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result) =>
        result ? [...result.data.map((r) => ({ type: "RiderProfile" as const, id: r.userId })), { type: "RiderProfile", id: "LIST" }] : [{ type: "RiderProfile", id: "LIST" }],
    }),

    // Keyed by the rider profile's own `id` (AdminRider.id), matching the
    // real endpoint's PATCH /admin/riders/:id/verify — NOT `userId`, even
    // though the mock's store happens to key both the same for simplicity.
    verifyRider: builder.mutation<null, { id: string; userId: string; status: "verified" | "rejected" }>({
      queryFn: async ({ id, userId, status }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) {
            await mockVerifyRider(userId, status);
            return { data: null };
          }
          const result = await fetchWithBQ({ url: `/api/admin/riders/${id}/verify`, method: "PATCH", body: { status } });
          if (result.error) return { error: result.error };
          return { data: null };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: [{ type: "RiderProfile", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useListRidersQuery, useVerifyRiderMutation } = adminRidersApi;
