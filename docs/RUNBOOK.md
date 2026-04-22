# CLOCKED Backend Runbook

## Scope

This runbook covers the database package, schema lifecycle, seed data, and the DB-backed queue and review primitives used by the CLOCKED MVP.

## Environment Assumptions

Expected environment variables for backend work:

- `DATABASE_URL`: PostgreSQL connection string used by Prisma.
- Recommended local value: `postgresql://clocked:clocked@localhost:5432/clocked?schema=public`
- `SAFE_DRY_RUN=true`: expected default operating mode for the wider app.
- `HEYANON_ENABLE_LIVE_CALLS=false`: expected default for evidence workers.
- `X_POSTING_ENABLED=false`: expected default for posting workers.

The DB package itself does not require X or HeyAnon credentials to generate the client or run the seed.

## Local Database Expectations

The root workspace is expected to provide a `docker-compose.yml` that starts PostgreSQL for local development. This backend slice assumes:

- PostgreSQL 15+ is available locally.
- `DATABASE_URL` points at that database.
- The root command surface will call into `packages/db` for Prisma operations.

Suggested local shape for the wider workspace:

```bash
docker compose up -d postgres
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm db:seed
corepack pnpm worker:fixtures
corepack pnpm dev
```

If the workspace root later aliases these to `pnpm db:generate`, `pnpm db:migrate`, and `pnpm db:seed`, those should simply delegate to this package.

## Prisma Lifecycle

Generate the Prisma client:

```bash
pnpm --filter @clocked/db generate
```

Create or apply a development migration:

```bash
pnpm --filter @clocked/db migrate -- --name init
```

Seed the development database:

```bash
pnpm --filter @clocked/db seed
```

The schema outputs the generated Prisma client into `packages/db/src/generated/client`, which keeps imports stable for the rest of the monorepo.

## Seed Contents

The seed intentionally creates a minimal and idempotent base dataset:

- `Example Protocol`
- a verified founder actor at `@examplefounder`
- a verified official project actor at `@exampleprotocol`

`corepack pnpm worker:fixtures` then adds the dry-run demo records used by the web app, admin review queue, HUD export, and MCP smoke tests.

## Duplicate Detection

Duplicate detection support lives in:

- `packages/db/src/hashes.ts`
- `packages/db/src/duplicateDetection.ts`

Operational guidance:

- Compute `SourcePost.contentHash` on ingest from stable public inputs.
- Compute `Claim.canonicalHash` from normalized claim fields, not raw user-facing copy.
- Run duplicate checks before creating new claims or source posts.
- Treat duplicate detection as an operator aid, not a silent merge policy.

The DB also enforces `@@unique([sourcePostId, canonicalHash])` to prevent the same source from producing the same claim twice.

## Queue Operations

Queue helper functions live in `packages/db/src/queue.ts`.

Recommended usage:

1. Create jobs with `enqueueJob`.
2. Workers call `claimNextRunnableJob`.
3. On success, workers call `markJobCompleted`.
4. On recoverable failure, workers may call `requeueJob`.
5. On terminal failure, workers call `markJobFailed`.

The MVP queue is suitable for a small number of workers in dry-run mode. If concurrency grows later, job claiming can be upgraded to use stronger row-lock semantics or raw SQL with `FOR UPDATE SKIP LOCKED`.

## Review Operations

Review helpers live in `packages/db/src/reviewQueue.ts`, and evidence staging helpers live in `packages/db/src/evidence.ts`.

Rules of thumb:

- New public claims should originate from `CLAIM_CREATE` review items.
- Automatic deadline misses should create `STATUS_CHANGE` review items, not direct `SLIPPED` writes.
- Evidence from external enrichment should land in `HEYANON_EVIDENCE` or `EVIDENCE_REVIEW` before insertion.
- Draft bot replies should be separately reviewable from claim creation.

## Incident Checks

If something looks wrong in staging or local development:

1. Confirm `DATABASE_URL` points to the intended database.
2. Confirm Prisma client generation matches the current schema.
3. Check whether jobs are stuck with `status=RUNNING` and stale `lockedAt`.
4. Check whether pending moderation work is sitting in `ReviewItem`.
5. Verify that live external call flags remain disabled unless intentionally enabled.

## Safe Defaults

This backend design assumes:

- no live X posting by default
- no live HeyAnon calls by default
- no automatic public status changes after deadlines
- no bypass of review for AI-derived public copy

Those are application-level behaviors, but the DB tables and helper functions were shaped to reinforce them rather than work around them.
