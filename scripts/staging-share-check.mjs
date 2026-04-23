import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { getWebBaseUrl } from "./_base-url.mjs";

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

const baseUrl = getWebBaseUrl(process.env);
const readinessUrl = `${baseUrl}/api/readiness`;

try {
  console.log(`Using staging web base URL: ${baseUrl}`);
  const response = await fetch(readinessUrl);
  const body = await response.json();

  if (!response.ok) {
    throw new Error(`Share check failed for ${readinessUrl}: ${response.status}`);
  }

  if (!body.ok || body.database !== "ok") {
    throw new Error(`Share check failed: readiness database=${body.database}`);
  }

  if (!body.safeDryRun) {
    throw new Error("Share check failed: SAFE_DRY_RUN must remain true for reviewer staging");
  }

  if (body.xReadEnabled) {
    throw new Error("Share check failed: X_READ_ENABLED must remain false for reviewer staging");
  }

  if (body.xPostingEnabled) {
    throw new Error(
      "Share check failed: X_POSTING_ENABLED must remain false for reviewer staging"
    );
  }

  if (body.heyAnonLiveCallsEnabled) {
    throw new Error(
      "Share check failed: HEYANON_ENABLE_LIVE_CALLS must remain false for reviewer staging"
    );
  }

  if (!body.appBaseUrlConfigured) {
    throw new Error("Share check failed: APP_BASE_URL must be configured");
  }

  if (!body.adminPasswordConfigured) {
    throw new Error("Share check failed: ADMIN_PASSWORD must be set before sharing staging");
  }

  console.log("ok staging share gate passed");
  console.log(`- readiness: ${readinessUrl}`);
  console.log(`- safeDryRun: ${body.safeDryRun}`);
  console.log(`- xReadEnabled: ${body.xReadEnabled}`);
  console.log(`- xPostingEnabled: ${body.xPostingEnabled}`);
  console.log(`- heyAnonLiveCallsEnabled: ${body.heyAnonLiveCallsEnabled}`);
  console.log(`- adminPasswordConfigured: ${body.adminPasswordConfigured}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
