import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetReferralSummary, mockGetReferrals, mockRedeemReferralCode } from "@/lib/mocks/referrals.mock";
import type { Referral, ReferralSummary, RedeemReferralPayload } from "./types";

export const referralsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReferralSummary: builder.query<ReferralSummary, string>({
      queryFn: async (userId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetReferralSummary(userId) };
          const result = await fetchWithBQ("/users/me/referral-summary");
          if (result.error) return { error: result.error };
          return { data: result.data as ReferralSummary };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Referrals"],
    }),

    getReferrals: builder.query<Referral[], string>({
      queryFn: async (userId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetReferrals(userId) };
          const result = await fetchWithBQ("/referrals");
          if (result.error) return { error: result.error };
          return { data: result.data as Referral[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Referrals"],
    }),

    /** Doc §5, PromotionsModule: `POST /referrals`. */
    redeemReferralCode: builder.mutation<Referral, RedeemReferralPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockRedeemReferralCode(payload) };
          const result = await fetchWithBQ({ url: "/referrals", method: "POST", body: payload });
          if (result.error) return { error: result.error };
          return { data: result.data as Referral };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Referrals", "Wallet"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetReferralSummaryQuery, useGetReferralsQuery, useRedeemReferralCodeMutation } = referralsApi;
