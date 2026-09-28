# Authentication Smoke-Test Failure: Cause and Solution Plan

## Observed failure

On 2026-09-28, a local registration smoke test sent a valid, test-only registration request to `POST /auth/register`. The API returned HTTP `404 Not Found`, so no account was created and the subsequent login test could not be performed.

Browser/Playwright automation could not be started in this session: the requested `.agents/commands/cmdPlaywrightTesting.md` file is absent, and no browser automation provider is available. This is a test-environment limitation, separate from the application failure.

## Root cause

The running API only imports `RuntimeConfigModule` and `HealthModule` in `apps/api/src/app.module.ts`. There is no authentication module, controller, or route handling `/auth/register` or `/auth/login` in `apps/api/src`.

The frontend implementation correctly calls those endpoints from `apps/web/src/modules/auth/services/auth-api.ts`, but the required backend contract does not yet exist. Consequently, registration and login cannot succeed in any frontend client.

## Impact

- New users cannot register.
- Existing users cannot log in.
- The frontend cannot establish the JWT session required by protected routes.
- Browser-level authentication acceptance testing remains blocked.

## Solution plan

1. Implement an `AuthModule` in the API with `POST /auth/register` and `POST /auth/login` endpoints.
2. Add DTO validation for the frontend contract: first name, last name, email, password, and password confirmation for registration; email and password for login.
3. Add user persistence through Prisma, including password hashing, normalized unique email handling, and a safe `409` conflict response.
4. Issue a signed JWT and return `{ token, user }` with the identity fields consumed by the frontend.
5. Add API tests covering registration success, duplicate email, invalid payload, successful login, and generic invalid-credential handling.
6. Restore or add `.agents/commands/cmdPlaywrightTesting.md` and configure a Playwright/browser provider for the development environment.
7. Re-run the browser flow: register a unique test account, assert redirect to `/workspaces`, log out, log in with the same account, and assert the same authenticated destination.

## Verification criteria after the fix

- `POST /auth/register` returns HTTP `201` (or the documented success status) with a JWT and safe user identity.
- `POST /auth/login` returns an equivalent session for the newly created account.
- Invalid credentials return the same generic message for unknown email and incorrect password.
- The Playwright flow verifies registration, logout, and login end to end without exposing the test password or JWT in test output.

## Resolution status

Resolved on 2026-09-28. An `AuthModule` now provides the registration and login endpoints, backed by the existing PostgreSQL user table. A local API smoke flow successfully registered a generated test-only account and logged in with it. Browser/Playwright automation remains an environment follow-up because the requested command file and browser provider are still unavailable.
