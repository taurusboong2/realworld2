import { expect, type Page } from '@playwright/test';
import { toSlug } from './strings';

type CreateArticleInput = {
  title: string;
  description: string;
  body: string;
  tags: string;
};

export const createArticle = async (
  page: Page,
  { title, description, body, tags }: CreateArticleInput,
) => {
  await page.goto('/article/create');
  await page.getByLabel('Title').fill(title);
  await page.getByLabel('Description').fill(description);
  await page.getByLabel('Body').fill(body);
  await page.getByLabel('Tags').fill(tags);
  await page.getByRole('button', { name: 'Publish Article' }).click();
  await expect(page).toHaveURL(`/article/${toSlug(title)}`);
};
