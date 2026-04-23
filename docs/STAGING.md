# CLOCKED Staging Guide

This guide describes the safe staging contract for reviewer-accessible CLOCKED deployments.

## Recommended Reviewer Staging Setup

Option B is the recommended reviewer-staging setup for the current CLOCKED monorepo: run the web app, MCP server, and optional worker on one platform, backed by hosted Postgres.

This staging shape should keep the following flags locked:

- `SAFE_DRY_RUN=true`
- `X_READ_ENABLED=false`
- `X_POSTING_ENABLED=false`
- `HEYANON_ENABLE_LIVE_CALLS=false`

Before sharing the staging URL:

- set `ADMIN_PASSWORD`
- set `APP_BASE_URL` to the hosted web URL
- set `CLOCKED_MCP_BASE_URL` to the hosted MCP URL

Why this is the default recommendation:

- fewer moving parts for reviewer staging
- easier base URL alignment for `APP_BASE_URL` and `CLOCKED_MCP_BASE_URL`
- simpler smoke checks and rollback
- lower risk of environment drift while X and HeyAnon integrations are still disabled

The fastest reviewer staging setup in practice is a single platform that hosts:

- the web app
- the MCP server
- a managed Postgres database
- an optional worker process if you want deadline or evidence loops running continuously

Recommended shape:

- one platform for web + MCP + optional worker
- one managed Postgres on the same platform or attached externally

You can still split services later, but reviewer staging should optimize for low operational complexity rather than maximum separation.

## Required Services

- web app host
- Postgres database
- MCP server host
- optional worker process for fixture, deadline, and evidence jobs
- optional preview or staging domain

## Required Environment Variables

```bash
DATABASE_URL=
APP_BASE_URL=
CLOCKED_MCP_BASE_URL=
SAFE_DRY_RUN=true
ADMIN_PASSWORD=
ALLOW_ADMIN_QUERY_PASSWORD=false
X_READ_ENABLED=false
X_POSTING_ENABLED=false
HEYANON_ENABLE_LIVE_CALLS=false
RUN_AI_TESTS=false
HUD_EXPORT_SECRET=
MCP_API_KEY=
```

## Optional Variables To Keep Empty Until Integration Review

```bash
OPENAI_API_KEY=
OPENAI_MODEL=
X_API_BEARER_TOKEN=
X_API_KEY=
X_API_SECRET=
X_ACCESS_TOKEN=
X_ACCESS_TOKEN_SECRET=
HEYANON_API_BASE_URL=
HEYANON_API_KEY=
HEYANON_MCP_URL=
HEYANON_AGENT_ID=
HEYANON_PROJECT_KEY=
GEMMA_AGENT_ENDPOINT=
GEMMA_AGENT_ID=
```

## Reviewer Staging Rules

- `ADMIN_PASSWORD` must be set.
- `SAFE_DRY_RUN` should remain `true`.
- `X_READ_ENABLED` should remain `false` unless you are intentionally testing read-only X ingestion with real credentials.
- `X_POSTING_ENABLED` must remain `false`.
- `HEYANON_ENABLE_LIVE_CALLS` must remain `false`.
- `ALLOW_ADMIN_QUERY_PASSWORD` should remain `false` in staging. Use the `x-clocked-admin-password` header for protected mutations.
- `APP_BASE_URL` must match the hosted web URL.
- `CLOCKED_MCP_BASE_URL` must match the hosted MCP URL.

## Safe Staging Seed Flow

```bash
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm staging:seed
```

`staging:seed` uses the same deterministic dry-run data as `demo:seed`:

- seed project and actors
- fixture public claim
- pending review items
- delivered sample claim and evidence
- mock HeyAnon evidence review item

Fixtures are idempotent and cleanup targets only known demo artifacts. Do not run the demo seed flow against production data you want to preserve as non-demo records.

## Hosted Smoke

```bash
WEB_BASE_URL=https://your-staging-web.example.com corepack pnpm staging:smoke:web
MCP_BASE_URL=https://your-staging-mcp.example.com corepack pnpm staging:smoke:mcp
corepack pnpm staging:summary
STAGING_STRICT=true corepack pnpm staging:check-env
```

Public smoke checks:

- `/`
- `/admin/review`
- `/admin/ingest`
- `/p/example-protocol`
- `/a/X/examplefounder`
- `/due`
- `/api/hud/project/example-protocol`
- `/api/readiness`

Before sharing the staging URL, run:

```bash
STAGING_STRICT=true corepack pnpm staging:check-env
WEB_BASE_URL=https://your-staging-web.example.com corepack pnpm staging:share-check
```

`staging:share-check` confirms:

- database is reachable
- `SAFE_DRY_RUN=true`
- `X_READ_ENABLED=false`
- `X_POSTING_ENABLED=false`
- `HEYANON_ENABLE_LIVE_CALLS=false`
- `APP_BASE_URL` is configured
- `ADMIN_PASSWORD` is set

Admin mutations should only be tested with `x-clocked-admin-password`, not query parameter passwords.

## Alternate Hosted Smoke Form

```bash
APP_BASE_URL=https://your-web-staging.example.com \
CLOCKED_MCP_BASE_URL=https://your-mcp-staging.example.com \
corepack pnpm staging:summary
```

## Reviewer URLs

- `${APP_BASE_URL}`
- `${APP_BASE_URL}/admin/review`
- `${APP_BASE_URL}/admin/ingest`
- `${APP_BASE_URL}/p/example-protocol`
- `${APP_BASE_URL}/c/example-protocol-will-ship-v2-next-week`
- `${APP_BASE_URL}/a/X/examplefounder`
- `${APP_BASE_URL}/due`
- `${APP_BASE_URL}/api/hud/project/example-protocol`
- `${APP_BASE_URL}/api/readiness`
- `${CLOCKED_MCP_BASE_URL}/health`
- `${CLOCKED_MCP_BASE_URL}/manifest`

## Warnings

- Do not set `X_POSTING_ENABLED=true` in reviewer staging.
- Do not set `HEYANON_ENABLE_LIVE_CALLS=true` in reviewer staging.
- Do not set `X_READ_ENABLED=true` unless you are intentionally testing read-only X with approved credentials.
- `ADMIN_PASSWORD` must be set before sharing the staging URL.
