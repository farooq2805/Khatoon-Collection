"use client";

import React from "react";
import { FiStar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import SafeImage from "@/components/common/SafeImage";

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
    productName: "Mocha Brown Embroidered Farshi Suit",
    productSlug: "mocha-brown-embroidered-farshi-suit-set",
    imageUrl: "https://res.cloudinary.com/ifm9ihwo/image/upload/v1785404773/products/gallery/IMG_3430_a79zoe.jpg"
  },
  {
    id: "rev_2",
    name: "Fouziya khan",
    rating: 5,
    title: "The quality and fabric is too good!",
    comment: "Very pleased with the Deep Black suit. The material is so soft and comfortable, the print looks very premium, and the dupatta completed the premium look perfectly.",
    productName: "Deep Black Embroidered Farshi Suit",
    productSlug: "black-embroidered-farshi-suit-set",
    imageUrl: "https://res.cloudinary.com/ifm9ihwo/image/upload/v1785404829/products/gallery/IMG_3425_cv7u8d.jpg"
  },
  {
    id: "rev_3",
    name: "Anonymous",
    rating: 5,
    title: "Easy online ordering",
    comment: "Seamless experience buying this Navy Blue suit. The product is exactly as shown in the picture, embroidery is elegant, and delivery was exceptionally fast.",
    productName: "Navy Blue Embroidered Farshi Suit",
    productSlug: "navy-blue-embroidered-farshi-suit-set",
    imageUrl: "https://res.cloudinary.com/ifm9ihwo/image/upload/v1785404859/products/gallery/IMG_3423_g6mvut.jpg"
  },
  {
    id: "rev_4",
    name: "Rida Fatma",
    rating: 5,
    title: "Perfect fitting!",
    comment: "This Maroon suit is superb! The color is deep and vibrant, embroidery detail is neat, and the sizing is exactly spot on. Highly recommend Khatoon Collection!",
    productName: "Maroon Embroidered Farshi Suit",
    productSlug: "maroon-embroidered-farshi-suit-set",
    imageUrl: "https://res.cloudinary.com/ifm9ihwo/image/upload/v1785404889/products/gallery/IMG_3424_oareen.jpg"
  },
  {
    id: "rev_5",
    name: "Sana Malik",
    rating: 5,
    title: "Very beautiful embroidery",
    comment: "Got this Mocha Brown set and I'm in love! The premium fabric feels silky and heavy, print quality is high, and the embroidery on the neck is extremely classy.",
    productName: "Mocha Brown Embroidered Farshi Suit",
    productSlug: "mocha-brown-embroidered-farshi-suit-set",
    imageUrl: "https://res.cloudinary.com/ifm9ihwo/image/upload/v1785404770/products/gallery/8014d4be-6474-472d-9ec7-38ccd112cbed_l3vb3"
  },
  {
    id: "rev_6",
    name: "Zoya N.",
    rating: 5,
    title: "Extremely comfortable",
    comment: "The Deep Black suit is super comfortable. Perfect for both events and daily wear. Fabric does not bleed color, and the embroidery work is very neat.",
    productName: "Deep Black Embroidered Farshi Suit",
    productSlug: "black-embroidered-farshi-suit-set",
    imageUrl: "https://res.cloudinary.com/ifm9ihwo/image/upload/v1785404825/products/gallery/475bfc50-1636-4ede-a703-2351c1637f79_ezkpt"
  },
  {
    id: "rev_7",
    name: "Shabana Begum",
    rating: 5,
    title: "Highly recommended",
    comment: "Loved the Navy Blue shade! It looks incredibly elegant, fabric blend is breathable and premium, and the dupatta is soft and printed beautifully.",
    productName: "Navy Blue Embroidered Farshi Suit",
    productSlug: "navy-blue-embroidered-farshi-suit-set",
    imageUrl: "https://res.cloudinary.com/ifm9ihwo/image/upload/v1785404857/products/gallery/2d1477be-389e-465a-8ce8-cf40587f68ce_uce9g"
  },
  {
    id: "rev_8",
    name: "Amina K.",
    rating: 5,
    title: "Stunning outfit",
    comment: "The Maroon Farshi suit is a head-turner. Got so many compliments at a family lunch. The embroidery details look so soft and chic. 100% worth it!",
    productName: "Maroon Embroidered Farshi Suit",
    productSlug: "maroon-embroidered-farshi-suit-set",
    imageUrl: "https://res.cloudinary.com/ifm9ihwo/image/upload/v1785404888/products/gallery/1B21B4AF-9846-4B68-BD1E-51DCA72328CF_c5p4w"
  },
  {
    id: "rev_9",
    name: "Ayisha Siddiqua",
    rating: 5,
    title: "Absolutely amazing 🤩",
    comment: "Bought the Dusty Rose Pink suit too and it's as gorgeous as the others. Great customer service, excellent stitching guide, and fast shipping to my doorstep.",
    productName: "Dusty Rose Pink Pure Cotton Suit",
    productSlug: "dusty-rose-pink-pure-cotton-patch-work-suit",
    imageUrl: "https://res.cloudinary.com/ifm9ihwo/image/upload/v1785421348/products/gallery/4865e000-e0e7-4b53-94af-9b3c43887bfb_prusx"
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
                    <SafeImage
                      src={rev.imageUrl || ""}
                      alt={rev.productName}
                      className="w-full h-full object-cover object-center"
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
