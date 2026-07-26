

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

type Category = {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
};

const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'>
    <rect width='100%' height='100%' fill='#f3f4f6'/>
    <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle'
      font-family='Arial' font-size='44' fill='#9ca3af'>No Image</text>
  </svg>`);

export default function CategoryStrip({ initialData }: { initialData?: Category[] }) {
  const [cats, setCats] = useState<Category[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;

    async function load() {
      try {
        const res = await fetch("https://api.khatooncollection.in/api/categories", {
          cache: "no-store",
        });
        const json = await res.json();
        setCats(Array.isArray(json?.data) ? json.data : []);
      } catch (e) {
        console.log("❌ categories fetch error", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [initialData]);

  return (
    <section className="w-full bg-white">
      {/* edge-to-edge like screenshot */}
      <div className="mx-auto w-full max-w-[1500px] px-0">
        {/* Title */}
        <div className="py-6 sm:py-8">
          <h2 className="text-center font-serif text-[20px] sm:text-[28px] tracking-[0.14em] text-black">
            SHOP <span className="tracking-[0.06em] lowercase">by</span>{" "}
            <span className="uppercase">CATEGORIES</span>
          </h2>
        </div>

        {/* Grid: mobile 3 cols with 2px gap, desktop 6 cols */}
        <div
          className="
            grid
            grid-cols-3
            gap-[2px]
            lg:grid-cols-6
            lg:gap-2
          "
        >
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100 animate-pulse"
                />
              ))
            : cats.slice(0, 12).map((c, i) => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="group relative aspect-[4/5] w-full overflow-hidden bg-gray-100"
                  aria-label={c.name}
                >
                  <Image
                    src={getOptimizedImageUrl(c.imageUrl, 500) || FALLBACK}
                    alt={c.name}
                    fill
                    priority={false}
                    sizes="(max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />

                  {/* Bottom fade */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Label */}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-center pb-3">
                    <div className="px-2 text-center text-[13px] sm:text-[16px] font-semibold uppercase tracking-[0.18em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
                      {c.name}
                    </div>
                  </div>

                  {/* thin white separators like screenshot */}
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-white/80" />
                </Link>
              ))}
        </div>

        <div className="h-5 sm:h-5" />
      </div>
    </section>
  );
}
