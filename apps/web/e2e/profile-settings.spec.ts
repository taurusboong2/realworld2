import { expect, test } from '@playwright/test';
import { signUp } from './utils/users';
import { uniqueId } from './utils/strings';

test.describe('profile settings', () => {
  test('updates profile settings and opens the updated profile', async ({
    page,
  }) => {
    await signUp(page, 'settings');
    const id = uniqueId().replace(/-/g, '');
    const updatedUsername = `updated_${id}`;
    const updatedEmail = `${updatedUsername}@example.com`;
    const updatedBio = `Updated profile bio ${id}`;
    const updatedImage = `https://example.com/avatar-${id}.png`;

    await page.goto('/settings');
    await expect(
      page.getByRole('heading', { name: '프로필과 계정 설정' }),
    ).toBeVisible();

    await page.getByLabel('Username').fill(updatedUsername);
    await page.getByLabel('Email').fill(updatedEmail);
    await page.getByLabel('Image URL').fill(updatedImage);
    await page.getByLabel('Bio').fill(updatedBio);

    await Promise.all([
      page.waitForResponse((response) => {
        return (
          response.request().method() === 'PUT' &&
          new URL(response.url()).pathname.endsWith('/user') &&
          response.status() === 200
        );
      }),
      page.getByRole('button', { name: 'Save Settings' }).click(),
    ]);

    await expect(page).toHaveURL(`/profile/${updatedUsername}`);
    await expect(
      page.getByRole('heading', { name: updatedUsername }),
    ).toBeVisible();
    await expect(page.getByText(updatedBio)).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Primary navigation' }),
    ).toContainText(updatedUsername);
  });

  test('shows validation errors before submitting invalid updates', async ({
    page,
  }) => {
    await signUp(page, 'settings_invalid');

    await page.goto('/settings');
    await page.getByLabel('Image URL').fill('ftp://example.com/avatar.png');
    await page.getByRole('button', { name: 'Save Settings' }).click();

    await expect(
      page.getByText(
        '이미지 URL은 http:// 또는 https://로 시작하는 주소여야 합니다.',
      ),
    ).toBeVisible();
  });
});
