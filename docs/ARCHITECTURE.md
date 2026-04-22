# CLOCKED Architecture

## Overview

CLOCKED is a review-first public receipts system. The database layer is designed to preserve original public sources, produce structured claim records, track evidence and review decisions, and keep all external actions behind explicit approval and feature flags.

The MVP architecture is intentionally conservative:

- Public source material is stored in `SourcePost` before any claim is made public.
- Structured claim extraction produces reviewable payloads before creating `Claim` rows.
- All status changes that matter publicly are captured in `StatusEvent`.
- External enrichment is tracked in `HeyAnonQuery`.
- All asynchronous work flows through the `Job` table instead of Redis.
- All moderator decisions flow through `ReviewItem`.

## Data Model

Primary entities and their purpose:

- `Project`: canonical project identity and official source mapping.
- `Actor`: founder, project, team, or community identity across supported platforms.
- `SourcePost`: immutable capture of public source material plus hashes and raw payload storage.
- `Trigger`: inbound "clock this" requests and their routing outcome.
- `Claim`: normalized, public-facing, time-bounded commitment record.
- `Evidence`: public supporting material used to evaluate or contextualize a claim.
- `StatusEvent`: audit trail for transitions such as `OPEN -> DELIVERED`.
- `ReviewItem`: moderation and approval queue for claim creation, evidence, status changes, bot replies, and claim stitching.
- `BotReply`: proposed or posted platform-specific public response, always reviewable.
- `Job`: DB-backed queue for workers, including deadline checks and HeyAnon evidence lookups.
- `HeyAnonQuery`: typed log of optional HeyAnon or Gemma enrichment work.
- `McpInvocation`: audit log for MCP tool usage.
- `HudExportSnapshot`: compact project summary snapshots for downstream HUD consumers.

## Data Flow Diagram

```text
Public source or trigger
  -> SourcePost capture
  -> Trigger row (optional)
  -> extraction service
  -> ReviewItem(CLAIM_CREATE) or ignored outcome
  -> admin approval
  -> Claim row
  -> BotReply(DRAFT) + Job scheduling
  -> Evidence accumulation
  -> StatusEvent audit trail
  -> public pages / MCP / HUD export
```

## X Trigger Flow

```text
X mention or trigger phrase
  -> x-client receives post
  -> SourcePost stored with raw JSON and content hash
  -> Trigger created
  -> parent / quoted target resolution
  -> Job(INGEST_TRIGGER) or ReviewItem if ambiguous
  -> extraction result
  -> ReviewItem(CLAIM_CREATE) for clockable or borderline statements
  -> optional BotReply(DRAFT)
```

Notes:

- The trigger references both the invoking post and the target source post when available.
- No posting occurs directly from ingestion.
- `BotReply` and `Trigger` are deliberately separated so the system can skip or retry responses without losing ingestion history.

## AI Extraction Flow

```text
SourcePost
  -> structured extraction
  -> duplicate detection helpers compute canonical hash
  -> matching Claim lookup by canonical hash
  -> ReviewItem(CLAIM_CREATE) if new or Needs Review
  -> admin approval creates Claim
```

Backend support details:

- `packages/db/src/hashes.ts` defines deterministic claim and source-post hash builders.
- `packages/db/src/duplicateDetection.ts` exposes reusable DB lookups for duplicate claims and duplicate sources.
- Duplicate checks are advisory by design. The DB enforces `@@unique([sourcePostId, canonicalHash])` to block duplicate extraction from the same source while still allowing related cross-source claims to be reviewed.

## Review Queue Flow

```text
Worker or API action
  -> ReviewItem(PENDING)
  -> admin review UI
  -> approve / reject
  -> downstream DB mutation (claim create, evidence insert, status change, reply approval)
  -> ReviewItem reviewedAt set
```

Review queue principles:

- Creation and approval are decoupled.
- Status transitions remain reconstructible from `StatusEvent`, not just the current `Claim.status`.
- Evidence can be staged via `EVIDENCE_REVIEW` before it becomes public record.

## HeyAnon Evidence Flow

```text
Claim or project needs enrichment
  -> Job(HEYANON_EVIDENCE_QUERY or GEMMA_EVIDENCE_QUERY)
  -> typed HeyAnon adapter
  -> HeyAnonQuery row logged
  -> mocked or live response
  -> ReviewItem(HEYANON_EVIDENCE) or ReviewItem(CLAIM_STITCH)
  -> admin approval creates Evidence or links claims
```

Notes:

- Live calls are disabled unless `HEYANON_ENABLE_LIVE_CALLS=true`.
- `HeyAnonQuery` exists even for mock mode so operators can see what was asked and what source set was intended.

## MCP Server Flow

```text
MCP tool request
  -> input validation
  -> query Claim / Project / Actor / Evidence tables
  -> public-safe payload assembly
  -> McpInvocation audit row
  -> response
```

Important constraints:

- Only public-safe data should be returned from MCP tools.
- Review payloads, secrets, admin notes, and draft-only operational data should stay out of MCP responses.
- `McpInvocation` provides an audit trail for local, HeyAnon, external, and admin-test callers.

## HUD Export Flow

```text
Project delivery summary request
  -> aggregate Claim + StatusEvent data
  -> build compact JSON
  -> optional snapshot persistence in HudExportSnapshot
  -> return public-safe fields
```

The DB model stores snapshots separately from live claims so the HUD can later cache stable summaries without mutating source truth.

## Worker Flow

```text
Worker loop
  -> Job table polling
  -> claim next queued job by runAfter
  -> mark RUNNING + lockedAt
  -> execute task
  -> create ReviewItem / Evidence / Query rows as needed
  -> mark COMPLETED or FAILED
```

Queue notes:

- The MVP uses a DB-backed queue to avoid Redis complexity.
- Job claiming is optimistic and single-row scoped.
- `attempts`, `lockedAt`, `lastError`, and `runAfter` support retries and operator visibility.

## Migration and Local DB Assumptions

- Prisma targets PostgreSQL via `DATABASE_URL`.
- Local development is expected to run Postgres through a root-level Docker Compose setup owned outside this backend slice.
- This package provides the schema and seed shape; the workspace root is expected to wire `pnpm db:generate`, `pnpm db:migrate`, and `pnpm db:seed` to this package.

## Future Adapter Direction

- Telegram and Discord public context should come through typed HeyAnon adapters where available.
- The MVP intentionally avoids direct Telegram or Discord scraping.
- Additional external sources should follow the same pattern used here: source capture, typed enrichment log, review item, then public record update.
