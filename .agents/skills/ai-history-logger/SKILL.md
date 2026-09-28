---
name: ai-history-logger
description: Mandatory Flowboard academic audit skill. Use at the end of every task performed with AI to document what the user requested, what the AI did, decisions made, affected files, validation performed, and any deviations in docs/ai-history/. This skill applies to coding, configuration, architecture, database, infrastructure, testing, documentation, review, debugging, and refactoring tasks.
---

# AI History Logger

## Purpose

Flowboard is an academic project in which the use of AI must be transparent and auditable.

Every meaningful action performed with AI must leave a clear record that allows a professor or another developer to understand:

- what was requested from the AI;
- how the AI interpreted the request;
- what the AI actually changed;
- why relevant technical decisions were made;
- how the result was validated;
- where human judgment changed, rejected, or corrected an AI suggestion.

The history is not intended to be a raw conversation transcript.

It must be a concise, accurate, human-readable engineering journal.

---

# Mandatory behavior

This skill must be used before declaring any task complete.

A task includes, but is not limited to:

- creating code;
- modifying code;
- deleting code;
- generating tests;
- fixing bugs;
- changing configuration;
- changing dependencies;
- modifying database schemas;
- creating migrations;
- changing infrastructure;
- changing CI/CD;
- creating or changing architecture;
- refactoring;
- performing code review;
- performing architecture review;
- performing security review;
- creating documentation;
- creating agents;
- creating skills;
- modifying project rules;
- debugging;
- investigating technical problems.

Even small tasks must be recorded if they modify the repository or influence an engineering decision.

---

# History location

All records must be stored under:

`docs/ai-history/`

Use one Markdown file per AI task.

Do not maintain one giant history file.

Use the following filename format:

`YYYY-MM-DD-HHMM-short-description.md`

Example:

`docs/ai-history/2026-09-28-1035-create-auth-module.md`

Use the local date and time available in the execution environment.

The short description must:

- be written in English;
- use lowercase kebab-case;
- describe the main task;
- remain short.

Examples:

`2026-09-28-1045-configure-prisma.md`

`2026-09-28-1120-create-login-page.md`

`2026-09-29-0915-refactor-workspace-service.md`

---

# Required document structure

Every history entry must use the following structure:

## AI Task History

### Date

Record the local date and time.

### Request

Explain, in plain language, what the developer asked the AI to do.

Do not simply paste the original prompt.

Summarize the actual intent.

### Understanding

Explain what the AI understood the task to require.

Mention relevant constraints that influenced the implementation.

### Actions performed

Describe what the AI actually did.

Be concrete.

Examples:

- created the authentication module;
- added a registration endpoint;
- configured bcrypt password hashing;
- created Prisma models;
- added unit tests;
- refactored duplicated validation logic.

Do not use vague descriptions such as:

- "improved the code";
- "fixed things";
- "updated some files".

### Files affected

List every meaningful file created, modified, or deleted.

Use repository-relative paths.

Example:

- `apps/backend/src/auth/auth.service.ts` — added login and registration logic.
- `apps/backend/src/auth/auth.controller.ts` — added authentication endpoints.
- `database/prisma/schema.prisma` — added the User model.
- `apps/backend/src/auth/auth.service.spec.ts` — added authentication tests.

Do not include generated files unless they are relevant to understanding the task.

### Technical decisions

Document important decisions made during the task and why.

Examples:

- bcrypt was used for password hashing because it is the password hashing strategy defined by the Flowboard specification.
- workspace roles were not stored inside the JWT because permissions can change while a token is still valid.
- authorization was enforced in the backend instead of relying only on hidden frontend controls.

If there were no meaningful technical decisions, write:

`No significant architectural or technical decisions were required for this task.`

### AI-generated or AI-assisted work

Clearly state which parts were generated or substantially assisted by AI.

Examples:

- initial NestJS service structure;
- test cases;
- Prisma migration proposal;
- React component implementation;
- refactoring suggestions.

This section is required because the project must demonstrate where AI was used.

### Human review and adjustments

Record any AI proposal that was:

- corrected;
- rejected;
- modified;
- simplified;
- overridden by the developer.

Example:

`The initial AI suggestion stored workspace roles in the JWT. This was rejected because roles can change after token issuance. Authorization now checks WorkspaceMember in the database.`

