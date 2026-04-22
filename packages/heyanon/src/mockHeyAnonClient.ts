import {
  deliveryEvidenceInputSchema,
  gitbookChangesInputSchema,
  githubActivityInputSchema,
  socialMentionsInputSchema,
  type ChatMessagesInput,
  type ClaimStitchingContextInput,
  type DeliveryEvidenceInput,
  type GitBookChangesInput,
  type GitHubActivityInput,
  type HeyAnonClient,
  type HeyAnonQueryResult,
  type ProjectContextInput,
  type ProjectSourcesInput,
  type SocialMentionsInput,
  projectContextInputSchema,
  projectSourcesInputSchema
} from "./types";

function buildMockResult(summary: string, sources: string[]): HeyAnonQueryResult {
  return {
    summary,
    evidence: sources.map((source) => `Mock evidence from ${source}`),
    sources: sources.map((source, index) => ({
      kind: "mock",
      title: `Mock Source ${index + 1}`,
      url: source
    })),
    raw: { mocked: true }
  };
}

export class MockHeyAnonClient implements HeyAnonClient {
  queryProjectContext(input: ProjectContextInput): Promise<HeyAnonQueryResult> {
    const parsed = projectContextInputSchema.parse(input);
    return Promise.resolve(
      buildMockResult(
        `Mocked project context for ${parsed.projectSlug}.`,
        parsed.sources.length ? parsed.sources : ["https://mock.heyanon/context"]
      )
    );
  }

  queryProjectSources(input: ProjectSourcesInput): Promise<HeyAnonQueryResult> {
    const parsed = projectSourcesInputSchema.parse(input);
    return Promise.resolve(
      buildMockResult(
        `Mocked source map for ${parsed.projectSlug}.`,
        parsed.sources.length ? parsed.sources : ["https://mock.heyanon/sources"]
      )
    );
  }

  querySocialMentions(input: SocialMentionsInput): Promise<HeyAnonQueryResult> {
    const parsed = socialMentionsInputSchema.parse(input);
    return Promise.resolve(
      buildMockResult(
        `Mocked social mentions for ${parsed.projectSlug ?? "project"}.`,
        parsed.handles.map((handle) => `https://x.com/${handle.replace(/^@/, "")}`)
      )
    );
  }

  queryChatMessages(input: ChatMessagesInput): Promise<HeyAnonQueryResult> {
    return Promise.resolve(
      buildMockResult(
        `Mocked public chat messages for ${input.projectSlug ?? "project"}.`,
        input.channels.map((channel) => `https://mock.chat/${channel}`)
      )
    );
  }

  queryGitHubActivity(input: GitHubActivityInput): Promise<HeyAnonQueryResult> {
    const parsed = githubActivityInputSchema.parse(input);
    return Promise.resolve(
      buildMockResult(
        `Mocked GitHub activity for ${parsed.org ?? "org"}.`,
        [`https://github.com/${parsed.org ?? "example"}/${parsed.repo ?? ""}`]
      )
    );
  }

  queryGitBookChanges(input: GitBookChangesInput): Promise<HeyAnonQueryResult> {
    const parsed = gitbookChangesInputSchema.parse(input);
    return Promise.resolve(
      buildMockResult(
        "Mocked GitBook changes.",
        parsed.gitBookUrl ? [parsed.gitBookUrl] : ["https://mock.gitbook/change"]
      )
    );
  }

  queryDeliveryEvidence(input: DeliveryEvidenceInput): Promise<HeyAnonQueryResult> {
    const parsed = deliveryEvidenceInputSchema.parse(input);
    return Promise.resolve(
      buildMockResult(
        `Mocked delivery evidence for ${parsed.projectSlug ?? parsed.claimId ?? "claim"}.`,
        parsed.sources.length ? parsed.sources : ["https://mock.heyanon/evidence"]
      )
    );
  }

  queryClaimStitchingContext(
    input: ClaimStitchingContextInput
  ): Promise<HeyAnonQueryResult> {
    return Promise.resolve(
      buildMockResult(
        `Mocked stitching context for ${input.claimId ?? "claim"}.`,
        input.candidateClaimIds.map((id) => `clocked://claims/${id}`)
      )
    );
  }
}
