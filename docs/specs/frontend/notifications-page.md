# Frontend Spec — Notifications Page

## Route and access

- Route: `/notifications`.
- Private route inside `AppLayout` and its shared navbar.

## Purpose and responsibilities

Show notifications owned by the authenticated user, distinguish unread items, provide event context, and allow each notification to be marked read.

## UX and content

- Display notification title, message, created date/time, read/unread state, and workspace context when available.
- Unread items have a non-color-only visual distinction; read status is conveyed in text/semantics as well as styling.
- The navbar notification button links here and shows a visual unread indicator when one or more notifications are unread.
- Support loading, empty, and retryable error states.

## States

| State | Expected UI |
| --- | --- |
| Loading | A progress indicator or content placeholders. |
| Empty | Explain that there are no notifications. |
| Loaded | Ordered notification list with read status and contextual event information. |
| Marking read | Prevent duplicate action for that item while its update is pending. |
| Mark-read failure | Preserve the existing status and show a retryable error. |
| Unauthorized (`401`) | Clear session and redirect to `/login`. |

## User actions

- Review workspace-added, workspace-removed, and role-changed notifications.
- Mark an unread notification as read using an explicit control or a clearly documented read interaction.
- Retry after a fetch or mutation failure.

## API and data needs

- `GET /notifications` returning current-user notifications with `id`, `type`, `title`, `message`, `isRead`, `createdAt`, optional `workspaceId`, and relevant display context.
- `PATCH /notifications/:id/read` to mark one notification read.
- The page and navbar share query-cached notification data; after a successful read mutation, invalidate/update both the list and unread-indicator state.

## Authentication and authorization

- Requests require the bearer token.
- The API must only return and mutate notifications belonging to the current user; the UI must surface `403`/`404` safely if a stale or invalid resource is attempted.
- Do not derive notification ownership from route state or client storage.

## Acceptance criteria

- The page shows the current user's notifications with title, message, date, context, and read state.
- An unread item can be marked read and the navbar indicator updates accordingly.
- No notifications causes a purposeful empty state rather than a blank page.
- Errors do not expose API internals and do not falsely mark a notification read.

