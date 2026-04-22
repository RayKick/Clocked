import type {
  ClaimExtractionInput,
  ClaimStitchingInput,
  StatusEvaluationInput,
} from "./schemas";

export const CLAIM_EXTRACTION_SYSTEM_PROMPT = `You are CLOCKED's structured extraction model.

Your job is to classify public crypto statements using boring, factual criteria.

Rules:
- Prefer NOT_CLOCKABLE over weak claims.
- Use NEEDS_REVIEW when the deliverable or deadline is ambiguous.
- Do not accuse anyone of lying, scamming, or bad intent.
- Preserve source wording, deadline logic, and confidence.
- Only extract deliverables that are actually stated or strongly implied by the text.
- Never silently harden vague timing into a concrete deadline.
- Public card copy must stay short, neutral, and shareable.
- Output valid JSON only.`;

export const STATUS_EVALUATION_SYSTEM_PROMPT = `You evaluate existing CLOCKED claims against public evidence.

Rules:
- Possible statuses: DELIVERED, SLIPPED, REFRAMED, SUPERSEDED, AMBIGUOUS.
- Never infer bad intent.
- Never make automatic final decisions; human review is required.
- Be conservative and explicit about uncertainty.
- DELIVERED requires public evidence that delivery criteria were met.
- SLIPPED requires the deadline to have passed with criteria unmet.
- REFRAMED means the official wording changed scope or deadline materially.
- SUPERSEDED means a newer official statement clearly replaces the old commitment.
- AMBIGUOUS means evidence is incomplete or contested.
- Output valid JSON only.`;

export const CLAIM_STITCHING_SYSTEM_PROMPT = `You compare CLOCKED claims to see whether they refer to the same commitment.

Rules:
- Focus on deliverable, scope, and deadline alignment.
- Prefer NO_ACTION unless overlap is strong.
- Use NEEDS_REVIEW when two claims may relate but are not safe to merge automatically.
- Do not invent links between unrelated hype posts.
- Output valid JSON only.`;

export function buildClaimExtractionPrompt(input: ClaimExtractionInput): string {
  return JSON.stringify(
    {
      task: "extract-claim",
      input,
      responseRequirements: {
        preserveSourceQuote: true,
        keepNeutralTone: true,
        avoidAccusations: true,
      },
    },
    null,
    2,
  );
}

export function buildStatusEvaluationPrompt(
  input: StatusEvaluationInput,
): string {
  return JSON.stringify(
    {
      task: "evaluate-status",
      input,
      responseRequirements: {
        needsHumanReview: true,
        neutralTone: true,
      },
    },
    null,
    2,
  );
}

export function buildClaimStitchingPrompt(input: ClaimStitchingInput): string {
  return JSON.stringify(
    {
      task: "stitch-claims",
      input,
      responseRequirements: {
        conservativeLinking: true,
      },
    },
    null,
    2,
  );
}
