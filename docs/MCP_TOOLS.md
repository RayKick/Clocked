# MCP Tools

CLOCKED exposes a public-safe MCP surface for claims, project records, actor records, due feeds, draft creation, and evidence submission.

## Tools

- `clocked.search_claims`
  Input: `{ query?, projectSlug?, actorHandle?, status?, dueBefore?, limit? }`
  Output: claim summaries with slug, project, actor, status, deadline, source URL, and public URL.
- `clocked.get_claim`
  Input: `{ slug }`
  Output: public claim details, evidence timeline, status history, and public URL.
- `clocked.get_project_record`
  Input: `{ projectSlug }`
  Output: project summary, counts by status, due-soon claims, latest claims, latest status changes, public URL, and factual summary.
- `clocked.get_actor_record`
  Input: `{ platform, handle }`
  Output: actor profile, associated projects, counts by status, latest claims, public URL, and factual summary.
- `clocked.get_due_claims`
  Input: `{ timeframe, projectSlug?, limit? }`
  Output: due or overdue public claims.
- `clocked.extract_claim_from_text`
  Input: raw source text plus optional metadata.
  Output: safe extraction result only. No claim creation.
- `clocked.create_claim_draft`
  Input: source text plus optional metadata.
  Output: pending review item ID plus extraction payload.
- `clocked.evaluate_claim_status`
  Input: `claimSlug` plus optional evidence text or URLs.
  Output: safe evaluation result only. No automatic mutation.
- `clocked.submit_evidence`
  Input: claim slug plus evidence text or URL.
  Output: pending evidence review item.
- `clocked.get_weekly_digest`
  Input: optional project or week filters.
  Output: compact digest summary and share text.

## Example Calls

```bash
curl ${CLOCKED_MCP_BASE_URL:-http://localhost:8787}/health
curl ${CLOCKED_MCP_BASE_URL:-http://localhost:8787}/manifest
curl -X POST ${CLOCKED_MCP_BASE_URL:-http://localhost:8787}/tools \
  -H 'content-type: application/json' \
  -d '{"tool":"clocked.extract_claim_from_text","input":{"text":"V2 ships next week.","sourcePostedAt":"2026-04-14T10:00:00.000Z","sourceAuthorHandle":"examplefounder","projectName":"Example Protocol"}}'
curl -X POST ${CLOCKED_MCP_BASE_URL:-http://localhost:8787}/tools \
  -H 'content-type: application/json' \
  -d '{"tool":"clocked.search_claims","input":{"projectSlug":"example-protocol","limit":10}}'
curl -X POST ${CLOCKED_MCP_BASE_URL:-http://localhost:8787}/tools \
  -H 'content-type: application/json' \
  -d '{"tool":"clocked.get_claim","input":{"slug":"example-protocol-will-ship-v2-next-week"}}'
curl -X POST ${CLOCKED_MCP_BASE_URL:-http://localhost:8787}/tools \
  -H 'content-type: application/json' \
  -d '{"tool":"clocked.get_project_record","input":{"projectSlug":"example-protocol"}}'
```

## Security Model

- `MCP_API_KEY` is required for remote HTTP mode when configured.
- All inputs are Zod-validated.
- Only public-safe data is returned.
- Tool invocations are logged to `McpInvocation` when the DB is available.
- Secrets, admin passwords, and private review-only fields are excluded.

## Database Behavior

- DB-backed tools return real fixture data when Postgres is available.
- If the DB is unavailable, DB-backed tools fail clearly instead of returning fake success.
- `clocked.extract_claim_from_text` remains safe and DB-optional.
