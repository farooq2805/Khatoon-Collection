"use client";

import Link from "next/link";
import { useRef } from "react";
import { FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";
import SafeImage from "@/components/common/SafeImage";

export type HandpickedProduct = {
  id: number;
  name: string;
  slug: string;
  image: string;
  price: number;
};

const INR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function HandpickedSection({ products }: { products: HandpickedProduct[] }) {
  const rowRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    const row = rowRef.current;
    if (row) row.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="w-full bg-[#fafafa] py-14 md:py-20 border-t border-neutral-100">
      <div className="mx-auto w-full max-w-[1500px] px-4 md:px-8">

        {/* Title Block */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="font-serif text-[28px] sm:text-[34px] tracking-[0.12em] text-neutral-900 uppercase font-medium">
            Handpicked For You
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Our favourite suits from the latest collections
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Previous products"
            className="hidden md:flex absolute -left-4 top-[40%] -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white shadow-md text-neutral-700 hover:bg-neutral-900 hover:text-white transition"
          >
            <FiChevronLeft />
          </button>

          <div
            ref={rowRef}
            className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none]"
          >
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group flex-none w-[62vw] sm:w-[40vw] md:w-[calc((100%-60px)/4)] snap-start rounded-2xl overflow-hidden bg-white border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative w-full aspect-[3/4] bg-neutral-100 overflow-hidden">
                  <SafeImage
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-[13px] font-semibold text-neutral-900 leading-snug line-clamp-2 min-h-[2.5em]">
                    {p.name}
                  </h3>
                  <p className="mt-1.5 text-[15px] font-bold text-[#c2185b]">{INR(p.price)}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-neutral-700 group-hover:text-neutral-900">
                    Shop now <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Next products"
            className="hidden md:flex absolute -right-4 top-[40%] -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white shadow-md text-neutral-700 hover:bg-neutral-900 hover:text-white transition"
          >
            <FiChevronRight />
          </button>
        </div>

      </div>
    </section>
  );
}
