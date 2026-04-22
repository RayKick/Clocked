import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {
  buildClaimExtractionPrompt,
  buildClaimStitchingPrompt,
  buildStatusEvaluationPrompt,
  CLAIM_EXTRACTION_SYSTEM_PROMPT,
  CLAIM_STITCHING_SYSTEM_PROMPT,
  STATUS_EVALUATION_SYSTEM_PROMPT,
} from "./prompts";
import {
  ClaimExtractionInputSchema,
  ClaimExtractionResultSchema,
  ClaimStitchingInputSchema,
  ClaimStitchingResultSchema,
  StatusEvaluationInputSchema,
  StatusEvaluationResultSchema,
  type ClaimExtractionInput,
  type ClaimExtractionResult,
  type ClaimStitchingInput,
  type ClaimStitchingResult,
  type StatusEvaluationInput,
  type StatusEvaluationResult,
} from "./schemas";

export type OpenAIClientOptions = {
  apiKey?: string;
  model?: string;
  baseURL?: string;
  fetch?: typeof globalThis.fetch;
};

function extractJsonPayload(content: string | null | undefined): unknown {
  if (!content) {
    throw new Error("OpenAI response did not include any content.");
  }

  const trimmed = content.trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error("OpenAI response did not contain valid JSON.");
  }

  return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
}

export class OpenAIClient {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(options: OpenAIClientOptions = {}) {
    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required for the live AI client.");
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: options.baseURL ?? process.env.OPENAI_BASE_URL,
      fetch: options.fetch,
    });
    this.model = options.model ?? process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  }

  private async runStructuredTask<T>(params: {
    systemPrompt: string;
    userPrompt: string;
    parser: (payload: unknown) => T;
  }): Promise<T> {
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.userPrompt },
    ];

    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages,
    });

    const content = response.choices[0]?.message?.content;
    return params.parser(extractJsonPayload(content));
  }

  async extractClaim(
    input: ClaimExtractionInput,
  ): Promise<ClaimExtractionResult> {
    const parsed = ClaimExtractionInputSchema.parse(input);

    return this.runStructuredTask({
      systemPrompt: CLAIM_EXTRACTION_SYSTEM_PROMPT,
      userPrompt: buildClaimExtractionPrompt(parsed),
      parser: (payload) => ClaimExtractionResultSchema.parse(payload),
    });
  }

  async evaluateStatus(
    input: StatusEvaluationInput,
  ): Promise<StatusEvaluationResult> {
    const parsed = StatusEvaluationInputSchema.parse(input);

    return this.runStructuredTask({
      systemPrompt: STATUS_EVALUATION_SYSTEM_PROMPT,
      userPrompt: buildStatusEvaluationPrompt(parsed),
      parser: (payload) => StatusEvaluationResultSchema.parse(payload),
    });
  }

  async stitchClaims(
    input: ClaimStitchingInput,
  ): Promise<ClaimStitchingResult> {
    const parsed = ClaimStitchingInputSchema.parse(input);

    return this.runStructuredTask({
      systemPrompt: CLAIM_STITCHING_SYSTEM_PROMPT,
      userPrompt: buildClaimStitchingPrompt(parsed),
      parser: (payload) => ClaimStitchingResultSchema.parse(payload),
    });
  }
}

export function createOpenAIClient(
  options: OpenAIClientOptions = {},
): OpenAIClient {
  return new OpenAIClient(options);
}
