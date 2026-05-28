/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Script from "next/script";
import { checkPincodeServiceability } from "@/lib/pincodeData";

// declare global {
//   interface Window {
//     Razorpay: any;
//   }
// }

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://api.khatooncollection.in/api").replace(/\/+$/, "");

export default function BuyNowCheckoutPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Customer fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [country, setCountry] = useState("India");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("");

  const buyNowSubtotal = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce(
      (sum: number, it: any) => sum + Number(it.unitPrice * it.quantity),
      0
    );
  }, [order]);

  const buyNowQty = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce(
      (sum: number, it: any) => sum + Number(it.quantity),
      0
    );
  }, [order]);

  const pincodeStatus = useMemo(() => {
    const pin = (postal || "").trim();
    if (!/^\d{6}$/.test(pin)) {
      return "incomplete";
    }
    return checkPincodeServiceability(pin);
  }, [postal]);

  const shippingAmount = useMemo(() => {
    if (buyNowQty === 0) return 0;
    if (pincodeStatus === "mumbai") {
      return 80 * buyNowQty;
    }
    if (pincodeStatus === "outside") {
      return 160 * buyNowQty;
    }
    // Default fallback rate (160 per product) before pincode is entered
    return 160 * buyNowQty;
  }, [pincodeStatus, buyNowQty]);

  const dynamicTotal = useMemo(() => {
    return buyNowSubtotal + shippingAmount;
  }, [buyNowSubtotal, shippingAmount]);

  // 🔹 Load Buy-Now Order
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/buy-now/${id}`
        );
        const data = await res.json();

        if (data.success) setOrder(data.data);
        else toast.error("Order not found");
      } catch {
        toast.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadOrder();
  }, [id]);

  // 🔹 Razorpay Popup
  const openRazorpay = async () => {
    try {
     const token = localStorage.getItem("token");

const res = await fetch(
  `${API_BASE}/razorpay/create-order`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
    body: JSON.stringify({
      orderId: order.orderId ?? order.id,
    }),
  }
);

      const data = await res.json();
      if (!data.success) {
        toast.error("Unable to start payment");
        return;
      }

      const options = {
        key:
  data?.data?.key ??
  process.env
    .NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.data.amount,
        currency: "INR",
        order_id: data.data.razorpayOrderId,
        name: "Khatoon Collection",
        description: "Buy Now Payment",
        handler: async (response: any) => {
         const verify = await fetch(
  `${API_BASE}/razorpay/verify-payment`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
    body: JSON.stringify(response),
  }
);
          const verifyData = await verify.json();

          if (verifyData.success) {
            toast.success("Payment successful 🎉");
            router.push("/order-success");
          } else {
            toast.error("Payment verification failed");
          }
        },
        theme: { color: "#f57bb4" },
      };

      new window.Razorpay(options).open();
    } catch {
      toast.error("Payment failed");
    }
  };

  // 🔹 Confirm Order + Pay
// 🔹 Confirm Order + Pay
const confirmOrder = async (
  e?: any
) => {
  e?.preventDefault();

  // VALIDATION
  if (!name.trim()) {
    toast.error("Name required");
    return;
  }

  if (
    !/^[6-9]\d{9}$/.test(
      phone.trim()
    )
  ) {
    toast.error(
      "Enter valid 10-digit phone number"
    );
    return;
  }

  if (!address.trim()) {
    toast.error(
      "Address required"
    );
    return;
  }

  if (!city.trim()) {
    toast.error(
      "City required"
    );
    return;
  }

  if (
    !/^\d{6}$/.test(
      postal.trim()
    )
  ) {
    toast.error(
      "Valid pincode required"
    );
    return;
  }

  const serviceability = checkPincodeServiceability(postal);
  if (serviceability === "unserviceable") {
    toast.error("We do not ship to this pincode. Please enter a serviceable pincode.");
    return;
  }

  if (!deliveryDate) {
    toast.error(
      "Select delivery date"
    );
    return;
  }

  if (!deliveryTimeSlot) {
    toast.error(
      "Select delivery time slot"
    );
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/buy-now/confirm`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          orderId: id,
          name:
            name.trim(),
          phone:
            phone.trim(),
          address:
            address.trim(),
          city:
            city.trim(),
          postal:
            postal.trim(),
          country:
            country.trim(),
          deliveryDate,
          deliveryTimeSlot,
        }),
      }
    );

    const result =
      await res.json();

    if (
      result.success
    ) {
      toast.success(
        "Order confirmed, proceed to payment"
      );

      await openRazorpay(); // ✅ PAY NOW
    } else {
      toast.error(
        result.message ||
          "Failed to confirm order"
      );
    }
  } catch (
    error
  ) {
    console.error(
      "Confirm order error:",
      error
    );

    toast.error(
      "Unable to confirm order"
    );
  }
};

  if (loading) return <p className="text-center text-gray-400">Loading...</p>;
  if (!order) return <p className="text-center text-red-500">Order not found</p>;

  return (
  <>
    <Script src="https://checkout.razorpay.com/v1/checkout.js" />

    <section className="bg-gray-100 min-h-screen py-6 md:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-6">
          Buy Now Checkout
        </h1>

        {/* ORDER SUMMARY */}
        <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order #{order.orderNumber}
          </h2>

          <div className="space-y-3">
            {order.items.map((item: any) => (
              <div
                key={item.variantId}
                className="flex justify-between gap-3 border-b pb-3 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.productName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {[item.variant?.size, item.variant?.color, item.variant?.weight]
                      .filter(Boolean)
                      .join(" / ")}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Qty {item.quantity}
                  </p>
                </div>

                <p className="text-sm font-semibold text-gray-900">
                  ₹{Number(item.unitPrice * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{buyNowSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charge</span>
              <span>₹{shippingAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t">
              <span>Total (Estimated)</span>
              <span className="text-[#f57bb4]">₹{dynamicTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* CUSTOMER FORM */}
        <form
          onSubmit={confirmOrder}
          className="bg-white rounded-xl shadow-sm p-5 md:p-6 space-y-5"
        >
          <h2 className="text-lg font-semibold text-gray-900">
            Delivery Details
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Full Name
            </label>
            <input
              className="input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Phone Number
            </label>
            <input
              className="input"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Address
            </label>
            <textarea
              className="input resize-none"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                City
              </label>
              <input
                className="input"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                Postal Code
              </label>
              <div className="flex flex-col">
                <input
                  className="input"
                  required
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
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

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                Country
              </label>
              <input
                className="input"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                Delivery Date
              </label>
              <input
                type="date"
                className="input"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                Delivery Time Slot
              </label>
              <select
                className="input"
                required
                value={deliveryTimeSlot}
                onChange={(e) => setDeliveryTimeSlot(e.target.value)}
              >
                <option value="">Select Time Slot</option>
                <option>09:00 AM - 11:00 AM</option>
                <option>11:00 AM - 01:00 PM</option>
                <option>01:00 PM - 03:00 PM</option>
                <option>03:00 PM - 06:00 PM</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#f57bb4] hover:bg-[#990077] text-white py-3 rounded-lg font-semibold transition"
          >
            Pay Now
          </button>
        </form>

        {/* MOBILE STICKY PAY */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <button
            onClick={confirmOrder}
            className="w-full bg-[#f57bb4] hover:bg-[#990077] text-white py-3 rounded-lg font-semibold"
          >
            Pay ₹{order.totalAmount}
          </button>
        </div>
      </div>
    </section>
  </>
);

}
