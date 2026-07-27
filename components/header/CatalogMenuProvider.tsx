/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { MenuItem } from "./menuData";

type Ctx = {
  menu: MenuItem[];
  loading: boolean;
};

const CatalogMenuContext = createContext<Ctx>({ menu: [], loading: true });

// function normalizeArray(res: any): any[] {
//   if (!res) return [];
//   if (Array.isArray(res)) return res;

//   const d =
//     res?.data?.data ??
//     res?.data?.items ??
//     res?.data?.categories ??
//     res?.data?.subcategories ??
//     res?.categories ??
//     res?.subcategories ??
//     res?.items ??
//     res?.success?.data ??
//     res?.success?.categories ??
//     res?.success?.subcategories ??
//     [];

//   return Array.isArray(d) ? d : [];
// }

function normalizeArray(res: any): any[] {
  if (!res) return [];

  // ✅ If the response itself is already an array
  if (Array.isArray(res)) return res;

  // ✅ Your backend returns: { success:true, data:[...] }
  if (Array.isArray(res.data)) return res.data;

  // ✅ Other common shapes
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.data?.items)) return res.data.items;
  if (Array.isArray(res.data?.data)) return res.data.data;

  return [];
}


function pickImage(x: any): string | undefined {
  return x?.imageUrl || x?.image || x?.thumbnail || x?.icon || x?.banner;
}

// function slugOrIdHref(cat: any) {
//   const slug = cat?.slug || cat?.handle;
//   const id = cat?.id ?? cat?.categoryId;
//   if (slug) return `/category/${slug}`;
//   if (id) return `/category/${id}`;
//   return "/products";
// }


function slugOrIdHref(cat: any) {
  const slug = cat?.slug || cat?.handle;
  const id = cat?.id ?? cat?.categoryId;

  // ✅ always open products page with filter
  if (slug) return `/products?category=${encodeURIComponent(String(slug))}`;
  if (id) return `/products?category=${encodeURIComponent(String(id))}`;
  return "/products";
}


function buildMenu(categories: any[], subcategories: any[]): MenuItem[] {
  const byCat = new Map<string, any[]>();

  for (const s of subcategories) {
    const cid =
      s?.categoryId ??
      s?.category_id ??
      s?.parentId ??
      s?.parent_id ??
      s?.category?.id ??
      s?.category?.categoryId;

    if (cid === undefined || cid === null || cid === "") continue;

    const key = String(cid);
    if (!byCat.has(key)) byCat.set(key, []);
    byCat.get(key)!.push(s);
  }

  const nav: MenuItem[] = categories
    .filter(Boolean)
    .map((c) => {
      const cid = String(c?.id ?? c?.categoryId ?? "");
      const subs = (byCat.get(cid) ?? []).slice(0, 8);

      const hrefCat = slugOrIdHref(c);

      const children = subs.map((s) => {
        const slug = s?.slug || s?.handle;
        const id = s?.id ?? s?.subCategoryId;

       const href =
  slug
    ? `/products?subcategory=${encodeURIComponent(String(slug))}`
    : id
    ? `/products?subcategory=${encodeURIComponent(String(id))}`
    : `/products?subcategory=${encodeURIComponent(String(s?.name ?? ""))}`;


        return { label: String(s?.name ?? s?.title ?? "Subcategory"), href };
      });

      const bubbles = subs.slice(0, 5).map((s) => {
        const slug = s?.slug || s?.handle;
        const id = s?.id ?? s?.subCategoryId;

        const href =
          slug ? `/subcategory/${slug}` :
          id ? `/subcategory/${id}` :
          `${hrefCat}?sub=${encodeURIComponent(String(s?.name ?? ""))}`;

        return {
          label: String(s?.name ?? s?.title ?? "Item"),
          href,
          img: pickImage(s) || pickImage(c),
        };
      });

      return {
        label: String(c?.name ?? c?.title ?? "Category"),
        href: hrefCat,
        children,
        bubbles,
      };
    });

  // always ensure "See all"
  return nav.map((item) => ({
    ...item,
    children: item.children?.length
      ? [...item.children, { label: "See all", href: item.href || "/products" }]
      : [{ label: "See all", href: item.href || "/products" }],
    bubbles: item.bubbles ?? [],
  }));
}

async function fetchJson(url: string) {
  console.log("📡 fetching:", url);
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fetch failed ${res.status} ${url} ${text}`);
  }
  return res.json();
}

export function CatalogMenuProvider({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🚀 CatalogMenuProvider mounted");

    let alive = true;

    (async () => {
      try {
        const api = (process.env.NEXT_PUBLIC_API_URL || "https://api.khatooncollection.in/api").replace(/\/$/, "");
        console.log("API BASE:", api);

        const [catRes, subRes] = await Promise.all([
          fetchJson(`${api}/categories`),
          fetchJson(`${api}/subcategories`),
        ]);

        const categories = normalizeArray(catRes);
        const subcategories = normalizeArray(subRes);

        console.log("✅ categories count:", categories.length);
        console.log("✅ subcategories count:", subcategories.length);

        const built = buildMenu(categories, subcategories);

        console.log("🧭 built menu count:", built.length);

        if (alive) setMenu(built);
      } catch (e) {
        console.error("❌ CatalogMenuProvider error:", e);
        if (alive) setMenu([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(() => ({ menu, loading }), [menu, loading]);

  return <CatalogMenuContext.Provider value={value}>{children}</CatalogMenuContext.Provider>;
}

export function useCatalogMenu() {
  return useContext(CatalogMenuContext);
}
