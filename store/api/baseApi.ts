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
  // Kept to exactly what's actually built against TMT-BE-V1's real surface
  // (customer-facing subset — see restaurantsApi.ts/ordersApi.ts's doc
  // comments) rather than the speculative full domain list the `frontend`
  // branch's ported code assumed (Wallet/Payouts/Referrals/... don't exist
  // as endpoints anywhere in this backend).
  tagTypes: ["Auth", "Restaurants", "MenuItems", "Orders", "Notifications", "VendorStores", "Categories"],
  endpoints: () => ({}),
});
