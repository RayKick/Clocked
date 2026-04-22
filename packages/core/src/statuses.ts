export const claimStatuses = [
  "OPEN",
  "DELIVERED",
  "SLIPPED",
  "REFRAMED",
  "SUPERSEDED",
  "AMBIGUOUS"
] as const;

export type ClaimStatus = (typeof claimStatuses)[number];

export const reviewKinds = [
  "CLAIM_CREATE",
  "STATUS_CHANGE",
  "BOT_REPLY",
  "EVIDENCE_REVIEW",
  "HEYANON_EVIDENCE",
  "CLAIM_STITCH"
] as const;

export type ReviewKind = (typeof reviewKinds)[number];

export const reviewStatuses = ["PENDING", "APPROVED", "REJECTED"] as const;
export type ReviewStatus = (typeof reviewStatuses)[number];

export const actorPlatforms = [
  "X",
  "TELEGRAM",
  "DISCORD",
  "GITHUB",
  "GITBOOK",
  "HEYANON",
  "MANUAL"
] as const;

export type ActorPlatform = (typeof actorPlatforms)[number];

export const actorTypes = [
  "FOUNDER",
  "OFFICIAL_PROJECT",
  "TEAM_MEMBER",
  "COMMUNITY",
  "UNKNOWN"
] as const;

export type ActorType = (typeof actorTypes)[number];

export const triggerStatuses = [
  "RECEIVED",
  "IGNORED",
  "REVIEW_CREATED",
  "FAILED"
] as const;

export type TriggerStatus = (typeof triggerStatuses)[number];

export const evidenceTypes = [
  "SOURCE",
  "FOLLOW_UP",
  "DELIVERY_PROOF",
  "REFRAME",
  "SUPERSEDING_CLAIM",
  "MANUAL_NOTE",
  "HEYANON_GEMMA_RESULT",
  "GITHUB_ACTIVITY",
  "GITBOOK_CHANGE",
  "COMMUNITY_SIGNAL"
] as const;

export type EvidenceType = (typeof evidenceTypes)[number];

export const statusActorTypes = ["SYSTEM", "AI", "ADMIN"] as const;
export type StatusActorType = (typeof statusActorTypes)[number];

export const botReplyStatuses = [
  "DRAFT",
  "APPROVED",
  "POSTED",
  "FAILED",
  "SKIPPED"
] as const;

export type BotReplyStatus = (typeof botReplyStatuses)[number];

export const botPlatforms = ["X", "TELEGRAM", "DISCORD", "HEYANON"] as const;
export type BotPlatform = (typeof botPlatforms)[number];

export const jobKinds = [
  "X_STREAM_CONNECT",
  "INGEST_TRIGGER",
  "EXTRACT_CLAIM",
  "DEADLINE_CHECK",
  "STATUS_EVALUATION",
  "POST_APPROVED_REPLY",
  "HEYANON_EVIDENCE_QUERY",
  "GEMMA_EVIDENCE_QUERY",
  "CLAIM_STITCHING",
  "DIGEST_BUILD"
] as const;

export type JobKind = (typeof jobKinds)[number];

export const jobStatuses = ["QUEUED", "RUNNING", "COMPLETED", "FAILED"] as const;
export type JobStatus = (typeof jobStatuses)[number];

export const heyAnonQueryTypes = [
  "PROJECT_CONTEXT",
  "SOCIAL_SEARCH",
  "CHAT_SEARCH",
  "GITHUB_ACTIVITY",
  "GITBOOK_CHANGE",
  "SENTIMENT_SUMMARY",
  "DELIVERY_EVIDENCE",
  "CLAIM_STITCHING"
] as const;

export type HeyAnonQueryType = (typeof heyAnonQueryTypes)[number];

export const heyAnonQueryStatuses = [
  "DRAFT",
  "MOCKED",
  "SENT",
  "COMPLETED",
  "FAILED"
] as const;

export type HeyAnonQueryStatus = (typeof heyAnonQueryStatuses)[number];

export const callerTypes = ["LOCAL", "HEYANON", "EXTERNAL", "ADMIN_TEST"] as const;
export type CallerType = (typeof callerTypes)[number];

export const invocationStatuses = ["SUCCESS", "FAILED"] as const;
export type InvocationStatus = (typeof invocationStatuses)[number];

