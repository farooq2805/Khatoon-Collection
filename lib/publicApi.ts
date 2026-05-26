/* eslint-disable @typescript-eslint/no-explicit-any */
    // lib/publicApi.ts
type AnyObj = Record<string, any>;

export function getApiBase() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    // don’t crash build; show clear error in runtime
    return "";
  }
  return base.replace(/\/+$/, "");
}

export function qs(params: AnyObj) {
  const sp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// Normalizes list response across multiple shapes
export function normalizeArray(res: any): any[] {
  if (!res) return [];

  // axios-like { data: ... }
  const root = res?.data ?? res;

  // common shapes
  const a =
    root?.data?.data ??
    root?.data?.items ??
    root?.data ??
    root?.items ??
    root?.results ??
    root;

  return Array.isArray(a) ? a : [];
}

// Normalizes meta / pagination across multiple shapes
export function normalizeMeta(res: any, fallback: { page: number; limit: number }): {
  page: number;
  limit: number;
  total: number;
  pages: number;
} {
  const root = res?.data ?? res;

  const meta =
    root?.meta ??
    root?.data?.meta ??
    root?.pagination ??
    root?.data?.pagination ??
    null;

  const page = Number(meta?.page ?? root?.page ?? fallback.page) || fallback.page;
  const limit = Number(meta?.limit ?? root?.limit ?? fallback.limit) || fallback.limit;
  const total = Number(meta?.total ?? root?.total ?? meta?.count ?? root?.count ?? 0) || 0;

  const pagesFromMeta = Number(meta?.pages ?? root?.pages ?? 0) || 0;
  const pages = pagesFromMeta || (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1);

  return { page, limit, total, pages };
}

export async function fetchJson(path: string, init?: RequestInit) {
  const base = getApiBase();
  if (!base) {
    throw new Error("Missing NEXT_PUBLIC_API_URL in .env.local");
  }

  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    // Next.js caching hint (safe default for product list)
    cache: "no-store",
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // non-json
  }

  if (!res.ok) {
    const msg =
      json?.message || json?.error || `Request failed (${res.status}) for ${url}`;
    throw new Error(msg);
  }

  return json;
}
