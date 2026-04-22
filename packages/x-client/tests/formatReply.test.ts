import { describe, expect, it } from "vitest";

import { formatClockableReply, formatNeedsReviewReply, formatNotClockableReply } from "../src/formatReply.js";

describe("formatReply", () => {
  it("formats a CLOCKED reply within X limits", () => {
    const reply = formatClockableReply({
      shortClaim: "V2 ships next week",
      deadlineDisplay: "End of next ISO week",
      claimUrl: "https://clocked.example/c/v2-next-week"
    });

    expect(reply).toContain("CLOCKED");
    expect(reply).toContain("Status: OPEN");
    expect(reply.length).toBeLessThanOrEqual(280);
  });

  it("formats a NOT CLOCKABLE reply with the safe explanation", () => {
    const reply = formatNotClockableReply({
      reason: "No concrete deadline"
    });

    expect(reply).toContain("NOT CLOCKABLE");
    expect(reply).toContain("Needs a concrete deliverable + deadline.");
  });

  it("formats a NEEDS REVIEW reply", () => {
    const reply = formatNeedsReviewReply();

    expect(reply).toContain("NEEDS REVIEW");
    expect(reply).toContain("Receipt pending.");
  });
});
