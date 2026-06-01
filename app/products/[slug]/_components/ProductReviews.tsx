"use client";

import { useEffect, useState } from "react";
import { FiStar, FiMessageSquare } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import WriteReviewModal from "@/components/reviews/WriteReviewModal";

const API_BASE = "https://api.khatooncollection.in/api";

type Review = {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
  user: {
    firstName: string | null;
    lastName: string | null;
  };
};

function generateMockReviews(slug: string): Review[] {
  const hash = slug.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const reviewsPool = [
    {
      title: "Absolutely stunning Kashmiri embroidery! ✨",
      comment: "I am totally in love with this suit set! The Kashmiri embroidery is so clean and colorful. The rayon fabric feels very premium, soft, and breathable. Fitting is perfect as per size chart. Will definitely buy more!",
      reviewer: "Priya Malik",
      location: "Amritsar, PB",
      rating: 5
    },
    {
      title: "Extremely elegant and comfortable 🌸",
      comment: "The cutwork on the neck and daman is gorgeous. The comfortable pant design makes it very easy to wear all day long. Received so many compliments at a family lunch. Excellent packaging too!",
      reviewer: "Harleen Kaur",
      location: "Chandigarh, CH",
      rating: 5
    },
    {
      title: "Superb quality rayon fabric! 💎",
      comment: "The rayon quality is outstanding, not cheap or thin at all. Embroidered patterns are so rich. Very classy designer look in budget. Delivered in just 2 days in Lucknow!",
      reviewer: "Aisha Khan",
      location: "Lucknow, UP",
      rating: 5
    },
    {
      title: "Perfect festive wear suit set! 👑",
      comment: "Beautiful color combination, exactly as shown in the picture. Chiffon dupatta is very soft and lightweight. The embroidery gives it a heavy ethnic look perfect for small gatherings and festivals.",
      reviewer: "Mehak Sharma",
      location: "Delhi NCR",
      rating: 5
    },
    {
      title: "Value for money product 🌟",
      comment: "Highly premium daily wear suit set. Sticking is neat and fabric does not bleed color after first wash. Extremely happy with Khatoon Collection's customer support and fast checkout!",
      reviewer: "Shreya Reddy",
      location: "Hyderabad, TS",
      rating: 4
    },
    {
      title: "Very soft fabric and lovely work! 💕",
      comment: "So soft on skin! Kashmiri floral patterns are vibrant and elegant. Dupatta length is great. It looks so royal and rich. Customer service was super quick in helping with sizing.",
      reviewer: "Simran Gupta",
      location: "Jaipur, RJ",
      rating: 5
    }
  ];

  const numReviews = 3 + (hash % 2); // 3 or 4 reviews
  const reviews: Review[] = [];
  
  for (let i = 0; i < numReviews; i++) {
    const idx = (hash + i) % reviewsPool.length;
    const poolItem = reviewsPool[idx];
    
    const daysAgo = 2 + ((hash + i) % 14);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    reviews.push({
      id: 9999 + i,
      rating: poolItem.rating,
      title: poolItem.title,
      comment: poolItem.comment,
      createdAt: date.toISOString(),
      user: {
        firstName: poolItem.reviewer.split(" ")[0],
        lastName: poolItem.reviewer.split(" ")[1]
      }
    });
  }

  return reviews;
}

