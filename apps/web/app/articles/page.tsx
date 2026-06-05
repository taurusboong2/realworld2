import Link from 'next/link';
import { ArticleCard } from '@/components/article-card';
import { getArticles } from '@/lib/api/articles';
import { getTags } from '@/lib/api/tags';

const pageSize = 10;

type ArticlesPageProps = {
  searchParams: Promise<{
    page?: string;
    tag?: string;
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

const normalizeTag = (value: string | undefined) => {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
};

const getArticlesHref = ({
  page,
  tag,
}: {
  page?: number;
  tag?: string;
}) => {
  const params = new URLSearchParams();

  if (tag) {
    params.set('tag', tag);
  }

  if (page && page > 1) {
    params.set('page', String(page));
  }

  const query = params.toString();

  return query ? `/articles?${query}` : '/articles';
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

function Pagination({
  currentPage,
  totalPages,
  selectedTag,
}: {
  currentPage: number;
  totalPages: number;
  selectedTag?: string;
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
              href={getArticlesHref({ page, tag: selectedTag })}
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

function TagFilter({
  tags,
  selectedTag,
}: {
  tags: string[];
  selectedTag?: string;
}) {
  const sortedTags = [...tags].sort((a, b) => a.localeCompare(b));

  return (
    <aside className="tag-filter">
      <div className="tag-filter-head">
        <div>
          <p className="eyebrow">Tags</p>
          <h2>태그 필터</h2>
        </div>
        {selectedTag ? (
          <Link href="/articles" className="tag-filter-clear">
            Clear
          </Link>
        ) : null}
      </div>

      <div className="tag-filter-list">
        <Link
          href="/articles"
          aria-current={!selectedTag ? 'page' : undefined}
          className={!selectedTag ? 'tag-filter-link is-active' : 'tag-filter-link'}
        >
          All
        </Link>
        {sortedTags.map((tag) => {
          const isSelected = tag === selectedTag;

          return (
            <Link
              key={tag}
              href={getArticlesHref({ tag })}
              aria-current={isSelected ? 'page' : undefined}
              className={
                isSelected ? 'tag-filter-link is-active' : 'tag-filter-link'
              }
            >
              {tag}
            </Link>
          );
        })}
      </div>

      {sortedTags.length === 0 ? (
        <p className="tag-filter-empty">아직 등록된 태그가 없습니다.</p>
      ) : null}
    </aside>
  );
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { page, tag } = await searchParams;
  const currentPage = parsePage(page);
  const selectedTag = normalizeTag(tag);
  const offset = (currentPage - 1) * pageSize;
  const [{ articles, articlesCount }, { tags }] = await Promise.all([
    getArticles({
      limit: pageSize,
      offset,
      tag: selectedTag,
    }),
    getTags(),
  ]);
  const totalPages = Math.max(1, Math.ceil(articlesCount / pageSize));

  return (
    <main className="article-list-page">
      <section className="article-list-shell">
        <div className="article-list-head">
          <div>
            <p className="eyebrow">Global feed</p>
            <h1>게시글 목록</h1>
            <p>
              {selectedTag
                ? `"${selectedTag}" 태그의 게시글을 10개씩 확인합니다.`
                : '최신 게시글을 10개씩 확인합니다.'}
            </p>
          </div>
          <div className="article-list-actions">
            <Link href="/article/create" className="article-list-action">
              New Article
            </Link>
            <Link href="/articles/feed" className="article-list-secondary-action">
              Your Feed
            </Link>
          </div>
        </div>

        <div className="article-list-layout">
          <div className="article-list-main">
            {articles.length > 0 ? (
              <div className="article-list">
                {articles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            ) : (
              <div className="article-empty">
                <p>
                  {selectedTag
                    ? '해당 태그의 게시글이 없습니다.'
                    : '아직 게시글이 없습니다.'}
                </p>
                <p>
                  {selectedTag
                    ? '다른 태그를 선택하거나 전체 게시글로 돌아가세요.'
                    : '첫 게시글을 작성하면 이 목록에 표시됩니다.'}
                </p>
              </div>
            )}
          </div>

          <TagFilter tags={tags} selectedTag={selectedTag} />
        </div>

        <div className="article-list-footer">
          <p>총 {articlesCount}개</p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            selectedTag={selectedTag}
          />
        </div>
      </section>
    </main>
  );
}
