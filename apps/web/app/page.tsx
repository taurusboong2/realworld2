import Link from 'next/link';
import { ArticleCard } from '@/components/article-card';
import { getArticles } from '@/lib/api/articles';
import { getServerApiHeaders } from '@/lib/api/server-headers';
import { getTags } from '@/lib/api/tags';
import type { Article } from '@/lib/api/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const homeFeedLimit = 6;

const getUniqueAuthorCount = (articles: Article[]) => {
  return new Set(articles.map((article) => article.author.username)).size;
};

const getFeaturedTags = (tags: string[]) => {
  return [...tags].sort((a, b) => a.localeCompare(b)).slice(0, 18);
};

export default async function Home() {
  const serverApiHeaders = await getServerApiHeaders();
  const [{ articles, articlesCount }, { tags }] = await Promise.all([
    getArticles(
      {
        limit: homeFeedLimit,
        offset: 0,
      },
      { headers: serverApiHeaders },
    ),
    getTags(),
  ]);
  const featuredTags = getFeaturedTags(tags);
  const uniqueAuthorCount = getUniqueAuthorCount(articles);

  return (
    <main className="page">
      <section className="shell">
        <div className="hero">
          <div>
            <p className="eyebrow">Global feed</p>
            <h1>RealWorld 최신 게시글을 바로 확인하세요</h1>
            <p>
              Nest API에서 가져온 게시글, 태그, 요약 지표를 한 화면에 모아
              보여줍니다. 관심 있는 태그를 고르거나 전체 피드로 이동해 더 많은
              글을 탐색할 수 있습니다.
            </p>
          </div>
          <div className="home-actions" aria-label="Primary actions">
            <Link href="/article/create" className="article-list-action">
              New Article
            </Link>
            <Link href="/articles" className="article-list-secondary-action">
              View All
            </Link>
          </div>
        </div>

        <section className="home-stats" aria-label="Summary statistics">
          <article className="home-stat">
            <p className="metric-label">Articles</p>
            <p className="home-stat-value">{articlesCount}</p>
          </article>
          <article className="home-stat">
            <p className="metric-label">Tags</p>
            <p className="home-stat-value">{tags.length}</p>
          </article>
          <article className="home-stat">
            <p className="metric-label">Authors in latest feed</p>
            <p className="home-stat-value">{uniqueAuthorCount}</p>
          </article>
        </section>

        <div className="home-layout">
          <section className="home-feed" aria-labelledby="home-feed-title">
            <div className="home-section-head">
              <div>
                <p className="eyebrow">Latest</p>
                <h2 id="home-feed-title">최근 게시글</h2>
              </div>
              <Link href="/articles" className="home-section-link">
                전체 보기
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
                <p>첫 게시글을 작성하면 홈 피드에 표시됩니다.</p>
              </div>
            )}
          </section>

          <aside className="home-sidebar" aria-labelledby="home-tags-title">
            <div className="tag-filter">
              <div className="tag-filter-head">
                <div>
                  <p className="eyebrow">Tags</p>
                  <h2 id="home-tags-title">인기 태그</h2>
                </div>
              </div>

              {featuredTags.length > 0 ? (
                <div className="tag-filter-list">
                  {featuredTags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/articles?tag=${encodeURIComponent(tag)}`}
                      className="tag-filter-link"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="tag-filter-empty">아직 등록된 태그가 없습니다.</p>
              )}
            </div>

            <section className="summary-panel">
              <p className="card-kicker">Overview</p>
              <h2>피드 요약</h2>
              <p className="summary-copy">
                홈에서는 최신 {homeFeedLimit}개 게시글을 먼저 보여주고, 전체
                목록에서는 태그 필터와 페이지네이션으로 게시글을 탐색합니다.
              </p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
