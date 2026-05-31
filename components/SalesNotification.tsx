"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FiX, FiCheck } from "react-icons/fi";
import { usePathname } from "next/navigation";
import { productService } from "@/services/productService";

const INDIAN_NAMES = ["Priya", "Kiran", "Ayesha", "Pooja", "Sneha", "Meera", "Ritu", "Anjali", "Divya", "Neha", "Shalini", "Sunita", "Preeti", "Kavita"];
const INDIAN_LOCATIONS = ["New Delhi, DL", "Mumbai, MH", "Hyderabad, TS", "Pune, MH", "Bangalore, KA", "Ahmedabad, GJ", "Jaipur, RJ", "Kolkata, WB", "Lucknow, UP", "Surat, GJ"];
const TIME_OPTIONS = ["1 min ago", "2 mins ago", "3 mins ago", "4 mins ago", "5 mins ago", "6 mins ago", "8 mins ago", "10 mins ago", "12 mins ago", "15 mins ago"];

type SaleNotification = {
  name: string;
  location: string;
  productName: string;
  slug: string;
  timeAgo: string;
  thumbnail: string;
};

function getProductThumbnail(product: any): string {
  if (product?.mainImageUrl) return product.mainImageUrl;
  if (product?.imageUrl) return product.imageUrl;
  if (Array.isArray(product?.images) && product.images.length > 0) {
    const img = product.images[0];
    return typeof img === "object" ? img?.url : img;
  }
  return "/placeholder.png";
}

export default function SalesNotification() {
  const pathname = usePathname();
  const [products, setProducts] = useState<any[]>([]);
  const [currentSale, setCurrentSale] = useState<SaleNotification | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fetch all real products from the store on mount
    productService.getAll()
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          setProducts(items);
        }
      })
      .catch((err) => {
        console.error("Error loading products for sales notification popup", err);
      });
  }, []);

  useEffect(() => {
    if (products.length === 0) return;

    const generateRandomSale = () => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const name = INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)];
      const location = INDIAN_LOCATIONS[Math.floor(Math.random() * INDIAN_LOCATIONS.length)];
      const timeAgo = TIME_OPTIONS[Math.floor(Math.random() * TIME_OPTIONS.length)];

      setCurrentSale({
        name,
        location,
        productName: randomProduct.name || "Stunning Ethnic Wear",
        slug: randomProduct.slug || "",
        timeAgo,
        thumbnail: getProductThumbnail(randomProduct),
      });
    };

    // Generate first sale immediately
    generateRandomSale();

    // Initial delay before first popup shows
    const initialDelay = setTimeout(() => {
      setVisible(true);
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setVisible(false);
      }, 5000);
    }, 8000);

    // Dynamic rotation logic: shows every 35 seconds (5s visible + 30s hidden delay)
    const interval = setInterval(() => {
      generateRandomSale();
      setVisible(true);

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setVisible(false);
      }, 5000);

    }, 35000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [products]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
  };

  // Do not show on any product detail pages to avoid blocking product info
  if (pathname.startsWith("/products/")) {
    return null;
  }

  if (!visible || !currentSale) return null;

  return (
    <div 
      className="
        fixed 
        top-2 
        left-1/2 
        -translate-x-1/2 
        w-[94%] 
        max-w-[380px] 
        rounded-xl 
        border 
        border-gray-100 
        shadow-xl 
        z-[999] 
        bg-white 
        p-2.5 
        flex 
        items-center 
        gap-3 
        md:fixed 
        md:top-auto 
        md:bottom-6 
        md:left-6 
        md:right-auto 
        md:translate-x-0 
        md:w-[320px] 
        md:rounded-2xl 
        md:border 
        md:shadow-xl 
        animate-slide-up 
        cursor-pointer
        hover:shadow-2xl
        transition-all
        duration-300
      "
      onClick={() => {
        if (currentSale.slug) {
          window.location.href = `/products/${currentSale.slug}`;
        }
      }}
    >
      {/* Product Image Thumbnail */}
      <div className="relative w-12 h-16 flex-none bg-gray-50 rounded-lg overflow-hidden">
        <Image
          src={currentSale.thumbnail}
          alt={currentSale.productName}
          fill
          sizes="48px"
          className="object-cover"
          unoptimized={true}
        />
      </div>

      {/* Sale Meta Content */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-1.5 text-[#f57bb4] text-[10px] font-bold uppercase tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex items-center justify-center">
            <FiCheck className="text-white text-[8px] font-extrabold" />
          </span>
          <span>Recent Purchase</span>
        </div>
        
        <p className="text-gray-700 text-xs font-semibold mt-1 leading-snug truncate">
          {currentSale.name} from {currentSale.location}
        </p>
        
        <p className="text-gray-500 text-[10px] font-medium mt-0.5 truncate">
          ordered <span className="font-semibold text-gray-900">{currentSale.productName}</span>
        </p>
        
        <p className="text-gray-400 text-[9px] font-semibold mt-0.5">
          {currentSale.timeAgo}
        </p>
      </div>

      {/* Close Action Button */}
      <button 
        onClick={handleDismiss}
        className="
          absolute 
          top-2.5 
          right-2.5 
          text-gray-400 
          hover:text-gray-700 
          p-1 
          rounded-full 
          transition-colors
        "
        aria-label="Dismiss notification"
      >
        <FiX className="text-sm" />
      </button>
    </div>
  );
}
