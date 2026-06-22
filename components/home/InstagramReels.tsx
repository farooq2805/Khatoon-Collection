"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FiChevronLeft, FiChevronRight, FiPlay, FiX, FiShoppingBag } from "react-icons/fi";
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
  const [activeReel, setActiveReel] = useState<ReelItem | null>(null);

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
          <div className="max-w-7xl mx-auto rounded-2xl border border-neutral-100 p-3 bg-white shadow-sm">
            <behold-widget feed-id={BEHOLD_FEED_ID}></behold-widget>
          </div>
        ) : (
          /* Custom Swiper Showcase */
          <div className="relative px-6 md:px-12 w-full">
            
            <Swiper
              modules={[Navigation]}
              navigation={{
                prevEl: ".prev-reels-btn",
                nextEl: ".next-reels-btn",
              }}
              slidesPerView={1.5}
              spaceBetween={12}
              breakpoints={{
                480: { slidesPerView: 2, spaceBetween: 12 },
                640: { slidesPerView: 3, spaceBetween: 16 },
                768: { slidesPerView: 4, spaceBetween: 16 },
                1024: { slidesPerView: 5, spaceBetween: 20 },
                1280: { slidesPerView: 6, spaceBetween: 20 },
              }}
              className="reels-swiper !overflow-visible"
            >
              {reels.map((reel) => {
                const coverUrl = `https://www.instagram.com/p/${reel.id}/media/?size=l`;

                return (
                  <SwiperSlide key={reel.id} className="h-auto">
                    <div 
                      onClick={() => setActiveReel(reel)}
                      className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-100 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer flex flex-col justify-end"
                    >
                      {/* Cover Image Redirect */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverUrl}
                        alt={reel.label}
                        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Play Button Indicator */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white text-lg transition-transform duration-300 group-hover:scale-110 shadow-sm">
                          <FiPlay className="fill-white translate-x-[1px]" />
                        </div>
                      </div>

                      {/* Subtle Bottom Brand Label */}
                      <div className="absolute bottom-3 left-3 right-3 z-10 bg-black/40 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/10 text-center pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
                        <span className="text-white text-[9px] font-bold tracking-[0.15em] uppercase">
                          {reel.label}
                        </span>
                      </div>

                      {/* Glassmorphic Hover Shop Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex flex-col justify-end p-4 text-left">
                        <span className="text-[#f57bb4] text-[9px] font-extrabold uppercase tracking-widest mb-1">
                          {reel.label}
                        </span>
                        {reel.productName && (
                          <h4 className="text-white text-[12px] font-semibold truncate mb-3">
                            {reel.productName}
                          </h4>
                        )}
                        <button className="w-full bg-[#f57bb4] hover:bg-[#e06ca1] text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-1.5">
                          <FiShoppingBag className="text-xs" />
                          Shop Look
                        </button>
                      </div>

                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* Custom Navigation Chevrons */}
            <button className="prev-reels-btn absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-12 flex items-center justify-center text-neutral-400 hover:text-neutral-800 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer">
              <FiChevronLeft className="text-3xl sm:text-4xl stroke-[1.5]" />
            </button>
            <button className="next-reels-btn absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-12 flex items-center justify-center text-neutral-400 hover:text-neutral-800 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer">
              <FiChevronRight className="text-3xl sm:text-4xl stroke-[1.5]" />
            </button>

          </div>
        )}

        {/* Video Player & Shoppable Modal */}
        {activeReel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
            
            {/* Modal Body */}
            <div className="relative w-full max-w-[800px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh] md:h-[600px] border border-neutral-100 max-h-[90vh]">
              
              {/* Close Button */}
              <button 
                onClick={() => setActiveReel(null)}
                className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition cursor-pointer"
              >
                <FiX className="text-lg" />
              </button>

              {/* Left Column: Embed Player */}
              <div className="w-full md:w-[380px] bg-black h-[55%] md:h-full relative flex-shrink-0">
                <iframe
                  src={`https://www.instagram.com/reel/${activeReel.id}/embed/`}
                  title={`Instagram Reel — ${activeReel.label}`}
                  className="absolute inset-0 w-full h-full border-0"
                  scrolling="no"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              </div>

              {/* Right Column: Shop/Info */}
              <div className="w-full flex-grow p-6 md:p-8 flex flex-col justify-between h-[45%] md:h-full text-left bg-[#fcfcfc]">
                
                <div className="flex-grow flex flex-col justify-center">
                  <span className="text-[#f57bb4] text-[10px] md:text-[11px] font-extrabold uppercase tracking-widest block mb-2">
                    {activeReel.label}
                  </span>
                  
                  {activeReel.productName ? (
                    <>
                      <h3 className="font-serif text-[20px] md:text-[24px] text-neutral-900 leading-snug mb-3">
                        {activeReel.productName}
                      </h3>
                      <p className="text-xs md:text-sm text-neutral-500 leading-relaxed mb-6">
                        Watch this look in action and shop the premium ethnic wear set directly. Free shipping in India!
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-serif text-[20px] md:text-[24px] text-neutral-900 leading-snug mb-3">
                        Khatoon Collection Styles
                      </h3>
                      <p className="text-xs md:text-sm text-neutral-500 leading-relaxed mb-6">
                        Explore our latest traditional collections, luxury rayon suits, and fine craftsmanship on Instagram.
                      </p>
                    </>
                  )}
                </div>

                {/* Shoppable Action Button */}
                <div className="mt-auto">
                  <Link
                    href={activeReel.productLink || "/products"}
                    onClick={() => setActiveReel(null)}
                    className="w-full bg-[#f57bb4] hover:bg-[#e06ca1] text-white py-3.5 rounded-2xl font-bold tracking-[0.15em] text-[11px] uppercase transition shadow-md flex items-center justify-center gap-2"
                  >
                    <FiShoppingBag className="text-sm" />
                    Shop This Look
                  </Link>
                  <a
                    href={`https://www.instagram.com/reel/${activeReel.id}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-[10px] text-neutral-400 hover:text-neutral-700 transition font-bold uppercase tracking-widest mt-4"
                  >
                    View Original on Instagram
                  </a>
                </div>

              </div>

            </div>

            {/* Click Backdrop to Close */}
            <div 
              onClick={() => setActiveReel(null)}
              className="absolute inset-0 -z-10 cursor-pointer"
            />
            
          </div>
        )}

      </div>
    </section>
  );
}
