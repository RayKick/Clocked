# Deployment Checklist

This is a deployment checklist for staging and production readiness, not a vendor-specific deployment guide.

## Required Services

- Node runtime
- Postgres
- web app host
- MCP server host

## Required Environment Variables

- `DATABASE_URL`
- `APP_BASE_URL`
- `CLOCKED_MCP_BASE_URL`
- `SAFE_DRY_RUN`
- `ADMIN_PASSWORD`
- `X_POSTING_ENABLED=false` by default
- `HEYANON_ENABLE_LIVE_CALLS=false` by default

## Staging Checklist

- set `ADMIN_PASSWORD`
- run migrations
- seed demo data if desired
- verify admin protection
- verify public pages
- verify MCP
- verify HUD
- verify no X posting
- verify no live HeyAnon or Gemma calls

## Production Checklist

- use a secrets manager
- configure DB backups
- protect admin routes
- add MCP rate limiting
- add observability and logging
- configure domain and SSL
- add error monitoring
- add integration credentials only after review

## Rollback Checklist

- keep the previous app build available
- keep schema backups before risky DB changes
- disable new integrations before rollback if needed
- verify public pages and MCP after rollback
- verify dry-run and admin safety flags after rollback
