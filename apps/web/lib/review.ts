import { z } from "zod";
import {
  createCanonicalHash,
  createClaimSlug,
  createProjectSlug
} from "@clocked/core";
import { prisma, type Prisma, ReviewKind } from "@clocked/db";
import {
  formatClockableReply,
  formatNeedsReviewReply,
  formatNotClockableReply
} from "@clocked/x-client";

import { getAppBaseUrl } from "./env";

type ReviewActionResult =
  | {
      action: "CLAIM_CREATE";
      reviewItemId: string;
      claimId: string;
      publicSlug: string;
      botReplyId: string;
    }
  | {
      action: "BOT_REPLY";
      reviewItemId: string;
      botReplyId: string;
      status: "APPROVED";
    }
  | {
      action: "STATUS_CHANGE";
      reviewItemId: string;
      claimId: string;
      status: string;
      statusEventId: string;
    }
  | {
      action: "HEYANON_EVIDENCE" | "EVIDENCE_REVIEW";
      reviewItemId: string;
      claimId: string;
      evidenceId: string;
    }
  | {
      action: "CLAIM_STITCH";
      reviewItemId: string;
      status: "APPROVED";
    };

type DbClient = Prisma.TransactionClient | typeof prisma;

const claimStatusSchema = z.enum([
  "OPEN",
  "DELIVERED",
  "SLIPPED",
  "REFRAMED",
  "SUPERSEDED",
  "AMBIGUOUS"
]);

const claimCreatePayloadSchema = z.object({
  verdict: z.literal("CLOCKABLE"),
  projectName: z.string().min(1),
  projectSlug: z.string().optional(),
  projectId: z.string().optional(),
  actorHandle: z.string().min(1).optional(),
  actorId: z.string().optional(),
  sourcePostId: z.string().optional(),
  sourcePlatform: z
    .enum(["X", "TELEGRAM", "DISCORD", "GITHUB", "GITBOOK", "HEYANON", "MANUAL"])
    .optional(),
  sourcePlatformPostId: z.string().optional(),
  sourceUrl: z.string().optional(),
  sourcePostedAt: z.string().optional(),
  sourceText: z.string().optional(),
  sourceQuote: z.string().min(1),
  normalizedClaim: z.string().min(1),
  deliverable: z.string().min(1),
  deadlineText: z.string().min(1),
  deadlineAt: z.string().min(1),
  deadlineTimezone: z.string().default("UTC"),
  deadlineConfidence: z.number().min(0).max(1),
  extractionConfidence: z.number().min(0).max(1).default(0.8),
  deliveryCriteria: z.array(z.string()).min(1),
  nonDeliveryCriteria: z.array(z.string()).min(1),
  ambiguityNotes: z.array(z.string()).default([]),
  relatedClaimIds: z.array(z.string()).default([]),
  heyAnonContextJson: z.unknown().optional(),
  triggerId: z.string().optional(),
  replyToPlatformPostId: z.string().optional(),
  reason: z.string().optional()
});

const statusChangePayloadSchema = z.object({
  claimId: z.string().min(1),
  proposedStatus: claimStatusSchema,
  reason: z.string().min(1).optional(),
  rationale: z.string().min(1).optional(),
  evidenceSummary: z.array(z.string()).optional()
});

const evidenceReviewPayloadSchema = z.object({
  claimId: z.string().min(1),
  sourcePostId: z.string().optional(),
  evidenceType: z
    .enum([
      "SOURCE",
      "FOLLOW_UP",
      "DELIVERY_PROOF",
      "REFRAME",
      "SUPERSEDING_CLAIM",
      "MANUAL_NOTE",
      "HEYANON_GEMMA_RESULT",
      "GITHUB_ACTIVITY",
      "GITBOOK_CHANGE",
      "COMMUNITY_SIGNAL"
    ])
    .default("MANUAL_NOTE"),
  url: z.string().optional(),
  summary: z.string().min(1),
  occurredAt: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0.6),
  rawJson: z.unknown().optional()
});

const botReplyPayloadSchema = z.object({
  botReplyId: z.string().min(1)
});

