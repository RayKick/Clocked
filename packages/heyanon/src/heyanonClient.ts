import type { Prisma } from "@clocked/db";
import { prisma } from "@clocked/db";

import {
  type ClaimStitchingContextInput,
  type DeliveryEvidenceInput,
  type GitBookChangesInput,
  type GitHubActivityInput,
  type HeyAnonClient,
  type HeyAnonQueryResult,
  type ProjectContextInput,
  type ProjectSourcesInput,
  type SocialMentionsInput,
  chatMessagesInputSchema,
  claimStitchingContextInputSchema,
  deliveryEvidenceInputSchema,
  gitbookChangesInputSchema,
  githubActivityInputSchema,
  heyAnonQueryResultSchema,
  projectContextInputSchema,
  projectSourcesInputSchema,
  socialMentionsInputSchema
} from "./types";
import { MockHeyAnonClient } from "./mockHeyAnonClient";

type QueryType =
  | "PROJECT_CONTEXT"
  | "SOCIAL_SEARCH"
  | "CHAT_SEARCH"
  | "GITHUB_ACTIVITY"
  | "GITBOOK_CHANGE"
  | "DELIVERY_EVIDENCE"
  | "CLAIM_STITCHING";

export interface HeyAnonClientOptions {
  fetchImpl?: typeof fetch;
  baseUrl?: string;
  apiKey?: string;
  enableLiveCalls?: boolean;
}

async function logQuery(input: {
  queryType: QueryType;
  prompt: string;
  projectId?: string;
  claimId?: string;
  sourcesJson?: Prisma.InputJsonValue;
  timeframeJson?: Prisma.InputJsonValue;
  status: "MOCKED" | "SENT" | "COMPLETED" | "FAILED";
  responseJson?: Prisma.InputJsonValue;
  error?: string;
}): Promise<void> {
  try {
    await prisma.heyAnonQuery.create({
      data: {
        queryType: input.queryType,
        projectId: input.projectId,
        claimId: input.claimId,
        prompt: input.prompt,
        sourcesJson: input.sourcesJson ?? [],
        timeframeJson: input.timeframeJson ?? {},
        status: input.status,
        responseJson: input.responseJson,
        error: input.error
      }
    });
  } catch {
    // Logging should never break the request path in dry-run or test flows.
  }
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

export function shouldUseLiveHeyAnon(options: HeyAnonClientOptions = {}): boolean {
  return (
    options.enableLiveCalls ?? process.env.HEYANON_ENABLE_LIVE_CALLS === "true"
  );
}

export class LiveHeyAnonClient implements HeyAnonClient {
  private readonly fetchImpl: typeof fetch;
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(options: HeyAnonClientOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.baseUrl =
      options.baseUrl ??
      process.env.HEYANON_API_BASE_URL ??
      "http://localhost:8788";
    this.apiKey = options.apiKey ?? process.env.HEYANON_API_KEY;
  }

  async queryProjectContext(input: ProjectContextInput): Promise<HeyAnonQueryResult> {
    return this.request("/project-context", "PROJECT_CONTEXT", projectContextInputSchema.parse(input));
  }

  async queryProjectSources(input: ProjectSourcesInput): Promise<HeyAnonQueryResult> {
    return this.request("/project-sources", "PROJECT_CONTEXT", projectSourcesInputSchema.parse(input));
  }

  async querySocialMentions(input: SocialMentionsInput): Promise<HeyAnonQueryResult> {
    return this.request("/social-mentions", "SOCIAL_SEARCH", socialMentionsInputSchema.parse(input));
  }

  async queryChatMessages(input: {
    prompt: string;
    projectSlug?: string;
    channels: string[];
    sources: string[];
    timeframe: { start?: string; end?: string; label?: string };
  }): Promise<HeyAnonQueryResult> {
    return this.request("/chat-messages", "CHAT_SEARCH", chatMessagesInputSchema.parse(input));
  }

  async queryGitHubActivity(input: GitHubActivityInput): Promise<HeyAnonQueryResult> {
    return this.request("/github-activity", "GITHUB_ACTIVITY", githubActivityInputSchema.parse(input));
  }

  async queryGitBookChanges(input: GitBookChangesInput): Promise<HeyAnonQueryResult> {
    return this.request("/gitbook-changes", "GITBOOK_CHANGE", gitbookChangesInputSchema.parse(input));
  }

  async queryDeliveryEvidence(input: DeliveryEvidenceInput): Promise<HeyAnonQueryResult> {
    return this.request("/delivery-evidence", "DELIVERY_EVIDENCE", deliveryEvidenceInputSchema.parse(input));
  }

  async queryClaimStitchingContext(
    input: ClaimStitchingContextInput
  ): Promise<HeyAnonQueryResult> {
    return this.request(
      "/claim-stitching",
      "CLAIM_STITCHING",
      claimStitchingContextInputSchema.parse(input)
    );
  }

  private async request(
    path: string,
    queryType: QueryType,
    input: {
      prompt: string;
      projectId?: string;
      claimId?: string;
      sources?: string[];
      timeframe?: unknown;
    }
  ): Promise<HeyAnonQueryResult> {
    await logQuery({
      queryType,
      prompt: input.prompt,
      projectId: input.projectId,
      claimId: input.claimId,
      sourcesJson: input.sources ?? [],
      timeframeJson: toJsonValue(input.timeframe ?? {}),
      status: "SENT"
    });

    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {})
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      const error = `HeyAnon request failed with ${response.status}`;
      await logQuery({
        queryType,
        prompt: input.prompt,
        projectId: input.projectId,
        claimId: input.claimId,
        sourcesJson: input.sources ?? [],
        timeframeJson: toJsonValue(input.timeframe ?? {}),
        status: "FAILED",
        error
      });
      throw new Error(error);
    }

    const json: unknown = await response.json();
    const parsed = heyAnonQueryResultSchema.parse(json);
    await logQuery({
      queryType,
      prompt: input.prompt,
      projectId: input.projectId,
      claimId: input.claimId,
      sourcesJson: input.sources ?? [],
      timeframeJson: toJsonValue(input.timeframe ?? {}),
      status: "COMPLETED",
      responseJson: toJsonValue({
        summary: parsed.summary,
        evidence: parsed.evidence,
        sources: parsed.sources
      })
    });
    return parsed;
  }
}

export function createHeyAnonClient(
  options: HeyAnonClientOptions = {}
): HeyAnonClient {
  if (!shouldUseLiveHeyAnon(options)) {
    return new MockHeyAnonClient();
  }

  return new LiveHeyAnonClient(options);
}
