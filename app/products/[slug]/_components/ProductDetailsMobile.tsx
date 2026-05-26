/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Swiper, SwiperSlide } from "swiper/react";

import {
  Navigation,
  Pagination,
  Keyboard,
  Thumbs,
  FreeMode,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import Image from "next/image";
import React, { useMemo, useState } from "react";

import {
  FiChevronLeft,
  FiChevronRight,
  FiTruck,
  FiCreditCard,
  FiRefreshCcw,
  FiChevronDown,
} from "react-icons/fi";


import RelatedFashionCard from "../_components/RelatedFashionCard";

/* ===================== UI HELPERS ===================== */

function Stars({ value }: { value: number }) {
  const full = Math.round(value || 0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={[
            "text-[13px]",
            i < full ? "text-[#f5b400]" : "text-gray-300",
          ].join(" ")}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function variantLabel(v: any, idx: number) {
  return (
    v?.color ||
    v?.colorName ||
    v?.attributes?.color ||
    v?.size ||
    v?.title ||
    v?.weight ||
    `Option ${idx + 1}`
  );
}

function buildSpecs(product: any) {
  const specs: { k: string; v: string }[] = [];

  if (product?.kurtaLength)
    specs.push({ k: "Kurta Length", v: String(product.kurtaLength) });

  if (product?.salwarLength)
    specs.push({ k: "Salwar Length", v: String(product.salwarLength) });

  if (product?.modelWearing)
    specs.push({ k: "Model is wearing", v: String(product.modelWearing) });

  if (product?.modelHeight)
    specs.push({ k: "Model Height", v: String(product.modelHeight) });

  if (product?.washCare)
    specs.push({ k: "Wash Instructions", v: String(product.washCare) });

  return specs;
}

function Accordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-[12px] font-semibold tracking-[0.08em] text-gray-900">
          {title.toUpperCase()}
        </span>

        <FiChevronDown
          className={[
            "text-gray-600 transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open ? (
        <div className="pb-5 text-[13px] leading-6 text-gray-700">
          {children}
        </div>
      ) : null}
    </div>
  );
}



/* ===================== MAIN COMPONENT ===================== */

export default function ProductDetailsDesktop(props: any) {
  const {
    THEME,
    product,
    related = [],

    images = [],
    active,
    setActive,
    mainImage,

    title,
    rating,
    reviews,

    variants = [],

    selectedVariantId,
    setSelectedVariantId,

    mrp,
    sale,
    discount,
    inStock,

    money,

    goPrev,
    goNext,

    onPointerDown,
    onPointerMove,
    onPointerUp,

    onOpenZoom,

    onAddToCart,
    onBuyNow,
  } = props;

  const isSoldOut = !inStock;

  /* ===================== VARIANT ===================== */

  const selectedVariant = useMemo(() => {
    if (!variants?.length) return null;

    return (
      variants.find((v: any) => v.id === selectedVariantId) ||
      variants[0]
    );
  }, [variants, selectedVariantId]);

  /* ===================== DESCRIPTION ===================== */

  const descriptionText = useMemo(() => {
    const html = product?.description;

    if (!html || typeof html !== "string") return "";

    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }, [product?.description]);

  /* ===================== SPECS ===================== */

  const specs = useMemo(() => buildSpecs(product), [product]);

  /* ===================== QTY ===================== */

  const [qty, setQty] = useState(1);

  /* ===================== CART ===================== */

  const onAdd = async () => {
    await onAddToCart(qty);
  };

  const onBuy = async () => {
    await onAddToCart(qty);
    await onBuyNow();
  };

  /* ===================== IMAGES ===================== */

  const galleryImages = useMemo(() => {
  // CASE 1: product.images[]
  if (Array.isArray(images) && images.length > 0) {
    return images
      .map((img: any) => {
        // API object
        if (typeof img === "object") {
          return img?.url;
        }

        // already string
        return img;
      })
      .filter(Boolean);
  }

  // CASE 2: fallback main image
  if (mainImage) {
    return [mainImage];
  }

  return [];
}, [images, mainImage]);

    const uniqueColors = [
      ...new Set(
        variants
          ?.map((v: any) => v.color)
          .filter(Boolean)
      ),
    ];
    
    const sizesForSelectedColor = variants.filter(
      (v: any) =>
        v.color === selectedVariant?.color
    );

    const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

  const currentImage =
  galleryImages?.[Number(active) || 0] ||
  galleryImages?.[0] ||
  mainImage ||
  "/placeholder.png";

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1500px] px-4 py-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">

          
         {/* ===================== LEFT ===================== */}
{/* ===================== LEFT ===================== */}
<div className="lg:col-span-7">
  <div className="grid grid-cols-1 lg:grid-cols-[100px_1fr] gap-4 items-start">

    {/* ===================== THUMBNAILS (DESKTOP) ===================== */}
    <div className="hidden lg:flex flex-col gap-3 max-h-[720px] overflow-y-auto scrollbar-hide">
      {galleryImages.map((src: string, i: number) => {
        const isActive = Number(active) === i;

        return (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`relative h-[120px] w-[90px] rounded-2xl overflow-hidden border transition ${
              isActive ? "border-black ring-2 ring-black/10" : "border-gray-200"
            }`}
          >
            <Image
              src={src}
              alt={`thumb-${i}`}
              fill
              className="object-cover"
            />
          </button>
        );
      })}
    </div>

    {/* ===================== MAIN IMAGE WRAPPER ===================== */}
    <div className="relative">

      {/* IMAGE FRAME */}
      <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[720px] rounded-[28px] overflow-hidden bg-[#f7f7f7] shadow-sm">

        {galleryImages.map((src: string, i: number) => {
          const isActive = i === Number(active);

          return (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <Image
                src={src}
                alt={`image-${i}`}
                fill
                priority={i === 0}
                className="object-cover"
              />
            </div>
          );
        })}

      </div>

      {/* ===================== PREV ===================== */}
      {galleryImages.length > 1 && (
        <button
          onClick={() =>
            setActive(active === 0 ? galleryImages.length - 1 : active - 1)
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-white/90 shadow flex items-center justify-center hover:scale-110 transition"
        >
          <FiChevronLeft />
        </button>
      )}

      {/* ===================== NEXT ===================== */}
      {galleryImages.length > 1 && (
        <button
          onClick={() =>
            setActive(active === galleryImages.length - 1 ? 0 : active + 1)
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-white/90 shadow flex items-center justify-center hover:scale-110 transition"
        >
          <FiChevronRight />
        </button>
      )}

      {/* ===================== COUNTER ===================== */}
      {galleryImages.length > 1 && (
        <div className="absolute bottom-4 left-4 z-20 bg-black/70 text-white text-[11px] px-3 py-1 rounded-full">
          {Number(active) + 1} / {galleryImages.length}
        </div>
      )}

      {/* ===================== DOTS ===================== */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {galleryImages.map((_: any, i: number) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-2 transition-all rounded-full ${
              Number(active) === i ? "w-6 bg-black" : "w-2 bg-black/30"
            }`}
          />
        ))}
      </div>

      {/* ===================== ZOOM ===================== */}
      <button
        onClick={onOpenZoom}
        className="absolute bottom-4 right-4 z-20 bg-white px-4 py-2 text-[11px] rounded-full border shadow"
      >
        ZOOM
      </button>
    </div>
  </div>

  {/* ===================== MOBILE THUMBS ===================== */}
  <div className="flex lg:hidden gap-2 mt-3 overflow-x-auto pb-2">
    {galleryImages.map((src: string, i: number) => {
      const isActive = Number(active) === i;

      return (
        <button
          key={i}
          onClick={() => setActive(i)}
          className={`relative h-[70px] w-[60px] flex-shrink-0 rounded-xl overflow-hidden border ${
            isActive ? "border-black" : "border-gray-200"
          }`}
        >
          <Image src={src} alt={`thumb-${i}`} fill className="object-cover" />
        </button>
      );
    })}
  </div>
</div>

          {/* ===================== RIGHT ===================== */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">

              {/* TITLE */}
              <h1 className="text-[18px] font-semibold uppercase tracking-[0.05em] text-[#2b2b2b]">
                {title}
              </h1>

              {/* RATING */}
              <div className="mt-3 flex items-center gap-2">
                <Stars value={rating} />

                <span className="text-[12px] text-gray-600">
                  ({reviews} Reviews)
                </span>
              </div>

              {/* PRICE */}
              <div className="mt-5 flex items-center gap-3">
                <div className="text-[26px] font-semibold text-[#2b2b2b]">
                  ₹{money(sale)}
                </div>

                {mrp > sale ? (
                  <div className="text-[15px] text-gray-400 line-through">
                    ₹{money(mrp)}
                  </div>
                ) : null}

                {discount ? (
                  <div className="text-[13px] font-semibold text-[#0c8a43]">
                    {discount}% OFF
                  </div>
                ) : null}
              </div>

              <div className="mt-1 text-[12px] text-gray-500">
                Inclusive of all taxes
              </div>

              {/* STOCK */}
              <div className="mt-3">
                {isSoldOut ? (
                  <div className="text-[13px] font-medium text-red-600">
                    Out of stock
                  </div>
                ) : (
                  <div className="text-[13px] text-green-700">
                    In stock
                  </div>
                )}
              </div>
{/* ===================== VARIANTS ===================== */}

{variants?.length > 0 ? (
  <div className="mt-8 rounded-3xl border border-gray-100 bg-[#fafafa] p-6 shadow-sm">

    {/* ===================== COLORS ===================== */}

    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Color:
          <span className="ml-2 font-semibold text-black">
            {selectedVariant?.color || "Select"}
          </span>
        </h3>
      </div>

      <div className="flex flex-wrap gap-3">

        {[
          ...new Set(
            variants
              .map((v: any) => v.color)
              .filter(Boolean)
          ),
        ].map((color: any) => {

          const firstVariant = variants.find(
            (v: any) => v.color === color
          );

          const active =
            selectedVariant?.color === color;

          return (
            <button
              key={color}
              type="button"
              onClick={() => {
                if (firstVariant) {
                  setSelectedVariantId(
                    firstVariant.id
                  );
                }
              }}
              className={`
                relative
                h-14
                w-14
                rounded-2xl
                border-2
                transition-all
                duration-200
                hover:scale-105
                shadow-sm
                ${
                  active
                    ? "border-black ring-4 ring-black/5"
                    : "border-gray-200"
                }
              `}
              title={color}
            >
              <span
                className="absolute inset-1 rounded-xl"
                style={{
                  background:
                    firstVariant?.colorHex ||
                    "#000",
                }}
              />
            </button>
          );
        })}

      </div>
    </div>

    {/* ===================== SIZE ===================== */}

    <div className="mt-8">

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Size
        </h3>

        <button
          type="button"
          className="
            text-sm
            font-medium
            text-gray-500
            underline
            underline-offset-2
            hover:text-black
          "
        >
          View Size Chart
        </button>
      </div>

      <div className="flex flex-wrap gap-3">

        {variants
          .filter(
            (v: any) =>
              v.color === selectedVariant?.color
          )
          .map((v: any) => {

            const active =
              String(v.id) ===
              String(selectedVariantId);

            const outOfStock =
              Number(v.stockQuantity || 0) <= 0;

            return (
              <button
                key={v.id}
                type="button"
                disabled={outOfStock}
                onClick={() =>
                  setSelectedVariantId(v.id)
                }
                className={`
                  min-w-[70px]
                  h-12
                  rounded-2xl
                  border
                  px-5
                  text-sm
                  font-semibold
                  transition-all
                  duration-200
                  shadow-sm
                  ${
                    active
                      ? "border-black bg-gray-100 text-black"
                      : "border-gray-200 bg-white hover:border-black"
                  }
                  ${
                    outOfStock
                      ? "cursor-not-allowed opacity-40 line-through"
                      : ""
                  }
                `}
              >
                {v.size || "N/A"}
              </button>
            );
          })}

      </div>

      {/* STOCK */}
      {selectedVariant?.stockQuantity ? (
        <p className="mt-4 text-sm text-gray-500">
          Only{" "}
          <span className="font-semibold text-black">
            {selectedVariant.stockQuantity}
          </span>{" "}
          pieces left
        </p>
      ) : null}
    </div>

    {/* ===================== QUANTITY ===================== */}

    <div className="mt-8">
      <div className="mb-3 text-sm font-medium text-gray-900">
        Quantity
      </div>

      <div className="inline-flex items-center overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <button
          onClick={() =>
            setQty((q) => Math.max(1, q - 1))
          }
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            text-lg
            transition
            hover:bg-gray-50
          "
        >
          −
        </button>

        <div className="flex h-12 w-14 items-center justify-center border-x border-gray-200 text-sm font-semibold">
          {qty}
        </div>

        <button
          onClick={() => setQty((q) => q + 1)}
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            text-lg
            transition
            hover:bg-gray-50
          "
        >
          +
        </button>
      </div>
    </div>

    {/* ===================== DELIVERY ===================== */}

    <div className="mt-8 space-y-4 rounded-2xl border border-gray-100 bg-white p-5">

      <div className="flex items-center gap-3 text-sm text-gray-700">
        <FiTruck className="text-black" />
        <span>
          Worldwide Shipping Available
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-700">
        <FiCreditCard className="text-black" />
        <span>
         
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-700">
        <FiRefreshCcw className="text-black" />
        <span>
          Easy exchange available
        </span>
      </div>

    </div>

    {/* ===================== CTA ===================== */}

    <div className="mt-8 flex flex-col gap-4">

      {/* ADD TO CART */}

      <button
        onClick={onAdd}
        disabled={isSoldOut}
        className="
          h-14
          rounded-2xl
          bg-black
          text-sm
          font-semibold
          text-white
          shadow-lg
          transition-all
          duration-200
          hover:opacity-90
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {isSoldOut
          ? "Out Of Stock"
          : "Add To Cart"}
      </button>

      {/* BUY NOW */}

      <button
        onClick={onBuy}
        disabled={isSoldOut}
        className="
          h-14
          rounded-2xl
          border
          border-black
          bg-white
          text-sm
          font-semibold
          text-black
          transition-all
          duration-200
          hover:bg-gray-50
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        Checkout Now
      </button>

    </div>

  </div>
) : (
  <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-500">
    No variants available
  </div>
)}

              {/* ===================== ACCORDIONS ===================== */}
              <div className="mt-8">

                <Accordion title="Description" defaultOpen>
                  {descriptionText || "No description available."}
                </Accordion>

                {/* <Accordion title="Product Details">
                  {specs?.length ? (
                    <div className="space-y-2">
                      {specs.map((s, idx) => (
                        <div
                          key={`${s.k}-${idx}`}
                          className="flex gap-2 text-[13px]"
                        >
                          <span className="font-medium text-gray-900">
                            {s.k}:
                          </span>

                          <span className="text-gray-700">
                            {s.v}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>No details available.</div>
                  )}
                </Accordion> */}

                <Accordion title="Exchange Policy">
                  <div className="space-y-4 text-gray-700 text-xs">
                    <p className="font-semibold text-gray-900 text-[13px]">Our Exchange Policy</p>
                    <p>
                      We offer a hassle-free <strong>Exchange-Only Policy</strong> within 7 days of delivery for size changes or defective/incorrect items. We do not provide cash or card refunds.
                    </p>
                    <p>
                      To request a product exchange, please connect with our dedicated customer support team directly on WhatsApp.
                    </p>
                    
                    <div className="pt-2">
                      <a
                        href="https://wa.me/919022668127?text=Hi%20Khatoon%20Collection,%20I%20would%20like%20to%20request%20an%20exchange."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#25D366] text-white hover:bg-[#20ba5a] transition px-5 py-2.5 rounded-xl font-semibold shadow-sm text-[10px] tracking-wide"
                      >
                        <i className="ri-whatsapp-line text-sm"></i>
                        CONNECT ON WHATSAPP (+91 90226 68127)
                      </a>
                    </div>
                  </div>
                </Accordion>

                <Accordion title="Shipping Information">
                 <div>
  <p>
    Khatoon Collection is committed to delivering your healthcare products
    safely and on time across India. Orders are usually processed within
    1–2 business days after payment confirmation.
  </p>

  <ul>
    <li>Shipping is available only within India.</li>
    <li>Orders placed on weekends or holidays are processed next business day.</li>
    <li>Delivery generally takes 3–7 business days depending on location.</li>
    <li>Shipping charges are calculated during checkout.</li>
    <li>Tracking details are shared through email or SMS after dispatch.</li>
    <li>
      Delivery timelines may vary due to weather conditions, courier delays,
      or remote locations.
    </li>
    <li>
      For delayed or lost shipments, customers can contact our support team
      for assistance.
    </li>
  </ul>

  <p>
    For shipping-related queries, please connect with us on WhatsApp (+91 90226 68127).
  </p>
</div>
                </Accordion>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== RELATED ===================== */}
        {related?.length ? (
          <div className="mt-20">
            <h2 className="text-center text-[28px] font-semibold uppercase tracking-[0.08em] text-[#3a2c2c]">
              You May Also Like
            </h2>

            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {related.slice(0, 5).map((p: any) => (
                <RelatedFashionCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        ) : null}
      </div>

     {/* ================= MOBILE STICKY CTA ================= */}


    </div>
  );
}