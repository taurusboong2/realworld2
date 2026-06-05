'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { updateArticle } from '@/lib/api/articles';
import { getApiErrorMessage } from '@/lib/api/error-message';
import type { Article } from '@/lib/api/types';

type ArticleEditFormProps = {
  article: Article;
};

export function ArticleEditForm({ article }: ArticleEditFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(article.title);
  const [description, setDescription] = useState(article.description);
  const [body, setBody] = useState(article.body);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit =
    title.trim() !== '' && description.trim() !== '' && body.trim() !== '';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle || !trimmedDescription || !trimmedBody) {
      setErrorMessage('제목, 설명, 본문을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { article: updatedArticle } = await updateArticle(article.slug, {
        title: trimmedTitle,
        description: trimmedDescription,
        body: trimmedBody,
      });

      router.push(`/article/${encodeURIComponent(updatedArticle.slug)}`);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, '게시글을 수정하지 못했습니다.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="protected-panel article-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          name="description"
          type="text"
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="body">Body</label>
        <textarea
          id="body"
          name="body"
          required
          rows={10}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
      </div>

      {errorMessage ? (
        <p role="alert" className="form-error">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        className="form-submit form-submit-inline"
        disabled={isSubmitting || !canSubmit}
      >
        {isSubmitting ? 'Saving' : 'Save Article'}
      </button>
    </form>
  );
}
