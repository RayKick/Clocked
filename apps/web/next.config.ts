import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
