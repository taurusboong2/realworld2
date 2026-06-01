import { apiFetch } from './client';
import type { CommentListResponse, CommentResponse } from './types';

export type CreateCommentInput = {
  body: string;
};

function articleCommentsPath(slug: string) {
  return `/articles/${encodeURIComponent(slug)}/comments`;
}

export async function getComments(
  slug: string,
): Promise<CommentListResponse> {
  return apiFetch<CommentListResponse>(articleCommentsPath(slug));
}

export async function createComment(
  slug: string,
  comment: CreateCommentInput,
): Promise<CommentResponse> {
  return apiFetch<CommentResponse>(articleCommentsPath(slug), {
    method: 'POST',
    body: { comment },
  });
}

export async function deleteComment(
  slug: string,
  commentId: number,
): Promise<void> {
  await apiFetch<null>(
    `${articleCommentsPath(slug)}/${encodeURIComponent(String(commentId))}`,
    {
      method: 'DELETE',
    },
  );
}
