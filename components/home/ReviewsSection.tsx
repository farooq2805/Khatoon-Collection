"use client";

import React from "react";
import { FiStar } from "react-icons/fi";

type ReviewItem = {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  productName: string;
};

const REVIEWS: ReviewItem[] = [
  {
    id: "rev_1",
    name: "Priya Sharma",
    location: "Mumbai, MH",
    rating: 5,
    date: "2 days ago",
    title: "Absolutely Beautiful! ✨",
    comment: "I am in love with the Pastel Salwar Suit Set! The fabric is incredibly soft, breathable, and the pastel colors are so elegant. The stitching was perfect. Received so many compliments at a family dinner!",
    productName: "Pastel Salwar Suit"
  },
  {
    id: "rev_2",
    name: "Anjali Singh",
    location: "New Delhi, DL",
    rating: 5,
    date: "1 week ago",
    title: "High Quality & Quick Delivery 🌸",
    comment: "Ordered the Embroidered Anarkali Kurti and it got delivered within 3 days. The embroidery is very detailed and premium. Fits like a glove. Highly recommend Khatoon Collection for ethnic wear!",
    productName: "Anarkali Kurti Set"
  },
  {
    id: "rev_3",
    name: "Sneha Reddy",
    location: "Bangalore, KA",
    rating: 5,
    date: "5 days ago",
    title: "Luxurious Velvet Suit! 👑",
    comment: "The Royal Velvet Suit exceeded my expectations. The velvet is extremely premium and heavy, perfect for weddings. The deep colors are absolutely royal. It feels like high-end luxury designer wear.",
    productName: "Royal Velvet Suit"
  },
  {
    id: "rev_4",
    name: "Riya Patel",
    location: "Ahmedabad, GJ",
    rating: 5,
    date: "3 days ago",
    title: "Perfect Chikankari Suit 💫",
    comment: "Lucknowi Chikankari suit is beautiful! The intricate hand-embroidered look is spectacular. The cotton lining is very comfortable for daily wear. Extremely happy with my purchase.",
    productName: "Lucknowi Chikankari"
  }
];

export default function ReviewsSection() {
  return (
    <section className="w-full bg-[#fafafa] py-16 md:py-20 border-t border-gray-100">
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
                <div className="flex items-center justify-between">
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
                    <span className="text-[9px] bg-gray-100 text-gray-500 font-bold px-2 py-1 rounded-md block">
                      {rev.productName}
                    </span>
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
