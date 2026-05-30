
/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import FiltersSidebar from "@/components/products/FiltersSidebar";
import ProductsGrid from "@/components/products/ProductsGrid";
import Pagination from "@/components/products/Pagination";
import ProductsListMobile from "@/components/products/ProductsListMobile";
import productGroups from "@/config/productGroups.json";
import MobileCategoryRail from "@/components/products/MobileCategoryRail";

 //const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6103/api";
 const API_BASE =
   process.env.NEXT_PUBLIC_API_URL || "https://api.khatooncollection.in/api";

const THEME = "#f57bb4";

type ProductListResponse = {
  success: boolean;
  data: any[];
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

function titleFromSlug(slug: string) {
  if (!slug) return "";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ProductsPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    totalItems: 0,
    totalPages: 1,
  });

  const filteredItems = useMemo(() => {
    const seenGroupIds = new Set<string>();
    const out: any[] = [];
    
    for (const p of items) {
      const pIdStr = String(p.id);
      const siblings = (productGroups as Record<string, any>)[pIdStr];
      
      if (siblings && siblings.length > 0) {
        const siblingIds = siblings.map((s: any) => Number(s.id));
        const repId = Math.min(...siblingIds);
        
        if (seenGroupIds.has(String(repId))) {
          continue;
        }
        seenGroupIds.add(String(repId));
      }
      out.push(p);
    }
    return out;
  }, [items]);

  // mobile sheets
  const [openFilter, setOpenFilter] = useState(false);
  const [openSort, setOpenSort] = useState(false);

  const category = sp.get("category") || "";
  const subCategory = sp.get("subCategory") || "";
  const q = sp.get("q") || "";
  const minPrice = sp.get("minPrice") || "";
  const maxPrice = sp.get("maxPrice") || "";
  const sort = sp.get("sort") || "newest";
  const page = Number(sp.get("page") || "1");
  const limit = Number(sp.get("limit") || "15");

  const queryObj = useMemo(() => {
    const obj: Record<string, string> = {};
    if (category) obj.category = category;
    if (subCategory) obj.subCategory = subCategory;
    if (q) obj.q = q;
    if (minPrice) obj.minPrice = minPrice;
    if (maxPrice) obj.maxPrice = maxPrice;
    if (sort) obj.sort = sort;
    obj.page = String(page);
    obj.limit = String(limit);
    return obj;
  }, [category, subCategory, q, minPrice, maxPrice, sort, page, limit]);

  function pushQuery(next: Record<string, string | number | null | undefined>) {
    const merged: Record<string, string> = { ...queryObj };

    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === undefined || v === "") delete merged[k];
      else merged[k] = String(v);
    });

    const qs = new URLSearchParams(merged).toString();
    router.push(`/products?${qs}`);
  }

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);

        const url = new URL(`${API_BASE}/publicproducts`);
        Object.entries(queryObj).forEach(([k, v]) => url.searchParams.set(k, v));

        const res = await fetch(url.toString(), { cache: "no-store" });
        const json: ProductListResponse = await res.json();

        if (!alive) return;

        if (json?.success) {
          setItems(Array.isArray(json.data) ? json.data : []);
          setPagination(
            json.pagination || {
              page: 1,
              limit: 15,
              totalItems: 0,
              totalPages: 1,
            }
          );
        } else {
          setItems([]);
          setPagination({ page: 1, limit: 15, totalItems: 0, totalPages: 1 });
        }
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setItems([]);
        setPagination({ page: 1, limit: 15, totalItems: 0, totalPages: 1 });
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [queryObj]);

  const pageTitle =
    titleFromSlug(subCategory) ||
    titleFromSlug(category) ||
    (q ? `Search results for "${q}"` : "Products");

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <div className="mx-auto max-w-7xl px-3 md:px-6 py-4 md:py-6">
        {/* ✅ Breadcrumb + Title */}
        <div className="mb-3">
          <div className="text-[12px] text-gray-500">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="mx-1">›</span>
            <Link href="/products" className="hover:underline">
              Products
            </Link>

            {category ? (
              <>
                <span className="mx-1">›</span>
                <span className="text-gray-700">{titleFromSlug(category)}</span>
              </>
            ) : null}

            {subCategory ? (
              <>
                <span className="mx-1">›</span>
                <span className="text-gray-900 font-semibold">
                  {titleFromSlug(subCategory)}
                </span>
              </>
            ) : null}
          </div>

          <div className="mt-2 text-[18px] md:text-[20px] font-bold text-gray-900">
            {pageTitle}
          </div>
        </div>

        {/* ✅ Promo banner strip placeholder (desktop only) */}
        <div className="hidden md:block mb-4">
          <div className="h-[88px] rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
            Promo banner / category banner (optional)
          </div>
        </div>

        {/* ✅ Top row: results + sort + view icons (desktop only) */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredItems.length}
            </span>{" "}
            Products
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="text-sm text-gray-600">Sort:</div>
            <select
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#f57bb4]/30"
              value={sort}
              onChange={(e) => pushQuery({ sort: e.target.value, page: 1 })}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-9 w-9 rounded-lg border bg-white text-gray-600"
                title="Grid view"
              >
                ▦
              </button>
              <button
                type="button"
                className="h-9 w-9 rounded-lg border bg-white text-gray-600"
                title="List view"
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* ✅ MOBILE top pills row (1mg style) */}
        <div className="md:hidden sticky top-[64px] z-30 -mx-3 px-3">
          <div className="bg-[#f5f6f8] py-2">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpenSort(true)}
                className="h-9 px-4 rounded-full border bg-white text-[12px] font-semibold text-gray-800 flex items-center gap-2"
              >
                Sort <span className="text-gray-500">⇅</span>
              </button>

              <button
                type="button"
                onClick={() => setOpenFilter(true)}
                className="h-9 px-4 rounded-full border bg-white text-[12px] font-semibold text-gray-800 flex items-center gap-2"
              >
                All filters <span className="text-gray-500">🎚</span>
              </button>
            </div>
          </div>
        </div>

        {/* ✅ MAIN LAYOUT */}
        <div className="mt-4">
          {/* ✅ MOBILE: left rail + right list (1mg style) */}
          <div className="md:hidden flex gap-3">
            <MobileCategoryRail
              apiBase={API_BASE}
              activeCategory={category}
              onSelectCategory={(slug) =>
                pushQuery({ category: slug, subCategory: "", page: 1 })
              }
            />

            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-200 rounded-xl p-3 animate-pulse"
                    >
                      <div className="flex gap-3">
                        <div className="w-[88px] h-[88px] rounded-lg bg-gray-100 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="h-4 w-4/5 bg-gray-100 rounded mb-2" />
                          <div className="h-3 w-2/5 bg-gray-100 rounded mb-2" />
                          <div className="h-3 w-3/5 bg-gray-100 rounded mb-3" />
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="h-4 w-24 bg-gray-100 rounded mb-2" />
                              <div className="h-3 w-16 bg-gray-100 rounded" />
                            </div>
                            <div className="h-8 w-20 bg-gray-100 rounded-lg" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ProductsListMobile items={filteredItems as any} />
              )}

              <div className="mt-6">
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  onChange={(p) => pushQuery({ page: p })}
                />
              </div>
            </div>
          </div>

          {/* ✅ DESKTOP: your existing sidebar + grid (unchanged) */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
            {/* Desktop Sidebar only */}
            <div className="hidden lg:block">
              <FiltersSidebar
                apiBase={API_BASE}
                activeCategory={category}
                activeSubCategory={subCategory}
                q={q}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onApply={(next) => pushQuery({ ...next, page: 1 })}
                onClear={() => router.push("/products")}
                variant="desktop"
              />
            </div>

            {/* Products */}
            <div>
              {loading ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[260px] rounded-xl bg-white border border-gray-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <ProductsGrid items={filteredItems as any} />
              )}

              <div className="mt-6">
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  onChange={(p) => pushQuery({ page: p })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE FILTER SHEET */}
      {openFilter ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenFilter(false)}
          />
          <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl p-4 max-h-[82vh] overflow-auto">
            <div className="h-1.5 w-16 bg-gray-200 rounded-full mx-auto mb-3" />
            <FiltersSidebar
              apiBase={API_BASE}
              activeCategory={category}
              activeSubCategory={subCategory}
              q={q}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onApply={(next) => pushQuery({ ...next, page: 1 })}
              onClear={() => router.push("/products")}
              variant="mobile"
              onClose={() => setOpenFilter(false)}
            />
          </div>
        </div>
      ) : null}

      {/* MOBILE SORT SHEET */}
      {openSort ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenSort(false)}
          />
          <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl p-4">
            <div className="h-1.5 w-16 bg-gray-200 rounded-full mx-auto mb-3" />
            <div className="text-base font-semibold text-gray-900 mb-4">
              Sort
            </div>

            {[
              { label: "Newest", value: "newest" },
              { label: "Price: Low to High", value: "price_asc" },
              { label: "Price: High to Low", value: "price_desc" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  pushQuery({ sort: opt.value, page: 1 });
                  setOpenSort(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl border mb-2"
                style={{
                  borderColor: sort === opt.value ? THEME : "#e5e7eb",
                  background: sort === opt.value ? "#fdf2fb" : "white",
                  color: sort === opt.value ? THEME : "#111827",
                  fontWeight: sort === opt.value ? 700 : 500,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
