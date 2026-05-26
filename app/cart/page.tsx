
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useEffect } from "react";

export default function CartPage() {
  const {
    cartItems,
    removeItem,
    updateQuantity,
    clearCart,
    loadCartItems,
  } = useCart();

  useEffect(() => {
    loadCartItems();
  }, []);

  /* ---------------- CALCULATIONS ---------------- */

  const subtotal = cartItems.reduce(
    (acc: number, item: any) =>
      acc + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const tax = 0;
  const total = subtotal + tax;

  /* ---------------- UI ---------------- */

  return (
    <section className="bg-gray-100 min-h-screen py-6 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
          Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* LEFT : CART ITEMS */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow">
                <p className="text-gray-600 mb-4">Your cart is empty</p>
                <Link
                  href="/products"
                  className="inline-block bg-[#f57bb4] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#990077]"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <>
                {cartItems.map((item: any) => (
                  <div
                    key={item.variantId}
                    className="relative bg-white rounded-lg p-4 shadow-sm"
                  >
                    {/* ❌ REMOVE BUTTON */}
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
                      aria-label="Remove item"
                    >
                      ❌
                    </button>

                    <div className="flex items-start gap-3 md:gap-4">
                      {/* IMAGE */}
                      <img
                        src={item.imageUrl || "/placeholder.png"}
                        alt={item.name}
                        className="w-14 h-14 md:w-24 md:h-24 rounded-md object-cover border"
                      />

                      {/* INFO */}
                      <div className="flex-1">
                        <h6 className="text-base sm:text-base font-small text-gray-700 leading-snug line-clamp-2">
                          {item.name}
                        </h6>

                        {item.variant && (
                          <p className="text-xs text-gray-500 mt-1 hidden md:block">
                            {[
                              item.variant.size,
                              item.variant.color,
                              item.variant.weight,
                            ]
                              .filter(Boolean)
                              .join(" / ")}
                          </p>
                        )}

                        {/* PRICE (MOBILE) */}
                        <p className="text-sm font-semibold text-gray-900 mt-1 md:hidden">
                          ₹{item.price}
                        </p>

                        {/* DESKTOP CONTROLS */}
                        <div className="hidden md:flex justify-between items-center mt-4">
                          <div className="flex items-center border rounded-lg overflow-hidden">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.variantId,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              −
                            </button>

                            <span className="px-4 text-sm font-medium">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.variantId,
                                  item.quantity + 1
                                )
                              }
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>

                          <p className="font-bold text-gray-900">
                            ₹
                            {(
                              Number(item.price || 0) *
                              Number(item.quantity || 0)
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* MOBILE QUANTITY */}
                      <div className="flex md:hidden items-center border rounded-md overflow-hidden h-8">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.variantId,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="w-8 text-gray-600 hover:bg-gray-100"
                        >
                          −
                        </button>

                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.variantId,
                              item.quantity + 1
                            )
                          }
                          className="w-8 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
                  <Link
                    href="/products"
                    className="text-[#f57bb4] font-semibold text-sm hover:underline"
                  >
                    ← Continue Shopping
                  </Link>

                 <button
  onClick={() =>
    clearCart(true)
  }
  className="text-sm text-gray-500 hover:text-red-500"
>
  Clear Cart
</button>
                </div>
              </>
            )}
          </div>

          {/* RIGHT : ORDER SUMMARY */}
          <div className="bg-white rounded-xl p-6 shadow-sm h-fit lg:sticky lg:top-24">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
              Price Summary
            </h2>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-[#f57bb4]">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>

            <Link href="/checkout">
              <button className="w-full mt-6 bg-[#f57bb4] hover:bg-[#990077] text-white py-3 rounded-lg font-semibold transition">
                Proceed to Checkout
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

