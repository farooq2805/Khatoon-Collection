/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function OrderSuccessPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);



  useEffect(() => {
    setOrderId(localStorage.getItem("lastOrderId"));
    setOrderNumber(localStorage.getItem("lastOrderNumber"));
  }, []);

  if (!orderId && !orderNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">No recent order found</h2>
          <Link
            href="/"
            className="bg-amber-400 text-black px-5 py-2 rounded-lg font-semibold hover:bg-amber-500"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-4xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* LEFT CONTENT */}



          <div className="flex justify-center">
            <video
    
        src="https://res.cloudinary.com/techsrow/video/upload/v1764145155/alsaif/o6CXxTKYuL_csqsfv.mp4"        // put your file in /public/videos
        controls                         // show play / pause / seek controls
        autoPlay                         // start automatically
        loop                             // continuous play
        muted                            // needed for autoplay in most browsers
        playsInline                      // better for mobile
        className="max-w-full rounded-xl shadow-lg"
        onContextMenu={(e) => e.preventDefault()} 
      />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-amber-400 mb-4">
              ✅ Order Confirmed!
            </h1>

            <p className="text-gray-200 mb-2">
              Thank you for your purchase. Your order has been placed successfully.
            </p>

            <p className="text-lg font-semibold text-green-400 mb-4">
              🚚 Order will be delivered within 1 hour
            </p>

            <div className="space-y-2 text-gray-300">
              <p>
                <span className="font-semibold text-white">Order ID:</span> {orderId}
              </p>
              <p>
                <span className="font-semibold text-white">Order Number:</span> {orderNumber}
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="bg-amber-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-amber-500 text-center"
              >
                Continue Shopping
              </Link>

              <Link
                href="/orders"
                className="border border-gray-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 text-center"
              >
                View My Orders
              </Link>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          
        </div>
      </div>
    </section>
  );
}
