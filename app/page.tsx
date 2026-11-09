import HomeSlider from "@/components/HomeSlider";
import CategoryStrip from "@/components/home/CategoryStrip";
import TwoBannerGrid from "@/components/home/TwoBannerGrid";
import NewArrivalsClearance from "@/components/home/NewArrivalsClearance";
import ServicePaymentSection from "@/components/ServicePaymentSection";
import InstagramReels from "@/components/home/InstagramReels";
import HandpickedSection, { type HandpickedProduct } from "@/components/home/HandpickedSection";
import { getInstagramFeed } from "@/lib/instagram";
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

// "Handpicked For You": these featured suits first, topped up from the
// Premium Branded collection so the row always has products in it.
const HANDPICKED_SLUGS = [
  "mocha-brown-embroidered-farshi-suit-set",
  "black-embroidered-farshi-suit-set",
  "navy-blue-embroidered-farshi-suit-set",
  "maroon-embroidered-farshi-suit-set",
];
const HANDPICKED_FILL_CATEGORY = "premium-branded-collection";
const HANDPICKED_COUNT = 8;

function toHandpicked(p: any): HandpickedProduct | null {
  const image = p?.mainImageUrl || p?.imageUrl || p?.images?.[0]?.url;
  const price = Number(p?.discountPrice || p?.price);
  if (!p?.slug || !image || !price || p.isActive === false) return null;
  return { id: p.id, name: p.name, slug: p.slug, image, price };
}

async function getHandpicked(): Promise<HandpickedProduct[]> {
  const api = process.env.NEXT_PUBLIC_API_URL || "https://api.khatooncollection.in/api";
  const [featured, fill] = await Promise.all([
    Promise.all(
      HANDPICKED_SLUGS.map((slug) =>
        fetchWithReporting(`${api}/publicproducts/slug/${slug}`, `handpicked-${slug}`)
      )
    ),
    fetchWithReporting(
      `${api}/publicproducts?limit=${HANDPICKED_COUNT}&category=${HANDPICKED_FILL_CATEGORY}`,
      "handpicked-fill"
    ),
  ]);

  const out: HandpickedProduct[] = [];
  const seen = new Set<string>();
  for (const p of [...featured.map((r) => r?.data), ...(Array.isArray(fill?.data) ? fill.data : [])]) {
    const item = toHandpicked(p);
    if (item && !seen.has(item.slug)) {
      seen.add(item.slug);
      out.push(item);
    }
  }
  return out.slice(0, HANDPICKED_COUNT);
}

export default async function HomePage() {
  const [{ sliderData, categoriesData, bannerData, productsData }, instagramFeed, handpicked] = await Promise.all([
    getHomeData(),
    getInstagramFeed(6),
    getHandpicked(),
  ]);

  return (
    <main>
      <HomeSlider initialData={sliderData} />
      <CategoryStrip initialData={categoriesData} />
      <TwoBannerGrid initialData={bannerData} />
      <NewArrivalsClearance initialData={productsData} />
      <InstagramReels feed={instagramFeed} />
      <HandpickedSection products={handpicked} />
      <ServicePaymentSection />
    </main>
  );
}
