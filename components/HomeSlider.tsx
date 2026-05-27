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
  // 🚀 Core responsive slides (designed & crop-protected files)
  const slides = useMemo<Slide[]>(() => {
    return [
      {
        desktopImageUrl: "/slider/khatoon_desktop_banner_clean.png",
        mobileImageUrl: "/slider/khatoon_mobile_banner.png",
        ctaHref: "/products",
      },
    ];
  }, []);

  if (!slides || slides.length === 0) return null;

  return (
    <>
      {/*
        DESKTOP: The banner image is a landscape 16:9 wide image.
        We use a padding-top trick (aspect-ratio: 16/5.5) so the container
        height auto-sizes to the image proportions — zero cropping guaranteed.

        MOBILE: Portrait banner uses full dynamic viewport height minus the
        mobile header height (92px) so it fills the screen top-to-bottom.
      */}
      <style>{`
        /* Desktop slider: aspect-ratio-driven height — no cropping */
        .slider-desktop-wrap {
          position: relative;
          width: 100%;
          /* matches the banner's own aspect ratio: ~1920 x 600 ≈ 16:5 */
          padding-top: 31.25%; /* 600/1920 = 0.3125 */
        }

        /* Mobile slider: full viewport height minus header */
        .slider-mobile-wrap {
          position: relative;
          width: 100%;
          height: calc(100dvh - 92px);
        }

        /* Swiper must fill its wrapper */
        .home-swiper,
        .home-swiper .swiper-wrapper,
        .home-swiper .swiper-slide {
          width: 100%;
          height: 100%;
        }
      `}</style>

      {/* ── DESKTOP (md and above) ─────────────────────────────── */}
      <div className="hidden md:block w-full overflow-hidden">
        <div className="slider-desktop-wrap">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation={slides.length > 1}
            pagination={slides.length > 1 ? { clickable: true } : false}
            autoplay={slides.length > 1 ? { delay: 4000, disableOnInteraction: false } : false}
            loop={slides.length > 1}
            className="home-swiper absolute inset-0"
          >
            {slides.map((slide, index) => {
              const href = slide.ctaHref || "#";
              const clickable = href !== "#";
              return (
                <SwiperSlide key={`desktop-${index}`} className="relative w-full h-full">
                  {clickable ? (
                    <Link href={href} className="block w-full h-full">
                      <Image
                        src={slide.desktopImageUrl}
                        alt={`Desktop Slide ${index + 1}`}
                        fill
                        priority={index === 0}
                        sizes="100vw"
                        className="object-cover object-center"
                      />
                    </Link>
                  ) : (
                    <Image
                      src={slide.desktopImageUrl}
                      alt={`Desktop Slide ${index + 1}`}
                      fill
                      priority={index === 0}
                      sizes="100vw"
                      className="object-cover object-center"
                    />
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

      {/* ── MOBILE (below md) ──────────────────────────────────── */}
      <div className="block md:hidden w-full overflow-hidden">
        <div className="slider-mobile-wrap">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation={false}
            pagination={slides.length > 1 ? { clickable: true } : false}
            autoplay={slides.length > 1 ? { delay: 4000, disableOnInteraction: false } : false}
            loop={slides.length > 1}
            className="home-swiper absolute inset-0"
          >
            {slides.map((slide, index) => {
              const href = slide.ctaHref || "#";
              const clickable = href !== "#";
              return (
                <SwiperSlide key={`mobile-${index}`} className="relative w-full h-full">
                  {clickable ? (
                    <Link href={href} className="block w-full h-full">
                      <Image
                        src={slide.mobileImageUrl}
                        alt={`Mobile Slide ${index + 1}`}
                        fill
                        priority={index === 0}
                        sizes="100vw"
                        className="object-cover object-center"
                      />
                    </Link>
                  ) : (
                    <Image
                      src={slide.mobileImageUrl}
                      alt={`Mobile Slide ${index + 1}`}
                      fill
                      priority={index === 0}
                      sizes="100vw"
                      className="object-cover object-center"
                    />
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </>
  );
}
