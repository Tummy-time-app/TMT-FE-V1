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

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiUrl,
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
  tagTypes: ["Auth"],
  endpoints: () => ({}),
});