If no human adjustment occurred, write:

`No AI-generated proposal required manual correction during this task.`

Do not invent human intervention that did not happen.

### Validation performed

Record how the work was checked.

Examples:

- `pnpm lint`
- `pnpm test`
- `pnpm build`
- backend unit tests;
- Playwright E2E tests;
- Prisma schema validation;
- manual browser verification;
- architecture review.

Include actual results when known.

Example:

`pnpm test: 42 tests passed.`

Never claim a command was executed if it was not executed.

If validation was not performed, explicitly state:

`No automated validation was performed for this task.`

and explain why when relevant.

### Result

Give a short description of the final state after the task.

Example:

`Users can now register with first name, last name, email, and password. Passwords are hashed using bcrypt, duplicate emails return HTTP 409, and successful registration returns a JWT.`

### Pending work

List anything intentionally left incomplete or deferred.

If nothing remains:

`None.`

---

# Writing style

History must be understandable by someone who did not participate in the development session.

Use:

- clear language;
- short paragraphs;
- concrete descriptions;
- technical terms when useful;
- repository paths;
- actual command names.

Avoid:

- raw chain-of-thought;
- internal reasoning transcripts;
- unnecessarily long explanations;
- marketing language;
- vague statements;
- copying entire prompts;
- copying large code blocks.

The goal is engineering traceability, not conversation archival.

---

# Accuracy requirements

Never fabricate:

- tests that were not executed;
- files that were not changed;
- commands that were not run;
- developer decisions that did not happen;
- review results that were not obtained.

If something is uncertain, explicitly say so.

Prefer:

`The change was not manually tested in the browser.`

over falsely claiming:

`The feature was verified successfully.`

---

# Security and privacy

Never record:

- passwords;
- JWT values;
- API keys;
- database credentials;
- `.env` contents;
- authentication secrets;
- private keys;
- personal access tokens;
- session tokens;
- confidential user information.

Sensitive values must be described generically.

Example:

Correct:

`Configured JWT signing through the JWT_SECRET environment variable.`

Incorrect:

`Configured JWT_SECRET=my-secret-value.`

---

# Avoid self-generated history noise

Do not create a separate history entry solely because an AI history file was created or modified.

The history update belongs to the task being documented.

For example:

Incorrect:

`create-auth-module.md`

followed by:

`document-create-auth-module.md`

Only the first file should exist.

---

# Tasks containing multiple related changes

When several changes belong to the same developer request, keep them in one history entry.

Example:

A request to implement registration may involve:

- User Prisma model;
- migration;
- DTO;
- controller;
- service;
- bcrypt;
- tests.

These belong in one record:

`2026-09-28-1400-implement-user-registration.md`

Do not create one history entry per file.

---

# Tasks spanning multiple AI iterations

If the same task continues through several prompts in the same development effort, prefer updating the existing history entry rather than creating multiple nearly identical files.

Update:

- actions performed;
- files affected;
- decisions;
- validation;
- result.

Create a new history entry only when a genuinely new task begins.

---

# Reviews

For review-only tasks, create a history entry even if no source code was modified.

Record:

- what was reviewed;
- scope of the review;
- findings;
- recommendations;
- whether changes were applied.

Example filename:

`2026-09-29-1500-auth-security-review.md`

---

# Failed or abandoned tasks

Failed attempts are still relevant to the academic history when meaningful work occurred.

Record:

- intended goal;
- attempted approach;
- why it failed;
- whether changes were reverted;
- next recommended action.

Do not hide unsuccessful AI-generated approaches.

They are useful evidence of critical AI usage.

---

# Completion checklist

Before completing any task, verify:

- [ ] The work requested by the developer has been addressed.
- [ ] Relevant validation has been performed when possible.
- [ ] A history entry exists in `docs/ai-history/`.
- [ ] The request is explained clearly.
- [ ] Actions performed are accurately described.
- [ ] Files affected are listed.
- [ ] Important decisions are documented.
- [ ] AI involvement is explicitly identified.
- [ ] Human corrections or rejections are documented when applicable.
- [ ] Tests and commands are reported truthfully.
- [ ] No secrets or sensitive values were written.
- [ ] Pending work is identified.