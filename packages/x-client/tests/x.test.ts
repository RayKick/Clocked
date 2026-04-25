import { describe, expect, it } from "vitest";

import { formatNotClockableReply } from "../src/formatReply";

describe("x-client reply formatting", () => {
  it("formats not-clockable replies", () => {
    expect(formatNotClockableReply({ reason: "Missing deadline" })).toContain("NOT CLOCKABLE");
  });
});
