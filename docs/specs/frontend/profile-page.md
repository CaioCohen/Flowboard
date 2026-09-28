# Frontend Spec — Profile Page

## Route and access

- Route: `/profile`.
- Private route inside `AppLayout`; opened from the authenticated navbar user menu.

## Purpose and responsibilities

Provide the authenticated user's profile surface. The base specification only defines navigation to this page, so this document limits the MVP to a safe identity view and explicitly avoids inventing profile-editing requirements.

## UX and content

- Display the user's first name, last name, email, and initials/avatar fallback using authenticated user data.
- Include the standard navbar, including notifications and user-menu logout behavior.
- Label the page clearly and provide loading, retryable error, and unavailable-data handling.
- Do not expose password hashes, JWT data, workspace-role data, or other sensitive/session information.

## States

| State | Expected UI |
| --- | --- |
| Loading profile | Identity placeholders or a compact loading indicator. |
| Loaded | Read-only profile identity information. |
| Fetch failure | Generic retryable error without exposing response internals. |
| Unauthorized (`401`) | Clear session and navigate to `/login`. |

## User actions

- Navigate here from the user menu.
- Review current identity information.
- Use the shared user-menu **Log out** action, which clears `sessionStorage["token"]`, resets local auth state, and redirects to `/login`.

## API and data needs

- `GET /users/me` for authoritative current-user identity when it is not already fresh in the authenticated query cache.
- Shared navbar needs the same identity display fields and unread-notification summary/query state.
- No profile-update endpoint or editing control is specified for the MVP.

## Authentication and authorization

- This route requires a valid session and bearer token.
- Data displayed belongs only to the resolved authenticated identity; the route accepts no user ID parameter.
- The browser must not treat decoded JWT claims as the authoritative long-lived profile source when `/users/me` is available.

## Acceptance criteria

- The authenticated user can reach `/profile` from the navbar and see their own safe identity fields.
- A missing/expired session redirects to login through the shared unauthorized flow.
- Logout from the shared menu clears the client session and cannot leave protected profile data visible.
- Profile editing is not presented as implemented until separately specified.

