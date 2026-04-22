# Reviewer Guide

## What CLOCKED Is

CLOCKED is a public receipts layer for crypto promises. It turns concrete public claims into trackable records with deadlines, evidence, and status history.

## What Problem It Solves

Crypto teams make a large share of their commitments in public posts that spread quickly and are easy to forget. CLOCKED preserves what was said, when it was said, how it was interpreted, and what public evidence later supports the outcome.

## Why This Is Not A Roast Bot

CLOCKED is not a harassment product and not a liar-score system. It uses neutral statuses such as Open, Delivered, Slipped, Reframed, Superseded, and Ambiguous. It preserves source text, deadline logic, evidence, confidence, and review status without inferring intent.

## Why Public Receipts Matter

Public receipts help communities, researchers, and downstream agents compare delivery against public promises. Delivered receipts matter as much as slipped ones because the product is meant to be a factual memory layer, not a dunk feed.

## What The Dry-Run Demo Proves

- CLOCKED can ingest demo claims into a DB-backed workflow.
- Human review creates or rejects receipts locally.
- Public claim, project, actor, due, and HUD surfaces work off the same record.
- MCP exposes the same public record to agents.

## What Is Mocked

- X posting
- HeyAnon live calls
- Gemma live calls
- AI calls in normal test runs

## What Is Intentionally Disabled

- live X posting by default
- live HeyAnon and Gemma calls by default
- automatic accusation language
- trust scores, liar scores, and leaderboards

## What To Click In The Local Demo

- `${APP_BASE_URL}`
- `${APP_BASE_URL}/p/example-protocol`
- `${APP_BASE_URL}/c/example-protocol-will-ship-v2-next-week`
- `${APP_BASE_URL}/admin/review`
- `${APP_BASE_URL}/a/X/examplefounder`
- `${APP_BASE_URL}/due`
- `${APP_BASE_URL}/api/hud/project/example-protocol`

## Why MCP Matters

MCP proves that CLOCKED is HeyAnon-native in spirit, not just web-native. The same public record shown to a human in the browser is available to agents through public-safe tools such as `clocked.search_claims`, `clocked.get_claim`, and `clocked.get_project_record`.

## Why HUD Export Matters

HUD export shows how CLOCKED can provide compact, public-safe project context to future HeyAnon or HUD consumers without leaking private moderation data or reducing the record to a simplistic score.

## Safety Posture

- human review by default
- no automatic accusations
- neutral, evidence-based language
- no X posting by default
- no live HeyAnon or Gemma calls by default
- no trust score, leaderboard, or liar score

## Current Limitations

- live HeyAnon and Gemma integrations are mocked
- X write flow is disabled
- admin protection is intentionally simple
- local demo requires Postgres and env configuration

## Next Steps Before Live Launch

- confirm HeyAnon and Gemma endpoint contracts
- harden remote MCP hosting and auth
- complete operational review workflow for public replies
- add production-grade secrets, monitoring, and rate limiting
