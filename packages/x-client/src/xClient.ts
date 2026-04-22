import crypto from "node:crypto";
import { URLSearchParams } from "node:url";

import {
  XBotReplySchema,
  XConfigureStreamRulesResultSchema,
  XCreatedPostSchema,
  XEnvironmentSchema,
  XPostSchema,
  XReplyPostResultSchema,
  XUserSchema,
  type XBotReply,
  type XClient,
  type XConfigureStreamRulesResult,
  type XCreatedPost,
  type XCreatePostOptions,
  type XEnvironment,
  type XFilteredStreamRule,
  type XPost,
  type XReplyPostResult,
  type XStreamConnectOptions,
  type XStreamHandler,
  type XUser
} from "./types";

const DEFAULT_TIMEOUT_MS = 30_000;

export interface RealXClientOptions {
  environment?: Partial<Record<keyof XEnvironment, string | boolean | undefined>>;
  fetchImpl?: typeof fetch;
}

export function readXEnvironment(
  input: Partial<Record<keyof XEnvironment, string | boolean | undefined>> = process.env as Partial<
    Record<keyof XEnvironment, string | boolean | undefined>
  >
): XEnvironment {
  return XEnvironmentSchema.parse(input);
}

export function createXClient(options: RealXClientOptions = {}): XClient {
  return new RealXClient(options);
}

export function canPostApprovedBotReply(botReply: XBotReply, environment = readXEnvironment()): {
  ok: boolean;
  reason?: string;
} {
  const parsedReply = XBotReplySchema.parse(botReply);

  if (!environment.X_POSTING_ENABLED) {
    return {
      ok: false,
      reason: "X posting is disabled. Set X_POSTING_ENABLED=true only after admin review."
    };
  }

  if (environment.SAFE_DRY_RUN) {
    return {
      ok: false,
      reason: "SAFE_DRY_RUN=true blocks live X posting."
    };
  }

  if (parsedReply.status !== "APPROVED") {
    return {
      ok: false,
      reason: "BotReply must be APPROVED before posting."
    };
  }

  if (!parsedReply.replyToPlatformPostId) {
    return {
      ok: false,
      reason: "replyToPlatformPostId is required for reply posting."
    };
  }

  if (!environment.X_API_KEY || !environment.X_API_SECRET || !environment.X_ACCESS_TOKEN || !environment.X_ACCESS_TOKEN_SECRET) {
    return {
      ok: false,
      reason: "Missing X write credentials."
    };
  }

  return { ok: true };
}

export function canReadFromX(environment = readXEnvironment()): { ok: boolean; reason: string } {
  if (!environment.X_READ_ENABLED) {
    return {
      ok: false,
      reason: "X_READ_ENABLED=false blocks live X reads."
    };
  }

  if (!environment.X_API_BEARER_TOKEN) {
    return {
      ok: false,
      reason: "Missing X read credentials."
    };
  }

  return {
    ok: true,
    reason: "X read enabled."
  };
}

export async function postApprovedBotReply(params: {
  client: XClient;
  botReply: XBotReply;
  environment?: XEnvironment;
}): Promise<XReplyPostResult> {
  const environment = params.environment ?? readXEnvironment();
  const postingCheck = canPostApprovedBotReply(params.botReply, environment);

  if (!postingCheck.ok) {
    return XReplyPostResultSchema.parse({
      action: "SKIPPED",
      reason: postingCheck.reason
    });
  }

  const post = await params.client.createReply(
    params.botReply.proposedText,
    params.botReply.replyToPlatformPostId as string
  );

  return XReplyPostResultSchema.parse({
    action: "POSTED",
    post
  });
}

export class RealXClient implements XClient {
  private readonly environment: XEnvironment;
  private readonly fetchImpl: typeof fetch;

