## AI Task History

### Date

2026-09-28 21:51 (America/Sao_Paulo).

### Request

Implement the backend work identified by the full end-to-end failure report and complete missing functionality described by the backend specifications.

### Understanding

The missing authenticated workspace, membership, ticket, and notification routes had to be implemented and registered in NestJS. The existing authentication and platform code also had to be checked against their specifications. The already-present Prisma schema and initial migration were retained because they already define the required domain models, enums, constraints, and indexes.

### Actions performed

- Added workspace and membership APIs, DTO validation, membership authorization, duplicate-membership protection, and last-administrator protection.
- Added notification listing and owner-only, idempotent read handling.
- Added transactional database execution and used it to make membership add, removal, leave, and effective role-change notifications atomic with their membership mutations.
- Added ticket list, create, read, and update APIs, including workspace-bound assignee validation and server-derived creator IDs.
- Registered workspace, notification, and ticket modules in the application module.
- Replaced scrypt password hashing with bcrypt, added `GET /users/me`, and included the required safe user identity claims in JWTs.
- Documented the intentionally restrictive ticket permission policy in an ADR: workspace members can read; only administrators can create or update; deletion remains unavailable until its policy is approved.
- Added focused unit tests for the new services, controllers, repositories, DTOs, module registration, transaction handling, bcrypt contract, user profile endpoint, and JWT claims.

### Files affected

- `apps/api/src/workspaces/` — workspace and membership controller, service, repository, DTOs, module, and tests.
- `apps/api/src/notifications/` — notification controller, service/internal port, repository, module, and tests.
- `apps/api/src/tickets/` — ticket controller, service, repositories, DTOs, module, and tests.
- `apps/api/src/app.module.ts` — registered the new domain modules.
- `apps/api/src/database/database.service.ts` and `apps/api/src/database/database.service.spec.ts` — added transaction support and tests.
- `apps/api/src/auth/auth.service.ts`, `auth.module.ts`, `jwt-auth.service.ts`, and `users.controller.ts` — bcrypt, JWT identity claims, and authenticated profile endpoint.
- `apps/api/src/auth/*.spec.ts` — regression coverage for the authentication additions.
- `apps/api/package.json`, `pnpm-workspace.yaml`, and `pnpm-lock.yaml` — bcrypt dependency and workspace build approval configuration.
- `docs/adr/0001-ticket-management-permissions.md` — explicit MVP ticket permission decision.

### Technical decisions

- Bcrypt is used for password hashes because the authentication specification explicitly requires it.
- Membership events and their notifications run through one database transaction to avoid partial state.
- Ticket permissions are intentionally admin-only for mutations; the specification leaves employee mutation rights and deletion policy undecided, so deletion is not exposed.
- The existing Prisma schema and `001_initial` migration already contained all required workspace, notification, and ticket structures, so no new migration was created.

### AI-generated or AI-assisted work

AI substantially assisted the NestJS domain module implementations, DTOs, tests, bcrypt migration, transaction adapter, authentication endpoint, and ticket-policy ADR.

### Human review and adjustments

No AI-generated proposal required manual correction during this task.

### Validation performed

- Focused authentication red/green tests: bcrypt and `/users/me` tests initially failed for the absent feature/incorrect hash, then passed.
- `pnpm.cmd --filter @flowboard/api test`: 20 suites and 47 tests passed.
- `pnpm.cmd lint`: passed.
- `pnpm.cmd typecheck`: passed.
- `pnpm.cmd test`: web 11 files / 25 tests passed; API 20 suites / 47 tests passed.
- `pnpm.cmd build`: web and API builds passed.
- `pnpm.cmd prisma:validate`: Prisma schema is valid.
- The browser end-to-end flow was not rerun in this task.

### Result

The API now exposes and registers the workspace, membership, notification, and ticket MVP routes that previously returned 404. Authentication conforms to the bcrypt, JWT-claim, and authenticated-profile requirements. The unresolved ticket deletion policy remains deliberately unavailable.

### Pending work

- Re-run the browser end-to-end workflow against a freshly started API to exercise the repaired routes end to end.
- Approve a future ticket deletion policy and, if desired, broaden employee ticket mutation permissions.
