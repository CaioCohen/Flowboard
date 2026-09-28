# Frontend Spec — Register Page

## Route and access

- Route: `/register`.
- Public-only route. An authenticated visitor is redirected to `/workspaces`.
- Renders in `AuthLayout`, without the authenticated navbar.

## Purpose and responsibilities

Collect a new user's identity and password, provide immediate validation feedback, and handle the automatic authenticated session returned after successful registration.

## UX and content

- Show fields for first name, last name, email, password, and password confirmation, each with an associated label.
- Show a primary **Create account** action and a link to `/login`.
- Explain password requirements once the project defines its minimum policy; do not invent a policy in the UI before that decision exists.
- Never prefill, echo, or persist passwords outside the live form submission.

## States

| State | Expected UI |
| --- | --- |
| Initial | Empty, enabled registration form. |
| Client validation error | Required-field, email-format, password-policy, and matching-confirmation messages are associated with their inputs. |
| Submitting | Disable repeated submission and signal progress without discarding entered values. |
| Email conflict (`409`) | Preserve non-password identity fields and show `Email is already in use.` near the email field or form summary. Clear password fields as a safe default. |
| Invalid request (`400`) | Map safe field validation messages when available; otherwise show a general error. |
| Unexpected/network error | Preserve retryable non-sensitive data and show a generic retry message. |
| Success | Save returned JWT as `sessionStorage["token"]`, set authenticated identity, and navigate to `/workspaces`. |

## User actions

- Complete and submit the registration form.
- Move between fields with keyboard navigation and correct invalid inputs.
- Navigate to login instead of registering.

## API and data needs

- `POST /auth/register` with `{ firstName, lastName, email, password, passwordConfirmation }`.
- Success must return the JWT plus enough user information to initialize the authenticated application state.
- Backend remains authoritative for email normalization, uniqueness, and password policy.

## Authentication and authorization

- Registration is public; after success the page applies the same session and `401` cleanup behavior as login.
- The browser must not write raw passwords to storage or logs.
- Client validation is UX support only and must not be treated as security enforcement.

## Acceptance criteria

- Every required field, invalid email, mismatched confirmation, and defined password-policy violation is indicated before or on submission.
- A successful registration logs the user in automatically and redirects to `/workspaces`.
- A duplicate email displays the specified conflict message without exposing sensitive details.
- The page is usable by keyboard and presents errors accessibly.

