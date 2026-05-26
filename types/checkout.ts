export type CheckoutItem = {
  variantId: number;
  quantity: number;
};

export type CheckoutPayload = {
  items: CheckoutItem[];

  customerName: string;
  customerEmail: string;
  guestPhone: string;

  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingPostalCode: string;

  deliveryDate: string;
  deliveryTimeSlot: string;
};
