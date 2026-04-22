export const CLOCKED_STATUSES = [
  "OPEN",
  "DELIVERED",
  "SLIPPED",
  "REFRAMED",
  "SUPERSEDED",
  "AMBIGUOUS",
] as const;

export const CLOCKABILITY_VERDICTS = [
  "CLOCKABLE",
  "NOT_CLOCKABLE",
  "NEEDS_REVIEW",
] as const;

export const PUBLIC_SAFE_STATUSES = [...CLOCKED_STATUSES, "NOT_CLOCKABLE"] as const;

export type ClockedStatus = (typeof CLOCKED_STATUSES)[number];
export type ClockabilityVerdict = (typeof CLOCKABILITY_VERDICTS)[number];
export type PublicSafeStatus = (typeof PUBLIC_SAFE_STATUSES)[number];

export type ClaimPolicyInput = {
  isOfficialSource: boolean;
  isManuallyApproved?: boolean;
  hasConcreteDeliverable: boolean;
  hasExplicitDeadline: boolean;
  deadlineSpecificity:
    | "EXPLICIT"
    | "BOUNDED"
    | "APPROXIMATE"
    | "VAGUE"
    | "NONE";
  canEvaluateWithPublicEvidence: boolean;
  canExplainCriteriaWithoutInventingFacts: boolean;
  isJokeOrMeme?: boolean;
  isRumorOrThirdPartyClaim?: boolean;
  containsHedgingLanguage?: boolean;
};

export type ClaimPolicyDecision = {
  verdict: ClockabilityVerdict;
  reason: string;
  needsReview: boolean;
  allowedPublicStatuses: ClockedStatus[];
};

export type DeadlineGuidance = {
  bucket: "HARD" | "SOFT" | "AMBIGUOUS" | "NONE";
  confidenceFloor: number;
  shouldAutoCreateClaim: boolean;
  shouldRequireReview: boolean;
  rationale: string;
};

export type StatusTransitionInput = {
  currentStatus: ClockedStatus;
  proposedStatus: Exclude<ClockedStatus, "OPEN">;
  deadlinePassed: boolean;
  evidenceConfidence: number;
  hasOfficialFollowUp?: boolean;
  isContested?: boolean;
};

export type StatusTransitionDecision = {
  allowed: boolean;
  requiresReview: boolean;
  rationale: string;
};

export const DEFAULT_ALLOWED_PUBLIC_STATUSES: ClockedStatus[] = [
  "OPEN",
  "DELIVERED",
  "SLIPPED",
  "REFRAMED",
  "SUPERSEDED",
  "AMBIGUOUS",
];

const NEEDS_REVIEW_STATUSES: ClockedStatus[] = ["AMBIGUOUS"];

export function evaluateClockability(input: ClaimPolicyInput): ClaimPolicyDecision {
  const sourceApproved = input.isOfficialSource || Boolean(input.isManuallyApproved);

  if (input.isJokeOrMeme) {
    return {
      verdict: "NOT_CLOCKABLE",
      reason: "Statement appears to be a joke, meme, or pure vibes rather than a concrete commitment.",
      needsReview: false,
      allowedPublicStatuses: [],
    };
  }

  if (input.isRumorOrThirdPartyClaim && !sourceApproved) {
    return {
      verdict: "NOT_CLOCKABLE",
      reason: "Third-party or rumor-based statements require manual approval before they can become public claims.",
      needsReview: false,
      allowedPublicStatuses: [],
    };
  }

  if (!sourceApproved) {
    return {
      verdict: "NEEDS_REVIEW",
      reason: "Source is not yet official or manually approved.",
      needsReview: true,
      allowedPublicStatuses: NEEDS_REVIEW_STATUSES,
    };
  }

  if (!input.hasConcreteDeliverable) {
    return {
      verdict: "NOT_CLOCKABLE",
      reason: "Statement does not contain a concrete deliverable that can be checked later.",
      needsReview: false,
      allowedPublicStatuses: [],
    };
  }

  if (!input.hasExplicitDeadline || input.deadlineSpecificity === "NONE") {
    return {
      verdict: "NOT_CLOCKABLE",
      reason: "Statement does not contain an explicit or clearly bounded deadline.",
      needsReview: false,
      allowedPublicStatuses: [],
    };
  }

  if (!input.canEvaluateWithPublicEvidence) {
    return {
      verdict: "NOT_CLOCKABLE",
      reason: "Outcome cannot be evaluated fairly with public evidence.",
      needsReview: false,
      allowedPublicStatuses: [],
    };
  }

  if (!input.canExplainCriteriaWithoutInventingFacts) {
    return {
      verdict: "NEEDS_REVIEW",
      reason: "Evaluation criteria are too uncertain to define safely without human review.",
      needsReview: true,
      allowedPublicStatuses: NEEDS_REVIEW_STATUSES,
    };
  }

  if (
    input.deadlineSpecificity === "APPROXIMATE" ||
    input.deadlineSpecificity === "VAGUE" ||
    input.containsHedgingLanguage
  ) {
    return {
      verdict: "NEEDS_REVIEW",
      reason: "Statement may be clockable, but the deadline or commitment wording is too hedged for automatic creation.",
      needsReview: true,
      allowedPublicStatuses: NEEDS_REVIEW_STATUSES,
    };
  }

  return {
    verdict: "CLOCKABLE",
    reason: "Statement is concrete, time-bounded, source-approved, and evaluable with public evidence.",
    needsReview: false,
    allowedPublicStatuses: DEFAULT_ALLOWED_PUBLIC_STATUSES,
  };
}

