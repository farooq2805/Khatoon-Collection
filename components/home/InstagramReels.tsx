"use client";

import React from "react";
import Link from "next/link";
import Script from "next/script";

export default function InstagramReels() {
  return (
    <section className="w-full bg-white py-10 md:py-16 border-t border-gray-100">

      {/* Mobile-responsive styles for the Behold widget */}
      <style>{`
        /* Ensure the behold div fills its container and is block-level */
        [data-behold-id] {
          display: block;
          width: 100%;
          min-height: 200px;
        }

        /* Mobile: limit to full width, prevent horizontal overflow */
        @media (max-width: 639px) {
          .behold-wrapper {
            max-width: 100%;
            overflow: hidden;
          }
          /* Force 2-column grid on mobile if behold renders internal grid */
          [data-behold-id] > * {
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="mx-auto w-full max-w-6xl px-3 md:px-8">

        {/* Title Heading */}
        <div className="text-center mb-6 md:mb-10">
          <span className="text-[11px] md:text-[13px] tracking-[0.25em] text-[#f57bb4] uppercase font-bold block mb-2">
            Social Showcase
          </span>
          <h2 className="font-serif text-[22px] sm:text-[34px] tracking-[0.08em] text-black uppercase leading-tight">
            Follow Us on <span className="text-[#f57bb4]">Instagram</span>
          </h2>
          <p className="text-gray-400 text-xs md:text-sm mt-2 max-w-md mx-auto leading-relaxed">
            Tap any photo to explore our latest reels &amp; collections on Instagram.
          </p>
        </div>

        {/* Behold Instagram Feed Widget
            Uses data-behold-id div format — Behold.so detects this div and
            renders the feed inside it. Container-aware: responds to parent width. */}
        <div className="behold-wrapper w-full overflow-hidden rounded-xl">
          <div data-behold-id="GWoyi7QRoH11ALrrLqg6"></div>
        </div>

        {/* Follow CTA Button */}
        <div className="flex justify-center mt-8">
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

      {/* Exact Behold.so embed script — function() IIFE format, loaded after page interactive */}
      <Script
        id="behold-widget-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const d=document,s=d.createElement("script");s.type="module";
              s.src="https://w.behold.so/widget.js";d.head.append(s);
            })();
          `,
        }}
      />
    </section>
  );
}
