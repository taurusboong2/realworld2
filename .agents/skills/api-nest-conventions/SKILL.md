---
name: api-nest-conventions
description: Use when modifying files under apps/api-nest. Defines this repository's NestJS API architecture, naming conventions, DTO/controller/service rules, Prisma usage, validation, response, and testing rules.
user-invocable: false
---

# api-nest Conventions

Use this guide before changing `apps/api-nest/**`.

## Current Architecture

The API is a NestJS app that uses the shared `@repo/database` package for Prisma and SQLite.

```text
apps/api-nest/src/
├── clients/
├── controllers/
├── dto/
├── modules/
├── scripts/
├── services/
├── app.module.ts
└── main.ts
```

Important rule: do not add a second Prisma schema, generated client, or SQLite DB under `apps/api-nest`. The source of truth is:

- `packages/database/prisma/schema.prisma`
- `packages/database/index.ts`
- `packages/database/dev.db`

## Migration Policy

- Keep small edits close to the existing file structure.
- For new domain features, prefer feature-first structure under `src/modules/<feature>`.
- Do not perform broad renames or file moves unless the user asks for that refactor.
- Preserve the current `default` spelling. Do not reintroduce the old `detault` typo from earlier history.

## Naming

- File names: kebab-case.
- DTO files: `create-user.dto.ts`, `update-user.dto.ts`, `login-user.dto.ts`.
- Controllers: `users.controller.ts`.
- Services: `users.service.ts`.
- Modules: `users.module.ts`.
- Class names: `CreateUserDto`, `UsersController`, `UsersService`, `UsersModule`.

Existing names such as `AddUserDto` may remain when making small changes. For new APIs, prefer the names above.

## Controller Rules

- Controllers handle HTTP input/output only.
- Use DTOs for `@Body()`, and explicit types for params/query.
- Do not put business logic in controllers.
- Do not return passwords, tokens, or raw DB errors.

## Service Rules

- Services own business logic.
- Prisma access belongs in services or repositories, not controllers.
- Convert Prisma errors to Nest HTTP exceptions where practical.
- Use transactions when a write flow spans multiple related records.

## DTO And Validation

- Request bodies must use DTOs.
- Use `class-validator`.
- `main.ts` uses global `ValidationPipe`; keep route DTOs compatible with it.
- Add response DTOs or presenters once response shape matters.

## Prisma Rules

- Import runtime Prisma through `src/clients/prisma.client.ts`.
- `src/clients/prisma.client.ts` should delegate to `@repo/database`.
- Schema changes belong in `packages/database/prisma/schema.prisma`.
- After schema changes, run:

```bash
corepack pnpm p:generate
corepack pnpm p:validate
corepack pnpm p:push
```

## Error Rules

Use explicit Nest exceptions:

- Duplicate unique value: `ConflictException`
- Missing resource: `NotFoundException`
- Invalid input: `BadRequestException`
- Auth failure: `UnauthorizedException`

Never expose raw Prisma error text as the API response.

## Response Rules

RealWorld-style response shapes are preferred as the API matures.

Example direction:

```json
{
  "user": {
    "email": "alice@example.com",
    "username": "alice",
    "bio": null,
    "image": null
  }
}
```

Current early endpoints may still return raw Prisma models, but password fields should be removed before auth work continues.

## Testing

- Run build after structural changes:

```bash
corepack pnpm --filter @repo/api-nest build
```

- Run unit/e2e tests when touching controllers, modules, or validation:

```bash
corepack pnpm --filter @repo/api-nest test
corepack pnpm --filter @repo/api-nest test:e2e
```

If e2e fails with a sandbox `EPERM` while opening an HTTP listener, rerun with the required execution permission rather than changing app code.
