import { describe, expect, it } from "vitest";

import { parseXUrl } from "../src/parseXUrl.js";

describe("parseXUrl", () => {
  it("parses x.com status URLs", () => {
    expect(parseXUrl("https://x.com/examplefounder/status/1234567890")).toEqual({
      platform: "X",
      handle: "examplefounder",
      postId: "1234567890",
      canonicalUrl: "https://x.com/examplefounder/status/1234567890"
    });
  });

  it("parses twitter.com status URLs with query params", () => {
    expect(
      parseXUrl("https://twitter.com/examplefounder/status/1234567890?s=20")
    ).toMatchObject({
      handle: "examplefounder",
      postId: "1234567890",
      canonicalUrl: "https://x.com/examplefounder/status/1234567890"
    });
  });

  it("parses trailing slashes", () => {
    expect(parseXUrl("https://x.com/examplefounder/status/1234567890/")).toMatchObject(
      {
        handle: "examplefounder",
        postId: "1234567890"
      }
    );
  });

  it("rejects invalid URLs", () => {
    expect(() => parseXUrl("not-a-url")).toThrow("Invalid X URL.");
  });

  it("rejects missing status ids", () => {
    expect(() => parseXUrl("https://x.com/examplefounder/status/")).toThrow(
      "X URL is missing a status ID."
    );
  });
});
