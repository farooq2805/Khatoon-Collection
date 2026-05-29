"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FiHome,
  FiGrid,
  FiTag,
  FiShoppingCart,
} from "react-icons/fi";
import { useCart } from "@/context/CartContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [currentHref, setCurrentHref] = useState("");
  const [mounted, setMounted] = useState(false);
  const { cartCount } = useCart();

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    const handleURLChange = () => {
      setCurrentHref(window.location.href);
    };

    // Run immediately
    handleURLChange();

    // Listen to popstate (back/forward navigation)
    window.addEventListener("popstate", handleURLChange);

    // Listen to global click events to capture immediate Next.js routing transitions
    const handleGlobalClick = () => {
      setTimeout(handleURLChange, 50);
      setTimeout(handleURLChange, 150);
      setTimeout(handleURLChange, 350);
    };
    window.addEventListener("click", handleGlobalClick);

    // Periodic check as a fallback
    const interval = setInterval(handleURLChange, 200);

    return () => {
      window.removeEventListener("popstate", handleURLChange);
      window.removeEventListener("click", handleGlobalClick);
      clearInterval(interval);
    };
  }, [pathname]);

  const isActive = (path: string) => {
    if (!mounted) {
      if (path === "/products?sort=clearance") return false;
      if (path === "/products") return pathname.startsWith("/products");
      return pathname === path || (path !== "/" && pathname.startsWith(path));
    }

    const searchStr = typeof window !== "undefined" ? window.location.search.toLowerCase() : "";
    const hrefStr = currentHref.toLowerCase();
    const isClearance = searchStr.includes("clearance") || hrefStr.includes("clearance");
    const isProductsPage = pathname.startsWith("/products");

    if (path === "/products?sort=clearance") {
      return isProductsPage && isClearance;
    }
    if (path === "/products") {
      return isProductsPage && !isClearance;
    }
    return pathname === path || (path !== "/" && pathname.startsWith(path));
  };

  const iconClass = (path: string) =>
    isActive(path) ? "text-[#f57bb4]" : "text-gray-400";

  const textClass = (path: string) =>
    isActive(path)
      ? "text-[#f57bb4] font-medium"
      : "text-gray-400";

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-black/10">
      <div className="flex items-center justify-around py-2">
        {/* Home */}
        <Link
          href="/"
          onClick={() => setCurrentHref("/")}
          className="flex flex-col items-center gap-[2px]"
        >
          <FiHome className={`text-[18px] ${iconClass("/")}`} strokeWidth={1.6} />
          <span className={`text-[10px] ${textClass("/")}`}>Home</span>
        </Link>

        {/* Products */}
        <Link
          href="/products"
          onClick={() => setCurrentHref("/products")}
          className="flex flex-col items-center gap-[2px]"
        >
          <FiGrid
            className={`text-[18px] ${iconClass("/products")}`}
            strokeWidth={1.6}
          />
          <span className={`text-[10px] ${textClass("/products")}`}>
            Products
          </span>
        </Link>

        {/* Offers */}
        <Link
          href="/products?sort=clearance"
          onClick={() => setCurrentHref("/products?sort=clearance")}
          className="flex flex-col items-center gap-[2px]"
        >
          <FiTag
            className={`text-[18px] ${iconClass("/products?sort=clearance")}`}
            strokeWidth={1.6}
          />
          <span className={`text-[10px] ${textClass("/products?sort=clearance")}`}>
            Offers
          </span>
        </Link>

        {/* Cart */}
        <Link
          href="/cart"
          onClick={() => setCurrentHref("/cart")}
          className="flex flex-col items-center gap-[2px] relative"
        >
          <div className="relative">
            <FiShoppingCart
              className={`text-[18px] ${iconClass("/cart")}`}
              strokeWidth={1.6}
            />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] ${textClass("/cart")}`}>
            Cart
          </span>
        </Link>
      </div>
    </nav>
  );
}
