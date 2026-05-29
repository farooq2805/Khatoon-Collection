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
  const [qualityRating, setQualityRating] = useState(0);
  const [shipmentRating, setShipmentRating] = useState(0);
  const [supportRating, setSupportRating] = useState(0);
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

    if (qualityRating < 1 || shipmentRating < 1 || supportRating < 1) {
      toast.error("Please provide ratings for all 3 categories");
      return;
    }
    if (!title.trim() && !comment.trim()) {
      toast.error("Title or comment is required");
      return;
    }

    const overallRating = Math.round((qualityRating + shipmentRating + supportRating) / 3);

    const form = new FormData();
    if (productId) form.append("productId", String(productId));
    if (productSlug) form.append("productSlug", productSlug);

    const ratingDetails = `\n\n--- D2C Product & Service Ratings ---\n👗 Dress Quality: ${"★".repeat(qualityRating)}${"☆".repeat(5 - qualityRating)}\n📦 Shipment & Delivery: ${"★".repeat(shipmentRating)}${"☆".repeat(5 - shipmentRating)}\n💬 Customer Support & All: ${"★".repeat(supportRating)}${"☆".repeat(5 - supportRating)}`;

    form.append("rating", String(overallRating));
    form.append("title", title.trim());
    form.append("comment", comment.trim() + ratingDetails);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-800">Write a Review</h2>
        <p className="text-xs text-gray-500 mb-4 mt-0.5">Your feedback helps us maintain premium D2C standards.</p>

        {/* 3 Vertical D2C Ratings */}
        <div className="space-y-3.5 my-4 border border-black/10 rounded-xl p-4 bg-[#fdfafb] flex flex-col">
          {/* Dress Quality */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-[13px] font-semibold text-gray-700">👗 Dress Quality</span>
            <StarRating value={qualityRating} onChange={setQualityRating} />
          </div>

          {/* Shipment */}
          <div className="flex items-center justify-between gap-4 border-t border-black/5 pt-3.5">
            <span className="text-[13px] font-semibold text-gray-700">📦 Shipment & Delivery</span>
            <StarRating value={shipmentRating} onChange={setShipmentRating} />
          </div>

          {/* Customer Support */}
          <div className="flex items-center justify-between gap-4 border-t border-black/5 pt-3.5">
            <span className="text-[13px] font-semibold text-gray-700">💬 Customer Support & All</span>
            <StarRating value={supportRating} onChange={setSupportRating} />
          </div>
        </div>

        <input
          className="mt-4 w-full rounded-lg border p-2 text-sm outline-none focus:border-black/30"
          placeholder="Review title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="mt-3 w-full rounded-lg border p-2 text-sm outline-none focus:border-black/30"
          rows={4}
          placeholder="Describe your dress quality, shipping speed, and support experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Upload Photos (Optional)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
          />

          {images.length > 0 && (
            <p className="mt-2 text-xs text-gray-600 font-medium">
              Selected: {images.length} image{images.length > 1 ? "s" : ""} (max 5)
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-[#f57bb4] px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
