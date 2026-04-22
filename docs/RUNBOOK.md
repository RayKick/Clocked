# CLOCKED Backend Runbook

## Local Demo Setup

```bash
corepack pnpm install
cp .env.example .env
docker compose up -d postgres
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm db:seed
corepack pnpm worker:fixtures
corepack pnpm dev
corepack pnpm mcp:dev
```

Local Postgres defaults to `localhost:5433` to avoid conflicts with local Postgres on `5432`.

## Migration Layout

- Prisma schema: `packages/db/prisma/schema.prisma`
- Migration state: `packages/db/prisma/migrations`
- Migration lock: `packages/db/prisma/migration_lock.toml`

Do not split migration state across a root `prisma/` directory and `packages/db/prisma` unless that change is intentional and documented.

## Seed And Fixture Scope

`corepack pnpm db:seed` upserts:

- `Example Protocol`
- founder actor `@examplefounder`
- official project actor `@exampleprotocol`

`corepack pnpm worker:fixtures` upserts:

- an approved open public claim
- a pending `CLAIM_CREATE` item for admin review
- a delivered claim with evidence and status history
- a `NOT_CLOCKABLE` review item
- a `NEEDS_REVIEW` review item
- a mock `HEYANON_EVIDENCE` review item

Fixtures are deterministic and should remain idempotent.

## Safety Defaults

- `SAFE_DRY_RUN=true`
- `X_POSTING_ENABLED=false`
- `HEYANON_ENABLE_LIVE_CALLS=false`
- no automatic public posting from admin approve routes

## Smoke Checks

If the web server is running:

```bash
corepack pnpm demo:smoke:web
```

If the MCP server is running:

```bash
corepack pnpm demo:smoke:mcp
```
