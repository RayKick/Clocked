# 60-Second Demo Script

Opening pitch:

> CLOCKED is a public receipts layer for crypto promises.

## Step 1

Open the homepage:

- `${APP_BASE_URL}`

Explain:

> CLOCKED turns concrete public promises into trackable claims with deadlines, evidence, and status history.

## Step 2

Open the project record:

- `${APP_BASE_URL}/p/example-protocol`

Explain:

> This is the project delivery record. It shows open, delivered, slipped, reframed, and ambiguous claim counts without turning them into a trust score.

## Step 3

Open the claim receipt:

- `${APP_BASE_URL}/c/example-protocol-will-ship-v2-next-week`

Explain:

> This receipt preserves the original quote, the normalized claim, the deadline logic, and the evidence trail. It records the claim without inferring intent.

## Step 4

Open admin review:

- `${APP_BASE_URL}/admin/review`

Explain:

> Every public receipt and material status change goes through review by default. Approval creates local records only in dry-run mode.

## Step 4.5

Open read-only X ingestion:

- `${APP_BASE_URL}/admin/ingest`

Explain:

> Paste a public X URL, add source text in dry-run mode, and CLOCKED creates a review item only. Approval is still required before any public receipt exists.
>
> Demo input: `https://x.com/examplefounder/status/1234567890` with dry-run source text `Rewards dashboard ships by Friday.` produces `Example Protocol will ship the rewards dashboard by Friday.` and the receipt slug `example-protocol-will-ship-rewards-dashboard-by-friday` after approval.

## Step 5

Explain human review and dry-run safety:

> X posting is disabled. HeyAnon and Gemma live calls are disabled. This demo proves the workflow and data model without live external writes.

## Step 6

Open the HUD export:

- `${APP_BASE_URL}/api/hud/project/example-protocol`

Explain:

> This is the compact, public-safe project context that a future HeyAnon HUD or another surface could render directly.

## Step 7

Show MCP:

- `${CLOCKED_MCP_BASE_URL}/health`
- `${CLOCKED_MCP_BASE_URL}/manifest`
- `clocked.search_claims`
- `clocked.get_claim`
- `clocked.get_project_record`

Closing:

> The same public record is available to humans on the web and to agents through MCP.

## Local Port Note

In local development, `APP_BASE_URL` may be:

- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:3002`

depending on port availability.
