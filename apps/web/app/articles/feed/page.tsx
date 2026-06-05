'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { ArticleCard } from '@/components/article-card';
import { ProtectedPageShell } from '@/components/protected-page-shell';
import { RequireAuth } from '@/components/require-auth';
import { getFeed } from '@/lib/api/articles';
import { getApiErrorMessage } from '@/lib/api/error-message';
import type { Article } from '@/lib/api/types';

const pageSize = 10;

function ArticleFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesCount, setArticlesCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const totalPages = Math.max(1, Math.ceil(articlesCount / pageSize));

  useEffect(() => {
    let isActive = true;

    const loadFeed = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getFeed({
          limit: pageSize,
          offset: (currentPage - 1) * pageSize,
        });

        if (!isActive) {
          return;
        }

        setArticles(response.articles);
        setArticlesCount(response.articlesCount);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(getApiErrorMessage(error, '피드를 불러오지 못했습니다.'));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadFeed();

    return () => {
      isActive = false;
    };
  }, [currentPage]);

  return (
    <RequireAuth>
      <ProtectedPageShell
        eyebrow="Personal feed"
        title="팔로잉 피드"
        description="내가 팔로우한 작성자의 게시글을 10개씩 확인합니다."
      >
        <div className="feed-toolbar">
          <Link href="/articles" className="article-list-secondary-action">
            Global Feed
          </Link>
        </div>

        {errorMessage ? (
          <p role="alert" className="form-error">
            {errorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <div className="article-list">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="feed-skeleton" />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="article-list">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="article-empty">
            <p>피드에 표시할 게시글이 없습니다.</p>
            <p>프로필 팔로우 기능이 연결되면 이 피드가 채워집니다.</p>
          </div>
        )}

        <div className="article-list-footer">
          <p>총 {articlesCount}개</p>
          <div className="feed-pager">
            <button
              type="button"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
            >
              Next
            </button>
          </div>
        </div>
      </ProtectedPageShell>
    </RequireAuth>
  );
}

export default function ArticleFeedPage() {
  return (
    <Suspense>
      <ArticleFeed />
    </Suspense>
  );
}
