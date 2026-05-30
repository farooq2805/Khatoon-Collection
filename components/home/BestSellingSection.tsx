/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import productGroups from "@/config/productGroups.json";

// const API_BASE = "http://localhost:6001/api";
const API_BASE = "https://api.khatooncollection.in/api";

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
  createdAt?: string; // if backend sends it (recommended)
  price: number;
  discountPrice: number | null;
  variants: Variant[];
};

const INR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

function pickMainImage(p: Product) {
  return p.mainImageUrl || p.imageUrl || "/placeholder.png";
}

function getBestPrice(p: Product) {
  const v = p.variants?.[0];
  if (v) return Number(v.effectivePrice ?? v.discountPrice ?? v.price);
  return Number(p.discountPrice ?? p.price);
}

export default function NewArrivalsSection({ initialData }: { initialData?: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;

    let alive = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/publicproducts`, { cache: "no-store" });
        const json = await res.json();
        const list = Array.isArray(json?.data) ? (json.data as Product[]) : [];
        if (!alive) return;
        setProducts(list);
      } catch (e) {
        console.log("❌ NewArrivalsSection load error", e);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [initialData]);

  const filteredProducts = useMemo(() => {
    const seenGroupIds = new Set<string>();
    const out: Product[] = [];
    
    for (const p of products) {
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
  }, [products]);

  // ✅ New Arrivals: prefer createdAt desc if available, else fallback to latest IDs
  const newArrivals = useMemo(() => {
    const arr = [...filteredProducts];

    const hasCreatedAt = arr.some((p) => typeof p.createdAt === "string");
    if (hasCreatedAt) {
      arr.sort((a, b) => {
        const ad = new Date(a.createdAt || 0).getTime();
        const bd = new Date(b.createdAt || 0).getTime();
        return bd - ad;
      });
    } else {
      // fallback (not perfect, but works)
      arr.sort((a, b) => Number(b.id) - Number(a.id));
    }

    // screenshot shows 8 items-ish
    return arr.slice(0, 8);
  }, [filteredProducts]);

  return (
    <section className="w-full bg-white py-5 md:py-5">
      <div className="mx-auto  px-1">
        {/* Title (center like screenshot) */}
       <h2 className="text-center font-serif text-[20px] sm:text-[28px] tracking-[0.14em] text-black">
            New <span className="tracking-[0.06em] lowercase">by</span>{" "}
            <span className="uppercase">Arrivals</span>
          </h2>

        {/* Grid (like screenshot) */}
        <div className="mt-0">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">Loading...</div>
          ) : newArrivals.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">No products found.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-1 py-5">
              {newArrivals.map((p) => (
                <ProductTile key={String(p.id)} product={p} />
              ))}
            </div>
          )}
        </div>

        {/* View all button (black centered) */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-black text-white px-6 py-2 text-[13px] md:text-[14px] font-medium"
          >
            View all
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductTile({ product }: { product: Product }) {
  const img = pickMainImage(product);
  const price = getBestPrice(product);

  return (
    <div className="w-full">
      <Link href={`/products/${product.slug}`} className="block">
        {/* Tall image like screenshot */}
        <div className="relative w-full aspect-[3/4] bg-[#f6f6f6] overflow-hidden">
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-[1.02]"
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={false}
          />
        </div>

        {/* Text below image (small, left, like screenshot) */}
        <div className="mt-2">
          <div className="text-[11px] md:text-[13px] text-gray-800 line-clamp-1">
            {product.name}
          </div>
          <div className="mt-1 text-[11px] md:text-[14px] text-gray-900">
           <b> {INR(price)}</b>
          </div>
        </div>
      </Link>
    </div>
  );
}
