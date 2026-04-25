import type { LlmClientMode } from "@clocked/ai";

export function getAiMode(): LlmClientMode {
  const mode = process.env.AI_MODE;
  return mode === "live" || mode === "auto" ? mode : "mock";
}
