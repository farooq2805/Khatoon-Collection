import type { MetadataRoute } from "next";

// Keep crawlers on real pages; filter/sort query combinations and private
// routes otherwise generate endless server-rendered requests.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/account",
          "/cart",
          "/checkout",
          "/order-success",
          "/thank-you",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/products?*sort=",
          "/products?*page=",
          "/products?*price",
          "/products?*size",
          "/products?*color",
        ],
      },
    ],
    host: "https://khatooncollection.in",
  };
}
