import { apiFetch } from './client';
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
  return apiFetch<CommentListResponse>(articleCommentsPath(slug));
};

export const createComment = async (
  slug: string,
  comment: CreateCommentInput,
): Promise<CommentResponse> => {
  return apiFetch<CommentResponse>(articleCommentsPath(slug), {
    method: 'POST',
    body: { comment },
  });
};

export const deleteComment = async (
  slug: string,
  commentId: number,
): Promise<void> => {
  await apiFetch<null>(
    `${articleCommentsPath(slug)}/${encodeURIComponent(String(commentId))}`,
    {
      method: 'DELETE',
    },
  );
};
