# CLOCKED

Public receipts for crypto promises.

CLOCKED turns concrete public promises into trackable claims with deadlines, evidence, and status history. It starts with X-style receipt workflows and exposes the same public record to agents through MCP.

## What CLOCKED Is

- A public receipts layer for crypto promises.
- A HeyAnon-native public memory layer.
- An X-first human workflow for tagging concrete claims.
- An MCP surface for agents that need claims, project records, and due deadlines.
- A HUD export surface for compact project context.

## Safe Defaults

- `SAFE_DRY_RUN=true`
- `X_POSTING_ENABLED=false`
- `HEYANON_ENABLE_LIVE_CALLS=false`
- `RUN_AI_TESTS=false`
- No live external writes by default.

## Local Setup

```bash
corepack pnpm install
cp .env.example .env
docker compose up -d postgres
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm db:seed
corepack pnpm worker:fixtures
corepack pnpm dev
```

Notes:

- Postgres uses `localhost:5433` by default to avoid collisions with local Postgres on `5432`.
- `DATABASE_URL` in `.env` must match `docker-compose.yml`.
- The web app may start on `http://localhost:3000` or `http://localhost:3002` depending on port availability.
- `APP_BASE_URL` must match the active web port so public URLs in MCP and HUD responses stay correct.

Recommended local `DATABASE_URL`:

```bash
postgresql://clocked:clocked@localhost:5433/clocked?schema=public
```

## Commands

- `corepack pnpm dev`
- `corepack pnpm build`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm db:generate`
- `corepack pnpm db:migrate`
- `corepack pnpm db:seed`
- `corepack pnpm worker:fixtures`
- `corepack pnpm mcp:dev`
- `corepack pnpm demo:seed`
- `corepack pnpm demo:verify`
- `corepack pnpm demo:smoke:web`
- `corepack pnpm demo:smoke:mcp`

## 60-Second Local Demo

1. Open the home page.
2. Open the admin review queue.
3. Approve a pending `CLAIM_CREATE` to create an additional local receipt draft.
4. Open the public receipt.
5. Open the project record.
6. Open the actor record.
7. Open the due page.
8. Open the HUD export.
9. Query the same data through MCP.

Demo URLs if your local port is `3002`:

- [Home](http://localhost:3002)
- [Admin Review](http://localhost:3002/admin/review)
- [Public Claim Receipt](http://localhost:3002/c/example-protocol-example-protocol-will-ship-v2-next-week)
- [Project Record](http://localhost:3002/p/example-protocol)
- [Actor Record](http://localhost:3002/a/X/examplefounder)
- [Due Page](http://localhost:3002/due)
- [HUD Export](http://localhost:3002/api/hud/project/example-protocol)

If `3000` is free on your machine, use the same paths on `http://localhost:3000` and set `APP_BASE_URL` to match.

## MCP Local Demo

Run:

```bash
corepack pnpm mcp:dev
```

Then smoke test:

```bash
curl http://localhost:8787/health
curl http://localhost:8787/manifest
curl -X POST http://localhost:8787/tools \
  -H 'content-type: application/json' \
  -d '{"tool":"clocked.extract_claim_from_text","input":{"text":"V2 ships next week.","sourcePostedAt":"2026-04-14T10:00:00.000Z","sourceAuthorHandle":"examplefounder","projectName":"Example Protocol"}}'
curl -X POST http://localhost:8787/tools \
  -H 'content-type: application/json' \
  -d '{"tool":"clocked.search_claims","input":{"projectSlug":"example-protocol","limit":10}}'
curl -X POST http://localhost:8787/tools \
  -H 'content-type: application/json' \
  -d '{"tool":"clocked.get_claim","input":{"slug":"example-protocol-example-protocol-will-ship-v2-next-week"}}'
curl -X POST http://localhost:8787/tools \
  -H 'content-type: application/json' \
  -d '{"tool":"clocked.get_project_record","input":{"projectSlug":"example-protocol"}}'
```

`clocked.extract_claim_from_text` remains safe without a database. DB-backed MCP tools require a reachable Postgres instance and return a clear error if the database is unavailable.

## Demo Narrative

1. A founder posts a concrete promise.
2. A user tags `@ClockedBot` with “clock this”.
3. CLOCKED extracts the claim.
4. A review item is created.
5. A human approves the receipt.
6. A public claim page is created.
7. Evidence and status history accumulate over time.
8. HeyAnon agents can query the public record through MCP.
9. HUD consumers can show compact project context.

## What Remains Mocked

- X posting
- HeyAnon live calls
- Gemma live calls
- AI calls in normal tests

## Real HeyAnon Launchpad Or MCP Integration Still Needs

- confirmed HeyAnon API base URLs
- confirmed auth scheme
- confirmed Gemma endpoint and agent IDs
- remote MCP hosting, auth, origin, and rate-limit requirements
- final Launchpad manifest contract
- HUD registration or pull contract
- production credential management

## Real X Posting Still Needs

- keep `X_POSTING_ENABLED=false` until intentional rollout
- human approval required
- an already `APPROVED` `BotReply`
- valid X write credentials
- a worker that processes approved replies
- the admin approve route must never post directly
