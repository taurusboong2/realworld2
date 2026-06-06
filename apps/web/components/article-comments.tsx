'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import {
  createComment,
  deleteComment,
  getComments,
} from '@/lib/api/comments';
import { ApiError } from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/error-message';
import type { Comment } from '@/lib/api/types';
import { getLoginHref } from '@/lib/auth/redirect';
import { useAuth } from '@/lib/auth/use-auth';
import { validationLimits } from '@/lib/validation';

type ArticleCommentsProps = {
  slug: string;
};

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export function ArticleComments({ slug }: ArticleCommentsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status, user, refreshUser } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const queryString = searchParams.toString();
  const redirectTo = queryString ? `${pathname}?${queryString}` : pathname;

  const loadComments = async () => {
    setErrorMessage(null);

    try {
      const response = await getComments(slug);
      setComments(response.comments);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, '댓글을 불러오지 못했습니다.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getComments(slug);

        if (!isActive) {
          return;
        }

        setComments(response.comments);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, '댓글을 불러오지 못했습니다.'),
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [slug]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedBody = body.trim();

    if (!trimmedBody) {
      setErrorMessage('댓글 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { comment } = await createComment(slug, { body: trimmedBody });
      setComments((currentComments) => [comment, ...currentComments]);
      setBody('');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await refreshUser();
        router.push(getLoginHref(redirectTo));
        return;
      }

      setErrorMessage(getApiErrorMessage(error, '댓글을 작성하지 못했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!window.confirm('이 댓글을 삭제할까요?')) {
      return;
    }

    setErrorMessage(null);
    setDeletingId(commentId);

    try {
      await deleteComment(slug, commentId);
      setComments((currentComments) =>
        currentComments.filter((comment) => comment.id !== commentId),
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await refreshUser();
        router.push(getLoginHref(redirectTo));
        return;
      }

      setErrorMessage(getApiErrorMessage(error, '댓글을 삭제하지 못했습니다.'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="article-comments">
      <div className="article-comments-head">
        <div>
          <p className="eyebrow">Discussion</p>
          <h2>댓글 {comments.length}</h2>
        </div>
        <button
          type="button"
          className="article-comments-refresh"
          disabled={isLoading}
          onClick={() => void loadComments()}
        >
          Refresh
        </button>
      </div>

      {status === 'loading' ? (
        <div className="comment-auth-skeleton">
          <div className="comment-skeleton comment-skeleton-form" />
          <div className="comment-skeleton comment-skeleton-button" />
        </div>
      ) : status === 'authenticated' ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <label className="form-field" htmlFor="comment">
            <span>Comment</span>
            <textarea
              id="comment"
              name="comment"
              rows={4}
              required
              maxLength={validationLimits.commentBodyMax}
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </label>
          <button
            type="submit"
            className="form-submit form-submit-inline"
            disabled={isSubmitting || body.trim() === ''}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <p className="comment-login-message">
          댓글을 작성하려면{' '}
          <Link href={getLoginHref(redirectTo)}>
            로그인
          </Link>
          이 필요합니다.
        </p>
      )}

      {errorMessage ? (
        <p role="alert" className="form-error comment-error">
          {errorMessage}
        </p>
      ) : null}

      <div className="comment-list">
        {isLoading ? (
          Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="comment-skeleton" />
          ))
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            const canDelete = user?.username === comment.author.username;

            return (
              <article key={comment.id} className="comment-card">
                <div className="comment-card-head">
                  <div>
                    <Link
                      href={`/profile/${encodeURIComponent(comment.author.username)}`}
                      className="comment-author"
                    >
                      {comment.author.username}
                    </Link>
                    <p className="comment-date">{formatDate(comment.createdAt)}</p>
                  </div>
                  {canDelete ? (
                    <button
                      type="button"
                      className="comment-delete"
                      disabled={deletingId === comment.id}
                      onClick={() => void handleDelete(comment.id)}
                    >
                      {deletingId === comment.id ? 'Deleting...' : 'Delete'}
                    </button>
                  ) : null}
                </div>
                <p className="comment-body">{comment.body}</p>
              </article>
            );
          })
        ) : (
          <p className="comment-empty">아직 댓글이 없습니다.</p>
        )}
      </div>
    </section>
  );
}
