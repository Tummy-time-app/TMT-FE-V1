import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockCreateWithdrawal, mockGetWithdrawals } from "@/lib/mocks/payouts.mock";
import type { Withdrawal } from "./types";

export const payoutsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWithdrawals: builder.query<Withdrawal[], string>({
      queryFn: async (actorId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetWithdrawals(actorId) };
          const result = await fetchWithBQ("/payouts/withdrawals");
          if (result.error) return { error: result.error };
          return { data: result.data as Withdrawal[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Payouts"],
    }),

    createWithdrawal: builder.mutation<Withdrawal, { actorId: string; amount: number; availableBalance: number }>({
      queryFn: async ({ actorId, amount, availableBalance }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCreateWithdrawal(actorId, amount, availableBalance) };
          const result = await fetchWithBQ({ url: "/payouts/withdrawals", method: "POST", body: { amount } });
          if (result.error) return { error: result.error };
          return { data: result.data as Withdrawal };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Payouts"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetWithdrawalsQuery, useCreateWithdrawalMutation } = payoutsApi;
