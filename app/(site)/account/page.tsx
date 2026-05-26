/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getMe } from "@/lib/auth";
import { clearStoredUsername, clearToken, getToken } from "@/lib/storage";
import { getErrorMessage } from "@/lib/http";
import type { MeDTO, OrderDTO } from "@/lib/types";
import { orderService } from "@/services/orderService";

import {
  User,
  ShoppingBag,
  AlertCircle,
  Ban,
  Truck,
  MapPin,
  Gift,
  Headphones,
  LogOut,
  ChevronRight,
} from "lucide-react";

type MenuKey =
  | "orders"
  | "issues"
  | "cancel"
  | "tracking"
  | "address"
  | "rewards"
  | "support";

const THEME = "#f57bb4";

function formatDate(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

function isUnauthorized(err: unknown) {
  const anyErr = err as any;
  const status =
    anyErr?.status ??
    anyErr?.response?.status ??
    anyErr?.data?.status ??
    anyErr?.cause?.status;
  return status === 401 || status === 403;
}

export default function AccountPage() {
  const router = useRouter();

  const [active, setActive] = useState<MenuKey>("orders");

  const [me, setMe] = useState<MeDTO | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [meErr, setMeErr] = useState<string | null>(null);

  const [orders, setOrders] = useState<OrderDTO[] | null>(null);
  const [ordersErr, setOrdersErr] = useState<string | null>(null);

  // ✅ prevents flicker before redirect
  const [checkingAuth, setCheckingAuth] = useState(true);

  const menu = [
    {
      key: "orders" as const,
      icon: ShoppingBag,
      label: "my orders",
      sub: "track order, order history",
    },
    {
      key: "issues" as const,
      icon: AlertCircle,
      label: "order related issues",
      sub: "item missing/damaged",
    },
    {
      key: "cancel" as const,
      icon: Ban,
      label: "order cancellation",
      sub: "cancel your order",
    },
    {
      key: "tracking" as const,
      icon: Truck,
      label: "order tracking",
      sub: "track your order",
    },
    {
      key: "address" as const,
      icon: MapPin,
      label: "manage address",
      sub: "manage delivery, billing address here",
    },
    {
      key: "rewards" as const,
      icon: Gift,
      label: "my rewards",
      sub: "see vouchers earned",
    },
    {
      key: "support" as const,
      icon: Headphones,
      label: "help & support",
      sub: "contact us / returns / store locator",
    },
  ];

  const panelTitle = useMemo(() => {
    return menu.find((m) => m.key === active)?.label ?? "account";
  }, [active]);

  // ✅ Auth guard with next param
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login?next=/account");
      return;
    }
    setCheckingAuth(false);
  }, [router]);

  function forceLogoutToLogin() {
    clearStoredUsername();
    clearToken();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-changed"));
    }
    router.replace("/login?next=/account");
  }

  function logout() {
    clearStoredUsername();
    clearToken();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-changed"));
    }
    router.replace("/login");
  }

  async function loadMe() {
    setLoadingMe(true);
    setMeErr(null);

    try {
      const data = await getMe();
      setMe(data);
    } catch (e) {
      if (isUnauthorized(e)) {
        forceLogoutToLogin();
        return;
      }
      setMeErr(getErrorMessage(e, "Failed to load profile"));
      setMe(null);
    } finally {
      setLoadingMe(false);
    }
  }

  async function loadOrders() {
    setOrders(null);
    setOrdersErr(null);

    try {
      const data = await orderService.myOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      if (isUnauthorized(e)) {
        forceLogoutToLogin();
        return;
      }
      setOrdersErr(getErrorMessage(e, "Failed to load orders"));
      setOrders([]);
    }
  }

  // ✅ Load profile once after auth check
  useEffect(() => {
    if (checkingAuth) return;
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkingAuth]);

  // ✅ Load orders only when Orders tab is active
  useEffect(() => {
    if (checkingAuth) return;
    if (active === "orders") loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, checkingAuth]);

  const userEmail = me?.email ?? "—";

  // Prevent flicker before redirect
  if (checkingAuth) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
          {/* LEFT SIDEBAR */}
          <aside className="rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
            {/* Header */}
            <div
              className="relative px-6 pt-6 pb-5 text-white"
              style={{
                background: `linear-gradient(180deg, ${THEME} 0%, #cf4e7b 100%)`,
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  background:
                    "radial-gradient(1200px 400px at 30% 120%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 60%)",
                }}
              />

              <div className="relative flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/95 text-black flex items-center justify-center">
                  <User className="h-6 w-6 opacity-60" />
                </div>

                <div className="min-w-0">
                  <div className="text-sm opacity-90">{userEmail}</div>
                  {loadingMe ? (
                    <div className="text-xs opacity-80">Loading profile…</div>
                  ) : meErr ? (
                    <div className="text-xs opacity-90">Profile error</div>
                  ) : (
                    <div className="text-xs opacity-80">
                      {me?.firstName} {me?.lastName}
                    </div>
                  )}
                </div>
              </div>

              {/* Banner */}
              <div className="relative mt-5 rounded-xl bg-white/95 p-3 text-[12px] text-gray-700 flex items-center justify-between gap-3">
                <div className="leading-snug">
                  Download app now to view your <br />
                  balance charms 🧿
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-lg px-3 py-1.5 text-white text-xs font-medium"
                  style={{ backgroundColor: THEME }}
                >
                  get app &gt;
                </button>
              </div>
            </div>

            {/* Menu */}
            <div className="p-4">
              <div className="space-y-2">
                {menu.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActive(item.key)}
                      className={[
                        "w-full rounded-xl border text-left px-4 py-3 flex items-center gap-3 transition",
                        isActive
                          ? "border-transparent"
                          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50",
                      ].join(" ")}
                      style={
                        isActive
                          ? { backgroundColor: `${THEME}1A` }
                          : undefined
                      }
                    >
                      <div
                        className={[
                          "h-9 w-9 rounded-full flex items-center justify-center",
                          isActive ? "" : "bg-gray-100",
                        ].join(" ")}
                        style={
                          isActive ? { backgroundColor: `${THEME}33` } : undefined
                        }
                      >
                        <Icon
                          className="h-4 w-4"
                          style={
                            isActive ? { color: THEME } : { color: "#4b5563" }
                          }
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-semibold capitalize"
                          style={
                            isActive ? { color: THEME } : { color: "#111827" }
                          }
                        >
                          {item.label}
                        </div>
                        <div className="text-xs text-gray-500">{item.sub}</div>
                      </div>

                      <ChevronRight
                        className="h-4 w-4"
                        style={
                          isActive ? { color: THEME } : { color: "#9ca3af" }
                        }
                      />
                    </button>
                  );
                })}
              </div>

              {/* Links box */}
              <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-500 space-y-2">
                <div className="hover:text-gray-700 cursor-pointer">
                  contact us
                </div>
                <div className="hover:text-gray-700 cursor-pointer">
                  store locator
                </div>
                <div className="hover:text-gray-700 cursor-pointer">
                  returns and refunds
                </div>
                <div className="hover:text-gray-700 cursor-pointer">
                  help &amp; support
                </div>
              </div>

              {/* Sign out */}
              <button
                type="button"
                className="mt-5 w-full rounded-xl border border-red-300 text-red-600 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-50 transition"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                sign out
              </button>
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <section className="rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-8 min-h-[640px]">
            <div className="flex items-center justify-between">
              <h2
                className="text-xl font-semibold capitalize"
                style={{ color: THEME }}
              >
                {panelTitle}
              </h2>
            </div>

            {/* ORDERS PANEL */}
            {active === "orders" && (
              <div className="mt-8">
                {ordersErr ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {/* {ordersErr} */}
                  </div>
                ) : null}

                {orders === null ? (
                  <div className="text-sm text-gray-600">Loading orders…</div>
                ) : orders.length === 0 ? (
                  <div className="text-sm text-gray-600">
                    You haven&apos;t placed any orders yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((o) => (
                      <div key={o.id} className="rounded-xl border p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold">Order #{o.id}</div>
                          <div className="text-sm text-gray-600">
                            {formatDate(o.orderDate)}
                          </div>
                        </div>

                        <div className="mt-2 text-sm text-gray-700">
                          Status:{" "}
                          <span className="font-medium">{o.status}</span> •
                          Payment:{" "}
                          <span className="font-medium">{o.paymentStatus}</span>
                        </div>

                        <div className="mt-2 text-sm">
                          Total:{" "}
                          <span className="font-semibold">
                            ₹{Number(o.totalAmount).toFixed(2)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-4">
                          <Link
                            href={`/account/orders/${o.id}`}
                            className="text-sm underline"
                          >
                            View details
                          </Link>

                          {o.trackingUrl ? (
                            <a
                              className="text-sm underline"
                              href={o.trackingUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Track shipment
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* OTHER PANELS */}
            {active !== "orders" && (
              <div className="mt-10 text-sm text-gray-600">
                This section will be wired in the next phases.
              </div>
            )}

            {/* Profile warning */}
            {meErr ? (
              <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                Profile warning: {meErr}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
