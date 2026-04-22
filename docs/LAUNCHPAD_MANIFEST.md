# Launchpad Manifest

Example CLOCKED manifest:

```json
{
  "name": "CLOCKED",
  "description": "HeyAnon-native public receipts agent for crypto promises, deadlines, evidence, and delivery records.",
  "category": "Public receipts / accountability / research infrastructure",
  "surfaces": ["X bot", "web app", "MCP server", "HeyAnon agent", "HUD export"],
  "dryRunStatus": true
}
```

## Tools

- Search claims
- Get claim
- Get project record
- Get actor record
- Get due claims
- Extract claim from text
- Create claim draft
- Evaluate claim status
- Submit evidence
- Weekly digest

## Data Sources

- CLOCKED database
- Public X data through official API wrappers
- Optional HeyAnon and Gemma enrichment
- Official GitHub and GitBook public sources where configured

## Safety Policy

- Neutral, factual copy only
- No liar score
- Human review by default
- No live external writes without explicit env enablement

## Readiness Checklist

- Confirm real HeyAnon endpoints
- Confirm Launchpad packaging requirements
- Confirm remote MCP auth expectations
- Confirm HUD registration and refresh semantics

