/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["react-icons"],
  images: {
    unoptimized: true,
    domains: [
      "api.khatooncollection.in",
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
