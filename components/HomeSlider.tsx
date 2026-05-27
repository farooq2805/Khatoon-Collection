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

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type SliderItem = {
  id: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  ctaHref: string;
};

type ApiResponse = {
  success: boolean;
  data: {
    desktop: SliderItem[];
    mobile: SliderItem[];
  };
};

type Slide = {
  imageUrl: string;
  ctaHref?: string;
};

export default function HomeSlider({ initialData }: { initialData?: any }) {
  const [isMobile, setIsMobile] = useState(false);
  const [desktopSlides, setDesktopSlides] = useState<Slide[] | null>(null);
  const [mobileSlides, setMobileSlides] = useState<Slide[] | null>(null);
  const [error, setError] = useState(false);

  // 📱 Detect device
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // 🌐 Load slider data (either from props or client-side fallback)
  useEffect(() => {
    if (initialData) {
      const normalize = (items: SliderItem[] | undefined): Slide[] =>
        (Array.isArray(items) ? items : [])
          .filter((x) => x?.isActive === true && !!x?.imageUrl)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((x) => ({
            imageUrl: x.imageUrl,
            ctaHref: (x.ctaHref || "").trim(),
          }));

      setDesktopSlides(normalize(initialData?.desktop));
      setMobileSlides(normalize(initialData?.mobile));
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await fetch("https://api.khatooncollection.in/api/home-slider", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = (await res.json()) as ApiResponse;

        const normalize = (items: SliderItem[] | undefined): Slide[] =>
          (Array.isArray(items) ? items : [])
            .filter((x) => x?.isActive === true && !!x?.imageUrl)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((x) => ({
              imageUrl: x.imageUrl,
              ctaHref: (x.ctaHref || "").trim(),
            }));

        if (!mounted) return;

        setDesktopSlides(normalize(json?.data?.desktop));
        setMobileSlides(normalize(json?.data?.mobile));
      } catch (e) {
        if (!mounted) return;
        setError(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [initialData]);

  // ⏳ Wait until API resolves
  const slides = useMemo(() => {
    if (error) return null;
    if (!desktopSlides || !mobileSlides) return null;
    
    if (isMobile) {
      return [
        {
          imageUrl: "/slider/khatoon_mobile_banner.png",
          ctaHref: "/products",
        }
      ];
    }
    
    return [
      {
        imageUrl: "/slider/khatoon_desktop_banner_clean.png",
        ctaHref: "/products",
      },
      {
        imageUrl: "/slider/khatoon_desktop_banner_full.png",
        ctaHref: "/products",
      }
    ];
  }, [isMobile, desktopSlides, mobileSlides, error]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className={`w-full relative overflow-hidden bg-gray-100 ${isMobile ? "h-[calc(100dvh-92px)]" : "h-[calc(100vh-102px)]"}`}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop
        className="w-full h-full"
      >
        {slides.map((slide, index) => {
          const href = slide.ctaHref || "#";
          const clickable = href !== "#";
          const isCleanDesktop = !isMobile && slide.imageUrl.includes("khatoon_desktop_banner_clean.png");

          return (
            <SwiperSlide key={`${slide.imageUrl}-${index}`} className="relative w-full h-full">
              {clickable ? (
                <Link href={href} className="block relative w-full h-full">
                  <Image
                    src={slide.imageUrl}
                    alt={`Slide ${index + 1}`}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className={isMobile ? "object-cover" : "object-cover object-center"}
                  />
                </Link>
              ) : (
                <Image
                  src={slide.imageUrl}
                  alt={`Slide ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className={isMobile ? "object-cover" : "object-cover object-center"}
                />
              )}

              {/* Responsive Text Overlay for Clean Desktop Banner */}
              {isCleanDesktop && (
                <div className="absolute right-[8%] lg:right-[12%] top-[50%] -translate-y-1/2 z-20 max-w-[45%] pointer-events-none select-none text-left">
                  <h2 
                    className="text-white text-5xl md:text-6xl lg:text-[76px] font-extrabold tracking-wider leading-[1.05] drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" 
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    KHATOON
                  </h2>
                  <h3 
                    className="text-[#d4af37] text-3xl md:text-4xl lg:text-[54px] italic font-semibold tracking-wide leading-none mt-2 mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Collection
                  </h3>
                  <p className="text-white/95 text-xs md:text-sm lg:text-base tracking-[0.3em] font-medium uppercase mb-8 drop-shadow-md">
                    EMBRACE MODEST ELEGANCE
                  </p>
                  <div className="inline-flex items-center border border-white text-white px-8 py-3.5 tracking-[0.25em] text-xs lg:text-sm font-semibold uppercase hover:bg-white hover:text-black transition-all duration-300 pointer-events-auto rounded-none drop-shadow-md">
                    EXPLORE NOW <span className="ml-2">&gt;</span>
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
