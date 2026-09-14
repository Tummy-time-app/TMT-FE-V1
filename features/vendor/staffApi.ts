import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetStaff, mockRemoveStaff } from "@/lib/mocks/vendorStaff.mock";
import type { StaffMember } from "./types";

/**
 * TMT-BE-V1's user-service staff.ts — `/api/users/vendor-staff/...`
 * (already-proxied `/api/users` base, same as authApi.ts). Only list/
 * remove — see StaffMember's doc comment for why "add" isn't built.
 */
export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaff: builder.query<StaffMember[], string>({
      queryFn: async (restaurantId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetStaff(restaurantId) };
          const result = await fetchWithBQ(`/api/users/vendor-staff/${restaurantId}`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { staff: StaffMember[] }).staff };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result, _error, restaurantId) =>
        result
          ? [...result.map((s) => ({ type: "VendorStaff" as const, id: s.id })), { type: "VendorStaff", id: restaurantId }]
          : [{ type: "VendorStaff", id: restaurantId }],
    }),

    /** `restaurantId` travels for cache-invalidation only — same precedent as vendorOrdersApi.ts. */
    removeStaff: builder.mutation<{ message: string }, { id: string; restaurantId: string }>({
      queryFn: async ({ id }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockRemoveStaff(id) };
          const result = await fetchWithBQ({ url: `/api/users/vendor-staff/${id}`, method: "DELETE" });
          if (result.error) return { error: result.error };
          return { data: result.data as { message: string } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { restaurantId }) => [{ type: "VendorStaff", id: restaurantId }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetStaffQuery, useRemoveStaffMutation } = staffApi;
