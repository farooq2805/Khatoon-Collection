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
    id: "DbL8FQLsd_2",
    reelUrl: "https://www.instagram.com/reel/DbL8FQLsd_2/",
    embedUrl: "https://www.instagram.com/reel/DbL8FQLsd_2/embed/",
    videoUrl: "https://videos.pexels.com/video-files/5302830/5302830-sd_540_960_25fps.mp4",
    thumbnail: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600&h=800",
    caption: "Khatoon Collection 3 Store Open 🎉",
    views: "125K",
    likes: "18.4K",
    productLink: "/products",
    productName: "New Collection",
    price: "₹1,899",
  },
  {
    id: "DbLP4ccTWp0",
    reelUrl: "https://www.instagram.com/reel/DbLP4ccTWp0/",
    embedUrl: "https://www.instagram.com/reel/DbLP4ccTWp0/embed/",
    videoUrl: "https://videos.pexels.com/video-files/6044738/6044738-sd_540_960_24fps.mp4",
    thumbnail: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600&h=800",
    caption: "Exclusive New Arrivals Showcase 🔥",
    views: "98K",
    likes: "12.3K",
    productLink: "/products",
    productName: "New Arrivals",
    price: "₹2,499",
  },
  {
    id: "DbKucSUsh3K",
    reelUrl: "https://www.instagram.com/reel/DbKucSUsh3K/",
    embedUrl: "https://www.instagram.com/reel/DbKucSUsh3K/embed/",
    videoUrl: "https://videos.pexels.com/video-files/8088924/8088924-sd_540_960_25fps.mp4",
    thumbnail: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600&h=800",
    caption: "Special Designer Salwar Suit Collection ✨",
    views: "154K",
    likes: "22.1K",
    productLink: "/products",
    productName: "Designer Suit",
    price: "₹3,299",
  },
  {
    id: "DbG2P7ssRrE",
    reelUrl: "https://www.instagram.com/reel/DbG2P7ssRrE/",
    embedUrl: "https://www.instagram.com/reel/DbG2P7ssRrE/embed/",
    videoUrl: "https://videos.pexels.com/video-files/5706275/5706275-sd_540_960_30fps.mp4",
    thumbnail: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=600&h=800",
    caption: "Heavy Embroidered Party Wear Collection 👑",
    views: "72K",
    likes: "9.8K",
    productLink: "/products",
    productName: "Party Wear",
    price: "₹1,299",
  },
  {
    id: "DbEQsbdsZv3",
    reelUrl: "https://www.instagram.com/reel/DbEQsbdsZv3/",
    embedUrl: "https://www.instagram.com/reel/DbEQsbdsZv3/embed/",
    videoUrl: "https://videos.pexels.com/video-files/6982928/6982928-sd_540_960_25fps.mp4",
    thumbnail: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=600&h=800",
    caption: "Pure Cotton Daily Wear Suits 🌿",
    views: "112K",
    likes: "15.6K",
    productLink: "/products",
    productName: "Cotton Daily Set",
    price: "₹1,999",
  },
  {
    id: "DbBwDQXTeWc",
    reelUrl: "https://www.instagram.com/reel/DbBwDQXTeWc/",
    embedUrl: "https://www.instagram.com/reel/DbBwDQXTeWc/embed/",
    videoUrl: "https://videos.pexels.com/video-files/7011400/7011400-sd_540_960_25fps.mp4",
    thumbnail: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600&h=800",
    caption: "Trending Lawn Cotton Collection 🌸",
    views: "185K",
    likes: "25.2K",
    productLink: "/products",
    productName: "Lawn Cotton Suit",
    price: "₹2,799",
  },
];

// Set to "" to use native database/Cloudinary reels with unlimited free views.
export const BEHOLD_FEED_ID = "";

