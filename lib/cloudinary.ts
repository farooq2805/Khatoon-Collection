/**
 * Inserts Cloudinary optimization parameters (f_auto, q_auto, width) into Cloudinary image URLs.
 * Example:
 * Input: https://res.cloudinary.com/techsrow/image/upload/v1783544426/categories/IMG_0786_urgvez.png
 * Output: https://res.cloudinary.com/techsrow/image/upload/f_auto,q_auto,w_800,c_limit/v1783544426/categories/IMG_0786_urgvez.png
 */
export function getOptimizedImageUrl(url?: string | null, width = 800, quality = "auto"): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  // Only transform Cloudinary URLs
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  // Avoid duplicating transformations if already present
  if (url.includes("/f_auto") || url.includes("/q_auto")) {
    return url;
  }

  const transformParams = `f_auto,q_${quality},w_${width},c_limit`;
  return url.replace("/upload/", `/upload/${transformParams}/`);
}
