/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

import { moneyINR } from "@/lib/money";
import { loadScript } from "@/lib/loadScript";
import { checkPincodeServiceability } from "@/lib/pincodeData";
import {
  checkoutGuest,
  checkoutUser,
  razorpayCreateOrder,
  razorpayVerifyPayment,
} from "@/services/checkoutApi";

const THEME = "#f57bb4";
const DRAFT_KEY = "checkoutDraft_v1";

type AddressForm = {
  fullName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
};

function isValidPhoneIN(phone: string) {
  return /^[6-9]\d{9}$/.test((phone || "").trim());
}

function isValidPincode(pin: string) {
  return /^\d{6}$/.test((pin || "").trim());
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const payIntent = searchParams.get("pay"); // pay=razorpay after login

  const { cartItems, clearCart } = useCart();
  const { token, isLoggedIn, loading: authLoading } = useAuth();

  // const [payMethod, setPayMethod] = useState<"COD" | "RAZORPAY">("COD");
  const [payMethod, setPayMethod] = useState<"COD" | "RAZORPAY">("RAZORPAY");
  const [couponCode, setCouponCode] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("Anytime");

  const [guestEmail, setGuestEmail] = useState("");
  const [form, setForm] = useState<AddressForm>({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] =
  useState(false);

const [draftLoaded, setDraftLoaded] =
  useState(false);

  const autoPayRef = useRef(false);

  const totals = useMemo(() => {
    const items = cartItems || [];
    const subtotal = items.reduce((sum: number, it: any) => {
      const price = Number(it?.effectivePrice ?? it?.price ?? 0);
      const qty = Number(it?.quantity ?? 1);
      return sum + price * qty;
    }, 0);

    return {
      subtotal,
      itemsCount: items.reduce(
        (s: number, it: any) => s + Number(it?.quantity ?? 1),
        0
      ),
    };
  }, [cartItems]);

  const pincodeStatus = useMemo(() => {
    const pin = (form.pincode || "").trim();
    if (!/^\d{6}$/.test(pin)) {
      return "incomplete";
    }
    return checkPincodeServiceability(pin);
  }, [form.pincode]);

  const shippingAmount = useMemo(() => {
    const qty = totals.itemsCount;
    if (qty === 0) return 0;

    if (pincodeStatus === "mumbai") {
      return 80 * qty;
    }
    if (pincodeStatus === "outside") {
      return 160 * qty;
    }
    // Default fallback rate (160 per product) before pincode is fully entered
    return 160 * qty;
  }, [pincodeStatus, totals.itemsCount]);

  const taxAmount = 0;
  const previewTotal = totals.subtotal + shippingAmount + taxAmount;

  const showGuestFields = !isLoggedIn;

  function updateField<K extends keyof AddressForm>(
    key: K,
    val: AddressForm[K]
  ) {
    setForm((p) => ({ ...p, [key]: val }));
  }
  
function redirectToLoginForRazorpay() {
  const next =
    typeof window !== "undefined"
      ? window.location.pathname +
        window.location.search
      : "/checkout";

  const separator =
    next.includes("?")
      ? "&"
      : "?";

  router.push(
    `/login?next=${encodeURIComponent(
      `${next}${separator}pay=razorpay`
    )}`
  );
}
  

  function validateCommon() {
    toast.dismiss();
    if (!cartItems?.length) {
      toast.error("Your cart is empty.");
      return false;
    }
    if (!form.fullName.trim())
      return (toast.error("Full name is required."), false);
    if (!isValidPhoneIN(form.phone))
      return (toast.error("Enter a valid 10-digit Indian phone number."), false);
    if (!form.addressLine1.trim())
      return (toast.error("Address Line 1 is required."), false);
    if (!form.city.trim()) return (toast.error("City is required."), false);
    if (!form.state.trim()) return (toast.error("State is required."), false);
    if (!isValidPincode(form.pincode))
      return (toast.error("Enter a valid 6-digit pincode."), false);

    const serviceability = checkPincodeServiceability(form.pincode);
    if (serviceability === "unserviceable") {
      return (
        toast.error("We do not ship to this pincode. Please enter a serviceable pincode."),
        false
      );
    }

    if (showGuestFields) {
      if (guestEmail && !/^\S+@\S+\.\S+$/.test(guestEmail)) {
        return (toast.error("Enter a valid email or keep it empty."), false);
      }
    }

    return true;
  }

  function buildItemsPayload() {
    return (cartItems || []).map((it: any) => ({
      productId: it?.productId ?? it?.id,
      variantId: it?.variantId ?? null,
      quantity: Number(it?.quantity ?? 1),
    }));
  }

  function buildUserCheckoutPayload(paymentMethod: "COD" | "Prepaid") {
    const addressStr = [
      form.fullName?.trim(),
      form.phone?.trim(),
      form.addressLine1?.trim(),
      form.addressLine2?.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    return {
      paymentMethod,
      couponCode: couponCode.trim() || null,
      items: buildItemsPayload(),

      shippingAddress: addressStr,
      shippingCity: form.city.trim(),
      shippingCountry: "India",
      shippingPostalCode: form.pincode.trim(),
      contactPhone: form.phone.trim(),

      deliveryDate,
      deliveryTimeSlot,
    };
  }

  // ✅ Restore draft after refresh/login
  // useEffect(() => {
  //   try {
  //     const raw = localStorage.getItem(DRAFT_KEY);
  //     if (!raw) return;
  //     const d = JSON.parse(raw);

  //     if (d?.form) setForm((p) => ({ ...p, ...d.form }));
  //     if (typeof d?.guestEmail === "string") setGuestEmail(d.guestEmail);
  //     if (typeof d?.couponCode === "string") setCouponCode(d.couponCode);
  //     if (typeof d?.deliveryDate === "string") setDeliveryDate(d.deliveryDate);
  //     if (typeof d?.deliveryTimeSlot === "string")
  //       setDeliveryTimeSlot(d.deliveryTimeSlot);
  //     if (d?.payMethod === "COD" || d?.payMethod === "RAZORPAY")
  //       setPayMethod(d.payMethod);
  //   } catch {}
  // }, []);

  // ✅ Restore draft after refresh/login
useEffect(() => {
  const restoreDraft =
    async () => {
      try {
        const raw =
          localStorage.getItem(
            DRAFT_KEY
          );

        if (!raw) {
          setDraftLoaded(
            true
          );
          return;
        }

        const d =
          JSON.parse(raw);

       if (d?.form) {
  setForm((prev) => ({
    ...prev,

    // support old + new key
    fullName:
      d.form.fullName ||
      d.form.name ||
      "",

    phone:
      d.form.phone ||
      "",

    addressLine1:
      d.form.addressLine1 ||
      d.form.address ||
      "",

    addressLine2:
      d.form.addressLine2 ||
      "",

    city:
      d.form.city ||
      "",

    state:
      d.form.state ||
      "",

    pincode:
      d.form.pincode ||
      "",
  }));
}

        if (
          typeof d?.guestEmail ===
          "string"
        ) {
          setGuestEmail(
            d.guestEmail
          );
        }

        if (
          typeof d?.couponCode ===
          "string"
        ) {
          setCouponCode(
            d.couponCode
          );
        }

        if (
          typeof d?.deliveryDate ===
          "string"
        ) {
          setDeliveryDate(
            d.deliveryDate
          );
        }

        if (
          typeof d?.deliveryTimeSlot ===
          "string"
        ) {
          setDeliveryTimeSlot(
            d.deliveryTimeSlot
          );
        }

        // if (
        //   d?.payMethod ===
        //     "COD" ||
        //   d?.payMethod ===
        //     "RAZORPAY"
        // ) {
        //   setPayMethod(
        //     d.payMethod
        //   );
        // }

        setPayMethod("RAZORPAY");
//         if (
//   d?.payMethod === "COD" ||
//   d?.payMethod === "RAZORPAY"
// ) {
//   setPayMethod(d.payMethod);
// } else {
//   setPayMethod("RAZORPAY");
// }

        // wait for React state update
        await new Promise(
          (
            resolve
          ) =>
            setTimeout(
              resolve,
              300
            )
        );

        setDraftLoaded(
          true
        );
      } catch (err) {
        console.error(
          "Draft restore failed",
          err
        );

        setDraftLoaded(
          true
        );
      }
    };

  void restoreDraft();
}, []);

  // ✅ Save draft on change
  useEffect(() => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          form,
          guestEmail,
          couponCode,
          deliveryDate,
          deliveryTimeSlot,
          payMethod,
        })
      );
    } catch {}
  }, [form, guestEmail, couponCode, deliveryDate, deliveryTimeSlot, payMethod]);

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
  }

  async function handleCOD() {
    if (!validateCommon()) return;

    setLoading(true);
    try {
      const payload = showGuestFields
        ? {
            paymentMethod: "COD",
            couponCode: couponCode.trim() || null,
            items: buildItemsPayload(),

            shippingAddress: `${form.fullName.trim()}, ${form.phone.trim()}, ${form.addressLine1.trim()} ${
              form.addressLine2?.trim() || ""
            }`.trim(),
            shippingCity: form.city.trim(),
            shippingCountry: "India",
            shippingPostalCode: form.pincode.trim(),
            contactPhone: form.phone.trim(),

            customerName: form.fullName.trim(),
            customerEmail: guestEmail || "guest@example.com",
            guestPhone: form.phone.trim(),

            deliveryDate,
            deliveryTimeSlot,
          }
        : buildUserCheckoutPayload("COD");

      const res = showGuestFields
        ? await checkoutGuest(payload as any)
        : await checkoutUser(payload as any, token as string);

      const orderId =
        res?.data?.orderId ?? res?.data?.order?.id ?? res?.data?.id ?? null;

      if (!orderId)
        throw new Error("Order created but orderId not returned by API.");

      toast.success("Order placed successfully!");
      clearDraft();
await clearCart(true);

      if (showGuestFields) {
        router.push(
          `/thank-you/${orderId}?phone=${encodeURIComponent(form.phone.trim())}`
        );
      } else {
        router.push(`/thank-you/${orderId}`);
      }
    } catch (e: any) {
      toast.error(e?.message || "COD checkout failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRazorpay() {
    // If guest: go login, but KEEP draft (form+cart) + intent
    if (!isLoggedIn) {
      redirectToLoginForRazorpay();
      return;
    }

    if (authLoading) {
      toast("Please wait...");
      return;
    }

    if (!token || !isLoggedIn) {
      redirectToLoginForRazorpay();
      return;
    }

    if (!validateCommon()) return;

    setLoading(true);
    try {
      const ok = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!ok) throw new Error("Razorpay SDK failed to load.");

      const checkoutPayload = buildUserCheckoutPayload("Prepaid");
      const checkoutRes = await checkoutUser(checkoutPayload as any, token as string);

      const orderId =
        checkoutRes?.data?.orderId ??
        checkoutRes?.data?.order?.id ??
        checkoutRes?.data?.id ??
        null;

      if (!orderId) throw new Error("Checkout created but orderId not returned.");

      const rpRes = await razorpayCreateOrder({ orderId } as any, token as string);

      const razorpayOrderId =
        rpRes?.data?.razorpayOrderId ??
        rpRes?.data?.order?.id ??
        rpRes?.data?.id ??
        null;

      const amount = rpRes?.data?.amount ?? rpRes?.data?.order?.amount ?? null;
      const key = rpRes?.data?.key ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayOrderId) throw new Error("Razorpay order id missing.");
      if (!key) throw new Error("Razorpay key missing. Set NEXT_PUBLIC_RAZORPAY_KEY_ID.");

      const options: any = {
        key,
        amount,
        currency: "INR",
        name: "Khatoon Collection",
        description: "Order Payment",
        order_id: razorpayOrderId,
        prefill: {
          name: form.fullName.trim(),
          contact: form.phone.trim(),
          email: (form.email || "").trim(),
        },
        theme: { color: THEME },
        handler: async (response: any) => {
          try {
            const verifyRes = await razorpayVerifyPayment(response as any, token as string);
            if (verifyRes?.success === false) {
              throw new Error(verifyRes?.message || "Payment verification failed");
            }

            toast.success("Payment successful!");
            clearDraft();
            await clearCart(true);
            router.push(`/thank-you/${orderId}`);
          } catch (err: any) {
            toast.error(err?.message || "Payment verification failed");
          }
        },
        modal: { ondismiss: () => toast("Payment cancelled.") },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      toast.error(e?.message || "Razorpay checkout failed");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Auto-resume Razorpay after login (only once)
// ✅ Auto resume Razorpay after login
// ✅ Auto resume Razorpay after login
useEffect(() => {
  if (
    autoPayRef.current
  )
    return;

  // wait for draft restore
  if (!draftLoaded)
    return;

  if (
    payIntent !==
    "razorpay"
  )
    return;

  if (authLoading)
    return;

  if (
    !isLoggedIn ||
    !token
  )
    return;

  if (
    !cartItems?.length
  )
    return;

  // wait for form hydration
const timer =
  setTimeout(() => {
    // wait until form exists
    if (
      !form.fullName?.trim()
    ) {
      console.log(
        "Waiting form restore..."
      );

      autoPayRef.current =
        false;

      return;
    }

    autoPayRef.current =
      true;

    setPayMethod(
      "RAZORPAY"
    );

    console.log(
      "Auto Razorpay:",
      form.fullName
    );

    void handleRazorpay();
  }, 700);

  return () =>
    clearTimeout(
      timer
    );

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [
  draftLoaded,
  payIntent,
  authLoading,
  isLoggedIn,
  token,
  cartItems?.length,
  form.fullName,
]);

  return (
    <div className="bg-white">
      <div className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <h1 className="text-xl font-semibold">Checkout</h1>
          <p className="text-sm text-gray-600">Complete your order securely.</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address */}
          <div className="rounded-2xl border bg-white p-4">
            <h2 className="text-base font-semibold">Shipping Details</h2>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[#f57bb4]/30"
                placeholder="Full Name"
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
              />
              <input
                className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[#f57bb4]/30"
                placeholder="Phone (10 digits)"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />

              {showGuestFields && (
                <input
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[#f57bb4]/30 md:col-span-2"
                  placeholder="Email (optional)"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
              )}

              <input
                className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[#f57bb4]/30 md:col-span-2"
                placeholder="Address Line 1"
                value={form.addressLine1}
                onChange={(e) => updateField("addressLine1", e.target.value)}
              />
              <input
                className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[#f57bb4]/30 md:col-span-2"
                placeholder="Address Line 2 (optional)"
                value={form.addressLine2 || ""}
                onChange={(e) => updateField("addressLine2", e.target.value)}
              />
              <input
                className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[#f57bb4]/30"
                placeholder="City"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
              <input
                className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[#f57bb4]/30"
                placeholder="State"
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
              />
              <div className="flex flex-col">
                <input
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[#f57bb4]/30"
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={(e) => updateField("pincode", e.target.value)}
                />
                {pincodeStatus === "unserviceable" && (
                  <span className="text-red-500 text-xs mt-1 font-semibold">
                    ⚠️ We do not ship to this pincode
                  </span>
                )}
                {pincodeStatus === "mumbai" && (
                  <span className="text-emerald-600 text-xs mt-1 font-semibold">
                    ✓ Mumbai Delivery (₹80/product)
                  </span>
                )}
                {pincodeStatus === "outside" && (
                  <span className="text-emerald-600 text-xs mt-1 font-semibold">
                    ✓ Outside Mumbai Delivery (₹160/product)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-2xl border bg-white p-4">
            <h2 className="text-base font-semibold">Payment Method</h2>

            <div className="mt-3 space-y-2">
              {/* <label className="flex cursor-pointer items-center justify-between rounded-xl border p-3">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="pay"
                    checked={payMethod === "COD"}
                    onChange={() => setPayMethod("COD")}
                  />
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-xs text-gray-600">
                      Pay when you receive the order.
                    </div>
                  </div>
                </div>
                <span className="text-sm font-semibold">COD</span>
              </label> */}

              <label className="flex cursor-pointer items-center justify-between rounded-xl border p-3">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="pay"
                    checked={payMethod === "RAZORPAY"}
                    onChange={() => setPayMethod("RAZORPAY")}
                  />
                  <div>
                    <div className="font-medium">Razorpay</div>
                    <div className="text-xs text-gray-600">
                      UPI, Card, NetBanking, Wallets.
                    </div>
                  </div>
                </div>
                <span className="text-sm font-semibold">Online</span>
              </label>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium">Coupon (optional)</label>
              <div className="mt-2 flex gap-2">
                <input
                  className="flex-1 rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[#f57bb4]/30"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button
                  type="button"
                  className="rounded-xl px-4 py-2 text-white"
                  style={{ backgroundColor: THEME }}
                  onClick={() =>
                    toast("Coupon will be validated by backend on place order.")
                  }
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4 lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl border bg-white p-4">
            <h3 className="text-base font-semibold">Order Summary</h3>

            <div className="mt-4 space-y-3">
              {cartItems.map((item: any) => (
                <div
                  key={item.variantId || item.productId}
                  className="flex gap-3"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-14 w-14 rounded-lg border object-cover"
                    />
                  )}

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {item.name}
                    </p>

                    {/* {item.variantLabel && (
                      <p className="text-xs text-gray-500">
                        {item.variantLabel}
                      </p>
                    )} */}
                    {item.variant && (
  <p className="text-xs text-gray-500">
    {[
      item.variant.color,
      item.variant.size,
      item.variant.weight,
    ]
      .filter(Boolean)
      .join(" / ")}
  </p>
)}

                    <p className="mt-1 text-xs text-gray-600">
                      Qty {item.quantity} × ₹
                      {moneyINR(item.effectivePrice ?? item.price ?? 0)}
                    </p>
                  </div>

                  <div className="text-sm font-semibold text-gray-900">
                    ₹
                    {moneyINR(
                      (item.effectivePrice ?? item.price ?? 0) * item.quantity
                    )}
                  </div>
                </div>
              ))}
            </div>

           <div className="mt-2 flex items-center justify-between text-sm">
  <span className="text-gray-600">
    Delivery Charge
  </span>

  <span className="font-medium">
    ₹
    {moneyINR(
      shippingAmount
    )}
  </span>
</div>

            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">₹{moneyINR(taxAmount)}</span>
            </div>

            <div className="mt-3 flex items-center justify-between font-semibold">
              <span>Total (Estimated)</span>
              <span className="text-[#f57bb4]">₹{moneyINR(previewTotal)}</span>
            </div>

            <div className="mt-3 rounded-xl bg-gray-50 p-3 text-xs text-gray-700">
              Final total, discounts, shipping, stock, coupon validation are
              calculated by backend at checkout.
            </div>

            {/* <button
              disabled={loading}
              className="mt-4 w-full rounded-2xl px-4 py-3 font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: THEME }}
              onClick={payMethod === "COD" ? handleCOD : handleRazorpay}
            >
              {loading
                ? "Processing..."
                : payMethod === "COD"
                ? "Place Order (COD)"
                : "Pay with Razorpay"}
            </button> */}

          <button
  disabled={loading}
  className="mt-4 w-full rounded-2xl px-4 py-3 font-semibold text-white disabled:opacity-60"
  style={{ backgroundColor: THEME }}
  onClick={handleRazorpay}
>
  {loading
    ? "Processing..."
    : "Pay Online"}
</button>
            <button
              type="button"
              className="mt-3 w-full rounded-2xl border px-4 py-3 font-semibold"
              onClick={() => router.push("/products")}
            >
              Continue Shopping
            </button>
          </div>

          <div className="rounded-2xl border bg-white p-5 text-xs text-gray-600 shadow-sm border-gray-100">
            <div className="font-semibold text-gray-800 flex items-center gap-1.5 mb-2.5">
              <span className="text-[#f57bb4] text-base">🛡️</span> Secure & Trusted Checkout
            </div>
            <div className="space-y-2.5 mt-2">
              <div className="flex gap-2">
                <span className="text-[#f57bb4] font-bold">✓</span>
                <div>
                  <strong className="text-gray-700">100% Secure Payments</strong>
                  <p className="text-gray-500 mt-0.5">Encrypted transactions processed securely via Razorpay (UPI, Cards, Wallets, NetBanking).</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-[#f57bb4] font-bold">✓</span>
                <div>
                  <strong className="text-gray-700">Real-Time Order Locking</strong>
                  <p className="text-gray-500 mt-0.5">We instantly secure your inventory and protect against duplicate transactions once initiated.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-[#f57bb4] font-bold">✓</span>
                <div>
                  <strong className="text-gray-700">Active Order Protection</strong>
                  <p className="text-gray-500 mt-0.5">Every order is backed by premium tracked shipping and direct WhatsApp assistance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
