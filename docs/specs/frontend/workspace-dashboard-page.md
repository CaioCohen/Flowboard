# Frontend Spec — Workspace Dashboard Page

## Route and access

- Route: `/workspace/:workspaceId`.
- Private route inside `AppLayout`.
- `workspaceId` is a route parameter validated by the backend; a successful view requires current membership in that workspace.

## Purpose and responsibilities

Provide the main workspace work-management surface: load the accessible workspace, display its tickets, and support authorized ticket creation and management without making the frontend the authority for permissions.

## UX and content

- Show workspace identity, a ticket collection, and a visible **Create Ticket** action for users permitted by the product policy.
- Each ticket representation includes title, status, optional description, priority, assignee, creator/context, and last-updated information when supplied.
- Initial status choices are `BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, and `DONE`; priority choices are `LOW`, `MEDIUM`, `HIGH`, and `URGENT`.
- Ticket creation and edit can be dialogs or route-local panels; maintain focus management and confirmation before ticket deletion.
- Do not present future MVP-excluded features (comments, labels, attachments, subtasks, custom statuses, search, filters, or Kanban) as available.

## States

| State | Expected UI |
| --- | --- |
| Loading | Workspace header and ticket-list placeholders. |
| Empty tickets | Explain that no tickets exist and prioritize ticket creation where allowed. |
| Loaded | Ticket collection with safe, clear status and priority labels. |
| Create/edit dialog | Validate required title and status; description, priority, and assignee are optional. |
| Saving | Disable duplicate mutation and retain draft data until a response arrives. |
| Forbidden (`403`) | Do not expose workspace contents; display access-denied feedback and offer navigation back to `/workspaces`. |
| Not found (`404`) | Display a safe missing-workspace state and offer navigation back to `/workspaces`. |
| Mutation conflict/error | Keep the user context, show the safe message, and refresh affected server state after success. |

## User actions

- View accessible workspace tickets.
- Create a ticket with title and status, plus optional description, priority, and assignee.
- View and edit a ticket; change status, priority, and assignee when permitted.
- Delete a ticket only where the backend policy authorizes it and after confirmation.
- Return to the workspace list after a missing or inaccessible workspace outcome.

## API and data needs

- `GET /workspaces/:id` for workspace metadata and membership-aware access.
- `GET /workspaces/:id/tickets` for the ticket collection.
- `POST /workspaces/:id/tickets` for creation.
- `GET /tickets/:id`, `PATCH /tickets/:id`, and `DELETE /tickets/:id` for ticket detail and management.
- Ticket payloads need `id`, `workspaceId`, `title`, optional `description`, `status`, optional `priority`, optional `assigneeId`, `createdById`, `createdAt`, and `updatedAt`; display-ready assignee/creator names require either included user summaries or a documented lookup contract.
- Server data remains in feature query/cache hooks. Dialog state and unsaved drafts are local UI state, not a copy of ticket server data.

## Authentication and authorization

- Send a bearer token on every request; a `401` clears the session and redirects to `/login`.
- Backend membership validation is required before data is returned; the frontend must handle `403` even if navigation originated from a visible workspace card.
- The current spec grants both roles workspace access and states that admins create/manage tickets. Exact employee ticket-mutation policy is not fully defined; UI capabilities must follow the backend contract once it is specified, while the backend remains authoritative.

## Acceptance criteria

- A workspace member can load only data for that workspace; a non-member is denied without ticket leakage.
- The dashboard supports creation and update of the defined ticket fields and refreshes the ticket collection after successful mutations.
- Required ticket title and status are validated before submission, with backend validation errors represented safely.
- Status and priority values are restricted to the specified initial enums.
- Ticket deletion requires explicit user confirmation and successful server authorization before local removal.

