/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/types.ts

export type ApiResult<T> = { data: T };

export type ApiError = {
  status: number;
  message: string;
  details?: any;
};

export type UserRole = "Customer" | "Admin";

export type MeDTO = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;

  // optional (if backend includes)
  createdAt?: string;
  updatedAt?: string;
  emailVerifiedAt?: string | null;
};

export type OrderStatus = "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
export type PaymentStatus = "Pending" | "Created" | "Paid" | "Failed" | "Refunded";

export type OrderItemDTO = {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: string;
  imageUrl?: string | null;
  variantLabel?: string | null;
};

export type OrderDTO = {
  id: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: string;
  orderDate: string;

  shipmentStatus?: string;
  awbNumber?: string | null;
  trackingUrl?: string | null;

  orderItems?: OrderItemDTO[];
};
