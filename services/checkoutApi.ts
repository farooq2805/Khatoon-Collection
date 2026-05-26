/* eslint-disable @typescript-eslint/no-explicit-any */

//const API_BASE = "http://localhost:6103/api";
 const API_BASE = "https://api.khatooncollection.in/api";



type AnyObj = Record<string, any>;

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: text || "Invalid response" };
  }
}

function makeJsonHeaders(token?: string | null) {
  const h = new Headers();
  h.set("Content-Type", "application/json");
  if (token) h.set("Authorization", `Bearer ${token}`);
  return h; // ✅ always Headers (valid HeadersInit)
}

/**
 * Logged-in checkout:
 * POST /api/checkout
 */
export async function checkoutUser(payload: AnyObj, token: string) {
  const res = await fetch(`${API_BASE}/checkout`, {
    method: "POST",
    headers: makeJsonHeaders(token),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await safeJson(res);
  if (!res.ok || data?.success === false) throw new Error(data?.message || "Checkout failed");
  return data;
}

/**
 * Guest checkout:
 * POST /api/checkout/guest
 */
export async function checkoutGuest(payload: AnyObj) {
  const res = await fetch(`${API_BASE}/checkout/guest`, {
    method: "POST",
    headers: makeJsonHeaders(null),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await safeJson(res);
  if (!res.ok || data?.success === false) throw new Error(data?.message || "Guest checkout failed");
  return data;
}

/**
 * Razorpay create order (AUTH REQUIRED)
 * POST /api/razorpay/create-order
 */
export async function razorpayCreateOrder(payload: AnyObj, token: string) {
  const res = await fetch(`${API_BASE}/razorpay/create-order`, {
    method: "POST",
    headers: makeJsonHeaders(token),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await safeJson(res);
  if (!res.ok || data?.success === false) throw new Error(data?.message || "Razorpay create-order failed");
  return data;
}

/**
 * Razorpay verify payment (AUTH REQUIRED)
 * POST /api/razorpay/verify-payment
 */
export async function razorpayVerifyPayment(payload: AnyObj, token: string) {
  const res = await fetch(`${API_BASE}/razorpay/verify-payment`, {
    method: "POST",
    headers: makeJsonHeaders(token),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await safeJson(res);
  if (!res.ok || data?.success === false) throw new Error(data?.message || "Payment verification failed");
  return data;
}

/**
 * Guest Thank You safe read:
 * GET /api/checkout/public/:orderId?phone=XXXXXXXXXX
 */
export async function getGuestPublicOrder(orderId: string, phone: string) {
  const url = `${API_BASE}/checkout/public/${encodeURIComponent(orderId)}?phone=${encodeURIComponent(phone)}`;
  const res = await fetch(url, { cache: "no-store" });

  const data = await safeJson(res);
  if (!res.ok || data?.success === false) throw new Error(data?.message || "Order not found");
  return data;
}

export async function retryRazorpay(orderId: string, paymentId: string, token: string) {
  // create-order updates existing payment row and returns razorpayOrderId again
  return razorpayCreateOrder({ orderId, paymentId }, token);
}

export async function getMyOrder(orderId: string, token: string) {
  const res = await fetch(
    // `http://localhost:6103/api/checkout/order/${encodeURIComponent(orderId)}`,
    `https://api.khatooncollection.in/api/checkout/order/${encodeURIComponent(orderId)}`,
    {
      method: "GET",
      headers: makeJsonHeaders(token),
      cache: "no-store",
    }
  );

  const data = await safeJson(res);
  if (!res.ok || data?.success === false) {
    throw new Error(data?.message || "Unable to load order");
  }

  return data;
}
