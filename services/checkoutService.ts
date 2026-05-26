

/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api"; // <-- Correct default import

export interface CheckoutItem {
  productId: number;
  quantity: number;
}

export interface CheckoutData {
  items: CheckoutItem[];





  
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingPostalCode: string;

  // Only for guest users
  customerEmail?: string;
  customerName?: string;
  guestPhone?: string;
}

export const checkoutService = {

  // 🔐 LOGGED-IN USER CHECKOUT
  createOrder: async (checkoutData: CheckoutData) => {
    const res = await api.post("/Checkout", checkoutData, true); 
    return res.data;
  },

  // createOrder: async (payload: CheckoutData) => {
  //   const res = await api.post("/orders", payload);
  //   return res.data;
  // },

  // 👤 GUEST CHECKOUT (NO TOKEN SENT)
  createGuestOrder: async (checkoutData: CheckoutData) => {
    const res = await api.post("/Checkout/guest", checkoutData, false); 
    return res.data;
  },

  // createGuestOrder: async (payload: CheckoutData) => {
  //   const res = await api.post("/guest-orders", payload);
  //   return res.data;
  // },

};
