/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";

const THEME = "#f57bb4";

type Variant = {
  id: number;
  weight: string | null;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  price: number;
  discountPrice: number | null;
  effectivePrice?: number | null;
  stockQuantity: number;
  sku: string;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  productType?: string | null;

  imageUrl: string | null;
  mainImageUrl: string | null;

  price?: number | null;
  discountPrice?: number | null;

  variants?: Variant[];
};

const INR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    Number.isFinite(n) ? n : 0
  );

const pctOff = (mrp: number, sale: number) => {
  if (!mrp || !sale || mrp <= sale) return 0;
  return Math.round(((mrp - sale) / mrp) * 100);
};

function safeImg(v: any) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

function pickMainImage(p: Product) {
  return safeImg(p.imageUrl) || safeImg(p.mainImageUrl) || "/placeholder.png";
}

function variantLabel(v: Variant) {
  const parts: string[] = [];
  if (v.size) parts.push(v.size);
  if (v.weight) parts.push(v.weight);
  if (v.color) parts.push(v.color);
  return parts.length ? parts.join(" • ") : "";
}

export default function ProductRowCardMobile({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const { addToCart } = useCart();

  const variants: Variant[] = useMemo(
    () => (Array.isArray(product.variants) ? product.variants : []),
    [product.variants]
  );

  const hasVariantForCart = variants.length > 0;

  const firstInStockVariant = useMemo(
    () => variants.find((v) => (v.stockQuantity ?? 0) > 0) || (variants.length > 0 ? variants[0] : null),
    [variants]
  );

  const [selected, setSelected] = useState<Variant | null>(firstInStockVariant);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setSelected(firstInStockVariant);
  }, [product.id, firstInStockVariant]);

  const v = selected || firstInStockVariant;

  const mrp = Number(v?.price ?? product.price ?? 0);
  const sale = Number(
    v?.effectivePrice ??
      v?.discountPrice ??
      product.discountPrice ??
      v?.price ??
      product.price ??
      0
  );
  const off = pctOff(mrp, sale);
  const inStock = (v?.stockQuantity ?? 0) > 0;

  const img = pickMainImage(product);
  const badge = index % 3 === 1 ? "Bestseller" : index % 3 === 0 ? "Trending" : "";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3">
      <div className="flex gap-3">
        {/* image */}
        <Link
          href={`/products/${product.slug}`}
          className="relative w-[88px] h-[88px] rounded-lg bg-white flex-shrink-0"
        >
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logo.png";
            }}
          />
          {badge ? (
            <div
              className="absolute -top-2 -left-2 text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
              style={{ backgroundColor: THEME }}
            >
              {badge}
            </div>
          ) : null}
        </Link>

        {/* content */}
        <div className="flex-1 min-w-0">
          <Link href={`/products/${product.slug}`}>
            <div className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">
              {product.name}
            </div>
          </Link>

          {/* variant line (small) */}
          <div className="mt-1 text-[11px] text-gray-500 line-clamp-1">
            {v ? variantLabel(v) || " " : " "}
          </div>

          {/* rating row (static like your card) */}
          <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-600">
            <span className="text-orange-500">★</span>
            <span className="font-semibold">4.5</span>
            <span className="text-gray-400">(reviews)</span>
          </div>

          {/* delivery line */}
          <div className="mt-1 text-[11px] text-gray-500">
           {mrp > sale ? (
                <div className="text-[11px] text-gray-500">
                  <span className="line-through">{INR(mrp)}</span>
                  {off > 0 ? (
                    <span className="ml-1 font-semibold" style={{ color: THEME }}>
                      {off}% off
                    </span>
                  ) : null}
                </div>
              ) : null}

               <div className="text-[14px] font-bold text-gray-900">
                {INR(sale)}
              </div>
          </div>

          {/* price + add row */}
          <div className="mt-2 flex items-end justify-between gap-3">
            {/* <div className="min-w-0">
              <div className="text-[14px] font-bold text-gray-900">
                {INR(sale)}
              </div>
             
            </div> */}

            <button
              disabled={!hasVariantForCart || !v?.id || adding || !inStock}
              onClick={async () => {
                if (!v?.id) return;
                setAdding(true);
                try {
                  await addToCart(v.id, 1, {
                    productId: product.id,
                    name: product.name,
                    price: Number(v.effectivePrice ?? v.discountPrice ?? v.price ?? 0),
                    mrp: Number(v.price ?? 0),
                    imageUrl: product.imageUrl || product.mainImageUrl || undefined,
                    variant: {
                      size: v.size || undefined,
                      color: v.color || undefined,
                      weight: (v.weight as any) || undefined,
                    },
                  });
                  toast.success("Added to cart 🛒", { position: "top-right", duration: 1500 });
                } catch (e) {
                  toast.error("Failed to add to cart");
                  console.log("❌ addToCart failed", e);
                } finally {
                  setAdding(false);
                }
              }}
              className="h-8 px-8 rounded-lg border text-[12px] font-bold disabled:opacity-60"
              style={{
                borderColor: THEME,
                color: THEME,
                background: "white",
              }}
            >
              {!inStock ? "OUT" : adding ? "..." : "ADD"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
