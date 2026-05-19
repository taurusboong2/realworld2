# Project Context: RealWorld2 (Monorepo)

## 1. Overview
이 프로젝트는 소셜 블로깅 플랫폼인 **"RealWorld (Conduit)"** 사양을 구현한 모노레포입니다. 사용자 인증, 게시글 관리, 팔로우, 댓글, 태그 등의 기능을 포함합니다.

## 2. Architecture & Tech Stack
- **Monorepo Manager**: pnpm Workspaces + Turborepo
- **Backend (NestJS)**: `apps/api-nest`
  - 아키텍처: Controller-Service-Module 패턴
  - 보안: JWT 인증, bcryptjs 비밀번호 암호화
  - 검증: class-validator, class-transformer
- **Backend (Hono)**: `apps/api-hono` (경량 API 서버)
- **Frontend (Next.js)**: `apps/web`
  - React 19, Next.js 16 (App Router 사용)
  - Styling: Tailwind CSS v4
- **Database (Shared)**: `packages/database`
  - ORM: Prisma
  - DB Engine: SQLite (better-sqlite3 어댑터 사용)

## 3. Data Model (Prisma)
- **User**: 이메일, 이름, 비밀번호, 프로필 이미지, 팔로우/팔로잉 관계(Self-relation).
- **Article**: 제목, 슬러그(Slug), 본문, 작성자(User), 태그(Tag), 좋아요(FavoritedBy).
- **Comment**: 게시글에 달린 댓글, 작성자 정보.
- **Tag**: 게시글 분류용 태그 (N:M 관계).

## 4. Key Workflows & Commands
- **개발 시작**: `pnpm dev` (Turbo를 통해 모든 앱 실행)
- **DB 마이그레이션**: `apps/api-nest` 폴더에서 `npx prisma migrate dev`
- **DB 스튜디오**: `npx prisma studio` (데이터 시각화 확인)

## 5. Coding Standards (AI Skills)
`.agents/skills/` 폴더 내에 기술별 베스트 프랙티스가 정의되어 있습니다.
- `nestjs-best-practices`: DTO 사용, 인터셉터, 예외 처리 규칙 등.
- `next-best-practices`: RSC(Server Components) 경계, 데이터 페칭 패턴 등.
- `prisma-client-api`: 쿼리 작성 및 트랜잭션 관리 규칙.