/* eslint-disable @typescript-eslint/no-explicit-any */
// app/products/page.tsx

export const revalidate = 60;

import ProductsListingClient from "./ProductsListingClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://api.khatooncollection.in/api";

type SearchParams = {
  page?: string;
  q?: string;
  category?: string;
  subcategory?: string;
  sort?: string;
};

async function getProducts(params: {
  page: number;
  limit: number;
  q?: string;
  category?: string;
  subcategory?: string;
  sort?: string;
}) {
  const { page, limit, q, category, subcategory, sort } = params;

  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("limit", String(limit));
  if (sort) qs.set("sort", sort);

  // ✅ forward filters to backend
  if (q) qs.set("q", q);
  if (category) qs.set("category", category);
  if (subcategory) qs.set("subcategory", subcategory);

  const url = `${API_BASE}/publicproducts?${qs.toString()}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { items: [], pagination: null };

    const json = await res.json();
    const data = json?.data;
    const items = Array.isArray(data) ? data : data?.items || [];
    const pagination = json?.pagination || data?.pagination || null;

    return { items, pagination };
  } catch (err) {
    console.error("❌ Failed to fetch products in getProducts:", err);
    return { items: [], pagination: null };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};

  const page = Math.max(1, Number(sp.page ?? "1"));
  const sort = sp.sort?.trim() || "newest";
  const limit = 16; // ✅ Server-side pagination: fetch ONLY current page

  const q = sp.q?.trim() || "";
  const category = sp.category?.trim() || "";
  const subcategory = sp.subcategory?.trim() || "";

  // Map frontend sort values to backend sort values
  const backendSort =
    sort === "clearance" ? "newest" :  // clearance is client-side filtered
    sort === "latest" ? "newest" :
    sort; // price_asc, price_desc passed directly

  const { items, pagination } = await getProducts({
    page,
    limit,
    sort: backendSort,
    q: q || undefined,
    category: category || undefined,
    subcategory: subcategory || undefined,
  });

  // Filter out test products (any name/slug containing "test", or known bad IDs)
  const uniqueItems = items.filter((p: any) => {
    const name = (p.name || "").toLowerCase();
    const slug = (p.slug || "").toLowerCase();
    const isTest =
      name.includes("test") ||
      slug.includes("test") ||
      p.id === 252 ||
      name === "big size for daily";
    return !isTest;
  });

  const computedPagination = pagination
    ? {
        page: pagination.page ?? page,
        limit: pagination.limit ?? limit,
        totalItems: pagination.totalItems ?? uniqueItems.length,
        totalPages: pagination.totalPages ?? Math.max(1, Math.ceil((pagination.totalItems ?? uniqueItems.length) / limit)),
      }
    : {
        page,
        limit,
        totalItems: uniqueItems.length,
        totalPages: Math.max(1, Math.ceil(uniqueItems.length / limit)),
      };

  return (
    <ProductsListingClient
      initialItems={uniqueItems}
      initialPagination={computedPagination}
      page={page}
      limit={limit}
      sort={sort}
    />
  );
}
