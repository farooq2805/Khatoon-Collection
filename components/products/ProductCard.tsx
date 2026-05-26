// /* eslint-disable @typescript-eslint/no-explicit-any */
// // components/products/ProductCard.tsx
// import Link from "next/link";
// import Image from "next/image";
// import type { Product } from "@/types/product";

// function money(v: any) {
//   const n = Number(v);
//   if (!Number.isFinite(n)) return "-";
//   return `₹${n.toFixed(0)}`;
// }

// function pickImage(p: Product) {
//   const img = p.image || (Array.isArray(p.images) ? p.images[0] : null);
//   return img || null;
// }

// export default function ProductCard({ p }: { p: Product }) {
//   const img = pickImage(p);

//   return (
//     <Link
//       href={`/products/${p.slug}`}
//       className="group block rounded-2xl border bg-white hover:shadow-md transition overflow-hidden"
//     >
//       <div className="relative aspect-[4/3] bg-gray-50">
//         {img ? (
//           <Image
//             src={img}
//             alt={p.name}
//             fill
//             className="object-cover"
//             sizes="(max-width: 768px) 100vw, 25vw"
//           />
//         ) : (
//           <div className="absolute inset-0 grid place-items-center text-sm text-gray-400">
//             No image
//           </div>
//         )}
//       </div>

//       <div className="p-3">
//         <div className="text-sm font-medium text-gray-900 line-clamp-2">{p.name}</div>

//         <div className="mt-2 flex items-baseline gap-2">
//           <div className="text-base font-semibold">{money(p.price)}</div>
//           {p.mrp ? (
//             <div className="text-sm text-gray-400 line-through">{money(p.mrp)}</div>
//           ) : null}
//         </div>

//         {p.shortDescription ? (
//           <div className="mt-1 text-xs text-gray-500 line-clamp-2">{p.shortDescription}</div>
//         ) : null}
//       </div>
//     </Link>
//   );
// }


// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { useCart } from "@/context/CartContext";

// const THEME = "#f57bb4";


// type Variant = {
//   id: number;
//   weight: string | null;
//   size: string | null;
//   color: string | null;
//   colorHex: string | null;
//   price: number;
//   discountPrice: number | null;
//   effectivePrice: number;
//   stockQuantity: number;
//   sku: string;
// };

// type Product = {
//   id: number;
//   name: string;
//   slug: string; // ✅ ADD THIS
//   imageUrl: string | null;
//   mainImageUrl: string | null;
//   price: number;
//   discountPrice: number | null;
//   variants: Variant[];


// };



// const INR = (n: number) =>
//   new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

// const pctOff = (mrp: number, sale: number) => {
//   if (!mrp || !sale || mrp <= sale) return 0;
//   return Math.round(((mrp - sale) / mrp) * 100);
// };

// function variantLabel(v: Variant) {
//   const parts = [];
//   if (v.size) parts.push(v.size);
//   if (v.weight) parts.push(v.weight);
//   if (v.color) parts.push(v.color);
//   return parts.length ? parts.join(" • ") : `Variant ${v.id}`;
// }

// function safeImg(v: any) {
//   const s = typeof v === "string" ? v.trim() : "";
//   return s.length ? s : null;
// }

// function pickMainImage(p: Product) {
//   // ✅ never return empty string
//   return (
//     safeImg(p.imageUrl) ||
//     safeImg(p.mainImageUrl) ||
//     "/placeholder.png"
//   );
// }




// export default function PlumProductCard({ product, index = 0 }: { product: Product; index?: number }) {
//   const { addToCart } = useCart();

//   const firstVariant = product.variants?.[0] || null;
//   const [selected, setSelected] = useState<Variant | null>(firstVariant);
//   const [adding, setAdding] = useState(false);

//   useEffect(() => {
//     setSelected(product.variants?.[0] || null);
//   }, [product.id]);
// const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
//   // const v = selected || product.variants?.[0] || null;

//   // const mrp = v ? Number(v.price) : Number(product.price);
//   // const sale = v ? Number(v.effectivePrice) : Number(product.discountPrice ?? product.price);
//   // const off = pctOff(mrp, sale);
//   const v = selected || (hasVariants ? product.variants[0] : null);

// const mrp = v ? Number(v.price ?? 0) : Number(product.price ?? 0);
// const sale = v
//   ? Number(v.effectivePrice ?? v.discountPrice ?? v.price ?? 0)
//   : Number(product.discountPrice ?? product.price ?? 0);

// const off = pctOff(mrp, sale);


//   const badge = index % 3 === 0 ? "trending 🔥" : index % 3 === 1 ? "bestseller" : "new launch!";
//   const img = pickMainImage(product);

