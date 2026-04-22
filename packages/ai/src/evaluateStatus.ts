import { createLlmClient, type LlmClient } from "./llmClient";
import {
  StatusEvaluationInputSchema,
  StatusEvaluationResultSchema,
  type StatusEvaluationInput,
  type StatusEvaluationResult,
} from "./schemas";

export async function evaluateClaimStatus(
  input: StatusEvaluationInput,
  options: {
    client?: LlmClient;
    mode?: "auto" | "mock" | "live";
  } = {},
): Promise<StatusEvaluationResult> {
  const parsed = StatusEvaluationInputSchema.parse(input);
  const client = options.client ?? createLlmClient({ mode: options.mode });
  const result = await client.evaluateStatus(parsed);
  return StatusEvaluationResultSchema.parse(result);
}
