"use client";

import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FiChevronLeft, FiChevronRight, FiInstagram, FiHeart, FiSend } from "react-icons/fi";
import { BEHOLD_FEED_ID, INSTAGRAM_REELS } from "@/config/instagram";

import "swiper/css";
import "swiper/css/navigation";

interface BeholdPost {
  id: string;
  caption: string;
  permalink: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  likeCount?: number | string;
  commentsCount?: number | string;
  isEmbed?: boolean;
  date?: any;
  timestamp?: string;
  createdAt?: string;
}

const SuperyouReelCard = ({ post }: { post: BeholdPost }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [post.mediaUrl]);

  const isInstagramEmbed = post.mediaUrl?.includes("instagram.com") || post.isEmbed;

  return (
    <div className="relative w-full aspect-[9/16] overflow-hidden bg-neutral-950 rounded-2xl shadow-xl border border-white/10 group select-none transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
      <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative overflow-hidden">
        {isInstagramEmbed ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <iframe
              src={
                post.mediaUrl?.includes("/embed")
                  ? `${post.mediaUrl}?autoplay=1&muted=1`
                  : `https://www.instagram.com/reel/${post.id}/embed/?autoplay=1&muted=1`
              }
              title={`Instagram Reel ${post.id}`}
              className="absolute w-[125%] h-[132%] -top-[15%] -left-[12.5%] border-0 pointer-events-none"
              scrolling="no"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              loading="lazy"
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            src={post.mediaUrl}
            poster={post.thumbnailUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
      </a>
    </div>
  );
};

export default function InstagramReels() {
  const [reels, setReels] = useState<BeholdPost[]>([]);
  const [followers, setFollowers] = useState<number>(33800); // 33.8K Followers
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllReels = async () => {
      let dbReelsList: BeholdPost[] = [];
      let beholdReelsList: BeholdPost[] = [];

      // 1. Fetch from Database (Cloudinary hosted reels)
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.khatooncollection.in/api";
      try {
        const res = await fetch(`${apiBaseUrl}/instagram-reels`);
        if (res.ok) {
          const resData = await res.json();
          if (resData && resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
            const activeReels = resData.data.filter((r: any) => r.isActive !== false);
            dbReelsList = activeReels.map((r: any) => ({
              id: r.id,
              caption: r.label || "Khatoon Collection",
              permalink: `https://www.instagram.com/reel/${r.id}/`,
              mediaUrl: r.videoUrl || `https://www.instagram.com/reel/${r.id}/embed/`,
              thumbnailUrl: r.thumbnailUrl || "",
              likeCount: r.likeCount || undefined,
              commentsCount: r.commentsCount || undefined,
              isEmbed: !r.videoUrl,
              date: new Date(r.createdAt || 0)
            }));
          }
        }
      } catch (dbErr) {
        console.warn("Failed to fetch database reels:", dbErr);
      }

      // 2. Fetch from Behold (Cached feed if enabled)
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
                timestamp: p.timestamp,
                isEmbed: false,
                date: new Date(p.timestamp || 0)
              }));
          }
        }
      } catch (err) {
        console.warn("Failed to fetch Behold reels:", err);
      }

      // Combine database list and behold list
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

      // DB reels take precedence
      dbReelsList.forEach((dbReel: any) => {
        const shortcode = dbReel.id.toLowerCase();
        const beholdMatch = beholdByShortcode.get(shortcode);

        if (beholdMatch) {
          combinedMap.set(shortcode, {
            ...beholdMatch,
            mediaUrl: dbReel.mediaUrl || beholdMatch.mediaUrl,
            thumbnailUrl: dbReel.thumbnailUrl || beholdMatch.thumbnailUrl,
            caption: dbReel.caption !== "Khatoon Collection" ? dbReel.caption : beholdMatch.caption,
            isEmbed: dbReel.isEmbed,
            date: beholdMatch.date,
          });
        } else {
          combinedMap.set(shortcode, dbReel);
        }
      });

      // Add remaining behold reels
      beholdReelsList.forEach((r) => {
        const shortcode = getShortcode(r.permalink || "", r.id);
        if (!combinedMap.has(shortcode)) {
          combinedMap.set(shortcode, r);
        }
      });

      const combined: BeholdPost[] = Array.from(combinedMap.values()).sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      // Filter out old May 30th reels
      const oldReelIds = ["dyzxkznmvbf", "dyt2uqhmh7g", "dyr4iflm4j-", "dyo42mos_q7"];
      let filteredCombined = combined.filter(
        (r) => !oldReelIds.includes(r.id.toLowerCase())
      );

      // Fallback to manual reels config if combined list is empty
      if (filteredCombined.length === 0) {
        filteredCombined = INSTAGRAM_REELS.map((item) => ({
          id: item.id,
          caption: item.caption,
          permalink: item.reelUrl,
          mediaUrl: item.videoUrl,
          thumbnailUrl: item.thumbnail,
          likeCount: item.likes,
          commentsCount: undefined,
          isEmbed: item.videoUrl?.includes("instagram.com") || false,
          date: new Date()
        }));
      }

      setReels(filteredCombined.slice(0, 6)); // Top 6 latest reels
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

        {/* Superyou Style Heading Block */}
        <div className="text-center mb-10">
          <h2 className="font-serif text-[26px] sm:text-[34px] tracking-[0.1em] text-neutral-900 uppercase font-bold">
            JOIN THE COMMUNITY
          </h2>
          <div className="flex flex-col items-center justify-center gap-3 mt-3">
            <a 
              href="https://www.instagram.com/khatooncollection25/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center gap-3 px-6 py-2.5 bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-md hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
            >
              <FiInstagram className="text-base group-hover:rotate-12 transition-transform" />
              <span>@khatooncollection25</span>
              <span className="h-4 w-px bg-white/40 mx-0.5" />
              <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full font-black tracking-wider backdrop-blur-md">
                {(followers / 1000).toFixed(1)}K Followers
              </span>
            </a>
          </div>
        </div>

        {/* Superyou 6-Column Grid / Swiper Carousel */}
        <div className="relative px-0 w-full group/navigation">
          
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: ".prev-reels-btn",
              nextEl: ".next-reels-btn",
            }}
            slidesPerView={2}
            spaceBetween={10}
            breakpoints={{
              320: { slidesPerView: 2, spaceBetween: 10 },
              480: { slidesPerView: 2.5, spaceBetween: 12 },
              640: { slidesPerView: 3.2, spaceBetween: 14 },
              768: { slidesPerView: 4.2, spaceBetween: 14 },
              1024: { slidesPerView: 6, spaceBetween: 16 },
            }}
            className="reels-swiper !overflow-visible"
          >
            {reels.map((post) => (
              <SwiperSlide key={post.id} className="h-auto rounded-2xl overflow-hidden shadow-sm">
                <SuperyouReelCard post={post} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Chevrons */}
          <button className="prev-reels-btn absolute left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-neutral-100 flex items-center justify-center text-neutral-800 hover:text-black hover:scale-110 transition-all cursor-pointer opacity-0 group-hover/navigation:opacity-100">
            <FiChevronLeft className="text-xl stroke-[2.5]" />
          </button>
          <button className="next-reels-btn absolute right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-neutral-100 flex items-center justify-center text-neutral-800 hover:text-black hover:scale-110 transition-all cursor-pointer opacity-0 group-hover/navigation:opacity-100">
            <FiChevronRight className="text-xl stroke-[2.5]" />
          </button>

        </div>

      </div>
    </section>
  );
}
