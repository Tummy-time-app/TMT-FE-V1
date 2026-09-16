import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetRiderProfile, mockUpdateRiderProfile, mockSetOnlineStatus } from "@/lib/mocks/riderProfile.mock";
import type { RiderProfile, VehicleType } from "./types";

/**
 * TMT-BE-V1's user-service riderRoutes.ts profile endpoints (mounted at
 * /api/rider/profile). Registration/login themselves go through the shared
 * authApi.ts (/api/users/register|login with role: "rider") — see
 * features/auth/types.ts's doc comment — riderRoutes.ts's own /auth/*
 * endpoints exist server-side but nothing here calls them, same as
 * vendorRoutes.ts's.
 */
export const riderProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRiderProfile: builder.query<RiderProfile, string>({
      queryFn: async (userId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetRiderProfile(userId) };
          const result = await fetchWithBQ(`/api/rider/profile/${userId}`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { profile: RiderProfile }).profile };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["RiderProfile"],
    }),

    updateRiderProfile: builder.mutation<RiderProfile, { userId: string; vehicleType?: VehicleType; plateNumber?: string }>({
      queryFn: async ({ userId, ...updates }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockUpdateRiderProfile(userId, updates) };
          const result = await fetchWithBQ({ url: `/api/rider/profile/${userId}`, method: "PUT", body: updates });
          if (result.error) return { error: result.error };
          return { data: (result.data as { profile: RiderProfile }).profile };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["RiderProfile"],
    }),

    setRiderOnlineStatus: builder.mutation<RiderProfile, { userId: string; isOnline: boolean }>({
      queryFn: async ({ userId, isOnline }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockSetOnlineStatus(userId, isOnline) };
          const result = await fetchWithBQ({ url: `/api/rider/profile/${userId}/online-status`, method: "PUT", body: { isOnline } });
          if (result.error) return { error: result.error };
          return { data: (result.data as { profile: RiderProfile }).profile };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["RiderProfile"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetRiderProfileQuery, useUpdateRiderProfileMutation, useSetRiderOnlineStatusMutation } = riderProfileApi;
