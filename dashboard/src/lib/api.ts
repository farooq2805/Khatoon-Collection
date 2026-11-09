// Thin client for the store API (api.khatooncollection.in). The session is
// shared with the classic dashboard: same origin, same "adminToken" key.

export const API_BASE = "https://api.khatooncollection.in/api";
export const STORE_URL = "https://khatooncollection.in";
export const TOKEN_KEY = "adminToken";
export const USER_KEY = "adminUser";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

type Options = { method?: string; body?: unknown; base?: string; signal?: AbortSignal };

export async function api<T = any>(path: string, opts: Options = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${opts.base ?? API_BASE}${path}`, {
    method: opts.method ?? "GET",
    headers: {
      ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("kc:logout"));
  }

  const json = await res.json().catch(() => null);
  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.message || json?.error || `Request failed (${res.status})`, res.status);
  }
  return json as T;
}

/** Most endpoints answer { success, data }; some return bare arrays or { items }. */
export function listFrom<T = any>(json: any): T[] {
  const d = json?.data ?? json;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.users)) return d.users;
  if (Array.isArray(d?.products)) return d.products;
  return [];
}
