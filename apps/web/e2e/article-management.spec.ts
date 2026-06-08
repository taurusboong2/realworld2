import { expect, test } from '@playwright/test';
import { createArticle } from './utils/articles';
import { waitForFeedToSettle } from './utils/feed';
import { toSlug, uniqueId } from './utils/strings';
import { signUp } from './utils/users';

test.describe('article management', () => {
  test('updates and deletes an owned article', async ({ page }) => {
    await signUp(page, 'manage');
    const title = `Managed Article ${Date.now().toString(36)}`;
    const updatedTitle = `${title} Updated`;

    await createArticle(page, {
      title,
      description: 'Original article description.',
      body: 'Original article body.',
      tags: 'manage, e2e',
    });

    const articleDetail = page.locator('.article-detail');

    await articleDetail.getByRole('link', { name: 'Edit' }).click();
    await expect(
      page.getByRole('heading', { name: '게시글 수정' }),
    ).toBeVisible();
    await page.getByLabel('Title').fill(updatedTitle);
    await page.getByLabel('Description').fill('Updated article description.');
    await page.getByLabel('Body').fill('Updated article body.');
    await page.getByRole('button', { name: 'Save Article' }).click();

    await expect(page).toHaveURL(`/article/${toSlug(updatedTitle)}`);
    await expect(
      articleDetail.getByRole('heading', { name: updatedTitle }),
    ).toBeVisible();
    await expect(articleDetail.getByText('Updated article body.')).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await articleDetail.getByRole('button', { name: 'Delete' }).click();

    await expect(page).toHaveURL('/articles');
    await expect(page.getByRole('heading', { name: '게시글 목록' })).toBeVisible();
    await expect(page.getByText(updatedTitle)).toHaveCount(0);
  });

  test('navigates global feed, tag filtering, and personal feed', async ({
    page,
  }) => {
    await signUp(page, 'feed');
    const id = uniqueId();
    const title = `Feed Navigation Article ${id}`;
    const tag = `navtag${id.replace(/-/g, '')}`;

    await createArticle(page, {
      title,
      description: 'Feed navigation article description.',
      body: 'Feed navigation article body.',
      tags: `${tag}, e2e`,
    });

    await page.goto('/articles');
    await expect(page.getByRole('heading', { name: '게시글 목록' })).toBeVisible();
    await expect(page.getByRole('link', { name: title })).toBeVisible();

    await page.getByRole('link', { name: tag, exact: true }).first().click();

    await expect(page).toHaveURL(`/articles?tag=${tag}`);
    await expect(page.getByText(`"${tag}" 태그의 게시글`)).toBeVisible();
    await expect(page.getByRole('link', { name: title })).toBeVisible();

    await waitForFeedToSettle(page, async () => {
      await page.getByRole('link', { name: 'Your Feed' }).click();
    });
    await expect(page).toHaveURL('/articles/feed');
    await expect(
      page.getByRole('heading', { name: '팔로잉 피드' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: title })).toBeVisible();

    await page.getByRole('link', { name: 'Global Feed' }).click();
    await expect(page).toHaveURL('/articles');
  });
});
