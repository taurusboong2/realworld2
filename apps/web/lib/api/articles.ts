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

const toSearchParams = (params: GetArticlesParams = {}) => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, value);
    }
  }

  return searchParams;
};

const withQuery = (path: string, params: URLSearchParams) => {
  const query = params.toString();

  return query ? `${path}?${query}` : path;
};

export const getArticles = async (
  params: GetArticlesParams = {},
): Promise<ArticleListResponse> => {
  return apiFetch<ArticleListResponse>(
    withQuery('/articles', toSearchParams(params)),
  );
};

export const getFeed = async (): Promise<ArticleListResponse> => {
  return apiFetch<ArticleListResponse>('/articles/feed');
};

export const getArticle = async (slug: string): Promise<ArticleResponse> => {
  return apiFetch<ArticleResponse>(`/articles/${encodeURIComponent(slug)}`);
};

export const createArticle = async (
  article: CreateArticleInput,
): Promise<ArticleResponse> => {
  return apiFetch<ArticleResponse>('/articles', {
    method: 'POST',
    body: { article },
  });
};

export const updateArticle = async (
  slug: string,
  article: UpdateArticleInput,
): Promise<ArticleResponse> => {
  return apiFetch<ArticleResponse>(`/articles/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: { article },
  });
};

export const deleteArticle = async (slug: string): Promise<void> => {
  await apiFetch<null>(`/articles/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
  });
};

export const favoriteArticle = async (
  slug: string,
): Promise<ArticleResponse> => {
  return apiFetch<ArticleResponse>(
    `/articles/${encodeURIComponent(slug)}/favorite`,
    {
      method: 'POST',
    },
  );
};

export const unfavoriteArticle = async (
  slug: string,
): Promise<ArticleResponse> => {
  return apiFetch<ArticleResponse>(
    `/articles/${encodeURIComponent(slug)}/favorite`,
    {
      method: 'DELETE',
    },
  );
};
