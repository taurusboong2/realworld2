import { expect, test } from '@playwright/test';
import { expectProtectedRouteRedirect } from './utils/auth';
import { createTestUser } from './utils/users';

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
    await expectProtectedRouteRedirect(page, '/article/create');
  });
});
