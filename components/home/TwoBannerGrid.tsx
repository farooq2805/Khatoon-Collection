"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

type BannerGridApiData = {
  id: string;
  banner1ImageUrl: string;
  banner1CtaUrl: string;
  banner2ImageUrl: string;
  banner2CtaUrl: string;
  createdAt: string;
  updatedAt: string;
};

type BannerGridApiResponse = {
  success: boolean;
  data?: BannerGridApiData;
};

type BannerItem = {
  image: string;
  href: string;
};

export default function TwoBannerGrid({ initialData }: { initialData?: any }) {
  const API_URL = "https://api.khatooncollection.in/api/banner-grid";

  const [loading, setLoading] = useState(!initialData);
  const [banners, setBanners] = useState<BannerItem[] | null>(() => {
    if (initialData) {
      const d = initialData;
      if (
        d.banner1ImageUrl &&
        d.banner1CtaUrl &&
        d.banner2ImageUrl &&
        d.banner2CtaUrl
      ) {
        return [
          { image: d.banner1ImageUrl, href: d.banner1CtaUrl },
          { image: d.banner2ImageUrl, href: d.banner2CtaUrl },
        ];
      }
    }
    return null;
  });

  useEffect(() => {
    if (initialData) return;

    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch(API_URL, {
          method: "GET",
          cache: "no-store",
          signal: ac.signal,
        });

        if (!res.ok) {
          setBanners(null);
          return;
        }

        const json = (await res.json()) as BannerGridApiResponse;

        if (!json?.success || !json?.data) {
          setBanners(null);
          return;
        }

        const d = json.data;

        // STRICT: image + CTA only
        if (
          !d.banner1ImageUrl ||
          !d.banner1CtaUrl ||
          !d.banner2ImageUrl ||
          !d.banner2CtaUrl
        ) {
          setBanners(null);
          return;
        }

        setBanners([
          { image: d.banner1ImageUrl, href: d.banner1CtaUrl },
          { image: d.banner2ImageUrl, href: d.banner2CtaUrl },
        ]);
      } catch {
        setBanners(null);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [initialData]);

  // STRICT RENDER RULES
  if (loading) return null;
  if (!banners || banners.length === 0) return null;

  return (
    <section className="w-full bg-white py-4">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-6 md:grid-cols-2">
          {banners.map((b, idx) => (
            <Link
              key={idx}
              href={b.href}
              className="
                block overflow-hidden rounded-2xl
                border border-[#f57bb4]/20 bg-white
                shadow-sm transition
                hover:border-[#f57bb4]/50 hover:shadow-md
              "
            >
              {/* ✅ AUTO HEIGHT BANNER (NO CROP) */}
              <Image
                src={getOptimizedImageUrl(b.image, 1000)}
                alt="Promotional Banner"
                width={1600}
                height={600}
                className="h-auto w-full object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
