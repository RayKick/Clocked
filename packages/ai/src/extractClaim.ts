import { createLlmClient, type LlmClient } from "./llmClient";
import {
  ClaimExtractionInputSchema,
  ClaimExtractionResultSchema,
  type ClaimExtractionInput,
  type ClaimExtractionResult,
} from "./schemas";

export async function extractClaim(
  input: ClaimExtractionInput,
  options: {
    client?: LlmClient;
    mode?: "auto" | "mock" | "live";
  } = {},
): Promise<ClaimExtractionResult> {
  const parsed = ClaimExtractionInputSchema.parse(input);
  const client = options.client ?? createLlmClient({ mode: options.mode });
  const result = await client.extractClaim(parsed);
  return ClaimExtractionResultSchema.parse(result);
}
