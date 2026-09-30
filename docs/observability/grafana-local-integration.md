# Local Grafana integration runbook

## Purpose and scope

This runbook adds local metrics monitoring to Flowboard using **Prometheus**
and **Grafana**. Grafana is the dashboard and alerting interface; it does not
collect application metrics by itself. Prometheus will scrape the NestJS API's
`/metrics` endpoint, store the samples locally, and Grafana will query
Prometheus.

The plan is deliberately local-development only. It does not expose Grafana,
Prometheus, or `/metrics` outside the developer machine. Production access
control, alert delivery, retention, and secret management must be designed
separately.

## Current Flowboard baseline

- `docker-compose.yml` currently starts only `postgres` and `postgres-test`.
- The API runs on `http://localhost:3000` by default.
- `GET /health` already checks the process and database and is public.
- Request logs already contain method, path, status code, duration, and a
  request ID, but no Prometheus metrics endpoint exists yet.

## Architecture

```text
NestJS API (host machine :3000)
        |  GET /metrics
        v
Prometheus container (:9090, local only) <----- Grafana container (:3001, local only)
        stores local metrics                         renders dashboards
```

Because the API is initially run on the host with `pnpm dev:api`, the
Prometheus container must use `host.docker.internal:3000` rather than
`localhost:3000`. From inside a container, `localhost` refers to that same
container, not to the Windows host. If the API is later containerized in the
same Compose project, replace that target with the Compose service name (for
example, `api:3000`).

## Step 1 — Check local prerequisites

1. Install Docker Desktop and make sure its engine is running.
2. Confirm Docker Compose is available:

   ```powershell
   docker compose version
   ```

3. Ensure host ports `3000`, `3001`, and `9090` are free. Flowboard already
   uses `3000` for its API, so this runbook uses `3001` for Grafana.
4. Copy `.env.example` to `.env` if local API/database configuration has not
   yet been created. Do not place real Grafana passwords in `.env.example` or
   commit a populated `.env` file.

## Step 2 — Add Prometheus metrics to the API

1. Add the Prometheus client library to the API workspace:

   ```powershell
   pnpm --filter @flowboard/api add prom-client
   ```

2. Create a `MetricsModule` (for example,
   `apps/api/src/metrics/metrics.module.ts`) and register it in
   `apps/api/src/app.module.ts`.
3. In a `MetricsService`, use a dedicated `prom-client.Registry` and call
   `collectDefaultMetrics({ register })` once during application startup. This
   supplies process and Node.js metrics such as CPU, memory, and event-loop
   data.
4. Add only bounded, low-cardinality application metrics. The recommended
   initial set is:

   | Metric | Type | Labels | Meaning |
   | --- | --- | --- | --- |
   | `flowboard_http_requests_total` | Counter | `method`, `route`, `status_code` | Completed HTTP requests |
   | `flowboard_http_request_duration_seconds` | Histogram | `method`, `route`, `status_code` | Request latency |
   | `flowboard_healthcheck_total` | Counter | `status` | Health-check result |

   Use the normalized Nest route template (such as `/workspaces/:id`) rather
   than `request.path`. Never use request IDs, user IDs, emails, ticket IDs,
   full URLs, JWTs, or other unbounded/sensitive values as metric labels.
5. Record the counter and histogram once per completed request in an
   interceptor. Reuse the existing request logging interceptor's completion
   point, but keep metric code in the metrics module so logging remains
   independent from Prometheus.
6. Add a public `GET /metrics` controller that returns
   `registry.metrics()` with the registry content type. Decorate it with the
   existing `@Public()` decorator; otherwise the global JWT guard will reject
   Prometheus scrapes. Do not return application configuration, request data,
   or database details from this endpoint.
7. Add unit tests that verify the endpoint's Prometheus content type and a
   representative metric sample. Test the request interceptor with a route
   template and confirm it does not include raw IDs in its labels.

> Keep `/metrics` reachable only on the local Docker network or a trusted
> monitoring network. In a deployed environment, protect it with network
> policy, a reverse proxy, or authentication appropriate to the deployment.

## Step 3 — Add Prometheus configuration

1. Create `observability/prometheus/prometheus.yml` with this minimal
   configuration:

   ```yaml
   global:
     scrape_interval: 15s
     evaluation_interval: 15s

   scrape_configs:
     - job_name: flowboard-api
       metrics_path: /metrics
       static_configs:
         - targets: [host.docker.internal:3000]
   ```

2. Keep the 15-second interval for local development. Reduce it only when a
   specific debugging need justifies the extra samples.
3. When the API becomes a Compose service, update the target to its service
   DNS name:

   ```yaml
   - targets: [api:3000]
   ```

## Step 4 — Extend Docker Compose

Flowboard uses the reviewed, pinned images shown below. Do not replace them
with an unreviewed `latest` tag; update the pinned versions only after testing
the monitoring stack.

