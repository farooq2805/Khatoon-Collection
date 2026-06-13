

// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { useEffect, useMemo, useState } from "react";
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
//   effectivePrice?: number | null;
//   stockQuantity: number;
//   sku: string;
// };

// type Product = {
//   id: number;
//   name: string;
//   slug: string;

//   productType?: string | null;

//   imageUrl: string | null;
//   mainImageUrl: string | null;

//   price?: number | null;
//   discountPrice?: number | null;

//   variants?: Variant[];
// };

// const INR = (n: number) =>
//   new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
//     Number.isFinite(n) ? n : 0
//   );

// const pctOff = (mrp: number, sale: number) => {
//   if (!mrp || !sale || mrp <= sale) return 0;
//   return Math.round(((mrp - sale) / mrp) * 100);
// };

// function variantLabel(v: Variant) {
//   const parts: string[] = [];
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
//   return safeImg(p.imageUrl) || safeImg(p.mainImageUrl) || "/placeholder.png";
// }
// export default function PlumProductCard({
//   product,
//   index = 0,
// }: {
//   product: Product;
//   index?: number;
// }) {
//   const { addToCart } = useCart();

//   const isSimple = String(product.productType || "").toLowerCase() === "simple";

//   const variants: Variant[] = useMemo(
//     () => (Array.isArray(product.variants) ? product.variants : []),
//     [product.variants]
//   );

//   // ✅ IMPORTANT:
//   // If product has at least 1 variant, we can add-to-cart.
//   // For SIMPLE: we HIDE pills, but still use the first variant.
//   const hasVariantForCart = variants.length > 0;

//   const [selected, setSelected] = useState<Variant | null>(
//     hasVariantForCart ? variants[0] : null
//   );
//   const [adding, setAdding] = useState(false);

//   useEffect(() => {
//     setSelected(variants.length > 0 ? variants[0] : null);
//   }, [product.id, variants.length]);

//   const v = selected || (variants.length > 0 ? variants[0] : null);

//   // ✅ Pricing: prefer variant prices when variant exists
//   const mrp = Number(v?.price ?? product.price ?? 0);
//   const sale = Number(
//     v?.effectivePrice ?? v?.discountPrice ?? product.discountPrice ?? v?.price ?? product.price ?? 0
//   );
//   const off = pctOff(mrp, sale);

//   const badge =
//     index % 3 === 0 ? "trending 🔥" : index % 3 === 1 ? "bestseller" : "new launch!";
//   const img = pickMainImage(product);



//   const inStock = (v?.stockQuantity ?? 0) > 0;

//   // ✅ Show pills ONLY for non-simple with multiple variants (or at least 1 if you want)
//   const showVariantUI = !isSimple && variants.length > 0;

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

//         {/* ✅ variant pills (hidden for simple) */}
//         {showVariantUI ? (
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
//                       : { border: `1px solid ${THEME}55`, color: THEME, backgroundColor: "white" }
//                   }
//                 >
//                   {variantLabel(x)}
//                 </button>
//               );
//             })}

//             {variants.length > 2 ? (
//               <span className="self-center text-xs font-semibold text-[#6b1b66]">
//                 +{variants.length - 2}
//               </span>
//             ) : null}
//           </div>
//         ) : null}

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

//         {/* ✅ add to cart (works for simple + clothing) */}
//         <button
//           disabled={!hasVariantForCart || !v?.id || adding || !inStock}
//           onClick={async () => {
//             if (!v?.id) return;

//             setAdding(true);
//             try {
//               await addToCart(v.id, 1, {
//                 productId: product.id,
//                 name: product.name,
//                 price: Number(v.effectivePrice ?? v.discountPrice ?? v.price ?? 0),
//                 mrp: Number(v.price ?? 0),
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
//           {!inStock ? "out of stock" : adding ? "adding..." : "add to cart"}
//         </button>
//       </div>
//     </div>
//   );
// }


/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";

const THEME = "#f57bb4";

type SizeEntry = {
  id: number;
  size: string | null;
  weight: string | null;
  price: number;
  discountPrice: number | null;
  effectivePrice: number | null;
  stockQuantity: number;
  sku: string;
};

type ColorEntry = {
  color: string | null;
  colorHex: string | null;
  colorImageUrl: string | null;
  slug?: string;
  images: { url: string }[];
  sizes: SizeEntry[];
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
  colors?: ColorEntry[];
  colorSiblings?: any[];
};

const INR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    Number.isFinite(n) ? n : 0
  );

const pctOff = (mrp: number, sale: number) => {
  if (!mrp || !sale || mrp <= sale) return 0;
  return Math.round(((mrp - sale) / mrp) * 100);
};

function safeImg(v: any) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

function pickMainImage(p: Product) {
  return safeImg(p.mainImageUrl) || safeImg(p.imageUrl) || "/placeholder.png";
}

