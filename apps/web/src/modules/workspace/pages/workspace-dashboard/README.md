# Workspace dashboard page

Route: `/workspace/:workspaceId`. Requires authenticated membership. Ticket controls are rendered only for an `ADMIN` workspace role; future API endpoints must enforce the same policy and return `403` when it is not met.
