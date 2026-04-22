import { createHash } from "node:crypto";

type HashInput = {
  projectSlug?: string | null;
  actorHandle?: string | null;
  normalizedClaim: string;
  deadlineText?: string | null;
  deliverable?: string | null;
};

function normalizeText(value?: string | null): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function createCanonicalHash(input: HashInput): string {
  const joined = [
    normalizeText(input.projectSlug),
    normalizeText(input.actorHandle),
    normalizeText(input.normalizedClaim),
    normalizeText(input.deadlineText),
    normalizeText(input.deliverable)
  ].join("|");

  return createHash("sha256").update(joined).digest("hex");
}

export function areDuplicateClaims(a: HashInput, b: HashInput): boolean {
  return createCanonicalHash(a) === createCanonicalHash(b);
}

