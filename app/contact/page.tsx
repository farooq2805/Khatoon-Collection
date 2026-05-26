"use client";

import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

export default function ContactPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Contact Us
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We’re here to help. Reach out to Khatoon Collection for product support,
            inquiries, or assistance anytime.
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Get in Touch
            </h2>

            <div className="space-y-5 text-gray-700">
              <div className="flex items-start gap-4">
                <FiPhone className="text-[#f57bb4] text-xl mt-1" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm">
                    <a
                      href="tel:+919867196860"
                      className="hover:text-[#f57bb4] font-semibold transition-colors"
                    >
                      +91 98671 96860
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FiMapPin className="text-[#f57bb4] text-xl mt-1" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm leading-relaxed">
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Khatoon+Collection+no+19+yogi+vaishali+vaishali+market+Shop+no+4+building+opp+castle+tower+Jogeshwari+West+Mumbai+Maharashtra+400102"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#f57bb4] hover:underline transition-colors"
                      title="Open in Google Maps"
                    >
                      Shop No. 4, Building No. 19,
                      <br />
                      Yogi Vaishali, Vaishali Market,
                      <br />
                      Jogeshwari (West), Mumbai – 400102
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Send Us a Message
            </h2>

            <form className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#f57bb4]/40"
              />

              <input
                type="email"
                placeholder="Email Address"
                className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#f57bb4]/40"
              />

              <input
                type="text"
                placeholder="Subject"
                className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#f57bb4]/40"
              />

              <textarea
                rows={4}
                placeholder="Your Message"
                className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#f57bb4]/40"
              />

              <button
                type="submit"
                className="w-full bg-[#f57bb4] hover:bg-[#990077] text-white py-2 rounded-md font-semibold transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-500 mt-10">
          We aim to respond to all queries within 24–48 business hours.
        </p>
      </div>
    </div>
  );
}
