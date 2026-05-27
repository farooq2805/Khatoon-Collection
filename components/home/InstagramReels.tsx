"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function InstagramReels() {
  // Load the Instagram embed script once after mount
  useEffect(() => {
    // If the script is already loaded, just ask Instagram to process new embeds
    if ((window as any).instgrm) {
      (window as any).instgrm.Embeds.process();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if ((window as any).instgrm) {
        (window as any).instgrm.Embeds.process();
      }
    };
    document.body.appendChild(script);
  }, []);

  return (
    <section className="w-full bg-white py-10 md:py-16 border-t border-gray-100">

      <div className="mx-auto w-full max-w-6xl px-3 md:px-8">

        {/* Title Heading */}
        <div className="text-center mb-8 md:mb-12">
          <span className="text-[11px] md:text-[13px] tracking-[0.25em] text-[#f57bb4] uppercase font-bold block mb-2">
            Social Showcase
          </span>
          <h2 className="font-serif text-[22px] sm:text-[34px] tracking-[0.08em] text-black uppercase leading-tight">
            Follow Us on <span className="text-[#f57bb4]">Instagram</span>
          </h2>
          <p className="text-gray-400 text-xs md:text-sm mt-2 max-w-md mx-auto leading-relaxed">
            Watch our latest reels &amp; explore our newest collections.
          </p>
        </div>

        {/* Instagram Reels Embeds Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">

          {/* Reel 1 */}
          <div className="w-full max-w-[340px]">
            <blockquote
              className="instagram-media"
              data-instgrm-captioned
              data-instgrm-permalink="https://www.instagram.com/reel/DY1l59OM6FT/?utm_source=ig_embed&amp;utm_campaign=loading"
              data-instgrm-version="14"
              style={{
                background: "#FFF",
                border: 0,
                borderRadius: "12px",
                boxShadow: "0 2px 16px 0 rgba(0,0,0,0.12)",
                margin: "0",
                maxWidth: "100%",
                minWidth: "280px",
                padding: 0,
                width: "100%",
              }}
            >
              <div style={{ padding: "16px" }}>
                <a
                  href="https://www.instagram.com/reel/DY1l59OM6FT/?utm_source=ig_embed&amp;utm_campaign=loading"
                  style={{ background: "#FFFFFF", lineHeight: 0, padding: 0, textAlign: "center", textDecoration: "none", width: "100%" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View this post on Instagram
                </a>
              </div>
            </blockquote>
          </div>

          {/* Reel 2 */}
          <div className="w-full max-w-[340px]">
            <blockquote
              className="instagram-media"
              data-instgrm-captioned
              data-instgrm-permalink="https://www.instagram.com/reel/DYuiPLcM7Xd/?utm_source=ig_embed&amp;utm_campaign=loading"
              data-instgrm-version="14"
              style={{
                background: "#FFF",
                border: 0,
                borderRadius: "12px",
                boxShadow: "0 2px 16px 0 rgba(0,0,0,0.12)",
                margin: "0",
                maxWidth: "100%",
                minWidth: "280px",
                padding: 0,
                width: "100%",
              }}
            >
              <div style={{ padding: "16px" }}>
                <a
                  href="https://www.instagram.com/reel/DYuiPLcM7Xd/?utm_source=ig_embed&amp;utm_campaign=loading"
                  style={{ background: "#FFFFFF", lineHeight: 0, padding: 0, textAlign: "center", textDecoration: "none", width: "100%" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View this post on Instagram
                </a>
              </div>
            </blockquote>
          </div>

          {/* Reel 3 */}
          <div className="w-full max-w-[340px] sm:col-span-2 lg:col-span-1 sm:max-w-[340px]">
            <blockquote
              className="instagram-media"
              data-instgrm-captioned
              data-instgrm-permalink="https://www.instagram.com/reel/DYsYHidMenm/?utm_source=ig_embed&amp;utm_campaign=loading"
              data-instgrm-version="14"
              style={{
                background: "#FFF",
                border: 0,
                borderRadius: "12px",
                boxShadow: "0 2px 16px 0 rgba(0,0,0,0.12)",
                margin: "0",
                maxWidth: "100%",
                minWidth: "280px",
                padding: 0,
                width: "100%",
              }}
            >
              <div style={{ padding: "16px" }}>
                <a
                  href="https://www.instagram.com/reel/DYsYHidMenm/?utm_source=ig_embed&amp;utm_campaign=loading"
                  style={{ background: "#FFFFFF", lineHeight: 0, padding: 0, textAlign: "center", textDecoration: "none", width: "100%" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View this post on Instagram
                </a>
              </div>
            </blockquote>
          </div>

        </div>

        {/* Follow CTA Button */}
        <div className="flex justify-center mt-10">
          <Link
            href="https://www.instagram.com/khatooncollection25/"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-2.5
              bg-gradient-to-r from-[#f57bb4] to-purple-600
              text-white px-6 py-3 rounded-full
              text-xs md:text-sm font-bold tracking-widest uppercase
              shadow-lg hover:scale-105 hover:shadow-xl
              transition-all duration-300
              w-full max-w-xs justify-center sm:w-auto
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>Follow @khatooncollection25</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