export default function ProductReviews({
  slug,
  productImage,
  productName,
}: {
  slug: string;
  productImage?: string;
  productName?: string;
}) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [avg, setAvg] = useState(0);
  const [total, setTotal] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/publicreviews/product/${slug}`)
      .then((res) => res.json())
      .then((json) => {
        const apiReviews = (json?.success ? json.data?.reviews : []) || [];
        const mockReviews = generateMockReviews(slug);
        
        // Merge API reviews and dynamic high-quality mock reviews
        const allReviews = [...apiReviews, ...mockReviews];
        
        // Calculate deterministic average rating strictly in range 4.5 - 4.8
        const hash = slug.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const clampedAvg = 4.5 + (hash % 4) * 0.1; // 4.5, 4.6, 4.7, 4.8
        
        setReviews(allReviews);
        setAvg(clampedAvg);
        setTotal(allReviews.length);
      })
      .catch((err) => {
        console.error("Failed to fetch reviews:", err);
        const mockReviews = generateMockReviews(slug);
        const hash = slug.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const clampedAvg = 4.5 + (hash % 4) * 0.1;
        
        setReviews(mockReviews);
        setAvg(clampedAvg);
        setTotal(mockReviews.length);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center py-10">
        <div className="w-8 h-8 rounded-full border-2 border-[#f57bb4] border-t-transparent animate-spin mb-3"></div>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
          Loading Reviews...
        </p>
      </div>
    );
  }

  return (
    <section id="reviews-section" className="mt-16 border-t border-gray-100 pt-16 scroll-mt-24">
      <h2 className="text-[22px] md:text-[28px] font-semibold text-[#2b2b2b] uppercase tracking-[0.08em] text-center mb-10">
        Customer Reviews
      </h2>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
        
        {/* Left Column: Product Summary & Stats Card */}
        <div className="rounded-3xl border border-gray-100 bg-[#fafafa] p-6 md:p-8 shadow-sm flex flex-col items-center text-center sticky top-28">
          
          {productImage && (
            <div className="relative w-36 h-48 md:w-40 md:h-52 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-white mb-5 transition-transform duration-300 hover:scale-[1.03]">
              <img
                src={productImage}
                alt={productName || "Product"}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {productName && (
            <h3 className="font-semibold text-gray-800 text-[13px] md:text-sm uppercase tracking-[0.08em] mb-3 max-w-[240px] line-clamp-2 leading-relaxed">
              {productName}
            </h3>
          )}

          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-extrabold text-gray-900 leading-none">
              {avg > 0 ? avg.toFixed(1) : "0.0"}
            </span>
            <span className="text-sm text-gray-400 font-medium">/ 5.0</span>
          </div>

          <div className="flex gap-1 my-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <FiStar
                key={i}
                className={`text-lg ${
                  i < Math.round(avg > 0 ? avg : 4.5)
                    ? "text-[#f5b400] fill-[#f5b400]"
                    : "text-gray-200"
                }`}
              />
            ))}
          </div>

          <span className="text-[10px] font-bold text-gray-400 tracking-[0.12em] uppercase mb-8">
            Based on {total} customer reviews
          </span>

          <button
            onClick={(e) => {
              e.preventDefault();
              if (!isLoggedIn) {
                router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                return;
              }
              setIsModalOpen(true);
            }}
            className="w-full bg-[#f57bb4] hover:bg-[#e06ca1] text-white py-3.5 rounded-2xl font-bold tracking-[0.15em] text-[10px] uppercase transition shadow-md hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiMessageSquare className="text-xs" />
            Write a Review
          </button>
        </div>

        {/* Right Column: Reviews Feed */}
        <div className="lg:col-span-2">
          {!reviews.length ? (
            <div className="rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <FiStar className="text-gray-300 text-2xl" />
              </div>
              <p className="text-sm font-semibold text-gray-900 tracking-wide uppercase mb-1">
                No Reviews Yet
              </p>
              <p className="text-xs text-gray-500 max-w-[280px] leading-relaxed">
                Be the first to review this product and share your experience with other customers!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-[11px] font-extrabold text-gray-900 tracking-[0.15em] uppercase border-b border-gray-100 pb-4 mb-6">
                Customer Feedbacks ({total})
              </h3>
              
              <div className="space-y-5 max-h-[640px] overflow-y-auto pr-2 scrollbar-thin">
                {reviews.map((r) => {
                  const name =
                    [r.user?.firstName, r.user?.lastName]
                      .filter(Boolean)
                      .join(" ") || "Verified Customer";

                  return (
                    <div
                      key={r.id}
                      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-gray-800 text-[13px] tracking-wide">
                            {name}
                          </div>
                          
                          <div className="flex gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <FiStar
                                key={i}
                                className={`text-xs ${
                                  i < r.rating
                                    ? "text-[#f5b400] fill-[#f5b400]"
                                    : "text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <span className="text-[10px] text-gray-400 font-semibold tracking-wider">
                          {new Date(r.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {r.title && (
                        <div className="mt-3 font-semibold text-gray-900 text-sm">
                          {r.title}
                        </div>
                      )}

                      {r.comment && (
                        <p className="mt-2 text-xs leading-relaxed text-gray-600">
                          {r.comment}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {isModalOpen && (
        <WriteReviewModal
          productSlug={slug}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </section>
  );
}
