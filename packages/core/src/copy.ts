import type { ClockedStatus, ClockabilityVerdict } from "./claimPolicy";
import { getPublicStatusLabel } from "./claimPolicy";

export const PUBLIC_COPY_GUARDRAILS = {
  prohibitedTerms: ["liar", "scam", "fraud", "rug", "rugpull", "rug pull"],
  preferredFallbacks: {
    liar: "source wording disputed",
    scam: "public concerns",
    fraud: "serious allegation",
    rug: "project collapse",
    rugpull: "project collapse",
    "rug pull": "project collapse",
  },
} as const;

export function getStatusBadgeCopy(status: ClockedStatus): string {
  return getPublicStatusLabel(status);
}

export function getStatusHeadline(status: ClockedStatus): string {
  switch (status) {
    case "OPEN":
      return "Open receipt";
    case "DELIVERED":
      return "Delivered receipt";
    case "SLIPPED":
      return "Slipped receipt";
    case "REFRAMED":
      return "Reframed receipt";
    case "SUPERSEDED":
      return "Superseded receipt";
    case "AMBIGUOUS":
      return "Ambiguous receipt";
    default:
      return "Claim receipt";
  }
}

export function getStatusBodyCopy(status: ClockedStatus): string {
  switch (status) {
    case "OPEN":
      return "This claim has been accepted and remains open against its recorded deadline and evidence criteria.";
    case "DELIVERED":
      return "Public evidence suggests the recorded delivery criteria were met.";
    case "SLIPPED":
      return "The recorded deadline passed without confirmed public evidence that the original criteria were met on time.";
    case "REFRAMED":
      return "A later official update appears to have changed the scope or timing of the original claim.";
    case "SUPERSEDED":
      return "A newer official statement appears to have replaced this claim as the primary public reference.";
    case "AMBIGUOUS":
      return "The available public evidence does not support a cleaner status with enough confidence yet.";
    default:
      return "This receipt preserves the source, timeline, and available evidence.";
  }
}

export function getVerdictHeadline(verdict: ClockabilityVerdict): string {
  switch (verdict) {
    case "CLOCKABLE":
      return "Clockable";
    case "NOT_CLOCKABLE":
      return "Not Clockable";
    case "NEEDS_REVIEW":
      return "Needs Review";
    default:
      return "Review";
  }
}

export function getVerdictBodyCopy(verdict: ClockabilityVerdict): string {
  switch (verdict) {
    case "CLOCKABLE":
      return "This statement appears concrete, time-bounded, and suitable for a public receipt.";
    case "NOT_CLOCKABLE":
      return "This statement does not yet contain a concrete deliverable and deadline that can be evaluated fairly.";
    case "NEEDS_REVIEW":
      return "This statement may be clockable, but the source, deadline, or deliverable needs human review first.";
    default:
      return "Review is required.";
  }
}

export function getDisputeFlowCopy(): string[] {
  return [
    "Preserve the original source and quote.",
    "Add corrected evidence or context through review.",
    "Record the reason for any status change.",
    "Prefer Ambiguous when the public evidence is genuinely contested.",
  ];
}

export function getEvidencePromptCopy(): string {
  return "Submit public evidence that clarifies delivery, slippage, reframing, or superseding updates.";
}

export function getNeutralReceiptSubline(status: ClockedStatus): string {
  switch (status) {
    case "DELIVERED":
      return "Public delivery evidence recorded.";
    case "SLIPPED":
      return "Deadline passed pending recorded delivery evidence.";
    case "REFRAMED":
      return "Official follow-up changed the claim context.";
    case "SUPERSEDED":
      return "A newer official claim replaced this one.";
    case "AMBIGUOUS":
      return "Public evidence remains mixed or incomplete.";
    case "OPEN":
    default:
      return "Public source, deadline, and evidence criteria preserved.";
  }
}

export function sanitizePublicCopy(text: string): string {
  let sanitized = text;

  for (const term of PUBLIC_COPY_GUARDRAILS.prohibitedTerms) {
    const fallback =
      PUBLIC_COPY_GUARDRAILS.preferredFallbacks[term];
    const pattern = new RegExp(`\\b${escapeRegExp(term)}\\b`, "gi");
    sanitized = sanitized.replace(pattern, fallback);
  }

  return sanitized.replace(/\s+/g, " ").trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
