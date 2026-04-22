import { buildDefaultFilteredStreamRules, createXClient } from "@clocked/x-client";

export async function runXStreamWorker() {
  if (process.env.X_API_BEARER_TOKEN == null) {
    return { ok: false, reason: "Missing X_API_BEARER_TOKEN" };
  }

  const client = createXClient();
  const rules = buildDefaultFilteredStreamRules(
    process.env.CLOCKED_BOT_HANDLE ?? "ClockedBot"
  );
  await client.configureFilteredStreamRules(rules);
  return { ok: true, rulesConfigured: rules.length };
}
