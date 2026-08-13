import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { logAdminAction } from "@/features/audit/logAdminAction";
import { mockCreateWithdrawal, mockGetAllWithdrawals, mockGetWithdrawals, mockSetWithdrawalStatus } from "@/lib/mocks/payouts.mock";
import type { Withdrawal, WithdrawalStatus } from "./types";

/**
 * Backend doc §4/§5 has no dedicated "PayoutsModule" REST surface — vendor
 * and rider withdrawals share the same generic `wallets`/`wallet_ledger`
 * tables and `WalletModule` endpoints as the customer wallet (a `payouts`
 * table exists for the *batched bank payout* side, which is a background
 * job, not something this UI calls directly — see doc §6/§8). So "vendor
 * payouts" and "rider earnings" withdrawals both go through
 * `/wallet/transactions` + `POST /wallet/withdraw` in real mode, same as
 * `features/wallet/walletApi.ts`'s customer-facing wallet.
 */
export const payoutsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWithdrawals: builder.query<Withdrawal[], string>({
      queryFn: async (actorId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetWithdrawals(actorId) };
          const result = await fetchWithBQ({ url: "/wallet/transactions", params: { type: "wallet_withdrawal" } });
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
          const result = await fetchWithBQ({ url: "/wallet/withdraw", method: "POST", body: { amount } });
          if (result.error) return { error: result.error };
          return { data: result.data as Withdrawal };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Payouts"],
    }),

    /** Admin — every withdrawal across every vendor/rider, for the approval queue. */
    getAllWithdrawals: builder.query<Withdrawal[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetAllWithdrawals() };
          const result = await fetchWithBQ("/admin/payouts");
          if (result.error) return { error: result.error };
          return { data: result.data as Withdrawal[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Payouts"],
    }),

    /** Admin — approve (→ processing/paid) or reject (→ failed) a pending withdrawal. */
    setWithdrawalStatus: builder.mutation<Withdrawal, { actorId: string; id: string; status: WithdrawalStatus }>({
      queryFn: async ({ actorId, id, status }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockSetWithdrawalStatus(actorId, id, status) };
          const result = await fetchWithBQ({ url: `/admin/payouts/${id}/status`, method: "PATCH", body: { status } });
          if (result.error) return { error: result.error };
          return { data: result.data as Withdrawal };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      onQueryStarted: async ({ id, status }, { getState, queryFulfilled }) => {
        try {
          await queryFulfilled;
          logAdminAction(getState, `payout.${status}`, "payouts", id, undefined, { status });
        } catch {
          // mutation failed — nothing to log
        }
      },
      invalidatesTags: ["Payouts"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWithdrawalsQuery,
  useCreateWithdrawalMutation,
  useGetAllWithdrawalsQuery,
  useSetWithdrawalStatusMutation,
} = payoutsApi;