//   return (
//     <div className="w-full rounded-2xl border bg-white shadow-sm overflow-hidden">
//       {/* image */}
//       <div className="relative h-[230px] w-full bg-white">
//         <div
//           className="absolute left-3 top-3 z-10 rounded-lg px-3 py-1 text-xs font-semibold text-white"
//           style={{ backgroundColor: THEME }}
//         >
//           {badge}
//         </div>

//         <Link href={`/products/${product.slug}`} className="block h-full w-full">
//           <Image src={img} alt={product.name} fill className="object-contain p-4" sizes="300px" />
//         </Link>

//         {off > 0 ? (
//           <div className="absolute bottom-0 left-0 right-0 bg-[#f57bb4] py-2 text-center text-sm font-semibold text-white">
//             flat {off}% off
//           </div>
//         ) : null}
//       </div>

//       <div className="p-4">
//         {/* rating placeholder */}
//         <div className="flex items-center gap-2 text-sm">
//           <span className="text-orange-500">★</span>
//           <span className="font-semibold">4.5</span>
//           <span className="text-gray-500">reviews</span>
//         </div>

//         {/* title */}
//         <div className="mt-3 text-[16px] font-semibold text-[#6b1b66] leading-snug line-clamp-2">
//           {product.name}
//         </div>

//         {/* variants pills */}
//         {/* {Array.isArray(product.variants) && product.variants.length > 0 ? (
//           <div className="mt-3 flex flex-wrap gap-2">
//             {product.variants.slice(0, 2).map((x) => {
//               const isActive = v?.id === x.id;
//               return (
//                 <button
//                   key={`${product.id}-${x.id}`}
//                   onClick={() => setSelected(x)}
//                   className="rounded-full px-4 py-2 text-xs font-semibold transition"
//                   style={
//                     isActive
//                       ? { backgroundColor: THEME, color: "white" }
//                       : { border: `1px solid ${THEME}55`, color: THEME, backgroundColor: "white" }
//                   }
//                 >
//                   {variantLabel(x)}
//                 </button>
//               );
//             })}

//             {product.variants.length > 2 ? (
//               <span className="self-center text-xs font-semibold text-[#6b1b66]">
//                 +{product.variants.length - 2}
//               </span>
//             ) : null}
//           </div>
//         ) : (
//           <div className="mt-3 text-xs text-gray-500">No variants</div>
//         )} */}

//         {hasVariants ? (
//   <div className="mt-3 flex flex-wrap gap-2">
//     {product.variants.slice(0, 2).map((x) => {
//       const isActive = v?.id === x.id;
//       return (
//         <button
//           key={`${product.id}-${x.id}`}
//           onClick={() => setSelected(x)}
//           className="rounded-full px-4 py-2 text-xs font-semibold transition"
//           style={
//             isActive
//               ? { backgroundColor: THEME, color: "white" }
//               : { border: `1px solid ${THEME}55`, color: THEME, backgroundColor: "white" }
//           }
//         >
//           {variantLabel(x)}
//         </button>
//       );
//     })}

//     {product.variants.length > 2 ? (
//       <span className="self-center text-xs font-semibold text-[#6b1b66]">
//         +{product.variants.length - 2}
//       </span>
//     ) : null}
//   </div>
// ) : (
//   <div className="mt-3 text-xs text-gray-500">Single product</div>
// )}


//         {/* price */}
//         <div className="mt-4">
//           <div className="text-lg font-bold text-black">{INR(sale)}</div>
//           {mrp > sale ? (
//             <div className="text-sm text-gray-500">
//               <span className="line-through">{INR(mrp)}</span>
//               <span className="ml-2 font-semibold" style={{ color: THEME }}>
//                 {off}% off
//               </span>
//             </div>
//           ) : null}
//         </div>

//         {/* add to cart */}
//         <button
//           disabled={!v || adding || (v?.stockQuantity ?? 0) <= 0}
//           onClick={async () => {
//             if (!v?.id) return;
//             setAdding(true);
//             try {
//               await addToCart(v.id, 1, {
//                 productId: product.id,
//                 name: product.name,
//                 price: Number(v.effectivePrice),
//                 mrp: Number(v.price),
//                 imageUrl: product.imageUrl || product.mainImageUrl || undefined,
//                 variant: {
//                   size: v.size || undefined,
//                   color: v.color || undefined,
//                   weight: (v.weight as any) || undefined,
//                 },
//               });

