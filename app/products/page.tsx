/* eslint-disable @typescript-eslint/no-explicit-any */
// app/products/page.tsx

import ProductsListingClient from "./ProductsListingClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://khatooncollection.in/api"; // ✅ fixed https://

type SearchParams = {
  page?: string;
  q?: string;
  category?: string;
  subcategory?: string;
};

async function getProducts(params: {
  page: number;
  limit: number;
  q?: string;
  category?: string;
  subcategory?: string;
}) {
  const { page, limit, q, category, subcategory } = params;

  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("limit", String(limit));

  // ✅ forward filters to backend (backend can use/ignore)
  if (q) qs.set("q", q);
  if (category) qs.set("category", category);
  if (subcategory) qs.set("subcategory", subcategory);

  const url = `${API_BASE}/publicproducts?${qs.toString()}`;

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return { items: [], pagination: null };

  const json = await res.json();
  const data = json?.data;
  const items = Array.isArray(data) ? data : data?.items || [];
  const pagination = data?.pagination || json?.pagination || null;

  return { items, pagination };
}

// ✅ Next.js 15+ expects `searchParams` to be a Promise in PageProps typing
export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};

  const page = Math.max(1, Number(sp.page ?? "1"));
  const limit = 16;

  const q = sp.q?.trim() || "";
  const category = sp.category?.trim() || "";
  const subcategory = sp.subcategory?.trim() || "";

  const { items, pagination } = await getProducts({
    page,
    limit,
    q: q || undefined,
    category: category || undefined,
    subcategory: subcategory || undefined,
  });

  return (
    <ProductsListingClient
      initialItems={items}
      initialPagination={pagination}
      page={page}
      limit={limit}
    />
  );
}
