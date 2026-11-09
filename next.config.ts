/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["react-icons"],
  compress: true,
  images: {
    unoptimized: true,
    domains: [
      "api.khatooncollection.in",
      "www.khatooncollection.in",
      "khatooncollection.in",
      "res.cloudinary.com",
      "images.unsplash.com",
      "72.62.196.65",
      "31.97.231.233",
      "localhost",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Order emails load product photos from khatooncollection.in/api/media/...
  // (e.g. /api/media/image-proxy); those endpoints live on the API.
  async rewrites() {
    return [
      {
        source: "/api/media/:path*",
        destination: "https://api.khatooncollection.in/api/media/:path*",
      },
    ];
  },
};

export default nextConfig;
