"use client";

import React from "react";
import { FiStar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

type ReviewItem = {
  id: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  productName: string;
  productSlug: string;
  imageUrl: string;
};

const REVIEWS: ReviewItem[] = [
  {
    id: "rev_1",
    name: "Ayisha Siddiqua",
    rating: 5,
    title: "Absolutely amazing 🤩",
    comment: "The Lavender Bloom Cotton Suit is absolutely stunning! The embroidery work is very intricate, fabric is pure cotton, and the lace detailing is beautiful. It is perfect for hot summers.",
    productName: "Lavender Bloom Embroidered Cotton Suit",
    productSlug: "lavender-bloom-embroidered-pure-cotton-suit-with-lace-detail-dupatta",
    imageUrl: "https://res.cloudinary.com/techsrow/image/upload/v1777364797/products/gallery/IMG_0312_ekpdt7.jpg"
  },
  {
    id: "rev_2",
    name: "Fouziya khan",
    rating: 5,
    title: "The quality and fabric is too good!",
    comment: "Very pleased with the Aqua Blue Floral suit. The material is so soft and comfortable, the print looks very premium, and the dupatta completed the premium look perfectly.",
    productName: "Aqua Blue Floral Cotton Suit",
    productSlug: "aqua-blue-floral-embroidered-pure-cotton-suit-with-lace-dupatta",
    imageUrl: "https://res.cloudinary.com/techsrow/image/upload/v1777364769/products/gallery/IMG_0315_de7rmo.jpg"
  },
  {
    id: "rev_3",
    name: "Anonymous",
    rating: 5,
    title: "Easy online ordering",
    comment: "Seamless experience buying this Sky Grey Cotton Suit. The product is exactly as shown in the picture, embroidery is elegant, and delivery was exceptionally fast.",
    productName: "Sky Grey Embroidered Cotton Suit",
    productSlug: "sky-grey-embroidered-pure-cotton-suit-with-lace-dupatta",
    imageUrl: "https://res.cloudinary.com/techsrow/image/upload/v1777364747/products/gallery/IMG_0318_eutsio.jpg"
  },
  {
    id: "rev_4",
    name: "Rida Fatma",
    rating: 5,
    title: "Perfect fitting!",
    comment: "This Midnight Blue Cotton Suit is superb! The color is deep and vibrant, embroidery detail is neat, and the sizing is exactly spot on. Highly recommend Khatoon Collection!",
    productName: "Midnight Blue Cotton Suit",
    productSlug: "midnight-blue-embroidered-pure-cotton-suit-with-lace-dupatta",
    imageUrl: "https://res.cloudinary.com/techsrow/image/upload/v1777365025/products/gallery/IMG_0321_wftmk0.jpg"
  },
  {
    id: "rev_5",
    name: "Sana Malik",
    rating: 5,
    title: "Very beautiful embroidery",
    comment: "Got this Royal Blue Suit and I'm in love! The premium rayon fabric feels silky and heavy, print quality is high, and the embroidery on the neck is extremely classy.",
    productName: "Royal Blue Premium Rayon Suit",
    productSlug: "white-royal-blue-premium-rayon-cotton-embroidered-suit-with-printed-dupatta",
    imageUrl: "https://res.cloudinary.com/techsrow/image/upload/v1777365719/products/main/IMG_0154_t0x2zq.jpg"
  },
  {
    id: "rev_6",
    name: "Zoya N.",
    rating: 5,
    title: "Extremely comfortable",
    comment: "Olive Green Premium Suit is super comfortable. Perfect for both office wear and daily wear. Fabric does not bleed color, and the lace work on dupatta is very neat.",
    productName: "Olive Green Premium Rayon Suit",
    productSlug: "olive-green-premium-rayon-cotton-embroidered-suit-with-printed-dupatta",
    imageUrl: "https://res.cloudinary.com/techsrow/image/upload/v1777365889/products/main/IMG_0161_z8c9ii.jpg"
  },
  {
    id: "rev_7",
    name: "Shabana Begum",
    rating: 5,
    title: "Highly recommended",
    comment: "Loved the Deep Purple shade! It looks incredibly elegant, rayon cotton blend is breathable and premium, and the dupatta is soft and printed beautifully.",
    productName: "Deep Purple Premium Rayon Suit",
    productSlug: "deep-purple-premium-rayon-cotton-embroidered-suit-with-printed-dupatta",
    imageUrl: "https://res.cloudinary.com/techsrow/image/upload/v1777366008/products/main/IMG_0164_huxutc.jpg"
  },
  {
    id: "rev_8",
    name: "Amina K.",
    rating: 5,
    title: "Stunning outfit",
    comment: "The Sky Blue Floral suit is a head-turner. Got so many compliments at a family lunch. Chiffon dupatta is very flowy and the floral details look so soft and chic.",
    productName: "Sky Blue Floral Rayon Suit",
    productSlug: "sky-blue-floral-premium-rayon-cotton-embroidered-suit-with-chiffon-dupatta",
    imageUrl: "https://res.cloudinary.com/techsrow/image/upload/v1777366236/products/gallery/IMG_9877_avnpzo.jpg"
  },
  {
    id: "rev_9",
    name: "Ayisha Siddiqua",
    rating: 5,
    title: "Absolutely amazing 🤩",
    comment: "Bought the Black & Red suit too and it's as gorgeous as the others. Great customer service, excellent stitching guide, and fast shipping to my doorstep.",
    productName: "Black & Red Premium Rayon Suit",
    productSlug: "black-red-premium-rayon-cotton-embroidered-suit-with-printed-dupatta",
    imageUrl: "https://res.cloudinary.com/techsrow/image/upload/v1777366939/products/main/IMG_9901_dmfhuu.jpg"
  }
];

export default function ReviewsSection() {
  return (
    <section id="homepage-reviews-section" className="w-full bg-[#fafafa] py-16 md:py-20 border-t border-neutral-100 relative overflow-hidden">
      {/* Floating vertical "★ REVIEWS" sticky tab on the right side of the screen */}
      <button
        onClick={() => {
          document
            .getElementById("homepage-reviews-section")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
        className="fixed right-0 top-[40%] -translate-y-1/2 z-40 bg-[#58604d] hover:bg-[#4a5141] text-white px-2 py-5 rounded-l-2xl shadow-xl transition-all duration-300 flex flex-col items-center gap-1.5 cursor-pointer hover:-translate-x-1"
      >
        <span className="text-[14px] text-white leading-none">★</span>
        <span className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] text-white uppercase [writing-mode:vertical-lr] select-none">
          REVIEWS
        </span>
      </button>

      <div className="mx-auto w-full max-w-[1500px] px-4 md:px-8">
        
        {/* Title Block */}
        <div className="text-center mb-10">
          <h2 className="font-serif text-[28px] sm:text-[34px] tracking-[0.12em] text-neutral-900 uppercase font-medium">
            Customers Are Saying
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-neutral-800 text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-0.5 text-black">
              <FiStar className="fill-black text-black text-xs sm:text-sm" />
              <FiStar className="fill-black text-black text-xs sm:text-sm" />
              <FiStar className="fill-black text-black text-xs sm:text-sm" />
              <FiStar className="fill-black text-black text-xs sm:text-sm" />
              <FiStar className="fill-black text-black text-xs sm:text-sm" />
            </div>
            <span>4.6</span>
            <span className="text-neutral-400 font-normal">★</span>
            <span className="text-neutral-500 font-medium">(287)</span>
            <span className="flex items-center gap-1 text-[#10b981] ml-2">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#10b981] text-white text-[9px] font-bold">✓</span>
              Verified
            </span>
          </div>
        </div>

        {/* Carousel Wrapper */}
        <div className="relative px-6 md:px-12">
          
          {/* Swiper Slider */}
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: ".prev-reviews-btn",
              nextEl: ".next-reviews-btn",
            }}
            slidesPerView={1}
            spaceBetween={16}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 16 },
              768: { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
              1280: { slidesPerView: 5, spaceBetween: 24 },
            }}
            className="reviews-swiper !overflow-visible"
          >
            {REVIEWS.map((rev) => (
              <SwiperSlide key={rev.id} className="h-auto">
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-all duration-300">
                  {/* Product Image */}
                  <div className="w-full aspect-[3/4] relative overflow-hidden bg-neutral-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rev.imageUrl}
                      alt={rev.productName}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Review Details */}
                  <div className="p-4 flex flex-col justify-between flex-grow text-center">
                    <div className="flex flex-col items-center flex-grow">
                      {/* Title / Excerpt */}
                      <h3 className="text-neutral-900 text-[13px] font-bold line-clamp-1 mb-1.5">
                        {rev.title}
                      </h3>
                      
                      {/* 5 gold stars */}
                      <div className="flex items-center gap-0.5 text-amber-400 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FiStar key={i} className="fill-amber-400 text-amber-400 text-[11px]" />
                        ))}
                      </div>
                      
                      {/* Comment */}
                      <p className="text-neutral-600 text-[11px] leading-relaxed line-clamp-3 mb-4">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-auto pt-3 border-t border-neutral-50">
                      {/* Author Name */}
                      <div className="text-neutral-900 text-[12px] font-bold flex items-center justify-center gap-1 mb-0.5">
                        <span>{rev.name}</span>
                        {/* Black circle verified badge */}
                        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-black text-white text-[8px] font-bold">✓</span>
                      </div>
                      
                      {/* Product Tag / Link */}
                      <Link
                        href={`/products/${rev.productSlug}`}
                        className="text-[10px] text-neutral-400 font-semibold hover:text-[#f57bb4] transition-colors line-clamp-1"
                      >
                        {rev.productName}
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Arrows */}
          <button className="prev-reviews-btn absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-12 flex items-center justify-center text-neutral-400 hover:text-neutral-800 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer">
            <FiChevronLeft className="text-3xl sm:text-4xl stroke-[1.5]" />
          </button>
          <button className="next-reviews-btn absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-12 flex items-center justify-center text-neutral-400 hover:text-neutral-800 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer">
            <FiChevronRight className="text-3xl sm:text-4xl stroke-[1.5]" />
          </button>

        </div>

        {/* Bottom Trust Bar */}
        <div className="mt-16 border-t border-neutral-100 pt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
          <div className="flex items-center flex-wrap justify-center gap-2 text-xs md:text-sm font-semibold text-neutral-700">
            <span className="flex items-center gap-1 text-[#10b981]">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#10b981] text-white text-[9px] font-bold">✓</span>
              4.5
            </span>
            
            {/* 5 Green stars */}
            <div className="flex items-center gap-0.5 text-[#10b981]">
              <FiStar className="fill-[#10b981] text-[#10b981] text-sm" />
              <FiStar className="fill-[#10b981] text-[#10b981] text-sm" />
              <FiStar className="fill-[#10b981] text-[#10b981] text-sm" />
              <FiStar className="fill-[#10b981] text-[#10b981] text-sm" />
              <FiStar className="fill-[#10b981] text-[#10b981] text-sm" />
            </div>
            
            <span className="text-neutral-300 mx-1 hidden sm:inline">|</span>
            
            <span className="text-neutral-500 font-medium">
              4.5 out of 5 stars based on 682 reviews
            </span>
            
            <span className="text-neutral-300 mx-1 hidden sm:inline">|</span>
            
            <span className="flex items-center gap-1 text-[#10b981] font-bold">
              Verified
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#10b981] text-white text-[9px] font-bold">✓</span>
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
