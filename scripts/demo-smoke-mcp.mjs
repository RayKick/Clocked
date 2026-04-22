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

async function assertJson(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`MCP smoke failed for ${url}: ${response.status} ${text}`);
  }
  console.log(`ok ${url}`);
  return JSON.parse(text);
}

loadEnvFile();

const baseUrl = process.env.CLOCKED_MCP_BASE_URL ?? "http://localhost:8787";

try {
  await assertJson(`${baseUrl}/health`);
  await assertJson(`${baseUrl}/manifest`);
  await assertJson(`${baseUrl}/tools`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      tool: "clocked.extract_claim_from_text",
      input: {
        text: "V2 ships next week.",
        sourcePostedAt: "2026-04-14T10:00:00.000Z",
        sourceAuthorHandle: "examplefounder",
        projectName: "Example Protocol"
      }
    })
  });
  await assertJson(`${baseUrl}/tools`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      tool: "clocked.search_claims",
      input: { projectSlug: "example-protocol", limit: 10 }
    })
  });
  await assertJson(`${baseUrl}/tools`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      tool: "clocked.get_claim",
      input: { slug: "example-protocol-example-protocol-will-ship-v2-next-week" }
    })
  });
  await assertJson(`${baseUrl}/tools`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      tool: "clocked.get_project_record",
      input: { projectSlug: "example-protocol" }
    })
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
