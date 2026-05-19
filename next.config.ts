import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : "";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            hostname: supabaseHostname,
            protocol: "https",
          },
        ]
      : [],
  },
};

export default nextConfig;
