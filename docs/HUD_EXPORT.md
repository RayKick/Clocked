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
    "slug": "example-protocol-example-protocol-will-publish-the-public-beta",
    "status": "DELIVERED",
    "claim": "Example Protocol will publish the public beta by April 20."
  },
  "latestStatusChange": {
    "toStatus": "DELIVERED",
    "at": "2026-04-22T10:00:00.000Z"
  },
  "publicRecordUrl": "http://localhost:3000/p/example-protocol",
  "riskCopy": "Public record shows current and delivered commitments."
}
```

## Expanded Mode

- Requires `HUD_EXPORT_SECRET` via `x-hud-secret`.
- Returns the safe payload plus expanded project record data.

## What Not To Include

- API keys
- Admin passwords
- Private moderation notes
- Numerical trust scores
- Defamatory language
