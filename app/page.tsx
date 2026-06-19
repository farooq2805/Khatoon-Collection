import HomeSlider from "@/components/HomeSlider";
import CategoryStrip from "@/components/home/CategoryStrip";
import TwoBannerGrid from "@/components/home/TwoBannerGrid";
import NewArrivalsClearance from "@/components/home/NewArrivalsClearance";
import ServicePaymentSection from "@/components/ServicePaymentSection";
import InstagramReels from "@/components/home/InstagramReels";
import ReviewsSection from "@/components/home/ReviewsSection";
import { reportSystemError } from "@/utils/errorHandler";

// Enable Incremental Static Regeneration (ISR) - Rebuilds page in background every 1 hour
export const revalidate = 3600;

async function fetchWithReporting(url: string, tag: string) {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }
    return await res.json();
  } catch (e: any) {
    console.error(`❌ Fetching ${tag} failed:`, e);
    // Report error asynchronously to backend API (to trigger email notification)
    reportSystemError(`Homepage Fetch - ${tag}`, e, { url });
    return null;
  }
}

async function getHomeData() {
  const api = process.env.NEXT_PUBLIC_API_URL || "https://api.khatooncollection.in/api";

  try {
    // Parallel fetching on the server with revalidate tag (cache-friendly)
    const [sliderRes, catRes, bannerRes, productsRes] = await Promise.all([
      fetchWithReporting(`${api}/home-slider`, "home-slider"),
      fetchWithReporting(`${api}/categories`, "categories"),
      fetchWithReporting(`${api}/banner-grid`, "banner-grid"),
      fetchWithReporting(`${api}/publicproducts?limit=40`, "publicproducts"),
    ]);

    return {
      sliderData: sliderRes?.data || null,
      categoriesData: Array.isArray(catRes?.data) ? catRes.data : [],
      bannerData: bannerRes?.data || null,
      productsData: Array.isArray(productsRes?.data) ? productsRes.data : [],
    };
  } catch (e) {
    console.error("❌ Failed to pre-fetch home data on server:", e);
    reportSystemError("Homepage Fetch Parallel Wrapper", e);
    return {
      sliderData: null,
      categoriesData: [],
      bannerData: null,
      productsData: [],
    };
  }
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
