'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { createArticle } from '@/lib/api/articles';
import { getApiErrorMessage } from '@/lib/api/error-message';
import {
  parseArticleTagList,
  validateArticleTagList,
  validationLimits,
} from '@/lib/validation';

export function ArticleCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
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
      const tagList = parseArticleTagList(tags);
      const tagErrorMessage = validateArticleTagList(tagList);

      if (tagErrorMessage) {
        setErrorMessage(tagErrorMessage);
        return;
      }

      const { article } = await createArticle({
        title: trimmedTitle,
        description: trimmedDescription,
        body: trimmedBody,
        tagList,
      });

      router.push(`/article/${encodeURIComponent(article.slug)}`);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, '게시글을 생성하지 못했습니다.'),
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
          maxLength={validationLimits.articleTitleMax}
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
          maxLength={validationLimits.articleDescriptionMax}
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
          maxLength={validationLimits.articleBodyMax}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="tags">Tags</label>
        <input
          id="tags"
          name="tags"
          type="text"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="react, nestjs, realworld"
          aria-describedby="tags-hint"
        />
        <p id="tags-hint" className="summary-label">
          쉼표로 구분하며 최대 {validationLimits.articleTagCountMax}개, 각{' '}
          {validationLimits.articleTagMax}자 이하입니다.
        </p>
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
        {isSubmitting ? 'Publishing' : 'Publish Article'}
      </button>
    </form>
  );
}
