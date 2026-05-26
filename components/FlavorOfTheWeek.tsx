"use client";
import React from "react";
import "remixicon/fonts/remixicon.css";

const FlavorOfTheWeek = () => {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-teal-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Text Block */}
          <div>
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-600 text-white text-sm font-semibold rounded-full">
                FLAVOR OF THE WEEK
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Mystic
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400">
                Blueberry Mint
              </span>
            </h2>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Experience the perfect harmony of sweet blueberries and refreshing
              mint. This week&apos;s special blend offers a smooth, cooling sensation
              with bursts of fruity sweetness that will transport you to
              paradise.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center text-gray-300">
                <i className="ri-star-fill text-amber-400 mr-3"></i>
                <span>Premium quality tobacco blend</span>
              </div>
              <div className="flex items-center text-gray-300">
                <i className="ri-leaf-line text-green-400 mr-3"></i>
                <span>Natural fruit and mint extracts</span>
              </div>
              <div className="flex items-center text-gray-300">
                <i className="ri-time-line text-purple-400 mr-3"></i>
                <span>Long-lasting flavor profile</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                className="font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:from-amber-500 hover:to-yellow-600 shadow-lg hover:shadow-xl px-8 py-4 text-lg rounded-xl"
              >
                <i className="ri-shopping-cart-line mr-2"></i>
                Order Now - ₹1,999
              </button>

              <button
                type="button"
                className="font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-8 py-4 text-lg rounded-xl"
              >
                <i className="ri-calendar-line mr-2"></i>
                Try in Lounge
              </button>
            </div>
          </div>

          {/* Right Image Block */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden">
              <img
                alt="Mystic Blueberry Mint Flavor"
                className="w-full h-96 object-cover object-top"
                src="https://readdy.ai/api/search-image?query=Premium%20blueberry%20mint%20hookah%20tobacco%20in%20elegant%20glass%20container%2C%20vibrant%20blue%20and%20green%20colors%2C%20fresh%20mint%20leaves%2C%20blueberries%2C%20luxury%20shisha%20tobacco%2C%20professional%20product%20photography%2C%20dark%20background%2C%20studio%20lighting%2C%20premium%20packaging&width=600&height=600&seq=flavor-week&orientation=squarish"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

              {/* Discount Badge */}
              <div className="absolute top-6 right-6 bg-amber-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                25% OFF
              </div>

              {/* Rating Box */}
              <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex text-amber-400">
                    <i className="ri-star-fill text-sm"></i>
                    <i className="ri-star-fill text-sm"></i>
                    <i className="ri-star-fill text-sm"></i>
                    <i className="ri-star-fill text-sm"></i>
                    <i className="ri-star-fill text-sm"></i>
                  </div>
                  <span className="text-white text-sm">4.9/5</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Rated by 127 customers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlavorOfTheWeek;
