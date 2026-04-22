import { canPostApprovedBotReply, createXClient, postApprovedBotReply } from "@clocked/x-client";
import { prisma } from "@clocked/db";

export async function runReviewWorker() {
  const approvedReplies = await prisma.botReply.findMany({
    where: { status: "APPROVED", platform: "X" },
    take: 10,
    orderBy: { createdAt: "asc" }
  });

  const client = createXClient();
  let processed = 0;

  for (const reply of approvedReplies) {
    const check = canPostApprovedBotReply({
      id: reply.id,
      claimId: reply.claimId ?? undefined,
      triggerId: reply.triggerId ?? undefined,
      platform: "X",
      replyToPlatformPostId: reply.replyToPlatformPostId ?? undefined,
      proposedText: reply.proposedText,
      status: reply.status
    });

    if (!check.ok) {
      continue;
    }

    const result = await postApprovedBotReply({
      client,
      botReply: {
        id: reply.id,
        claimId: reply.claimId ?? undefined,
        triggerId: reply.triggerId ?? undefined,
        platform: "X",
        replyToPlatformPostId: reply.replyToPlatformPostId ?? undefined,
        proposedText: reply.proposedText,
        status: reply.status
      }
    });

    if (result.action === "POSTED" && result.post) {
      await prisma.botReply.update({
        where: { id: reply.id },
        data: {
          status: "POSTED",
          postedPlatformPostId: result.post.id
        }
      });
      processed += 1;
    }
  }

  return { processed };
}

