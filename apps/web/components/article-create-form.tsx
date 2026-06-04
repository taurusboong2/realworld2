'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { createArticle } from '@/lib/api/articles';
import { getApiErrorMessage } from '@/lib/api/error-message';

const parseTagList = (value: string): string[] => {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag, index, tags) => tag !== '' && tags.indexOf(tag) === index);
};

export function ArticleCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const { article } = await createArticle({
        title: title.trim(),
        description: description.trim(),
        body: body.trim(),
        tagList: parseTagList(tags),
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

      <div className="form-field">
        <label htmlFor="tags">Tags</label>
        <input
          id="tags"
          name="tags"
          type="text"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="react, nestjs, realworld"
        />
      </div>

      {errorMessage ? (
        <p role="alert" className="form-error">
          {errorMessage}
        </p>
      ) : null}

      <button type="submit" className="form-submit form-submit-inline" disabled={isSubmitting}>
        {isSubmitting ? 'Publishing' : 'Publish Article'}
      </button>
    </form>
  );
}
