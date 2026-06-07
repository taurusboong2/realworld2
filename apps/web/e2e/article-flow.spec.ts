import { expect, test, type Page } from '@playwright/test';

const createTestUser = () => {
  const id = Date.now().toString(36);

  return {
    username: `article_${id}`,
    email: `article_${id}@example.com`,
    password: 'Password123!',
  };
};

const signUp = async (page: Page) => {
  const user = createTestUser();

  await page.goto('/register');
  await page.getByLabel('Username').fill(user.username);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: '회원가입' }).click();
  await expect(page).toHaveURL('/');

  return user;
};

test.describe('article flow', () => {
  test('creates an article and opens its detail page', async ({ page }) => {
    const user = await signUp(page);
    const title = `Playwright Article ${Date.now().toString(36)}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

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
      await page.goto(protectedRoute);

      await expect(page).toHaveURL(
        `/login?redirectTo=${encodeURIComponent(protectedRoute)}`,
      );
      await expect(
        page.getByRole('heading', { name: /계정으로 돌아와/ }),
      ).toBeVisible();
    }
  });
});