//               toast.success("Added to cart 🛒", { position: "top-right", duration: 2000 });
//             } catch (e) {
//               toast.error("Failed to add to cart");
//               console.log("❌ addToCart failed", e);
//             } finally {
//               setAdding(false);
//             }
//           }}
//           className="mt-5 w-full rounded-xl py-3 text-base font-semibold text-white disabled:opacity-60"
//           style={{ backgroundColor: THEME }}
//         >
//           {!v ? "select a variant" : (v.stockQuantity ?? 0) <= 0 ? "out of stock" : adding ? "adding..." : "add to cart"}
//         </button>
//       </div>
//     </div>
//   );
// }


// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { useCart } from "@/context/CartContext";

// const THEME = "#f57bb4";

// /* ================= TYPES ================= */

// type Variant = {
//   id: number;
//   weight: string | null;
//   size: string | null;
//   color: string | null;
//   colorHex: string | null;
//   price: number;
//   discountPrice: number | null;
//   effectivePrice?: number;
//   stockQuantity: number;
//   sku: string;
// };

// type Product = {
//   id: number;
//   name: string;
//   slug: string;
//   productType?: string | null; // simple | clothing | etc

//   imageUrl: string | null;
//   mainImageUrl: string | null;

//   // fallback prices (simple product)
//   price?: number | null;
//   discountPrice?: number | null;

//   variants?: Variant[];
// };

// /* ================= HELPERS ================= */

// const INR = (n: number) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//   }).format(Number.isFinite(n) ? n : 0);

// const pctOff = (mrp: number, sale: number) => {
//   if (!mrp || !sale || mrp <= sale) return 0;
//   return Math.round(((mrp - sale) / mrp) * 100);
// };

// function variantLabel(v: Variant) {
//   return v.size || v.weight || v.color || "";
// }

// function safeImg(v: any) {
//   const s = typeof v === "string" ? v.trim() : "";
//   return s.length ? s : null;
// }

// function pickMainImage(p: Product) {
//   return safeImg(p.imageUrl) || safeImg(p.mainImageUrl) || "/placeholder.png";
// }

// /* ================= COMPONENT ================= */

// export default function PlumProductCard({
//   product,
//   index = 0,
// }: {
//   product: Product;
//   index?: number;
// }) {
//   const { addToCart } = useCart();

//   /* ---------- NORMALIZE VARIANTS (IMPORTANT) ---------- */
//   const variants: Variant[] = Array.isArray(product.variants)
//     ? product.variants
//     : [];

//   const hasVariants = variants.length > 0;
//   const isSimple =
//     String(product.productType || "").toLowerCase() === "simple";

//   /* ---------- STATE ---------- */
//   const [selected, setSelected] = useState<Variant | null>(
//     hasVariants ? variants[0] : null
//   );
//   const [adding, setAdding] = useState(false);

//   useEffect(() => {
//     setSelected(hasVariants ? variants[0] : null);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [product.id]);

//   const v = selected;

//   /* ---------- PRICE LOGIC (SIMPLE + VARIANT SAFE) ---------- */
//   const mrp = v
//     ? Number(v.price ?? 0)
//     : Number(product.price ?? 0);

//   const sale = v
//     ? Number(v.effectivePrice ?? v.discountPrice ?? v.price ?? 0)
//     : Number(product.discountPrice ?? product.price ?? 0);

//   const off = pctOff(mrp, sale);
//   const inStock = v ? (v.stockQuantity ?? 0) > 0 : true;

//   /* ---------- UI DATA ---------- */
//   const badge =
//     index % 3 === 0
//       ? "trending 🔥"
//       : index % 3 === 1
//       ? "bestseller"
//       : "new launch!";

//   const img = pickMainImage(product);

//   const showVariantUI = !isSimple && hasVariants;

//   /* ================= RENDER ================= */

//   return (
//     <div className="w-full rounded-2xl border bg-white shadow-sm overflow-hidden">
//       {/* IMAGE */}
//       <div className="relative h-[230px] w-full bg-white">
//         <div
//           className="absolute left-3 top-3 z-10 rounded-lg px-3 py-1 text-xs font-semibold text-white"
//           style={{ backgroundColor: THEME }}
//         >
//           {badge}
//         </div>

//         <Link href={`/products/${product.slug}`} className="block h-full w-full">
//           <Image
//             src={img}
//             alt={product.name}
//             fill
//             className="object-contain p-4"
//             sizes="300px"
//           />
//         </Link>

//         {off > 0 && (
//           <div className="absolute bottom-0 left-0 right-0 bg-[#f57bb4] py-2 text-center text-sm font-semibold text-white">
//             flat {off}% off
//           </div>
//         )}
//       </div>

