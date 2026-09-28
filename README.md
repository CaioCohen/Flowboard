# Flowboard

Flowboard is a local-first monorepo for a React/Vite frontend, NestJS API, and
PostgreSQL database. The initial infrastructure is intentionally designed to
run on one development machine; no cloud account or external service is
required.

## Prerequisites

- Node.js 20.19 or newer (Node 22 is supported)
- pnpm 12 (`corepack enable` can install the pinned package-manager version)
- Docker Desktop with Docker Compose v2 on the command path

## First run

1. Copy `.env.example` to `.env`. The supplied values are development-only
   placeholders; replace the JWT value before any shared or exposed use.
2. Install the locked workspace dependencies with `pnpm install --frozen-lockfile`.
3. Start the isolated development and test databases: `pnpm db:up`.
4. Apply the versioned schema to the development database: `pnpm prisma:deploy`.
5. Generate the Prisma client: `pnpm prisma:generate`.
6. In separate terminals, run `pnpm dev:api` and `pnpm dev:web`.

The frontend is served at `http://localhost:5173`; the API uses the configured
`PORT` (default `3000`). Verify the API at `http://localhost:3000/health`.

## Environment contract

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Development PostgreSQL connection URL. |
| `TEST_DATABASE_URL` | Separate PostgreSQL URL for integration tests. |
| `JWT_SECRET` | JWT signing secret; never commit a non-placeholder value. |
| `JWT_EXPIRATION` | JWT lifetime, for example `1h`. |
| `PORT` | API listening port. |
| `FRONTEND_URL` | Allowed local frontend origin for API CORS. |
| `VITE_API_BASE_URL` | Browser-visible base URL for API requests. |

`POSTGRES_*` variables configure Docker Compose. `.env` is ignored by Git;
only `.env.example` is versioned.

## Database commands

- `pnpm db:up` — start development PostgreSQL (5434) and the isolated test
  PostgreSQL instance (55433).
- `pnpm db:status` / `pnpm db:logs` — inspect local database state.
- `pnpm prisma:migrate` — create and apply a development migration after a
  schema change. Do not edit applied migrations.
- `pnpm prisma:deploy` — apply committed migrations to an empty/local database.
- `pnpm prisma:validate` — validate the Prisma schema.

The repository contains an initial migration. A development seed is optional
and has not yet been introduced, so no demo credentials are provided.

## Local quality checks

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm verify` — runs lint, type checks, unit tests, and Prisma validation.

Integration tests must use `TEST_DATABASE_URL`, never the development database.
Playwright E2E infrastructure is deferred until product flows exist; a future
local test command must start the API, frontend, and `postgres-test` without
using an external environment.

## Operations and security

See [local observability guidance](docs/observability/local-operation.md) for
structured logging, request IDs, health checks, and safe local diagnosis.

Docker is used only for local PostgreSQL. Frontend and API containerization,
remote CI/CD, public deployment controls (TLS, rate limiting, backup policy),
and a remote secret manager remain intentionally undecided by the specifications.