export default function PlumProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const { addToCart } = useCart();

  // ✅ Use colors[] from API (grouped structure with colorHex, sizes, etc.)
  // OR use colorSiblings if they exist (for cross-product design groups)
  const hasSiblings = Array.isArray(product.colorSiblings) && product.colorSiblings.length > 0;

  const colors: ColorEntry[] = useMemo(() => {
    if (hasSiblings) {
      return product.colorSiblings!.map((sib: any) => ({
        color: sib.color,
        colorHex: sib.colorHex,
        colorImageUrl: sib.imageUrl,
        slug: sib.slug,
        images: sib.imageUrl ? [{ url: sib.imageUrl }] : [],
        sizes: [], // no sizes available from sibling list directly
      }));
    }
    return Array.isArray(product.colors) ? product.colors : [];
  }, [product, hasSiblings]);

  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const [adding, setAdding] = useState(false);

  const activeColor = colors[activeColorIdx] ?? colors[0] ?? null;
  const firstSize = activeColor?.sizes?.[0] ?? null;

  // Pricing from first size of selected color
  const mrp = Number(firstSize?.price ?? product.price ?? 0);
  const sale = Number(
    firstSize?.effectivePrice ??
      firstSize?.discountPrice ??
      firstSize?.price ??
      product.discountPrice ??
      product.price ??
      0
  );
  const off = pctOff(mrp, sale);

  // Stock: any size in active color in stock
  const inStock = activeColor?.sizes?.some((s) => (s.stockQuantity ?? 0) > 0) ?? false;

  // ✅ Image: color-specific image > product main image
  const img = useMemo(() => {
    if (activeColor?.colorImageUrl) return activeColor.colorImageUrl;
    if (activeColor?.images?.[0]?.url) return activeColor.images[0].url;
    return pickMainImage(product);
  }, [activeColor, product]);

  const badges = ["🔥 Trending", "⭐ Bestseller", "✨ New", "💎 Premium", "❤️ Popular"];
  const badge = badges[index % badges.length];

  const handleAdd = async () => {
    if (!firstSize?.id) {
      window.location.href = `/products/${product.slug}`;
      return;
    }
    setAdding(true);
    try {
      await addToCart(firstSize.id, 1, {
        productId: product.id,
        name: product.name,
        price: sale,
        mrp: mrp > sale ? mrp : undefined,
        imageUrl: img,
        variant: {
          size: firstSize.size || undefined,
          color: activeColor?.color || undefined,
          weight: (firstSize.weight as any) || undefined,
        },
      });
      toast.success("Added to cart 🛒", { position: "top-right", duration: 2000 });
    } catch (e) {
      toast.error("Failed to add to cart");
      console.log("❌ addToCart failed", e);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group w-full rounded-2xl border border-gray-100 bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
      {/* Image Block */}
      <div className="relative w-full overflow-hidden bg-[#fdf7f9]" style={{ aspectRatio: "3/4" }}>
        {/* Badge */}
        <div
          className="absolute left-2.5 top-2.5 z-10 rounded-md px-2 py-0.5 text-[10px] font-bold text-white shadow-sm"
          style={{ backgroundColor: THEME }}
        >
          {badge}
        </div>

        {/* Discount badge */}
        {off > 0 && (
          <div className="absolute right-2.5 top-2.5 z-10 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            {off}% OFF
          </div>
        )}

        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        </Link>

        {/* Hover: quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-2.5">
          <button
            disabled={adding}
            onClick={handleAdd}
            className="w-full rounded-xl py-2 text-[12px] font-bold text-white shadow-md"
            style={{ backgroundColor: THEME }}
          >
            {!firstSize?.id ? "VIEW" : !inStock ? "OUT OF STOCK" : adding ? "ADDING..." : "QUICK ADD"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Color Swatches */}
        {colors.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            {colors.slice(0, 7).map((c, i) => (
              <button
                key={i}
                onClick={() => {
                  if (c.slug && c.slug !== product.slug) {
                    window.location.href = `/products/${c.slug}`;
                  } else {
                    setActiveColorIdx(i);
                  }
                }}
                title={c.color || "Color"}
                className={`rounded-full border-2 transition-all duration-150 ${
                  i === activeColorIdx || (c.slug && c.slug === product.slug)
                    ? "border-gray-800 scale-125 shadow-md"
                    : "border-gray-200 hover:border-gray-500"
                }`}
                style={{
                  width: 16,
                  height: 16,
                  minWidth: 16,
                  background: c.colorHex || "#ccc",
                }}
              />
            ))}
            {colors.length > 7 && (
              <span className="text-[10px] text-gray-400 font-medium">+{colors.length - 7}</span>
            )}
          </div>
        )}

        {/* Title */}
        <Link href={`/products/${product.slug}`}>
          <div className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-[#9C2A49] transition-colors">
            {product.name}
          </div>
        </Link>

        {/* Active color name */}
        {activeColor?.color && (
          <div className="mt-0.5 text-[11px] text-gray-400">{activeColor.color}</div>
        )}

        {/* Rating */}
        <div className="mt-1.5 flex items-center gap-1">
          <span className="text-[12px] text-amber-400">★★★★★</span>
          <span className="text-[11px] text-gray-400">(4.3)</span>
        </div>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[16px] font-bold text-gray-900">{INR(sale)}</span>
          {mrp > sale && (
            <span className="text-[12px] text-gray-400 line-through">{INR(mrp)}</span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          disabled={adding}
          onClick={handleAdd}
          className="mt-2.5 w-full rounded-xl py-2 text-[12px] font-bold border-2 transition-all duration-200 hover:bg-[#f57bb4] hover:text-white"
          style={{ borderColor: THEME, color: THEME }}
        >
          {!firstSize?.id ? "VIEW PRODUCT" : !inStock ? "OUT OF STOCK" : adding ? "ADDING..." : "ADD TO CART"}
        </button>
      </div>
    </div>
  );
}


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

  const siblings = useMemo(() => {
    return (productGroups as Record<string, any>)[String(product.id)] || [];
  }, [product.id]);

  const currentSiblingColor = useMemo(() => {
    return siblings.find((s: any) => Number(s.id) === Number(product.id))?.color || "";
  }, [siblings, product.id]);

  const isSimple = String(product.productType || "").toLowerCase() === "simple";

  const variants: Variant[] = useMemo(
    () => (Array.isArray(product.variants) ? product.variants : []),
    [product.variants]
  );

  const hasVariantForCart = variants.length > 0;

  const [selected, setSelected] = useState<Variant | null>(
    hasVariantForCart ? variants[0] : null
  );
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setSelected(variants.length > 0 ? variants[0] : null);
  }, [product.id, variants.length]);

  const v = selected || (variants.length > 0 ? variants[0] : null);

  const mrp = Number(v?.price ?? product.price ?? 0);
  const sale = Number(
    v?.effectivePrice ??
      v?.discountPrice ??
      product.discountPrice ??
      v?.price ??
      product.price ??
      0
  );

  const off = pctOff(mrp, sale);
  const img = pickMainImage(product);
  const inStock = (v?.stockQuantity ?? 0) > 0;

  // ✅ pills only when non-simple and multiple variants
  const showVariantUI = !isSimple && variants.length > 1;

  const onAdd = async () => {
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
  };

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* ✅ 1mg-style image block (DESKTOP) */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="bg-white flex items-center justify-center h-[140px] md:h-[150px]">
          <div className="relative w-[110px] h-[110px] md:w-[120px] md:h-[120px]">
            <Image
              src={img}
              alt={product.name}
              fill
              sizes="180px"
              className="object-contain"
            />
          </div>
        </div>
      </Link>

      {/* content */}
      <div className="px-3 pb-3">
        {/* title */}
        <Link href={`/products/${product.slug}`} className="block">
          <div className="text-[13px] md:text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">
            {product.name}
          </div>
        </Link>

        {/* pack/variant line */}
        <div className="mt-1 text-[12px] text-gray-500 line-clamp-1">
          {v ? variantLabel(v) : "Single product"}
        </div>

        {/* Color row */}
        {siblings.length > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-[#f57bb4] bg-[#f57bb4]/5 border border-[#f57bb4]/20 rounded-md px-2 py-0.5 uppercase tracking-wider">
              {currentSiblingColor || "Default"}
            </span>
            {siblings.length > 1 && (
              <span className="text-[10px] text-gray-500 font-medium">
                +{siblings.length - 1} More Colors
              </span>
            )}
          </div>
        )}

        {/* rating row (small like 1mg) */}
        <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-600">
          <span className="text-green-600 font-bold">★</span>
          <span className="font-semibold">4.3</span>
          <span className="text-gray-400">(120)</span>
        </div>

        {/* price */}
        <div className="mt-2">
          <div className="text-[15px] font-bold text-gray-900">{INR(sale)}</div>

          {mrp > sale ? (
            <div className="text-[12px] text-gray-500">
              <span className="line-through">{INR(mrp)}</span>
              <span className="ml-2 font-semibold text-green-700">{off}% off</span>
            </div>
          ) : null}
        </div>

        {/* variant pills (optional; 1mg usually not heavy on pills on PLP but you asked to keep) */}
        {showVariantUI ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.slice(0, 2).map((x) => {
              const isActive = v?.id === x.id;
              return (
                <button
                  key={`${product.id}-${x.id}`}
                  onClick={() => setSelected(x)}
                  className="rounded-full px-3 py-1 text-[11px] font-semibold transition"
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
              <span className="self-center text-[11px] font-semibold text-gray-700">
                +{variants.length - 2}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* ✅ 1mg-style ADD button (outline) */}
        <button
          disabled={!hasVariantForCart || !v?.id || adding || !inStock}
          onClick={onAdd}
          className="mt-3 w-full h-9 rounded-lg border text-[12px] font-bold disabled:opacity-60"
          style={{
            borderColor: THEME,
            color: THEME,
            background: "white",
          }}
        >
          {!inStock ? "OUT OF STOCK" : adding ? "ADDING..." : "ADD"}
        </button>
      </div>
    </div>
  );
}
