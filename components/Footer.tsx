// src/components/Footer.jsx
import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="ticker text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand + About */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <div className="mb-5">
              <Link href="/">
                <img
                  src="/logo_white.svg"
                  alt="Khatoon Collection"
                  className="h-[156px] w-auto object-contain"
                  loading="lazy"
                />
              </Link>
            </div>

            <p className="text-white-400 mb-6 max-w-md">
              Khatoon Collection offers elegant modest fashion, blending tradition with modern style, comfort, and quality for confident women everywhere.
            </p>

            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/khatooncollection25/?hl=en"
                className="w-10 h-10 flex items-center justify-center bg-white rounded-full transition-colors"
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
                  Exchange &amp; Return
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

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white-500">
              Products
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=premium-daily" className="text-white-400 transition-colors">
                  Premium Daily
                </Link>
              </li>
              <li>
                <Link href="/products?category=premium-rayon-suit" className="text-white-400 transition-colors">
                  Premium Rayon Suit
                </Link>
              </li>
              <li>
                <Link href="/products?category=party-wear" className="text-white-400 transition-colors">
                  Party Wear
                </Link>
              </li>
              <li>
                <Link href="/products?category=dailywear" className="text-white-400 transition-colors">
                  Daily Wear
                </Link>
              </li>
              <li>
                <Link href="/products?category=viral-suit" className="text-white-400 transition-colors">
                  Viral Suit
                </Link>
              </li>
              <li>
                <Link href="/products?category=plus-size" className="text-white-400 transition-colors">
                  Plus Size
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white-500">
              Contact Us
            </h3>
            <ul className="space-y-5">

              {/* Phone Numbers */}
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-widest text-white/50 font-bold">Call / WhatsApp</p>
                  <a
                    href="tel:+919867196860"
                    className="block text-white hover:text-white/80 transition-colors text-sm font-medium"
                  >
                    +91 98671 96860
                  </a>
                  <a
                    href="tel:+919136868443"
                    className="block text-white hover:text-white/80 transition-colors text-sm font-medium"
                  >
                    +91 91368 68443
                  </a>
                </div>
              </li>

              {/* Store Address with Google Maps link */}
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-widest text-white/50 font-bold">Our Store - Branch 1</p>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Shop No. 4, Building No. 19,<br />
                    Yogi Vaishali, Vaishali Market,<br />
                    Jogeshwari (West),<br />
                    Mumbai – 400102
                  </p>
                  <a
                    href="https://maps.app.goo.gl/ZtYg2vXTmpFuPQRB8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-white hover:text-white/80 text-xs font-bold underline transition-colors group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Get Directions on Google Maps
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-widest text-white/50 font-bold">Our Store - Branch 2</p>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Rabia Shopping Hub, Opposite Lady Hub,<br />
                    Near Nexus Medical, Vaishali Nagar Market,<br />
                    Jogeshwari West, Mumbai - 400102
                  </p>
                  <a
                    href="https://maps.google.com/?q=Rabia+Shopping+Hub,Vaishali+Nagar+Market,Jogeshwari+West,Mumbai+400102"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-white hover:text-white/80 text-xs font-bold underline transition-colors group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Get Directions on Google Maps
                  </a>
                </div>
              </li>

            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-10 pt-8 flex flex-col md:flex-row justify-center items-center gap-3">
          <p className="text-white/60 text-sm text-center">
            © {new Date().getFullYear()} Khatoon Collection. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
