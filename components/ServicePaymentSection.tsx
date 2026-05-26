"use client";

import { FiAward } from "react-icons/fi";

export default function ServicePaymentSection() {
  return (
    <section className="bg-white border-t">
      <div className="max-w-7xl mx-auto">

        {/* TOP INFO ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-b">
          
          {/* Worldwide Shipping */}
          <div className="flex items-center gap-4 p-6 border-r">
            <img
              src="https://res.cloudinary.com/techsrow/image/upload/v1768128314/crescent%20health%20Care/ICONS/fast_j2sk8b.png"
              alt="Worldwide Shipping"
              className="w-10 h-10"
            />
            <div>
              <p className="font-semibold">Worldwide Shipping</p>
             
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
            <button className="border border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white transition px-6 py-2 rounded-md font-semibold">
              CONTACT US
            </button>
          </div>

        </div>

        {/* PAYMENT ROW */}
        <div className="p-6">
          <p className="flex items-center gap-2 text-green-600 font-medium mb-4">
            <span className="text-lg">✔</span>
            100% Payment Protection, Easy Return Policy
          </p>

          {/* PAYMENT ICONS */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              "upi",
          
            ].map((icon) => (
              <img
                key={icon}
                src="https://res.cloudinary.com/techsrow/image/upload/v1768127810/crescent%20health%20Care/End%20icons/Untitled%20design/web-payments_l7mmxs.png"
                alt={icon}
                className=" object-contain"
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
