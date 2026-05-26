"use client";

import React from "react";
import { FiStar } from "react-icons/fi";
import Link from "next/link";

type ReviewItem = {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  productName: string;
  productSlug: string;
};

const REVIEWS: ReviewItem[] = [
  {
    id: "rev_1",
    name: "Priya Sharma",
    location: "Mumbai, MH",
    rating: 5,
    date: "2 days ago",
    title: "Stunning Kashmiri Embroidery! ✨",
    comment: "I am absolutely in love with this Navy Blue Rayon Suit! The Kashmiri embroidery is so intricate and colorful. Fabric is incredibly soft and comfortable. Perfect for family events!",
    productName: "Navy Blue Kashmiri Rayon Suit",
    productSlug: "elegant-navi-blue-rayon-suit-set-featuring-intricate-kashmiri-embroidery-work-in-vibrant-floral-patterns"
  },
  {
    id: "rev_2",
    name: "Anjali Singh",
    location: "New Delhi, DL",
    rating: 5,
    date: "1 week ago",
    title: "Exquisite Neck & Daman Cutwork 🌸",
    comment: "Ordered the Black and White Rayon Suit with neck cutwork and it is so beautiful! The material is very premium and breathable. Fits perfectly and looks super elegant. Quick delivery too!",
    productName: "Black & White Rayon Cutwork Suit",
    productSlug: "black-and-white-rayon-suit-with-neck-cutwork-and-daman-cutwork-with-comfortable-pant-with-pattern"
  },
  {
    id: "rev_3",
    name: "Sneha Reddy",
    location: "Bangalore, KA",
    rating: 5,
    date: "5 days ago",
    title: "Gorgeous Crimson Red Suit! 👑",
    comment: "This Crimson Red three-piece suit is spectacular! The solid kurta-dupatta set has an extremely premium feel. Perfect fit and the fabric feels like pure luxury. Highly recommended!",
    productName: "Crimson Red Kurta Dupatta Set",
    productSlug: "crimson-red-three-piece-traditional-ethnic-suit-consisting-of-a-solid-kurta-dupatta"
  },
  {
    id: "rev_4",
    name: "Riya Patel",
    location: "Ahmedabad, GJ",
    rating: 5,
    date: "3 days ago",
    title: "Classy Embroidery Work 💫",
    comment: "The Black and Magenta Pink thread embroidery suit is simply stunning! The thread work is clean and has a beautiful classy ethnic design. Extremely comfortable for daily wear.",
    productName: "Black Magenta Thread Embroidery Suit",
    productSlug: "black-magenta-pink-thread-embroidery-work-with-a-classy-ethnic-design"
  }
];

export default function ReviewsSection() {
  return (
    <section id="homepage-reviews-section" className="w-full bg-[#fafafa] py-16 md:py-20 border-t border-gray-100 relative">
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
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[11px] md:text-[13px] tracking-[0.25em] text-[#f57bb4] uppercase font-bold block mb-2">
            Testimonials
          </span>
          <h2 className="font-serif text-[24px] sm:text-[36px] tracking-[0.1em] text-black uppercase leading-tight">
            What Our Customers <span className="text-[#f57bb4]">Are Saying</span>
          </h2>
          <div className="flex items-center justify-center gap-1 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <FiStar key={i} className="text-amber-400 fill-amber-400 text-lg" />
            ))}
            <span className="text-gray-700 text-xs md:text-sm font-semibold ml-2">
              4.9/5 based on 850+ reviews
            </span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((rev) => (
            <div 
              key={rev.id}
              className="
                bg-white 
                p-6 
                rounded-2xl 
                border 
                border-gray-100 
                shadow-sm 
                hover:shadow-md 
                transition-all 
                duration-300 
                flex 
                flex-col 
                justify-between 
                h-full
              "
            >
              <div>
                {/* Stars Row */}
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <FiStar key={i} className="text-amber-400 fill-amber-400 text-[14px]" />
                  ))}
                </div>

                {/* Review Details */}
                <h4 className="text-gray-900 text-sm font-bold mb-2">
                  {rev.title}
                </h4>
                
                <p className="text-gray-600 text-xs leading-relaxed mb-4">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div>
                {/* Divider Line */}
                <div className="w-full h-px bg-gray-50 my-4" />

                {/* Reviewer Details */}
                <div className="flex items-center justify-between text-left">
                  <div>
                    <div className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5">
                      <span>{rev.name}</span>
                      <span className="bg-emerald-50 text-emerald-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        Verified
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                      {rev.location} &bull; {rev.date}
                    </div>
                  </div>

                  <div className="text-right">
                    <Link
                      href={`/products/${rev.productSlug}`}
                      className="text-[9px] bg-[#f57bb4]/10 text-[#f57bb4] hover:bg-[#f57bb4] hover:text-white transition-all duration-200 font-bold px-2 py-1.5 rounded-md block"
                    >
                      {rev.productName}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
