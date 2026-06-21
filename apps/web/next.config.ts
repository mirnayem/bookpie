import type { NextConfig } from "next";

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;

const nextConfig: NextConfig = {
  assetPrefix: cdnUrl || undefined,
  images: {
    dangerouslyAllowSVG: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.bookpie.local" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
