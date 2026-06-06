'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { updateArticle } from '@/lib/api/articles';
import { getApiErrorMessage } from '@/lib/api/error-message';
import type { Article } from '@/lib/api/types';
import {
  validateMaxLength,
  validateRequiredFields,
  validationLimits,
} from '@/lib/validation';

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedBody = body.trim();
    const validationMessage =
      validateRequiredFields([
        { label: '제목을', value: trimmedTitle },
        { label: '요약을', value: trimmedDescription },
        { label: '본문을', value: trimmedBody },
      ]) ??
      validateMaxLength('제목은', trimmedTitle, validationLimits.articleTitleMax) ??
      validateMaxLength(
        '요약은',
        trimmedDescription,
        validationLimits.articleDescriptionMax,
      ) ??
      validateMaxLength('본문은', trimmedBody, validationLimits.articleBodyMax);

    if (validationMessage) {
      setErrorMessage(validationMessage);
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
    <form
      className="protected-panel article-form"
      noValidate
      onSubmit={handleSubmit}
    >
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

      {errorMessage ? (
        <p role="alert" className="form-error">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        className="form-submit form-submit-inline"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving' : 'Save Article'}
      </button>
    </form>
  );
}
