/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["react-icons"],
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
};

export default nextConfig;