  constructor(options: RealXClientOptions = {}) {
    this.environment = readXEnvironment(options.environment);
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async getPostById(id: string): Promise<XPost | null> {
    this.requireBearerToken();
    const response = await this.requestJson(`/2/tweets/${id}?tweet.fields=author_id,conversation_id,created_at,referenced_tweets`, {
      method: "GET",
      auth: "bearer"
    });
    const payload = response.data;

    if (!payload) {
      return null;
    }

    return XPostSchema.parse({
      id: payload.id,
      text: payload.text,
      authorId: payload.author_id,
      createdAt: payload.created_at,
      conversationId: payload.conversation_id,
      referencedPosts: (payload.referenced_tweets ?? []).map((reference: { id: string; type: string }) => ({
        id: reference.id,
        type: reference.type
      })),
      raw: response
    });
  }

  async getUserByUsername(username: string): Promise<XUser | null> {
    this.requireBearerToken();
    const cleanUsername = username.replace(/^@/, "");
    const response = await this.requestJson(`/2/users/by/username/${cleanUsername}?user.fields=verified`, {
      method: "GET",
      auth: "bearer"
    });
    const payload = response.data;

    if (!payload) {
      return null;
    }

    return XUserSchema.parse({
      id: payload.id,
      username: payload.username,
      name: payload.name,
      verified: payload.verified,
      raw: response
    });
  }

  async createPost(text: string, options: XCreatePostOptions = {}): Promise<XCreatedPost> {
    const check = canWriteToX(this.environment);
    if (!check.ok) {
      throw new Error(check.reason);
    }

    const body = {
      text,
      ...(options.replyToPostId ? { reply: { in_reply_to_tweet_id: options.replyToPostId } } : {}),
      ...(options.quotePostId ? { quote_tweet_id: options.quotePostId } : {})
    };

    const response = await this.requestJson("/2/tweets", {
      method: "POST",
      auth: "oauth1",
      body
    });

    return XCreatedPostSchema.parse({
      id: response.data.id,
      text: response.data.text,
      raw: response
    });
  }

  async createReply(text: string, replyToPostId: string): Promise<XCreatedPost> {
    return this.createPost(text, { replyToPostId });
  }

  async configureFilteredStreamRules(rules: XFilteredStreamRule[]): Promise<XConfigureStreamRulesResult> {
    this.requireBearerToken();

    const existingRulesResponse = await this.requestJson("/2/tweets/search/stream/rules", {
      method: "GET",
      auth: "bearer"
    });
    const existingRules = Array.isArray(existingRulesResponse.data) ? existingRulesResponse.data : [];
    const deletedRuleIds = existingRules.map((rule: { id: string }) => rule.id);

    if (deletedRuleIds.length > 0) {
      await this.requestJson("/2/tweets/search/stream/rules", {
        method: "POST",
        auth: "bearer",
        body: {
          delete: {
            ids: deletedRuleIds
          }
        }
      });
    }

    if (rules.length > 0) {
      await this.requestJson("/2/tweets/search/stream/rules", {
        method: "POST",
        auth: "bearer",
        body: {
          add: rules.map((rule) => ({
            value: rule.value,
            tag: rule.tag
          }))
        }
      });
    }

    return XConfigureStreamRulesResultSchema.parse({
      added: rules,
      deletedRuleIds
    });
  }

  async connectFilteredStream(onPost: XStreamHandler, options?: XStreamConnectOptions): Promise<void> {
    this.requireBearerToken();
    const normalizedOptions = {
      autoReconnect: options?.autoReconnect ?? true,
      signal: options?.signal
    };

    const connectOnce = async (): Promise<void> => {
      const response = await this.fetchImpl(`${this.environment.X_API_BASE_URL}/2/tweets/search/stream?tweet.fields=author_id,conversation_id,created_at,referenced_tweets`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.environment.X_API_BEARER_TOKEN as string}`
        },
        signal: normalizedOptions.signal
      });

      if (!response.ok || !response.body) {
        throw new Error(`X stream request failed with ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            continue;
          }

          const parsed = JSON.parse(trimmed) as { data?: Record<string, unknown> };
          if (!parsed.data) {
            continue;
          }

          await onPost(
            XPostSchema.parse({
              id: parsed.data.id,
              text: parsed.data.text,
              authorId: parsed.data.author_id,
              createdAt: parsed.data.created_at,
              conversationId: parsed.data.conversation_id,
              referencedPosts: parsed.data.referenced_tweets ?? [],
              raw: parsed
            })
          );
        }
      }
    };

    try {
      await connectOnce();
    } catch (error) {
      if (!normalizedOptions.autoReconnect || normalizedOptions.signal?.aborted) {
        throw error;
      }

      await connectOnce();
    }
  }

  private async requestJson(
    path: string,
    options: {
      method: "GET" | "POST";
      auth: "bearer" | "oauth1";
      body?: Record<string, unknown>;
    }
  ): Promise<Record<string, any>> {
    const url = `${this.environment.X_API_BASE_URL}${path}`;
    const response = await this.fetchImpl(url, {
      method: options.method,
      headers: {
        "Content-Type": "application/json",
        ...(options.auth === "bearer"
          ? { Authorization: `Bearer ${this.environment.X_API_BEARER_TOKEN as string}` }
          : { Authorization: buildOAuth1Header(options.method, url, this.environment) })
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
    });

    if (response.status === 429) {
      throw new Error("X rate limit hit. Retry later.");
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`X API request failed with ${response.status}: ${text}`);
    }

    return (await response.json()) as Record<string, any>;
  }

  private requireBearerToken(): void {
    if (!this.environment.X_API_BEARER_TOKEN) {
      throw new Error("Missing X_API_BEARER_TOKEN");
    }
  }
}

