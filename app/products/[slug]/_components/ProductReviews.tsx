"use client";

import { useEffect, useState } from "react";
import { FiStar } from "react-icons/fi";

//const API_BASE = "http://localhost:6103/api";
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

export default function ProductReviews({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true);
  const [avg, setAvg] = useState(0);
  const [total, setTotal] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/publicreviews/product/${slug}`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.success) {
          setAvg(json.data.avgRating || 0);
          setTotal(json.data.total || 0);
          setReviews(json.data.reviews || []);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="mt-8 text-gray-500">Loading reviews…</div>;
  }

  if (!reviews.length) {
    return (
      <div className="mt-8 rounded-xl border p-4 text-gray-600">
        No reviews yet.
      </div>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-gray-900">
        Customer Reviews
      </h2>

      {/* Rating Summary */}
      <div className="mt-3 flex items-center gap-2">
        <div className="text-2xl font-bold">{avg.toFixed(1)}</div>
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <FiStar
              key={i}
              className={i < Math.round(avg) ? "text-yellow-500" : "text-gray-300"}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          ({total} reviews)
        </span>
      </div>

      {/* Reviews List */}
      <div className="mt-6 space-y-4">
        {reviews.map((r) => {
          const name =
            [r.user?.firstName, r.user?.lastName]
              .filter(Boolean)
              .join(" ") || "User";

          return (
            <div key={r.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900">{name}</div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar
                      key={i}
                      className={i < r.rating ? "text-yellow-500" : "text-gray-300"}
                    />
                  ))}
                </div>
              </div>

              {r.title && (
                <div className="mt-1 font-medium text-gray-800">
                  {r.title}
                </div>
              )}

              {r.comment && (
                <p className="mt-2 text-gray-700">{r.comment}</p>
              )}

              <div className="mt-2 text-xs text-gray-500">
                {new Date(r.createdAt).toLocaleDateString("en-IN")}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
