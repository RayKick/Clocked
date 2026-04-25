import type { NextConfig } from "next";
import path from "node:path";

const workspaceRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: workspaceRoot,
  outputFileTracingIncludes: {
    "/*": ["../../packages/db/src/generated/client/**/*"]
  },
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
