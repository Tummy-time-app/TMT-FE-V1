import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { SerializedError } from "@reduxjs/toolkit";

export type ApiErrorStatus =
  | number
  | "FETCH_ERROR"
  | "PARSING_ERROR"
  | "TIMEOUT_ERROR"
  | "CUSTOM_ERROR";

export interface NormalizedApiError {
  status: ApiErrorStatus;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Converts anything a mock adapter throws (or any caught exception) into
 * the FetchBaseQueryError shape RTK Query's `queryFn` is expected to
 * return, so mock and real endpoints produce identical error shapes for
 * the UI layer to consume via `normalizeApiError`.
 */
export function toQueryError(error: unknown): FetchBaseQueryError {
  if (error && typeof error === "object" && "status" in error) {
    const { status: rawStatus, message, errors, ...rest } = error as {
      status: unknown;
      message?: unknown;
      errors?: unknown;
      [key: string]: unknown;
    };
    const status = typeof rawStatus === "number" ? rawStatus : ("CUSTOM_ERROR" as const);
    return {
      status,
      // `...rest` forwards any extra fields a real endpoint's error body
      // carries beyond message/errors (e.g. the 403 login response's
      // `requiresVerification`/`email` — see UnverifiedLoginError) so a
      // thrown mock error can mirror it exactly rather than only ever
      // producing {message, errors}.
      data: { message: message ?? "Something went wrong.", errors, ...rest },
    } as FetchBaseQueryError;
  }
  if (error instanceof Error) {
    return { status: "CUSTOM_ERROR", error: error.message } as FetchBaseQueryError;
  }
  return { status: "CUSTOM_ERROR", error: "Something went wrong." } as FetchBaseQueryError;
}

/**
 * Normalizes any error RTK Query hooks can return (FetchBaseQueryError,
 * SerializedError, or nothing) into a predictable, display-ready shape.
 * Every component that surfaces an API error should go through this
 * rather than reaching into `error.data.message` ad hoc.
 */
export function normalizeApiError(
  error: FetchBaseQueryError | SerializedError | null | undefined
): NormalizedApiError {
  if (!error) {
    return { status: "CUSTOM_ERROR", message: "Something went wrong. Please try again." };
  }

  if ("status" in error) {
    const status = error.status as ApiErrorStatus;
    // TMT-BE-V1's Express services respond with `{ error: "..." }`, not
    // `{ message: "..." }` (that was the NestJS/Supabase-era shape the
    // `frontend` branch's mock adapter used) — check both so real backend
    // error text actually surfaces instead of falling through to the
    // generic per-status default below.
    const data = error.data as
      | { message?: string; error?: string; errors?: Record<string, string[]> }
      | undefined;
    return {
      status,
      message: data?.message ?? data?.error ?? defaultMessageForStatus(status),
      fieldErrors: data?.errors,
    };
  }

  // SerializedError — thrown by the RTK Query thunk lifecycle itself.
  return {
    status: "CUSTOM_ERROR",
    message: error.message ?? "Something went wrong. Please try again.",
  };
}

export function getErrorMessage(
  error: FetchBaseQueryError | SerializedError | null | undefined
): string {
  return normalizeApiError(error).message;
}

function defaultMessageForStatus(status: ApiErrorStatus): string {
  switch (status) {
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You don't have permission to do that.";
    case 404:
      return "We couldn't find what you were looking for.";
    case 409:
      return "That already exists — please check and try again.";
    case 422:
      return "Please check the information you entered.";
    case 429:
      return "Too many requests — please slow down and try again.";
    case 500:
      return "Something went wrong on our end. Please try again shortly.";
    case "FETCH_ERROR":
      return "Connection lost. Check your network and try again.";
    case "TIMEOUT_ERROR":
      return "That took too long. Please try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
