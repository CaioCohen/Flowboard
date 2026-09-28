# Frontend Spec — My Workspaces Page

## Route and access

- Route: `/workspaces`.
- Private route, rendered inside `AppLayout` with the shared navbar.
- Any unauthenticated or expired session follows the global `401` logout-and-redirect behavior.

## Purpose and responsibilities

Present every workspace to which the current user belongs and offer workspace creation, navigation, authorized administration, and voluntary departure.

## UX and content

- Page heading: **My Workspaces**.
- A clear **Create Workspace** action opens a creation dialog or equivalent focused form.
- Render one workspace card per membership with workspace name, the current user's role, an entry action, and **Leave**.
- Render **Edit** only when the current membership role is `ADMIN`.
- Use distinct empty, loading, and error presentations; an empty user should be guided to create their first workspace.

## States

| State | Expected UI |
| --- | --- |
| Loading | Skeletons or loading indicator for cards while memberships load. |
| Empty | Explain that the user has no workspaces and prioritize **Create Workspace**. |
| Loaded | Cards show name, role, entry action, and role-appropriate controls. |
| Create dialog | Require a workspace name; disable duplicate submission while creating. |
| Edit dialog | See the administrative interaction section below; only available to an ADMIN. |
| Leave confirmation | Ask `Are you sure you want to leave this workspace?` before mutation. |
| Mutation error | Keep the dialog open, show the safe API message, and refresh only after success. |

## User actions

- Open a workspace dashboard from its card.
- Create a workspace; the creator becomes its `ADMIN`.
- As an ADMIN, open **Edit** to rename the workspace and manage members.
- Leave a workspace after confirming the warning.

## Administrative interaction within this page

The Edit modal is part of this page's workflow and must support:

- Renaming the workspace.
- Listing current members with name/email as supplied by the API and their role.
- Adding an existing Flowboard user by email with an `ADMIN` or `EMPLOYEE` role.
- Changing a member's role.
- Removing a member after an explicit confirmation appropriate to the destructive action.
- Hiding or disabling invalid last-admin actions only as guidance; always present backend `409` feedback if the server rejects a stale or direct action.

## API and data needs

- `GET /workspaces` for cards and current user's membership role.
- `POST /workspaces` for creation.
- `PATCH /workspaces/:id` for renaming.
- `POST /workspaces/:id/members` to add by email and role.
- `PATCH /workspaces/:id/members/:userId` to change role.
- `DELETE /workspaces/:id/members/:userId` to remove a member.
- `POST /workspaces/:id/leave` for the current user.
- Mutation success invalidates/refetches affected workspace list and detail data; workspace entities remain server state in the query/cache layer.

## Authentication and authorization

- The route requires a valid JWT and all API calls carry the bearer token.
- Role-driven visibility is a usability aid only. Member management and workspace edits require backend `ADMIN` authorization.
- On `403`, show an authorization error and refresh/redirect as appropriate; do not assume hidden controls establish permission.
- On a last-admin `409`, preserve access and show the message that at least one administrator is required.

## Acceptance criteria

- The page lists all and only the current user's workspaces with the correct role.
- The creator of a new workspace sees it as `ADMIN` after successful creation.
- Employees cannot see the Edit action; admins can complete rename and member-management workflows.
- Duplicate membership, unknown user, invalid role, and last-admin business-rule failures are communicated without corrupting local state.
- Leaving removes the workspace from the current user's list only after successful API confirmation.

