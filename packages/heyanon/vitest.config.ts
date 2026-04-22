import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@clocked/core": resolve(__dirname, "../core/src/index.ts"),
      "@clocked/db": resolve(__dirname, "../db/src/index.ts")
    }
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"]
  }
});
