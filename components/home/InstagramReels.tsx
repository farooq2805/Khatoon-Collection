"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FiChevronLeft, FiChevronRight, FiShoppingBag } from "react-icons/fi";
import { BEHOLD_FEED_ID } from "@/config/instagram";

import "swiper/css";
import "swiper/css/navigation";

interface ReelItem {
  id: string;
  label: string;
  productName?: string;
  productLink?: string;
}

export default function InstagramReels() {
  const [reels, setReels] = useState<ReelItem[]>([]);

  useEffect(() => {
    if (BEHOLD_FEED_ID) {
      // Load Behold.so widget script dynamically
      const script = document.createElement("script");
      script.src = "https://w.behold.so/widget.js";
      script.type = "module";
      document.head.appendChild(script);
      return () => {
        const existingScript = document.querySelector('script[src="https://w.behold.so/widget.js"]');
        if (existingScript) {
          existingScript.remove();
        }
      };
    } else {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.khatooncollection.in/api";
      
      // First, attempt to fetch from the native PostgreSQL Database via Express API
      fetch(`${apiBaseUrl}/instagram-reels`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData && resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
            const activeReels = resData.data.filter((r: any) => r.isActive !== false);
            setReels(activeReels);
          } else {
            throw new Error("No database reels or empty response. Trying JSON fallback.");
          }
        })
        .catch((apiErr) => {
          console.warn("API/Database fetch for reels failed or empty, trying local file fallback...", apiErr);
          // Fallback 1: Try public/instagram-reels.json storefront static asset
          fetch("/instagram-reels.json")
            .then((res) => res.json())
            .then((jsonData) => {
              if (Array.isArray(jsonData) && jsonData.length > 0) {
                setReels(jsonData);
              } else {
                throw new Error("Local JSON is not a valid array.");
              }
            })
            .catch((jsonErr) => {
              console.error("Local JSON fallback failed as well, using hardcoded seeds:", jsonErr);
              // Fallback 2: Premium seed fallback
              setReels([
                { id: "DYzXKZNMVbf", label: "Latest Drop", productName: "Navy Blue Rayon Suit Set", productLink: "/products/elegant-navi-blue-rayon-suit-set-featuring-intricate-kashmiri-embroidery-work-in-vibrant-floral-patterns" },
                { id: "DYt2uQHMh7G", label: "New Arrivals", productName: "Black Rayon Cutwork Suit", productLink: "/products/black-and-white-rayon-suit-with-neck-cutwork-and-daman-cutwork-with-comfortable-pant-with-pattern" },
                { id: "DYr4IFLM4J-", label: "Party Wear", productName: "Crimson Red Kurta Dupatta Set", productLink: "/products/crimson-red-three-piece-traditional-ethnic-suit-consisting-of-a-solid-kurta-dupatta" },
                { id: "DYo42mOs_q7", label: "Ethnic Wear", productName: "Silver & Black Premium Lace Suit", productLink: "/products/elegant-silver-black-floral-printed-suit-with-premium-embroidered-lace" }
              ]);
            });
        });
    }
  }, []);

  return (
    <section className="w-full bg-[#fcfcfc] py-16 md:py-20 border-t border-neutral-100 relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1500px] px-4 md:px-8">

        {/* Heading Block */}
        <div className="text-center mb-10">
          <h2 className="font-serif text-[28px] sm:text-[34px] tracking-[0.12em] text-neutral-900 uppercase font-medium">
            Follow Us On Instagram
          </h2>
          <p className="text-[11px] tracking-[0.2em] text-neutral-500 uppercase mt-2 font-semibold">
            @khatooncollection25
          </p>
        </div>

        {/* Behold.so Widget (if configured) */}
        {BEHOLD_FEED_ID ? (
          <div className="max-w-7xl mx-auto md:rounded-2xl border-y md:border border-neutral-100 p-0 md:p-3 bg-white md:shadow-sm">
            <behold-widget feed-id={BEHOLD_FEED_ID}></behold-widget>
          </div>
        ) : (
          /* Custom Swiper Showcase containing working Reels embeds */
          <div className="relative px-6 md:px-12 w-full">
            
            <Swiper
              modules={[Navigation]}
              navigation={{
                prevEl: ".prev-reels-btn",
                nextEl: ".next-reels-btn",
              }}
              slidesPerView={1}
              spaceBetween={16}
              breakpoints={{
                480: { slidesPerView: 1.5, spaceBetween: 16 },
                640: { slidesPerView: 2, spaceBetween: 16 },
                768: { slidesPerView: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 24 },
                1280: { slidesPerView: 5, spaceBetween: 24 },
              }}
              className="reels-swiper !overflow-visible"
            >
              {reels.map((reel) => {
                return (
                  <SwiperSlide key={reel.id} className="h-auto">
                    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-all duration-300">
                      
                      {/* Instagram Embed Video Iframe (Cropped top/bottom to hide header and View Profile button) */}
                      <div className="w-full aspect-[9/16] relative overflow-hidden bg-neutral-950">
                        <iframe
                          src={`https://www.instagram.com/reel/${reel.id}/embed/`}
                          title={`Khatoon Collection Reel — ${reel.label}`}
                          className="absolute left-0 w-full border-0"
                          style={{
                            top: "-72px",
                            height: "calc(100% + 72px)",
                          }}
                          scrolling="no"
                          allowFullScreen
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Shoppable Product Details Box */}
                      <div className="p-4 flex flex-col justify-between flex-grow text-left bg-neutral-50 border-t border-neutral-100">
                        <div>
                          {/* Label badge */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f57bb4]" />
                            <span className="text-[#f57bb4] text-[9px] font-bold uppercase tracking-widest">
                              {reel.label}
                            </span>
                          </div>

                          {/* Product name */}
                          {reel.productName && (
                            <h4 className="text-neutral-800 text-[12px] font-semibold line-clamp-1 mb-3" title={reel.productName}>
                              {reel.productName}
                            </h4>
                          )}
                        </div>

                        {/* CTA button */}
                        <div className="mt-auto">
                          <Link 
                            href={reel.productLink || "/products"} 
                            className="w-full bg-[#f57bb4] hover:bg-[#e06ca1] text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition shadow-xs flex items-center justify-center gap-1.5"
                          >
                            <FiShoppingBag className="text-xs" />
                            Shop This Look
                          </Link>
                        </div>
                      </div>

                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* Custom Navigation Chevrons */}
            <button className="prev-reels-btn absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-neutral-100 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-all hover:scale-110 disabled:opacity-40 disabled:pointer-events-none cursor-pointer">
              <FiChevronLeft className="text-xl stroke-[2.5]" />
            </button>
            <button className="next-reels-btn absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-neutral-100 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-all hover:scale-110 disabled:opacity-40 disabled:pointer-events-none cursor-pointer">
              <FiChevronRight className="text-xl stroke-[2.5]" />
            </button>

          </div>
        )}

      </div>
    </section>
  );
}
