"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiSearch, FiShoppingCart, FiUser, FiX } from "react-icons/fi";
import { useRouter, usePathname } from "next/navigation";
import DesktopMenu from "./DesktopMenu";
import { useCart } from "@/context/CartContext";

function pad2(n: number) {
  const s = String(n);
  return s.length === 1 ? `0${s}` : s;
}

export default function HeaderDesktop() {
  const [sticky, setSticky] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const { cartCount } = useCart();

  const [q, setQ] = useState("");
  const [isBeforeEid, setIsBeforeEid] = useState(true);

  // ✅ Local auth state (desktop header will react instantly)
  const [token, setToken] = useState<string | null>(null);
  const [lsUsername, setLsUsername] = useState<string | null>(null);


  const syncAuth = () => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("username");
    setToken(t);
    setLsUsername(u && u.trim() ? u : null);
  };



  // ✅ Keep auth in sync
  useEffect(() => {
    syncAuth();

    const onAuthChanged = () => syncAuth();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "username") syncAuth();
    };

    const onFocus = () => syncAuth();

    window.addEventListener("auth-changed", onAuthChanged as EventListener);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("auth-changed", onAuthChanged as EventListener);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // ✅ Also sync on route change (login redirect back to checkout, etc.)
  useEffect(() => {
    syncAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/");
  };

  // Dynamic Eid booking offer check (runs once on client load)
  useEffect(() => {
    const eidDate = new Date("2026-05-29T23:59:59+05:30");
    setIsBeforeEid(new Date() < eidDate);
  }, []);

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);




  // ✅ Search should only go to /products (no real search)
  const goProducts = (text?: string) => {
    const query = (text ?? q).trim();
    router.push(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
  };

  const [hydrated, setHydrated] = useState(false);

useEffect(() => {
  setHydrated(true);
}, []);

  return (
    <header
      className={`hidden lg:block w-full sticky top-0 z-50 bg-white ${
        sticky ? "shadow-md" : "shadow-sm"
      }`}
    >
      {/* TOP OFFER BAR */}
      <Link
        href="/products"
        className="block bg-[#5C3825] text-white hover:opacity-95 transition-opacity"
      >
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="relative flex items-center justify-center py-2.5">
            <div className="text-[12px] md:text-[13px] tracking-[0.2em] font-semibold text-center uppercase">
              {isBeforeEid ? (
                <span>THANK U FOR YOUR LOVE! Eid-ul-adha 2026 Bookings OPEN</span>
              ) : (
                <span>We ship worldwide | Easy Exchange available</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* ROW 2: SEARCH + LOGO + ICONS */}
      <div className="border-b border-black/10">
        <div className="mx-auto max-w-[1400px] px-6 py-0">
          <div className="grid grid-cols-3 items-center">
            {/* Search (left) */}
            <div className="flex items-center">
              <div className="relative w-full max-w-[300px]">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black/60" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      goProducts();
                    }
                  }}
                  placeholder="Search"
                  className="
                    w-full h-11 rounded-md
                    bg-[#f3f3f3]
                    border border-black/10
                    pl-10 pr-10
                    text-[14px]
                    outline-none
                    focus:ring-2 focus:ring-black/10
                  "
                />
                {q.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setQ("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 hover:text-black"
                    aria-label="Clear"
                  >
                    <FiX className="text-[18px]" />
                  </button>
                )}
              </div>
            </div>

            {/* Logo (center) */}
            <div className="flex justify-center">
              <Link href="/" className="inline-flex items-center">
                <img
                  src="/logo.png"
                  alt="Khatoon Collection"
                  className="h-14 w-auto max-w-[240px] object-contain"
                  draggable={false}
                  loading="eager"
                />
              </Link>
            </div>

            {/* Icons (right) */}
            <div className="flex justify-end items-center gap-6 text-black">
              {/* Cart */}
              <Link
                href="/cart"
                className="relative hover:opacity-80"
                aria-label="Cart"
              >
                <FiShoppingCart className="text-[22px]" />
                {hydrated && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-[11px] font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>


              {/* Auth area */}
              {!token ? (
                <div className="flex items-center gap-3">
                  <Link
                    href={`/login?next=${encodeURIComponent(
                      pathname || "/"
                    )}`}
                    className="flex items-center gap-2 hover:opacity-80"
                  >
                    <FiUser className="text-[20px]" />
                    <span>Login</span>
                  </Link>

                  <Link
                    href="/register"
                    className="px-3 py-1 rounded border border-black/10 bg-white hover:bg-black/5"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                 <button
  type="button"
  onClick={() => router.push("/account")}
  className="text-sm hover:underline hover:opacity-80"
>
  Hi, <b>{lsUsername || "User"}</b>
</button>

                  <button
                    onClick={logout}
                    className="px-3 py-1 rounded border border-black/10 bg-white hover:bg-black/5"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: MENU */}
      <DesktopMenu />
    </header>
  );
}
