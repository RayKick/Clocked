# CLOCKED

Public receipts for crypto promises.

CLOCKED is a HeyAnon-native public memory layer for time-bounded crypto commitments. It records public source quotes, deadlines, evidence, reviewable status changes, public receipt pages, an MCP surface for agents, and a HUD export surface for compact project context.

## What CLOCKED Is

- Public receipts for crypto promises.
- A HeyAnon-native public memory layer.
- An X-first human workflow for tagging concrete claims.
- An MCP surface so other agents can query claims and delivery records.
- A HUD export surface for compact project context.

## Safe Defaults

- `SAFE_DRY_RUN=true`
- `X_POSTING_ENABLED=false`
- `HEYANON_ENABLE_LIVE_CALLS=false`
- No live external writes by default.
- No live HeyAnon or Gemma calls by default.
- No X posting from admin approval routes.

## Local Setup

`DATABASE_URL` should be:

```bash
postgresql://clocked:clocked@localhost:5432/clocked?schema=public
```

Run:

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

## Commands

- `corepack pnpm dev`
- `corepack pnpm build`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm db:generate`
- `corepack pnpm db:migrate`
- `corepack pnpm db:seed`
- `corepack pnpm worker:dev`
- `corepack pnpm worker:fixtures`
- `corepack pnpm worker:heyanon-evidence`
- `corepack pnpm mcp:dev`
- `corepack pnpm eval:claims`
- `corepack pnpm eval:status`

## 60-Second Local Demo

After `db:migrate`, `db:seed`, `worker:fixtures`, and `dev`, open:

- [Home](http://localhost:3000)
- [Fixture Claim URL After Approval](http://localhost:3000/c/example-protocol-example-protocol-will-ship-v2-next-week)
- [Project Record](http://localhost:3000/p/example-protocol)
- [Actor Record](http://localhost:3000/a/X/examplefounder)
- [Due Feed](http://localhost:3000/due)
- [HUD Export](http://localhost:3000/api/hud/project/example-protocol)

Manual happy path:

1. Open `/admin/review`.
2. Approve the pending `CLAIM_CREATE` item for `V2 ships next week.`
3. Open the created public receipt page at `/c/example-protocol-example-protocol-will-ship-v2-next-week`.
4. Approve a `BOT_REPLY` review item only if you want the draft marked approved.
5. Keep X posting disabled unless you intentionally satisfy the production gates described below.

## Fixtures And Manual Creation

- `corepack pnpm worker:fixtures` creates or refreshes dry-run review items for a clockable claim draft, a delivered claim with evidence and status history, a not-clockable review item, an ambiguous needs-review item, and a mock HeyAnon evidence review item.
- Fixtures are idempotent and do not post externally.
- You can also create a draft through the admin review flow or the `clocked.create_claim_draft` MCP tool.

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
  -d '{"tool":"clocked.search_claims","input":{"projectSlug":"example-protocol","limit":5}}'
curl -X POST http://localhost:8787/tools \
  -H 'content-type: application/json' \
  -d '{"tool":"clocked.get_claim","input":{"slug":"example-protocol-example-protocol-will-publish-the-public-beta"}}'
curl -X POST http://localhost:8787/tools \
  -H 'content-type: application/json' \
  -d '{"tool":"clocked.get_project_record","input":{"projectSlug":"example-protocol"}}'
```

`clocked.extract_claim_from_text` is safe without a database. DB-backed MCP tools require a reachable Postgres instance and will return a database error if the DB is unavailable.

## HeyAnon And Gemma

- The MVP ships with typed adapters and mock clients by default.
- Enable live HeyAnon calls only after confirmed credentials and endpoints are in `.env`.
- Tests and local dry runs use mocks or fixtures unless explicitly gated.

Real HeyAnon integration still needs:

- confirmed HeyAnon API base URLs
- confirmed auth scheme
- confirmed Gemma endpoint and agent IDs
- remote MCP hosting, auth, origin, and rate-limit requirements
- final Launchpad manifest contract
- HUD registration or pull contract
- production credential management

## Real X Posting

Keep real X posting disabled until all of the following are intentionally true:

- human review is enabled and in use
- a `BotReply` is already `APPROVED`
- `X_POSTING_ENABLED=true`
- `SAFE_DRY_RUN=false`
- a worker explicitly processes approved replies

The admin approve route never posts to X directly.
