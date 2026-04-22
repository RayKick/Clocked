# Launchpad Manifest

Example CLOCKED manifest:

```json
{
  "name": "CLOCKED",
  "description": "Dry-run public receipts agent for crypto promises, deadlines, evidence, and delivery records.",
  "category": "Public receipts / accountability / research infrastructure",
  "surfaces": ["web app", "admin review", "public claim pages", "MCP server", "HUD export", "future X trigger flow"],
  "tools": ["clocked.search_claims", "clocked.get_claim", "clocked.get_project_record", "clocked.get_actor_record", "clocked.get_due_claims", "clocked.extract_claim_from_text", "clocked.create_claim_draft", "clocked.submit_evidence"],
  "dataSources": ["CLOCKED database", "public X API wrappers", "mocked HeyAnon adapters", "mocked Gemma enrichment"],
  "safetyPolicy": {
    "dryRun": true,
    "humanReviewDefault": true,
    "noLiveWritesByDefault": true,
    "neutralCopy": true,
    "noTrustOrLiarScore": true
  }
}
```

## Dry-Run Readiness

- safe defaults stay enabled
- public copy stays neutral and factual
- no liar score or trust score
- no live X posting
- no live HeyAnon or Gemma calls
- no token utility or on-chain execution in MVP

## Future Launchpad Requirements

- confirmed Launchpad manifest contract
- confirmed import or publish workflow
- confirmed auth and hosting requirements
- production credential management
