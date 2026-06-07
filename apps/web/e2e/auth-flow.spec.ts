import { expect, test } from '@playwright/test';

const createTestUser = () => {
  const id = Date.now().toString(36);

  return {
    username: `e2e_${id}`,
    email: `e2e_${id}@example.com`,
    password: 'Password123!',
  };
};

test.describe('auth flow', () => {
  test('registers, logs out, and logs back in', async ({ page }) => {
    const user = createTestUser();
    const primaryNavigation = page.getByRole('navigation', {
      name: 'Primary navigation',
    });

    await page.goto('/register');
    await page.getByLabel('Username').fill(user.username);
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: '회원가입' }).click();

    await expect(page).toHaveURL('/');
    await expect(primaryNavigation).toContainText(user.username);

    await page.getByRole('button', { name: 'Logout' }).click();

    await expect(primaryNavigation).toContainText('Login');

    await primaryNavigation.getByRole('link', { name: 'Login' }).click();
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: '로그인' }).click();

    await expect(page).toHaveURL('/');
    await expect(primaryNavigation).toContainText(user.username);
  });

  test('redirects unauthenticated users from protected pages to login', async ({
    page,
  }) => {
    await page.goto('/article/create');

    await expect(page).toHaveURL(/\/login\?redirectTo=%2Farticle%2Fcreate$/);
    await expect(
      page.getByRole('heading', { name: /계정으로 돌아와/ }),
    ).toBeVisible();
  });
});
