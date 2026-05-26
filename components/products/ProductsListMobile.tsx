/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ProductRowCardMobile from "@/components/products/ProductRowCardMobile";

export default function ProductsListMobile({ items }: { items: any[] }) {
  if (!items?.length) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((p, idx) => (
        <ProductRowCardMobile key={String(p.id)} product={p} index={idx} />
      ))}
    </div>
  );
}
