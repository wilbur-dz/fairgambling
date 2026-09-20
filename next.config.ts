import type { NextConfig } from "next";

const apiUrl = (
  process.env.API_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  "https://api.fairgambling.com"
).replace(/\/$/, "");

const siteUrl = (
  process.env.SITE_URL?.trim() ||
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://www.fairgambling.com"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.fairgambling.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: "/logos/:path*",
        destination: `${siteUrl}/logos/:path*`,
      },
      {
        source: "/_next/:path*",
        destination: `${siteUrl}/_next/:path*`,
      },
    ];
  },
};

export default nextConfig;
