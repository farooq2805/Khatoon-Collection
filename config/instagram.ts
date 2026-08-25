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
    id: "DbYZGk5sndK",
    reelUrl: "https://www.instagram.com/reel/DbYZGk5sndK/?igsh=NncwMWxxeTBqdGVw",
    embedUrl: "https://www.instagram.com/reel/DbYZGk5sndK/embed/",
    videoUrl: "",
    thumbnail: "",
    caption: "Latest Collection Drop ✨",
    views: "180K",
    likes: "26K",
    productLink: "/products",
    productName: "New Arrival",
    price: "₹2,499",
  },
  {
    id: "DbXh3DRPpCt",
    reelUrl: "https://www.instagram.com/reel/DbXh3DRPpCt/?igsh=bWxxaHRwdXlocHF6",
    embedUrl: "https://www.instagram.com/reel/DbXh3DRPpCt/embed/",
    videoUrl: "",
    thumbnail: "",
    caption: "Exclusive Festive Wear 🎉",
    views: "155K",
    likes: "22K",
    productLink: "/products",
    productName: "Festive Collection",
    price: "₹2,199",
  },
  {
    id: "DbU9D8hI2OQ",
    reelUrl: "https://www.instagram.com/reel/DbU9D8hI2OQ/?igsh=MTJpd2o4cGN1ZGRjdg==",
    embedUrl: "https://www.instagram.com/reel/DbU9D8hI2OQ/embed/",
    videoUrl: "",
    thumbnail: "",
    caption: "Designer Suit Collection 👑",
    views: "130K",
    likes: "19K",
    productLink: "/products",
    productName: "Designer Collection",
    price: "₹2,799",
  },
];

// Set to "" to use native database/Cloudinary reels with unlimited free views.
export const BEHOLD_FEED_ID = "";

