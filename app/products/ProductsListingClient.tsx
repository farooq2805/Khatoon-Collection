/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import productGroups from "@/config/productGroups.json";
import { FiChevronDown, FiX } from "react-icons/fi";

/* =========================
   TYPES
========================= */

type ProductSize = {
  id: number | string;

  size?: string | null;
  weight?: string | null;

  price?: number | string | null;
  discountPrice?: number | string | null;
  effectivePrice?: number | string | null;

  stockQuantity?: number | null;

  sku?: string | null;

  images?: any;
};

type ProductColor = {
  color: string;
  colorHex?: string | null;

  sizes?: ProductSize[];
};

type Product = {
  id: string | number;

  name?: string;
  title?: string;
  slug?: string;

  imageUrl?: string;
  mainImageUrl?: string;

  // Product-level pricing
  price?: number | string;
  discountPrice?: number | string;

  // NEW API STRUCTURE
  colors?: ProductColor[];

  // optional/legacy
  images?: any;
  image?: string;

  inStock?: boolean;

  stock?: number;
  stockQuantity?: number;

  createdAt?: string;
  colorSiblings?: any[];
};

type Pagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

/* =========================
   HELPERS
========================= */

function num(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function money(v: number) {
  return v.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
}

function getDiscountPercent(
  mrp: number,
  sale: number
) {
  if (!mrp || !sale || mrp <= sale)
    return null;

  return Math.round(
    ((mrp - sale) / mrp) * 100
  );
}

function getProductName(p: Product) {
  return (
    p.name ||
    p.title ||
    "Product"
  ).trim();
}

function getProductSlug(p: Product) {
  return p.slug
    ? String(p.slug)
    : String(p.id);
}

function getProductImage(p: Product) {
  const first =
    p.mainImageUrl ||
    p.imageUrl ||
    p.image ||
    (Array.isArray(p.images) &&
    p.images.length
      ? p.images[0]
      : "") ||
    "";

  if (
    !first &&
    Array.isArray(p.images) &&
    p.images[0]?.url
  ) {
    return p.images[0].url;
  }

  return first || "/placeholder.png";
}

/**
 * Variant-aware stock check
 */
function isSoldOut(p: Product) {
  if (typeof p.inStock === "boolean") {
    return !p.inStock;
  }

  // Variant stock
  if (Array.isArray(p.colors)) {
    const totalStock =
      p.colors.reduce((sum, color) => {
        const sizes = Array.isArray(
          color?.sizes
        )
          ? color.sizes
          : [];

        return (
          sum +
          sizes.reduce(
            (s, size) =>
              s +
              (Number(
                size.stockQuantity
              ) || 0),
            0
          )
        );
      }, 0);

    return totalStock <= 0;
  }

  // Fallback
  const s = num(
    (p as any).stockQuantity ??
      p.stock
  );

  if (s === null) return false;

  return s <= 0;
}

/**
 * Pricing helper
 */
function getSaleAndMrp(
  p: Product
): {
  sale: number;
  mrp: number;
} {
  const colors = Array.isArray(p.colors)
    ? p.colors
    : [];

  const saleCandidates: number[] = [];
  const mrpCandidates: number[] = [];

  // Product-level pricing
  const productSale = num(
    p.discountPrice
  );

  const productPrice = num(p.price);

  if (productSale !== null) {
    saleCandidates.push(productSale);
  }

  if (productPrice !== null) {
    saleCandidates.push(productPrice);
    mrpCandidates.push(productPrice);
  }

  // Variant pricing
  for (const color of colors) {
    const sizes = Array.isArray(
      color?.sizes
    )
      ? color.sizes
      : [];

    for (const size of sizes) {
      const salePrice =
        num(size.effectivePrice) ??
        num(size.discountPrice) ??
        num(size.price);

      const mrpPrice = num(size.price);

      if (salePrice !== null) {
        saleCandidates.push(salePrice);
      }

      if (mrpPrice !== null) {
        mrpCandidates.push(mrpPrice);
      }
    }
  }

  const sale = saleCandidates.length
    ? Math.min(...saleCandidates)
    : 0;

  const mrp = mrpCandidates.length
    ? Math.max(...mrpCandidates)
    : sale;

  return { sale, mrp };
}

/* =======================
   Mobile Filter/Sort UI
======================= */

type OverlayMode =
  | null
  | "filter"
  | "sort";

type FilterKey =
  | "size"
  | "colors"
  | "category"
  | "fabric"
  | "occasion"
  | "pattern"
  | "price"
  | "style"
  | "sleeve"
  | "neck";

const FILTER_SECTIONS: {
  key: FilterKey;
  label: string;
}[] = [
  { key: "size", label: "SIZE" },
  { key: "colors", label: "COLORS" },
  {
    key: "category",
    label: "CATEGORY",
  },
  { key: "fabric", label: "FABRIC" },
  {
    key: "occasion",
    label: "OCCASION",
  },
  {
    key: "pattern",
    label: "PATTERN AND PRINT",
  },
  { key: "price", label: "PRICE" },
  { key: "style", label: "STYLE" },
  {
    key: "sleeve",
    label: "SLEEVE LENGTH",
  },
  { key: "neck", label: "NECK" },
];

function MobileTopFilterSortBar({
  onFilter,
  onSort,
}: {
  onFilter: () => void;
  onSort: () => void;
}) {
  return (
    <div className="sm:hidden">
      <div className="grid grid-cols-2 border border-black/10 bg-white">
        <button
          type="button"
          onClick={onFilter}
          className="flex h-12 items-center justify-center gap-2 border-r text-[12px] font-semibold tracking-[0.22em] text-black"
        >
          <span>☰</span>
          FILTER
        </button>

        <button
          type="button"
          onClick={onSort}
          className="flex h-12 items-center justify-center gap-2 text-[12px] font-semibold tracking-[0.22em] text-black"
        >
          <span>⇅</span>
          SORT
        </button>
      </div>
    </div>
  );
}

function OverlayPanel({
  mode,
  onClose,
  sort,
  setQueryParam,
}: {
  mode: Exclude<
    OverlayMode,
    null
  >;

  onClose: () => void;

  sort:
    | "latest"
    | "price_asc"
    | "price_desc"
    | "clearance";

  setQueryParam: (
    key: string,
    value?: string
  ) => void;
}) {
  return (
    <div className="fixed inset-0 z-[2000] sm:hidden">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/20"
      />

      <div className="absolute inset-x-0 top-0 h-[92vh] bg-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="text-[18px] font-semibold text-black">
            {mode === "filter"
              ? "Filter"
              : "Sort"}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center"
          >
            <FiX size={22} />
          </button>
        </div>

        <div className="border-t border-black/10" />

        <div className="max-h-[calc(92vh-72px)] overflow-y-auto">
          {mode === "filter" ? (
            <div className="divide-y divide-black/10">
              {FILTER_SECTIONS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-5 text-left"
                >
                  <span className="text-[13px] font-semibold tracking-[0.28em] text-black">
                    {s.label}
                  </span>

                  <FiChevronDown />
                </button>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              <button
                type="button"
                onClick={() => {
                  setQueryParam(
                    "sort",
                    "latest"
                  );
                  onClose();
                }}
                className="flex w-full items-center justify-between px-4 py-5"
              >
                Latest
              </button>

              <button
                type="button"
                onClick={() => {
                  setQueryParam(
                    "sort",
                    "price_asc"
                  );
                  onClose();
                }}
                className="flex w-full items-center justify-between px-4 py-5"
              >
                Price: Low to High
              </button>

              <button
                type="button"
                onClick={() => {
                  setQueryParam(
                    "sort",
                    "price_desc"
                  );
                  onClose();
                }}
                className="flex w-full items-center justify-between px-4 py-5"
              >
                Price: High to Low
              </button>

              <button
                type="button"
                onClick={() => {
                  setQueryParam(
                    "sort",
                    "clearance"
                  );
                  onClose();
                }}
                className="flex w-full items-center justify-between px-4 py-5"
              >
                Clearance Sale
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =======================
   MAIN COMPONENT
======================= */

export default function ProductsListingClient({
  initialItems,
  initialPagination,
  page,
  limit,
}: {
  initialItems: Product[];
  initialPagination: Pagination | null;
  page: number;
  limit: number;
}) {
  const router = useRouter();

  const pathname = usePathname();

  const sp = useSearchParams();

  const [view, setView] =
    useState<"grid">("grid");

  const [overlay, setOverlay] =
    useState<OverlayMode>(null);

  const sort =
    ((sp?.get(
      "sort"
    ) as any) as
      | "latest"
      | "price_asc"
      | "price_desc"
      | "clearance") ||
    "latest";

  function setQueryParam(
    key: string,
    value?: string
  ) {
    const params = new URLSearchParams(
      sp?.toString() || ""
    );

    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    params.set("page", "1");

    router.push(
      `${pathname}?${params.toString()}`
    );
  }

  const sorted = useMemo(() => {
    const items = [
      ...(initialItems || []),
    ];

    if (sort === "latest") {
      items.sort((a, b) => {
        const da = a.createdAt
          ? new Date(
              a.createdAt
            ).getTime()
          : 0;

        const db = b.createdAt
          ? new Date(
              b.createdAt
            ).getTime()
          : 0;

        return db - da;
      });

      return items;
    }

    if (sort === "price_asc") {
      items.sort(
        (a, b) =>
          getSaleAndMrp(a).sale -
          getSaleAndMrp(b).sale
      );

      return items;
    }

    if (sort === "price_desc") {
      items.sort(
        (a, b) =>
          getSaleAndMrp(b).sale -
          getSaleAndMrp(a).sale
      );

      return items;
    }

    if (sort === "clearance") {
      return items
        .map((p) => {
          const { sale, mrp } = getSaleAndMrp(p);
          const discountPercent = getDiscountPercent(mrp, sale) || 0;
          return { ...p, discountPercent };
        })
        .filter((p) => p.discountPercent > 0)
        .sort((a, b) => b.discountPercent - a.discountPercent);
    }

    return items;
  }, [initialItems, sort]);

  const filteredSorted = useMemo(() => {
    return sorted;
  }, [sorted]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredSorted.slice(start, start + limit);
  }, [filteredSorted, page, limit]);

  const totalItems = filteredSorted.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / limit)
  );

  function goToPage(pn: number) {
    const next = Math.min(
      Math.max(1, pn),
      totalPages
    );

    const params = new URLSearchParams(
      sp?.toString() || ""
    );

    params.set("page", String(next));

    router.push(
      `${pathname}?${params.toString()}`
    );
  }

  return (
    <div className="w-full bg-white">
      <div className="mx-auto w-full px-2 py-3">
        <h1 className="text-center text-sm font-medium tracking-wide text-black/80">
          All Products
        </h1>

        {/* Mobile Controls */}
        <div className="mt-1 sm:hidden">
          <MobileTopFilterSortBar
            onFilter={() =>
              setOverlay("filter")
            }
            onSort={() =>
              setOverlay("sort")
            }
          />
        </div>

        {/* Desktop Controls */}
        <div className="mt-7 hidden items-center justify-between gap-4 text-[13px] text-black/60 sm:flex">
          <div className="flex items-center gap-5">
            <button>Filter</button>
          </div>

          <div className="flex items-center gap-4">
            <div>
              {totalItems} products
            </div>

            <select
              value={sort}
              onChange={(e) =>
                setQueryParam(
                  "sort",
                  e.target.value
                )
              }
              className="bg-transparent outline-none"
            >
              <option value="latest">
                Latest
              </option>

              <option value="price_asc">
                Price Low to High
              </option>

              <option value="price_desc">
                Price High to Low
              </option>

              <option value="clearance">
                Clearance Sale
              </option>
            </select>

            <select
              value={view}
              onChange={(e) =>
                setView(
                  e.target.value as any
                )
              }
              className="bg-transparent outline-none"
            >
              <option value="grid">
                Grid
              </option>
            </select>
          </div>
        </div>

        {/* PRODUCT GRID */}
        {paginatedItems.length === 0 ? (
          <div className="my-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center text-2xl text-gray-400">
              🛍️
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No products found</h3>
            <p className="text-sm text-gray-500 max-w-md">
              We couldn't find any products matching your selection, or the catalog is temporarily updating. Please check back shortly.
            </p>
            <button
              onClick={() => router.push("/products")}
              className="mt-5 px-5 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-gray-800 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-[2px] sm:grid-cols-3 lg:grid-cols-4">
            {paginatedItems.map((p) => {
            const slug =
              getProductSlug(p);

            const href = `/products/${encodeURIComponent(
              slug
            )}`;

            const img =
              getProductImage(p);

            const soldOut =
              isSoldOut(p);

            const { sale, mrp } =
              getSaleAndMrp(p);

            const discount =
              getDiscountPercent(
                mrp,
                sale
              );

            return (
              <Link
                key={String(p.id)}
                href={href}
                className="group block"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f6f6f6]">
                  <Image
                    src={img}
                    alt={getProductName(p)}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />

                  {(soldOut ||
                    mrp > sale) && (
                    <div className="absolute top-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">
                      {soldOut
                        ? "SOLD OUT"
                        : "SALE"}
                    </div>
                  )}
                </div>

                <div className="mt-2 px-1">
                  <div className="line-clamp-1 text-[14px] font-medium text-black/80">
                    {getProductName(p)}
                  </div>

                  {/* Color row */}
                  {(() => {
                    const siblings = p.colorSiblings || [];
                    const currentSiblingColor = siblings.find((s: any) => Number(s.id) === Number(p.id))?.color || "";
                    if (siblings.length === 0) return null;
                    return (
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-[#f57bb4] bg-[#f57bb4]/5 border border-[#f57bb4]/20 rounded-md px-1.5 py-0.5 uppercase tracking-wide">
                          {currentSiblingColor || "Default"}
                        </span>
                        {siblings.length > 1 && (
                          <span className="text-[10px] text-gray-500 font-medium">
                            +{siblings.length - 1} Colors
                          </span>
                        )}
                      </div>
                    );
                  })()}

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[14px]">
                    <span className="font-semibold text-black">
                      ₹{money(sale)}
                    </span>

                    {mrp > sale ? (
                      <>
                        <span className="text-gray-500">
                          MRP{" "}
                          <span className="line-through">
                            ₹
                            {money(mrp)}
                          </span>
                        </span>

                        {discount !==
                        null ? (
                          <span className="font-semibold text-green-600">
                            {
                              discount
                            }
                            % off
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-gray-500">
                        MRP Inclusive
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        )}

        {/* PAGINATION */}
        <div className="mt-10 flex items-center justify-center gap-2 text-sm">
          <button
            onClick={() =>
              goToPage(page - 1)
            }
            disabled={page <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 transition hover:bg-gray-100 disabled:opacity-30"
          >
            ←
          </button>

          {Array.from({
            length: totalPages,
          })
            .slice(0, 7)
            .map((_, idx) => {
              const pn = idx + 1;

              const active =
                pn === page;

              return (
                <button
                  key={pn}
                  onClick={() =>
                    goToPage(pn)
                  }
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                    active
                      ? "bg-black text-white"
                      : "border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {pn}
                </button>
              );
            })}

          <button
            onClick={() =>
              goToPage(page + 1)
            }
            disabled={
              page >= totalPages
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 transition hover:bg-gray-100 disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>

      {/* Overlay */}
      {overlay ? (
        <OverlayPanel
          mode={overlay}
          onClose={() =>
            setOverlay(null)
          }
          sort={sort}
          setQueryParam={
            setQueryParam
          }
        />
      ) : null}
    </div>
  );
}