-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('X', 'TELEGRAM', 'DISCORD', 'GITHUB', 'GITBOOK', 'HEYANON', 'MANUAL');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('FOUNDER', 'OFFICIAL_PROJECT', 'TEAM_MEMBER', 'COMMUNITY', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "TriggerStatus" AS ENUM ('RECEIVED', 'IGNORED', 'REVIEW_CREATED', 'FAILED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('OPEN', 'DELIVERED', 'SLIPPED', 'REFRAMED', 'SUPERSEDED', 'AMBIGUOUS');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('SOURCE', 'FOLLOW_UP', 'DELIVERY_PROOF', 'REFRAME', 'SUPERSEDING_CLAIM', 'MANUAL_NOTE', 'HEYANON_GEMMA_RESULT', 'GITHUB_ACTIVITY', 'GITBOOK_CHANGE', 'COMMUNITY_SIGNAL');

-- CreateEnum
CREATE TYPE "StatusActorType" AS ENUM ('SYSTEM', 'AI', 'ADMIN');

-- CreateEnum
CREATE TYPE "ReviewKind" AS ENUM ('CLAIM_CREATE', 'STATUS_CHANGE', 'BOT_REPLY', 'EVIDENCE_REVIEW', 'HEYANON_EVIDENCE', 'CLAIM_STITCH');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BotReplyStatus" AS ENUM ('DRAFT', 'APPROVED', 'POSTED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "JobKind" AS ENUM ('X_STREAM_CONNECT', 'INGEST_TRIGGER', 'EXTRACT_CLAIM', 'DEADLINE_CHECK', 'STATUS_EVALUATION', 'POST_APPROVED_REPLY', 'HEYANON_EVIDENCE_QUERY', 'GEMMA_EVIDENCE_QUERY', 'CLAIM_STITCHING', 'DIGEST_BUILD');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "HeyAnonQueryType" AS ENUM ('PROJECT_CONTEXT', 'SOCIAL_SEARCH', 'CHAT_SEARCH', 'GITHUB_ACTIVITY', 'GITBOOK_CHANGE', 'SENTIMENT_SUMMARY', 'DELIVERY_EVIDENCE', 'CLAIM_STITCHING');

-- CreateEnum
CREATE TYPE "HeyAnonQueryStatus" AS ENUM ('DRAFT', 'MOCKED', 'SENT', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "McpCallerType" AS ENUM ('LOCAL', 'HEYANON', 'EXTERNAL', 'ADMIN_TEST');

-- CreateEnum
CREATE TYPE "McpInvocationStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "officialXHandle" TEXT,
    "officialTelegram" TEXT,
    "officialDiscord" TEXT,
    "gitHubOrg" TEXT,
    "gitBookUrl" TEXT,
    "heyAnonProjectKey" TEXT,
    "launchpadAgentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Actor" (
    "id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "handle" TEXT NOT NULL,
    "displayName" TEXT,
    "platformUserId" TEXT,
    "actorType" "ActorType" NOT NULL DEFAULT 'UNKNOWN',
    "projectId" TEXT,
    "verifiedSource" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Actor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourcePost" (
    "id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "platformPostId" TEXT,
    "url" TEXT,
    "authorId" TEXT,
    "text" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3),
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawJson" JSONB,
    "parentPlatformPostId" TEXT,
    "quotedPlatformPostId" TEXT,
    "contentHash" TEXT NOT NULL,
    "sourceConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourcePost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trigger" (
    "id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "platformTriggerPostId" TEXT,
    "triggerSourcePostId" TEXT,
    "targetSourcePostId" TEXT,
    "requestedByHandle" TEXT,
    "phrase" TEXT NOT NULL,
    "status" "TriggerStatus" NOT NULL DEFAULT 'RECEIVED',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "publicSlug" TEXT NOT NULL,
    "projectId" TEXT,
    "actorId" TEXT,
    "sourcePostId" TEXT NOT NULL,
    "canonicalHash" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'OPEN',
    "normalizedClaim" TEXT NOT NULL,
    "sourceQuote" TEXT NOT NULL,
    "deliverable" TEXT NOT NULL,
    "deadlineText" TEXT NOT NULL,
    "deadlineAt" TIMESTAMP(3),
    "deadlineTimezone" TEXT,
    "deadlineConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "extractionConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "deliveryCriteriaJson" JSONB NOT NULL,
    "nonDeliveryCriteriaJson" JSONB NOT NULL,
    "ambiguityNotesJson" JSONB NOT NULL,
    "relatedClaimIdsJson" JSONB NOT NULL,
    "heyAnonContextJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "sourcePostId" TEXT,
    "evidenceType" "EvidenceType" NOT NULL,
    "url" TEXT,
    "summary" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3),
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "rawJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusEvent" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "fromStatus" "ClaimStatus",
    "toStatus" "ClaimStatus" NOT NULL,
    "reason" TEXT NOT NULL,
    "evidenceJson" JSONB,
    "actorType" "StatusActorType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewItem" (
    "id" TEXT NOT NULL,
    "kind" "ReviewKind" NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "payloadJson" JSONB NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ReviewItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotReply" (
    "id" TEXT NOT NULL,
    "claimId" TEXT,
    "triggerId" TEXT,
    "platform" "Platform" NOT NULL,
    "replyToPlatformPostId" TEXT,
    "proposedText" TEXT NOT NULL,
    "status" "BotReplyStatus" NOT NULL DEFAULT 'DRAFT',
    "postedPlatformPostId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "kind" "JobKind" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
    "payloadJson" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lockedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "runAfter" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeyAnonQuery" (
    "id" TEXT NOT NULL,
    "queryType" "HeyAnonQueryType" NOT NULL,
    "projectId" TEXT,
    "claimId" TEXT,
    "prompt" TEXT NOT NULL,
    "sourcesJson" JSONB NOT NULL,
    "timeframeJson" JSONB NOT NULL,
    "status" "HeyAnonQueryStatus" NOT NULL DEFAULT 'DRAFT',
    "responseJson" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeyAnonQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "McpInvocation" (
    "id" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "inputJson" JSONB NOT NULL,
    "outputJson" JSONB,
    "callerType" "McpCallerType" NOT NULL,
    "status" "McpInvocationStatus" NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "McpInvocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HudExportSnapshot" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HudExportSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_name_idx" ON "Project"("name");

-- CreateIndex
CREATE INDEX "Project_heyAnonProjectKey_idx" ON "Project"("heyAnonProjectKey");

-- CreateIndex
CREATE INDEX "Actor_projectId_actorType_idx" ON "Actor"("projectId", "actorType");

-- CreateIndex
CREATE INDEX "Actor_platformUserId_idx" ON "Actor"("platformUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Actor_platform_handle_key" ON "Actor"("platform", "handle");

-- CreateIndex
CREATE INDEX "SourcePost_contentHash_idx" ON "SourcePost"("contentHash");

-- CreateIndex
CREATE INDEX "SourcePost_authorId_postedAt_idx" ON "SourcePost"("authorId", "postedAt");

-- CreateIndex
CREATE INDEX "SourcePost_postedAt_idx" ON "SourcePost"("postedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SourcePost_platform_platformPostId_key" ON "SourcePost"("platform", "platformPostId");

-- CreateIndex
CREATE INDEX "Trigger_status_createdAt_idx" ON "Trigger"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Trigger_platform_createdAt_idx" ON "Trigger"("platform", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Trigger_platform_platformTriggerPostId_key" ON "Trigger"("platform", "platformTriggerPostId");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_publicSlug_key" ON "Claim"("publicSlug");

-- CreateIndex
CREATE INDEX "Claim_canonicalHash_idx" ON "Claim"("canonicalHash");

-- CreateIndex
CREATE INDEX "Claim_status_deadlineAt_idx" ON "Claim"("status", "deadlineAt");

-- CreateIndex
CREATE INDEX "Claim_projectId_status_deadlineAt_idx" ON "Claim"("projectId", "status", "deadlineAt");

-- CreateIndex
CREATE INDEX "Claim_actorId_status_deadlineAt_idx" ON "Claim"("actorId", "status", "deadlineAt");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_sourcePostId_canonicalHash_key" ON "Claim"("sourcePostId", "canonicalHash");

-- CreateIndex
CREATE INDEX "Evidence_claimId_evidenceType_createdAt_idx" ON "Evidence"("claimId", "evidenceType", "createdAt");

-- CreateIndex
CREATE INDEX "Evidence_occurredAt_idx" ON "Evidence"("occurredAt");

-- CreateIndex
CREATE INDEX "StatusEvent_claimId_createdAt_idx" ON "StatusEvent"("claimId", "createdAt");

-- CreateIndex
CREATE INDEX "StatusEvent_toStatus_createdAt_idx" ON "StatusEvent"("toStatus", "createdAt");

-- CreateIndex
CREATE INDEX "ReviewItem_status_createdAt_idx" ON "ReviewItem"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ReviewItem_kind_status_createdAt_idx" ON "ReviewItem"("kind", "status", "createdAt");

-- CreateIndex
CREATE INDEX "BotReply_status_platform_createdAt_idx" ON "BotReply"("status", "platform", "createdAt");

-- CreateIndex
CREATE INDEX "BotReply_claimId_status_idx" ON "BotReply"("claimId", "status");

-- CreateIndex
CREATE INDEX "BotReply_triggerId_status_idx" ON "BotReply"("triggerId", "status");

-- CreateIndex
CREATE INDEX "Job_status_runAfter_kind_idx" ON "Job"("status", "runAfter", "kind");

-- CreateIndex
CREATE INDEX "Job_kind_status_createdAt_idx" ON "Job"("kind", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Job_lockedAt_idx" ON "Job"("lockedAt");

-- CreateIndex
CREATE INDEX "HeyAnonQuery_status_queryType_createdAt_idx" ON "HeyAnonQuery"("status", "queryType", "createdAt");

-- CreateIndex
CREATE INDEX "HeyAnonQuery_projectId_queryType_idx" ON "HeyAnonQuery"("projectId", "queryType");

-- CreateIndex
CREATE INDEX "HeyAnonQuery_claimId_queryType_idx" ON "HeyAnonQuery"("claimId", "queryType");

-- CreateIndex
CREATE INDEX "McpInvocation_toolName_createdAt_idx" ON "McpInvocation"("toolName", "createdAt");

-- CreateIndex
CREATE INDEX "McpInvocation_status_createdAt_idx" ON "McpInvocation"("status", "createdAt");

-- CreateIndex
CREATE INDEX "HudExportSnapshot_projectId_createdAt_idx" ON "HudExportSnapshot"("projectId", "createdAt");

-- AddForeignKey
ALTER TABLE "Actor" ADD CONSTRAINT "Actor_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourcePost" ADD CONSTRAINT "SourcePost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trigger" ADD CONSTRAINT "Trigger_triggerSourcePostId_fkey" FOREIGN KEY ("triggerSourcePostId") REFERENCES "SourcePost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trigger" ADD CONSTRAINT "Trigger_targetSourcePostId_fkey" FOREIGN KEY ("targetSourcePostId") REFERENCES "SourcePost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_sourcePostId_fkey" FOREIGN KEY ("sourcePostId") REFERENCES "SourcePost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_sourcePostId_fkey" FOREIGN KEY ("sourcePostId") REFERENCES "SourcePost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusEvent" ADD CONSTRAINT "StatusEvent_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotReply" ADD CONSTRAINT "BotReply_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotReply" ADD CONSTRAINT "BotReply_triggerId_fkey" FOREIGN KEY ("triggerId") REFERENCES "Trigger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeyAnonQuery" ADD CONSTRAINT "HeyAnonQuery_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeyAnonQuery" ADD CONSTRAINT "HeyAnonQuery_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HudExportSnapshot" ADD CONSTRAINT "HudExportSnapshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

