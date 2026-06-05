'use client';

import { useEffect, useState } from 'react';
import {
  favoriteArticle,
  getArticle,
  unfavoriteArticle,
} from '@/lib/api/articles';
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
  const { status, user } = useAuth();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favoritesCount, setFavoritesCount] = useState(initialFavoritesCount);
  const [isPending, setIsPending] = useState(false);

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
      return;
    }

    setIsPending(true);

    try {
      const { article } = favorited
        ? await unfavoriteArticle(slug)
        : await favoriteArticle(slug);

      setFavorited(article.favorited);
      setFavoritesCount(article.favoritesCount);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      className={favorited ? 'favorite-button is-favorited' : 'favorite-button'}
      disabled={status !== 'authenticated' || isPending}
      onClick={handleToggle}
    >
      {favorited ? 'Favorited' : 'Favorite'} {favoritesCount}
    </button>
  );
}
