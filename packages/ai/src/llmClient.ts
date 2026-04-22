import type {
  ClaimExtractionInput,
  ClaimExtractionResult,
  ClaimStitchingInput,
  ClaimStitchingResult,
  StatusEvaluationInput,
  StatusEvaluationResult,
} from "./schemas";
import { createMockAiClient } from "./mockAi";
import { createOpenAIClient, type OpenAIClientOptions } from "./openaiClient";

export interface LlmClient {
  extractClaim(input: ClaimExtractionInput): Promise<ClaimExtractionResult>;
  evaluateStatus(input: StatusEvaluationInput): Promise<StatusEvaluationResult>;
  stitchClaims(input: ClaimStitchingInput): Promise<ClaimStitchingResult>;
}

export type LlmClientMode = "auto" | "mock" | "live";

export type CreateLlmClientOptions = OpenAIClientOptions & {
  mode?: LlmClientMode;
};

export function createLlmClient(options: CreateLlmClientOptions = {}): LlmClient {
  const mode = options.mode ?? "auto";
  const hasApiKey = Boolean(options.apiKey ?? process.env.OPENAI_API_KEY);

  if (mode === "mock" || (mode === "auto" && !hasApiKey)) {
    return createMockAiClient();
  }

  return createOpenAIClient(options);
}
