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

async function assertOk(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Web smoke failed for ${url}: ${response.status}`);
  }
  console.log(`ok ${url}`);
}

async function assertReadiness(url) {
  const response = await fetch(url);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Web smoke failed for ${url}: ${response.status}`);
  }

  if (!body.ok || body.database !== "ok") {
    throw new Error(`Readiness failed for ${url}: database=${body.database}`);
  }

  if (!body.safeDryRun) {
    throw new Error(`Readiness failed for ${url}: SAFE_DRY_RUN is not enabled`);
  }

  if (body.xReadEnabled || body.xPostingEnabled || body.heyAnonLiveCallsEnabled) {
    throw new Error(`Readiness failed for ${url}: live integration flags are enabled`);
  }

  if (!body.appBaseUrlConfigured) {
    throw new Error(`Readiness failed for ${url}: APP_BASE_URL is not configured`);
  }

  console.log(
    `ok ${url} safeDryRun=${body.safeDryRun} xReadEnabled=${body.xReadEnabled} xPostingEnabled=${body.xPostingEnabled} heyAnonLiveCallsEnabled=${body.heyAnonLiveCallsEnabled}`
  );
}

loadEnvFile();

const baseUrl = getWebBaseUrl(process.env);
const urls = [
  `${baseUrl}/`,
  `${baseUrl}/admin/review`,
  `${baseUrl}/admin/ingest`,
  `${baseUrl}/c/example-protocol-will-ship-v2-next-week`,
  `${baseUrl}/p/example-protocol`,
  `${baseUrl}/a/X/examplefounder`,
  `${baseUrl}/due`,
  `${baseUrl}/api/hud/project/example-protocol`
];
const readinessUrl = `${baseUrl}/api/readiness`;

try {
  console.log(`Using web base URL: ${baseUrl}`);
  for (const url of urls) {
    await assertOk(url);
  }
  await assertReadiness(readinessUrl);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
