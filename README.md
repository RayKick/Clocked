# CLOCKED

![CI](https://github.com/RayKick/Clocked/actions/workflows/ci.yml/badge.svg)

**When crypto says "soon", CLOCKED starts the timer.**

CLOCKED is a public memory layer for crypto promises. It turns public, time-bounded delivery claims into source-linked receipts with deadlines, evidence, review history, and agent-readable records.

## Why It Matters

Crypto has more public promises than public memory. Roadmaps move, posts disappear, and deadlines blur. CLOCKED keeps the source, deadline, evidence, and outcome attached without turning records into scores, rankings, or accusations.

## Product Loop

1. A founder, team, or protocol makes a public promise.
2. A user tags `@ClockedBot` with "clock this".
3. CLOCKED extracts the claim, source, deadline, and delivery criteria.
4. A human reviewer approves or rejects the draft.
5. A public receipt goes live.
6. Evidence and status history accumulate over time.
7. Humans, HUD surfaces, and agents query the same public record.

## What Works Now

- Next.js web app with public receipts, project records, actor records, due pages, and methodology.
- Admin review queue and ingest console for review-gated receipt creation.
- Prisma-backed records for projects, actors, source posts, triggers, claims, evidence, status events, review items, bot replies, jobs, HeyAnon queries, MCP invocations, and HUD snapshots.
- MCP server with claim search, claim detail, project record, actor record, due claims, extraction, draft creation, status evaluation, evidence submission, and weekly digest tools.
- HUD export endpoint for compact project context.
- Safe X client scaffolding with read and write gates separated.
- Safe-by-default local and staging scripts for demo, smoke, and preflight checks.

## Live Evaluation

- Web: [https://clocked-iota.vercel.app](https://clocked-iota.vercel.app)
- Readiness: [https://clocked-iota.vercel.app/api/readiness](https://clocked-iota.vercel.app/api/readiness)
- Methodology: [https://clocked-iota.vercel.app/methodology](https://clocked-iota.vercel.app/methodology)
- Example receipt: [https://clocked-iota.vercel.app/c/atlas-labs-mainnet-public-beta-by-april-30-2026](https://clocked-iota.vercel.app/c/atlas-labs-mainnet-public-beta-by-april-30-2026)

## Architecture

```mermaid
flowchart LR
  A["X / manual source"] --> B["Ingestion"]
  B --> C["AI extraction"]
  C --> D["Review queue"]
  D --> E["Claim + Evidence + StatusEvent"]
  E --> F["Web"]
  E --> G["HUD export"]
  E --> H["MCP tools"]
```

## Safety Model

CLOCKED is not a dunk bot. It does not publish accusations, liar scores, trust scores, or leaderboards. Public records use neutral status labels: `OPEN`, `DELIVERED`, `SLIPPED`, `REFRAMED`, `SUPERSEDED`, and `AMBIGUOUS`.

Safe defaults:

- `SAFE_DRY_RUN=true`
- `X_READ_ENABLED=false`
- `X_POSTING_ENABLED=false`
- `HEYANON_ENABLE_LIVE_CALLS=false`
- `ALLOW_ADMIN_QUERY_PASSWORD=false`
- `AI_MODE=mock`
- No live external writes by default.

Production hardening:

- Hosted production admin routes require `ADMIN_PASSWORD`.
- Hosted production MCP `/tools` requires `MCP_API_KEY`.
- Hosted production does not silently replace database errors with demo records unless `ENABLE_DEMO_FALLBACK=true` is explicitly set.
- Hosted production does not show sample records unless `SHOW_SAMPLE_RECORDS=true` is explicitly set; sample records are labeled in the UI.
- X posting still requires `X_POSTING_ENABLED=true`, valid write credentials, and approved bot replies.

## MCP And Agent Surfaces

The MCP server exposes public-safe tools for agent use:

- `clocked.search_claims`
- `clocked.get_claim`
- `clocked.get_project_record`
- `clocked.get_actor_record`
- `clocked.get_due_claims`
- `clocked.extract_claim_from_text`
- `clocked.create_claim_draft`
- `clocked.evaluate_claim_status`
- `clocked.submit_evidence`
- `clocked.get_weekly_digest`

`/health` and `/manifest` can remain public. `/tools` is authenticated in production.

## Current State Matrix

| Surface | Current state |
| --- | --- |
| Web app | Working |
| Public receipts | Working |
| Project records | Working |
| Actor records | Working |
| Due page | Working |
| Admin review queue | Working, protected in hosted production |
| DB-backed records | Working when `DATABASE_URL` is configured |
| MCP search/get tools | Working |
| HUD export | Working |
| X read | Disabled by default |
| X posting | Disabled by default |
| HeyAnon live calls | Disabled by default |
| Gemma live calls | Disabled by default |
| AI extraction | `AI_MODE=mock` by default; `auto` and `live` are available with credentials |
| Demo fallback records | Local/dev convenience only unless explicitly enabled |
| Sample records | Labeled product-preview records, disabled in hosted production unless explicitly enabled |

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

Recommended local `DATABASE_URL`:

```bash
postgresql://clocked:clocked@localhost:5433/clocked?schema=public
```

## Port Notes

- Postgres uses `localhost:5433` by default to avoid collisions with local Postgres on `5432`.
- `DATABASE_URL` in `.env` must match `docker-compose.yml`.
- The web app may start on `http://localhost:3000`, `http://localhost:3001`, or `http://localhost:3002` depending on port availability.
- `APP_BASE_URL` must match the active web port so public URLs in MCP and HUD responses stay correct.
- Demo smoke scripts read `WEB_BASE_URL` first, then `APP_BASE_URL`, then fall back to `http://localhost:3000`.
- MCP smoke reads `MCP_BASE_URL` first, then `CLOCKED_MCP_BASE_URL`, then falls back to `http://localhost:8787`.

## Local Demo Flow

1. Open the home page.
2. Open the admin review queue.
3. Approve a pending `CLAIM_CREATE` to create an additional local receipt draft.
4. Open the public receipt.
5. Open the project record.
6. Open the actor record.
7. Open the due page.
8. Open the HUD export.
9. Query the same data through MCP.

Common local URLs depend on your active `APP_BASE_URL`:

- [Home](http://localhost:3002)
- [Admin Review](http://localhost:3002/admin/review)
- [Public Claim Receipt](http://localhost:3002/c/example-protocol-will-ship-v2-next-week)
- [Project Record](http://localhost:3002/p/example-protocol)
- [Actor Record](http://localhost:3002/a/X/examplefounder)
- [Due Page](http://localhost:3002/due)
- [HUD Export](http://localhost:3002/api/hud/project/example-protocol)

## Read-Only X URL Ingestion Demo

1. Open `/admin/ingest`.
2. Paste an X post URL.
3. In dry-run, add source text unless you are using a known fixture URL.
4. Submit the form.
5. CLOCKED creates a review item only.
6. Open `/admin/review`.
7. Approve the new item to create the public receipt.
8. No X post is made.
9. Live X reads stay disabled by default with `X_READ_ENABLED=false`, so dry-run uses the `sourceText` override unless reads are intentionally enabled later.

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
- `corepack pnpm staging:seed`
- `corepack pnpm staging:check-env`
- `corepack pnpm staging:preflight`
- `corepack pnpm staging:smoke:web`
- `corepack pnpm staging:smoke:mcp`
- `corepack pnpm staging:summary`

## Safe Staging Deploy

Required infrastructure:

- Postgres
- Web app host
- MCP server host
- Worker process for fixtures or deadline tasks when needed

Required env for reviewer staging:

- `DATABASE_URL`
- `APP_BASE_URL`
- `CLOCKED_MCP_BASE_URL`
- `ADMIN_PASSWORD`
- `SAFE_DRY_RUN=true`
- `X_READ_ENABLED=false`
- `X_POSTING_ENABLED=false`
- `HEYANON_ENABLE_LIVE_CALLS=false`
- `ALLOW_ADMIN_QUERY_PASSWORD=false`

Suggested deploy flow:

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
WEB_BASE_URL=https://your-staging-web.example.com corepack pnpm staging:share-check
```

Use `STAGING_STRICT=true corepack pnpm staging:check-env` when missing staging-only secrets should fail preflight instead of reporting warnings.

Reviewer checklist:

- Open the homepage.
- Open the project page.
- Open the claim page.
- Open the actor page.
- Open the due page.
- Open the HUD export.
- Open `/api/readiness`.
- Test MCP `/health`, `/manifest`, and core tools.
- Verify admin routes require `ADMIN_PASSWORD` in hosted production.
- Verify no live X posting and no live HeyAnon/Gemma calls are enabled.

## Current Limitations

- X posting is disabled by default and should stay disabled until intentional rollout.
- Live X reads are disabled by default; dry-run ingestion uses source text overrides or known fixture URLs.
- HeyAnon and Gemma live calls are disabled by default.
- Reviewer staging still needs production credentials, seeded public records, and deployment-specific secret management.
- Remote MCP hosting needs final auth, origin, and rate-limit requirements for the launch environment.

## What Real HeyAnon Launchpad Or MCP Integration Still Needs

- Confirmed HeyAnon API base URLs.
- Confirmed auth scheme.
- Confirmed Gemma endpoint and agent IDs.
- Remote MCP hosting, auth, origin, and rate-limit requirements.
- Final Launchpad manifest contract.
- HUD registration or pull contract.
- Production credential management.

## What Real X Posting Still Needs

- Keep `X_POSTING_ENABLED=false` until intentional rollout.
- Human approval required.
- An already `APPROVED` `BotReply`.
- Valid X write credentials.
- A worker that processes approved replies.
- The admin approve route must never post directly.

## Docs

- [Reviewer Guide](docs/REVIEWER_GUIDE.md)
- [Demo Script](docs/DEMO_SCRIPT.md)
- [Staging Guide](docs/STAGING.md)
- [Launchpad Readiness](docs/LAUNCHPAD_READINESS.md)
- [Deployment Checklist](docs/DEPLOYMENT.md)
- [MCP Tools](docs/MCP_TOOLS.md)
- [HUD Export](docs/HUD_EXPORT.md)
- [Safety And Compliance](docs/SAFETY_AND_COMPLIANCE.md)
