# CLOCKED Repo Guide

CLOCKED is a HeyAnon-native public receipts agent for time-bounded crypto promises. The product tracks public claims, delivery evidence, deadline logic, and factual status changes without harassment framing.

## Safety Defaults

- Keep `SAFE_DRY_RUN=true` unless there is an explicit reason to disable it.
- Never enable X posting without `X_POSTING_ENABLED=true`.
- Never enable live HeyAnon or Gemma calls without `HEYANON_ENABLE_LIVE_CALLS=true`.
- Never expose API keys, bearer tokens, or admin secrets client-side.
- AI outputs must use structured schemas and validated parsing.
- MCP tools must validate inputs with Zod and return public-safe data only.
- Public copy must stay neutral, evidence-based, and non-defamatory.
- Prefer `NOT_CLOCKABLE` or review paths for vague claims.

## Commands

- `pnpm install`
- `docker compose up -d`
- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm db:seed`
- `pnpm dev`
- `pnpm worker:dev`
- `pnpm worker:fixtures`
- `pnpm mcp:dev`
- `pnpm test`

## Test Expectations

- Unit tests must pass without real OpenAI, X, or HeyAnon credentials.
- Mock clients are the default for tests and local dry runs.
- New public copy or status logic should include tests where practical.

