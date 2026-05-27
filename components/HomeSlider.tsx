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
  /** Natural pixel dimensions of the desktop image */
  desktopW: number;
  desktopH: number;
  /** Natural pixel dimensions of the mobile image */
  mobileW: number;
  mobileH: number;
  ctaHref: string;
};

export default function HomeSlider({ initialData }: { initialData?: any }) {
  const slides = useMemo<Slide[]>(() => [
    {
      desktopImageUrl: "/slider/khatoon_desktop_banner_clean.png",
      mobileImageUrl:  "/slider/khatoon_mobile_banner.png",
      // actual image dimensions — drives natural aspect ratio (no cropping)
      desktopW: 1920,
      desktopH: 680,
      mobileW:  1024,
      mobileH:  1330,
      ctaHref: "/products",
    },
  ], []);

  if (!slides.length) return null;

  return (
    <div className="w-full overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={slides.length > 1}
        pagination={slides.length > 1 ? { clickable: true } : false}
        autoplay={slides.length > 1 ? { delay: 4000, disableOnInteraction: false } : false}
        loop={slides.length > 1}
        className="w-full"
      >
        {slides.map((slide, index) => {
          const href = slide.ctaHref || "#";

          return (
            <SwiperSlide key={index} className="w-full">
              {href !== "#" ? (
                <Link href={href} className="block w-full">
                  {/* ── Desktop image (hidden on mobile) ── */}
                  <Image
                    src={slide.desktopImageUrl}
                    alt={`Khatoon Collection Banner ${index + 1}`}
                    width={slide.desktopW}
                    height={slide.desktopH}
                    priority={index === 0}
                    sizes="100vw"
                    className="hidden md:block w-full h-auto"
                    style={{ display: undefined }} /* let className control display */
                  />

                  {/* ── Mobile image (hidden on desktop) ── */}
                  <Image
                    src={slide.mobileImageUrl}
                    alt={`Khatoon Collection Banner Mobile ${index + 1}`}
                    width={slide.mobileW}
                    height={slide.mobileH}
                    priority={index === 0}
                    sizes="100vw"
                    className="block md:hidden w-full h-auto"
                    style={{ display: undefined }}
                  />
                </Link>
              ) : (
                <>
                  <Image
                    src={slide.desktopImageUrl}
                    alt={`Khatoon Collection Banner ${index + 1}`}
                    width={slide.desktopW}
                    height={slide.desktopH}
                    priority={index === 0}
                    sizes="100vw"
                    className="hidden md:block w-full h-auto"
                  />
                  <Image
                    src={slide.mobileImageUrl}
                    alt={`Khatoon Collection Banner Mobile ${index + 1}`}
                    width={slide.mobileW}
                    height={slide.mobileH}
                    priority={index === 0}
                    sizes="100vw"
                    className="block md:hidden w-full h-auto"
                  />
                </>
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
