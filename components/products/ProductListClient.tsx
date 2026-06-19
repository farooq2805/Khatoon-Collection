/* eslint-disable @typescript-eslint/no-explicit-any */
// components/products/ProductListClient.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FiltersSidebar from "@/components/products/FiltersSidebar";
import ProductsGrid from "@/components/products/ProductsGrid";
import Pagination from "@/components/products/Pagination";
import productGroups from "@/config/productGroups.json";

//const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6103/api";
 const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.khatooncollection.in";


type ProductsResponse = {
  success: boolean;
  data: any[];
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

export default function ProductListClient() {
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
    return items.filter((p: any) => {
      const name = (p.name || "").toLowerCase();
      const slug = (p.slug || "").toLowerCase();
      const isTest =
        name.includes("test") ||
        slug.includes("test") ||
        p.id === 252 ||
        name === "big size for daily";
      return !isTest;
    });
  }, [items]);

  // URL state
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

    router.push(`/products?${new URLSearchParams(merged).toString()}`);
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        const url = new URL(`${API_BASE}/publicproducts`);
        Object.entries(queryObj).forEach(([k, v]) => url.searchParams.set(k, v));

        const res = await fetch(url.toString(), { cache: "no-store" });
        const json: ProductsResponse = await res.json();

        if (!alive) return;

        if (json?.success) {
          setItems(Array.isArray(json.data) ? json.data : []);
          setPagination(
            json.pagination || { page: 1, limit: 15, totalItems: 0, totalPages: 1 }
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

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <div className="mx-auto max-w-7xl px-3 md:px-6 py-4 md:py-6">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">{filteredItems.length}</span>{" "}
            Products (Total:{" "}
            <span className="font-semibold text-gray-900">{pagination.totalItems}</span>)
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3">
            <div className="text-sm text-gray-600">Sort by:</div>
            <select
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#f57bb4]/30"
              value={sort}
              onChange={(e) => pushQuery({ sort: e.target.value, page: 1 })}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          {/* Sidebar (matches current FiltersSidebar props) */}
          <FiltersSidebar
            apiBase={API_BASE}
            activeCategory={category}
            activeSubCategory={subCategory}
            q={q}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onApply={(next) => pushQuery({ ...next, page: 1 })}
            onClear={() => router.push("/products")} theme={""}          />

          {/* Products */}
          <div>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[340px] rounded-2xl bg-white border border-gray-100 animate-pulse"
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
  );
}
