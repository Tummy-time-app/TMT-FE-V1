import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { env } from "@/config/env";
import { isApiUrlMissingInProduction } from "@/lib/dev/devMode";
import { sessionExpired } from "@/features/auth/authSlice";
import type { RootState } from "../index";

/**
 * TMT-BE-V1 is a set of independently-deployed microservices, each also
 * fronted by an API gateway that proxies /api/users/*, /api/restaurants/*,
 * /api/orders/*, /api/notifications/* to them (see TMT-BE-V1/api-gateway/
 * src/index.ts). Every feature API slice writes its FULL path including the
 * resource prefix, e.g. "/api/users/me" — no /api/v1 prefix anywhere.
 *
 * Each service also has its own standalone Render URL (surfaced by the
 * gateway's own GET /health, whose `routes` object lists exactly these) and
 * expects that same "/api/<resource>/..." path at its own root — so calling
 * a service directly needs no path changes, only a different origin.
 * `resolveUrl` below picks the most specific configured origin for a given
 * path (its own service URL if set, else the shared gateway), which is what
 * turns a relative "/api/users/login" into an absolute URL before it ever
 * reaches `fetchBaseQuery`.
 */
const SERVICE_ROUTES: readonly (readonly [prefix: string, url: string])[] = [
  ["/api/users", env.userServiceUrl],
  ["/api/restaurants", env.restaurantServiceUrl],
  ["/api/orders", env.orderServiceUrl],
  ["/api/notifications", env.notificationServiceUrl],
];

/**
 * Resolves a feature API slice's relative path (e.g. "/api/users/login")
 * to an absolute URL against that resource's own service, falling back to
 * the shared gateway (`env.apiUrl`) when that service's URL isn't
 * configured — same behavior as before per-service URLs existed.
 */
function resolveUrl(path: string): string {
  const [, matchedServiceUrl] = SERVICE_ROUTES.find(([prefix]) => path.startsWith(prefix)) ?? [];
  const base = matchedServiceUrl || env.apiUrl;
  return base ? `${base.replace(/\/+$/, "")}${path}` : path;
}

/** fetchBaseQuery treats any URL starting with "http" as absolute and ignores `baseUrl` for it. */
function withResolvedUrl(args: string | FetchArgs): string | FetchArgs {
  return typeof args === "string" ? resolveUrl(args) : { ...args, url: resolveUrl(args.url) };
}

const rawBaseQuery = fetchBaseQuery({
  // Only ever hit for a path resolveUrl couldn't turn absolute (no service
  // URL AND no gateway URL configured) — see withResolvedUrl above, which
  // every request goes through first.
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
 *
 * Also guards against the production-with-no-backend state: if no backend
 * URL at all was set at build/deploy time, every request short-circuits
 * with a clear config error instead of either firing a broken relative
 * fetch or (see lib/dev/devMode.ts) silently falling back to the mock
 * adapter's localStorage-backed data.
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  if (isApiUrlMissingInProduction) {
    return {
      error: {
        status: "CUSTOM_ERROR",
        error: "No backend URL is configured",
        data: { message: "This app isn't connected to a backend right now. Please try again later." },
      } as FetchBaseQueryError,
    };
  }
  const result = await rawBaseQuery(withResolvedUrl(args), api, extraOptions);
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
  tagTypes: ["Auth", "Restaurants", "MenuItems", "Orders", "Notifications", "VendorStores", "Categories", "Inventory"],
  endpoints: () => ({}),
});
