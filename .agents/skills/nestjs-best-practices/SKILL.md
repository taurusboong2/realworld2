---
name: nestjs-best-practices
description: Use when designing, reviewing, refactoring, or implementing NestJS code. Provides concise NestJS architecture, dependency injection, DTO, guard, error handling, Prisma, and testing guidance, adapted for this repository.
user-invocable: false
---

# NestJS Best Practices

Use this skill for NestJS work, especially under `apps/api-nest/**`. If the task touches this repository's API app, also follow `.agents/skills/api-nest-conventions/SKILL.md`; repository conventions override this general guide.

## Architecture

- Keep modules acyclic. If two modules need each other, extract shared behavior or use events instead of `forwardRef` as the default answer.
- Keep controllers thin: parse HTTP input, delegate to services, return responses.
- Keep services focused on business rules and orchestration.
- Put cross-cutting code in `common`, `guards`, `interceptors`, `pipes`, `filters`, `utils`, or a clearly named infrastructure area.
- Do not introduce a repository layer unless it reduces real duplication or matches the surrounding code.

## Dependency Injection

- Prefer constructor injection.
- Register providers in exactly one owning module when possible.
- Export providers only when another module needs them.
- Avoid service locator patterns such as manually fetching dependencies from `ModuleRef` for ordinary request flows.

## DTOs And Validation

- Use DTO classes for request bodies.
- Use `class-validator` decorators on request DTOs.
- Keep request DTOs and response DTOs separate once response shape matters.
- Do not accept raw `any`; use explicit types, DTOs, or `unknown` plus narrowing.
- Keep validation behavior compatible with the app's global `ValidationPipe`.

## Controllers And Routes

- Use explicit `@Param`, `@Query`, `@Body`, `@Req`, and `@Res` types.
- Do not put Prisma calls in controllers.
- Do not expose passwords, tokens, stack traces, or raw ORM errors.
- For authenticated routes, prefer guards that attach the user to the request over query parameters such as `userId`.
- Use Nest HTTP exceptions for user-facing failures.

## Error Handling

- Missing resource: `NotFoundException`.
- Invalid input: `BadRequestException`.
- Auth failure: `UnauthorizedException`.
- Permission failure: `ForbiddenException`.
- Unique constraint conflict: `ConflictException`.
- Convert expected Prisma errors to Nest exceptions at the service boundary.

## Prisma And Data Access

- Avoid N+1 query patterns. Use Prisma `include`, `select`, or batched queries when relations are needed.
- Use `$transaction` when a write flow must update multiple related records atomically.
- Keep schema, generated client, and SQLite database ownership in `packages/database` for this repo.
- Do not create a second Prisma schema or database inside `apps/api-nest`.

## Security

- Validate every external input.
- Treat auth cookies and JWTs as sensitive.
- Keep JWT secret and cookie names in environment/config code, not hardcoded in route handlers.
- Prefer required and optional auth guards over duplicated token parsing.

## Testing

- Use `@nestjs/testing` for controller/service unit tests.
- Use Supertest for e2e tests.
- Mock the shared database package in unit/e2e tests unless the test is intentionally integration-level.
- After structural API changes, run:

```bash
corepack pnpm --filter @repo/api-nest build
corepack pnpm --filter @repo/api-nest test
corepack pnpm --filter @repo/api-nest test:e2e
```

If Supertest e2e fails with sandbox `EPERM` while opening a listener, rerun with the required execution permission instead of changing application code.
