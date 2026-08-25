"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
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
  const slides = useMemo<Slide[]>(() => {
    if (Array.isArray(initialData) && initialData.length > 0) {
      return initialData.map((item: any) => ({
        desktopImageUrl: item.desktopImageUrl || item.imageUrl || "/slider/khatoon_desktop_banner_clean.png",
        mobileImageUrl: item.mobileImageUrl || item.desktopImageUrl || item.imageUrl || "/slider/khatoon_mobile_banner.png",
        ctaHref: item.ctaHref || item.linkUrl || "/products",
      }));
    }
    return [
      {
        desktopImageUrl: "/slider/khatoon_desktop_banner_clean.png",
        mobileImageUrl: "/slider/khatoon_mobile_banner.png",
        ctaHref: "/products",
      },
    ];
  }, [initialData]);

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
            const rawMobile = slide.mobileImageUrl || slide.desktopImageUrl || "/slider/khatoon_mobile_banner.png";
            const rawDesktop = slide.desktopImageUrl || "/slider/khatoon_desktop_banner_clean.png";
            const mobileSrc = getOptimizedImageUrl(rawMobile, 800);
            const desktopSrc = getOptimizedImageUrl(rawDesktop, 1920);

            const inner = (
              <picture>
                {/* Mobile source (max-width: 767px) */}
                <source
                  media="(max-width: 767px)"
                  srcSet={mobileSrc}
                />
                {/* Desktop source (min-width: 768px) */}
                <source
                  media="(min-width: 768px)"
                  srcSet={desktopSrc}
                />
                {/* Fallback img */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={desktopSrc}
                  alt="Khatoon Collection — Premium Ethnic Wear"
                  className="absolute inset-0 w-full h-full object-cover object-center md:object-top"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "low"}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/slider/khatoon_desktop_banner_clean.png";
                  }}
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
                      href={mobileSrc}
                      media="(max-width: 767px)"
                    />
                    <link
                      rel="preload"
                      as="image"
                      href={desktopSrc}
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
