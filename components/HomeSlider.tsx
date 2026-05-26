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
    
    return desktopSlides;
  }, [isMobile, desktopSlides, mobileSlides, error]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="w-full relative aspect-[2/3] md:aspect-[25/8] overflow-hidden bg-gray-100">
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
                    className="object-cover"
                  />
                </Link>
              ) : (
                <Image
                  src={slide.imageUrl}
                  alt={`Slide ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
