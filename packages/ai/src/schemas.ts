import { z } from "zod";

export const claimExtractionVerdicts = [
  "CLOCKABLE",
  "NOT_CLOCKABLE",
  "NEEDS_REVIEW",
] as const;

export const actorTypes = [
  "FOUNDER",
  "OFFICIAL_PROJECT",
  "TEAM_MEMBER",
  "COMMUNITY",
  "UNKNOWN",
] as const;

export const claimStatuses = [
  "OPEN",
  "DELIVERED",
  "SLIPPED",
  "REFRAMED",
  "SUPERSEDED",
  "AMBIGUOUS",
] as const;

export const evaluableStatuses = [
  "DELIVERED",
  "SLIPPED",
  "REFRAMED",
  "SUPERSEDED",
  "AMBIGUOUS",
] as const;

export const ClaimExtractionInputSchema = z.object({
  text: z.string().min(1),
  sourcePostedAt: z.string().datetime().optional(),
  sourceAuthorHandle: z.string().min(1).optional(),
  sourceTimezone: z.string().min(1).optional(),
  projectName: z.string().min(1).optional(),
});

export const ClaimExtractionResultSchema = z.object({
  verdict: z.enum(claimExtractionVerdicts),
  confidence: z.number().min(0).max(1),
  notClockableReason: z.string().min(1).optional(),
  normalizedClaim: z.string().min(1).optional(),
  sourceQuote: z.string().min(1).optional(),
  deliverable: z.string().min(1).optional(),
  deadlineText: z.string().min(1).optional(),
  deadlineAt: z.string().datetime().optional(),
  deadlineTimezone: z.string().min(1).optional(),
  deadlineConfidence: z.number().min(0).max(1).optional(),
  deliveryCriteria: z.array(z.string().min(1)).default([]),
  nonDeliveryCriteria: z.array(z.string().min(1)).default([]),
  ambiguityNotes: z.array(z.string().min(1)).default([]),
  suggestedProjectName: z.string().min(1).optional(),
  suggestedActorType: z.enum(actorTypes).optional(),
  publicCardHeadline: z.string().min(1).optional(),
  publicCardSubline: z.string().min(1).optional(),
});

export const StatusEvaluationInputSchema = z.object({
  claimSlug: z.string().min(1).optional(),
  normalizedClaim: z.string().min(1),
  sourceQuote: z.string().min(1).optional(),
  deliverable: z.string().min(1).optional(),
  deadlineText: z.string().min(1).optional(),
  deadlineAt: z.string().datetime().optional(),
  deliveryCriteria: z.array(z.string().min(1)).default([]),
  nonDeliveryCriteria: z.array(z.string().min(1)).default([]),
  evidenceText: z.array(z.string().min(1)).default([]),
  evidenceUrls: z.array(z.string().url()).default([]),
  evaluatedAt: z.string().datetime().optional(),
});

export const StatusEvaluationResultSchema = z.object({
  proposedStatus: z.enum(evaluableStatuses),
  confidence: z.number().min(0).max(1),
  rationale: z.string().min(1),
  evidenceSummary: z.array(z.string().min(1)).default([]),
  matchedDeliveryCriteria: z.array(z.string().min(1)).default([]),
  unmetDeliveryCriteria: z.array(z.string().min(1)).default([]),
  reframeNotes: z.array(z.string().min(1)).optional(),
  needsHumanReview: z.boolean(),
});

export const ClaimStitchingCandidateSchema = z.object({
  id: z.string().min(1),
  normalizedClaim: z.string().min(1),
  deliverable: z.string().min(1).optional(),
  deadlineAt: z.string().datetime().optional(),
  sourceQuote: z.string().min(1).optional(),
});

export const ClaimStitchingInputSchema = z.object({
  primaryClaim: ClaimStitchingCandidateSchema,
  candidateClaims: z.array(ClaimStitchingCandidateSchema).min(1),
});

export const ClaimStitchingResultSchema = z.object({
  sameCommitment: z.boolean(),
  confidence: z.number().min(0).max(1),
  relatedClaimIds: z.array(z.string().min(1)).default([]),
  rationale: z.string().min(1),
  suggestedAction: z.enum([
    "LINK_ONLY",
    "MERGE",
    "SUPERSEDE",
    "NO_ACTION",
    "NEEDS_REVIEW",
  ]),
});

export type ClaimExtractionInput = z.infer<typeof ClaimExtractionInputSchema>;
export type ClaimExtractionResult = z.infer<typeof ClaimExtractionResultSchema>;
export type StatusEvaluationInput = z.infer<typeof StatusEvaluationInputSchema>;
export type StatusEvaluationResult = z.infer<typeof StatusEvaluationResultSchema>;
export type ClaimStitchingCandidate = z.infer<
  typeof ClaimStitchingCandidateSchema
>;
export type ClaimStitchingInput = z.infer<typeof ClaimStitchingInputSchema>;
export type ClaimStitchingResult = z.infer<typeof ClaimStitchingResultSchema>;
