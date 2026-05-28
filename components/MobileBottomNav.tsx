"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiGrid,
  FiTag,
  FiUser,
} from "react-icons/fi";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (typeof window !== "undefined") {
      const search = window.location.search;
      if (path === "/products?sort=clearance") {
        return pathname === "/products" && search.includes("sort=clearance");
      }
      if (path === "/products") {
        return pathname === "/products" && !search.includes("sort=clearance");
      }
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
        <Link href="/" className="flex flex-col items-center gap-[2px]">
          <FiHome className={`text-[18px] ${iconClass("/")}`} strokeWidth={1.6} />
          <span className={`text-[10px] ${textClass("/")}`}>Home</span>
        </Link>

        {/* Products */}
        <Link href="/products" className="flex flex-col items-center gap-[2px]">
          <FiGrid
            className={`text-[18px] ${iconClass("/products")}`}
            strokeWidth={1.6}
          />
          <span className={`text-[10px] ${textClass("/products")}`}>
            Products
          </span>
        </Link>

        {/* Offers */}
        <Link href="/products?sort=clearance" className="flex flex-col items-center gap-[2px]">
          <FiTag
            className={`text-[18px] ${iconClass("/products?sort=clearance")}`}
            strokeWidth={1.6}
          />
          <span className={`text-[10px] ${textClass("/products?sort=clearance")}`}>
            Offers
          </span>
        </Link>

        {/* Profile */}
        <Link href="/login" className="flex flex-col items-center gap-[2px]">
          <FiUser
            className={`text-[18px] ${iconClass("/login")}`}
            strokeWidth={1.6}
          />
          <span className={`text-[10px] ${textClass("/login")}`}>
            Account
          </span>
        </Link>
      </div>
    </nav>
  );
}
