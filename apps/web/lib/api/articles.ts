import { apiClient, requestApi } from './client';
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
  return requestApi(
    apiClient.get<ArticleListResponse>(
      withQuery('/articles', toSearchParams(params)),
    ),
  );
};

export const getFeed = async (): Promise<ArticleListResponse> => {
  return requestApi(apiClient.get<ArticleListResponse>('/articles/feed'));
};

export const getArticle = async (slug: string): Promise<ArticleResponse> => {
  return requestApi(
    apiClient.get<ArticleResponse>(`/articles/${encodeURIComponent(slug)}`),
  );
};

export const createArticle = async (
  { title, description, body, tagList }: CreateArticleInput,
): Promise<ArticleResponse> => {
  return requestApi(
    apiClient.post<ArticleResponse>('/articles', {
      article: {
        title,
        description,
        body,
        tagList,
      },
    }),
  );
};

export const updateArticle = async (
  slug: string,
  { title, description, body }: UpdateArticleInput,
): Promise<ArticleResponse> => {
  return requestApi(
    apiClient.put<ArticleResponse>(`/articles/${encodeURIComponent(slug)}`, {
      article: {
        title,
        description,
        body,
      },
    }),
  );
};

export const deleteArticle = async (slug: string): Promise<void> => {
  await requestApi(
    apiClient.delete<void>(`/articles/${encodeURIComponent(slug)}`),
  );
};

export const favoriteArticle = async (
  slug: string,
): Promise<ArticleResponse> => {
  return requestApi(
    apiClient.post<ArticleResponse>(
      `/articles/${encodeURIComponent(slug)}/favorite`,
    ),
  );
};

export const unfavoriteArticle = async (
  slug: string,
): Promise<ArticleResponse> => {
  return requestApi(
    apiClient.delete<ArticleResponse>(
      `/articles/${encodeURIComponent(slug)}/favorite`,
    ),
  );
};
