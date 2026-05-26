import HomeSlider from "@/components/HomeSlider";
import CategoryStrip from "@/components/home/CategoryStrip";
import TwoBannerGrid from "@/components/home/TwoBannerGrid";
import NewArrivalsClearance from "@/components/home/NewArrivalsClearance";
import ServicePaymentSection from "@/components/ServicePaymentSection";
import InstagramReels from "@/components/home/InstagramReels";
import ReviewsSection from "@/components/home/ReviewsSection";

// Enable Incremental Static Regeneration (ISR) - Rebuilds page in background every 1 hour
export const revalidate = 3600;

async function getHomeData() {
  const api = process.env.NEXT_PUBLIC_API_URL || "https://api.khatooncollection.in/api";

  try {
    // Parallel fetching on the server with revalidate tag (cache-friendly)
    const [sliderRes, catRes, bannerRes, productsRes] = await Promise.all([
      fetch(`${api}/home-slider`, { next: { revalidate: 3600 } }).then((r) => r.json()).catch(() => null),
      fetch(`${api}/categories`, { next: { revalidate: 3600 } }).then((r) => r.json()).catch(() => null),
      fetch(`${api}/banner-grid`, { next: { revalidate: 3600 } }).then((r) => r.json()).catch(() => null),
      fetch(`${api}/publicproducts?limit=40`, { next: { revalidate: 3600 } }).then((r) => r.json()).catch(() => null),
    ]);

    return {
      sliderData: sliderRes?.data || null,
      categoriesData: Array.isArray(catRes?.data) ? catRes.data : [],
      bannerData: bannerRes?.data || null,
      productsData: Array.isArray(productsRes?.data) ? productsRes.data : [],
    };
  } catch (e) {
    console.error("❌ Failed to pre-fetch home data on server:", e);
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
