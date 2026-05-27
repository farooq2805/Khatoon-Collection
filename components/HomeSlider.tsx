// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Pagination, Autoplay } from "swiper/modules";

// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";
// import { Link } from "lucide-react";

// type SliderItem = {
//   id: string;
//   imageUrl: string;
//   isActive: boolean;
//   sortOrder: number;
//   ctaHref : string;

// };

// type ApiResponse = {
//   success: boolean;
//   data: {
//     desktop: SliderItem[];
//     mobile: SliderItem[];
//   };
// };

// export default function HomeSlider() {
//   const [isMobile, setIsMobile] = useState(false);
//   const [desktopSlides, setDesktopSlides] = useState<string[] | null>(null);
//   const [mobileSlides, setMobileSlides] = useState<string[] | null>(null);
//   const [error, setError] = useState(false);

//   // 📱 Detect device
//   useEffect(() => {
//     const mq = window.matchMedia("(max-width: 767px)");
//     const update = () => setIsMobile(mq.matches);
//     update();
//     mq.addEventListener("change", update);
//     return () => mq.removeEventListener("change", update);
//   }, []);

//   // 🌐 Fetch slider data
//   useEffect(() => {
//     let mounted = true;

//     (async () => {
//       try {
//         const res = await fetch("https://api.khatooncollection.in/api/home-slider", {
//           cache: "no-store",
//         });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const json = (await res.json()) as ApiResponse;

//         const normalize = (items: SliderItem[] | undefined) =>
//           (Array.isArray(items) ? items : [])
//             .filter((x) => x?.isActive === true)
//             .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
//             .map((x) => x.imageUrl)
//             .filter(Boolean);

//         if (!mounted) return;

//         setDesktopSlides(normalize(json?.data?.desktop));
//         setMobileSlides(normalize(json?.data?.mobile));
//       } catch {
//         if (!mounted) return;
//         setError(true);
//       }
//     })();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // ⏳ Wait until API resolves
//   const slides = useMemo(() => {
//     if (error) return null;
//     if (!desktopSlides || !mobileSlides) return null;
//     return isMobile ? mobileSlides : desktopSlides;
//   }, [isMobile, desktopSlides, mobileSlides, error]);

//   // 🛑 Nothing renders until API is ready
//   if (!slides || slides.length === 0) return null;

//   return (
//     <div className="w-full relative">
//       <Swiper
//         modules={[Navigation, Pagination, Autoplay]}
//         navigation
//         pagination={{ clickable: true }}
//         autoplay={{ delay: 4000, disableOnInteraction: false }}
//         loop
//         className="w-full"
//       >
//         {slides.map((src, index) => (
//           <SwiperSlide key={`${src}-${index}`}>
//             <Link href={ctaHref}>
//             <img src={src}  alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
//             </Link>
//           </SwiperSlide>
//         ))}
//       </Swiper>
//     </div>
//   );
// }

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
      }
    ];
  }, []);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="w-full relative overflow-hidden bg-gray-100 h-[calc(100dvh-92px)] md:h-[calc(100vh-102px)]">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={slides.length > 1}
        pagination={slides.length > 1 ? { clickable: true } : false}
        autoplay={slides.length > 1 ? { delay: 4000, disableOnInteraction: false } : false}
        loop={slides.length > 1}
        className="w-full h-full"
      >
        {slides.map((slide, index) => {
          const href = slide.ctaHref || "#";
          const clickable = href !== "#";

          return (
            <SwiperSlide key={`${index}`} className="relative w-full h-full">
              {clickable ? (
                <Link href={href} className="block relative w-full h-full">
                  {/* Widescreen Desktop / Tablet Banner Layout (Optimized, full-bleed & crop-safe) */}
                  <div className="hidden md:block relative w-full h-full">
                    <Image
                      src={slide.desktopImageUrl}
                      alt={`Desktop Slide ${index + 1}`}
                      fill
                      priority={index === 0}
                      sizes="100vw"
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Portrait Mobile Banner Layout (Optimized & crop-safe) */}
                  <div className="block md:hidden relative w-full h-full">
                    <Image
                      src={slide.mobileImageUrl}
                      alt={`Mobile Slide ${index + 1}`}
                      fill
                      priority={index === 0}
                      sizes="100vw"
                      className="object-cover object-center"
                    />
                  </div>
                </Link>
              ) : (
                <div className="relative w-full h-full">
                  {/* Widescreen Desktop / Tablet Banner Layout */}
                  <div className="hidden md:block relative w-full h-full">
                    <Image
                      src={slide.desktopImageUrl}
                      alt={`Desktop Slide ${index + 1}`}
                      fill
                      priority={index === 0}
                      sizes="100vw"
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Portrait Mobile Banner Layout */}
                  <div className="block md:hidden relative w-full h-full">
                    <Image
                      src={slide.mobileImageUrl}
                      alt={`Mobile Slide ${index + 1}`}
                      fill
                      priority={index === 0}
                      sizes="100vw"
                      className="object-cover object-center"
                    />
                  </div>
                </div>
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
