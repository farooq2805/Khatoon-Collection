import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";

export type OrderItem = {
  id: number;
  quantity: number;
  unitPrice: string | number;
  productName: string;
  variantLabel?: string | null;
  sku?: string | null;
  imageUrl?: string | null;
};

export type Order = {
  id: number;
  orderNo?: string;
  totalAmount: string | number;
  paidAmount?: string | number | null;
  shippingFee?: string | number | null;
  couponCode?: string | null;
  couponDiscount?: string | number | null;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  shipmentStatus?: string | null;
  trackingCode?: string | null;
  trackingUrl?: string | null;
  awbNumber?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  guestPhone?: string | null;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingCountry?: string | null;
  shippingPostalCode?: string | null;
  paymentLink?: string | null;
  recoverySent?: boolean;
  orderDate: string;
  updatedAt?: string;
  user?: { id: number; firstName?: string; lastName?: string; email?: string; phone?: string } | null;
  orderItems: OrderItem[];
  payments?: { id: number; paymentStatus: string; paymentMethod?: string; razorpayPaymentId?: string; amount: string | number; createdAt: string }[];
};

export const ORDER_STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"] as const;

export const isPaid = (o: Order) => o.paymentStatus === "Paid" && o.status !== "Cancelled";
export const customerName = (o: Order) =>
  o.customerName || [o.user?.firstName, o.user?.lastName].filter(Boolean).join(" ") || "Guest";
export const customerPhone = (o: Order) => o.guestPhone || o.user?.phone || null;
export const customerEmail = (o: Order) => o.customerEmail || o.user?.email || null;

type OrdersState = { orders: Order[]; loading: boolean; error: string | null; refresh: () => Promise<void> };
const OrdersContext = createContext<OrdersState | null>(null);

/** Loads all orders once and shares them between pages; refresh after edits. */
export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const res = await api<{ data: Order[] }>("/orders/admin/all");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError(e.message || "Could not load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 60_000); // new orders appear within a minute
    return () => clearInterval(t);
  }, [refresh]);

  return <OrdersContext.Provider value={{ orders, loading, error, refresh }}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders outside OrdersProvider");
  return ctx;
}
