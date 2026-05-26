"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FiPhone, FiMapPin, FiInstagram, FiHeart, FiExternalLink, FiMessageCircle } from "react-icons/fi";
import { productService } from "@/services/productService";

// Helper for product images
function getProductThumbnail(product: any): string {
  if (product?.mainImageUrl) return product.mainImageUrl;
  if (product?.imageUrl) return product.imageUrl;
  if (Array.isArray(product?.images) && product.images.length > 0) {
    const img = product.images[0];
    return typeof img === "object" ? img?.url : img;
  }
  return "/placeholder.png";
}

const HIGHLIGHTS = [
  { name: "Rayon Satin", img: "/demo/new_arrival_pakistani.png" },
  { name: "HAPPY CUST...", img: "/demo/khatoon_craftsmanship.png" },
  { name: "Stories", img: "/demo/clearance_sale.png" },
  { name: "Customer Re...", img: "/slider/slide1.png" },
  { name: "MASHA ALLA...", img: "/slider/slide2.png" }
];

export default function ContactPage() {
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getAll()
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          // Take top 9 products for a perfect 3x3 Instagram grid
          setFeedItems(items.slice(0, 9));
        }
      })
      .catch((err) => {
        console.error("Error loading products for contact page feed", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const instagramUrl = "https://www.instagram.com/khatooncollection25/";
  const whatsappUrl = "https://wa.me/919867196860";
  const mapsUrl = "https://maps.app.goo.gl/ZtYg2vXTmpFuPQRB8";

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Title Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-[#1A1A1A] tracking-wide mb-4">
            Connect With Us
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto font-medium text-sm md:text-base">
            Visit our boutique in Mumbai, speak with our customer support, or follow our journey on Instagram for the newest South Asian modest fashion.
          </p>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT COLUMN: Premium Contact Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8 md:p-10 space-y-8">
              
              <div>
                <span className="text-xs uppercase tracking-widest text-[#f57bb4] font-bold">Boutique</span>
                <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[#1A1A1A] mt-1">
                  Khatoon Collection
                </h2>
              </div>

              {/* Address details */}
              <div className="flex gap-4 items-start border-t border-gray-50 pt-6">
                <div className="bg-[#FAF8F5] p-3 rounded-2xl flex-none">
                  <FiMapPin className="text-[#f57bb4] text-xl" />
                </div>
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Our Store Address</p>
                  <p className="text-[#333333] text-sm md:text-base font-medium leading-relaxed">
                    Shop No. 4, Building No. 19,
                    <br />
                    Yogi Vaishali, Vaishali Market,
                    <br />
                    Jogeshwari (West), Mumbai – 400102
                  </p>
                  
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#f57bb4] hover:text-[#990077] transition-colors group mt-1"
                  >
                    Get Directions on Google Maps 
                    <FiExternalLink className="text-xs group-hover:translate-x-0.5 duration-200" />
                  </a>
                </div>
              </div>

              {/* Phone details */}
              <div className="flex gap-4 items-start border-t border-gray-50 pt-6">
                <div className="bg-[#FAF8F5] p-3 rounded-2xl flex-none">
                  <FiPhone className="text-[#f57bb4] text-xl" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Call Support</p>
                  <p className="text-[#333333] text-base font-semibold">
                    <a href="tel:+919867196860" className="hover:text-[#f57bb4] transition-colors">
                      +91 98671 96860
                    </a>
                  </p>
                  <p className="text-gray-400 text-xs font-medium">Available for orders and queries</p>
                </div>
              </div>

              {/* WhatsApp details */}
              <div className="flex gap-4 items-start border-t border-gray-50 pt-6">
                <div className="bg-[#FAF8F5] p-3 rounded-2xl flex-none">
                  <FiMessageCircle className="text-[#f57bb4] text-xl" />
                </div>
                <div className="space-y-3 w-full">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">WhatsApp Group</p>
                  <p className="text-[#333333] text-sm md:text-base font-medium leading-relaxed">
                    Connect directly with our community and browse our live catalog catalog.
                  </p>
                  
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center bg-[#25D366] hover:bg-[#20ba59] text-white py-3 rounded-2xl font-bold text-sm tracking-wide shadow-sm flex items-center justify-center gap-2 transition duration-200"
                  >
                    Join WhatsApp Group
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Gorgeous Instagram Mockup Widget */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-[0_15px_40px_rgba(0,0,0,0.06)] overflow-hidden w-full max-w-lg">
              
              {/* Instagram Card Header */}
              <div className="p-5 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-3">
                  {/* Instagradient avatar */}
                  <div className="bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[2.5px] rounded-full">
                    <div className="bg-white p-[2px] rounded-full">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-100">
                        <Image
                          src="/logo.png"
                          alt="Khatoon Collection logo"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-[#262626]">khatooncollection25</span>
                      {/* Verified Badge */}
                      <span className="inline-flex items-center justify-center bg-[#0095f6] text-white rounded-full w-3.5 h-3.5 p-[1px] select-none flex-none">
                        <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium">Clothing (Brand)</span>
                  </div>
                </div>

                <a 
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#0095f6] hover:bg-[#1877f2] text-white text-xs font-semibold px-5 py-1.5 rounded-lg transition duration-200"
                >
                  Follow
                </a>
              </div>

              {/* Instagram Profile Meta */}
              <div className="px-6 py-4 space-y-4">
                {/* Stats Row */}
                <div className="flex justify-around py-1.5 border-y border-gray-50 text-center">
                  <div>
                    <p className="text-sm font-bold text-[#262626]">595</p>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">posts</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#262626]">30.7K</p>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">followers</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#262626]">15</p>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">following</p>
                  </div>
                </div>

                {/* Bio Block */}
                <div className="text-xs text-gray-700 leading-relaxed font-medium">
                  <p className="font-bold text-gray-900 text-sm">Khatoon Collection</p>
                  <p className="text-gray-400 text-[10px] font-bold">Women&apos;s Fashion</p>
                  <p className="mt-1">✨ Modest Wear, Premium Rayon Suits & Dupattas</p>
                  <p>💬 Whatsapp Group - 9867196860</p>
                  <p>📍 Add- Shop Number 4 Building Number 19Yogi Vaishali , Vaishali market Jogeshwari west,... <span className="text-gray-400 cursor-pointer font-bold">more</span></p>
                </div>
              </div>

              {/* Highlights Stories Row */}
              <div className="px-6 pb-5 flex gap-4 overflow-x-auto select-none border-b border-gray-100 scrollbar-none">
                {HIGHLIGHTS.map((h, idx) => (
                  <a 
                    key={idx} 
                    href={instagramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex flex-col items-center flex-none gap-1 group"
                  >
                    <div className="border border-gray-200 p-[2px] rounded-full group-hover:scale-105 duration-200 transition-transform">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-50">
                        <Image
                          src={h.img}
                          alt={h.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-500 font-semibold truncate w-14 text-center">
                      {h.name}
                    </span>
                  </a>
                ))}
              </div>

              {/* Tabs selector */}
              <div className="flex justify-center border-b border-gray-50">
                <div className="flex items-center gap-1 py-3 px-6 border-b border-gray-900 -mb-[1px] cursor-pointer">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-gray-900">
                    <path d="M22 11h-9V2h9v9zm0 11h-9v-9h9v9zM11 11H2V2h9v9zm0 11H2v-9h9v9z"/>
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-900">Posts</span>
                </div>
              </div>

              {/* Instagram Feed Grid (3x3 Layout) */}
              <div className="p-4 bg-gray-50/50">
                {loading ? (
                  <div className="grid grid-cols-3 gap-1.5 aspect-square items-center justify-center">
                    <span className="col-span-3 text-center text-xs text-gray-400 font-semibold">Loading feed...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    {feedItems.map((item, idx) => (
                      <a
                        key={idx}
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group block shadow-sm border border-gray-200/10"
                      >
                        <Image
                          src={getProductThumbnail(item)}
                          alt={item.name || "Khatoon product"}
                          fill
                          sizes="(max-w-768px) 33vw, 150px"
                          className="object-cover group-hover:scale-105 duration-300 ease-out transition-transform"
                          unoptimized={true}
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 text-white">
                          <FiHeart className="text-white text-sm fill-current" />
                          <span className="text-xs font-bold">{(150 - idx * 10) + idx}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA Link Banner */}
              <a 
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#f57bb4] hover:bg-[#990077] text-white text-center py-4 text-xs font-bold uppercase tracking-widest transition duration-200"
              >
                Join 30K+ followers on Instagram <FiInstagram className="inline text-sm ml-1" />
              </a>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
