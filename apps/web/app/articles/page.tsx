import Link from 'next/link';
import { getArticles } from '@/lib/api/articles';
import type { Article } from '@/lib/api/types';

const pageSize = 10;

type ArticlesPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

const parsePage = (value: string | undefined) => {
  if (!value) {
    return 1;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
};

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
  }).format(new Date(value));
};

const getArticlePageHref = (page: number) => {
  return page === 1 ? '/articles' : `/articles?page=${page}`;
};

const getVisiblePages = (currentPage: number, totalPages: number) => {
  const firstPage = 1;
  const lastPage = totalPages;
  const startPage = Math.max(firstPage, currentPage - 2);
  const endPage = Math.min(lastPage, currentPage + 2);
  const pages = new Set<number>([firstPage, lastPage]);

  for (let page = startPage; page <= endPage; page += 1) {
    pages.add(page);
  }

  return Array.from(pages).sort((a, b) => a - b);
};

function ArticleCard({ article }: { article: Article }) {
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
        <div className="article-favorite-count">
          <p className="summary-label">Favorites</p>
          <p>{article.favoritesCount}</p>
        </div>
      </div>

      <div className="article-card-meta">
        <p>{formatDate(article.createdAt)}</p>
        {article.tagList.length > 0 ? (
          <ul className="tag-list">
            {article.tagList.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav className="pagination" aria-label="Article pagination">
      {pages.map((page, index) => {
        const isCurrent = page === currentPage;
        const previousPage = pages[index - 1];
        const hasGap = previousPage !== undefined && page - previousPage > 1;

        return (
          <div key={page} className="pagination-item">
            {hasGap ? <span className="pagination-gap">...</span> : null}
            <Link
              href={getArticlePageHref(page)}
              aria-current={isCurrent ? 'page' : undefined}
              className={
                isCurrent ? 'pagination-link is-current' : 'pagination-link'
              }
            >
              {page}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { page } = await searchParams;
  const currentPage = parsePage(page);
  const offset = (currentPage - 1) * pageSize;
  const { articles, articlesCount } = await getArticles({
    limit: pageSize,
    offset,
  });
  const totalPages = Math.max(1, Math.ceil(articlesCount / pageSize));

  return (
    <main className="article-list-page">
      <section className="article-list-shell">
        <div className="article-list-head">
          <div>
            <p className="eyebrow">Global feed</p>
            <h1>게시글 목록</h1>
            <p>최신 게시글을 10개씩 확인합니다.</p>
          </div>
          <Link href="/article/create" className="article-list-action">
            New Article
          </Link>
        </div>

        {articles.length > 0 ? (
          <div className="article-list">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="article-empty">
            <p>아직 게시글이 없습니다.</p>
            <p>첫 게시글을 작성하면 이 목록에 표시됩니다.</p>
          </div>
        )}

        <div className="article-list-footer">
          <p>총 {articlesCount}개</p>
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      </section>
    </main>
  );
}
