// src/components/Footer.jsx
import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="ticker text-white ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand + About */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-left mb-4">
              <span
                className="text-2xl font-bold"
                style={{ fontFamily: "Pacifico, serif" }}
              >
                <img
                  src="https://res.cloudinary.com/techsrow/image/upload/v1770499740/final-white-logo_fxfnae.png"
                  className="logo-footer"
                ></img>
              </span>
            </div>

            <p className="text-white-400 mb-6 max-w-md">
             Khatoon Collection offers elegant modest fashion, blending tradition with modern style, comfort, and quality for confident women everywhere.


            </p>

            <div className="flex space-x-4">
             
              <a
                href="https://www.instagram.com/khatooncollection25/?hl=en"
                className="w-10 h-10 flex items-center justify-center bg-white rounded-full  transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="ri-instagram-line text-[#f57bb4]"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white-500">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                 <Link href="/about" className="text-white-400 transition-colors">
About
                </Link>
              </li>
              <li>
                 <Link href="/products" className="text-white-400 transition-colors">
                 Shop
                </Link>
              </li>
              <li>
                 <Link href="/contact" className="text-white-400 transition-colors">
Contact
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-white-400 transition-colors">
Cart
                </Link>
              </li>

<li>
                <Link href="/return-policy" className="text-white-400 transition-colors">
Exchange & Return
                </Link>
              </li>

              <li>
                <Link href="/shipping-policy" className="text-white-400 transition-colors">
Shipping Policies
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-white-400 transition-colors">
Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-white-400 transition-colors">
Terms of Service
                </Link>
              </li>

            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white-500">
              Products
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products?category=premium-daily"
                  className="text-white-400 transition-colors"
                >
               Premium Daily
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=premium-rayon-suit"
                  className="text-white-400 transition-colors"
                >
                 Premium Rayon Suit
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=party-wear"
                  className="text-white-400 transition-colors"
                >
                 Party Wear
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=dailywear"
                  className="text-white-400 transition-colors"
                >
                 Daily Wear
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=viral-suit"
                  className="text-white-400 transition-colors"
                >
                 viral Suit
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=plus-size"
                  className="text-white-400 transition-colors"
                >
                 Plus Size
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white-400 text-sm">
            © {new Date().getFullYear()} crkhatooncollection All rights reserved.
          </p>
          <a
            href="https://readdy.ai/?origin=logo"
            className="text-white-400 hover:text-amber-400 transition-colors text-sm mt-2 md:mt-0"
          ></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
