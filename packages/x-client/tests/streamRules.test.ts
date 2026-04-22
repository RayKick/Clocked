import { describe, expect, it } from "vitest";

import {
  buildDefaultFilteredStreamRules,
  extractTriggerPhrase,
  resolveTriggerTarget
} from "../src/streamRules.js";
import type { XPost } from "../src/types.js";

function makePost(overrides: Partial<XPost> = {}): XPost {
  return {
    id: "1",
    text: "@ClockedBot clock this",
    referencedPosts: [],
    ...overrides
  };
}

describe("streamRules", () => {
  it("builds conservative filtered stream rules for the bot handle", () => {
    const rules = buildDefaultFilteredStreamRules("@ClockedBot");

    expect(rules).toHaveLength(3);
    expect(rules[0]?.value).toContain("@ClockedBot");
    expect(rules[0]?.value).toContain("-is:retweet");
    expect(rules[0]?.value).not.toContain("-is:quote");
  });

  it("extracts a supported trigger phrase", () => {
    expect(extractTriggerPhrase("please CLOCK THIS now")).toBe("clock this");
    expect(extractTriggerPhrase("nothing to see here")).toBeNull();
  });

  it("prefers the parent post when resolving a trigger target", () => {
    const result = resolveTriggerTarget({
      triggerPost: makePost(),
      parentPost: makePost({ id: "parent", text: "V2 next week." }),
      quotedPost: makePost({ id: "quoted", text: "ignored" })
    });

    expect(result.reason).toBe("PARENT_POST");
    expect(result.targetPost?.id).toBe("parent");
  });

  it("ignores retweets", () => {
    const result = resolveTriggerTarget({
      triggerPost: makePost({
        text: "RT @founder V2 next week",
        referencedPosts: [{ id: "abc", type: "retweeted" }]
      })
    });

    expect(result.reason).toBe("RETWEET_IGNORED");
    expect(result.targetPost).toBeNull();
  });

  it("falls back to the quoted post when no parent post exists", () => {
    const result = resolveTriggerTarget({
      triggerPost: makePost({ text: "@ClockedBot clock this" }),
      quotedPost: makePost({ id: "quoted", text: "Mainnet tomorrow." })
    });

    expect(result.reason).toBe("QUOTED_POST");
    expect(result.targetPost?.id).toBe("quoted");
  });
});
