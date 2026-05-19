---
name: prisma-client-api-sqlite-monorepo
description: Prisma Client API reference optimized for Next.js, SQLite, and Turborepo monorepo structure. Use when writing database queries, configuring the Prisma Client singleton in a monorepo, or handling SQLite-specific CRUD operations. Triggers on "prisma query", "findMany", "create", "update", "delete", "$transaction".
license: MIT
metadata:
  author: prisma
  version: "7.6.0"
---

# Prisma Client API Reference (SQLite & Monorepo)

## When to Apply

Reference this skill when:
- Turborepo 환경에서 Next.js 서비스 및 패키지 간 Prisma Client 인스턴스를 공유하거나 사용할 때
- Next.js Fast Refresh로 인한 커넥션 풀 고갈을 방지하는 싱글톤 패턴을 구현할 때
- SQLite 데이터베이스 기반의 CRUD 및 트랜잭션을 작성할 때

---

## Turborepo + Next.js 인스턴스화 (Singleton)

Next.js 개발 환경의 Fast Refresh로 인한 중복 연결을 방지하고, 모노레포 구조(예: `packages/database`)에서 안전하게 클라이언트를 내보내는 표준 패턴입니다.

```typescript
import { PrismaClient } from '@repo/database' // Turborepo 내부 패키지 export 구조 예시

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma