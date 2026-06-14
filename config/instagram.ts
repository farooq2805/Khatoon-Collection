/**
 * 📢 HOW TO ADD YOUR OWN INSTAGRAM REELS (STEP-BY-STEP):
 * 
 * To show your own Instagram videos instead of the placeholders, follow these 3 simple steps:
 * 
 * 1️⃣ DOWNLOAD YOUR REEL VIDEOS:
 *    - Open your reel on Instagram (e.g. https://www.instagram.com/reel/DE-9U9yyZ4m/)
 *    - Copy the link and download the .mp4 file using a free online Downloader (like SnapInsta.app or SaveInsta.app).
 * 
 * 2️⃣ UPLOAD TO YOUR WEBSITES FILES (2 OPTIONS):
 *    - 🔹 OPTION A (Easiest & Free): Copy the downloaded .mp4 file directly into the project's "public" folder.
 *      For example: Save it as "public/reels/my_reel_1.mp4".
 *      Then set: videoUrl: "/reels/my_reel_1.mp4"
 * 
 *    - 🔹 OPTION B (Cloudinary): Upload the video to your Cloudinary media library.
 *      Then set: videoUrl: "https://res.cloudinary.com/techsrow/video/upload/v.../my_reel.mp4"
 * 
 * 3️⃣ UPDATE THE CONFIG BELOW:
 *    - Update the metadata below (reelUrl, videoUrl, thumbnail, caption, and featured product links).
 */

export interface ReelItem {
  id: string;
  reelUrl: string;       // Link to the real post on your Instagram profile (opens in new tab)
  embedUrl: string;      // Embed url (optional backup)
  videoUrl: string;      // Path to your direct .mp4 file (e.g., "/reels/my-video.mp4" or Cloudinary link)
  thumbnail: string;     // Thumbnail image (Cloudinary link or local path like "/reels/my-thumb.jpg")
  caption: string;       // Text caption shown below the card
  views: string;         // Views count (e.g., "125K")
  likes: string;         // Likes count (e.g., "18.4K")
  productLink?: string;  // Featured product slug/link (e.g., "/products/anarkali-suit")
  productName?: string;  // Name of featured product
  price?: string;        // Price of featured product
}

export const INSTAGRAM_REELS: ReelItem[] = [
  {
    id: "reel_1",
    reelUrl: "https://www.instagram.com/reel/DE-9U9yyZ4m/",
    embedUrl: "https://www.instagram.com/reel/DE-9U9yyZ4m/embed",
    videoUrl: "https://videos.pexels.com/video-files/5302830/5302830-sd_540_960_25fps.mp4", // Change to "/reels/my_reel_1.mp4"
    thumbnail: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600&h=800", // Change to your thumbnail
    caption: "Graceful Pastel Salwar Suit Set ✨ Perfect for summer festive occasions.",
    views: "125K",
    likes: "18.4K",
    productLink: "/products",
    productName: "Pastel Salwar Suit",
    price: "₹1,899"
  },
  {
    id: "reel_2",
    reelUrl: "https://www.instagram.com/reel/C-VfP9jS5z8/",
    embedUrl: "https://www.instagram.com/reel/C-VfP9jS5z8/embed",
    videoUrl: "https://videos.pexels.com/video-files/6044738/6044738-sd_540_960_24fps.mp4",
    thumbnail: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600&h=800",
    caption: "Heavy Embroidered Anarkali Kurti 🌸 Swirl ready styles are back!",
    views: "98K",
    likes: "12.3K",
    productLink: "/products",
    productName: "Anarkali Kurti Set",
    price: "₹2,499"
  },
  {
    id: "reel_3",
    reelUrl: "https://www.instagram.com/reel/C7r8BvIyU2V/",
    embedUrl: "https://www.instagram.com/reel/C7r8BvIyU2V/embed",
    videoUrl: "https://videos.pexels.com/video-files/8088924/8088924-sd_540_960_25fps.mp4",
    thumbnail: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600&h=800",
    caption: "The Ultimate Royal Velvet Collection 👑 Pure elegance and comfort.",
    views: "154K",
    likes: "22.1K",
    productLink: "/products",
    productName: "Royal Velvet Suit",
    price: "₹3,299"
  },
  {
    id: "reel_4",
    reelUrl: "https://www.instagram.com/reel/C6yvP9LyU7N/",
    embedUrl: "https://www.instagram.com/reel/C6yvP9LyU7N/embed",
    videoUrl: "https://videos.pexels.com/video-files/5706275/5706275-sd_540_960_30fps.mp4",
    thumbnail: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=600&h=800",
    caption: "Chic Cotton Dailywear Suits 🌿 Breathable fabrics for everyday grace.",
    views: "72K",
    likes: "9.8K",
    productLink: "/products",
    productName: "Cotton Daily Set",
    price: "₹1,299"
  },
  {
    id: "reel_5",
    reelUrl: "https://www.instagram.com/reel/C5zvBvLSy6V/",
    embedUrl: "https://www.instagram.com/reel/C5zvBvLSy6V/embed",
    videoUrl: "https://videos.pexels.com/video-files/6982928/6982928-sd_540_960_25fps.mp4",
    thumbnail: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=600&h=800",
    caption: "Trending Floral Organza Dupatta Sets 🌺 Feel the breeze in style.",
    views: "112K",
    likes: "15.6K",
    productLink: "/products",
    productName: "Floral Organza Set",
    price: "₹1,999"
  },
  {
    id: "reel_6",
    reelUrl: "https://www.instagram.com/reel/C4yvBvIyS8M/",
    embedUrl: "https://www.instagram.com/reel/C4yvBvIyS8M/embed",
    videoUrl: "https://videos.pexels.com/video-files/7011400/7011400-sd_540_960_25fps.mp4",
    thumbnail: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600&h=800",
    caption: "Deep Wine Partywear Suit 🍷 Make heads turn at every party.",
    views: "185K",
    likes: "25.2K",
    productLink: "/products",
    productName: "Deep Wine Suit",
    price: "₹2,799"
  },
  {
    id: "reel_7",
    reelUrl: "https://www.instagram.com/reel/C3yvP9LyU8A/",
    embedUrl: "https://www.instagram.com/reel/C3yvP9LyU8A/embed",
    videoUrl: "https://videos.pexels.com/video-files/7650392/7650392-sd_540_960_30fps.mp4",
    thumbnail: "https://images.unsplash.com/photo-1610030470214-e0b4a4d64f0b?auto=format&fit=crop&q=80&w=600&h=800",
    caption: "Elegant Lucknowi Chikankari Suits ✨ Fine hand-crafted details.",
    views: "89K",
    likes: "11.2K",
    productLink: "/products",
    productName: "Lucknowi Chikankari",
    price: "₹2,199"
  },
  {
    id: "reel_8",
    reelUrl: "https://www.instagram.com/reel/C2zvBvLSy9O/",
    embedUrl: "https://www.instagram.com/reel/C2zvBvLSy9O/embed",
    videoUrl: "https://videos.pexels.com/video-files/7140788/7140788-sd_540_960_25fps.mp4",
    thumbnail: "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=600&h=800",
    caption: "Classic Mustard Haldi Outfits 💛 Bright, joyful, and stunningly traditional.",
    views: "142K",
    likes: "19.8K",
    productLink: "/products",
    productName: "Classic Mustard Suit",
    price: "₹1,799"
  }
];

// ── AUTOMATED INSTAGRAM REELS (BEHOLD.SO) ──
// To automatically display your 4 most recent Instagram reels:
// 1. Create a free account at https://behold.so/
// 2. Link your Instagram profile and create a widget
// 3. Paste the Feed ID from Behold here (e.g. "abcDE123fgh")
// Set to "" to fall back to your dashboard/JSON manual reels management.
export const BEHOLD_FEED_ID = "";

