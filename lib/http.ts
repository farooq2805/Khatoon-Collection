/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/http.ts
import type { ApiError } from "./types";

export function getErrorMessage(err: unknown, fallback = "Something went wrong") {
  const e = err as Partial<ApiError> & { message?: string; details?: any };
  return e?.message || e?.details?.message || fallback;
}

export function getStatus(err: unknown): number | null {
  const e = err as Partial<ApiError> & { status?: number };
  return typeof e?.status === "number" ? e.status : null;
}