export function getDeadlineGuidance(
  specificity: ClaimPolicyInput["deadlineSpecificity"],
): DeadlineGuidance {
  switch (specificity) {
    case "EXPLICIT":
      return {
        bucket: "HARD",
        confidenceFloor: 0.9,
        shouldAutoCreateClaim: true,
        shouldRequireReview: false,
        rationale: "Explicit dates or clear end-of-period boundaries are suitable for automatic claim drafting.",
      };
    case "BOUNDED":
      return {
        bucket: "SOFT",
        confidenceFloor: 0.65,
        shouldAutoCreateClaim: true,
        shouldRequireReview: false,
        rationale: "Clearly bounded periods are acceptable, but the parsed deadline should preserve confidence metadata.",
      };
    case "APPROXIMATE":
      return {
        bucket: "AMBIGUOUS",
        confidenceFloor: 0.45,
        shouldAutoCreateClaim: false,
        shouldRequireReview: true,
        rationale: "Approximate timing such as 'around Friday' should create review, not automatic public claims.",
      };
    case "VAGUE":
      return {
        bucket: "AMBIGUOUS",
        confidenceFloor: 0.25,
        shouldAutoCreateClaim: false,
        shouldRequireReview: true,
        rationale: "Vague timing such as 'coming weeks' is not specific enough for automatic claim creation.",
      };
    case "NONE":
    default:
      return {
        bucket: "NONE",
        confidenceFloor: 0,
        shouldAutoCreateClaim: false,
        shouldRequireReview: false,
        rationale: "No usable deadline is present.",
      };
  }
}

export function shouldRequireReviewForStatusChange(
  input: StatusTransitionInput,
): StatusTransitionDecision {
  if (input.isContested) {
    return {
      allowed: true,
      requiresReview: true,
      rationale: "Contested evidence should always route through review.",
    };
  }

  if (input.proposedStatus === "SLIPPED" && input.deadlinePassed) {
    return {
      allowed: true,
      requiresReview: true,
      rationale: "Post-deadline slipped determinations require review by default.",
    };
  }

  if (input.proposedStatus === "DELIVERED" && input.evidenceConfidence < 0.8) {
    return {
      allowed: true,
      requiresReview: true,
      rationale: "Delivered should be reviewed unless the public evidence is strong and specific.",
    };
  }

  if (
    (input.proposedStatus === "REFRAMED" || input.proposedStatus === "SUPERSEDED") &&
    !input.hasOfficialFollowUp
  ) {
    return {
      allowed: true,
      requiresReview: true,
      rationale: "Reframed and superseded decisions should rely on official follow-up evidence.",
    };
  }

  if (input.proposedStatus === "AMBIGUOUS") {
    return {
      allowed: true,
      requiresReview: true,
      rationale: "Ambiguous is safe, but still benefits from review when used as a public status change.",
    };
  }

  return {
    allowed: true,
    requiresReview: false,
    rationale: "Status change can proceed under the current policy guardrails.",
  };
}

export function getPublicStatusLabel(status: PublicSafeStatus): string {
  switch (status) {
    case "NOT_CLOCKABLE":
      return "Not Clockable";
    case "OPEN":
      return "Open";
    case "DELIVERED":
      return "Delivered";
    case "SLIPPED":
      return "Slipped";
    case "REFRAMED":
      return "Reframed";
    case "SUPERSEDED":
      return "Superseded";
    case "AMBIGUOUS":
      return "Ambiguous";
    default:
      return status;
  }
}

export function getStatusSummary(status: ClockedStatus): string {
  switch (status) {
    case "OPEN":
      return "Accepted claim with an active or unresolved deadline.";
    case "DELIVERED":
      return "Public evidence indicates the delivery criteria were met.";
    case "SLIPPED":
      return "Deadline passed without public evidence that the original criteria were met on time.";
    case "REFRAMED":
      return "Official follow-up changed the scope or deadline in a material way.";
    case "SUPERSEDED":
      return "A newer official claim or cancellation replaced the original claim.";
    case "AMBIGUOUS":
      return "Public evidence is incomplete, mixed, or genuinely contested.";
    default:
      return "Neutral claim status.";
  }
}
