/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { orderService } from "@/services/orderService";
import { clearStoredUsername, clearToken, getToken } from "@/lib/storage";
import { getErrorMessage } from "@/lib/http";
import type { OrderDTO } from "@/lib/types";

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

function money(v: any) {
  const n = Number(v);
  if (Number.isNaN(n)) return "-";
  return `₹${n.toFixed(2)}`;
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || "";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDTO | null>(null);

  // Auth guard
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(`/account/orders/${id}`)}`);
    }
  }, [router, id]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const data = await orderService.getOrder(id);
        if (!mounted) return;
        setOrder(data);
      } catch (e) {
        if (isUnauthorized(e)) {
          clearStoredUsername();
          clearToken();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("auth-changed"));
          }
          router.replace(`/login?next=${encodeURIComponent(`/account/orders/${id}`)}`);
          return;
        }

        if (!mounted) return;
        setErr(getErrorMessage(e, "Failed to load order"));
        setOrder(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id, router]);

  const items = useMemo(() => {
    // Many backends return items under different keys
    const o: any = order as any;
    return (
      o?.items ||
      o?.orderItems ||
      o?.products ||
      o?.lines ||
      o?.details ||
      []
    );
  }, [order]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-gray-500">
              <Link href="/account" className="underline">
                Account
              </Link>{" "}
              <span className="mx-2">/</span>
              <Link href="/account" className="underline">
                Orders
              </Link>{" "}
              <span className="mx-2">/</span>
              <span className="text-gray-700">#{id}</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold" style={{ color: THEME }}>
              Order Details
            </h1>
          </div>

          <Link
            href="/account"
            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5"
          >
            Back to Account
          </Link>
        </div>

        <div className="mt-6 rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-6">
          {err ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {err}
            </div>
          ) : null}

          {loading ? (
            <div className="text-sm text-gray-600">Loading order…</div>
          ) : !order ? (
            <div className="text-sm text-gray-600">Order not found.</div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border p-4">
                  <div className="text-xs text-gray-500">Order ID</div>
                  <div className="mt-1 font-semibold">#{(order as any).id}</div>
                  <div className="mt-2 text-xs text-gray-500">Order Date</div>
                  <div className="mt-1 text-sm">{formatDate((order as any).orderDate)}</div>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="mt-1 font-semibold">{(order as any).status ?? "-"}</div>

                  <div className="mt-2 text-xs text-gray-500">Payment Status</div>
                  <div className="mt-1 text-sm font-medium">
                    {(order as any).paymentStatus ?? "-"}
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="mt-1 font-semibold">{money((order as any).totalAmount)}</div>

                  <div className="mt-2 text-xs text-gray-500">Payment Method</div>
                  <div className="mt-1 text-sm">
                    {(order as any).paymentMethod ??
                      (order as any).paymentMode ??
                      "-"}
                  </div>
                </div>
              </div>

              {/* Tracking */}
              {(order as any).trackingUrl ? (
                <div className="mt-5 rounded-xl border p-4">
                  <div className="text-sm font-semibold">Tracking</div>
                  <a
                    href={(order as any).trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm underline"
                  >
                    Open tracking link
                  </a>
                </div>
              ) : null}

              {/* Items */}
              <div className="mt-6">
                <div className="text-sm font-semibold">Items</div>

                {Array.isArray(items) && items.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {items.map((it: any, idx: number) => (
                      <div key={it?.id ?? idx} className="rounded-xl border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold">
                              {it?.name ?? it?.productName ?? it?.title ?? "Item"}
                            </div>

                            <div className="mt-1 text-sm text-gray-600">
                              Qty: <span className="font-medium">{it?.quantity ?? it?.qty ?? 1}</span>
                              {it?.sku ? (
                                <>
                                  {" "}
                                  • SKU: <span className="font-medium">{it.sku}</span>
                                </>
                              ) : null}
                              {it?.variant ? (
                                <>
                                  {" "}
                                  • Variant:{" "}
                                  <span className="font-medium">
                                    {String(it.variant)}
                                  </span>
                                </>
                              ) : null}
                            </div>
                          </div>

                          <div className="text-sm font-semibold">
                            {money(it?.price ?? it?.unitPrice ?? it?.amount)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-gray-600">
                    Items not available for this order (API didn’t return items list).
                  </div>
                )}
              </div>

              {/* Address (optional) */}
              {((order as any).shippingAddress || (order as any).address) ? (
                <div className="mt-6 rounded-xl border p-4">
                  <div className="text-sm font-semibold">Delivery Address</div>
                  <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                    {JSON.stringify(
                      (order as any).shippingAddress || (order as any).address,
                      null,
                      2
                    )}
                  </pre>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
