"use client";

import React, { useState } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;
    setSubmitted(true);
    setEmail("");

    // ✅ You can replace this with your backend or Mailchimp API call
    console.log("Newsletter signup:", email);
  };

  return (
    <section className="py-20 bg-gradient-to-r from-purple-900 via-black to-teal-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <i className="ri-mail-line text-6xl text-amber-400 mb-6 block"></i>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Stay in the Loop
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get exclusive access to new flavors, special events, and
            member-only discounts. Join our community of hookah enthusiasts.
          </p>
        </div>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto"
            id="newsletter-signup"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-colors text-sm"
                required
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:from-amber-500 hover:to-yellow-600 shadow-lg hover:shadow-xl px-8 py-4 text-lg rounded-xl sm:w-auto w-full"
              >
                <i className="ri-send-plane-line mr-2"></i>Subscribe
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        ) : (
          <p className="text-green-400 font-semibold mt-4">
            ✅ Thank you for subscribing!
          </p>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <i className="ri-gift-line text-3xl text-amber-400 mb-4 block"></i>
            <h3 className="text-lg font-semibold text-white mb-2">
              Exclusive Offers
            </h3>
            <p className="text-gray-400">
              Member-only discounts and special promotions
            </p>
          </div>
          <div className="text-center">
            <i className="ri-calendar-event-line text-3xl text-purple-400 mb-4 block"></i>
            <h3 className="text-lg font-semibold text-white mb-2">
              Event Invites
            </h3>
            <p className="text-gray-400">
              First access to special events and tastings
            </p>
          </div>
          <div className="text-center">
            <i className="ri-star-line text-3xl text-teal-400 mb-4 block"></i>
            <h3 className="text-lg font-semibold text-white mb-2">
              New Flavors
            </h3>
            <p className="text-gray-400">
              Be the first to try our latest flavor creations
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
