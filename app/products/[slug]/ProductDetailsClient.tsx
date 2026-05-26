/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useCart } from "@/context/CartContext";

import ZoomModal from "./_components/ZoomModal";
import ProductDetailsMobile from "./_components/ProductDetailsMobile";
import ProductDetailsDesktop from "./_components/ProductDetailsDesktop";

type AnyObj = Record<string, any>;

const THEME = "#f57bb4";

/* ===================== HELPERS ===================== */

function money(n: number) {
  return new Intl.NumberFormat("en-IN").format(
    Number(n || 0)
  );
}

function normalizeImages(product: AnyObj): string[] {
  const out: string[] = [];

  const imgs = product?.images ?? [];

  if (Array.isArray(imgs)) {
    for (const it of imgs) {
      if (typeof it === "string") {
        out.push(it);
      } else if (it?.url) {
        out.push(it.url);
      }
    }
  }

  if (product?.mainImageUrl) {
    out.unshift(product.mainImageUrl);
  }

  if (product?.imageUrl) {
    out.unshift(product.imageUrl);
  }

  return Array.from(new Set(out)).filter(Boolean);
}

function calcDiscountPercent(
  mrp?: number,
  price?: number
) {
  if (!mrp || !price || mrp <= price) {
    return null;
  }

  return Math.round(((mrp - price) / mrp) * 100);
}

function ratingBlock(product: AnyObj) {
  const rating = product?.rating ?? 4.3;

  const reviews = product?.reviewsCount ?? 0;

  const ratingsCount =
    product?.ratingsCount ??
    product?.reviewsCount ??
    0;

  return {
    rating,
    reviews,
    ratingsCount,
  };
}

function getHighlights(product: AnyObj): string[] {
  const a = product?.highlights;

  if (Array.isArray(a) && a.length) {
    return a.filter(Boolean);
  }

  const b = product?.keyBenefits;

  if (Array.isArray(b) && b.length) {
    return b.filter(Boolean);
  }

  const c =
    product?.highlightsText ||
    product?.keyPoints ||
    product?.highlightsHtml;

  if (typeof c === "string" && c.trim()) {
    const stripped = c.replace(/<[^>]*>/g, "\n");

    return stripped
      .split(/\n|•|- /g)
      .map((s) => s.trim())
      .filter((s) => s.length >= 3)
      .slice(0, 12);
  }

  return [];
}

/* ===================== MAIN COMPONENT ===================== */

