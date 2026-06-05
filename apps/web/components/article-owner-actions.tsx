'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteArticle } from '@/lib/api/articles';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { useAuth } from '@/lib/auth/use-auth';

type ArticleOwnerActionsProps = {
  slug: string;
  authorUsername: string;
};

export function ArticleOwnerActions({
  slug,
  authorUsername,
}: ArticleOwnerActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (user?.username !== authorUsername) {
    return null;
  }

  const handleDelete = async () => {
    if (!window.confirm('이 게시글을 삭제할까요?')) {
      return;
    }

    setErrorMessage(null);
    setIsDeleting(true);

    try {
      await deleteArticle(slug);
      router.push('/articles');
      router.refresh();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, '게시글을 삭제하지 못했습니다.'));
      setIsDeleting(false);
    }
  };

  return (
    <div className="owner-actions">
      <div className="owner-actions-row">
        <Link href={`/article/${encodeURIComponent(slug)}/edit`}>Edit</Link>
        <button type="button" disabled={isDeleting} onClick={handleDelete}>
          {isDeleting ? 'Deleting' : 'Delete'}
        </button>
      </div>
      {errorMessage ? (
        <p role="alert" className="owner-actions-error">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
