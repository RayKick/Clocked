# HUD Export

CLOCKED provides a compact project-context export intended for future HeyAnon HUD surfaces.

## Public-Safe Shape

```json
{
  "projectSlug": "example-protocol",
  "projectName": "Example Protocol",
  "openClaims": 1,
  "dueSoonClaims": 1,
  "deliveredCount": 1,
  "slippedCount": 0,
  "reframedCount": 0,
  "latestClaim": {
    "slug": "example-protocol-example-protocol-will-ship-v2-next-week",
    "status": "OPEN",
    "claim": "Example Protocol will ship V2 next week."
  },
  "latestStatusChange": {
    "toStatus": "OPEN",
    "at": "2026-04-22T12:40:19.273Z"
  },
  "publicRecordUrl": "http://localhost:3002/p/example-protocol",
  "recordCopy": "1 open claim, 1 delivered claim, and 0 slipped claims in the public record.",
  "riskCopy": "1 open claim, 1 delivered claim, and 0 slipped claims in the public record."
}
```

`riskCopy` remains for backward compatibility. `recordCopy` is the preferred neutral field.

## Expanded Mode

- Requires `HUD_EXPORT_SECRET` via `x-hud-secret`.
- Returns the safe payload plus expanded project record data.

## What Not To Include

- API keys
- admin passwords
- private moderation notes
- numerical trust scores
- liar scores
- defamatory language
