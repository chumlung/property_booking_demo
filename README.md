# Property booking demo

## Notice

This project serves as a technical showcase. While the source code may be publicly hosted for peer review and recruitment evaluation, all rights are reserved unless a separate license is provided.

---

Monorepo showcase: **Next.js** front end + **NestJS** microservices (auth, property, booking, payment) backed by one **PostgreSQL** database with **separate schema ownership per service** and **PgBouncer** connection pooling.

## Layout

- [`apps/web`](apps/web) — Next.js (deploy to **Vercel**, root directory `apps/web`)
- [`services/auth`](services/auth), [`services/property`](services/property), [`services/booking`](services/booking), [`services/payment`](services/payment) — NestJS APIs using **Prisma**
- [`packages/shared`](packages/shared) — shared API contracts/types
- [`infra/docker`](infra/docker) — local Postgres + API containers
- [`.github/workflows`](.github/workflows) — CI and Docker image publish workflow

## Prerequisites

- Node 20+
- [pnpm](https://pnpm.io) 9 (`corepack enable` then `corepack prepare pnpm@9.15.0 --activate`)
- Docker (for local backend stack)

## Local development

1. Start Postgres + PgBouncer + all four API services in Docker:

   ```bash
   pnpm dev:infra
   ```

   Each container runs `prisma migrate deploy` and `prisma db seed` before booting the API process.
   API services connect through PgBouncer (`localhost:6432` on host).

2. Run the Next.js app on host (separate terminal):

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Optional host-only service runtime

If you run services on host instead of Docker, apply DB changes first:

```bash
pnpm db:setup
pnpm dev:services-local
```

## Database strategy

- Single PostgreSQL instance behind PgBouncer (transaction pooling).
- Service-owned schemas: `auth`, `property`, `booking`, `payment`.
- Each service has its own:
  - `prisma/schema.prisma`
  - `prisma/migrations/*`
  - `prisma/seed.mjs`

This keeps migration and seed ownership aligned to service boundaries.

## Health endpoints

Each service exposes:

- `GET /health` and `GET /health/live` — liveness (process is serving HTTP)
- `GET /health/ready` — readiness (includes DB ping via Prisma)

## Environment variables

### Web (`apps/web`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_AUTH_URL` | Auth service base URL |
| `NEXT_PUBLIC_API_PROPERTY_URL` | Property service base URL |
| `NEXT_PUBLIC_API_BOOKING_URL` | Booking service base URL |
| `NEXT_PUBLIC_API_PAYMENT_URL` | Payment service base URL |

### Each service

See each service’s `.env.example` for required variables (`PORT`, `DATABASE_URL`, `CORS_ORIGIN`, `NODE_ENV`).
For local/dev, `DATABASE_URL` should target PgBouncer (`localhost:6432`) with conservative limits, for example:
`?pgbouncer=true&connection_limit=5&pool_timeout=20`.

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` / `pnpm dev:web` | Next.js dev server |
| `pnpm dev:infra` | Docker Compose (Postgres + PgBouncer + four services) |
| `pnpm dev:services-local` | Run all Nest services with watch mode on host |
| `pnpm db:migrate` | Apply Prisma migrations for all services |
| `pnpm db:seed` | Seed demo data for all services |
| `pnpm db:setup` | Run migrate + seed in order |
| `pnpm lint` / `pnpm test` / `pnpm build` | Repo-wide quality + build |

## Docker images

Build from repo root (example: auth):

```bash
docker build -f services/auth/Dockerfile -t pb-auth:local .
```

GitHub Actions can publish images to GHCR on `main` and tags.
