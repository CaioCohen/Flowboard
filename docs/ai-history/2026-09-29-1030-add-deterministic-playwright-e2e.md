## AI Task History

### Date

2026-09-29 10:30 (America/Sao_Paulo)

### Request

Add Playwright browser end-to-end tests that cover the application's complete workflow and important edge cases with deterministic execution.

### Understanding

The tests needed to exercise the real compiled React application in Chromium while avoiding reliance on a shared API process, Docker database, credentials, timing, or external services. This is Playwright Test infrastructure, not a Playwright MCP browser session.

### Actions performed

- Added Playwright Test to the web workspace and scripts for headless E2E execution and UI mode.
- Added a Playwright configuration that builds the frontend and starts a local Vite preview server.
- Created a stateful in-memory HTTP contract fixture inside the E2E test file. Every browser test receives fresh deterministic user, workspace, ticket, and notification state.
- Added a primary browser journey covering registration, automatic authentication, workspace creation, member addition, ticket create/update/delete, notification read state, profile display, logout, and login.
- Added edge-case coverage for empty registration, duplicate registration, invalid credentials, empty workspace names, and empty ticket titles.
- Documented the local browser-install and E2E commands in the README.
- Ignored generated Playwright HTML report and test-result directories in ESLint so local test artifacts do not cause lint failures.

### Files affected

- `apps/web/package.json` — added Playwright dependency and E2E scripts.
- `pnpm-lock.yaml` — recorded the locked Playwright dependency.
- `apps/web/playwright.config.ts` — configured Chromium, local preview server, artifacts, and deterministic execution settings.
- `apps/web/e2e/flowboard.spec.ts` — added browser workflow and edge-case tests with an in-memory API fixture.
- `eslint.config.mjs` — ignored generated Playwright output directories.
- `README.md` — documented Playwright installation and execution.
- `docs/ai-history/2026-09-29-1030-add-deterministic-playwright-e2e.md` — this audit entry.

### Technical decisions

The browser suite intercepts HTTP requests at the Playwright page boundary instead of using a live backend and PostgreSQL instance. This preserves real browser rendering, application routing, forms, session storage, and API-client behavior while making every run isolated and repeatable. The suite uses fixed identifiers and timestamps and one Chromium worker to avoid concurrency and time-dependent flakes.

### AI-generated or AI-assisted work

AI generated the initial Playwright configuration, test fixture, browser scenarios, command documentation, and lint-ignore update. AI also adjusted selectors after observed strict-locator failures during the red/green test cycle.

### Human review and adjustments

No AI-generated proposal required manual correction during this task.

### Validation performed

- Initial red run: the Playwright test command could not run because the runner dependency was absent.
- Installed `@playwright/test` and the Playwright Chromium binary.
- `pnpm.cmd --filter @flowboard/web test:e2e`: both Chromium scenarios completed successfully (the main journey and validation/error scenario).
- `pnpm.cmd lint`: completed successfully after generated Playwright artifact directories were excluded.
- `pnpm.cmd test`: web unit tests reported 11 files and 28 tests passing; the command output also showed the API Jest suite in progress before the command-session time limit, so a full monorepo completion result was not captured in this task.
- `git diff --check`: completed with no whitespace errors.

### Result

The web workspace now has a runnable deterministic Playwright E2E suite that exercises the primary user workflow and representative validation and authentication failure paths without depending on shared backend infrastructure.

### Pending work

The deterministic browser suite does not replace separate HTTP/database integration coverage against the NestJS API and PostgreSQL test database. A complete uninterrupted monorepo unit-test result should also be captured in a later verification session.
