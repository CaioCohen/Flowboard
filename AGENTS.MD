# Flowboard — Mandatory AI Rules

## AI History

Every task performed by the AI must be documented in `docs/ai-history/`.

This requirement ALWAYS applies, regardless of the type or size of the task.

Before considering any task complete:

1. Use the `ai-history-logger` skill.
2. Create or update the appropriate history entry in `docs/ai-history/`.
3. Record, in clear human-readable language:
   - what the user requested;
   - what the AI understood the task to be;
   - what was changed or created;
   - important technical decisions;
   - files affected;
   - tests or validations performed;
   - anything requested but not implemented;
   - relevant AI suggestions that were rejected or modified by the developer.

Do not consider a coding, configuration, architecture, database, documentation, testing, refactoring, or infrastructure task complete until its AI history has been recorded.

Never include secrets, passwords, tokens, `.env` values, private keys, or other sensitive information in AI history.

## Task Completion

When implementing a requested change:

- Do not stop after describing what you are about to do.
- Continue working until the requested implementation is complete.
- Run the relevant tests or validation after making changes.
- Fix issues found during validation when possible.
- Only return control to the user when:
  - the task is complete, or
  - there is a concrete blocker requiring user input.
- Progress updates are not task completion.