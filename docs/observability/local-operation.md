# Local observability and operation

The API writes one JSON object per completed request. It includes `level`,
`requestId`, `method`, `path`, `statusCode`, and `durationMs`. Supply an
`X-Request-Id` header to correlate a request with its log entry; otherwise the
API generates one and returns it in the response header.

`GET /health` is the local health interface. It returns `200` with
`{ "status": "ok" }` when the process and database are available. A database
outage returns a generic unhealthy response and a safe log message; connection
strings, credentials, SQL, tokens, password material, and environment values
are never logged.

## Diagnose locally

1. Check database readiness with `pnpm db:status`.
2. Start the API with `pnpm dev:api` and query `http://localhost:3000/health`.
3. Use the returned `X-Request-Id` to find the corresponding JSON log line.
4. If the database is unavailable, inspect `pnpm db:logs`; do not copy a
   connection string or `.env` contents into an issue.

The project currently has no remote log collector, metrics platform, alerting,
readiness endpoint, or external backup policy. Those decisions are required
before an exposed deployment.
