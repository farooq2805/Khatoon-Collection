"use client";

import React, { useEffect, useRef } from "react";
import { FiInstagram, FiArrowUpRight, FiPlay } from "react-icons/fi";
import type { InstagramFeed, InstagramReel } from "@/lib/instagram";

const PROFILE_URL = "https://www.instagram.com/khatooncollection25/";

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

/**
 * ReelCard: muted, looping, inline video that only plays while it is on
 * screen, so six reels never download or decode at once.
 */
const ReelCard = ({ reel }: { reel: InstagramReel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      href={reel.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block w-[62vw] max-w-[240px] sm:w-auto sm:max-w-none flex-none snap-start rounded-[18px] overflow-hidden bg-neutral-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      aria-label={reel.caption || "Watch reel on Instagram"}
    >
      <div className="relative w-full aspect-[9/16]">
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={reel.thumbnailUrl ?? undefined}
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
          <FiPlay className="text-[11px] ml-0.5" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3 pt-10 bg-gradient-to-t from-black/75 via-black/30 to-transparent">
          {reel.caption && (
            <p className="text-white text-[11px] leading-snug font-medium line-clamp-2">{reel.caption}</p>
          )}
          <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/90">
            <FiInstagram className="text-xs" /> Watch
            <FiArrowUpRight className="text-xs transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </a>
  );
};

export default function InstagramReels({ feed }: { feed: InstagramFeed }) {
  // No token or no reels yet: show nothing rather than an empty block
  if (feed.reels.length === 0) return null;

  const handle = feed.username ?? "khatooncollection25";

  return (
    <section className="w-full bg-gradient-to-b from-neutral-50 via-white to-neutral-50 py-14 md:py-20 border-t border-neutral-100 relative overflow-hidden">

      {/* Background Decorative Blur */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-pink-200/30 via-rose-200/20 to-amber-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-100 text-pink-700 text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
            <span>Instagram Lookbook</span>
          </div>

          <h2 className="font-serif text-[26px] sm:text-[36px] md:text-[40px] tracking-[0.08em] text-neutral-900 uppercase font-medium leading-tight">
            Follow @{handle}
          </h2>

          <div className="flex justify-center mt-4">
            <a
              href={PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-6 py-2.5 bg-neutral-900 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-black transition-all duration-300"
            >
              <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 flex items-center justify-center text-xs group-hover:rotate-12 transition-transform">
                <FiInstagram />
              </span>
              <span>Follow us</span>
              {feed.followers !== null && (
                <>
                  <span className="h-4 w-px bg-white/20" />
                  <span className="text-[11px] bg-gradient-to-r from-pink-500 to-rose-500 px-3 py-0.5 rounded-full font-black tracking-wider">
                    {formatFollowers(feed.followers)} Followers
                  </span>
                </>
              )}
            </a>
          </div>
        </div>

        {/* Reels: swipeable row on mobile, 6 columns on desktop */}
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none]">
          {feed.reels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </div>

      </div>
    </section>
  );
}