function stringArray(value: string[]): string[] {
  return [...value];
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

function toPlatform(
  value?: "X" | "TELEGRAM" | "DISCORD" | "GITHUB" | "GITBOOK" | "HEYANON" | "MANUAL"
) {
  return value ?? "MANUAL";
}

function toStatusReason(payload: z.infer<typeof statusChangePayloadSchema>): string {
  return payload.reason ?? payload.rationale ?? "";
}

export class ReviewActionError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function ensureProject(
  tx: DbClient,
  payload: z.infer<typeof claimCreatePayloadSchema>
) {
  if (payload.projectId) {
    const existing = await tx.project.findUnique({ where: { id: payload.projectId } });
    if (!existing) {
      throw new ReviewActionError(400, "Invalid payload: project not found.");
    }
    return existing;
  }

  const slug = payload.projectSlug ?? createProjectSlug(payload.projectName);
  return tx.project.upsert({
    where: { slug },
    update: { name: payload.projectName },
    create: {
      slug,
      name: payload.projectName
    }
  });
}

async function ensureActor(
  tx: DbClient,
  payload: z.infer<typeof claimCreatePayloadSchema>,
  projectId?: string | null
) {
  if (payload.actorId) {
    const existing = await tx.actor.findUnique({ where: { id: payload.actorId } });
    if (!existing) {
      throw new ReviewActionError(400, "Invalid payload: actor not found.");
    }
    return existing;
  }

  if (!payload.actorHandle) {
    return null;
  }

  const cleanHandle = payload.actorHandle.replace(/^@/, "");
  return tx.actor.upsert({
    where: {
      platform_handle: {
        platform: "X",
        handle: cleanHandle
      }
    },
    update: {
      projectId: projectId ?? undefined
    },
    create: {
      platform: "X",
      handle: cleanHandle,
      displayName: cleanHandle,
      actorType: "UNKNOWN",
      verifiedSource: false,
      projectId: projectId ?? null
    }
  });
}

async function ensureSourcePost(
  tx: DbClient,
  payload: z.infer<typeof claimCreatePayloadSchema>,
  actorId?: string | null
) {
  if (payload.sourcePostId) {
    const existing = await tx.sourcePost.findUnique({ where: { id: payload.sourcePostId } });
    if (!existing) {
      throw new ReviewActionError(400, "Invalid payload: source post not found.");
    }
    return existing;
  }

  const platform = toPlatform(payload.sourcePlatform);
  if (payload.sourcePlatformPostId) {
    return tx.sourcePost.upsert({
      where: {
        platform_platformPostId: {
          platform,
          platformPostId: payload.sourcePlatformPostId
        }
      },
      update: {
        url: payload.sourceUrl ?? null,
        authorId: actorId ?? null,
        text: payload.sourceText ?? payload.sourceQuote,
        postedAt: payload.sourcePostedAt ? new Date(payload.sourcePostedAt) : null,
        rawJson: toJsonValue(payload),
        contentHash: createCanonicalHash({
          normalizedClaim: payload.normalizedClaim,
          deadlineText: payload.deadlineText,
          deliverable: payload.deliverable,
          actorHandle: payload.actorHandle ?? "",
          projectSlug: payload.projectSlug ?? ""
        }),
        sourceConfidence: payload.extractionConfidence
      },
      create: {
        platform,
        platformPostId: payload.sourcePlatformPostId,
        url: payload.sourceUrl ?? null,
        authorId: actorId ?? null,
        text: payload.sourceText ?? payload.sourceQuote,
        postedAt: payload.sourcePostedAt ? new Date(payload.sourcePostedAt) : null,
        rawJson: toJsonValue(payload),
        contentHash: createCanonicalHash({
          normalizedClaim: payload.normalizedClaim,
          deadlineText: payload.deadlineText,
          deliverable: payload.deliverable,
          actorHandle: payload.actorHandle ?? "",
          projectSlug: payload.projectSlug ?? ""
        }),
        sourceConfidence: payload.extractionConfidence
      }
    });
  }

  return tx.sourcePost.create({
    data: {
      platform,
      url: payload.sourceUrl ?? null,
      authorId: actorId ?? null,
      text: payload.sourceText ?? payload.sourceQuote,
      postedAt: payload.sourcePostedAt ? new Date(payload.sourcePostedAt) : null,
      rawJson: toJsonValue(payload),
      contentHash: createCanonicalHash({
        normalizedClaim: payload.normalizedClaim,
        deadlineText: payload.deadlineText,
        deliverable: payload.deliverable,
        actorHandle: payload.actorHandle ?? "",
        projectSlug: payload.projectSlug ?? ""
      }),
      sourceConfidence: payload.extractionConfidence
    }
  });
}

async function approveClaimCreate(
  reviewItemId: string,
  payload: z.infer<typeof claimCreatePayloadSchema>
): Promise<ReviewActionResult> {
  return prisma.$transaction(async (tx) => {
    const project = await ensureProject(tx, payload);
    const actor = await ensureActor(tx, payload, project?.id);
    const sourcePost = await ensureSourcePost(tx, payload, actor?.id ?? null);
    const publicSlug = createClaimSlug(project?.name ?? "claim", payload.normalizedClaim);

    const claim = await tx.claim.upsert({
      where: { publicSlug },
      update: {
        projectId: project?.id ?? null,
        actorId: actor?.id ?? null,
        sourcePostId: sourcePost.id,
        canonicalHash: createCanonicalHash({
          projectSlug: project?.slug,
          actorHandle: actor?.handle,
          normalizedClaim: payload.normalizedClaim,
          deadlineText: payload.deadlineText,
          deliverable: payload.deliverable
        }),
        status: "OPEN",
        normalizedClaim: payload.normalizedClaim,
        sourceQuote: payload.sourceQuote,
        deliverable: payload.deliverable,
        deadlineText: payload.deadlineText,
        deadlineAt: new Date(payload.deadlineAt),
        deadlineTimezone: payload.deadlineTimezone,
        deadlineConfidence: payload.deadlineConfidence,
        extractionConfidence: payload.extractionConfidence,
        deliveryCriteriaJson: stringArray(payload.deliveryCriteria),
        nonDeliveryCriteriaJson: stringArray(payload.nonDeliveryCriteria),
        ambiguityNotesJson: stringArray(payload.ambiguityNotes),
        relatedClaimIdsJson: stringArray(payload.relatedClaimIds),
        heyAnonContextJson:
          payload.heyAnonContextJson === undefined
            ? undefined
            : toJsonValue(payload.heyAnonContextJson)
      },
      create: {
        publicSlug,
        projectId: project?.id ?? null,
        actorId: actor?.id ?? null,
        sourcePostId: sourcePost.id,
        canonicalHash: createCanonicalHash({
          projectSlug: project?.slug,
          actorHandle: actor?.handle,
          normalizedClaim: payload.normalizedClaim,
          deadlineText: payload.deadlineText,
          deliverable: payload.deliverable
        }),
        status: "OPEN",
        normalizedClaim: payload.normalizedClaim,
        sourceQuote: payload.sourceQuote,
        deliverable: payload.deliverable,
        deadlineText: payload.deadlineText,
        deadlineAt: new Date(payload.deadlineAt),
        deadlineTimezone: payload.deadlineTimezone,
        deadlineConfidence: payload.deadlineConfidence,
        extractionConfidence: payload.extractionConfidence,
        deliveryCriteriaJson: stringArray(payload.deliveryCriteria),
        nonDeliveryCriteriaJson: stringArray(payload.nonDeliveryCriteria),
        ambiguityNotesJson: stringArray(payload.ambiguityNotes),
        relatedClaimIdsJson: stringArray(payload.relatedClaimIds),
        heyAnonContextJson:
          payload.heyAnonContextJson === undefined
            ? undefined
            : toJsonValue(payload.heyAnonContextJson)
      }
    });

    const existingStatusEvent = await tx.statusEvent.findFirst({
      where: {
        claimId: claim.id,
        toStatus: "OPEN",
        reason: payload.reason ?? "Claim approved from review."
      }
    });
    const statusEvent =
      existingStatusEvent ??
      (await tx.statusEvent.create({
        data: {
          claimId: claim.id,
          toStatus: "OPEN",
          reason: payload.reason ?? "Claim approved from review.",
          actorType: "ADMIN"
        }
      }));

    const publicUrl = `${getAppBaseUrl().replace(/\/$/, "")}/c/${claim.publicSlug}`;
    const replyText = formatClockableReply({
      shortClaim: claim.normalizedClaim.slice(0, 90),
      deadlineDisplay: claim.deadlineText,
      claimUrl: publicUrl
    });

    const existingBotReply = await tx.botReply.findFirst({
      where: {
        claimId: claim.id,
        triggerId: payload.triggerId ?? null,
        status: "DRAFT"
      }
    });
    const botReply =
      existingBotReply ??
      (await tx.botReply.create({
        data: {
          claimId: claim.id,
          triggerId: payload.triggerId ?? null,
          platform: "X",
          replyToPlatformPostId: payload.replyToPlatformPostId ?? null,
          proposedText: replyText,
          status: "DRAFT"
        }
      }));

    await tx.reviewItem.update({
      where: { id: reviewItemId },
      data: {
        status: "APPROVED",
        reviewedAt: new Date()
      }
    });

    void statusEvent;
    return {
      action: "CLAIM_CREATE",
      reviewItemId,
      claimId: claim.id,
      publicSlug: claim.publicSlug,
      botReplyId: botReply.id
    };
  });
}

async function approveStatusChange(
  reviewItemId: string,
  payload: z.infer<typeof statusChangePayloadSchema>
): Promise<ReviewActionResult> {
  const reason = toStatusReason(payload);
  if (!reason) {
    throw new ReviewActionError(400, "Invalid payload: STATUS_CHANGE requires a reason.");
  }

  return prisma.$transaction(async (tx) => {
    const claim = await tx.claim.findUnique({ where: { id: payload.claimId } });
    if (!claim) {
      throw new ReviewActionError(404, "Claim not found.");
    }

    await tx.claim.update({
      where: { id: claim.id },
      data: { status: payload.proposedStatus }
    });

    const statusEvent = await tx.statusEvent.create({
      data: {
        claimId: claim.id,
        fromStatus: claim.status,
        toStatus: payload.proposedStatus,
        reason,
        evidenceJson:
          payload.evidenceSummary === undefined
            ? undefined
            : toJsonValue(payload.evidenceSummary),
        actorType: "ADMIN"
      }
    });

    await tx.reviewItem.update({
      where: { id: reviewItemId },
      data: {
        status: "APPROVED",
        reviewedAt: new Date()
      }
    });

    return {
      action: "STATUS_CHANGE",
      reviewItemId,
      claimId: claim.id,
      status: payload.proposedStatus,
      statusEventId: statusEvent.id
    };
  });
}

async function approveEvidenceReview(
  reviewItemId: string,
  payload: z.infer<typeof evidenceReviewPayloadSchema>,
  action: "HEYANON_EVIDENCE" | "EVIDENCE_REVIEW"
): Promise<ReviewActionResult> {
  return prisma.$transaction(async (tx) => {
    const claim = await tx.claim.findUnique({ where: { id: payload.claimId } });
    if (!claim) {
      throw new ReviewActionError(404, "Claim not found.");
    }

    const evidence = await tx.evidence.create({
      data: {
        claimId: payload.claimId,
        sourcePostId: payload.sourcePostId ?? null,
        evidenceType: payload.evidenceType,
        url: payload.url ?? null,
        summary: payload.summary,
        occurredAt: payload.occurredAt ? new Date(payload.occurredAt) : null,
        confidence: payload.confidence,
        rawJson:
          payload.rawJson === undefined ? undefined : toJsonValue(payload.rawJson)
      }
    });

    await tx.reviewItem.update({
      where: { id: reviewItemId },
      data: {
        status: "APPROVED",
        reviewedAt: new Date()
      }
    });

    return {
      action,
      reviewItemId,
      claimId: payload.claimId,
      evidenceId: evidence.id
    };
  });
}

async function approveBotReply(
  reviewItemId: string,
  payload: z.infer<typeof botReplyPayloadSchema>
): Promise<ReviewActionResult> {
  return prisma.$transaction(async (tx) => {
    const botReply = await tx.botReply.findUnique({ where: { id: payload.botReplyId } });
    if (!botReply) {
      throw new ReviewActionError(404, "Bot reply not found.");
    }

    const updated = await tx.botReply.update({
      where: { id: payload.botReplyId },
      data: { status: "APPROVED" }
    });

    await tx.reviewItem.update({
      where: { id: reviewItemId },
      data: {
        status: "APPROVED",
        reviewedAt: new Date()
      }
    });

    return {
      action: "BOT_REPLY",
      reviewItemId,
      botReplyId: updated.id,
      status: "APPROVED"
    };
  });
}

export async function approveReviewItem(reviewItemId: string): Promise<ReviewActionResult> {
  const reviewItem = await prisma.reviewItem.findUnique({ where: { id: reviewItemId } });
  if (!reviewItem) {
    throw new ReviewActionError(404, "Review item not found.");
  }

  if (reviewItem.status !== "PENDING") {
    throw new ReviewActionError(409, "Review item has already been reviewed.");
  }

  const payload = ((reviewItem.payloadJson ?? {}) as Record<string, unknown>) ?? {};

  switch (reviewItem.kind) {
    case ReviewKind.CLAIM_CREATE:
      return approveClaimCreate(reviewItem.id, claimCreatePayloadSchema.parse(payload));
    case ReviewKind.STATUS_CHANGE:
      return approveStatusChange(reviewItem.id, statusChangePayloadSchema.parse(payload));
    case ReviewKind.EVIDENCE_REVIEW:
      return approveEvidenceReview(
        reviewItem.id,
        evidenceReviewPayloadSchema.parse(payload),
        "EVIDENCE_REVIEW"
      );
    case ReviewKind.HEYANON_EVIDENCE:
      return approveEvidenceReview(
        reviewItem.id,
        evidenceReviewPayloadSchema.parse(payload),
        "HEYANON_EVIDENCE"
      );
    case ReviewKind.BOT_REPLY:
      return approveBotReply(reviewItem.id, botReplyPayloadSchema.parse(payload));
    case ReviewKind.CLAIM_STITCH:
      await prisma.reviewItem.update({
        where: { id: reviewItem.id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date()
        }
      });
      return {
        action: "CLAIM_STITCH",
        reviewItemId: reviewItem.id,
        status: "APPROVED"
      };
    default:
      throw new ReviewActionError(400, "Unsupported review item kind.");
  }
}

export async function rejectReviewItem(reviewItemId: string, reason?: string) {
  const reviewItem = await prisma.reviewItem.findUnique({ where: { id: reviewItemId } });
  if (!reviewItem) {
    throw new ReviewActionError(404, "Review item not found.");
  }

  if (reviewItem.status !== "PENDING") {
    throw new ReviewActionError(409, "Review item has already been reviewed.");
  }

  const updated = await prisma.reviewItem.update({
    where: { id: reviewItemId },
    data: { status: "REJECTED", reviewedAt: new Date(), reason: reason?.trim() || null }
  });

  return {
    ok: true,
    reviewItemId: updated.id,
    status: updated.status,
    reason: updated.reason
  };
}

export function previewReplyForVerdict(input: {
  verdict: "CLOCKABLE" | "NOT_CLOCKABLE" | "NEEDS_REVIEW";
  shortClaim?: string;
  deadlineDisplay?: string;
  claimUrl?: string;
  reason?: string;
}) {
  if (input.verdict === "NOT_CLOCKABLE") {
    return formatNotClockableReply({
      reason: input.reason ?? "Needs a concrete deliverable and deadline."
    });
  }

  if (input.verdict === "NEEDS_REVIEW") {
    return formatNeedsReviewReply();
  }

  return formatClockableReply({
    shortClaim: input.shortClaim ?? "Claim under review",
    deadlineDisplay: input.deadlineDisplay ?? "Needs review",
    claimUrl: input.claimUrl ?? `${getAppBaseUrl()}/c/pending`
  });
}
