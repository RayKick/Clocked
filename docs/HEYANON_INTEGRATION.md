# HeyAnon Integration

CLOCKED uses HeyAnon and Gemma as optional public-context and evidence-enrichment layers. The MVP ships typed interfaces first, mock implementations by default, and env-gated live clients so the repo never assumes unpublished production endpoints.

## Current MVP Shape

- `packages/heyanon` defines `HeyAnonClient` and `GemmaClient` interfaces.
- All inputs and outputs are Zod-validated.
- Mock clients are the default.
- Live calls are disabled unless `HEYANON_ENABLE_LIVE_CALLS=true`.
- Query attempts can be logged as `HeyAnonQuery` rows when the database is available.
- CLOCKED also exposes its own public record through MCP for other HeyAnon agents.

## What CLOCKED Uses HeyAnon For

- public project context
- public-source enrichment around a claim deadline
- claim stitching context
- delivery-evidence suggestions
- compact HUD-oriented project summaries

These results stay review-oriented in MVP. They do not automatically publish new claims or status changes.

## What Is Mocked In MVP

- transport and endpoint details
- response payloads for all HeyAnon and Gemma queries
- sentiment and metrics summaries
- Launchpad registration or import behavior
- HUD registration outside this repo

## What Needs Real Credentials And Confirmed Endpoints

- `HEYANON_API_BASE_URL`
- `HEYANON_API_KEY`
- `HEYANON_MCP_URL`
- `HEYANON_AGENT_ID`
- `GEMMA_AGENT_ENDPOINT`
- `GEMMA_AGENT_ID`
- Launchpad manifest contract and import requirements
- HUD registration or pull semantics

No production endpoint paths are hardcoded as trusted facts. Everything stays behind typed clients so transport can be swapped once real documentation is available.
