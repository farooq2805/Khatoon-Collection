/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import Image from "next/image";

type Variant = {
  price: number;
  discountPrice: number | null;
  effectivePrice?: number | null;
};

type Product = {
  id: number;
  slug: string;
  name: string;
  imageUrl: string | null;
  mainImageUrl: string | null;
  price?: number | null;
  discountPrice?: number | null;
  variants?: Variant[];
};

const formatRs = (n: number) =>
  `Rs. ${n
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

function safeImg(v: any) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length && s !== "null" && s !== "undefined" ? s : null;
}

function pickMainImage(p: Product) {
  return safeImg(p.imageUrl) || safeImg(p.mainImageUrl) || "/placeholder.png";
}

function pickPrice(p: Product) {
  const v = Array.isArray(p.variants) && p.variants.length ? p.variants[0] : null;

  const mrp = Number(v?.price ?? p.price ?? 0);
  const sale = Number(
    v?.effectivePrice ??
      v?.discountPrice ??
      p.discountPrice ??
      v?.price ??
      p.price ??
      0
  );

  // screenshot shows only one price line → show sale if valid else mrp
  const show = sale > 0 ? sale : mrp;
  return show > 0 ? show : null;
}

export default function RelatedFashionCard({ product }: { product: Product }) {
  const img = pickMainImage(product);
  const price = pickPrice(product);

  return (
    <Link href={`/products/${product.slug}`} className="block">
      {/* Tall fashion image (no border, minimal) */}
      <div className="relative w-full overflow-hidden bg-transparent">
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Name + price */}
      <div className="pt-3">
        <div className="text-[13px] font-medium leading-snug text-black/80 line-clamp-1 md:text-[14px]">
          {product.name}
        </div>
        {price !== null ? (
          <div className="mt-1 text-[14px] font-semibold text-black md:text-[15px]">
            {formatRs(price)}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
