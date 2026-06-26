/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

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
import { loginUser, registerUser } from "@/lib/auth";

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

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const payIntent = searchParams.get("pay"); // pay=razorpay after login

  const { cartItems, clearCart, cartLoading } = useCart();
  const { token, isLoggedIn, loading: authLoading, login } = useAuth();

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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const autoPayRef = useRef(false);
  const autoResumeAfterMergeRef = useRef(false);

  const [prospectId, setProspectId] = useState<number | null>(null);

  if (!mounted || authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-100 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
        <p className="text-gray-500 font-medium animate-pulse">Syncing your cart...</p>
      </div>
    );
  }

  // Helper to mark prospect as completed
  async function markProspectCompleted(id: number) {
    try {
      await fetch("/api/prospects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status: "completed" }),
      });
    } catch (err) {
      console.error("Failed to mark prospect completed:", err);
    }
  }

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [modalEmail, setModalEmail] = useState("");
  const [modalPassword, setModalPassword] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Dual-mode modal states
  const [modalAuthMode, setModalAuthMode] = useState<"login" | "register" | "pending-verify">("login");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  async function handleModalLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!modalEmail.trim() || !modalPassword) {
      toast.error("Email and password are required", { id: "checkout-auth" });
      return;
    }

    setModalLoading(true);
    try {
      const res = await loginUser({
        email: modalEmail.trim().toLowerCase(),
        password: modalPassword,
      });

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Login failed");
      }

      const tokenVal = res?.data?.data?.token;
      const userVal = res?.data?.data?.user;

      if (!tokenVal) throw new Error("Missing token from server");

      autoResumeAfterMergeRef.current = true;
      login(userVal?.email || modalEmail.trim().toLowerCase(), tokenVal);
      toast.success("Logged in successfully! Resuming payment...");
      setShowLoginModal(false);
    } catch (err: any) {
      toast.error(err?.message || "Login failed", { id: "checkout-auth" });
    } finally {
      setModalLoading(false);
    }
  }

  async function handleModalRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regFirstName.trim() || !regLastName.trim() || !modalEmail.trim() || !regPassword) {
      toast.error("First Name, Last Name, Email and Password are required", { id: "checkout-auth" });
      return;
    }
    if (regPassword.length < 6) {
      toast.error("Password must be at least 6 characters", { id: "checkout-auth" });
      return;
    }

    setModalLoading(true);
    try {
      const res = await registerUser({
        firstName: regFirstName.trim(),
        lastName: regLastName.trim(),
        email: modalEmail.trim().toLowerCase(),
        phone: regPhone.trim() || undefined,
        password: regPassword,
      });

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Registration failed");
      }

      const tokenVal = res?.data?.data?.token;
      const userVal = res?.data?.data?.user;

      if (!tokenVal) throw new Error("Missing token from server");

      autoResumeAfterMergeRef.current = true;
      login(userVal?.email || modalEmail.trim().toLowerCase(), tokenVal);
      toast.success("Account created & logged in! Launching payment...");
      setShowLoginModal(false);
    } catch (err: any) {
      toast.error(err?.message || "Registration failed", { id: "checkout-auth" });
    } finally {
      setModalLoading(false);
    }
  }

  async function handleModalVerifyAndPay() {
    if (!modalEmail.trim() || !regPassword) {
      toast.error("Email and password are required to verify account state", { id: "checkout-auth" });
      return;
    }

    setModalLoading(true);
    try {
      const res = await loginUser({
        email: modalEmail.trim().toLowerCase(),
        password: regPassword,
      });

      if (!res?.data?.success) {
        throw new Error("Account not verified yet or credentials invalid. Please check your email and click the verification link.");
      }

      const tokenVal = res?.data?.data?.token;
      const userVal = res?.data?.data?.user;

      if (!tokenVal) throw new Error("Missing token from server");

      autoResumeAfterMergeRef.current = true;
      login(userVal?.email || modalEmail.trim().toLowerCase(), tokenVal);
      toast.success("Account verified & logged in! Launching payment gateway...");
      setShowLoginModal(false);
    } catch (err: any) {
      toast.error(err?.message || "Verification check failed. Please verify your email first.", { id: "checkout-auth" });
    } finally {
      setModalLoading(false);
    }
  }

  // Auto-resume payment after cart merge finishes
  useEffect(() => {
    if (!cartLoading && autoResumeAfterMergeRef.current) {
      autoResumeAfterMergeRef.current = false;
      if (cartItems?.length) {
        void handleRazorpay();
      }
    }
  }, [cartLoading, cartItems]);

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
    return 0;
  }, []);

  const taxAmount = 0;
  const previewTotal = totals.subtotal + shippingAmount + taxAmount;

  const showGuestFields = !isLoggedIn;

  // Real-time debounced prospect capture
  useEffect(() => {
    if (!form.fullName.trim() && !form.phone.trim()) return;

    const timer = setTimeout(async () => {
      try {
        const payload = {
          id: prospectId,
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: guestEmail || (form as any).email || "",
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2?.trim() || "",
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          cartItems: (cartItems || []).map((item: any) => ({
            id: item.productId || item.id,
            name: item.name,
            price: item.effectivePrice || item.price,
            quantity: item.quantity,
          })),
          cartTotal: previewTotal,
          status: "pending",
        };

        const response = await fetch("/api/prospects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (data.success && data.prospect?.id && !prospectId) {
          setProspectId(data.prospect.id);
        }
      } catch (err) {
        console.error("Failed to capture prospect:", err);
      }
    }, 2000); // 2-second debounce

    return () => clearTimeout(timer);
  }, [form, guestEmail, cartItems, previewTotal, prospectId]);

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

      // Mark prospect as completed in Supabase DB
      if (prospectId) {
        await markProspectCompleted(prospectId);
      }

      if (showGuestFields) {
        router.push(
          `/thank-you/${orderId}?phone=${encodeURIComponent(form.phone.trim())}`
        );
      } else {
        router.push(`/thank-you/${orderId}`);
      }
    } catch (e: any) {
      toast.error(e?.message || "COD checkout failed", { id: "checkout-payment" });
    } finally {
      setLoading(false);
    }
  }

  async function handleRazorpay(tokenOverride?: string | React.MouseEvent) {
    if (authLoading) {
      toast("Please wait...");
      return;
    }

    const activeToken = typeof tokenOverride === "string" ? tokenOverride : token;
    const activeIsLoggedIn = !!activeToken;

    if (!activeIsLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (!validateCommon()) return;

    setLoading(true);
    try {
      const ok = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!ok) throw new Error("Razorpay SDK failed to load.");

      // Guest checkout supports Prepaid as well
      const checkoutRes = !activeIsLoggedIn
        ? await checkoutGuest({
            paymentMethod: "Prepaid",
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
          } as any)
        : await checkoutUser(buildUserCheckoutPayload("Prepaid") as any, activeToken as string);

      const orderId =
        checkoutRes?.data?.orderId ??
        checkoutRes?.data?.order?.id ??
        checkoutRes?.data?.id ??
        null;

      if (!orderId) throw new Error("Checkout created but orderId not returned.");

      const rpRes = await razorpayCreateOrder({ orderId } as any, activeToken || "");

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
          email: guestEmail || (form as any).email || "",
        },
        theme: { color: THEME },
        handler: async (response: any) => {
          try {
            const verifyRes = await razorpayVerifyPayment(response as any, activeToken || "");
            if (verifyRes?.success === false) {
              throw new Error(verifyRes?.message || "Payment verification failed");
            }

            toast.success("Payment successful!");
            clearDraft();
            await clearCart(true);

            // Mark prospect as completed in Supabase DB
            if (prospectId) {
              await markProspectCompleted(prospectId);
            }

            if (!activeIsLoggedIn) {
              router.push(
                `/thank-you/${orderId}?phone=${encodeURIComponent(form.phone.trim())}`
              );
            } else {
              router.push(`/thank-you/${orderId}`);
            }
          } catch (err: any) {
            toast.error(err?.message || "Payment verification failed", { id: "checkout-payment" });
          }
        },
        modal: { ondismiss: () => toast("Payment cancelled.") },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      toast.error(e?.message || "Razorpay checkout failed", { id: "checkout-payment" });
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
                    ✓ Serviceable (Mumbai Delivery)
                  </span>
                )}
                {pincodeStatus === "outside" && (
                  <span className="text-emerald-600 text-xs mt-1 font-semibold">
                    ✓ Serviceable (Standard Delivery)
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

  <span className="font-semibold text-emerald-600">
    FREE
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

          <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
            <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2 mb-4 border-b border-gray-100 pb-2.5">
              <svg className="h-4 w-4 text-[#f57bb4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Khatoon Brand Promises
            </h4>
            
            <div className="space-y-4">
              {/* Item 1: Original Products */}
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-[#f57bb4]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.47 3.47 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.47 3.47 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.47 3.47 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.47 3.47 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800 text-xs text-left">100% Hand-Curated Originals</h5>
                  <p className="text-gray-500 text-[11px] mt-0.5 leading-relaxed text-left">Direct from premium designers. Exquisite craftsmanship, premium fabrics, and intricate embroidery guaranteed.</p>
                </div>
              </div>

              {/* Item 2: Secure Payments */}
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-[#f57bb4]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800 text-xs text-left">100% Encrypted Secure Checkout</h5>
                  <p className="text-gray-500 text-[11px] mt-0.5 leading-relaxed text-left">Your transaction is fully secured by Razorpay via standard 256-bit SSL encryption. All card details are kept completely secure.</p>
                </div>
              </div>

              {/* Item 3: Returns & Exchange */}
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-[#f57bb4]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800 text-xs text-left">Easy Size Exchange Assistance</h5>
                  <p className="text-gray-500 text-[11px] mt-0.5 leading-relaxed text-left">Worried about the fit? Get absolute peace of mind with our dedicated size exchange help via WhatsApp support.</p>
                </div>
              </div>

              {/* Item 4: Delivery */}
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-[#f57bb4]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800 text-xs text-left">Insured Tracked Shipping</h5>
                  <p className="text-gray-500 text-[11px] mt-0.5 leading-relaxed text-left">Quick and reliable delivery with trusted nationwide courier partners. Get real-time updates directly on your phone.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GORGEOUS INLINE LOGIN / REGISTER MODAL FOR ONLINE PAYMENT */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-pink-100 flex flex-col relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg transition"
            >
              ✕
            </button>

            {modalAuthMode === "login" && (
              <>
                <div className="text-center mb-5">
                  <h2 className="text-2xl font-bold text-gray-900">Secure Online Payment</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Sign in to your Khatoon Collection account to complete your payment securely.
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 mb-5">
                  <button
                    type="button"
                    className="flex-1 pb-2.5 text-sm font-semibold border-b-2 border-[#f57bb4] text-[#f57bb4]"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalAuthMode("register")}
                    className="flex-1 pb-2.5 text-sm font-semibold text-gray-400 border-b-2 border-transparent hover:text-gray-600"
                  >
                    Create Account
                  </button>
                </div>

                <form onSubmit={handleModalLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase text-left">Email Address</label>
                    <input
                      type="email"
                      value={modalEmail}
                      onChange={(e) => setModalEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#f57bb4]/30 focus:border-[#f57bb4] transition text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase text-left">Password</label>
                    <input
                      type="password"
                      value={modalPassword}
                      onChange={(e) => setModalPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#f57bb4]/30 focus:border-[#f57bb4] transition text-sm"
                      required
                    />
                  </div>

                  <div className="flex justify-end !mt-1">
                    <Link
                      href="/forgot-password"
                      target="_blank"
                      className="text-xs text-[#f57bb4] hover:underline font-semibold"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="w-full text-white font-semibold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-75"
                    style={{ backgroundColor: THEME }}
                  >
                    {modalLoading ? "Authenticating..." : "Verify & Pay"}
                  </button>
                </form>

                <div className="text-center text-xs text-gray-500 mt-5">
                  New to Khatoon Collection?{" "}
                  <button
                    type="button"
                    onClick={() => setModalAuthMode("register")}
                    className="font-bold text-[#f57bb4] hover:underline"
                  >
                    Create an account
                  </button>
                </div>
              </>
            )}

            {modalAuthMode === "register" && (
              <>
                <div className="text-center mb-5">
                  <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Create your account to unlock secure online payments and real-time order tracking.
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 mb-5">
                  <button
                    type="button"
                    onClick={() => setModalAuthMode("login")}
                    className="flex-1 pb-2.5 text-sm font-semibold text-gray-400 border-b-2 border-transparent hover:text-gray-600"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className="flex-1 pb-2.5 text-sm font-semibold border-b-2 border-[#f57bb4] text-[#f57bb4]"
                  >
                    Create Account
                  </button>
                </div>

                <form onSubmit={handleModalRegister} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase text-left">First Name</label>
                      <input
                        type="text"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="First"
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#f57bb4]/30 focus:border-[#f57bb4] transition text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase text-left">Last Name</label>
                      <input
                        type="text"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        placeholder="Last"
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#f57bb4]/30 focus:border-[#f57bb4] transition text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase text-left">Email Address</label>
                    <input
                      type="email"
                      value={modalEmail}
                      onChange={(e) => setModalEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#f57bb4]/30 focus:border-[#f57bb4] transition text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase text-left">Phone (optional)</label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="10 digits"
                        maxLength={10}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#f57bb4]/30 focus:border-[#f57bb4] transition text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase text-left">Password</label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="min 6 chars"
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#f57bb4]/30 focus:border-[#f57bb4] transition text-sm"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="w-full text-white font-semibold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-75"
                    style={{ backgroundColor: THEME }}
                  >
                    {modalLoading ? "Creating Account..." : "Register & Verify"}
                  </button>
                </form>

                <div className="text-center text-xs text-gray-500 mt-5">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setModalAuthMode("login")}
                    className="font-bold text-[#f57bb4] hover:underline"
                  >
                    Sign in
                  </button>
                </div>
              </>
            )}

            {modalAuthMode === "pending-verify" && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.25 0L9 14.5" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Your Email</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  We have sent a verification link to <strong className="text-gray-900">{modalEmail}</strong>.
                </p>

                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-xs text-left mb-6 space-y-1.5">
                  <p className="font-semibold flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    What to do next:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Open your email inbox in a new tab.</li>
                    <li>Click on the verification link sent by <strong>Khatoon Collection</strong>.</li>
                    <li>Once successfully verified, return to this tab and click the button below to pay!</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleModalVerifyAndPay}
                    disabled={modalLoading}
                    className="w-full text-white font-semibold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-75"
                    style={{ backgroundColor: "#10b981" }}
                  >
                    {modalLoading ? "Checking Verification..." : "✓ I Have Verified & Want to Pay"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalAuthMode("register")}
                    className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-2.5 rounded-xl text-xs transition"
                  >
                    ← Back to Registration Details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-100 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
          <p className="text-gray-500 font-medium animate-pulse">Syncing your cart...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
