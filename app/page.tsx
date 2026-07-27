import HomeSlider from "@/components/HomeSlider";
import CategoryStrip from "@/components/home/CategoryStrip";
import TwoBannerGrid from "@/components/home/TwoBannerGrid";
import NewArrivalsClearance from "@/components/home/NewArrivalsClearance";
import ServicePaymentSection from "@/components/ServicePaymentSection";
import InstagramReels from "@/components/home/InstagramReels";
import ReviewsSection from "@/components/home/ReviewsSection";
import { reportSystemError } from "@/utils/errorHandler";

// Enable 60-second Incremental Static Regeneration for fast edge caching
export const revalidate = 60;

async function fetchWithReporting(url: string, tag: string) {
  try {
    const res = await fetch(url, {
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(8000), // 8s max — never hang
    });
    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }
    return await res.json();
  } catch (e: any) {
    console.error(`❌ Fetching ${tag} failed:`, e);
    // Report error asynchronously (fire-and-forget, don't await)
    reportSystemError(`Homepage Fetch - ${tag}`, e, { url }).catch(() => {});
    return null;
  }
}

async function getHomeData() {
  // Always use production API — NEXT_PUBLIC_ vars may be undefined during SSR on Vercel
  const api = process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "https://api.khatooncollection.in/api";

  // Run fetches in parallel, each independently guarded — one failure won't block others
  const [sliderRes, catRes, bannerRes, productsRes] = await Promise.all([
    fetchWithReporting(`${api}/home-slider`, "home-slider"),
    fetchWithReporting(`${api}/categories`, "categories"),
    fetchWithReporting(`${api}/banner-grid`, "banner-grid"),
    fetchWithReporting(`${api}/publicproducts?limit=16&sort=newest`, "publicproducts"),
  ]);

  return {
    sliderData: sliderRes?.data || null,
    categoriesData: Array.isArray(catRes?.data) ? catRes.data : [],
    bannerData: bannerRes?.data || null,
    productsData: Array.isArray(productsRes?.data) ? productsRes.data : [],
  };
}

export default async function HomePage() {
  const { sliderData, categoriesData, bannerData, productsData } = await getHomeData();

  return (
    <main>
      <HomeSlider initialData={sliderData} />
      <CategoryStrip initialData={categoriesData} />
      <TwoBannerGrid initialData={bannerData} />
      <NewArrivalsClearance initialData={productsData} />
      <InstagramReels />
      <ReviewsSection />
      <ServicePaymentSection />
    </main>
  );
}
