# HeyAnon Integration

CLOCKED uses HeyAnon and Gemma as optional public-context and evidence-enrichment layers. The MVP ships typed interfaces first, mock implementations by default, and env-gated live clients so the repo never assumes unpublished production endpoints.

## Current MVP Shape

- `packages/heyanon` defines `HeyAnonClient` and `GemmaClient` interfaces.
- All inputs and outputs are Zod-validated.
- Mock clients are the default.
- Live calls are disabled unless `HEYANON_ENABLE_LIVE_CALLS=true`.
- Query logging writes `HeyAnonQuery` rows when the database is available.

## Supported Query Uses

- Project context for a known project slug or project key.
- Public source enrichment for official accounts or configured docs.
- Delivery-evidence collection around a claim deadline.
- Claim-stitching context across related statements.
- Gemma-assisted message, link, metrics, sentiment, and historical context wrappers.

## What Is Mocked

- Endpoint routes and transport assumptions.
- Response bodies for all HeyAnon and Gemma queries.
- Sentiment and metrics summaries.
- Public-source discovery beyond configured fixture inputs.

## What Needs Real Credentials And Confirmed Endpoints

- `HEYANON_API_BASE_URL`
- `HEYANON_API_KEY`
- `GEMMA_AGENT_ENDPOINT`
- `GEMMA_AGENT_ID`
- Any Launchpad or HUD registration step outside this repo

No production endpoint paths are hardcoded as trusted facts. Everything is isolated behind typed clients so the transport can be swapped once real documentation is available.

