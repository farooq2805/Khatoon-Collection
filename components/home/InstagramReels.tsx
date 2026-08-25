"use client";

import React, { useEffect } from "react";
import { FiInstagram, FiArrowUpRight } from "react-icons/fi";
import { INSTAGRAM_REELS } from "@/config/instagram";

import "swiper/css";
import "swiper/css/navigation";

interface ReelItemData {
  id: string;
  caption: string;
  permalink: string;
  embedUrl: string;
}

/**
 * EmbedReelCard — shows the actual Instagram Reel video inline via
 * the official Instagram oEmbed iframe. Tapping the card opens the
 * reel on Instagram (mobile-safe fallback).
 */
const EmbedReelCard = ({ item }: { item: ReelItemData }) => {
  return (
    <div className="relative w-full rounded-[20px] overflow-hidden shadow-xl border border-neutral-200 bg-white group transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-pink-500/10">
      {/* Instagram embed iframe — shows actual reel video */}
      <div className="relative w-full" style={{ paddingBottom: "177.78%" /* 9:16 */ }}>
        <iframe
          src={item.embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          scrolling="no"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          title={item.caption}
          loading="lazy"
        />
      </div>

      {/* Bottom "Open on Instagram" CTA */}
      <a
        href={item.permalink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
      >
        <FiInstagram className="text-sm" />
        <span>Watch on Instagram</span>
        <FiArrowUpRight className="text-xs" />
      </a>
    </div>
  );
};

export default function InstagramReels() {
  const reels: ReelItemData[] = INSTAGRAM_REELS.slice(0, 3).map((r) => ({
    id: r.id,
    caption: r.caption,
    permalink: r.reelUrl,
    embedUrl: r.embedUrl,
  }));

  return (
    <section className="w-full bg-gradient-to-b from-neutral-50 via-white to-neutral-50 py-14 md:py-20 border-t border-neutral-100 relative overflow-hidden">

      {/* Background Decorative Blur */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-pink-200/30 via-rose-200/20 to-amber-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-100 text-pink-700 text-[11px] font-bold uppercase tracking-[0.2em] mb-3 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
            <span>Instagram Lookbook</span>
          </div>

          <h2 className="font-serif text-[28px] sm:text-[38px] md:text-[42px] tracking-[0.08em] text-neutral-900 uppercase font-medium leading-tight">
            Follow @khatooncollection25
          </h2>

          <div className="flex flex-col items-center justify-center gap-3 mt-4">
            <a
              href="https://www.instagram.com/khatooncollection25/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center gap-3 px-7 py-3 bg-neutral-900 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-neutral-800"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 flex items-center justify-center text-white text-xs group-hover:rotate-12 transition-transform shadow-xs">
                <FiInstagram />
              </div>
              <span className="font-semibold text-neutral-200">@khatooncollection25</span>
              <span className="h-4 w-px bg-white/20 mx-0.5" />
              <span className="text-[11px] bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-0.5 rounded-full font-black tracking-wider shadow-xs">
                33.8K Followers
              </span>
            </a>
          </div>
        </div>

        {/* 3-Column Reel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
          {reels.map((item) => (
            <EmbedReelCard key={item.id} item={item} />
          ))}
        </div>

      </div>
    </section>
  );
}
