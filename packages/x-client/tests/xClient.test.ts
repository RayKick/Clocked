import { describe, expect, it } from "vitest";

import { MockXClient } from "../src/mockXClient.js";
import {
  canPostApprovedBotReply,
  canReadFromX,
  canWriteToX,
  postApprovedBotReply
} from "../src/xClient.js";

describe("xClient safety guards", () => {
  it("blocks all writes when X_POSTING_ENABLED=false", () => {
    const result = canWriteToX({
      X_API_BASE_URL: "https://api.x.com",
      X_READ_ENABLED: false,
      X_POSTING_ENABLED: false,
      SAFE_DRY_RUN: false,
      CLOCKED_BOT_HANDLE: "ClockedBot"
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toContain("X_POSTING_ENABLED=false");
  });

  it("blocks live reads when X_READ_ENABLED=false", () => {
    const result = canReadFromX({
      X_API_BASE_URL: "https://api.x.com",
      X_READ_ENABLED: false,
      X_POSTING_ENABLED: false,
      SAFE_DRY_RUN: true,
      CLOCKED_BOT_HANDLE: "ClockedBot"
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toContain("X_READ_ENABLED=false");
  });

  it("blocks posting approved replies in SAFE_DRY_RUN mode", () => {
    const result = canPostApprovedBotReply(
      {
        proposedText: "reply",
        status: "APPROVED",
        platform: "X",
        replyToPlatformPostId: "123"
      },
      {
        X_API_BASE_URL: "https://api.x.com",
        X_READ_ENABLED: false,
        X_POSTING_ENABLED: true,
        SAFE_DRY_RUN: true,
        CLOCKED_BOT_HANDLE: "ClockedBot"
      }
    );

    expect(result.ok).toBe(false);
    expect(result.reason).toContain("SAFE_DRY_RUN");
  });

  it("skips posting when a BotReply is not approved", async () => {
    const client = new MockXClient();
    const result = await postApprovedBotReply({
      client,
      botReply: {
        proposedText: "reply",
        status: "DRAFT",
        platform: "X",
        replyToPlatformPostId: "123"
      },
      environment: {
        X_API_BASE_URL: "https://api.x.com",
        X_READ_ENABLED: false,
        X_POSTING_ENABLED: true,
        SAFE_DRY_RUN: false,
        CLOCKED_BOT_HANDLE: "ClockedBot",
        X_API_KEY: "key",
        X_API_SECRET: "secret",
        X_ACCESS_TOKEN: "access",
        X_ACCESS_TOKEN_SECRET: "access-secret"
      }
    });

    expect(result.action).toBe("SKIPPED");
    expect(client.getCreatedPosts()).toHaveLength(0);
  });

  it("posts only when env and approval checks pass", async () => {
    const client = new MockXClient();
    const result = await postApprovedBotReply({
      client,
      botReply: {
        proposedText: "reply",
        status: "APPROVED",
        platform: "X",
        replyToPlatformPostId: "123"
      },
      environment: {
        X_API_BASE_URL: "https://api.x.com",
        X_READ_ENABLED: false,
        X_POSTING_ENABLED: true,
        SAFE_DRY_RUN: false,
        CLOCKED_BOT_HANDLE: "ClockedBot",
        X_API_KEY: "key",
        X_API_SECRET: "secret",
        X_ACCESS_TOKEN: "access",
        X_ACCESS_TOKEN_SECRET: "access-secret"
      }
    });

    expect(result.action).toBe("POSTED");
    expect(result.post?.id).toBe("mock-1");
    expect(client.getCreatedPosts()).toHaveLength(1);
  });
});
