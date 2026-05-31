import { apiFetch } from './client';
import type { ArticleListResponse, ArticleResponse } from './types';

export type GetArticlesParams = {
  tag?: string;
  author?: string;
  favorited?: string;
};

export type CreateArticleInput = {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
};

export type UpdateArticleInput = Partial<{
  title: string;
  description: string;
  body: string;
}>;

function toSearchParams(params: GetArticlesParams = {}) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, value);
    }
  }

  return searchParams;
}

function withQuery(path: string, params: URLSearchParams) {
  const query = params.toString();

  return query ? `${path}?${query}` : path;
}

export async function getArticles(
  params: GetArticlesParams = {},
): Promise<ArticleListResponse> {
  return apiFetch<ArticleListResponse>(
    withQuery('/articles', toSearchParams(params)),
  );
}

export async function getFeed(): Promise<ArticleListResponse> {
  return apiFetch<ArticleListResponse>('/articles/feed');
}

export async function getArticle(slug: string): Promise<ArticleResponse> {
  return apiFetch<ArticleResponse>(`/articles/${encodeURIComponent(slug)}`);
}

export async function createArticle(
  article: CreateArticleInput,
): Promise<ArticleResponse> {
  return apiFetch<ArticleResponse>('/articles', {
    method: 'POST',
    body: { article },
  });
}

export async function updateArticle(
  slug: string,
  article: UpdateArticleInput,
): Promise<ArticleResponse> {
  return apiFetch<ArticleResponse>(`/articles/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: { article },
  });
}

export async function deleteArticle(slug: string): Promise<void> {
  await apiFetch<null>(`/articles/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
  });
}

export async function favoriteArticle(slug: string): Promise<ArticleResponse> {
  return apiFetch<ArticleResponse>(
    `/articles/${encodeURIComponent(slug)}/favorite`,
    {
      method: 'POST',
    },
  );
}

export async function unfavoriteArticle(
  slug: string,
): Promise<ArticleResponse> {
  return apiFetch<ArticleResponse>(
    `/articles/${encodeURIComponent(slug)}/favorite`,
    {
      method: 'DELETE',
    },
  );
}