//       <div className="p-4">
//         {/* RATING (STATIC) */}
//         <div className="flex items-center gap-2 text-sm">
//           <span className="text-orange-500">★</span>
//           <span className="font-semibold">4.5</span>
//           <span className="text-gray-500">reviews</span>
//         </div>

//         {/* TITLE */}
//         <div className="mt-3 text-[16px] font-semibold text-[#6b1b66] leading-snug line-clamp-2">
//           {product.name}
//         </div>

//         {/* VARIANT PILLS (ONLY FOR NON-SIMPLE PRODUCTS) */}
//         {showVariantUI && (
//           <div className="mt-3 flex flex-wrap gap-2">
//             {variants.slice(0, 2).map((x) => {
//               const isActive = v?.id === x.id;
//               return (
//                 <button
//                   key={`${product.id}-${x.id}`}
//                   onClick={() => setSelected(x)}
//                   className="rounded-full px-4 py-2 text-xs font-semibold transition"
//                   style={
//                     isActive
//                       ? { backgroundColor: THEME, color: "white" }
//                       : {
//                           border: `1px solid ${THEME}55`,
//                           color: THEME,
//                           backgroundColor: "white",
//                         }
//                   }
//                 >
//                   {variantLabel(x)}
//                 </button>
//               );
//             })}

//             {variants.length > 2 && (
//               <span className="self-center text-xs font-semibold text-[#6b1b66]">
//                 +{variants.length - 2}
//               </span>
//             )}
//           </div>
//         )}

//         {/* PRICE */}
//         <div className="mt-4">
//           <div className="text-lg font-bold text-black">{INR(sale)}</div>
//           {mrp > sale && (
//             <div className="text-sm text-gray-500">
//               <span className="line-through">{INR(mrp)}</span>
//               <span className="ml-2 font-semibold" style={{ color: THEME }}>
//                 {off}% off
//               </span>
//             </div>
//           )}
//         </div>

//         {/* CTA */}
//         <button
//           disabled={(hasVariants && (!v || !inStock)) || adding}
//           onClick={async () => {
//             // SIMPLE PRODUCT → PDP
//             if (isSimple || !hasVariants) {
//               window.location.href = `/products/${product.slug}`;
//               return;
//             }

//             if (!v?.id) return;

//             setAdding(true);
//             try {
//               await addToCart(v.id, 1, {
//                 productId: product.id,
//                 name: product.name,
//                 price: sale,
//                 mrp: mrp,
//                 imageUrl:
//                   product.imageUrl || product.mainImageUrl || undefined,
//                 variant: {
//                   size: v.size || undefined,
//                   color: v.color || undefined,
//                   weight: v.weight || undefined,
//                 },
//               });

//               toast.success("Added to cart 🛒", {
//                 position: "top-right",
//                 duration: 2000,
//               });
//             } catch (e) {
//               toast.error("Failed to add to cart");
//               console.log("❌ addToCart failed", e);
//             } finally {
//               setAdding(false);
//             }
//           }}
//           className="mt-5 w-full rounded-xl py-3 text-base font-semibold text-white disabled:opacity-60"
//           style={{ backgroundColor: THEME }}
//         >
//           {isSimple || !hasVariants
//             ? "view product"
//             : !v
//             ? "select a variant"
//             : !inStock
//             ? "out of stock"
//             : adding
//             ? "adding..."
//             : "add to cart"}
//         </button>
//       </div>
//     </div>
//   );
// }


/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";

const THEME = "#f57bb4";

type Variant = {
  id: number;
  weight: string | null;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  price: number;
  discountPrice: number | null;
  effectivePrice?: number | null;
  stockQuantity: number;
  sku: string;
};

type Product = {
  id: number;
  name: string;
  slug: string;

  productType?: string | null;

  imageUrl: string | null;
  mainImageUrl: string | null;

  price?: number | null;
  discountPrice?: number | null;

  variants?: Variant[];
};

const INR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    Number.isFinite(n) ? n : 0
  );

const pctOff = (mrp: number, sale: number) => {
  if (!mrp || !sale || mrp <= sale) return 0;
  return Math.round(((mrp - sale) / mrp) * 100);
};

function variantLabel(v: Variant) {
  const parts: string[] = [];
  if (v.size) parts.push(v.size);
  if (v.weight) parts.push(v.weight);
  if (v.color) parts.push(v.color);
  return parts.length ? parts.join(" • ") : `Variant ${v.id}`;
}

function safeImg(v: any) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}



