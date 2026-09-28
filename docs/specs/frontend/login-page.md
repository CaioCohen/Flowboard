# Frontend Spec — Login Page

## Route and access

- Route: `/login`.
- Public-only route. An already authenticated user is redirected to `/workspaces`.
- Renders inside `AuthLayout`, without the authenticated navbar.

## Purpose and responsibilities

Authenticate an existing Flowboard user without revealing whether an email address is registered. On success, establish the client authentication session and continue to the workspace list.

## UX and content

- Show the Flowboard brand/placeholder, the page title, email and password fields, and a primary **Log in** action.
- Provide a visible link to `/register` for people without an account.
- Use the project palette with accessible text, focus, error, and disabled-state contrast.
- Inputs have persistent labels; password input masks its value and supports normal browser password-manager behavior.

## States

| State | Expected UI |
| --- | --- |
| Initial | Empty, enabled form and link to registration. |
| Client validation error | Field-level messages; request is not sent until required fields and email format are valid. |
| Submitting | Disable duplicate submission, retain entered email, and show progress on the primary action. |
| Invalid credentials (`401`) | Show the generic API message, `Email or password is incorrect.`, without identifying the failing field or exposing email existence. |
| Unexpected/network error | Preserve the form and show a non-sensitive retryable error. |
| Success | Store the returned JWT under `sessionStorage["token"]`, establish authenticated user state, then navigate to `/workspaces`. |

## User actions

- Enter email and password; submit by button or Enter.
- Navigate to registration.
- Correct validation errors and retry after an unsuccessful request.

## API and data needs

- `POST /auth/login` with `{ email, password }`.
- Success response must supply a JWT and the authenticated user data needed by the app shell (at least identity/display-name fields).
- The authenticated API client sends `Authorization: Bearer <token>` for subsequent protected requests.

## Authentication and authorization

- No token, password, or full API error payload may be rendered in logs or diagnostic UI.
- A shared API unauthorized handler must remove the token, clear authentication state, and route to `/login` on any later `401`.
- Authorization remains server-enforced; this page only manages client session state.

## Acceptance criteria

- Valid credentials create a session and redirect to `/workspaces`.
- Required fields and malformed email are prevented locally with accessible errors.
- Invalid email and invalid password produce the same generic failure presentation.
- Duplicate submission is prevented while the request is pending.
- The JWT is stored only in `sessionStorage` using the `token` key.

