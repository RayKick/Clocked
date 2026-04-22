import {
  gemmaAskInputSchema,
  gemmaHistoricalInputSchema,
  gemmaLinksInputSchema,
  gemmaMessagesInputSchema,
  type GemmaAskInput,
  type GemmaClient,
  type GemmaHistoricalInput,
  type GemmaLinksInput,
  type GemmaMessagesInput,
  type HeyAnonQueryResult
} from "./types";

function result(summary: string, evidence: string[]): HeyAnonQueryResult {
  return {
    summary,
    evidence,
    sources: evidence.map((item, index) => ({
      kind: "gemma-mock",
      title: `Gemma Mock ${index + 1}`,
      excerpt: item
    })),
    raw: { mocked: true }
  };
}

export class MockGemmaClient implements GemmaClient {
  askGemma(input: GemmaAskInput): Promise<HeyAnonQueryResult> {
    const parsed = gemmaAskInputSchema.parse(input);
    return Promise.resolve(
      result(`Mocked Gemma answer for ${parsed.projectSlug ?? "project"}.`, [
        parsed.prompt
      ])
    );
  }

  getProjectSentiment(input: GemmaAskInput): Promise<HeyAnonQueryResult> {
    const parsed = gemmaAskInputSchema.parse(input);
    return Promise.resolve(
      result(`Mocked sentiment summary for ${parsed.projectSlug ?? "project"}.`, [
        "Sentiment is mixed but factual scoring is intentionally omitted in MVP."
      ])
    );
  }

  extractMessages(input: GemmaMessagesInput): Promise<HeyAnonQueryResult> {
    const parsed = gemmaMessagesInputSchema.parse(input);
    return Promise.resolve(
      result(`Mocked extracted messages for ${parsed.projectSlug}.`, parsed.sources)
    );
  }

  extractLinks(input: GemmaLinksInput): Promise<HeyAnonQueryResult> {
    const parsed = gemmaLinksInputSchema.parse(input);
    return Promise.resolve(
      result("Mocked link extraction.", parsed.text.match(/https?:\/\/\S+/g) ?? [])
    );
  }

  getProtocolMetrics(input: GemmaAskInput): Promise<HeyAnonQueryResult> {
    const parsed = gemmaAskInputSchema.parse(input);
    return Promise.resolve(
      result(`Mocked protocol metrics for ${parsed.projectSlug ?? "project"}.`, [
        "No live metrics queried in dry-run mode."
      ])
    );
  }

  getHistoricalContext(
    input: GemmaHistoricalInput
  ): Promise<HeyAnonQueryResult> {
    const parsed = gemmaHistoricalInputSchema.parse(input);
    return Promise.resolve(
      result(`Mocked historical context for ${parsed.projectSlug}.`, [
        parsed.timeframeLabel ?? "historical context"
      ])
    );
  }
}