function pickMainImage(p: Product) {
  return safeImg(p.imageUrl) || safeImg(p.mainImageUrl) || "/placeholder.png";
}
export default function PlumProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const { addToCart } = useCart();

  const isSimple = String(product.productType || "").toLowerCase() === "simple";

  const variants: Variant[] = useMemo(
    () => (Array.isArray(product.variants) ? product.variants : []),
    [product.variants]
  );

  // ✅ IMPORTANT:
  // If product has at least 1 variant, we can add-to-cart.
  // For SIMPLE: we HIDE pills, but still use the first variant.
  const hasVariantForCart = variants.length > 0;

  const [selected, setSelected] = useState<Variant | null>(
    hasVariantForCart ? variants[0] : null
  );
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setSelected(variants.length > 0 ? variants[0] : null);
  }, [product.id, variants.length]);

  const v = selected || (variants.length > 0 ? variants[0] : null);

  // ✅ Pricing: prefer variant prices when variant exists
  const mrp = Number(v?.price ?? product.price ?? 0);
  const sale = Number(
    v?.effectivePrice ?? v?.discountPrice ?? product.discountPrice ?? v?.price ?? product.price ?? 0
  );
  const off = pctOff(mrp, sale);

  const badge =
    index % 3 === 0 ? "trending 🔥" : index % 3 === 1 ? "bestseller" : "new launch!";
  const img = pickMainImage(product);



  const inStock = (v?.stockQuantity ?? 0) > 0;

  // ✅ Show pills ONLY for non-simple with multiple variants (or at least 1 if you want)
  const showVariantUI = !isSimple && variants.length > 0;

  return (
    <div className="w-full rounded-2xl border bg-white shadow-sm overflow-hidden">
      {/* image */}
      <div className="relative h-[230px] w-full bg-white">
        <div
          className="absolute left-3 top-3 z-10 rounded-lg px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: THEME }}
        >
          {badge}
        </div>

        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <Image src={img} alt={product.name} fill className="object-contain p-4" sizes="300px" />
        </Link>

        {off > 0 ? (
          <div className="absolute bottom-0 left-0 right-0 bg-[#f57bb4] py-2 text-center text-sm font-semibold text-white">
            flat {off}% off
          </div>
        ) : null}
      </div>

      <div className="p-4">
        {/* rating placeholder */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-orange-500">★</span>
          <span className="font-semibold">4.5</span>
          <span className="text-gray-500">reviews</span>
        </div>

        {/* title */}
        <div className="mt-3 text-[16px] font-semibold text-[#6b1b66] leading-snug line-clamp-2">
          {product.name}
        </div>

        {/* ✅ variant pills (hidden for simple) */}
        {showVariantUI ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {variants.slice(0, 2).map((x) => {
              const isActive = v?.id === x.id;
              return (
                <button
                  key={`${product.id}-${x.id}`}
                  onClick={() => setSelected(x)}
                  className="rounded-full px-4 py-2 text-xs font-semibold transition"
                  style={
                    isActive
                      ? { backgroundColor: THEME, color: "white" }
                      : { border: `1px solid ${THEME}55`, color: THEME, backgroundColor: "white" }
                  }
                >
                  {variantLabel(x)}
                </button>
              );
            })}

            {variants.length > 2 ? (
              <span className="self-center text-xs font-semibold text-[#6b1b66]">
                +{variants.length - 2}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* price */}
        <div className="mt-4">
          <div className="text-lg font-bold text-black">{INR(sale)}</div>
          {mrp > sale ? (
            <div className="text-sm text-gray-500">
              <span className="line-through">{INR(mrp)}</span>
              <span className="ml-2 font-semibold" style={{ color: THEME }}>
                {off}% off
              </span>
            </div>
          ) : null}
        </div>

        {/* ✅ add to cart (works for simple + clothing) */}
        <button
          disabled={!hasVariantForCart || !v?.id || adding || !inStock}
          onClick={async () => {
            if (!v?.id) return;

            setAdding(true);
            try {
              await addToCart(v.id, 1, {
                productId: product.id,
                name: product.name,
                price: Number(v.effectivePrice ?? v.discountPrice ?? v.price ?? 0),
                mrp: Number(v.price ?? 0),
                imageUrl: product.imageUrl || product.mainImageUrl || undefined,
                variant: {
                  size: v.size || undefined,
                  color: v.color || undefined,
                  weight: (v.weight as any) || undefined,
                },
              });

              toast.success("Added to cart 🛒", { position: "top-right", duration: 2000 });
            } catch (e) {
              toast.error("Failed to add to cart");
              console.log("❌ addToCart failed", e);
            } finally {
              setAdding(false);
            }
          }}
          className="mt-5 w-full rounded-xl py-3 text-base font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: THEME }}
        >
          {!inStock ? "out of stock" : adding ? "adding..." : "add to cart"}
        </button>
      </div>
    </div>
  );
}

