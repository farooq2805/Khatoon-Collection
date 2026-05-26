/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import StarRating from "./StarRating";

 //const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6103/api";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.khatooncollection.in/api";

export default function WriteReviewModal({
  productId,
  productSlug,
  onClose,
}: {
  productId?: number;
  productSlug?: string;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    // optional: allow re-selecting same file again later
    e.target.value = "";
  }

  async function handleSubmit() {
    if (loading) return;

    if (rating < 1) {
      toast.error("Please select a rating");
      return;
    }
    if (!title.trim() && !comment.trim()) {
      toast.error("Title or comment is required");
      return;
    }

    const form = new FormData();
    if (productId) form.append("productId", String(productId));
    if (productSlug) form.append("productSlug", productSlug);

    form.append("rating", String(rating));
    form.append("title", title.trim());
    form.append("comment", comment.trim());

    // ✅ Only send images if user selected any
    if (images.length) {
      images.forEach((img) => form.append("images", img));
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem("token") || localStorage.getItem("customerToken");

      await axios.post(`${API_BASE}/reviews`, form, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // NOTE: DO NOT set Content-Type manually for FormData
        },
      });

      toast.success("Review submitted for approval");
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">Write a review</h2>

        <StarRating value={rating} onChange={setRating} />

        <input
          className="mt-4 w-full rounded-lg border p-2"
          placeholder="Review title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="mt-3 w-full rounded-lg border p-2"
          rows={4}
          placeholder="Write your experience"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="mt-3">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full"
          />

          {images.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {images.length} image{images.length > 1 ? "s" : ""} (max 5)
            </p>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-[#f57bb4] px-4 py-2 text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
