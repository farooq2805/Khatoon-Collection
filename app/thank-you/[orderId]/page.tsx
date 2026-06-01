/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import { loadScript } from "@/lib/loadScript";
import { moneyINR } from "@/lib/money";
import {
  getGuestPublicOrder,
  getMyOrder,
  razorpayVerifyPayment,
  retryRazorpay,
} from "@/services/checkoutApi";

const THEME = "#f57bb4";

function isPendingPayment(status?: string) {
  const s = (status || "").toLowerCase();
  return ["created", "pending", "failed"].includes(s);
}

export default function ThankYouPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  // ✅ Next.js 15: params is Promise in client components
  const { orderId } = React.use(params);

  const searchParams = useSearchParams();
  const router = useRouter();

  const phone = searchParams.get("phone") || "";
  const { isLoggedIn, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [retrying, setRetrying] = useState(false);

  const isGuestFlow = !isLoggedIn && !!phone;

  async function fetchOrder() {
    setLoading(true);
    try {
      if (isGuestFlow) {
        const res = await getGuestPublicOrder(orderId, phone);
        setData(res?.data || res);
      } else {
        if (!token) throw new Error("Login required to view this order.");
        const res = await getMyOrder(orderId, token);
        setData(res?.data || res);
      }
    } catch (e: any) {
      toast.error(e?.message || "Unable to load order");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, phone, isGuestFlow]);

  useEffect(() => {
    if (!data) return;
    
    const oid = data?.orderNumber || data?.id || orderId;
    const sentKey = `kc_wa_sent_${oid}`;
    
    if (sessionStorage.getItem(sentKey)) return;
    
    const totalAmount = data?.totalAmount || 0;
    const payStat = data?.paymentStatus || data?.payment?.paymentStatus || "COD";
    const customerName = data?.customerName || [data?.user?.firstName, data?.user?.lastName].filter(Boolean).join(" ") || "Verified Customer";
    const guestPhoneNum = data?.guestPhone || data?.user?.phone || "";
    
    const textMsg = `🛍️ *New Order Placed!* 🛍️\n\n*Order ID:* ${oid}\n*Amount:* ₹${totalAmount}\n*Payment:* ${payStat}\n*Customer:* ${customerName}\n*Phone:* ${guestPhoneNum}\n\nCheck admin dashboard at business.khatooncollection.com to process!`;
    
    // Trigger owner alert via CallMeBot API to 7020895818
    const callMeBotApiKey = "1083921"; // generic CallMeBot API key
    const encodedText = encodeURIComponent(textMsg);
    const url = `https://api.callmebot.com/whatsapp.php?phone=917020895818&text=${encodedText}&apikey=${callMeBotApiKey}`;
    
    fetch(url, { mode: "no-cors" })
      .then(() => {
        sessionStorage.setItem(sentKey, "true");
        console.log("WhatsApp store owner alert triggered.");
      })
      .catch((err) => {
        console.error("WhatsApp owner alert trigger failed:", err);
      });
  }, [data, orderId]);

  const items = useMemo(() => data?.items || data?.orderItems || [], [data]);

  const paymentStatus = data?.paymentStatus || data?.payment?.paymentStatus;
  const paymentId = data?.paymentId || data?.payment?.id;

  async function handleRetryPayment() {
    if (!token) return toast.error("Please login to retry payment.");
    if (!paymentId) return toast.error("Payment ID not found for this order.");

    setRetrying(true);
    try {
      const ok = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!ok) throw new Error("Razorpay SDK failed to load.");

      // 1) Get new/updated razorpayOrderId
      const rpRes = await retryRazorpay(orderId, paymentId, token);

      const razorpayOrderId =
        rpRes?.data?.razorpayOrderId ?? rpRes?.data?.order?.id ?? rpRes?.data?.id ?? null;

      const amount = rpRes?.data?.amount ?? rpRes?.data?.order?.amount ?? null;
      const key = rpRes?.data?.key ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayOrderId) throw new Error("Razorpay order id missing.");
      if (!key) throw new Error("Razorpay key missing (return it from backend or set env).");

      const options: any = {
        key,
        amount,
        currency: "INR",
        name: "CrescentHealthcare",
        description: "Retry Order Payment",
        order_id: razorpayOrderId,
        theme: { color: THEME },
        handler: async (response: any) => {
          try {
            // ✅ if your verify endpoint expects raw razorpay response only, replace below with:
            // await razorpayVerifyPayment(response, token);

            await razorpayVerifyPayment(
              {
                orderId,
                paymentId,
                razorpayOrderId: response?.razorpay_order_id,
                razorpayPaymentId: response?.razorpay_payment_id,
                razorpaySignature: response?.razorpay_signature,
              },
              token
            );

            toast.success("Payment successful!");
            await fetchOrder();
            router.refresh();
          } catch (err: any) {
            toast.error(err?.message || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => toast("Payment cancelled."),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      toast.error(e?.message || "Retry failed");
    } finally {
      setRetrying(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border bg-white p-6">Loading your order...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-lg font-semibold">Order not found</div>
          <div className="mt-2 text-sm text-gray-600">
            Guest order needs phone in URL. Logged-in orders require login.
          </div>
          <Link
            className="mt-4 inline-block rounded-xl px-4 py-2 text-white"
            style={{ backgroundColor: THEME }}
            href="/"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-2xl font-semibold">Thank you! 🎉</div>
          <div className="mt-2 text-sm text-gray-600">Your order has been placed successfully.</div>

          <div className="mt-5 rounded-xl bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Order</div>
            <div className="font-semibold">{data?.orderNumber || data?.id || orderId}</div>

            {paymentStatus && (
              <div className="mt-3 text-sm">
                <span className="text-gray-600">Payment:</span>{" "}
                <span className="font-semibold">{paymentStatus}</span>
              </div>
            )}

            {data?.status && (
              <div className="mt-1 text-sm">
                <span className="text-gray-600">Status:</span>{" "}
                <span className="font-semibold">{data.status}</span>
              </div>
            )}

            {isLoggedIn && isPendingPayment(paymentStatus) && (
              <button
                disabled={retrying}
                className="mt-4 w-full rounded-2xl px-4 py-3 font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: THEME }}
                onClick={handleRetryPayment}
              >
                {retrying ? "Opening Razorpay..." : "Retry Payment"}
              </button>
            )}
          </div>

          {!!items?.length && (
            <div className="mt-6">
              <div className="font-semibold">Items</div>
              <div className="mt-3 space-y-2">
                {items.map((it: any, idx: number) => (
                  <div
                    key={`${it?.id || it?.variantId || idx}`}
                    className="flex items-center justify-between rounded-xl border p-3"
                  >
                    <div className="text-sm">
                      <div className="font-medium">{it?.name || it?.productName || "Item"}</div>
                      <div className="text-xs text-gray-600">Qty: {it?.quantity ?? 1}</div>
                    </div>
                    {typeof it?.price === "number" && (
                      <div className="text-sm font-semibold">₹{moneyINR(it.price)}</div>
                    )}
                    {typeof it?.unitPrice === "number" && (
                      <div className="text-sm font-semibold">₹{moneyINR(it.unitPrice)}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/products" className="rounded-xl border px-4 py-2 font-semibold">
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="rounded-xl px-4 py-2 font-semibold text-white"
              style={{ backgroundColor: THEME }}
            >
              Go Home
            </Link>
          </div>

          {isGuestFlow && (
            <div className="mt-4 text-xs text-gray-600">
              Guest order verified using phone match (secure public endpoint).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
