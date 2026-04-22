import type { XFilteredStreamRule, XPost } from "./types";

export const DEFAULT_TRIGGER_PHRASES = ["clock this", "clocked", "clock it"] as const;

export interface TriggerResolutionInput {
  triggerPost: XPost;
  parentPost?: XPost | null;
  quotedPost?: XPost | null;
}

export interface TriggerResolutionResult {
  targetPost: XPost | null;
  reason: "PARENT_POST" | "QUOTED_POST" | "NO_TARGET" | "RETWEET_IGNORED";
}

export function buildDefaultFilteredStreamRules(botHandle: string): XFilteredStreamRule[] {
  return DEFAULT_TRIGGER_PHRASES.map((phrase) => ({
    tag: `clocked:${phrase.replace(/\s+/g, "_")}`,
    value: buildRuleValue(botHandle, phrase)
  }));
}

export function buildRuleValue(botHandle: string, phrase: string): string {
  const normalizedHandle = normalizeHandle(botHandle);
  return `@${normalizedHandle} "${phrase}" -is:retweet`;
}

export function normalizeHandle(handle: string): string {
  return handle.replace(/^@/, "").trim();
}

export function extractTriggerPhrase(text: string): string | null {
  const lower = text.toLowerCase();

  for (const phrase of DEFAULT_TRIGGER_PHRASES) {
    if (lower.includes(phrase)) {
      return phrase;
    }
  }

  return null;
}

export function isRetweetLike(post: XPost): boolean {
  return post.referencedPosts.some((reference) => reference.type === "retweeted") || /^RT\s+@/i.test(post.text);
}

export function resolveTriggerTarget(input: TriggerResolutionInput): TriggerResolutionResult {
  if (isRetweetLike(input.triggerPost)) {
    return {
      targetPost: null,
      reason: "RETWEET_IGNORED"
    };
  }

  if (input.parentPost) {
    return {
      targetPost: input.parentPost,
      reason: "PARENT_POST"
    };
  }

  if (input.quotedPost) {
    return {
      targetPost: input.quotedPost,
      reason: "QUOTED_POST"
    };
  }

  return {
    targetPost: null,
    reason: "NO_TARGET"
  };
}
