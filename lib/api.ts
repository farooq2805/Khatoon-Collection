/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/api.ts

import { getToken } from "./storage";
import type { ApiError, ApiResult } from "./types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

async function parseBody(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function buildError(res: Response, body: any): ApiError {
  const message =
    body?.message ||
    body?.error ||
    (typeof body === "string" ? body : null) ||
    `HTTP ${res.status}`;

  return {
    status: res.status,
    message,
    details: body ?? null,
  };
}

type RequestOptions = {
  withAuth?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

async function request<T>(
  method: string,
  url: string,
  body?: any,
  opts: RequestOptions = {}
): Promise<ApiResult<T>> {
  const withAuth = opts.withAuth ?? true;
  const headers: Record<string, string> = { ...(opts.headers || {}) };

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  if (!isFormData) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const token = withAuth ? getToken() : null;
  if (withAuth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${url}`, {
    method,
    headers,
    body:
      body == null
        ? undefined
        : isFormData
        ? body
        : headers["Content-Type"]?.includes("application/json")
        ? JSON.stringify(body)
        : body,
    signal: opts.signal,
  });

  const parsed = await parseBody(res);

  if (!res.ok) throw buildError(res, parsed);

  // ✅ IMPORTANT: do NOT unwrap anything
  return { data: parsed as T };
}

export const api = {
  get: <T>(url: string, opts?: RequestOptions) =>
    request<T>("GET", url, undefined, opts),

  post: <T>(url: string, body?: any, opts?: RequestOptions) =>
    request<T>("POST", url, body, opts),

  patch: <T>(url: string, body?: any, opts?: RequestOptions) =>
    request<T>("PATCH", url, body, opts),

  put: <T>(url: string, body?: any, opts?: RequestOptions) =>
    request<T>("PUT", url, body, opts),

  delete: <T>(url: string, body?: any, opts?: RequestOptions) =>
    request<T>("DELETE", url, body, opts),
};

export function buildQuery(params: Record<string, any>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  return sp.toString();
}

export default api;
