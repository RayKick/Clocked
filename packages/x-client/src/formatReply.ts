import type { XBotReply } from "./types";

const CLOCKED_HEADER = "\u23f1\ufe0f CLOCKED";
const NOT_CLOCKABLE_HEADER = "\u23f1\ufe0f NOT CLOCKABLE";
const NEEDS_REVIEW_HEADER = "\u23f1\ufe0f NEEDS REVIEW";
const X_MAX_LENGTH = 280;

export interface ClockableReplyInput {
  shortClaim: string;
  deadlineDisplay: string;
  claimUrl: string;
}

export interface NotClockableReplyInput {
  reason: string;
}

export function formatClockableReply(input: ClockableReplyInput): string {
  return trimToLimit(
    [
      CLOCKED_HEADER,
      "",
      `Claim: ${input.shortClaim}`,
      `Deadline: ${input.deadlineDisplay}`,
      "Status: OPEN",
      "",
      `Receipt: ${input.claimUrl}`
    ].join("\n")
  );
}

export function formatNotClockableReply(input: NotClockableReplyInput): string {
  return trimToLimit(
    [NOT_CLOCKABLE_HEADER, "", `Reason: ${input.reason}`, "", "Needs a concrete deliverable + deadline."].join(
      "\n"
    )
  );
}

export function formatNeedsReviewReply(): string {
  return trimToLimit(
    [
      NEEDS_REVIEW_HEADER,
      "",
      "This looks potentially clockable, but the deadline or deliverable is ambiguous.",
      "",
      "Receipt pending."
    ].join("\n")
  );
}

export function toDraftBotReply(input: Omit<XBotReply, "platform">): XBotReply {
  return {
    ...input,
    platform: "X"
  };
}

export function trimToLimit(text: string, maxLength = X_MAX_LENGTH): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}\u2026`;
}
