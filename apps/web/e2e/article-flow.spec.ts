import { expect, test } from '@playwright/test';
import { expectProtectedRouteRedirect } from './utils/auth';
import { toSlug } from './utils/strings';
import { signUp } from './utils/users';

test.describe('article flow', () => {
  test('creates an article and opens its detail page', async ({ page }) => {
    const user = await signUp(page, 'article');
    const title = `Playwright Article ${Date.now().toString(36)}`;
    const slug = toSlug(title);

    await page.goto('/article/create');
    await expect(
      page.getByRole('heading', { name: '새 글 작성' }),
    ).toBeVisible();

    await page.getByLabel('Title').fill(title);
    await page
      .getByLabel('Description')
      .fill('Article creation is covered by Playwright.');
    await page
      .getByLabel('Body')
      .fill('This body is returned by the mock API after article creation.');
    await page.getByLabel('Tags').fill('playwright, e2e');
    await page.getByRole('button', { name: 'Publish Article' }).click();

    const articleDetail = page.locator('.article-detail');

    await expect(page).toHaveURL(`/article/${slug}`);
    await expect(
      articleDetail.getByRole('heading', { name: title }),
    ).toBeVisible();
    await expect(articleDetail.getByText(user.username)).toBeVisible();
    await expect(
      articleDetail.getByText('playwright', { exact: true }),
    ).toBeVisible();
    await expect(articleDetail.getByText('e2e', { exact: true })).toBeVisible();
    await expect(
      articleDetail.getByText('This body is returned by the mock API'),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '댓글 0' }),
    ).toBeVisible();
  });

  test('redirects unauthenticated users from protected routes to login', async ({
    page,
  }) => {
    const protectedRoutes = ['/article/create', '/settings'];

    for (const protectedRoute of protectedRoutes) {
      await expectProtectedRouteRedirect(page, protectedRoute);
    }
  });
});
