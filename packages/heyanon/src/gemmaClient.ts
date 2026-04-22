import {
  type GemmaAskInput,
  type GemmaClient,
  type GemmaHistoricalInput,
  type GemmaLinksInput,
  type GemmaMessagesInput,
  type HeyAnonQueryResult,
  gemmaAskInputSchema,
  gemmaHistoricalInputSchema,
  gemmaLinksInputSchema,
  gemmaMessagesInputSchema,
  heyAnonQueryResultSchema
} from "./types";
import { MockGemmaClient } from "./mockGemmaClient";

export interface GemmaClientOptions {
  fetchImpl?: typeof fetch;
  endpoint?: string;
  agentId?: string;
  enableLiveCalls?: boolean;
}

function shouldUseLiveGemma(options: GemmaClientOptions = {}): boolean {
  return options.enableLiveCalls ?? process.env.HEYANON_ENABLE_LIVE_CALLS === "true";
}

class LiveGemmaClient implements GemmaClient {
  private readonly fetchImpl: typeof fetch;
  private readonly endpoint: string;
  private readonly agentId?: string;

  constructor(options: GemmaClientOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.endpoint =
      options.endpoint ?? process.env.GEMMA_AGENT_ENDPOINT ?? "http://localhost:8789";
    this.agentId = options.agentId ?? process.env.GEMMA_AGENT_ID;
  }

  async askGemma(input: GemmaAskInput): Promise<HeyAnonQueryResult> {
    return this.request("/ask", gemmaAskInputSchema.parse(input));
  }

  async getProjectSentiment(input: GemmaAskInput): Promise<HeyAnonQueryResult> {
    return this.request("/project-sentiment", gemmaAskInputSchema.parse(input));
  }

  async extractMessages(input: GemmaMessagesInput): Promise<HeyAnonQueryResult> {
    return this.request("/extract-messages", gemmaMessagesInputSchema.parse(input));
  }

  async extractLinks(input: GemmaLinksInput): Promise<HeyAnonQueryResult> {
    return this.request("/extract-links", gemmaLinksInputSchema.parse(input));
  }

  async getProtocolMetrics(input: GemmaAskInput): Promise<HeyAnonQueryResult> {
    return this.request("/protocol-metrics", gemmaAskInputSchema.parse(input));
  }

  async getHistoricalContext(
    input: GemmaHistoricalInput
  ): Promise<HeyAnonQueryResult> {
    return this.request(
      "/historical-context",
      gemmaHistoricalInputSchema.parse(input)
    );
  }

  private async request(path: string, body: unknown): Promise<HeyAnonQueryResult> {
    const response = await this.fetchImpl(`${this.endpoint}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(this.agentId ? { "x-agent-id": this.agentId } : {})
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error(`Gemma request failed with ${response.status}`);
    }

    return heyAnonQueryResultSchema.parse(await response.json());
  }
}

export function createGemmaClient(options: GemmaClientOptions = {}): GemmaClient {
  if (!shouldUseLiveGemma(options)) {
    return new MockGemmaClient();
  }

  return new LiveGemmaClient(options);
}

