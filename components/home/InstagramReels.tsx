"use client";

import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FiChevronLeft, FiChevronRight, FiInstagram, FiHeart, FiMessageCircle, FiPlay } from "react-icons/fi";
import { BEHOLD_FEED_ID } from "@/config/instagram";

import "swiper/css";
import "swiper/css/navigation";

interface BeholdPost {
  id: string;
  caption: string;
  permalink: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  likeCount?: number;
  commentsCount?: number;
  isEmbed?: boolean;
  date?: any;
  timestamp?: string;
  createdAt?: string;
}

const ReelCard = ({ post }: { post: BeholdPost }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play video automatically on mount when autoplay is set, handles potential promise interruptions
  useEffect(() => {
    if (videoRef.current && !post.isEmbed) {
      videoRef.current.play().catch(() => {
        // Fallback for browsers with strict autoplay policies
      });
    }
  }, [post.isEmbed]);

  if (post.isEmbed) {
    return (
      <div 
        className="w-full aspect-[9/16] relative bg-neutral-950 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <iframe
          src={post.mediaUrl}
          title={`Instagram Reel ${post.id}`}
          className="absolute inset-0 w-full h-full border-0"
          scrolling="no"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          loading="lazy"
        />
        {isHovered && (
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 bg-black/30 flex items-center justify-center transition-all duration-300"
          >
            <div className="px-4 py-2 bg-white/95 text-neutral-900 text-xs font-semibold uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5 transform scale-100 hover:scale-105 transition-transform duration-300">
              <FiInstagram className="text-sm text-pink-600" />
              View on Instagram
            </div>
          </a>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-[9/16] overflow-hidden bg-neutral-950 select-none cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
        {/* Video Tag with Autoplay */}
        <video
          ref={videoRef}
          src={post.mediaUrl}
          poster={post.thumbnailUrl}
          muted
          loop
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Hover overlay */}
        <div className={`absolute inset-0 flex flex-col justify-end p-4 transition-all duration-300 ${
          isHovered ? "bg-black/40 opacity-100" : "bg-black/0 opacity-0 group-hover:opacity-100"
        } text-white`}>
          {post.caption && (
            <p className="text-[11px] line-clamp-2 mb-2 font-medium leading-relaxed text-neutral-100">
              {post.caption}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs font-semibold mt-1">
            <div className="flex items-center gap-3">
              {post.likeCount !== undefined && (
                <span className="flex items-center gap-1">
                  <FiHeart className="text-red-500 fill-red-500 text-xs" />
                  {post.likeCount}
                </span>
              )}
              {post.commentsCount !== undefined && (
                <span className="flex items-center gap-1">
                  <FiMessageCircle className="text-white fill-white/10 text-xs" />
                  {post.commentsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-wider uppercase text-pink-400 font-bold flex items-center gap-1">
              <FiInstagram /> Visit
            </span>
          </div>
        </div>
      </a>
    </div>
  );
};

export default function InstagramReels() {
  const [reels, setReels] = useState<BeholdPost[]>([]);
  const [followers, setFollowers] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllReels = async () => {
      let dbReelsList: BeholdPost[] = [];
      let beholdReelsList: BeholdPost[] = [];

      // 1. Fetch from Database first (Immediate sync, 0-cache)
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.khatooncollection.in/api";
      try {
        const res = await fetch(`${apiBaseUrl}/instagram-reels`);
        const resData = await res.json();
        if (resData && resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          const activeReels = resData.data.filter((r: any) => r.isActive !== false);
          dbReelsList = activeReels.map((r: any) => ({
            id: r.id,
            caption: r.label || "Khatoon Collection",
            permalink: `https://www.instagram.com/reel/${r.id}/`,
            mediaUrl: `https://www.instagram.com/reel/${r.id}/embed/`,
            thumbnailUrl: "",
            isEmbed: true,
            createdAt: r.createdAt
          }));
        }
      } catch (dbErr) {
        console.warn("Failed to fetch database reels:", dbErr);
      }

      // 2. Fetch from Behold (Cached feed)
      try {
        if (BEHOLD_FEED_ID) {
          const res = await fetch(`https://feeds.behold.so/${BEHOLD_FEED_ID}`);
          if (res.ok) {
            const data = await res.json();
            if (data.followersCount) {
              setFollowers(data.followersCount);
            }
            const posts = data.posts || [];
            beholdReelsList = posts
              .filter((p: any) => p.mediaType === "VIDEO" || p.isReel)
              .map((p: any) => ({
                id: p.id,
                caption: p.prunedCaption || p.caption || "",
                permalink: p.permalink,
                mediaUrl: p.mediaUrl,
                thumbnailUrl: p.thumbnailUrl || p.mediaUrl,
                likeCount: p.likeCount,
                commentsCount: p.commentsCount,
                timestamp: p.timestamp
              }));
          }
        }
      } catch (err) {
        console.warn("Failed to fetch Behold reels:", err);
      }

      // 3. Combine them and sort by date descending (newest first).
      const combinedMap = new Map<string, any>();

      const getShortcode = (permalink: string, id: string): string => {
        const match = permalink.match(/(?:reel|p)\/([A-Za-z0-9_-]+)/);
        return (match ? match[1] : id).toLowerCase();
      };

      const beholdByShortcode = new Map<string, any>();
      beholdReelsList.forEach((r) => {
        const shortcode = getShortcode(r.permalink || "", r.id);
        beholdByShortcode.set(shortcode, r);
      });

      dbReelsList.forEach((dbReel: any) => {
        const shortcode = dbReel.id.toLowerCase();
        const beholdMatch = beholdByShortcode.get(shortcode);

        if (beholdMatch) {
          combinedMap.set(shortcode, {
            ...beholdMatch,
            caption: dbReel.caption !== "Khatoon Collection" ? dbReel.caption : beholdMatch.caption,
            isEmbed: false,
            date: new Date((beholdMatch.timestamp || dbReel.createdAt || 0) as any),
          });
        } else {
          combinedMap.set(shortcode, {
            ...dbReel,
            date: new Date((dbReel.createdAt || 0) as any),
          });
        }
      });

      beholdReelsList.forEach((r) => {
        const shortcode = getShortcode(r.permalink || "", r.id);
        if (!combinedMap.has(shortcode)) {
          combinedMap.set(shortcode, {
            ...r,
            isEmbed: false,
            date: new Date((r.timestamp || 0) as any),
          });
        }
      });

      const combined: BeholdPost[] = Array.from(combinedMap.values()).sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      // Final fallback seed in case list remains empty
      if (combined.length === 0) {
        setReels([
          { id: "DYzXKZNMVbf", caption: "Latest Drop", permalink: "https://www.instagram.com/reel/DYzXKZNMVbf/", mediaUrl: "https://www.instagram.com/reel/DYzXKZNMVbf/embed/", thumbnailUrl: "" },
          { id: "DYt2uQHMh7G", caption: "New Arrivals", permalink: "https://www.instagram.com/reel/DYt2uQHMh7G/", mediaUrl: "https://www.instagram.com/reel/DYt2uQHMh7G/embed/", thumbnailUrl: "" },
          { id: "DYr4IFLM4J-", caption: "Party Wear", permalink: "https://www.instagram.com/reel/DYr4IFLM4J-/", mediaUrl: "https://www.instagram.com/reel/DYr4IFLM4J-/embed/", thumbnailUrl: "" },
          { id: "DYo42mOs_q7", caption: "Ethnic Wear", permalink: "https://www.instagram.com/reel/DYo42mOs_q7/", mediaUrl: "https://www.instagram.com/reel/DYo42mOs_q7/embed/", thumbnailUrl: "" }
        ]);
      } else {
        setReels(combined.slice(0, 12)); // Allow up to 12 reels for swiping
      }
      setLoading(false);
    };

    fetchAllReels();
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-[#fcfcfc] py-12 border-t border-neutral-100">
        <div className="mx-auto w-full text-center">
          <div className="inline-block w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neutral-500 text-xs mt-3 uppercase tracking-widest font-semibold">Loading Instagram Videos...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#fcfcfc] py-12 md:py-16 border-t border-neutral-100 relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1600px] px-2 md:px-4">

        {/* Heading Block */}
        <div className="text-center mb-10">
          <h2 className="font-serif text-[26px] sm:text-[32px] tracking-[0.1em] text-neutral-900 uppercase font-medium">
            Follow Us On Instagram
          </h2>
          <div className="flex flex-col items-center justify-center gap-3 mt-4">
            <a 
              href="https://www.instagram.com/khatooncollection25/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center gap-3 px-6 py-2.5 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              <FiInstagram className="text-sm group-hover:rotate-12 transition-transform" />
              <span>@khatooncollection25</span>
              {followers !== null && (
                <span className="h-4 w-px bg-white/30 mx-0.5" />
              )}
              {followers !== null && (
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-extrabold backdrop-blur-xs">
                  {(followers / 1000).toFixed(1)}K Followers
                </span>
              )}
            </a>
          </div>
        </div>

        {/* Custom Swiper Showcase containing working Reels embeds */}
        <div className="relative px-0 w-full group/navigation">
          
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: ".prev-reels-btn",
              nextEl: ".next-reels-btn",
            }}
            slidesPerView={2}
            spaceBetween={4}
            breakpoints={{
              320: { slidesPerView: 2, spaceBetween: 4 },
              480: { slidesPerView: 2.2, spaceBetween: 6 },
              640: { slidesPerView: 3.2, spaceBetween: 6 },
              768: { slidesPerView: 4.2, spaceBetween: 8 },
              1024: { slidesPerView: 5.2, spaceBetween: 8 },
              1280: { slidesPerView: 6, spaceBetween: 8 },
            }}
            className="reels-swiper !overflow-visible"
          >
            {reels.map((post) => {
              return (
                <SwiperSlide key={post.id} className="h-auto rounded-[2px] overflow-hidden">
                  <ReelCard post={post} />
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Custom Navigation Chevrons - Rafa style hover-only details */}
          <button className="prev-reels-btn absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs shadow-md border border-neutral-100 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-all hover:scale-105 disabled:opacity-0 disabled:pointer-events-none cursor-pointer opacity-0 group-hover/navigation:opacity-100">
            <FiChevronLeft className="text-xl stroke-[2.5]" />
          </button>
          <button className="next-reels-btn absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs shadow-md border border-neutral-100 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-all hover:scale-105 disabled:opacity-0 disabled:pointer-events-none cursor-pointer opacity-0 group-hover/navigation:opacity-100">
            <FiChevronRight className="text-xl stroke-[2.5]" />
          </button>

        </div>

      </div>
    </section>
  );
}
