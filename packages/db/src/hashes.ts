import { createHash } from "node:crypto";

type CanonicalClaimHashInput = {
  actorId?: string | null;
  projectId?: string | null;
  normalizedClaim: string;
  deliverable: string;
  deadlineAt?: Date | string | null;
  deadlineText: string;
  sourcePostId?: string | null;
};

type SourcePostHashInput = {
  platform: string;
  platformPostId?: string | null;
  url?: string | null;
  authorHandle?: string | null;
  text: string;
  postedAt?: Date | string | null;
};

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeDate(value?: Date | string | null): string {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : value;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function buildClaimCanonicalHashInput(
  input: CanonicalClaimHashInput,
): string {
  return JSON.stringify({
    actorId: input.actorId ?? "",
    projectId: input.projectId ?? "",
    normalizedClaim: normalizeText(input.normalizedClaim),
    deliverable: normalizeText(input.deliverable),
    deadlineAt: normalizeDate(input.deadlineAt),
    deadlineText: normalizeText(input.deadlineText),
    sourcePostId: input.sourcePostId ?? "",
  });
}

export function computeClaimCanonicalHash(
  input: CanonicalClaimHashInput,
): string {
  return sha256(buildClaimCanonicalHashInput(input));
}

export function buildSourcePostHashInput(
  input: SourcePostHashInput,
): string {
  return JSON.stringify({
    platform: input.platform,
    platformPostId: input.platformPostId ?? "",
    url: input.url ?? "",
    authorHandle: normalizeText(input.authorHandle ?? ""),
    text: normalizeText(input.text),
    postedAt: normalizeDate(input.postedAt),
  });
}

export function computeSourcePostContentHash(
  input: SourcePostHashInput,
): string {
  return sha256(buildSourcePostHashInput(input));
}
