# Deployment Checklist

This is a deployment checklist for safe staging and later production readiness, not a vendor-specific deployment guide.

## Required Services

- Node runtime
- Postgres
- web app host
- MCP server host
- optional worker process for fixture, deadline, and evidence jobs

## Required Environment Variables

- `DATABASE_URL`
- `APP_BASE_URL`
- `CLOCKED_MCP_BASE_URL`
- `SAFE_DRY_RUN`
- `ADMIN_PASSWORD`
- `ALLOW_ADMIN_QUERY_PASSWORD=false`
- `X_READ_ENABLED=false` by default
- `X_POSTING_ENABLED=false` by default
- `HEYANON_ENABLE_LIVE_CALLS=false` by default

## Staging Checklist

- set `ADMIN_PASSWORD`
- keep `SAFE_DRY_RUN=true`
- keep `X_READ_ENABLED=false`
- keep `X_POSTING_ENABLED=false`
- keep `HEYANON_ENABLE_LIVE_CALLS=false`
- keep `ALLOW_ADMIN_QUERY_PASSWORD=false`
- run migrations
- seed demo data if desired
- verify admin protection
- verify public pages
- verify MCP
- verify HUD
- verify `/api/readiness`
- verify no X posting
- verify no live HeyAnon or Gemma calls

## Safe Staging Deploy

```bash
corepack pnpm install
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm staging:check-env
corepack pnpm staging:seed
corepack pnpm web:start
corepack pnpm mcp:start
corepack pnpm worker:start
corepack pnpm staging:preflight
corepack pnpm staging:smoke:web
corepack pnpm staging:smoke:mcp
```

Use `STAGING_STRICT=true corepack pnpm staging:check-env` when you want missing staging secrets to fail the deploy preflight.

Reviewer checklist:

- open the homepage
- open the project page
- open the claim page
- open the actor page
- open the due page
- open the HUD export
- open `/api/readiness`
- test MCP `/health`, `/manifest`, `clocked.extract_claim_from_text`, `clocked.search_claims`, `clocked.get_claim`, and `clocked.get_project_record`
- verify admin mutation endpoints reject unauthenticated requests
- verify no live external writes are enabled

## Production Checklist

- use a secrets manager
- configure DB backups
- protect admin routes
- add MCP rate limiting
- add observability and logging
- configure domain and SSL
- add error monitoring
- add integration credentials only after review

## Rollback Checklist

- keep the previous app build available
- keep schema backups before risky DB changes
- disable new integrations before rollback if needed
- verify public pages and MCP after rollback
- verify dry-run and admin safety flags after rollback

## Explicit Non-Goals

- no live X posting
- no live HeyAnon or Gemma calls
- no token utility
- no on-chain actions
