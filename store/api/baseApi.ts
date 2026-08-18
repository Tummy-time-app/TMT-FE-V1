import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { env } from "@/config/env";
import { sessionExpired } from "@/features/auth/authSlice";
import type { RootState } from "../index";

/**
 * TMT-BE-V1 is an API-gateway-fronted set of microservices, not a single
 * versioned API — the gateway proxies /api/users/*, /api/restaurants/*,
 * /api/orders/*, /api/notifications/* to their respective services, with
 * no /api/v1 prefix anywhere (see TMT-BE-V1/api-gateway/src/index.ts).
 * `env.apiUrl` is that gateway's bare root URL — every feature API slice
 * writes its FULL path including the resource prefix, e.g. "/api/users/me".
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiUrl ? env.apiUrl.replace(/\/+$/, "") : env.apiUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.session?.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

/**
 * Wraps the raw fetch base query so a 401 from ANY endpoint clears the
 * session centrally — individual feature endpoints never need to handle
 * auth expiry themselves (spec §50).
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    api.dispatch(sessionExpired());
  }
  return result;
};

/**
 * Single root RTK Query API. Feature API slices call `baseApi.injectEndpoints`
 * rather than creating their own `createApi` instance, so everything shares
 * one cache, one middleware, and one tag registry.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "Vendors",
    "Orders",
    "Products",
    "Wallet",
    "Payouts",
    "Promotions",
    "Notifications",
    "Support",
    "Addresses",
    "Reviews",
    "Referrals",
    "Banners",
    "AuditLog",
    "Favorites",
    "Categories",
    "RiderDocuments",
    "Payments",
  ],
  endpoints: () => ({}),
});
