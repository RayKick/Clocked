import { extractClaim, type ClaimExtractionResult } from "@clocked/ai";
import { createCanonicalHash, createProjectSlug } from "@clocked/core";
import { prisma, type Prisma } from "@clocked/db";
import { parseXUrl, canReadFromX, createXClient, readXEnvironment } from "@clocked/x-client";
import { z } from "zod";

const ingestXPostInputSchema = z.object({
  url: z.string().url(),
  sourceText: z.string().trim().min(1).optional(),
  projectSlug: z.string().trim().min(1).optional(),
  actorHandle: z.string().trim().min(1).optional(),
  postedAt: z.string().datetime().optional()
});

const KNOWN_MOCK_POSTS: Record<
  string,
  {
    text: string;
    postedAt: string;
  }
> = {
  "https://x.com/examplefounder/status/1234567890": {
    text: "Rewards dashboard ships by Friday.",
    postedAt: "2026-04-16T09:00:00.000Z"
  }
};

export class IngestXPostError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

function trimHandle(handle?: string | null): string | undefined {
  return handle?.replace(/^@/, "").trim() || undefined;
}

function hasApprovableClaimData(extraction: ClaimExtractionResult): boolean {
  return Boolean(
    extraction.normalizedClaim &&
      extraction.sourceQuote &&
      extraction.deliverable &&
      extraction.deadlineText &&
      extraction.deadlineAt &&
      extraction.deliveryCriteria?.length &&
      extraction.nonDeliveryCriteria?.length
  );
}

function buildClaimCreatePayload(input: {
  extraction: ClaimExtractionResult;
  sourcePostId: string;
  triggerId: string;
  sourceUrl: string;
  sourcePlatformPostId: string;
  sourcePostedAt?: string;
  sourceText: string;
  actorHandle?: string;
  actorId?: string;
  projectName: string;
  projectSlug?: string;
  projectId?: string;
}) {
  return {
    triggerId: input.triggerId,
    sourcePostId: input.sourcePostId,
    sourcePlatform: "X" as const,
    sourcePlatformPostId: input.sourcePlatformPostId,
    sourceUrl: input.sourceUrl,
    sourcePostedAt: input.sourcePostedAt,
    sourceText: input.sourceText,
    sourceQuote: input.extraction.sourceQuote,
    actorHandle: input.actorHandle,
    actorId: input.actorId,
    projectName: input.projectName,
    projectSlug: input.projectSlug,
    projectId: input.projectId,
    verdict: input.extraction.verdict,
    normalizedClaim: input.extraction.normalizedClaim,
    deliverable: input.extraction.deliverable,
    deadlineText: input.extraction.deadlineText,
    deadlineAt: input.extraction.deadlineAt,
    deadlineTimezone: input.extraction.deadlineTimezone,
    deadlineConfidence: input.extraction.deadlineConfidence,
    extractionConfidence: input.extraction.confidence,
    deliveryCriteria: input.extraction.deliveryCriteria,
    nonDeliveryCriteria: input.extraction.nonDeliveryCriteria,
    ambiguityNotes: input.extraction.ambiguityNotes,
    notClockableReason: input.extraction.notClockableReason,
    replyToPlatformPostId: input.sourcePlatformPostId
  };
}

async function resolveSourceText(input: {
  parsedUrl: ReturnType<typeof parseXUrl>;
  sourceText?: string;
  postedAt?: string;
  actorHandle?: string;
}) {
  if (input.sourceText) {
    return {
      text: input.sourceText,
      postedAt: input.postedAt,
      authorHandle: trimHandle(input.actorHandle) ?? input.parsedUrl.handle,
      raw: {
        mocked: true,
        mode: "SOURCE_TEXT_OVERRIDE"
      }
    };
  }

  const knownMock = KNOWN_MOCK_POSTS[input.parsedUrl.canonicalUrl];
  if (knownMock) {
    return {
      text: knownMock.text,
      postedAt: input.postedAt ?? knownMock.postedAt,
      authorHandle: trimHandle(input.actorHandle) ?? input.parsedUrl.handle,
      raw: {
        mocked: true,
        mode: "KNOWN_FIXTURE_URL"
      }
    };
  }

  const environment = readXEnvironment();
  const readCheck = canReadFromX(environment);
  if (!readCheck.ok) {
    throw new IngestXPostError(
      503,
      "X read unavailable in dry-run. Provide sourceText or enable X_READ_ENABLED with read credentials."
    );
  }

  try {
    const client = createXClient({ environment });
    const post = await client.getPostById(input.parsedUrl.postId);
    if (!post) {
      throw new IngestXPostError(503, "X read unavailable or post not found.");
    }

    return {
      text: post.text,
      postedAt: input.postedAt ?? post.createdAt,
      authorHandle:
        trimHandle(input.actorHandle) ?? trimHandle(post.authorHandle) ?? input.parsedUrl.handle,
      raw: {
        mocked: false,
        mode: "LIVE_READ",
        response: post.raw ?? null
      }
    };
  } catch (error) {
    if (error instanceof IngestXPostError) {
      throw error;
    }

    throw new IngestXPostError(
      503,
      error instanceof Error ? error.message : "X read unavailable."
    );
  }
}

