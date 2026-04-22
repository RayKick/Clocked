# CLOCKED Safety And Compliance

CLOCKED is built to create a useful public record without enabling harassment, defamation, or unsafe automation.

## Safety Principles

The MVP follows these operating principles:

- public receipts over accusations
- human review over automatic judgment
- official public sources over scraping or private ingestion
- typed interfaces and mocks before live integrations
- auditability over hidden automation

## Official APIs Only

The MVP should use official APIs, supported MCP surfaces, or manually reviewed public inputs where available.

It should not depend on:

- browser automation
- scraping private or gated communities
- credential-sharing hacks
- reverse-engineered, unstable production endpoints hardcoded into the app

Where real integrations are uncertain, CLOCKED should ship mocked adapters and clearly documented TODOs rather than unsafe guesses.

## No Scraping

No custom scraping is allowed in MVP.

That includes:

- scraping X web pages instead of using official APIs
- scraping Discord or Telegram messages directly
- scraping private forums or paid communities

Future integrations for chat or community context should flow through supported HeyAnon capabilities or official APIs, not custom collectors.

## Public Data Only

CLOCKED should only process public information in MVP.

It must not ingest:

- private direct messages
- gated community messages unless the source is explicitly public and supported by policy
- leaked materials
- private personal data beyond what is already public and relevant to a claim record

## Human Review By Default

Human review is the main safety boundary.

Review is required by default for:

- public claim creation from extracted text
- AI-generated public replies
- status changes after deadlines
- evidence that materially affects a claim outcome
- possible reframes or superseding claims
- HeyAnon or Gemma evidence suggestions

Automation may assist with extraction, summarization, and evidence gathering, but it should not silently publish contested conclusions.

## Non-Defamatory Language

CLOCKED must avoid defamatory phrasing in its own voice.

The product must not:

- call a person or team a liar
- infer bad intent
- label a project a scam or fraud based on claim tracking alone
- present uncertain evidence as settled fact

Approved public vocabulary includes:

- Open
- Delivered
- Slipped
- Reframed
- Superseded
- Ambiguous
- Not Clockable
- Needs Review

These labels describe the record, not motive or character.

## Opt-Out And Correction Handling

Because the system is based on public sources, the default response to disagreement is correction and review, not silent removal.

The product should support:

- evidence submissions
- dispute review
- correction of source metadata
- clarification of actor and project mappings
- status revision when better public evidence appears

Where a record is genuinely contestable, AMBIGUOUS is preferable to overclaiming.

## External Write Safety

External writes must be off by default.

Required constraints:

- `SAFE_DRY_RUN=true` by default
- `X_READ_ENABLED=false` by default
- no X posting unless `X_POSTING_ENABLED=true`
- no live X reads unless `X_READ_ENABLED=true`
- no posting unless an admin-approved `BotReply` exists
- no live HeyAnon or Gemma calls unless `HEYANON_ENABLE_LIVE_CALLS=true`
- no client-side secret exposure under any circumstance

This ensures local development and test runs remain safe.

X reads and X writes are separate controls. `X_POSTING_ENABLED` only governs writes. `X_READ_ENABLED` governs live read attempts. Human review remains required either way.

## Secrets Handling

Secrets must stay server-side.

Rules:

- API keys and bearer tokens must never be shipped to the browser
- environment variables should be read only in server contexts
- tests must pass with mocks and fixtures instead of real credentials
- logs should avoid leaking credential material

If a credential is missing, the product should fail closed and continue in mock or dry-run mode where possible.

## MCP Security

The MCP surface should be treated as a public-data interface with strict validation.

Minimum controls:

- validate all tool inputs with Zod
- require `MCP_API_KEY` in remote HTTP mode
- validate origin where applicable
- apply rate limiting or a clear stub for rate limiting
- log invocations for auditability
- never expose admin-only or secret-bearing fields

The MCP server should return only public-safe data unless an explicitly authorized private mode is later introduced.

## Logging And Auditability

CLOCKED should preserve a clear audit trail of material actions.

Important events to log:

- source capture
- trigger ingestion
- claim draft creation
- review approvals and rejections
- status changes
- evidence submissions
- MCP invocations
- HeyAnon query attempts and outcomes

Auditability matters because the product's credibility depends on showing how the record was assembled.

## Compliance Posture For MVP

The MVP is designed to be conservative.

That means:

- decline weak claims
- prefer review on ambiguity
- preserve source and rationale
- avoid unsupported endpoint assumptions
- avoid private or scraped data
- avoid automatic public posting

If a feature cannot be implemented safely under those rules, it should remain mocked, disabled, or explicitly marked as future work.
