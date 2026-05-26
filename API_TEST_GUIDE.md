# API Test Guide

이 가이드는 `api-nest` 서버 기본 포트 `3001` 기준입니다.

## 서버 실행

```bash
corepack pnpm nest:dev
```

또는 API 앱만 직접 실행합니다.

```bash
corepack pnpm --filter @repo/api-nest dev
```

## 공통

모든 JSON 요청은 `Content-Type: application/json` 헤더를 사용합니다.

## Users

### 사용자 목록 조회

- Method: `GET`
- URL: `http://localhost:3001/api/users`

### 회원가입

- Method: `POST`
- URL: `http://localhost:3001/api/users`

```json
{
  "user": {
    "username": "tester123",
    "email": "test@example.com",
    "password": "password123"
  }
}
```

### 로그인

- Method: `POST`
- URL: `http://localhost:3001/api/users/login`

```json
{
  "user": {
    "email": "test@example.com",
    "password": "password123"
  }
}
```

## Articles

### 게시글 목록 조회

- Method: `GET`
- URL: `http://localhost:3001/api/articles`

### 게시글 상세 조회

- Method: `GET`
- URL: `http://localhost:3001/api/articles/:slug`

### 게시글 생성

- Method: `POST`
- URL: `http://localhost:3001/api/articles?authorId=1`

```json
{
  "article": {
    "title": "새로운 게시글 제목",
    "description": "게시글 설명",
    "body": "게시글의 상세 내용입니다.",
    "tagList": ["react", "nest"]
  }
}
```

### 게시글 수정

- Method: `PUT`
- URL: `http://localhost:3001/api/articles/:slug`

```json
{
  "article": {
    "title": "수정된 게시글 제목",
    "description": "수정된 설명",
    "body": "내용을 수정했습니다."
  }
}
```

### 게시글 삭제

- Method: `DELETE`
- URL: `http://localhost:3001/api/articles/:slug`
