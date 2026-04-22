import { z } from "zod";

import {
  actorPlatforms,
  actorTypes,
  botPlatforms,
  botReplyStatuses,
  callerTypes,
  claimStatuses,
  evidenceTypes,
  heyAnonQueryStatuses,
  heyAnonQueryTypes,
  invocationStatuses,
  jobKinds,
  jobStatuses,
  reviewKinds,
  reviewStatuses,
  statusActorTypes,
  triggerStatuses
} from "./statuses";

export const actorPlatformSchema = z.enum(actorPlatforms);
export const actorTypeSchema = z.enum(actorTypes);
export const claimStatusSchema = z.enum(claimStatuses);
export const reviewKindSchema = z.enum(reviewKinds);
export const reviewStatusSchema = z.enum(reviewStatuses);
export const evidenceTypeSchema = z.enum(evidenceTypes);
export const triggerStatusSchema = z.enum(triggerStatuses);
export const statusActorTypeSchema = z.enum(statusActorTypes);
export const botPlatformSchema = z.enum(botPlatforms);
export const botReplyStatusSchema = z.enum(botReplyStatuses);
export const jobKindSchema = z.enum(jobKinds);
export const jobStatusSchema = z.enum(jobStatuses);
export const heyAnonQueryTypeSchema = z.enum(heyAnonQueryTypes);
export const heyAnonQueryStatusSchema = z.enum(heyAnonQueryStatuses);
export const callerTypeSchema = z.enum(callerTypes);
export const invocationStatusSchema = z.enum(invocationStatuses);

export const countsByStatusSchema = z.object({
  OPEN: z.number().int().nonnegative(),
  DELIVERED: z.number().int().nonnegative(),
  SLIPPED: z.number().int().nonnegative(),
  REFRAMED: z.number().int().nonnegative(),
  SUPERSEDED: z.number().int().nonnegative(),
  AMBIGUOUS: z.number().int().nonnegative()
});

export const sourcePostSchema = z.object({
  id: z.string(),
  platform: actorPlatformSchema,
  url: z.string().url().optional().nullable(),
  text: z.string(),
  postedAt: z.date().optional().nullable(),
  capturedAt: z.date(),
  contentHash: z.string(),
  sourceConfidence: z.number()
});

export const evidenceSchema = z.object({
  id: z.string(),
  claimId: z.string(),
  sourcePostId: z.string().optional().nullable(),
  evidenceType: evidenceTypeSchema,
  url: z.string().url().optional().nullable(),
  summary: z.string(),
  occurredAt: z.date().optional().nullable(),
  confidence: z.number(),
  rawJson: z.unknown().optional().nullable(),
  createdAt: z.date()
});

export const statusEventSchema = z.object({
  id: z.string(),
  claimId: z.string(),
  fromStatus: claimStatusSchema.optional().nullable(),
  toStatus: claimStatusSchema,
  reason: z.string(),
  evidenceJson: z.unknown().optional().nullable(),
  actorType: statusActorTypeSchema,
  createdAt: z.date()
});

export const reviewItemSchema = z.object({
  id: z.string(),
  kind: reviewKindSchema,
  status: reviewStatusSchema,
  payloadJson: z.unknown(),
  reason: z.string().optional().nullable(),
  createdAt: z.date(),
  reviewedAt: z.date().optional().nullable()
});

export const projectSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  officialXHandle: z.string().optional().nullable(),
  officialTelegram: z.string().optional().nullable(),
  officialDiscord: z.string().optional().nullable(),
  gitHubOrg: z.string().optional().nullable(),
  gitBookUrl: z.string().url().optional().nullable(),
  heyAnonProjectKey: z.string().optional().nullable(),
  launchpadAgentId: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const actorSchema = z.object({
  id: z.string(),
  platform: actorPlatformSchema,
  handle: z.string(),
  displayName: z.string().optional().nullable(),
  platformUserId: z.string().optional().nullable(),
  actorType: actorTypeSchema,
  projectId: z.string().optional().nullable(),
  verifiedSource: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const claimSchema = z.object({
  id: z.string(),
  publicSlug: z.string(),
  projectId: z.string().optional().nullable(),
  actorId: z.string().optional().nullable(),
  sourcePostId: z.string(),
  canonicalHash: z.string(),
  status: claimStatusSchema,
  normalizedClaim: z.string(),
  sourceQuote: z.string(),
  deliverable: z.string(),
  deadlineText: z.string(),
  deadlineAt: z.date().optional().nullable(),
  deadlineTimezone: z.string().optional().nullable(),
  deadlineConfidence: z.number(),
  extractionConfidence: z.number(),
  deliveryCriteriaJson: z.array(z.string()),
  nonDeliveryCriteriaJson: z.array(z.string()),
  ambiguityNotesJson: z.array(z.string()),
  relatedClaimIdsJson: z.array(z.string()),
  heyAnonContextJson: z.unknown().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const claimWithRelationsSchema = claimSchema.extend({
  project: projectSchema.optional().nullable(),
  actor: actorSchema.optional().nullable(),
  sourcePost: sourcePostSchema,
  evidence: z.array(evidenceSchema).default([]),
  statusEvents: z.array(statusEventSchema).default([])
});

export type CountsByStatus = z.infer<typeof countsByStatusSchema>;
export type ProjectRecordClaim = z.infer<typeof claimWithRelationsSchema>;
export type ClaimRecord = z.infer<typeof claimSchema>;
export type SourcePostRecord = z.infer<typeof sourcePostSchema>;
export type EvidenceRecord = z.infer<typeof evidenceSchema>;
export type StatusEventRecord = z.infer<typeof statusEventSchema>;
export type ReviewItemRecord = z.infer<typeof reviewItemSchema>;
export type ProjectRecord = z.infer<typeof projectSchema>;
export type ActorRecord = z.infer<typeof actorSchema>;

