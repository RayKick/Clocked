# X Integration

## Scope

CLOCKED's X integration is intentionally conservative. The X client package is responsible for:

- reading public posts and user profiles through the official X API;
- managing filtered stream rules for CLOCKED trigger phrases;
- formatting short, factual draft replies;
- enforcing hard write guards before any live post attempt;
- supporting a mock implementation for tests and fixture flows.

The MVP does not scrape X, automate a browser, or post anything by default.

## Safe Defaults

X writes are blocked unless all of the following are true:

- `X_POSTING_ENABLED=true`
- `SAFE_DRY_RUN=false`
- the `BotReply` status is `APPROVED`
- the reply has a `replyToPlatformPostId`
- write credentials are present

This means a generated draft or approved draft can still exist in CLOCKED without creating any network side effect. Posting is a separate, explicit step for the worker.

## Package Layout

`packages/x-client/src/types.ts`
Typed X entities, environment parsing, and the `XClient` interface.

`packages/x-client/src/xClient.ts`
Real client implementation, env guards, OAuth 1.0a signing for write calls, and the `postApprovedBotReply` helper.

`packages/x-client/src/mockXClient.ts`
In-memory mock client used by tests and fixtures.

`packages/x-client/src/streamRules.ts`
Helpers for CLOCKED trigger phrases, filtered stream rules, and parent/quote target resolution.

`packages/x-client/src/formatReply.ts`
Reply templates for `CLOCKED`, `NOT CLOCKABLE`, and `NEEDS REVIEW`.

## Trigger Strategy

The default trigger phrases are:

- `clock this`
- `clocked`
- `clock it`

The filtered stream rules are built around mentions of the configured bot handle plus one of those phrases. Rules exclude retweets, but they intentionally allow quote-post triggers so CLOCKED can inspect the quoted source. The resolution helper prefers:

1. parent post
2. quoted post
3. no target

Retweets are ignored entirely.

## Write Safety Model

The safest API in the package is `postApprovedBotReply`. It checks policy before it delegates to `createReply`. The intended worker flow is:

1. read a `BotReply`
2. ensure it is admin-approved
3. call `postApprovedBotReply`
4. update DB state only if the helper returns `POSTED`

This prevents accidental posting through direct client usage in higher-level services. If a caller tries to post while dry-run mode is on, the helper returns `SKIPPED`.

## Credentials

Read-only endpoints use `X_API_BEARER_TOKEN`.

Write endpoints require:

- `X_API_KEY`
- `X_API_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_TOKEN_SECRET`

The package never exposes these values client-side. It is designed for server-only execution.

## Testing

The package includes unit tests for:

- reply formatting
- trigger phrase extraction
- target resolution
- write blocking when `X_POSTING_ENABLED=false`
- write blocking when `SAFE_DRY_RUN=true`
- skipping unapproved replies
- allowing posting only when all guards pass

## Integration Notes

- The real X API base URL is configurable via `X_API_BASE_URL`.
- Rate limits raise explicit errors instead of retry storms.
- Stream reconnection is minimal and conservative.
- The real client should be wired only from worker/server code, never from browser components.
- Higher-level ingestion logic should still store raw payloads and review artifacts in the main CLOCKED database.

## MVP Boundaries

Included now:

- typed X client interface
- official API wrapper with guarded writes
- mock client
- filtered stream rule helpers
- reply formatting helpers
- tests

Deferred to the wider app:

- persistence of `Trigger` and `BotReply` rows
- worker orchestration for approved posts
- admin review UI
- project/account resolution outside of X
