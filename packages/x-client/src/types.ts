import { z } from "zod";

export const XPostingEnabledSchema = z.union([z.boolean(), z.string()]).transform((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  return value.toLowerCase() === "true";
});

export const XEnvironmentSchema = z.object({
  X_API_BASE_URL: z.string().url().default("https://api.x.com"),
  X_API_BEARER_TOKEN: z.string().optional(),
  X_API_KEY: z.string().optional(),
  X_API_SECRET: z.string().optional(),
  X_ACCESS_TOKEN: z.string().optional(),
  X_ACCESS_TOKEN_SECRET: z.string().optional(),
  X_POSTING_ENABLED: XPostingEnabledSchema.default(false),
  SAFE_DRY_RUN: XPostingEnabledSchema.default(true),
  CLOCKED_BOT_HANDLE: z.string().default("ClockedBot")
});

export type XEnvironment = z.infer<typeof XEnvironmentSchema>;

export const XPlatformSchema = z.literal("X");
export type XPlatform = z.infer<typeof XPlatformSchema>;

export const BotReplyStatusSchema = z.enum(["DRAFT", "APPROVED", "POSTED", "FAILED", "SKIPPED"]);
export type BotReplyStatus = z.infer<typeof BotReplyStatusSchema>;

export const XUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string().optional(),
  verified: z.boolean().optional()
});
export type XUser = z.infer<typeof XUserSchema>;

export const XReferencedPostSchema = z.object({
  id: z.string(),
  type: z.enum(["replied_to", "quoted", "retweeted"])
});
export type XReferencedPost = z.infer<typeof XReferencedPostSchema>;

export const XPostSchema = z.object({
  id: z.string(),
  text: z.string(),
  authorId: z.string().optional(),
  authorHandle: z.string().optional(),
  createdAt: z.string().optional(),
  url: z.string().url().optional(),
  conversationId: z.string().optional(),
  referencedPosts: z.array(XReferencedPostSchema).default([]),
  raw: z.unknown().optional()
});
export type XPost = z.infer<typeof XPostSchema>;

export const XCreatePostOptionsSchema = z.object({
  replyToPostId: z.string().optional(),
  quotePostId: z.string().optional()
});
export type XCreatePostOptions = z.infer<typeof XCreatePostOptionsSchema>;

export const XCreatedPostSchema = z.object({
  id: z.string(),
  text: z.string(),
  raw: z.unknown().optional()
});
export type XCreatedPost = z.infer<typeof XCreatedPostSchema>;

export const XFilteredStreamRuleSchema = z.object({
  id: z.string().optional(),
  value: z.string(),
  tag: z.string()
});
export type XFilteredStreamRule = z.infer<typeof XFilteredStreamRuleSchema>;

export const XConfigureStreamRulesResultSchema = z.object({
  added: z.array(XFilteredStreamRuleSchema).default([]),
  deletedRuleIds: z.array(z.string()).default([])
});
export type XConfigureStreamRulesResult = z.infer<typeof XConfigureStreamRulesResultSchema>;

export const XStreamConnectOptionsSchema = z.object({
  autoReconnect: z.boolean().default(true),
  signal: z.custom<AbortSignal>().optional()
});
export type XStreamConnectOptions = z.infer<typeof XStreamConnectOptionsSchema>;

export const XBotReplySchema = z.object({
  id: z.string().optional(),
  claimId: z.string().optional(),
  triggerId: z.string().optional(),
  platform: XPlatformSchema.default("X"),
  proposedText: z.string().min(1),
  status: BotReplyStatusSchema,
  replyToPlatformPostId: z.string().optional(),
  postedPlatformPostId: z.string().optional()
});
export type XBotReply = z.infer<typeof XBotReplySchema>;

export const XReplyPostResultSchema = z.object({
  action: z.enum(["POSTED", "SKIPPED"]),
  reason: z.string().optional(),
  post: XCreatedPostSchema.optional()
});
export type XReplyPostResult = z.infer<typeof XReplyPostResultSchema>;

export type XStreamHandler = (post: XPost) => Promise<void> | void;

export interface XClient {
  getPostById(id: string): Promise<XPost | null>;
  getUserByUsername(username: string): Promise<XUser | null>;
  createPost(text: string, options?: XCreatePostOptions): Promise<XCreatedPost>;
  createReply(text: string, replyToPostId: string): Promise<XCreatedPost>;
  configureFilteredStreamRules(rules: XFilteredStreamRule[]): Promise<XConfigureStreamRulesResult>;
  connectFilteredStream(onPost: XStreamHandler, options?: XStreamConnectOptions): Promise<void>;
}
