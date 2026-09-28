## AI Task History

### Date

2026-09-28 17:49 (America/Sao_Paulo)

### Request

Replace the poor workspace error experience that displayed the backend text `Cannot GET /workspaces`, and find other similar cases in the codebase.

### Understanding

The workspace interface must not display route names, transport failures, or other raw backend error text to end users. The audit was scoped to frontend error rendering and found direct rendering of `Error.message` in the workspaces page and workspace dashboard.

### Actions performed

- Added a workspace error-message presenter that produces clear, action-specific messages and treats missing/unavailable resources and service errors separately.
- Replaced direct error-message rendering while loading, leaving, creating, renaming, and managing workspace members.
- Replaced the corresponding direct rendering in the workspace dashboard while loading, deleting, and saving tickets.
- Added regression tests for the reported `Cannot GET /workspaces` case and unexpected client errors.
- Searched the web source for other direct workspace error rendering. Authentication and account request services already use controlled messages, so no changes were made there.

### Files affected

- `apps/web/src/modules/workspace/utils/workspace-error.ts` — added status-aware, user-facing workspace error presentation.
- `apps/web/src/modules/workspace/utils/workspace-error.test.ts` — added regression coverage for backend and unexpected errors.
- `apps/web/src/modules/workspace/pages/workspaces/workspaces.tsx` — replaced raw error output with action-specific user messages.
- `apps/web/src/modules/workspace/pages/workspace-dashboard/workspace-dashboard.tsx` — replaced raw error output with action-specific user messages.

### Technical decisions

Error presentation is centralized in the workspace module, rather than forwarding API error bodies to page components. This prevents backend route names and implementation details from leaking while retaining useful context about the attempted action. HTTP 403/404 responses explain that the resource may be unavailable or access may have changed; 5xx responses identify temporary service unavailability.

### AI-generated or AI-assisted work

AI generated the error presenter, the regression tests, the page integrations, and the source audit.

### Human review and adjustments

No AI-generated proposal required manual correction during this task.

### Validation performed

- The new workspace error test was run before implementation and failed as expected because `workspace-error` did not yet exist.
- `pnpm.cmd --filter @flowboard/web test` passed: 10 test files and 24 tests.
- `pnpm.cmd lint` passed.
- `pnpm.cmd typecheck` passed.
- `pnpm.cmd test` passed for the web and API workspaces.
- `pnpm.cmd build` passed for the web and API workspaces.
- `git diff --check` reported no whitespace errors; Git emitted only existing line-ending conversion warnings.
- No manual browser verification was performed in this task.

### Result

Workspace users now see clear, contextual recovery messages instead of raw backend errors such as `Cannot GET /workspaces`. The same safeguard covers all audited workspace and ticket error paths.

### Pending work

None.
