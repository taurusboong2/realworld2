# realworld2

RealWorld 스타일 서비스를 목표로 구현 중인 PNPM 모노레포입니다.

현재 프로젝트는 NestJS API와 Prisma/SQLite 데이터베이스 패키지를 중심으로 구성되어 있습니다. Hono와 Web 앱은 현재 사용하지 않습니다.

## Stack

- `pnpm` workspace
- `turbo`
- `NestJS 11`
- `Prisma 7`
- `SQLite`

## Structure

```text
.
├── apps
│   └── api-nest
├── packages
│   └── database
├── pnpm-workspace.yaml
└── turbo.json
```

## Prerequisites

- Node.js 20.19+, 22.12+, or 24.0+
- pnpm 10+

The local `.nvmrc` currently points to:

```text
22.22.2
```

## Install

```bash
corepack pnpm install
```

## Database

The database package owns the Prisma schema and SQLite file.

- Schema: `packages/database/prisma/schema.prisma`
- SQLite DB: `packages/database/dev.db`
- Prisma config: `packages/database/prisma.config.ts`

Useful commands from the repository root:

```bash
corepack pnpm p:generate
corepack pnpm p:validate
corepack pnpm p:push
corepack pnpm p:seed
corepack pnpm p:studio
```

Notes:

- `p:push` syncs the Prisma schema into `packages/database/dev.db`.
- `p:seed` deletes existing users and creates two dummy users.
- `p:studio` opens Prisma Studio against the same DB used by the API.

## Run API

Run from the repository root:

```bash
corepack pnpm nest:dev
```

Or run the app directly:

```bash
corepack pnpm --filter @repo/api-nest dev
```

Default API port:

```text
http://localhost:3001
```

## API Status

Base route:

```text
GET /api
```

Response:

```json
{
  "message": "Hello World!"
}
```

Users:

```text
GET  /api/users
POST /api/users
```

Create user request:

```json
{
  "username": "alice",
  "password": "1234",
  "email": "alice@example.com"
}
```

Validation:

- `username`: string, required, max 30
- `password`: string, required
- `email`: email, required

Duplicate `username` or `email` returns `409 Conflict`.

## API Architecture

`apps/api-nest/src` is split into:

```text
src/
├── clients/
├── controllers/
├── dto/
├── modules/
├── scripts/
├── services/
├── app.module.ts
└── main.ts
```

The API imports Prisma through `@repo/database`; do not create a second Prisma schema or SQLite DB inside `apps/api-nest`.

## Test And Build

```bash
corepack pnpm --filter @repo/api-nest build
corepack pnpm --filter @repo/api-nest test
corepack pnpm --filter @repo/api-nest test:e2e
```

## Current Next Steps

- Hide `password` from user responses
- Add password hashing before authentication work
- Add login/auth endpoints
- Move future domain code toward feature-first modules under `src/modules/<feature>`
