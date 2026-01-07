import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: static export has issues with Next.js 16 Turbopack
  // For Capacitor development, we use the dev server
  // For production, deploy to Vercel and update capacitor.config.ts
  images: {
    unoptimized: true
  }
};

export default nextConfig;
