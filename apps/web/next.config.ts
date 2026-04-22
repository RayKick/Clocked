import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  transpilePackages: [
    "@clocked/ai",
    "@clocked/core",
    "@clocked/db",
    "@clocked/heyanon",
    "@clocked/ui",
    "@clocked/x-client"
  ]
};

export default nextConfig;
