import { apiClient, requestApi } from './client';
import type { CommentListResponse, CommentResponse } from './types';

export type CreateCommentInput = {
  body: string;
};

const articleCommentsPath = (slug: string) => {
  return `/articles/${encodeURIComponent(slug)}/comments`;
};

export const getComments = async (
  slug: string,
): Promise<CommentListResponse> => {
  return requestApi(
    apiClient.get<CommentListResponse>(articleCommentsPath(slug)),
  );
};

export const createComment = async (
  slug: string,
  { body }: CreateCommentInput,
): Promise<CommentResponse> => {
  return requestApi(
    apiClient.post<CommentResponse>(articleCommentsPath(slug), {
      comment: {
        body,
      },
    }),
  );
};

export const deleteComment = async (
  slug: string,
  commentId: number,
): Promise<void> => {
  await requestApi(
    apiClient.delete<void>(
      `${articleCommentsPath(slug)}/${encodeURIComponent(String(commentId))}`,
    ),
  );
};
