"use client";

import React, { useMemo, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

type Variant = {
  id: number;
  weight: string | null;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  price: number;
  discountPrice: number | null;
  effectivePrice: number;
  stockQuantity: number;
  sku: string;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  mainImageUrl: string | null;
  createdAt?: string;
  price: number;
  discountPrice: number | null;
  variants: Variant[];
};

const INR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

function pickMainImage(p: Product) {
  return p.mainImageUrl || p.imageUrl || "/placeholder.png";
}

function getPrices(p: Product) {
  const v = p.variants?.[0];
  const mrp = Number(v ? v.price : p.price || 0);
  const sale = Number(v ? (v.effectivePrice ?? v.discountPrice ?? v.price) : ((p.discountPrice ?? p.price) || 0));
  const discountPercent = mrp > sale ? Math.round(((mrp - sale) / mrp) * 100) : 0;
  return { mrp, sale, discountPercent };
}

export default function NewArrivalsClearance({ initialData }: { initialData?: Product[] }) {
  const products = useMemo(() => initialData || [], [initialData]);

  const newArrivalsRef = useRef<HTMLDivElement>(null);
  const clearanceRef = useRef<HTMLDivElement>(null);

  // 1. New Arrivals: products added recently (sorted by id desc)
  const newArrivals = useMemo(() => {
    return [...products].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 8);
  }, [products]);

  // 2. Clearance: products with maximum discount percentage
  const clearanceProducts = useMemo(() => {
    return [...products]
      .map((p) => {
        const { discountPercent } = getPrices(p);
        return { ...p, discountPercent };
      })
      .filter((p) => p.discountPercent > 0)
      .sort((a, b) => b.discountPercent - a.discountPercent)
      .slice(0, 8);
  }, [products]);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="w-full bg-white">
      
      {/* ===================== BANNER GRID SECTION (Matches Screenshot) ===================== */}
      <section className="mx-auto max-w-[1500px] px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* LEFT BANNER: NEW ARRIVAL PAKISTANI */}
          <Link 
            href="/products?sort=newest"
            className="
              relative 
              aspect-[4/3] 
              md:aspect-[16/10] 
              w-full 
              rounded-2xl 
              overflow-hidden 
              shadow-sm 
              cursor-pointer 
              group
              block
            "
          >
            <Image
              src="/demo/new_arrival_pakistani.png"
              alt="New Arrival Pakistani"
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/30 transition-all duration-300" />
            
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
              <span className="text-[11px] md:text-[13px] tracking-[0.25em] font-medium uppercase drop-shadow-md mb-2">
                New Arrival
              </span>
              <h3 className="font-serif text-[28px] md:text-[44px] tracking-[0.12em] font-normal uppercase drop-shadow-lg mb-6">
                Pakistani
              </h3>
              <button
                type="button"
                className="
                  px-6 
                  py-2.5 
                  bg-black/40 
                  border 
                  border-white/60 
                  hover:bg-white 
                  hover:text-black 
                  hover:border-white 
                  text-[11px] 
                  md:text-[13px] 
                  tracking-[0.18em] 
                  font-semibold 
                  uppercase 
                  transition-all 
                  duration-300
                "
              >
                Explore Collection
              </button>
            </div>
          </Link>

          {/* RIGHT BANNER: CLEARANCE */}
          <Link 
            href="/products?sort=clearance"
            className="
              relative 
              aspect-[4/3] 
              md:aspect-[16/10] 
              w-full 
              rounded-2xl 
              overflow-hidden 
              shadow-sm 
              cursor-pointer 
              group
              block
            "
          >
            <Image
              src="/demo/clearance_sale.png"
              alt="Clearance Sale"
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/30 transition-all duration-300" />
            
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
              <h3 className="font-serif text-[28px] md:text-[44px] tracking-[0.14em] font-normal uppercase drop-shadow-lg mb-6">
                Clearance
              </h3>
              <button
                type="button"
                className="
                  px-8 
                  py-3 
                  bg-white 
                  text-black 
                  font-bold 
                  text-[11px] 
                  md:text-[13px] 
                  tracking-[0.18em] 
                  uppercase 
                  hover:bg-black 
                  hover:text-white 
                  transition-all 
                  duration-300
                  shadow-md
                "
              >
                Shop Collection
              </button>
            </div>
          </Link>

        </div>
      </section>

      {/* ===================== NEW ARRIVALS PRODUCTS SECTION ===================== */}
      <section ref={newArrivalsRef} className="w-full bg-white py-12 border-t border-gray-50 scroll-mt-24">
        <div className="mx-auto max-w-[1500px] px-4">
          <div className="text-center mb-10">
            <span className="text-[11px] tracking-[0.2em] text-[#f57bb4] uppercase font-bold block mb-1">
              Freshly Added
            </span>
            <h2 className="font-serif text-[24px] sm:text-[32px] tracking-[0.1em] text-black uppercase">
              New Arrivals
            </h2>
            <div className="w-12 h-0.5 bg-[#f57bb4] mx-auto mt-3" />
          </div>

          {newArrivals.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-8">No new products available.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newArrivals.map((p) => (
                <ProductCard key={String(p.id)} product={p} />
              ))}
            </div>
          )}
          
          <div className="mt-10 flex justify-center">
            <Link
              href="/products?sort=newest"
              className="border-2 border-black text-black hover:bg-black hover:text-white px-8 py-2.5 text-[12px] md:text-[13px] font-bold tracking-[0.15em] uppercase transition duration-300"
            >
              View All New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== CLEARANCE PRODUCTS SECTION ===================== */}
      {clearanceProducts.length > 0 && (
        <section ref={clearanceRef} className="w-full bg-[#fdfafb] py-12 border-t border-b border-gray-100 scroll-mt-24">
          <div className="mx-auto max-w-[1500px] px-4">
            <div className="text-center mb-10">
              <span className="text-[11px] tracking-[0.2em] text-red-500 uppercase font-bold block mb-1">
                Limited Stock
              </span>
              <h2 className="font-serif text-[24px] sm:text-[32px] tracking-[0.1em] text-black uppercase">
                Clearance Sale
              </h2>
              <div className="w-12 h-0.5 bg-red-500 mx-auto mt-3" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {clearanceProducts.map((p) => (
                <ProductCard key={String(p.id)} product={p} isClearance />
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                href="/products?sort=clearance"
                className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-8 py-2.5 text-[12px] md:text-[13px] font-bold tracking-[0.15em] uppercase transition duration-300"
              >
                View All Clearance Deals
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

function ProductCard({ product, isClearance = false }: { product: Product; isClearance?: boolean }) {
  const img = pickMainImage(product);
  const { mrp, sale, discountPercent } = getPrices(product);

  return (
    <div className="w-full bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
      <Link href={`/products/${product.slug}`} className="block relative flex-grow">
        {/* Aspect Ratio 3:4 */}
        <div className="relative w-full aspect-[3/4] bg-[#f9f9f9] overflow-hidden">
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-[1.03]"
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={false}
            unoptimized
          />
          {discountPercent > 0 && (
            <span 
              className={`
                absolute 
                top-3 
                left-3 
                text-[10px] 
                font-extrabold 
                px-2.5 
                py-1 
                rounded-full 
                text-white 
                shadow-sm
                ${isClearance ? "bg-red-500" : "bg-[#25D366]"}
              `}
            >
              {discountPercent}% OFF
            </span>
          )}
        </div>

        <div className="p-3">
          <h4 className="text-[11px] md:text-[13px] text-gray-800 font-medium line-clamp-2 leading-relaxed min-h-[36px]">
            {product.name}
          </h4>
          
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <span className="text-[13px] md:text-[16px] font-bold text-gray-900">
              {INR(sale)}
            </span>
            {mrp > sale && (
              <span className="text-[10px] md:text-[12px] text-gray-400 line-through">
                {INR(mrp)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
