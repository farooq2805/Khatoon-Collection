/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["react-icons"],
  images: {
    domains: [
      "api.khatooncollection.in",
      "res.cloudinary.com",
      "images.unsplash.com",
      "localhost",
      "yourcdn.com",
    ],
    remotePatterns: [
      // Cloudinary (covers all paths, safest)
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Unsplash (for Instagram Reels placeholders)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // Localhost with port (if you ever use it)
      {
        protocol: "http",
        hostname: "localhost",
        port: "3003",
        pathname: "/**",
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
