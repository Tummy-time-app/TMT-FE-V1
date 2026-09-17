import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetAdminRewardsSummary } from "@/lib/mocks/adminRewards.mock";
import type { AdminRewardsSummary } from "./types";

/** TMT-BE-V1's rewards-service adminRewards.ts (mounted at /api/admin/rewards). Read-only. */
export const adminRewardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminRewardsSummary: builder.query<AdminRewardsSummary, void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetAdminRewardsSummary() };
          const result = await fetchWithBQ("/api/admin/rewards/summary");
          if (result.error) return { error: result.error };
          return { data: result.data as AdminRewardsSummary };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["AdminRewards"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAdminRewardsSummaryQuery } = adminRewardsApi;
