import { notFound } from 'next/navigation';
import { getArticle } from '@/lib/api/articles';
import { ApiError } from '@/lib/api/client';
import type { Article } from '@/lib/api/types';

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const fetchArticle = async (slug: string): Promise<Article> => {
  try {
    const { article } = await getArticle(slug);
    return article;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await fetchArticle(slug);

  return (
    <main className="article-detail-page">
      <article className="article-detail">
        <header className="article-detail-head">
          <p className="eyebrow">{article.author.username}</p>
          <h1>{article.title}</h1>
          <p className="article-detail-description">{article.description}</p>
          <p className="article-detail-date">{formatDate(article.createdAt)}</p>
        </header>

        {article.tagList.length > 0 ? (
          <ul className="tag-list">
            {article.tagList.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        ) : null}

        <div className="article-body">{article.body}</div>
      </article>
    </main>
  );
}
