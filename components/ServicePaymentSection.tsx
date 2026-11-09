"use client";

import Link from "next/link";
import { FiAward, FiTruck, FiShield } from "react-icons/fi";

export default function ServicePaymentSection() {
  return (
    <section className="bg-white border-t">
      <div className="max-w-7xl mx-auto">

        {/* TOP INFO ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-b">

          {/* Shipping */}
          <div className="flex items-center gap-4 p-6 border-r">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#f57bb4]/10 text-[#f57bb4]">
              <FiTruck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">Shipping Across India</p>
            </div>
          </div>

          {/* Premium Quality */}
          <div className="flex items-center gap-4 p-6 border-r">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#f57bb4]/10 text-[#f57bb4]">
              <FiAward className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">Premium Quality</p>
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-center justify-between p-6">
            <p className="font-semibold text-lg">
              Have Queries or Concerns?
            </p>
            <Link
              href="/contact"
              className="border border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white transition px-6 py-2 rounded-md font-semibold"
            >
              CONTACT US
            </Link>
          </div>

        </div>

        {/* PAYMENT ROW */}
        <div className="p-6">
          <p className="flex items-center gap-2 text-green-600 font-medium mb-4">
            <FiShield className="text-lg" />
            100% Secure Payments via Razorpay, Easy Return Policy
          </p>

          {/* PAYMENT METHODS */}
          <div className="flex flex-wrap items-center gap-2">
            {["UPI", "Visa", "Mastercard", "RuPay", "Net Banking", "Wallets"].map((method) => (
              <span
                key={method}
                className="px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200 rounded-md bg-gray-50"
              >
                {method}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
