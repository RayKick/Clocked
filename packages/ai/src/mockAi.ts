import {
  ClaimExtractionInputSchema,
  ClaimExtractionResultSchema,
  ClaimStitchingInputSchema,
  ClaimStitchingResultSchema,
  StatusEvaluationInputSchema,
  StatusEvaluationResultSchema,
  type ClaimExtractionInput,
  type ClaimExtractionResult,
  type ClaimStitchingCandidate,
  type ClaimStitchingInput,
  type ClaimStitchingResult,
  type StatusEvaluationInput,
  type StatusEvaluationResult,
} from "./schemas";
import { detectAmbiguityNotes, parseDeadlineFromText } from "./dateParsing";

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function toSentenceCase(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getFirstSentence(text: string): string {
  const trimmed = normalizeWhitespace(text);
  const match = trimmed.match(/(.+?[.!?])(?:\s|$)/);
  return match?.[1] ?? trimmed;
}

function inferActorType(
  input: ClaimExtractionInput,
): ClaimExtractionResult["suggestedActorType"] {
  const handle = input.sourceAuthorHandle?.toLowerCase() ?? "";
  const project = input.projectName?.toLowerCase() ?? "";

  if (handle.includes("founder") || handle.includes("ceo")) {
    return "FOUNDER";
  }

  if (
    (project && handle.includes(project.replace(/\s+/g, ""))) ||
    handle.includes("official")
  ) {
    return "OFFICIAL_PROJECT";
  }

  return "UNKNOWN";
}

function inferDeliverable(text: string): string | undefined {
  const normalized = normalizeWhitespace(text);
  const lowered = normalized.toLowerCase();
  const patterns: Array<[RegExp, string | ((match: RegExpMatchArray) => string)]> =
    [
      [/\b(v\d+)\b/i, (match) => `${(match[1] ?? "V1").toUpperCase()} release`],
      [/\bmainnet\b/i, "mainnet launch"],
      [/\bpublic beta\b/i, "public beta launch"],
      [/\bbeta\b/i, "beta launch"],
      [/\bbuybacks\b/i, "buybacks start"],
      [/\baudit report\b/i, "audit report publication"],
      [/\bdocs\b/i, "documentation publication"],
      [/\btokenomics\b/i, "tokenomics publication"],
      [/\btestnet\b/i, "testnet launch"],
      [/\bairdrop\b/i, "airdrop distribution"],
      [/\bstaking\b/i, "staking launch"],
      [/\brewards\b/i, "rewards release"],
    ];

  for (const [pattern, value] of patterns) {
    const match = normalized.match(pattern);

    if (match) {
      return typeof value === "function" ? value(match) : value;
    }
  }

  if (/\b(launch|ship|release|publish|drop|start|open)\b/.test(lowered)) {
    const simplified = normalized
      .replace(/\b(by|before|on|in|tomorrow|next week|this week|this month)\b.*$/i, "")
      .replace(/^(we|i)\s+(will|are going to|plan to|expect to)\s+/i, "")
      .replace(/\.$/, "");
    return simplified || undefined;
  }

  return undefined;
}

function hasConcreteDeliverable(text: string): boolean {
  const lowered = text.toLowerCase();
  if (inferDeliverable(text)) {
    return true;
  }

  return /\b(launch|ship|release|publish|report|beta|mainnet|testnet|docs|buybacks|audit|airdrop|staking|rewards)\b/.test(
    lowered,
  );
}

function isVagueOnly(text: string): boolean {
  const lowered = text.toLowerCase();
  const vaguePatterns = [
    /\bsoon\b/,
    /\bcooking\b/,
    /\bbig things coming\b/,
    /\bwhen ready\b/,
    /\beventually\b/,
    /\bexploring\b/,
    /\bthinking about\b/,
    /\bstay tuned\b/,
  ];

  return vaguePatterns.some((pattern) => pattern.test(lowered));
}

function deriveDeliveryCriteria(deliverable?: string): string[] {
  if (!deliverable) {
    return [];
  }

  if (deliverable.includes("launch")) {
    return [
      "A public launch announcement or accessible release is published.",
      "Users can access the launched product or environment.",
    ];
  }

  if (deliverable.includes("publication")) {
    return ["The referenced document is publicly posted or linked by the source."];
  }

  if (deliverable.includes("buybacks")) {
    return ["A public update confirms buybacks started within the stated window."];
  }

  return [`Public evidence shows ${deliverable} happened within scope.`];
}

function deriveNonDeliveryCriteria(deliverable?: string): string[] {
  if (!deliverable) {
    return [];
  }

  return [
    `No public evidence shows ${deliverable} by the stated deadline.`,
    "Only vague teasers or future-looking updates appear without the promised deliverable.",
  ];
}

function buildNormalizedClaim(input: ClaimExtractionInput, deliverable?: string): string | undefined {
  const deadline = parseDeadlineFromText(input).deadlineText;

  if (deliverable && deadline) {
    return `${toSentenceCase(deliverable)} is promised by ${deadline}.`;
  }

  if (deliverable) {
    return `${toSentenceCase(deliverable)} is being promised publicly.`;
  }

  return undefined;
}

function summarizeEvidence(input: StatusEvaluationInput): string[] {
  return [...input.evidenceText, ...input.evidenceUrls]
    .slice(0, 5)
    .map((item) => normalizeWhitespace(item).slice(0, 180));
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function scoreOverlap(primary: ClaimStitchingCandidate, candidate: ClaimStitchingCandidate): number {
  const left = new Set(
    tokenize([primary.normalizedClaim, primary.deliverable, primary.sourceQuote].filter(Boolean).join(" ")),
  );
  const right = new Set(
    tokenize([candidate.normalizedClaim, candidate.deliverable, candidate.sourceQuote].filter(Boolean).join(" ")),
  );

  if (left.size === 0 || right.size === 0) {
    return 0;
  }

  let shared = 0;
  for (const token of left) {
    if (right.has(token)) {
      shared += 1;
    }
  }

  const deadlineBonus =
    primary.deadlineAt && candidate.deadlineAt && primary.deadlineAt === candidate.deadlineAt
      ? 0.25
      : 0;

  return shared / Math.max(left.size, right.size) + deadlineBonus;
}

export class MockAiClient {
  extractClaim(
    input: ClaimExtractionInput,
  ): Promise<ClaimExtractionResult> {
    const parsedInput = ClaimExtractionInputSchema.parse(input);
    const sourceQuote = getFirstSentence(parsedInput.text);
    const ambiguityNotes = detectAmbiguityNotes(parsedInput.text);
    const deadline = parseDeadlineFromText(parsedInput);
    const deliverable = inferDeliverable(parsedInput.text);
    const concreteDeliverable = hasConcreteDeliverable(parsedInput.text);
    const verdict = (() => {
      if (!concreteDeliverable && isVagueOnly(parsedInput.text)) {
        return "NOT_CLOCKABLE" as const;
      }

      if (ambiguityNotes.length > 0) {
        return "NEEDS_REVIEW" as const;
      }

      if (!deadline.deadlineText) {
        return "NOT_CLOCKABLE" as const;
      }

      if (!concreteDeliverable) {
        return "NOT_CLOCKABLE" as const;
      }

      return "CLOCKABLE" as const;
    })();

    const result: ClaimExtractionResult = {
      verdict,
      confidence:
        verdict === "CLOCKABLE" ? 0.86 : verdict === "NEEDS_REVIEW" ? 0.68 : 0.93,
      notClockableReason:
        verdict === "NOT_CLOCKABLE"
          ? concreteDeliverable
            ? "The statement does not include a clear, bounded deadline."
            : "The statement is hype or commentary without a concrete deliverable and deadline."
          : undefined,
      normalizedClaim:
        verdict === "NOT_CLOCKABLE"
          ? undefined
          : buildNormalizedClaim(parsedInput, deliverable),
      sourceQuote,
      deliverable,
      deadlineText: deadline.deadlineText,
      deadlineAt: deadline.deadlineAt,
      deadlineTimezone: deadline.deadlineTimezone,
      deadlineConfidence: deadline.deadlineConfidence,
      deliveryCriteria:
        verdict === "NOT_CLOCKABLE" ? [] : deriveDeliveryCriteria(deliverable),
      nonDeliveryCriteria:
        verdict === "NOT_CLOCKABLE" ? [] : deriveNonDeliveryCriteria(deliverable),
      ambiguityNotes,
      suggestedProjectName: parsedInput.projectName,
      suggestedActorType: inferActorType(parsedInput),
      publicCardHeadline:
        verdict === "NOT_CLOCKABLE"
          ? "Not Clockable"
          : toSentenceCase(deliverable ?? "Claim under review"),
      publicCardSubline:
        verdict === "CLOCKABLE"
          ? `Deadline: ${deadline.deadlineText}`
          : verdict === "NEEDS_REVIEW"
            ? "Deliverable or deadline needs review."
            : "Needs a concrete deliverable and deadline.",
    };

    return Promise.resolve(ClaimExtractionResultSchema.parse(result));
  }

  evaluateStatus(
    input: StatusEvaluationInput,
  ): Promise<StatusEvaluationResult> {
    const parsed = StatusEvaluationInputSchema.parse(input);
    const evidenceBlob = parsed.evidenceText.join(" \n ").toLowerCase();
    const evidenceSummary = summarizeEvidence(parsed);
    const matchedDeliveryCriteria = parsed.deliveryCriteria.filter((criterion) =>
      evidenceBlob.includes(criterion.toLowerCase().split(" ").slice(-2).join(" ")),
    );
    const deliverableHint = parsed.deliverable?.toLowerCase() ?? parsed.normalizedClaim.toLowerCase();

    if (
      /\b(launched|live|shipped|published|released|deployed|available now)\b/.test(
        evidenceBlob,
      ) &&
      tokenize(evidenceBlob).some((token) => deliverableHint.includes(token))
    ) {
      return Promise.resolve(StatusEvaluationResultSchema.parse({
        proposedStatus: "DELIVERED",
        confidence: 0.84,
        rationale: "Public evidence references the promised deliverable as launched or available.",
        evidenceSummary,
        matchedDeliveryCriteria:
          matchedDeliveryCriteria.length > 0
            ? matchedDeliveryCriteria
            : parsed.deliveryCriteria,
        unmetDeliveryCriteria: [],
        needsHumanReview: true,
      }));
    }

    if (
      /\b(instead|replacing|supersede|superseded|cancelled|canceled|no longer)\b/.test(
        evidenceBlob,
      )
    ) {
      return Promise.resolve(StatusEvaluationResultSchema.parse({
        proposedStatus: "SUPERSEDED",
        confidence: 0.77,
        rationale: "Follow-up evidence suggests the original commitment was replaced by a newer official direction.",
        evidenceSummary,
        matchedDeliveryCriteria: [],
        unmetDeliveryCriteria: parsed.deliveryCriteria,
        reframeNotes: ["A later update appears to replace the original commitment."],
        needsHumanReview: true,
      }));
    }

    if (
      /\b(delay|delayed|postpone|postponed|pushed|moving to|extended|next month|next quarter)\b/.test(
        evidenceBlob,
      )
    ) {
      return Promise.resolve(StatusEvaluationResultSchema.parse({
        proposedStatus: "REFRAMED",
        confidence: 0.8,
        rationale: "Official follow-up language appears to move the deadline or narrow the original scope.",
        evidenceSummary,
        matchedDeliveryCriteria: [],
        unmetDeliveryCriteria: parsed.deliveryCriteria,
        reframeNotes: ["Later evidence appears to materially change deadline or scope."],
        needsHumanReview: true,
      }));
    }

    const deadlinePassed =
      parsed.deadlineAt !== undefined &&
      new Date(parsed.deadlineAt).getTime() < new Date(parsed.evaluatedAt ?? new Date().toISOString()).getTime();

    if (deadlinePassed && evidenceBlob.length === 0) {
      return Promise.resolve(StatusEvaluationResultSchema.parse({
        proposedStatus: "SLIPPED",
        confidence: 0.74,
        rationale: "The claim deadline appears to have passed without public evidence meeting the delivery criteria.",
        evidenceSummary,
        matchedDeliveryCriteria: [],
        unmetDeliveryCriteria: parsed.deliveryCriteria,
        needsHumanReview: true,
      }));
    }

    return Promise.resolve(StatusEvaluationResultSchema.parse({
      proposedStatus: "AMBIGUOUS",
      confidence: 0.61,
      rationale: "The available evidence is insufficient to confirm delivery or a clear official reframe.",
      evidenceSummary,
      matchedDeliveryCriteria,
      unmetDeliveryCriteria: parsed.deliveryCriteria.filter(
        (criterion) => !matchedDeliveryCriteria.includes(criterion),
      ),
      needsHumanReview: true,
    }));
  }

  stitchClaims(
    input: ClaimStitchingInput,
  ): Promise<ClaimStitchingResult> {
    const parsed = ClaimStitchingInputSchema.parse(input);
    const scored = parsed.candidateClaims.map((candidate) => ({
      candidate,
      score: scoreOverlap(parsed.primaryClaim, candidate),
    }));
    const strongest = scored.filter((entry) => entry.score >= 0.35);
    const relatedClaimIds = strongest.map((entry) => entry.candidate.id);
    const topScore = strongest[0]?.score ?? 0;
    const sameCommitment = topScore >= 0.5;
    const suggestedAction = (() => {
      if (topScore >= 0.8) {
        return "MERGE" as const;
      }

      if (topScore >= 0.5) {
        return "LINK_ONLY" as const;
      }

      if (topScore >= 0.35) {
        return "NEEDS_REVIEW" as const;
      }

      return "NO_ACTION" as const;
    })();

    return Promise.resolve(ClaimStitchingResultSchema.parse({
      sameCommitment,
      confidence: Math.min(0.92, Number((topScore + 0.15).toFixed(2))),
      relatedClaimIds,
      rationale:
        strongest.length > 0
          ? `The claims share overlapping deliverable and timing language with a max similarity score of ${topScore.toFixed(2)}.`
          : "The candidate claims do not share enough deliverable or deadline language to treat them as the same commitment.",
      suggestedAction,
    }));
  }
}

export function createMockAiClient(): MockAiClient {
  return new MockAiClient();
}
