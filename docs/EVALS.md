# Evals

The MVP includes JSONL fixture sets for extraction, status evaluation, and claim stitching.

## Fixture Files

- `packages/ai/evals/claim-extraction.fixtures.jsonl`
- `packages/ai/evals/status-evaluation.fixtures.jsonl`
- `packages/ai/evals/claim-stitching.fixtures.jsonl`

## Commands

- `pnpm eval:claims`
- `pnpm eval:status`

These commands run against the mock AI client by default, which keeps local checks deterministic and credential-free.

