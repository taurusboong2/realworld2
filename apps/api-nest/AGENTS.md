# api-nest Agent Notes

When modifying `apps/api-nest`, use the repository-local skill first:

- `.agents/skills/api-nest-conventions/SKILL.md`

## Local Reminders

- The API uses `@repo/database` as the single Prisma source of truth.
- Do not add a separate Prisma schema or SQLite DB inside `apps/api-nest`.
- Keep small changes in the current layered structure.
- Prefer feature-first modules under `src/modules/<feature>` for new domains.
- Use DTOs for request bodies and `class-validator` for validation.
- Do not expose passwords, tokens, or raw Prisma errors in responses.
