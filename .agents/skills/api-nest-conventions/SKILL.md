---
name: api-nest-conventions
description: Use when modifying files under apps/api-nest. Defines this repository's NestJS API architecture, naming conventions, DTO/controller/service rules, Prisma usage, validation, response, auth, and testing rules.
user-invocable: false
---

# api-nest Conventions

Use this guide before changing `apps/api-nest/**`.

## Project Boundary

This repository's backend target is `apps/api-nest`.

- Do not add or maintain Hono backend code for this project.
- Do not copy Hono routes, handlers, middleware, or app bootstrap patterns into Nest files.
- When following `all-commits.patch`, translate backend intent into this Nest app's current structure.

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
- For the current in-progress migration, keep the existing layer folders unless the user explicitly asks for the larger feature-first refactor.
- If the project later moves to feature-first modules, do it in one deliberate refactor, not opportunistically during unrelated work.
- Do not perform broad renames or file moves unless the user asks for that refactor.
- Preserve the current `default` spelling. Do not reintroduce the old `detault` typo from earlier history.

## Naming

- File names: kebab-case.
- DTO files: `create-user.dto.ts`, `update-user.dto.ts`, `login-user.dto.ts`.
- Response DTO files should also use kebab-case, for example `article-response.dto.ts` and `user-response.dto.ts`.
- Controllers: `users.controller.ts`.
- Services: `users.service.ts`.
- Modules: `users.module.ts`.
- Guard files: lower-case kebab-case plus `.guard.ts`, for example `auth.guard.ts`, `optional-auth.guard.ts`, `cookie-auth.guard.ts`.
- Shared type files under `src/types`: short domain names plus `.ts`, for example `auth.ts`, `article.ts`, `comment.ts`.
- Class names: `CreateUserDto`, `ArticleResponseDto`, `UsersController`, `UsersService`, `UsersModule`.

Existing names such as `AddUserDto` may remain when making small changes. For new APIs, prefer the names above.

## Controller Rules

- Controllers handle HTTP input/output only.
- Use DTOs for `@Body()`, and explicit types for params/query.
- Do not put business logic in controllers.
- Do not return passwords, tokens, or raw DB errors.
- Prefer explicit route paths on new handlers once a controller has mixed nested routes, for example `@Get('/')`, `@Post('/')`, `@Get('/:slug')`.
- Method route decorator paths should start with `/`, for example `@Get('/user')`, `@Post('/users')`, `@Delete('/:slug')`.
- Root handlers should use an explicit slash, for example `@Get('/')` instead of `@Get()`.
- If an existing controller uses `@Get()` style routes, do not rename route decorators unless it is part of the requested change.
- Authenticated routes should get the current user from a guard-populated request object, not from `userId` query parameters.

## Service Rules

- Services own business logic.
- Prisma access belongs in services or repositories, not controllers.
- Convert Prisma errors to Nest HTTP exceptions where practical.
- Use transactions when a write flow spans multiple related records.
- Avoid `formatXxx` helpers inside services once response shape grows. Prefer response DTOs or presenters when responses need stable RealWorld-style envelopes.

## DTO And Validation

- Request bodies must use DTOs.
- Use `class-validator`.
- `main.ts` uses global `ValidationPipe`; keep route DTOs compatible with it.
- Add response DTOs or presenters once response shape matters.
- Use `unknown` plus narrowing for unsafe inputs. Do not use `any` or `as any` to bypass type errors.
- Keep DTO classes focused on one request/response shape.
- Request DTOs and response DTOs should be separate classes.
- When response shape is stable, prefer a response DTO static factory such as `ArticleResponseDto.fromModel(model)` over service-local `formatArticle` or `formatUser` helpers.

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

- Do not add new ad-hoc formatter methods such as `formatArticle` or `formatUser` once a response DTO exists for that resource.
- Use purpose-specific response DTOs such as `ArticleResponseDto` and `UserResponseDto`.
- Split nested response objects into smaller DTOs when the nested shape is reused, for example author or comment response objects.
- Keep RealWorld envelopes consistent: `{ user }`, `{ article }`, `{ articles, articlesCount }`, `{ comments }`, `{ tags }`.

## Auth And Cookies

- Auth guards should live in `src/guards`.
- Shared request auth types should live in `src/types/auth.ts`.
- Cookie parsing utilities should live in `src/utils/cookie.ts` when needed.
- Required auth routes should throw `UnauthorizedException` when no valid user is present.
- Optional auth routes should tolerate missing or invalid credentials and continue as anonymous.

## Formatting And Lint Rules

- Follow `apps/api-nest/.prettierrc`.
- Current formatting uses single quotes and trailing commas.
- Style conflicts should be resolved by Prettier/Eslint, not personal preference.
- Keep imports and long object literals readable after edits.

## Type Safety Rules

- Follow `apps/api-nest/tsconfig.json`.
- Do not introduce implicit `any`.
- Avoid explicit `any`; prefer DTOs, Prisma types, Nest types, or `unknown` plus narrowing.
- Do not use `as any` or `<any>` to bypass type errors.
- If a Prisma include result is awkward to type, define a local precise type or use Prisma helper types rather than weakening the whole service.

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

## Validation Checklist

- For doc-only skill edits, run `git diff --check`.
- For API code edits, run at least:

```bash
corepack pnpm --filter @repo/api-nest build
```

- When controllers, modules, DTO validation, or response shape changes, also run unit and e2e tests.
