import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetAllTransactions, mockGetWallet, mockGetWalletTransactions, mockTopUpWallet } from "@/lib/mocks/wallet.mock";
import type { TopUpMethod, WalletTransaction } from "./types";

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWallet: builder.query<{ balance: number }, string>({
      queryFn: async (userId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetWallet(userId) };
          const result = await fetchWithBQ("/wallet");
          if (result.error) return { error: result.error };
          return { data: result.data as { balance: number } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Wallet"],
    }),

    getWalletTransactions: builder.query<WalletTransaction[], string>({
      queryFn: async (userId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetWalletTransactions(userId) };
          const result = await fetchWithBQ("/wallet/transactions");
          if (result.error) return { error: result.error };
          return { data: result.data as WalletTransaction[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Wallet"],
    }),

    topUpWallet: builder.mutation<WalletTransaction, { userId: string; amount: number; method: TopUpMethod }>({
      queryFn: async ({ userId, amount, method }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockTopUpWallet(userId, amount, method) };
          const result = await fetchWithBQ({ url: "/wallet/topup", method: "POST", body: { amount, method } });
          if (result.error) return { error: result.error };
          return { data: result.data as WalletTransaction };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Wallet"],
    }),

    /** Admin — every wallet transaction on the platform, for reconciliation against payment provider records. */
    getAllTransactions: builder.query<WalletTransaction[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetAllTransactions() };
          const result = await fetchWithBQ("/admin/transactions");
          if (result.error) return { error: result.error };
          return { data: result.data as WalletTransaction[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Payments"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
  useTopUpWalletMutation,
  useGetAllTransactionsQuery,
} = walletApi;
