# Environment Variables Guide

This repository uses runtime environment variables on Vercel (frontend) and Render (backend services).  
Never commit real secrets to git. Commit only `.env.example` templates.

## Naming Convention

- `NEXT_PUBLIC_*`: safe to expose to browser bundles (frontend only).
- `WEBHOOK_*`: internal webhook security and delivery settings.
- `DATABASE_URL`: backend-only database connection string.
- `CORS_ORIGIN`: backend allowlist for frontend origin.

## Frontend (Vercel) Variables

Defined in `apps/web/.env.example`.

- `NEXT_PUBLIC_API_AUTH_URL`
- `NEXT_PUBLIC_API_PROPERTY_URL`
- `NEXT_PUBLIC_API_BOOKING_URL`
- `NEXT_PUBLIC_API_PAYMENT_URL`
- `WEBHOOK_STATUS_HMAC_SECRET`
- `WEBHOOK_STATUS_MAX_SKEW_MS` (default `300000` / 5 minutes)
- `WEBHOOK_STATUS_POLL_INTERVAL_MS` (default `30000` / 30 seconds)
- `WEBHOOK_STATUS_POLLER_SECRET`

### Purpose

- `NEXT_PUBLIC_API_*` powers direct service calls from the Next.js server component page.
- `WEBHOOK_STATUS_HMAC_SECRET` verifies signed service-status webhooks.
- `WEBHOOK_STATUS_MAX_SKEW_MS` limits timestamp drift to reduce replay attacks.
- `WEBHOOK_STATUS_POLL_INTERVAL_MS` controls stale-check polling cadence for server-rendered page requests.
- `WEBHOOK_STATUS_POLLER_SECRET` secures the manual/cron-triggered poll endpoint.

## Backend (Render) Variables

Each service has its own `.env.example` under `services/<name>/.env.example`.

Common required variables:

- `PORT`
- `NODE_ENV`
- `DATABASE_URL`
- `CORS_ORIGIN`
- `WEBHOOK_STATUS_URL`
- `WEBHOOK_STATUS_HMAC_SECRET`

### Purpose

- `WEBHOOK_STATUS_URL` points to the Next.js webhook receiver endpoint:
  - `https://<your-vercel-domain>/api/service-status`
- `WEBHOOK_STATUS_HMAC_SECRET` is shared with Vercel and used to sign webhook payloads.

## Webhook Security Model

Each backend service emits a startup status event with:

- `x-webhook-timestamp`: unix epoch milliseconds
- `x-webhook-signature`: `sha256=<hex>`
- body payload: JSON event

Signature formula:

`HMAC_SHA256(secret, "<timestamp>.<rawBody>")`

Next.js verifies:

1. Secret configured
2. Signature validity (constant-time compare)
3. Timestamp freshness (`WEBHOOK_STATUS_MAX_SKEW_MS`)

If verification fails, request is rejected with `401`.

## Lightweight Poller Model

The frontend app includes a lightweight status poller that checks all service `/health` endpoints and writes
results into the same in-memory status store used by webhook events.

- Poller module: `apps/web/src/lib/service-status-poller.ts`
- Protected trigger endpoint: `POST /api/service-status/poll`
- Required header: `x-status-poller-secret`

### Suggested usage

- Keep stale-on-render polling enabled via `WEBHOOK_STATUS_POLL_INTERVAL_MS`.
- Optionally call `/api/service-status/poll` from an external cron/uptime monitor for proactive warming/telemetry.

## Local Development Setup

1. Copy each template:
   - `apps/web/.env.example` -> `apps/web/.env.local`
   - `services/*/.env.example` -> `services/*/.env`
2. Set the same `WEBHOOK_STATUS_HMAC_SECRET` in frontend and all services.
3. Start web and services.

## Deployment Setup Checklist

### Vercel

- Add all variables from `apps/web/.env.example`.
- Use production service URLs for `NEXT_PUBLIC_API_*`.

### Render (each service)

- Add all variables from that service's `.env.example`.
- Set `WEBHOOK_STATUS_URL` to deployed Vercel webhook endpoint.
- Ensure `WEBHOOK_STATUS_HMAC_SECRET` matches Vercel exactly.

## Rotation Guidance

- Rotate `WEBHOOK_STATUS_HMAC_SECRET` periodically.
- During rotation, update Vercel first, then each Render service quickly.
- Redeploy all affected services.
