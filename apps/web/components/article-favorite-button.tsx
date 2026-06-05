'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  favoriteArticle,
  getArticle,
  unfavoriteArticle,
} from '@/lib/api/articles';
import { ApiError } from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { getLoginHref } from '@/lib/auth/redirect';
import { useAuth } from '@/lib/auth/use-auth';

type ArticleFavoriteButtonProps = {
  slug: string;
  initialFavorited: boolean;
  initialFavoritesCount: number;
};

export function ArticleFavoriteButton({
  slug,
  initialFavorited,
  initialFavoritesCount,
}: ArticleFavoriteButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status, user, refreshUser } = useAuth();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favoritesCount, setFavoritesCount] = useState(initialFavoritesCount);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const queryString = searchParams.toString();
  const redirectTo = queryString ? `${pathname}?${queryString}` : pathname;

  useEffect(() => {
    if (status !== 'authenticated' || !user) {
      setFavorited(initialFavorited);
      setFavoritesCount(initialFavoritesCount);
      return;
    }

    let isActive = true;

    const loadArticleState = async () => {
      try {
        const { article } = await getArticle(slug);

        if (!isActive) {
          return;
        }

        setFavorited(article.favorited);
        setFavoritesCount(article.favoritesCount);
      } catch {
        if (!isActive) {
          return;
        }

        setFavorited(initialFavorited);
        setFavoritesCount(initialFavoritesCount);
      }
    };

    void loadArticleState();

    return () => {
      isActive = false;
    };
  }, [initialFavorited, initialFavoritesCount, slug, status, user]);

  const handleToggle = async () => {
    if (status !== 'authenticated') {
      router.push(getLoginHref(redirectTo));
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    try {
      const { article } = favorited
        ? await unfavoriteArticle(slug)
        : await favoriteArticle(slug);

      setFavorited(article.favorited);
      setFavoritesCount(article.favoritesCount);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await refreshUser();
        router.push(getLoginHref(redirectTo));
        return;
      }

      setErrorMessage(
        getApiErrorMessage(error, '좋아요 상태를 변경하지 못했습니다.'),
      );
    } finally {
      setIsPending(false);
    }
  };

  if (status === 'loading') {
    return (
      <button type="button" className="favorite-button" disabled>
        Favorite {favoritesCount}
      </button>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Link href={getLoginHref(redirectTo)} className="favorite-button">
        Login to favorite {favoritesCount}
      </Link>
    );
  }

  return (
    <div className="favorite-control">
      <button
        type="button"
        className={favorited ? 'favorite-button is-favorited' : 'favorite-button'}
        disabled={status !== 'authenticated' || isPending}
        onClick={handleToggle}
      >
        {favorited ? 'Favorited' : 'Favorite'} {favoritesCount}
      </button>
      {errorMessage ? (
        <p role="alert" className="favorite-error">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
