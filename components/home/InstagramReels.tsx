"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface ReelItem {
  id: string;
  label: string;
  productName?: string;
  productLink?: string;
}

export default function InstagramReels() {
  const [reels, setReels] = useState<ReelItem[]>([]);

  useEffect(() => {
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
  }, []);

  return (
    <section className="kc-ig-section">
      <style>{`
        /* ── Section wrapper ── */
        .kc-ig-section {
          width: 100%;
          background: linear-gradient(160deg, #1a0a14 0%, #2d1020 50%, #1a0a14 100%);
          padding: 60px 0 70px;
          overflow: hidden;
          position: relative;
        }

        /* subtle decorative radial glow */
        .kc-ig-section::before {
          content: '';
          position: absolute;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 400px;
          background: radial-gradient(ellipse, rgba(245,123,180,0.18) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Heading area ── */
        .kc-ig-eyebrow {
          display: block;
          text-align: center;
          font-size: 11px;
          letter-spacing: 0.3em;
          color: #f57bb4;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .kc-ig-title {
          text-align: center;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(24px, 4vw, 40px);
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #fff;
          margin: 0 0 6px;
          line-height: 1.2;
        }
        .kc-ig-title span {
          background: linear-gradient(90deg, #f57bb4, #e040a0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .kc-ig-subtitle {
          text-align: center;
          color: rgba(255,255,255,0.45);
          font-size: 13px;
          margin: 0 auto 40px;
          max-width: 380px;
          line-height: 1.6;
          letter-spacing: 0.02em;
        }

        /* ── Reels grid ── */
        .kc-ig-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }

        /* Desktop: 4-column grid */
        .kc-reels-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 1023px) {
          .kc-reels-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }
        }
        @media (max-width: 639px) {
          /* Mobile: horizontal scroll — all 4 visible as a strip */
          .kc-reels-grid {
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            gap: 12px;
            padding-bottom: 12px;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          .kc-reels-grid::-webkit-scrollbar { display: none; }
        }

        /* ── Individual reel card ── */
        .kc-reel-card {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          background: #0d0008;
          /* pink-to-purple gradient border */
          border: 1.5px solid rgba(245,123,180,0.3);
          box-shadow:
            0 4px 24px rgba(0,0,0,0.45),
            0 0 0 0 rgba(245,123,180,0);
          transition: transform 0.35s cubic-bezier(.22,.68,0,1.2),
                      box-shadow 0.35s ease,
                      border-color 0.35s ease;
          scroll-snap-align: start;
        }
        @media (max-width: 639px) {
          .kc-reel-card {
            min-width: 200px;
            flex: 0 0 200px;
          }
        }
        .kc-reel-card:hover {
          transform: translateY(-6px) scale(1.015);
          border-color: rgba(245,123,180,0.75);
          box-shadow:
            0 16px 48px rgba(0,0,0,0.5),
            0 0 20px rgba(245,123,180,0.2);
        }

        /* 9:16 portrait aspect wrapper */
        .kc-reel-aspect {
          position: relative;
          width: 100%;
          padding-top: 177.78%; /* 16/9 inverted */
        }
        .kc-reel-aspect iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
        }

        /* Label badge below each reel */
        .kc-reel-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 12px;
          background: linear-gradient(90deg, #1a0a14, #2d1020);
        }
        .kc-reel-label span {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          font-weight: 600;
        }
        .kc-reel-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f57bb4, #e040a0);
          flex-shrink: 0;
        }

        /* ── Follow CTA button ── */
        .kc-ig-cta {
          display: flex;
          justify-content: center;
          margin-top: 40px;
        }
        .kc-ig-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 13px 32px;
          border-radius: 50px;
          background: linear-gradient(135deg, #f57bb4 0%, #c026a0 100%);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(245,123,180,0.4);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .kc-ig-btn:hover {
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 8px 32px rgba(245,123,180,0.55);
        }
        
        /* Shoppable buttons */
        .kc-reel-label-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 14px;
          background: linear-gradient(180deg, #160711 0%, #0c0209 100%);
          border-top: 1px solid rgba(245, 123, 180, 0.15);
        }
        .kc-reel-shop-btn {
          display: inline-block;
          text-align: center;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #ffffff;
          background: rgba(245, 123, 180, 0.12);
          border: 1px solid rgba(245, 123, 180, 0.35);
          padding: 7px 12px;
          border-radius: 8px;
          margin-top: 4px;
          transition: all 0.2s ease;
          text-decoration: none;
          cursor: pointer;
        }
        .kc-reel-shop-btn:hover {
          background: #f57bb4;
          border-color: #f57bb4;
          color: #1a0a14;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245, 123, 180, 0.3);
        }
      `}</style>

      <div className="kc-ig-inner">

        {/* Heading */}
        <span className="kc-ig-eyebrow">Social Showcase</span>
        <h2 className="kc-ig-title">
          Follow Us on <span>Instagram</span>
        </h2>
        <p className="kc-ig-subtitle">
          Watch our latest reels &amp; explore the newest ethnic wear collections.
        </p>

        {/* Reels Grid */}
        <div className="kc-reels-grid">
          {reels.map((reel) => (
            <div key={reel.id} className="kc-reel-card">
              <div className="kc-reel-aspect">
                <iframe
                  src={`https://www.instagram.com/reel/${reel.id}/embed/`}
                  title={`Khatoon Collection Reel — ${reel.label}`}
                  scrolling="no"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  loading="lazy"
                />
              </div>
              
              <div className="kc-reel-label-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div className="kc-reel-dot" />
                  <span style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f57bb4', fontWeight: 'bold' }}>
                    {reel.label}
                  </span>
                </div>
                
                {reel.productName && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px', marginTop: '2px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={reel.productName}>
                      {reel.productName}
                    </div>
                    <Link href={reel.productLink || "/products"} className="kc-reel-shop-btn">
                      Shop This Look
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Follow Button */}
        <div className="kc-ig-cta">
          <Link
            href="https://www.instagram.com/khatooncollection25/"
            target="_blank"
            rel="noopener noreferrer"
            className="kc-ig-btn"
          >
            {/* Instagram icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="white"
              aria-hidden="true"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>Follow @khatooncollection25</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
