/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  FiMenu,
  FiShoppingCart,
  FiX,
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiTrash2,
  FiUser,
} from "react-icons/fi";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import type { MenuItem } from "./menuData";
import { useCatalogMenu } from "./CatalogMenuProvider";
import { useRouter, useSearchParams } from "next/navigation";

export default function HeaderMobile({ items }: { items?: MenuItem[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const { menu } = useCatalogMenu();

  const rawData = items?.length ? items : menu;

  const [menuOpen, setMenuOpen] = useState(false);
  const [isBeforeEid, setIsBeforeEid] = useState(true);

  useEffect(() => {
    const eidDate = new Date("2026-05-29T23:59:59+05:30");
    setIsBeforeEid(new Date() < eidDate);
  }, []);
  
  const { isMiniCartOpen, setMiniCartOpen } = useCart();
  const [openKey, setOpenKey] = useState<string | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // const { cartItems, cartCount, updateQuantity, removeItem } = useCart();
  const { cartItems, updateQuantity, removeItem } = useCart();

const hydrated = typeof window !== "undefined";
   

const cartCountSafe = useMemo(() => {
  if (!hydrated) return 0;
  return cartItems.reduce(
    (sum: number, i: any) => sum + Number(i.quantity ?? 0),
    0
  );
}, [cartItems, hydrated]);

  const { username, logout } = useAuth();


  

  /* ================= SAFE PRICE FUNCTION ================= */
// const getPrice = (item: any) => Number(item?.price ?? 0);

const getPrice = useCallback((item: any) => {
  return Number(item?.price || item?.variant?.price || 0);
}, []);
  

  /* ================= SUBTOTAL ================= */
 const subtotal = useMemo(() => {
  return cartItems.reduce((sum: number, i: any) => {
    const price = Number(i.price ?? 0);
    const qty = Number(i.quantity ?? 0);
    return sum + price * qty;
  }, 0);
}, [cartItems]);


const closeAll = () => {
  setMenuOpen(false);
  setMiniCartOpen(false);
  setSearchOpen(false);
  setOpenKey(null);
};

  const toggle = (key: string) =>
    setOpenKey((prev) => (prev === key ? null : key));

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 0);
  }, [searchOpen]);

  function normalizeHref(href?: string) {
    if (!href) return "/products";
    if (href.startsWith("/products")) return href;

    if (href.startsWith("/category/")) {
      const v = href.replace("/category/", "").split("?")[0];
      return `/products?category=${encodeURIComponent(v)}`;
    }

    if (href.startsWith("/subcategory/")) {
      const v = href.replace("/subcategory/", "").split("?")[0];
      return `/products?subcategory=${encodeURIComponent(v)}`;
    }

    return href;
  }

  const data = useMemo<MenuItem[]>(() => {
    return (rawData || []).map((m: any) => ({
      ...m,
      href: normalizeHref(m.href),
      children: Array.isArray(m.children)
        ? m.children.map((c: any) => ({
            ...c,
            href: normalizeHref(c.href),
          }))
        : m.children,
    }));
  }, [rawData]);



  function goSearch(text?: string) {
    const query = (text ?? q).trim();

    const params = new URLSearchParams();
    if (query) params.set("q", query);

    const currentSort = sp?.get("sort");
    if (currentSort) params.set("sort", currentSort);

    params.set("page", "1");

    router.push(
      `/products${params.toString() ? `?${params.toString()}` : ""}`
    );

    closeAll();
  }



  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="lg:hidden sticky top-0 z-[70]">
        {/* Dynamic Offer bar on mobile */}
        <Link
          href="/products?sort=clearance"
          className="block bg-[#5C3825] text-white hover:opacity-95 transition-opacity"
        >
          <div className="mx-auto w-full px-4 py-2">
            <div className="text-[10px] sm:text-[11px] tracking-[0.15em] font-semibold text-center uppercase">
              {isBeforeEid ? (
                <span>THANK U FOR YOUR LOVE! Eid-ul-adha 2026 Bookings OPEN</span>
              ) : (
                <span>We ship worldwide | Easy Exchange available</span>
              )}
            </div>
          </div>
        </Link>

        <div className="bg-white shadow border-b border-black/10">
          <div className="flex items-center justify-between px-3 h-[90px]">

            <button
              onClick={() => setMenuOpen(true)}
              className="h-11 w-11 flex-shrink-0 grid place-items-center"
            >
              <FiMenu className="text-2xl" />
            </button>

            <Link href="/" onClick={closeAll} className="flex-1 flex justify-center px-2">
              <img
                src="/logo.png"
                className="h-[60px] w-auto object-contain"
                alt="Khatoon Collection"
                loading="eager"
              />
            </Link>

            <div className="flex gap-2">
              <button
                onClick={() => setSearchOpen((s) => !s)}
                className="h-11 w-11 grid place-items-center"
              >
                <FiSearch className="text-2xl" />
              </button>

              <button
                onClick={() => setMiniCartOpen(true)}
                className="relative h-11 w-11 grid place-items-center"
              >
                <FiShoppingCart className="text-2xl" />
                {cartCountSafe > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[11px] w-5 h-5 rounded-full grid place-items-center">
                    {cartCountSafe}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

     {/* ================= MOBILE MENU DRAWER ================= */}
<aside
  className={`fixed top-0 left-0 z-[9999] h-full w-[85%] max-w-[340px] bg-white transform transition-transform duration-300 ${
    menuOpen ? "translate-x-0" : "-translate-x-full"
  }`}
>
  <div className="flex items-center justify-between px-4 py-4 border-b">
    <h2 className="text-lg font-semibold">Menu</h2>

    <button onClick={() => setMenuOpen(false)}>
      <FiX className="text-2xl" />
    </button>
  </div>

  <div className="overflow-y-auto h-[calc(100%-70px)]">

    {/* STATIC LINKS */}
    <div className="border-b">
      <Link
        href="/"
        onClick={closeAll}
        className="flex items-center justify-between px-4 py-4 text-[15px] font-medium"
      >
        Home
      </Link>
    </div>

    <div className="border-b">
      <Link
        href="/about"
        onClick={closeAll}
        className="flex items-center justify-between px-4 py-4 text-[15px] font-medium"
      >
        About Us
      </Link>
    </div>

    <div className="border-b">
      <Link
        href="/products"
        onClick={closeAll}
        className="flex items-center justify-between px-4 py-4 text-[15px] font-medium"
      >
        Shop
      </Link>
    </div>

    {/* API MENU */}
    {menu.map((cat) => {
      const hasChildren = !!cat.children?.length;
      const opened = openKey === cat.label;

      return (
        <div key={cat.label} className="border-b">

          {/* CATEGORY */}
          <div className="flex items-center justify-between">

            <Link
              href={cat.href || "/products"}
              onClick={closeAll}
              className="flex-1 px-4 py-4 text-[15px] font-medium capitalize"
            >
              {cat.label}
            </Link>

            {hasChildren && (
              <button
                onClick={() => toggle(cat.label)}
                className="px-4"
              >
                <FiChevronDown
                  className={`transition-transform ${
                    opened ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
          </div>

          {/* SUBCATEGORIES */}
          {opened && hasChildren && (
            <div className="bg-black/[0.03]">

              {cat.children!.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  onClick={closeAll}
                  className="block px-8 py-3 text-[14px] text-black/70 capitalize border-t border-black/5"
                >
                  {c.label}
                </Link>
              ))}

            </div>
          )}
        </div>
      );
    })}

    {/* EXTRA LINKS */}
    <div className="border-b">
      <Link
        href="/contact"
        onClick={closeAll}
        className="flex items-center justify-between px-4 py-4 text-[15px] font-medium"
      >
        Contact Us
      </Link>
    </div>

  </div>
</aside>


      {/* ================= CART DRAWER ================= */}
      <aside
        className={`fixed top-0 right-0 z-[9999] h-full w-full sm:w-[420px] bg-white aside-menu transform transition ${
          // cartOpen ? "translate-x-0" : "translate-x-full"
          isMiniCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">

          <div className="bg-[#f57bb4] px-4 py-4 flex justify-between">
            <div>
              <h3 className="font-semibold">My Cart</h3>
              <p className="text-xs">{cartCountSafe} items</p>
            </div>

            <button onClick={() => setMiniCartOpen(false)}>
              <FiX />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">

            {cartItems.length === 0 ? (
              <p className="text-center text-gray-500">Cart empty</p>
            ) : (
              cartItems.map((item: any) => (
                <div key={item.variantId} className="border p-3 rounded-xl">

                  <div className="flex justify-between">
                    <p className="font-semibold">{item.name}</p>

                    <button onClick={() => removeItem(item.variantId)}>
                      <FiTrash2 />
                    </button>
                  </div>

                 <p className="text-sm text-gray-500">
  Qty: {Number(item.quantity ?? 1)}
</p>

{/* VARIANT INFO */}
{item.variant && (
  <p className="text-xs text-gray-500 mt-1">
    {[
      item.variant.color,
      item.variant.size,
      item.variant.weight,
    ]
      .filter(Boolean)
      .join(" / ")}
  </p>
)}

                  {/* PRICE FIX */}
                  <p className="font-bold">
                    ₹{getPrice(item).toFixed(2)}
                  </p>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() =>
                        updateQuantity(
  item.variantId,
  Math.max(1, Number(item.quantity ?? 1) - 1)
)
                      }
                    >
                      -
                    </button>

                    <span>{Number(item.quantity ?? 0)}</span>

                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, Number(item.quantity ?? 0) + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <p className="mt-2 font-bold">
                    ₹{(getPrice(item) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="border-t p-4">
            <p className="flex justify-between font-bold">
              <span>Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </p>

            {/* <Link
              href="/checkout"
              className="block mt-3 bg-black text-white text-center py-3 rounded-xl"
            >
              Checkout
            </Link> */}

            <button
  onClick={() => {
    closeAll();
    setTimeout(() => router.push("/checkout"), 150);
  }}
  className="block mt-3 bg-black text-white text-center py-3 rounded-xl w-full"
>
  Checkout
</button>
          </div>
        </div>
      </aside>

      {/* overlay */}
     {menuOpen && (
  <div
    className="fixed inset-0 bg-black/40 z-[80]"
    onClick={() => setMenuOpen(false)}
  />
)}

{isMiniCartOpen && (
  <div
    className="fixed inset-0 bg-black/40 z-[80]"
    onClick={() => setMiniCartOpen(false)}
  />
)}
    </>
  );
}