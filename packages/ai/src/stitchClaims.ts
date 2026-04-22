import { createLlmClient, type LlmClient } from "./llmClient";
import {
  ClaimStitchingInputSchema,
  ClaimStitchingResultSchema,
  type ClaimStitchingInput,
  type ClaimStitchingResult,
} from "./schemas";

export async function stitchClaims(
  input: ClaimStitchingInput,
  options: {
    client?: LlmClient;
    mode?: "auto" | "mock" | "live";
  } = {},
): Promise<ClaimStitchingResult> {
  const parsed = ClaimStitchingInputSchema.parse(input);
  const client = options.client ?? createLlmClient({ mode: options.mode });
  const result = await client.stitchClaims(parsed);
  return ClaimStitchingResultSchema.parse(result);
}
