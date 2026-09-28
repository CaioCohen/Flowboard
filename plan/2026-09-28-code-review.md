# Flowboard code review

Review date: 2026-09-28 16:59 (America/Sao_Paulo)  
Scope: React/Vite frontend, NestJS API, Prisma schema, test configuration, and project architecture. No product source code was changed.

Status reassessed: 2026-09-28 17:20 (America/Sao_Paulo). Each finding is tagged **Done** or **To be done** against the current working tree. A done tag means the finding's primary corrective action is present; any remaining related hardening is stated in its note.

## Summary

The repository has a sound initial monorepo split and its lint, type-check, unit-test, schema-validation, and production-build checks currently pass. The main risks are concentrated in authentication hardening, the missing HTTP/E2E test layer, and server-state/authorization design that needs to be established before the workspace and ticket APIs grow.

## Findings

### High

1. **[To be done] Login and registration have no brute-force or abuse protection.** `apps/api/src/auth/auth.controller.ts:10` exposes the authentication endpoints, while `apps/api/src/main.ts:15` configures no throttling mechanism. Unbounded login attempts enable credential stuffing and repeated `scrypt` work enables CPU exhaustion. Add a distributed rate limiter with per-IP and per-account limits, and test `429` responses. `@nestjs/throttler` is installed but is not registered or applied.

2. **[Done] JWTs are issued but no verification or authorization boundary exists.** The current tree registers `JwtAuthGuard` as an `APP_GUARD`, uses `@Public()` for the auth and health controllers, verifies bearer tokens with `@nestjs/jwt`, and loads the current user through `UserRepository`. Unit tests cover valid and missing bearer tokens. Protected-route HTTP/E2E coverage remains to be added under finding 11.

3. **[Done] JWT secret strength and expiration are not validated.** Runtime validation now rejects secrets below 32 bytes and malformed or zero durations, and token handling uses `@nestjs/jwt` rather than the handwritten signer. Issuer/audience claims are not configured yet and remain optional hardening work.

### Medium

4. **[To be done] The frontend stores API-owned data in page-local state rather than a query/cache layer.** Examples include `apps/web/src/modules/workspace/pages/workspaces/workspaces.tsx:15`, `apps/web/src/modules/workspace/pages/workspace-dashboard/workspace-dashboard.tsx:14`, `apps/web/src/modules/account/pages/profile/profile-page.tsx:18`, and `apps/web/src/modules/account/pages/notifications/notifications-page.tsx:19`. This duplicates server state and lacks shared caching, cancellation, and invalidation. Introduce feature query/mutation hooks with query-key factories over the shared API client; keep only UI state locally.

5. **[To be done] The client loses identity information on refresh.** `apps/web/src/modules/auth/services/auth-session.ts:22` persists only the token, while the user remains module memory at line 24; `apps/web/src/routes/app-routes.tsx:15` renders the layout from that transient identity. The profile page independently fetches its data, but the application layout still does not rehydrate identity at bootstrap. Rehydrate a safe identity through a `/users/me` query or have the layout consume an account query.

6. **[Done] Ticket-management controls are hard-coded as permitted.** `WorkspaceDashboardPage` now derives `canManageTickets` from the loaded workspace membership (`role === "ADMIN"`) rather than defaulting it to `true`. Backend ticket authorization and an explicit frontend `403` state still need to accompany the future ticket API.

7. **[Done] The member-management dialog becomes stale after an addition.** The addition response is now appended to the dialog's `members` state before the parent workspace list is refreshed.

8. **[To be done] The custom router navigates while rendering.** `apps/web/src/routes/app-routes.tsx:52` and `:57` still call `navigate()` during render. React rendering is no longer pure, and Strict Mode can create duplicate history entries. Use a routing library or an effect/guard with `replaceState`, and define an explicit not-found route.

9. **[To be done] Bearer tokens in `sessionStorage` are vulnerable to exfiltration by successful XSS.** `apps/web/src/modules/auth/services/auth-session.ts:23` still persists the JWT there, and `apps/web/index.html:1` has no content-security policy. No XSS sink was identified in the reviewed source, so this is defense-in-depth rather than a demonstrated exploit. Prefer secure `HttpOnly`/`SameSite` cookie sessions; otherwise deploy a restrictive CSP and continue XSS/dependency audits.

10. **[To be done] Input normalization happens after validation.** `apps/api/src/auth/dto/register.dto.ts:4` still validates non-emptiness before `AuthService` trims input. Whitespace-only names can therefore pass DTO validation and be stored empty. Trim/normalize in DTO transforms before validation and add boundary tests.

11. **[To be done] The advertised API E2E command is broken and no HTTP pipeline tests exist.** `apps/api/package.json:11` still references the absent `./test/jest-e2e.json`. The added guard and JWT unit tests do not cover the Nest HTTP pipeline, global validation, filters, CORS, or route contracts. Add a real E2E config and isolated database/mocked adapter coverage.

12. **[Done] Database cleanup is not tied to process shutdown.** `main.ts` now calls `app.enableShutdownHooks()`, allowing `DatabaseService.onModuleDestroy()` to close the pool on shutdown. Bounded shutdown, connection/query timeouts, and termination integration coverage remain future resilience hardening.

### Low

13. **[To be done] The authentication application service is coupled to a generic raw SQL adapter.** `UserRepository` was added for current-user lookup in the JWT guard, but `AuthService` still injects `DatabaseService` and embeds its registration/login SQL. Introduce an auth-owned user-repository port with a PostgreSQL implementation and mapped persistence rows.

14. **[To be done] Frontend module/page contracts are incomplete.** The `workspace` module and its `pages/workspaces` and `pages/workspace-dashboard` directories still lack the module/page READMEs used by the frontend architecture. Add route, dependency, and permission contracts, especially for the pending ticket policy.

## Recommended order

1. Establish token verification, default-deny authorization, validated runtime security configuration, and login/registration throttling.
2. Restore the E2E test configuration and cover the HTTP pipeline before expanding protected APIs.
3. Decide and document workspace/ticket permissions, then implement backend authorization and frontend capability rendering together.
4. Introduce feature query/mutation hooks and remove page-local server-state copies.
5. Improve shutdown behavior, persistence boundaries, router behavior, and missing frontend documentation.

## Validation evidence

- `pnpm.cmd lint` — passed.
- `pnpm.cmd typecheck` — passed.
- `pnpm.cmd test` — passed: web 22 tests in 9 files; API 9 tests in 4 suites.
- `pnpm.cmd prisma:validate` — passed.
- `pnpm.cmd build` — passed for both web and API.
- `pnpm.cmd --filter @flowboard/api test:e2e` — failed as expected because `apps/api/test/jest-e2e.json` cannot be resolved.
