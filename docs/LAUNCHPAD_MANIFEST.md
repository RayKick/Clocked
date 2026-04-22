# Launchpad Manifest

Example CLOCKED manifest:

```json
{
  "name": "CLOCKED",
  "description": "HeyAnon-native public receipts agent for crypto promises, deadlines, evidence, and delivery records.",
  "category": "Public receipts / accountability / research infrastructure",
  "surfaces": ["X bot", "web app", "MCP server", "HeyAnon agent", "HUD export"],
  "tools": ["clocked.search_claims", "clocked.get_claim", "clocked.get_project_record"],
  "dataSources": ["CLOCKED database", "public X API wrappers", "optional HeyAnon/Gemma mocks"],
  "safetyPolicy": {
    "dryRun": true,
    "humanReviewDefault": true,
    "noLiveWritesByDefault": true
  }
}
```

## Dry-Run Readiness

- safe defaults stay enabled
- public copy stays neutral and factual
- no liar score or trust score
- no live X posting
- no live HeyAnon or Gemma calls

## Future Launchpad Requirements

- confirmed Launchpad manifest contract
- confirmed import or publish workflow
- confirmed auth and hosting requirements
- production credential management
