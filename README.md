# CLOCKED

Public receipts for crypto promises.

CLOCKED turns concrete public promises into trackable claims with deadlines, evidence, and status history. It starts with X-style receipt workflows and exposes the same public record to agents through MCP.

## Current Demo Status

- dry-run demo works locally
- DB-backed MCP works against fixture data
- X posting is disabled
- HeyAnon and Gemma live calls are disabled

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

## Quick Start

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

## Port Notes

- Postgres uses `localhost:5433` by default to avoid collisions with local Postgres on `5432`.
- `DATABASE_URL` in `.env` must match `docker-compose.yml`.
- The web app may start on `http://localhost:3000`, `http://localhost:3001`, or `http://localhost:3002` depending on port availability.
- `APP_BASE_URL` must match the active web port so public URLs in MCP and HUD responses stay correct.
- Demo smoke scripts read `WEB_BASE_URL` first, then `APP_BASE_URL`, then fall back to `http://localhost:3000`.
- MCP smoke reads `MCP_BASE_URL` first, then `CLOCKED_MCP_BASE_URL`, then falls back to `http://localhost:8787`.

Recommended local `DATABASE_URL`:

```bash
postgresql://clocked:clocked@localhost:5433/clocked?schema=public
```

## Demo

1. Open the home page.
2. Open the admin review queue.
3. Approve a pending `CLAIM_CREATE` to create an additional local receipt draft.
4. Open the public receipt.
5. Open the project record.
6. Open the actor record.
7. Open the due page.
8. Open the HUD export.
9. Query the same data through MCP.

## Read-Only X URL Ingestion Demo

1. Open `/admin/ingest`.
2. Paste an X post URL.
3. In dry-run, add source text unless you are using a known fixture URL.
   Example source text: `Rewards dashboard ships by Friday.`
4. Submit the form.
5. CLOCKED creates a review item only.
6. Open `/admin/review`.
7. Approve the new item to create the public receipt.
   Expected normalized claim: `Example Protocol will ship the rewards dashboard by Friday.`
   Expected receipt slug: `example-protocol-will-ship-rewards-dashboard-by-friday`
8. No X post is made.
9. Live X reads stay disabled by default with `X_READ_ENABLED=false`, so dry-run uses the `sourceText` override unless you intentionally enable reads later.

Local demo URLs depend on your active `APP_BASE_URL`. Common examples:

- [Home](http://localhost:3002)
- [Admin Review](http://localhost:3002/admin/review)
- [Public Claim Receipt](http://localhost:3002/c/example-protocol-will-ship-v2-next-week)
- [Project Record](http://localhost:3002/p/example-protocol)
- [Actor Record](http://localhost:3002/a/X/examplefounder)
- [Due Page](http://localhost:3002/due)
- [HUD Export](http://localhost:3002/api/hud/project/example-protocol)

If `3000` or `3001` is the active web port on your machine, use the same paths there and update `APP_BASE_URL` to match.

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
  -d '{"tool":"clocked.get_claim","input":{"slug":"example-protocol-will-ship-v2-next-week"}}'
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

## Safety

- no live posting by default
- X reads and X writes are gated separately
- no live HeyAnon or Gemma calls by default
- human review for public receipts and status changes
- neutral language and evidence-based copy
- no trust score, liar score, or leaderboard

## Useful Commands

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
- `corepack pnpm demo:summary`

## What Remains Mocked

- X posting
- live X reads in normal local dry-run unless `X_READ_ENABLED=true`
- HeyAnon live calls
- Gemma live calls
- AI calls in normal tests

## What Real HeyAnon Launchpad Or MCP Integration Still Needs

- confirmed HeyAnon API base URLs
- confirmed auth scheme
- confirmed Gemma endpoint and agent IDs
- remote MCP hosting, auth, origin, and rate-limit requirements
- final Launchpad manifest contract
- HUD registration or pull contract
- production credential management

## What Real X Posting Still Needs

- keep `X_POSTING_ENABLED=false` until intentional rollout
- human approval required
- an already `APPROVED` `BotReply`
- valid X write credentials
- a worker that processes approved replies
- the admin approve route must never post directly

## Docs

- [Reviewer Guide](/Users/raiko/Desktop/clocked/docs/REVIEWER_GUIDE.md)
- [Demo Script](/Users/raiko/Desktop/clocked/docs/DEMO_SCRIPT.md)
- [Launchpad Readiness](/Users/raiko/Desktop/clocked/docs/LAUNCHPAD_READINESS.md)
- [Deployment Checklist](/Users/raiko/Desktop/clocked/docs/DEPLOYMENT.md)
- [MCP Tools](/Users/raiko/Desktop/clocked/docs/MCP_TOOLS.md)
- [HUD Export](/Users/raiko/Desktop/clocked/docs/HUD_EXPORT.md)
- [Safety And Compliance](/Users/raiko/Desktop/clocked/docs/SAFETY_AND_COMPLIANCE.md)
