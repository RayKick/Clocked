import { z } from "zod";

const queryBaseSchema = z.object({
  projectId: z.string().optional(),
  claimId: z.string().optional(),
  projectKey: z.string().optional(),
  projectSlug: z.string().optional(),
  prompt: z.string().min(1),
  sources: z.array(z.string()).default([]),
  timeframe: z
    .object({
      start: z.string().datetime().optional(),
      end: z.string().datetime().optional(),
      label: z.string().optional()
    })
    .default({})
});

export const heyAnonSourceSchema = z.object({
  kind: z.string(),
  title: z.string(),
  url: z.string().optional(),
  excerpt: z.string().optional()
});

export const heyAnonQueryResultSchema = z.object({
  summary: z.string(),
  evidence: z.array(z.string()).default([]),
  sources: z.array(heyAnonSourceSchema).default([]),
  raw: z.unknown().optional()
});

export const projectContextInputSchema = queryBaseSchema.extend({
  projectSlug: z.string().min(1)
});

export const projectSourcesInputSchema = queryBaseSchema.extend({
  projectSlug: z.string().min(1)
});

export const socialMentionsInputSchema = queryBaseSchema.extend({
  projectSlug: z.string().optional(),
  handles: z.array(z.string()).default([])
});

export const chatMessagesInputSchema = queryBaseSchema.extend({
  channels: z.array(z.string()).default([])
});

export const githubActivityInputSchema = queryBaseSchema.extend({
  org: z.string().optional(),
  repo: z.string().optional()
});

export const gitbookChangesInputSchema = queryBaseSchema.extend({
  gitBookUrl: z.string().url().optional()
});

export const deliveryEvidenceInputSchema = queryBaseSchema.extend({
  claimId: z.string().optional(),
  projectSlug: z.string().optional()
});

export const claimStitchingContextInputSchema = queryBaseSchema.extend({
  claimId: z.string().optional(),
  candidateClaimIds: z.array(z.string()).default([])
});

export const gemmaAskInputSchema = z.object({
  prompt: z.string().min(1),
  projectSlug: z.string().optional()
});

export const gemmaMessagesInputSchema = z.object({
  projectSlug: z.string().min(1),
  prompt: z.string().min(1),
  sources: z.array(z.string()).default([])
});

export const gemmaLinksInputSchema = z.object({
  text: z.string().min(1)
});

export const gemmaHistoricalInputSchema = z.object({
  projectSlug: z.string().min(1),
  timeframeLabel: z.string().optional()
});

export type ProjectContextInput = z.infer<typeof projectContextInputSchema>;
export type ProjectSourcesInput = z.infer<typeof projectSourcesInputSchema>;
export type SocialMentionsInput = z.infer<typeof socialMentionsInputSchema>;
export type ChatMessagesInput = z.infer<typeof chatMessagesInputSchema>;
export type GitHubActivityInput = z.infer<typeof githubActivityInputSchema>;
export type GitBookChangesInput = z.infer<typeof gitbookChangesInputSchema>;
export type DeliveryEvidenceInput = z.infer<typeof deliveryEvidenceInputSchema>;
export type ClaimStitchingContextInput = z.infer<
  typeof claimStitchingContextInputSchema
>;
export type HeyAnonQueryResult = z.infer<typeof heyAnonQueryResultSchema>;
export type GemmaAskInput = z.infer<typeof gemmaAskInputSchema>;
export type GemmaMessagesInput = z.infer<typeof gemmaMessagesInputSchema>;
export type GemmaLinksInput = z.infer<typeof gemmaLinksInputSchema>;
export type GemmaHistoricalInput = z.infer<typeof gemmaHistoricalInputSchema>;

export interface HeyAnonClient {
  queryProjectContext(input: ProjectContextInput): Promise<HeyAnonQueryResult>;
  queryProjectSources(input: ProjectSourcesInput): Promise<HeyAnonQueryResult>;
  querySocialMentions(input: SocialMentionsInput): Promise<HeyAnonQueryResult>;
  queryChatMessages(input: ChatMessagesInput): Promise<HeyAnonQueryResult>;
  queryGitHubActivity(input: GitHubActivityInput): Promise<HeyAnonQueryResult>;
  queryGitBookChanges(input: GitBookChangesInput): Promise<HeyAnonQueryResult>;
  queryDeliveryEvidence(input: DeliveryEvidenceInput): Promise<HeyAnonQueryResult>;
  queryClaimStitchingContext(
    input: ClaimStitchingContextInput
  ): Promise<HeyAnonQueryResult>;
}

export interface GemmaClient {
  askGemma(input: GemmaAskInput): Promise<HeyAnonQueryResult>;
  getProjectSentiment(input: GemmaAskInput): Promise<HeyAnonQueryResult>;
  extractMessages(input: GemmaMessagesInput): Promise<HeyAnonQueryResult>;
  extractLinks(input: GemmaLinksInput): Promise<HeyAnonQueryResult>;
  getProtocolMetrics(input: GemmaAskInput): Promise<HeyAnonQueryResult>;
  getHistoricalContext(input: GemmaHistoricalInput): Promise<HeyAnonQueryResult>;
}

