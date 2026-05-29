# API Test Guide (Manual Auth Implementation)

이 가이드는 **JWT 인증이 제거된** `api-nest` 서버 기본 포트 `3001` 기준 테스트 방법입니다. 인증 토큰 대신 `userId` 또는 `currentUserId` 쿼리 파라미터를 사용하여 사용자를 식별합니다.

## 1. 서버 실행

```bash
corepack pnpm --filter @repo/api-nest dev
```

## 2. API 엔드포인트 목록

### [Users] 사용자

1. **회원가입:** `POST /api/users`
2. **로그인:** `POST /api/users/login`
3. **현재 사용자 조회:** `GET /api/user?userId=1`
4. **사용자 정보 수정:** `PUT /api/user?userId=1`

### [Profiles] 프로필

1. **프로필 조회:** `GET /api/profiles/:username?currentUserId=1`
2. **팔로우:** `POST /api/profiles/:username/follow?currentUserId=1`
3. **언팔로우:** `DELETE /api/profiles/:username/follow?currentUserId=1`

### [Articles] 게시글

1. **게시글 목록:** `GET /api/articles?userId=1`
2. **피드 조회:** `GET /api/articles/feed?userId=1`
3. **게시글 생성:** `POST /api/articles?userId=1`
4. **게시글 수정:** `PUT /api/articles/:slug?userId=1`
5. **게시글 삭제:** `DELETE /api/articles/:slug?userId=1`

### [Comments] 댓글

1. **댓글 추가:** `POST /api/articles/:slug/comments?userId=1`
2. **댓글 목록:** `GET /api/articles/:slug/comments?userId=1`
3. **댓글 삭제:** `DELETE /api/articles/:slug/comments/:id?userId=1`

### [Favorites] 좋아요

1. **좋아요:** `POST /api/articles/:slug/favorite?userId=1`
2. **좋아요 취소:** `DELETE /api/articles/:slug/favorite?userId=1`

### [Tags] 태그

1. **태그 목록 조회:** `GET /api/tags`

## 3. Postman 테스트 팁

- 모든 JSON 요청은 `Content-Type: application/json` 헤더를 사용합니다.
- 인증이 필요한 API에서는 `Authorization` 헤더 대신 URL 뒤에 `?userId=X` 또는 `?currentUserId=X`를 붙여서 테스트하세요.
- `userId`와 `currentUserId`는 실제 데이터베이스에 존재하는 사용자 ID여야 합니다.
