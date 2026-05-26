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
  const [timeLeft, setTimeLeft] = useState({ h: 22, m: 48, s: 56 }); // demo like screenshot

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

  // Countdown (optional; remove if you want static)
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((p) => {
        let h = p.h,
          m = p.m,
          s = p.s - 1;
        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h = Math.max(0, h - 1);
        }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
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
      <div className="bg-[#f57bb4] text-white">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="relative flex items-center justify-center py-3">
            <div className="text-[15px] tracking-wide uppercase">
              We ship worldwide
            </div>

            {/* Countdown (right) */}
            <div className="absolute right-0 flex items-end gap-2">
              <div className="text-[28px] font-bold tracking-wider tabular-nums leading-none">
                {pad2(timeLeft.h)}:{pad2(timeLeft.m)}:{pad2(timeLeft.s)}
              </div>
              <div className="pb-[2px] text-[11px] leading-none opacity-90">
                <div className="flex gap-6">
                  <span>Hrs</span>
                  <span>Mins</span>
                  <span>Secs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  src="https://res.cloudinary.com/techsrow/image/upload/v1770492215/main-logo-kh_wzsgtu.png"
                  alt="Khatoon Collection"
                  className="h-20 w-auto"
                  draggable={false}
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

              {/* Store */}
              <Link
                href="/contact"
                className="hover:opacity-80"
                aria-label="Store"
              >
                <span className="inline-flex h-[22px] w-[22px] items-center justify-center border border-black/40 rounded-[3px] text-[11px]">
                  🏬
                </span>
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
