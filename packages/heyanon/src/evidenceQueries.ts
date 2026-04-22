import type { ClaimRecord } from "@clocked/core";

import type { GemmaClient, HeyAnonClient } from "./types";

export async function buildEvidenceReviewBundle(input: {
  claim: Pick<
    ClaimRecord,
    "id" | "normalizedClaim" | "deadlineText" | "deadlineAt" | "deliverable"
  >;
  projectSlug?: string;
  heyanonClient: HeyAnonClient;
  gemmaClient: GemmaClient;
}): Promise<{
  summary: string;
  evidence: string[];
}> {
  const prompt = `Collect public follow-up evidence for this claim: ${input.claim.normalizedClaim}. Deadline: ${input.claim.deadlineText}.`;
  const [heyanon, gemma] = await Promise.all([
    input.heyanonClient.queryDeliveryEvidence({
      claimId: input.claim.id,
      projectSlug: input.projectSlug,
      prompt,
      sources: [],
      timeframe: {}
    }),
    input.gemmaClient.getHistoricalContext({
      projectSlug: input.projectSlug ?? "unknown-project",
      timeframeLabel: input.claim.deadlineText
    })
  ]);

  return {
    summary: heyanon.summary,
    evidence: [...heyanon.evidence, ...gemma.evidence]
  };
}