export default function ProductDetailsClient({
  product,
  related,
}: {
  product: AnyObj;
  related: any[];
}) {
  const { addToCart } = useCart();

  /* ===================== VARIANTS ===================== */

  const variants: AnyObj[] = useMemo(() => {
    const colors = Array.isArray(product?.colors)
      ? product.colors
      : [];

    const flat: AnyObj[] = [];

    colors.forEach((colorObj: AnyObj) => {
      const sizes = Array.isArray(colorObj?.sizes)
        ? colorObj.sizes
        : [];

      sizes.forEach((sizeObj: AnyObj) => {
        flat.push({
          id: sizeObj.id,

          color: colorObj.color,
          colorHex: colorObj.colorHex,

          size: sizeObj.size,
          weight: sizeObj.weight,

          price: Number(sizeObj.price || 0),

          discountPrice: sizeObj.discountPrice
            ? Number(sizeObj.discountPrice)
            : null,

          effectivePrice: sizeObj.effectivePrice
            ? Number(sizeObj.effectivePrice)
            : null,

          stockQuantity: Number(
            sizeObj.stockQuantity || 0
          ),

          sku: sizeObj.sku,

          images: Array.isArray(sizeObj.images)
            ? sizeObj.images
            : [],
        });
      });
    });

    return flat;
  }, [product]);

  /* ===================== SELECTED VARIANT ===================== */

  const [selectedVariantId, setSelectedVariantId] =
    useState<string | number | null>(null);

  useEffect(() => {
    if (!selectedVariantId && variants.length > 0) {
      setSelectedVariantId(
        variants[0]?.id ?? null
      );
    }
  }, [variants, selectedVariantId]);

  const selectedVariant: AnyObj | null =
    variants.find(
      (v) =>
        String(v.id) ===
        String(selectedVariantId)
    ) ||
    variants[0] ||
    null;

  /* ===================== IMAGES ===================== */

  const productImages = useMemo(
    () => normalizeImages(product),
    [product]
  );

  const variantImages = useMemo(() => {
    if (!selectedVariant?.images?.length) {
      return [];
    }

    return selectedVariant.images
      .map((img: any) => {
        if (typeof img === "string") {
          return img;
        }

        return img?.url;
      })
      .filter(Boolean);
  }, [selectedVariant]);

  const images = useMemo(() => {
    if (variantImages.length > 0) {
      return variantImages;
    }

    return productImages;
  }, [variantImages, productImages]);

  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [selectedVariantId]);

  const mainImage =
    images?.[active] ||
    images?.[0] ||
    "/placeholder.png";

  /* ===================== PRICING ===================== */

  const mrp = Number(
    selectedVariant?.price ??
      product?.price ??
      0
  );

  const sale = Number(
    selectedVariant?.effectivePrice ??
      selectedVariant?.discountPrice ??
      product?.discountPrice ??
      selectedVariant?.price ??
      product?.price ??
      0
  );

  const discount = calcDiscountPercent(
    mrp,
    sale
  );

  /* ===================== STOCK ===================== */

  const inStock =
    typeof selectedVariant?.stockQuantity ===
    "number"
      ? selectedVariant.stockQuantity > 0
      : typeof product?.stockQuantity ===
        "number"
      ? product.stockQuantity > 0
      : true;

  /* ===================== META ===================== */

  const { rating, reviews, ratingsCount } =
    ratingBlock(product);

  const title =
    product?.name || "Product Name";

  const brand =
    product?.brandName ||
    product?.brand?.name ||
    product?.manufacturer ||
    "";

  const category =
    product?.categoryName ||
    product?.category?.name ||
    "";

  const highlights = useMemo(
    () => getHighlights(product),
    [product]
  );

  /* ===================== ZOOM ===================== */

  const [zoomOpen, setZoomOpen] =
    useState(false);

  /* ===================== SWIPE ===================== */

  const swipe = useRef({
    startX: 0,
    startY: 0,
    active: false,
    pointerId: -1,
  });

  const SLIDE_THRESHOLD = 40;

  const goPrev = () => {
    setActive((p) => {
      return (p - 1 + images.length) % images.length;
    });
  };

  const goNext = () => {
    setActive((p) => {
      return (p + 1) % images.length;
    });
  };

  const onPointerDown = (
    e: React.PointerEvent
  ) => {
    if (images.length <= 1) return;

    (
      e.currentTarget as HTMLElement
    ).setPointerCapture(e.pointerId);

    swipe.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
    };
  };

  const onPointerUp = (
    e: React.PointerEvent
  ) => {
    if (
      !swipe.current.active ||
      e.pointerId !== swipe.current.pointerId
    ) {
      return;
    }

    const dx =
      e.clientX - swipe.current.startX;

    const dy =
      e.clientY - swipe.current.startY;

    swipe.current.active = false;

    if (
      Math.abs(dx) > Math.abs(dy) &&
      Math.abs(dx) > SLIDE_THRESHOLD
    ) {
      dx < 0 ? goNext() : goPrev();
    }

    try {
      (
        e.currentTarget as HTMLElement
      ).releasePointerCapture(e.pointerId);
    } catch {}
  };

  /* ===================== CART ===================== */

  const onAddToCart = async (
    qty: number = 1
  ) => {
    try {
      const variantId =
        selectedVariant?.id;

      if (!variantId) {
        console.log("PRODUCT:", product);

        console.log(
          "VARIANTS:",
          variants
        );

        console.log(
          "SELECTED:",
          selectedVariant
        );

        alert("Please select a variant");

        return;
      }

      console.log("ADDING TO CART:", {
        variantId,
        qty,
      });

      await addToCart(variantId, qty, {
        productId: product.id,

        name: product.name,

        price: sale,

        mrp: mrp > sale ? mrp : null,

        imageUrl: mainImage,

        variant: {
          size:
            selectedVariant?.size ||
            undefined,

          color:
            selectedVariant?.color ||
            undefined,

          weight:
            selectedVariant?.weight ||
            undefined,
        },
      });

      console.log(
        "ADD TO CART SUCCESS"
      );
    } catch (err) {
      console.error(
        "ADD TO CART ERROR:",
        err
      );
    }
  };

  const onBuyNow = async (
    qty: number = 1
  ) => {
    try {
      await onAddToCart(qty);

      window.location.href = "/cart";
    } catch (err) {
      console.error(
        "BUY NOW ERROR:",
        err
      );
    }
  };

  /* ===================== SHARED ===================== */

  const shared = {
    THEME,

    product,
    related,

    images,
    active,
    setActive,
    mainImage,

    title,
    brand,
    category,

    rating,
    reviews,
    ratingsCount,

    variants,

    selectedVariantId,
    setSelectedVariantId,

    selectedVariant,

    mrp,
    sale,
    discount,
    inStock,

    highlights,
    money,

    goPrev,
    goNext,

    onPointerDown,
    onPointerUp,

    onOpenZoom: (imgIndex?: number) => {
      if (typeof imgIndex === "number") {
        setActive(imgIndex);
      }
      setZoomOpen(true);
    },

    onAddToCart,
    onBuyNow,
  };

  /* ===================== RENDER ===================== */

  return (
    <div className="bg-white">
      <ZoomModal
        open={zoomOpen}
        image={mainImage}
        title={title}
        onClose={() =>
          setZoomOpen(false)
        }
      />

      {/* MOBILE */}
      
      <div className="md:hidden">
        <ProductDetailsMobile {...shared} />
      </div>
     

      {/* DESKTOP */}
      <div className="hidden md:block">
        <ProductDetailsDesktop
          {...shared}
        />
      </div>
    </div>
  );
}