/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import SafeImage from "@/components/common/SafeImage";

type SubCategory = { id: number; name: string; slug: string };
type Category = {
  id: number;
  name: string;
  slug: string;

  // ✅ any of these may exist from your backend
  imageUrl?: string | null;
  iconUrl?: string | null;
  thumbnailUrl?: string | null;
  mainImageUrl?: string | null;

  subCategories?: SubCategory[];
};

type Props = {
  apiBase: string;
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
};

const THEME = "#f57bb4";

function initials(name: string) {
  const parts = (name || "").trim().split(" ").filter(Boolean);
  const a = parts[0]?.[0] || "•";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}

function pickCatImg(c: Category) {
  const v =
    c.imageUrl || c.iconUrl || c.thumbnailUrl || c.mainImageUrl || "";
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

export default function MobileCategoryRail({
  apiBase,
  activeCategory,
  onSelectCategory,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/categories`, { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        setCategories(Array.isArray(json?.data) ? json.data : []);
      } catch {
        if (!alive) return;
        setCategories([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [apiBase]);

  const list = useMemo(() => categories, [categories]);

  return (
    <aside className="w-[86px] flex-shrink-0">
      <div className="sticky top-[120px]">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="max-h-[calc(100vh-160px)] overflow-y-auto">
            {loading ? (
              <div className="px-2 py-2 space-y-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="py-2 flex flex-col items-center gap-1.5">
                    <div className="h-10 w-10 rounded-xl bg-gray-100 animate-pulse" />
                    <div className="h-3 w-14 rounded bg-gray-100 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-1">
                {list.map((c) => {
                  const isActive = c.slug === activeCategory;
                  const img = pickCatImg(c);

                  return (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => onSelectCategory(c.slug)}
                      className="w-full text-left"
                    >
                      <div
                        className="relative px-1 py-2 flex flex-col items-center gap-1"
                        style={{ background: isActive ? "#fdf2fb" : "white" }}
                      >
                        {isActive ? (
                          <span
                            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r"
                            style={{ backgroundColor: THEME }}
                          />
                        ) : null}

                        <div
                          className="h-10 w-10 rounded-xl border bg-white overflow-hidden flex items-center justify-center"
                          style={{ borderColor: isActive ? THEME : "#e5e7eb" }}
                        >
                          {img ? (
                            <SafeImage
                              src={img}
                              alt={c.name}
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <div
                              className="text-[11px] font-extrabold"
                              style={{ color: isActive ? THEME : "#6b7280" }}
                            >
                              {initials(c.name)}
                            </div>
                          )}
                        </div>

                        <div
                          className="text-[9.5px] leading-[12px] text-center line-clamp-2 px-1"
                          style={{
                            color: isActive ? THEME : "#374151",
                            fontWeight: isActive ? 700 : 500,
                          }}
                        >
                          {c.name}
                        </div>
                      </div>

                      <div className="mx-2 border-b border-gray-100" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
