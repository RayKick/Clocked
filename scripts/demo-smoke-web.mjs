import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

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

loadEnvFile();

const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3002";
const urls = [
  `${baseUrl}/`,
  `${baseUrl}/admin/review`,
  `${baseUrl}/c/example-protocol-example-protocol-will-ship-v2-next-week`,
  `${baseUrl}/p/example-protocol`,
  `${baseUrl}/a/X/examplefounder`,
  `${baseUrl}/due`,
  `${baseUrl}/api/hud/project/example-protocol`
];

try {
  for (const url of urls) {
    await assertOk(url);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
