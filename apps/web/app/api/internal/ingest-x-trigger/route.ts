import { extractClaim } from "@clocked/ai";
import { createClaimSlug, createProjectSlug } from "@clocked/core";
import { prisma } from "@clocked/db";
import { NextResponse } from "next/server";

import { getAiMode } from "../../../../lib/aiMode";

export async function POST(request: Request) {
  const body = await request.json();
  const extraction = await extractClaim(
    {
      text: String(body.targetText ?? body.text ?? ""),
      sourcePostedAt: body.targetPostedAt,
      sourceAuthorHandle: body.targetAuthorHandle,
      projectName: body.projectName
    },
    { mode: getAiMode() }
  );

  const sourcePost = await prisma.sourcePost.create({
    data: {
      platform: "X",
      platformPostId: body.targetPostId ?? null,
      url: body.targetUrl ?? null,
      text: String(body.targetText ?? ""),
      postedAt: body.targetPostedAt ? new Date(body.targetPostedAt) : null,
      rawJson: body,
      contentHash: createClaimSlug(
        body.projectName ?? "source",
        String(body.targetText ?? "source")
      ),
      sourceConfidence: 0.9
    }
  });

  const trigger = await prisma.trigger.create({
    data: {
      platform: "X",
      platformTriggerPostId: body.triggerPostId ?? null,
      triggerSourcePostId: sourcePost.id,
      targetSourcePostId: sourcePost.id,
      requestedByHandle: body.requestedByHandle ?? null,
      phrase: body.phrase ?? "clock this",
      status: "REVIEW_CREATED"
    }
  });

  const projectSlug = body.projectName ? createProjectSlug(body.projectName) : undefined;
  await prisma.reviewItem.create({
    data: {
      kind: "CLAIM_CREATE",
      payloadJson: {
        triggerId: trigger.id,
        sourcePostId: sourcePost.id,
        actorHandle: body.targetAuthorHandle,
        projectName: body.projectName,
        projectSlug,
        verdict: extraction.verdict,
        normalizedClaim: extraction.normalizedClaim,
        sourceQuote: extraction.sourceQuote,
        deliverable: extraction.deliverable,
        deadlineText: extraction.deadlineText,
        deadlineAt: extraction.deadlineAt,
        deadlineTimezone: extraction.deadlineTimezone,
        deadlineConfidence: extraction.deadlineConfidence,
        extractionConfidence: extraction.confidence,
        deliveryCriteria: extraction.deliveryCriteria,
        nonDeliveryCriteria: extraction.nonDeliveryCriteria,
        ambiguityNotes: extraction.ambiguityNotes,
        notClockableReason: extraction.notClockableReason
      },
      reason: `Triggered by ${body.requestedByHandle ?? "community"} via X mention.`
    }
  });

  return NextResponse.json({ ok: true, triggerId: trigger.id, extraction });
}
