/* eslint-disable @typescript-eslint/no-explicit-any */

export const getVariantPrice = (variants: any[]) => {
  if (!Array.isArray(variants) || variants.length === 0) {
    return null;
  }

  // lowest selling price first
  const sorted = [...variants].sort(
    (a, b) =>
      (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price)
  );

  const v = sorted[0];

  return {
    variantId: v.id,
    price: v.discountPrice ?? v.price, // ✅ SELLING PRICE
    mrp: v.discountPrice ? v.price : null, // ✅ STRIKE PRICE
    variant: {
      size: v.size,
      color: v.color,
      weight: v.weight,
    },
  };
};