export function canWriteToX(environment = readXEnvironment()): { ok: boolean; reason: string } {
  if (!environment.X_POSTING_ENABLED) {
    return {
      ok: false,
      reason: "X_POSTING_ENABLED=false blocks live posting."
    };
  }

  if (environment.SAFE_DRY_RUN) {
    return {
      ok: false,
      reason: "SAFE_DRY_RUN=true blocks live posting."
    };
  }

  if (!environment.X_API_KEY || !environment.X_API_SECRET || !environment.X_ACCESS_TOKEN || !environment.X_ACCESS_TOKEN_SECRET) {
    return {
      ok: false,
      reason: "Missing X write credentials."
    };
  }

  return {
    ok: true,
    reason: "Posting enabled."
  };
}

function buildOAuth1Header(
  method: string,
  url: string,
  environment: XEnvironment
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: environment.X_API_KEY as string,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: `${Math.floor(Date.now() / 1000)}`,
    oauth_token: environment.X_ACCESS_TOKEN as string,
    oauth_version: "1.0"
  };

  const signature = buildOAuthSignature(method, url, oauthParams, environment);
  oauthParams.oauth_signature = signature;

  return `OAuth ${Object.entries(oauthParams)
    .map(([key, value]) => `${percentEncode(key)}="${percentEncode(value)}"`)
    .join(", ")}`;
}

function buildOAuthSignature(
  method: string,
  url: string,
  oauthParams: Record<string, string>,
  environment: XEnvironment
): string {
  const baseUrl = new URL(url);
  const params = new URLSearchParams(baseUrl.search);

  for (const [key, value] of Object.entries(oauthParams)) {
    params.set(key, value);
  }

  const normalized = [...params.entries()]
    .sort(([leftKey, leftValue], [rightKey, rightValue]) => {
      if (leftKey === rightKey) {
        return leftValue.localeCompare(rightValue);
      }

      return leftKey.localeCompare(rightKey);
    })
    .map(([key, value]) => `${percentEncode(key)}=${percentEncode(value)}`)
    .join("&");

  const signatureBaseString = [method.toUpperCase(), percentEncode(baseUrl.origin + baseUrl.pathname), percentEncode(normalized)].join(
    "&"
  );
  const signingKey = `${percentEncode(environment.X_API_SECRET as string)}&${percentEncode(
    environment.X_ACCESS_TOKEN_SECRET as string
  )}`;

  return crypto.createHmac("sha1", signingKey).update(signatureBaseString).digest("base64");
}

function percentEncode(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );
}
