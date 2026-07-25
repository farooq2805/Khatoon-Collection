"use client";

import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FiChevronLeft, FiChevronRight, FiInstagram, FiVolume2, FiVolumeX, FiArrowUpRight } from "react-icons/fi";
import { INSTAGRAM_REELS } from "@/config/instagram";

import "swiper/css";
import "swiper/css/navigation";

interface ReelItemData {
  id: string;
  caption: string;
  permalink: string;
  videoUrl: string;
  thumbnailUrl: string;
}

const LuxuryReelCard = ({ item }: { item: ReelItemData }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [item.videoUrl]);

  const toggleSound = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative w-full aspect-[9/16] overflow-hidden bg-neutral-950 rounded-[20px] shadow-xl border border-neutral-800/80 group select-none transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-pink-500/10 hover:border-pink-500/40">
      <a href={item.permalink} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
        {/* Pure HTML5 Video Player */}
        <video
          ref={videoRef}
          src={item.videoUrl}
          poster={item.thumbnailUrl}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Top Sound Toggle Pill */}
        <div className="absolute top-3 right-3 z-20">
          <button
            type="button"
            onClick={toggleSound}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 hover:scale-110 active:scale-95 transition-all shadow-md"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <FiVolumeX className="text-sm" /> : <FiVolume2 className="text-sm text-pink-400" />}
          </button>
        </div>

        {/* Gradient Overlay & Luxury Caption */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-4 z-10 transition-opacity duration-300">
          {/* Caption */}
          {item.caption && (
            <p className="text-white text-[11px] sm:text-xs font-semibold tracking-wide mb-3 line-clamp-2 leading-snug drop-shadow-md opacity-90 group-hover:opacity-100 transition-opacity">
              {item.caption}
            </p>
          )}

          {/* Shop Look CTA Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase tracking-wider group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-rose-500 group-hover:border-transparent transition-all duration-300 shadow-sm">
              <span>Explore Look</span>
              <FiArrowUpRight className="text-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </a>
    </div>
  );
};

export default function InstagramReels() {
  const [reels, setReels] = useState<ReelItemData[]>([]);

  useEffect(() => {
    // Map from INSTAGRAM_REELS config cleanly
    const items: ReelItemData[] = INSTAGRAM_REELS.slice(0, 6).map((r) => ({
      id: r.id,
      caption: r.caption,
      permalink: r.reelUrl,
      videoUrl: r.videoUrl,
      thumbnailUrl: r.thumbnail,
    }));
    setReels(items);
  }, []);

  return (
    <section className="w-full bg-gradient-to-b from-neutral-50 via-white to-neutral-50 py-14 md:py-20 border-t border-neutral-100 relative overflow-hidden">
      
      {/* Background Decorative Blur Spheres */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-pink-200/30 via-rose-200/20 to-amber-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto w-full max-w-[1600px] px-3 sm:px-6 relative z-10">

        {/* Luxury Header Section */}
        <div className="text-center mb-12">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-100 text-pink-700 text-[11px] font-bold uppercase tracking-[0.2em] mb-3 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
            <span>Instagram Lookbook</span>
          </div>

          <h2 className="font-serif text-[28px] sm:text-[38px] md:text-[42px] tracking-[0.08em] text-neutral-900 uppercase font-medium leading-tight">
            Follow @khatooncollection25
          </h2>

          {/* Followers Pill */}
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

        {/* 6-Column Reel Grid Showcase */}
        <div className="relative px-0 w-full group/navigation">
          
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: ".prev-reels-btn",
              nextEl: ".next-reels-btn",
            }}
            slidesPerView={2}
            spaceBetween={12}
            breakpoints={{
              320: { slidesPerView: 2, spaceBetween: 12 },
              480: { slidesPerView: 2.5, spaceBetween: 14 },
              640: { slidesPerView: 3.2, spaceBetween: 16 },
              768: { slidesPerView: 4.2, spaceBetween: 18 },
              1024: { slidesPerView: 6, spaceBetween: 18 },
            }}
            className="reels-swiper !overflow-visible"
          >
            {reels.map((item) => (
              <SwiperSlide key={item.id} className="h-auto">
                <LuxuryReelCard item={item} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Premium Navigation Chevrons */}
          <button className="prev-reels-btn absolute -left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 text-neutral-800 shadow-xl border border-neutral-200 flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-neutral-900 hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-0 group-hover/navigation:opacity-100">
            <FiChevronLeft className="text-xl stroke-[2.5]" />
          </button>
          <button className="next-reels-btn absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 text-neutral-800 shadow-xl border border-neutral-200 flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-neutral-900 hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-0 group-hover/navigation:opacity-100">
            <FiChevronRight className="text-xl stroke-[2.5]" />
          </button>

        </div>

      </div>
    </section>
  );
}
