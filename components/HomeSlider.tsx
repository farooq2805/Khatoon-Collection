"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Slide = {
  desktopImageUrl: string;
  mobileImageUrl: string;
  ctaHref: string;
};

export default function HomeSlider({ initialData }: { initialData?: any }) {
  const slides = useMemo<Slide[]>(() => [
    {
      desktopImageUrl: "/slider/khatoon_desktop_banner_clean.png",
      mobileImageUrl:  "/slider/khatoon_mobile_banner.png",
      ctaHref: "/products",
    },
  ], []);

  if (!slides.length) return null;

  return (
    <>
      <style>{`
        /*
         * Banner fills exactly one viewport so the next section arrives
         * on a single scroll — desktop uses vh, mobile uses dvh.
         */
        .kc-banner {
          width: 100%;
          height: calc(100vh - 102px);   /* desktop: minus desktop header */
          overflow: hidden;
          position: relative;
        }
        @media (max-width: 767px) {
          .kc-banner {
            height: calc(100dvh - 92px); /* mobile: minus mobile header */
          }
        }

        /* Swiper fills the wrapper */
        .kc-banner .swiper,
        .kc-banner .swiper-wrapper,
        .kc-banner .swiper-slide {
          height: 100% !important;
          width: 100%;
        }

        /* Each slide is a positioned container */
        .kc-banner .swiper-slide {
          position: relative;
        }

        /* Desktop image: visible ≥ 768px */
        .kc-banner-img-desktop {
          display: block;
          object-fit: cover;
          object-position: top center;
        }
        @media (max-width: 767px) {
          .kc-banner-img-desktop { display: none; }
        }

        /* Mobile image: visible < 768px */
        .kc-banner-img-mobile {
          display: none;
          object-fit: cover;
          object-position: top center;
        }
        @media (max-width: 767px) {
          .kc-banner-img-mobile { display: block; }
        }
      `}</style>

      <div className="kc-banner">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation={slides.length > 1}
          pagination={slides.length > 1 ? { clickable: true } : false}
          autoplay={
            slides.length > 1
              ? { delay: 4500, disableOnInteraction: false }
              : false
          }
          loop={slides.length > 1}
        >
          {slides.map((slide, index) => {
            const href = slide.ctaHref || "#";
            const inner = (
              <>
                {/* Desktop banner */}
                <Image
                  src={slide.desktopImageUrl}
                  alt="Khatoon Collection — Premium Ethnic Wear"
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="kc-banner-img-desktop"
                />
                {/* Mobile banner */}
                <Image
                  src={slide.mobileImageUrl}
                  alt="Khatoon Collection — Premium Ethnic Wear"
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="kc-banner-img-mobile"
                />
              </>
            );

            return (
              <SwiperSlide key={index}>
                {href !== "#" ? (
                  <Link
                    href={href}
                    style={{ display: "block", width: "100%", height: "100%", position: "relative" }}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div style={{ width: "100%", height: "100%", position: "relative" }}>
                    {inner}
                  </div>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </>
  );
}
