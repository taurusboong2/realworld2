import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArticleEditForm } from '@/components/article-edit-form';
import { ProtectedPageShell } from '@/components/protected-page-shell';
import { RequireAuth } from '@/components/require-auth';
import { getArticle } from '@/lib/api/articles';
import { ApiError } from '@/lib/api/client';
import type { Article } from '@/lib/api/types';

type EditArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
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

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const { slug } = await params;
  const article = await fetchArticle(slug);

  return (
    <Suspense>
      <RequireAuth>
        <ProtectedPageShell
          eyebrow="Editor"
          title="게시글 수정"
          description="제목, 설명, 본문을 수정합니다. 태그 수정은 백엔드 update API가 지원되면 이어서 연결할 수 있습니다."
        >
          <ArticleEditForm article={article} />
        </ProtectedPageShell>
      </RequireAuth>
    </Suspense>
  );
}
