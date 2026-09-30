## AI Task History

### Date

2026-09-30 09:46 (America/Sao_Paulo)

### Request

Diagnose why the configured Grafana MCP server returned an unauthorized response while listing dashboards.

### Understanding

The Grafana MCP server was already configured with Docker and environment variables. The task was to identify the authentication configuration problem without exposing the service-account token.

### Actions performed

- Inspected the supplied MCP server configuration screenshots.
- Queried the Grafana MCP server and observed a `401 Unauthorized` response from Grafana's dashboard search endpoint.
- Consulted the official Grafana MCP documentation and compared its required environment-variable names with the configured names.
- Identified that the configuration used `GRAFANA_SERVICE_TOKEN` instead of the required `GRAFANA_SERVICE_ACCOUNT_TOKEN`.

### Files affected

- `docs/ai-history/2026-09-30-0946-diagnose-grafana-mcp-authentication.md` — recorded this diagnostic task.

### Technical decisions

- Recommended renaming the environment variable and the matching Docker `-e` argument rather than replacing the token, because the current variable name prevents the MCP server from using the existing credential.
- Kept token values out of all logs and documentation.

### AI-generated or AI-assisted work

- AI performed the MCP authentication diagnostic and produced the configuration correction.

### Human review and adjustments

The user clarified that the Grafana URL and token had already been configured, which corrected the initial assumption that the variables were absent.

### Validation performed

- Grafana MCP `search_dashboards` call returned `401 Unauthorized` before the configuration correction.
- Official Grafana MCP documentation confirms that `GRAFANA_SERVICE_ACCOUNT_TOKEN` is the expected variable name.
- No configuration was changed by the AI and the corrected setup was not yet retested.

### Result

The likely cause of the unauthorized request was identified: the service-account token was configured under the wrong environment-variable name.

### Pending work

- Rename the variable and matching Docker argument, restart the MCP server, and retry dashboard listing.
