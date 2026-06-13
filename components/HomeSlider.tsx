"use client";

import { useMemo } from "react";
import Link from "next/link";
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
            height: calc(100dvh - 98px); /* mobile: minus mobile header */
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
              <picture>
                {/* Mobile source (max-width: 767px) */}
                <source
                  media="(max-width: 767px)"
                  srcSet={`/_next/image?url=${encodeURIComponent(slide.mobileImageUrl)}&w=750&q=75`}
                />
                {/* Desktop source (min-width: 768px) */}
                <source
                  media="(min-width: 768px)"
                  srcSet={`/_next/image?url=${encodeURIComponent(slide.desktopImageUrl)}&w=1200&q=75`}
                />
                {/* Fallback img */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/_next/image?url=${encodeURIComponent(slide.desktopImageUrl)}&w=1200&q=75`}
                  alt="Khatoon Collection — Premium Ethnic Wear"
                  className="absolute inset-0 w-full h-full object-cover object-center md:object-top"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "low"}
                />
              </picture>
            );

            return (
              <SwiperSlide key={index}>
                {index === 0 && (
                  <>
                    <link
                      rel="preload"
                      as="image"
                      href={`/_next/image?url=${encodeURIComponent(slide.mobileImageUrl)}&w=750&q=75`}
                      media="(max-width: 767px)"
                    />
                    <link
                      rel="preload"
                      as="image"
                      href={`/_next/image?url=${encodeURIComponent(slide.desktopImageUrl)}&w=1200&q=75`}
                      media="(min-width: 768px)"
                    />
                  </>
                )}
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