```yaml
  prometheus:
    image: prom/prometheus:v3.5.0
    container_name: flowboard-prometheus
    command:
      - --config.file=/etc/prometheus/prometheus.yml
      - --storage.tsdb.path=/prometheus
    ports:
      - "127.0.0.1:9090:9090"
    volumes:
      - ./observability/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - flowboard-prometheus-data:/prometheus
    restart: unless-stopped

  grafana:
    image: grafana/grafana:12.4.0
    container_name: flowboard-grafana
    environment:
      GF_SECURITY_ADMIN_USER: ${GRAFANA_ADMIN_USER:-admin}
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD:?set-a-local-password-in-.env}
      GF_USERS_ALLOW_SIGN_UP: "false"
    ports:
      - "127.0.0.1:3001:3000"
    volumes:
      - flowboard-grafana-data:/var/lib/grafana
      - ./observability/grafana/provisioning:/etc/grafana/provisioning:ro
      - ./observability/grafana/dashboards:/var/lib/grafana/dashboards:ro
    depends_on:
      - prometheus
    restart: unless-stopped

volumes:
  flowboard-postgres-data:
  flowboard-prometheus-data:
  flowboard-grafana-data:
```

Important details:

- Keep the existing PostgreSQL services and their volume unchanged.
- `127.0.0.1:` binds Prometheus and Grafana to the local machine only. Do not
  change it to `0.0.0.0` for convenience.
- The Grafana data volume preserves users and local state; the Prometheus
  volume preserves collected metrics between container restarts.
- Add `GRAFANA_ADMIN_USER` and `GRAFANA_ADMIN_PASSWORD` to `.env`, but add
  only commented variable names/placeholders to `.env.example`. Use a unique
  local password.

## Step 5 — Provision Grafana as code

Create `observability/grafana/provisioning/datasources/prometheus.yml`:

```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    uid: prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
```

Create `observability/grafana/provisioning/dashboards/dashboards.yml`:

```yaml
apiVersion: 1
providers:
  - name: Flowboard
    orgId: 1
    folder: Flowboard
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /var/lib/grafana/dashboards
```

Commit dashboard JSON files under `observability/grafana/dashboards/`. File
provisioning makes the datasource and dashboard definitions reproducible and
reviewable. Remember that a subsequent file-provisioning update overwrites a
dashboard changed only in the Grafana UI; export intentional UI edits back to
the JSON file before committing.

## Step 6 — Build the first dashboard

Start with one dashboard named **Flowboard API — Local** and four panels:

| Panel | PromQL | Why it matters |
| --- | --- | --- |
| Request rate | `sum(rate(flowboard_http_requests_total[5m]))` | Traffic volume |
| 5xx rate | `sum(rate(flowboard_http_requests_total{status_code=~"5.."}[5m]))` | Server failures |
| p95 latency | `histogram_quantile(0.95, sum by (le) (rate(flowboard_http_request_duration_seconds_bucket[5m])))` | Slow requests |
| Process memory | `process_resident_memory_bytes` | Basic process health |

Use an initial 15-second dashboard refresh. Local monitoring is most useful
when it helps diagnose a test or development flow without creating a large
volume of metrics.

## Step 7 — Run locally

Run the API and monitoring stack in separate terminals:

```powershell
# Terminal 1 — database and monitoring services
docker compose up -d postgres
pnpm monitoring:up

# Terminal 2 — NestJS API
pnpm dev:api
```

Then verify the pipeline in order:

```powershell
# API exposes Prometheus text metrics
Invoke-WebRequest http://localhost:3000/metrics

# Prometheus is running
Invoke-WebRequest http://localhost:9090/-/healthy

# Flowboard target must show State = UP
Start-Process http://localhost:9090/targets

# Sign in using the local credentials stored in .env
Start-Process http://localhost:3001
```

Generate a few API requests, wait one scrape interval, and open the dashboard.
If data is absent, check the Prometheus Targets page first. A target error that
mentions `localhost` usually means the target was configured from the
container's perspective instead of the host's.

To stop the monitoring services while retaining their local data:

```powershell
pnpm monitoring:down
```

To inspect their logs:

```powershell
pnpm monitoring:logs
```

## Step 8 — Validate before merging

1. Run `pnpm lint`, `pnpm typecheck`, and `pnpm test` after the API changes.
2. Run `docker compose config` to validate the Compose structure.
3. Run `docker compose up -d postgres prometheus grafana` and confirm both
   containers report as running with `docker compose ps`.
4. Confirm `http://localhost:9090/targets` shows `flowboard-api` as **UP**.
5. Confirm Grafana's provisioned Prometheus datasource passes its connection
   test and the four dashboard panels return data after test traffic.
6. Verify that metric labels contain route templates only and no user data,
   request IDs, tokens, SQL, passwords, or connection strings.

## Operational notes and next steps

- Keep metrics, logs, and traces separate initially. Existing JSON request
  logs remain useful for request-ID diagnosis; Grafana can be extended later
  with Loki if centralized log search becomes necessary.
- Do not configure alerts that send notifications until the team chooses an
  alert destination and escalation policy. For local development, dashboard
  inspection is sufficient.
- Before any non-local deployment, decide retention, backups for volumes,
  image update policy, TLS/reverse proxy, account administration, RBAC,
  scrape-network access, and alert ownership.

## Official references

- [Grafana: run the Docker image](https://grafana.com/docs/grafana/latest/setup-grafana/installation/docker/)
- [Grafana: provision data sources and dashboards](https://grafana.com/docs/grafana/latest/administration/provisioning/)
- [Grafana: configure the built-in Prometheus data source](https://grafana.com/docs/grafana/latest/datasources/prometheus/configure/)
- [Prometheus: Docker installation, configuration mounts, and persistent storage](https://prometheus.io/docs/prometheus/latest/installation/)
- [Grafana: Prometheus connection troubleshooting](https://grafana.com/docs/grafana/latest/datasources/prometheus/troubleshooting/)

These references were checked on 2026-09-30.
