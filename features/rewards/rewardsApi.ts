import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import {
  mockGetWallet,
  mockGetWalletTransactions,
  mockDepositWallet,
  mockGetCashbackSummary,
  mockGetLoyaltyBalance,
  mockGetRedemptionOptions,
  mockRedeemPoints,
  mockGetFreeDeliveryProgress,
  mockGetOrderRewardSummary,
} from "@/lib/mocks/rewards.mock";
import type {
  Wallet,
  WalletTransaction,
  CashbackSummary,
  LoyaltyHistoryEntry,
  RedemptionOption,
  FreeDeliveryProgress,
  FreeDeliveryHistoryEntry,
  OrderRewardSummary,
} from "./types";

interface LoyaltyState {
  balance: number;
  history: LoyaltyHistoryEntry[];
  depositThreshold: number;
}

interface FreeDeliveryState {
  progress: FreeDeliveryProgress;
  history: FreeDeliveryHistoryEntry[];
}

/**
 * TMT-BE-V1's new rewards-service (services/rewards-service/src/routes/
 * rewards.ts), mounted behind the gateway at /api/rewards (see
 * store/api/baseApi.ts's SERVICE_ROUTES). Unlike shopsApi.ts/marketsApi.ts,
 * this has a real backend contract to mirror, not a speculative one.
 */
export const rewardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWallet: builder.query<Wallet, string>({
      queryFn: async (userId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetWallet(userId) };
          const result = await fetchWithBQ(`/api/rewards/wallet?userId=${userId}`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { wallet: Wallet }).wallet };
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
          const result = await fetchWithBQ(`/api/rewards/wallet/transactions?userId=${userId}`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { transactions: WalletTransaction[] }).transactions };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Wallet"],
    }),

    depositWallet: builder.mutation<{ wallet: Wallet; pointsAwarded: number }, { userId: string; amount: number }>({
      queryFn: async ({ userId, amount }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockDepositWallet(userId, amount) };
          const result = await fetchWithBQ({ url: "/api/rewards/wallet/deposit", method: "POST", body: { userId, amount } });
          if (result.error) return { error: result.error };
          const data = result.data as { wallet: Wallet; pointsAwarded: number };
          return { data: { wallet: data.wallet, pointsAwarded: data.pointsAwarded } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Wallet", "Loyalty"],
    }),

    getCashbackSummary: builder.query<CashbackSummary, string>({
      queryFn: async (userId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetCashbackSummary(userId) };
          const result = await fetchWithBQ(`/api/rewards/cashback?userId=${userId}`);
          if (result.error) return { error: result.error };
          return { data: result.data as CashbackSummary };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Cashback"],
    }),

    getLoyaltyBalance: builder.query<LoyaltyState, string>({
      queryFn: async (userId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetLoyaltyBalance(userId) };
          const result = await fetchWithBQ(`/api/rewards/loyalty?userId=${userId}`);
          if (result.error) return { error: result.error };
          const data = result.data as { loyalty: { balance: number }; history: LoyaltyHistoryEntry[]; depositThreshold: number };
          return { data: { balance: data.loyalty.balance, history: data.history, depositThreshold: data.depositThreshold } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Loyalty"],
    }),

    getRedemptionOptions: builder.query<RedemptionOption[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetRedemptionOptions() };
          const result = await fetchWithBQ("/api/rewards/loyalty/redemption-options");
          if (result.error) return { error: result.error };
          return { data: (result.data as { options: RedemptionOption[] }).options };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
    }),

    redeemPoints: builder.mutation<{ balance: number; nairaCredited: number }, { userId: string; points: number }>({
      queryFn: async ({ userId, points }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockRedeemPoints(userId, points) };
          const result = await fetchWithBQ({ url: "/api/rewards/loyalty/redeem", method: "POST", body: { userId, points } });
          if (result.error) return { error: result.error };
          const data = result.data as { loyalty: { balance: number }; nairaCredited: number };
          return { data: { balance: data.loyalty.balance, nairaCredited: data.nairaCredited } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Loyalty", "Wallet"],
    }),

    getFreeDeliveryProgress: builder.query<FreeDeliveryState, string>({
      queryFn: async (userId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetFreeDeliveryProgress(userId) };
          const result = await fetchWithBQ(`/api/rewards/free-delivery?userId=${userId}`);
          if (result.error) return { error: result.error };
          return { data: result.data as FreeDeliveryState };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["FreeDelivery"],
    }),

    getOrderRewardSummary: builder.query<OrderRewardSummary, { userId: string; orderId: string }>({
      queryFn: async ({ userId, orderId }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetOrderRewardSummary(userId, orderId) };
          const result = await fetchWithBQ(`/api/rewards/summary/order/${orderId}?userId=${userId}`);
          if (result.error) return { error: result.error };
          return { data: result.data as OrderRewardSummary };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
  useDepositWalletMutation,
  useGetCashbackSummaryQuery,
  useGetLoyaltyBalanceQuery,
  useGetRedemptionOptionsQuery,
  useRedeemPointsMutation,
  useGetFreeDeliveryProgressQuery,
  useGetOrderRewardSummaryQuery,
} = rewardsApi;