export async function ingestXPost(input: unknown) {
  const parsed = ingestXPostInputSchema.parse(input);
  const parsedUrl = parseXUrl(parsed.url);

  const explicitProject = parsed.projectSlug
    ? await prisma.project.findUnique({
        where: { slug: parsed.projectSlug }
      })
    : null;

  if (parsed.projectSlug && !explicitProject) {
    throw new IngestXPostError(404, "Project not found.");
  }

  const explicitActorHandle = trimHandle(parsed.actorHandle);
  const explicitActor = explicitActorHandle
    ? await prisma.actor.findUnique({
        where: {
          platform_handle: {
            platform: "X",
            handle: explicitActorHandle
          }
        },
        include: { project: true }
      })
    : null;

  if (explicitActorHandle && !explicitActor) {
    throw new IngestXPostError(404, "Actor not found.");
  }

  const actorFromUrl =
    explicitActor ??
    (await prisma.actor.findUnique({
      where: {
        platform_handle: {
          platform: "X",
          handle: parsedUrl.handle
        }
      },
      include: { project: true }
    }));

  const project = explicitProject ?? explicitActor?.project ?? actorFromUrl?.project ?? null;
  const resolvedSource = await resolveSourceText({
    parsedUrl,
    sourceText: parsed.sourceText,
    postedAt: parsed.postedAt,
    actorHandle: explicitActorHandle ?? actorFromUrl?.handle ?? parsedUrl.handle
  });

  const extraction = await extractClaim(
    {
      text: resolvedSource.text,
      sourcePostedAt: resolvedSource.postedAt,
      sourceAuthorHandle: resolvedSource.authorHandle,
      projectName: project?.name
    },
    { mode: "mock" }
  );

  const projectName =
    project?.name ??
    extraction.suggestedProjectName ??
    (parsed.projectSlug ? parsed.projectSlug.replace(/-/g, " ") : resolvedSource.authorHandle);

  const sourcePost = await prisma.sourcePost.upsert({
    where: {
      platform_platformPostId: {
        platform: "X",
        platformPostId: parsedUrl.postId
      }
    },
    update: {
      url: parsedUrl.canonicalUrl,
      authorId: explicitActor?.id ?? actorFromUrl?.id ?? null,
      text: resolvedSource.text,
      postedAt: resolvedSource.postedAt ? new Date(resolvedSource.postedAt) : null,
      rawJson: toJsonValue({
        ingestion: "admin-x-post",
        parsedUrl,
        source: resolvedSource.raw
      }),
      contentHash: createCanonicalHash({
        projectSlug: project?.slug ?? parsed.projectSlug ?? null,
        actorHandle: resolvedSource.authorHandle,
        normalizedClaim: resolvedSource.text,
        deadlineText: parsedUrl.postId,
        deliverable: "x-post"
      }),
      sourceConfidence: resolvedSource.raw.mocked ? 0.74 : 0.9
    },
    create: {
      platform: "X",
      platformPostId: parsedUrl.postId,
      url: parsedUrl.canonicalUrl,
      authorId: explicitActor?.id ?? actorFromUrl?.id ?? null,
      text: resolvedSource.text,
      postedAt: resolvedSource.postedAt ? new Date(resolvedSource.postedAt) : null,
      rawJson: toJsonValue({
        ingestion: "admin-x-post",
        parsedUrl,
        source: resolvedSource.raw
      }),
      contentHash: createCanonicalHash({
        projectSlug: project?.slug ?? parsed.projectSlug ?? null,
        actorHandle: resolvedSource.authorHandle,
        normalizedClaim: resolvedSource.text,
        deadlineText: parsedUrl.postId,
        deliverable: "x-post"
      }),
      sourceConfidence: resolvedSource.raw.mocked ? 0.74 : 0.9
    }
  });

  const triggerStatus = extraction.verdict === "NOT_CLOCKABLE" ? "IGNORED" : "REVIEW_CREATED";
  const trigger = await prisma.trigger.upsert({
    where: {
      platform_platformTriggerPostId: {
        platform: "X",
        platformTriggerPostId: parsedUrl.postId
      }
    },
    update: {
      triggerSourcePostId: sourcePost.id,
      targetSourcePostId: sourcePost.id,
      requestedByHandle: "admin",
      phrase: "admin ingest",
      status: triggerStatus,
      error:
        extraction.verdict === "NOT_CLOCKABLE"
          ? extraction.notClockableReason ?? "Not clockable."
          : null
    },
    create: {
      platform: "X",
      platformTriggerPostId: parsedUrl.postId,
      triggerSourcePostId: sourcePost.id,
      targetSourcePostId: sourcePost.id,
      requestedByHandle: "admin",
      phrase: "admin ingest",
      status: triggerStatus,
      error:
        extraction.verdict === "NOT_CLOCKABLE"
          ? extraction.notClockableReason ?? "Not clockable."
          : null
    }
  });

  const payload = buildClaimCreatePayload({
    extraction,
    sourcePostId: sourcePost.id,
    triggerId: trigger.id,
    sourceUrl: parsedUrl.canonicalUrl,
    sourcePlatformPostId: parsedUrl.postId,
    sourcePostedAt: resolvedSource.postedAt,
    sourceText: resolvedSource.text,
    actorHandle: explicitActor?.handle ?? actorFromUrl?.handle ?? resolvedSource.authorHandle,
    actorId: explicitActor?.id ?? actorFromUrl?.id,
    projectName,
    projectSlug: project?.slug ?? parsed.projectSlug ?? createProjectSlug(projectName),
    projectId: project?.id
  });

  const reviewReason =
    extraction.verdict === "NOT_CLOCKABLE"
      ? `Admin ingest classified ${parsedUrl.canonicalUrl} as NOT_CLOCKABLE.`
      : `Admin ingest created a claim draft from ${parsedUrl.canonicalUrl}.`;

  const existingReviewItem = await prisma.reviewItem.findFirst({
    where: {
      kind: "CLAIM_CREATE",
      status: "PENDING",
      reason: reviewReason
    }
  });

  const reviewItem = existingReviewItem
    ? await prisma.reviewItem.update({
        where: { id: existingReviewItem.id },
        data: {
          payloadJson: payload,
          reason: reviewReason
        }
      })
    : await prisma.reviewItem.create({
        data: {
          kind: "CLAIM_CREATE",
          payloadJson: payload,
          reason: reviewReason
        }
      });

  if (extraction.verdict === "NOT_CLOCKABLE") {
    return {
      reviewItemId: reviewItem.id,
      verdict: extraction.verdict,
      reason:
        extraction.notClockableReason ?? "Missing concrete deliverable and bounded deadline.",
      message:
        "Created a non-public review item. This X post was not considered clockable and no public claim was created."
    };
  }

  if (extraction.verdict === "NEEDS_REVIEW" && !hasApprovableClaimData(extraction)) {
    return {
      reviewItemId: reviewItem.id,
      verdict: extraction.verdict,
      normalizedClaim: extraction.normalizedClaim ?? null,
      deadlineAt: extraction.deadlineAt ?? null,
      message:
        "Created a pending review item with ambiguous claim data. Review before attempting approval."
    };
  }

  return {
    reviewItemId: reviewItem.id,
    verdict: extraction.verdict,
    normalizedClaim: extraction.normalizedClaim ?? null,
    deadlineAt: extraction.deadlineAt ?? null,
    message:
      extraction.verdict === "NEEDS_REVIEW"
        ? "Created a pending review item with enough data for human approval."
        : "Created a pending review item. Approval is still required before any public receipt exists."
  };
}

export { ingestXPostInputSchema };
