import { Suspense } from 'react';
import { ArticleCreateForm } from '@/components/article-create-form';
import { ProtectedPageShell } from '@/components/protected-page-shell';
import { RequireAuth } from '@/components/require-auth';

export default function CreateArticlePage() {
  return (
    <Suspense>
      <RequireAuth>
        <ProtectedPageShell
          eyebrow="Editor"
          title="새 글 작성"
          description="인증된 사용자만 접근할 수 있는 글 작성 화면입니다. 이후 article create API와 연결하면 게시글을 발행할 수 있습니다."
        >
          <ArticleCreateForm />
        </ProtectedPageShell>
      </RequireAuth>
    </Suspense>
  );
}
