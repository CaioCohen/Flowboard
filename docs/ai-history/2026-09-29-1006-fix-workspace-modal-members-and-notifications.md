## AI Task History

### Date

2026-09-29 10:06 (America/Sao_Paulo)

### Request

Fix workspace and ticket dialogs appearing beneath page content, improve the message shown when an invited email has no user, make ticket assignment select workspace users by name, preserve visible workspace members after reopening management, and show unread-notification status on the navigation bell.

### Understanding

The dialog issue required using the browser's native modal top layer rather than only rendering an open `dialog` attribute. The existing workspace detail API already returns authorized member summaries, so it could be reused for both refreshed management data and ticket assignment without adding a redundant endpoint. A missing email needed a distinct backend response while other failures remain generic.

### Actions performed

- Added a reusable native dialog wrapper that invokes `showModal()` and migrated workspace create/manage and ticket create/edit dialogs to it.
- Refetched workspace detail whenever the management dialog opens, ensuring the member list is current after reopening.
- Replaced ticket assignee-ID entry with a name/email datalist autocomplete that maps the selected member to its user ID only when saving.
- Changed the missing-user invitation response to `User email not found.` and preserved this specific message in the workspace UI while leaving other 404 and connectivity messaging generic.
- Added navigation-bell unread state, refreshed at application entry and every 30 seconds, with a visual red indicator.
- Added regression tests for the missing-email path and unread-notification detection.
- Lifted unread-notification state to the application route so the notifications page can update the bell immediately after a successful read mutation, while retaining polling as a fallback for external changes.
- Added a regression test for replacing the final unread notification locally.

### Files affected

- `apps/api/src/workspaces/workspace.service.ts` — returns the explicit missing-email error.
- `apps/api/src/workspaces/workspace.service.spec.ts` — tests the missing-email behavior.
- `apps/web/src/modules/workspace/components/modal-dialog.tsx` — native top-layer dialog wrapper.
- `apps/web/src/modules/workspace/pages/workspaces/workspaces.tsx` — uses the dialog wrapper and refreshes members on modal open.
- `apps/web/src/modules/workspace/pages/workspace-dashboard/workspace-dashboard.tsx` — uses top-layer dialog and name/email assignee autocomplete.
- `apps/web/src/modules/workspace/utils/workspace-error.ts` — retains the explicit missing-email message.
- `apps/web/src/modules/workspace/utils/workspace-error.test.ts` — tests the UI error mapping.
- `apps/web/src/modules/account/utils/account-presentation.ts` — derives unread state.
- `apps/web/src/modules/account/utils/account-presentation.test.ts` — tests unread state derivation and local read replacement.
- `apps/web/src/modules/account/index.ts` — exports the unread-state utility.
- `apps/web/src/modules/account/pages/notifications/notifications-page.tsx` — reports initial and changed unread state to the application shell.
- `apps/web/src/routes/app-routes.tsx` — refreshes unread notifications and renders the indicator.
- `apps/web/src/routes/app-routes.css` — styles the red notification indicator.

### Technical decisions

- `HTMLDialogElement.showModal()` was used because it promotes the dialog to the browser-managed top layer, which cannot be reliably reproduced with page `z-index` values alone.
- No members endpoint was added: `GET /workspaces/:id` already returns member IDs, names, and emails after access authorization, avoiding a duplicate contract.
- The frontend only exposes the exact missing-email message for the known backend response; network, authorization, and server errors continue to use safe generic messages.
- The notification indicator polls every 30 seconds so it remains current while a user stays within the application without introducing a realtime transport.
- A successful read mutation reports its recalculated unread state directly to the application shell, removing the polling delay for in-app reads.

### AI-generated or AI-assisted work

AI generated the dialog wrapper, autocomplete wiring, error mapping, unread-indicator synchronization, and the accompanying regression tests.

### Human review and adjustments

No AI-generated proposal required manual correction during this task.

### Validation performed

- Verified the new backend and frontend regression tests first failed before implementation.
- `pnpm.cmd --filter @flowboard/api test -- workspace.service.spec.ts` — passed, 7 tests.
- `pnpm.cmd --filter @flowboard/web test -- workspace-error.test.ts account-presentation.test.ts` — passed, 27 tests across the web suite.
- `pnpm.cmd lint` — passed.
- `pnpm.cmd test` — passed: web 27 tests and API 53 tests.
- `pnpm.cmd --filter @flowboard/web run build` — passed.
- `pnpm.cmd --filter @flowboard/api run build` — passed.
- `pnpm.cmd prisma:validate` — passed.
- `pnpm.cmd --filter @flowboard/web run build` — passed after the immediate unread-state synchronization change.
- `pnpm.cmd lint` — passed after the immediate unread-state synchronization change.
- `pnpm.cmd test` — passed after the immediate unread-state synchronization change: web 28 tests and API 53 tests.

### Result

Workspace and ticket dialogs open in the native modal top layer, workspace membership reloads when managed, ticket assignment is selected by member name or email and saved as an ID, unknown invitation emails are distinguished, and unread notifications show a red bell indicator that clears immediately after the final in-app notification is marked read.

### Pending work

None.
