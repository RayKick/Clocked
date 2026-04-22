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

loadEnvFile();

const required = [
  "DATABASE_URL",
  "APP_BASE_URL",
  "CLOCKED_MCP_BASE_URL",
  "ADMIN_PASSWORD",
  "HUD_EXPORT_SECRET",
  "MCP_API_KEY"
];

const safeDefaults = {
  SAFE_DRY_RUN: "true",
  X_READ_ENABLED: "false",
  X_POSTING_ENABLED: "false",
  HEYANON_ENABLE_LIVE_CALLS: "false",
  RUN_AI_TESTS: "false",
  ALLOW_ADMIN_QUERY_PASSWORD: "false"
};

function getEffectiveValue(key, expected) {
  return process.env[key] ?? expected;
}

const missing = required.filter((key) => !process.env[key]?.trim());
const strict = process.env.STAGING_STRICT === "true";

console.log("CLOCKED staging env check");
console.log("Required");
for (const key of required) {
  console.log(`- ${key}: ${process.env[key]?.trim() ? "present" : "missing"}`);
}

console.log("");
console.log("Safe defaults");
for (const [key, expected] of Object.entries(safeDefaults)) {
  const actual = getEffectiveValue(key, expected);
  console.log(`- ${key}: ${actual} ${actual === expected ? "ok" : `expected ${expected}`}`);
}

if (missing.length > 0) {
  console.error("");
  console.error(`Missing required staging env vars: ${missing.join(", ")}`);
  if (strict) {
    process.exitCode = 1;
  } else {
    console.error(
      "Continuing in non-strict mode. Set STAGING_STRICT=true to make this a hard failure."
    );
  }
}
