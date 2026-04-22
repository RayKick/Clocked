import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { getAppBaseUrl, getMcpBaseUrl, getWebBaseUrl } from "./_base-url.mjs";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    return;
  }

  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^"(.*)"$/, "$1");
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const appBaseUrl = getAppBaseUrl(process.env);
const webBaseUrl = getWebBaseUrl(process.env);
const mcpBaseUrl = getMcpBaseUrl(process.env);

console.log("CLOCKED demo summary");
console.log(`APP_BASE_URL=${appBaseUrl}`);
console.log(`WEB_BASE_URL=${webBaseUrl}`);
console.log(`CLOCKED_MCP_BASE_URL=${mcpBaseUrl}`);
console.log(`SAFE_DRY_RUN=${process.env.SAFE_DRY_RUN ?? "true"}`);
console.log(`X_READ_ENABLED=${process.env.X_READ_ENABLED ?? "false"}`);
console.log(`X_POSTING_ENABLED=${process.env.X_POSTING_ENABLED ?? "false"}`);
console.log(
  `HEYANON_ENABLE_LIVE_CALLS=${process.env.HEYANON_ENABLE_LIVE_CALLS ?? "false"}`
);
console.log(
  `ALLOW_ADMIN_QUERY_PASSWORD=${process.env.ALLOW_ADMIN_QUERY_PASSWORD ?? "false"}`
);
console.log("");
console.log("Demo URLs");
console.log(`- ${webBaseUrl}`);
console.log(`- ${webBaseUrl}/admin/review`);
console.log(`- ${webBaseUrl}/admin/ingest`);
console.log(`- ${webBaseUrl}/c/example-protocol-will-ship-v2-next-week`);
console.log(`- ${webBaseUrl}/p/example-protocol`);
console.log(`- ${webBaseUrl}/a/X/examplefounder`);
console.log(`- ${webBaseUrl}/due`);
console.log(`- ${webBaseUrl}/api/hud/project/example-protocol`);
console.log(`- ${webBaseUrl}/api/readiness`);
console.log("");
console.log("Demo commands");
console.log("- corepack pnpm demo:seed");
console.log("- corepack pnpm demo:verify");
console.log("- corepack pnpm demo:smoke:web");
console.log("- corepack pnpm demo:smoke:mcp");
