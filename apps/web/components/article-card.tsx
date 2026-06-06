'use client';

import Link from 'next/link';
import { ArticleFavoriteButton } from '@/components/article-favorite-button';
import type { Article } from '@/lib/api/types';

type ArticleCardProps = {
  article: Article;
};

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
  }).format(new Date(value));
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="article-card">
      <div className="article-card-head">
        <div className="article-card-main">
          <p className="eyebrow">{article.author.username}</p>
          <h2>
            <Link href={`/article/${encodeURIComponent(article.slug)}`}>
              {article.title}
            </Link>
          </h2>
          <p>{article.description}</p>
        </div>
        <ArticleFavoriteButton
          slug={article.slug}
          initialFavorited={article.favorited}
          initialFavoritesCount={article.favoritesCount}
        />
      </div>

      <div className="article-card-meta">
        <p>{formatDate(article.createdAt)}</p>
        {article.tagList.length > 0 ? (
          <ul className="tag-list">
            {article.tagList.map((tag) => (
              <li key={tag} className="tag-list-link-item">
                <Link
                  href={`/articles?tag=${encodeURIComponent(tag)}`}
                  className="tag-list-link"
                >
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
