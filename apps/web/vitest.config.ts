import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const workspaceRoot = fileURLToPath(new URL("../../", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@clocked/ai": resolve(workspaceRoot, "packages/ai/src/index.ts"),
      "@clocked/core": resolve(workspaceRoot, "packages/core/src/index.ts"),
      "@clocked/db": resolve(workspaceRoot, "packages/db/src/index.ts"),
      "@clocked/heyanon": resolve(workspaceRoot, "packages/heyanon/src/index.ts"),
      "@clocked/ui": resolve(workspaceRoot, "packages/ui/src/index.ts"),
      "@clocked/x-client": resolve(workspaceRoot, "packages/x-client/src/index.ts")
    }
  },
  test: {
    environment: "node"
  }
});
