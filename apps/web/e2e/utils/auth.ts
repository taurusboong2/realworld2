import { expect, type Page } from '@playwright/test';

const isCurrentUserResponse = (url: string) => {
  return new URL(url).pathname.endsWith('/user');
};

export const expectProtectedRouteRedirect = async (
  page: Page,
  protectedRoute: string,
) => {
  await Promise.all([
    page.waitForResponse((response) => {
      return (
        response.request().method() === 'GET' &&
        isCurrentUserResponse(response.url()) &&
        response.status() === 401
      );
    }),
    page.goto(protectedRoute),
  ]);

  await expect(page).toHaveURL(
    `/login?redirectTo=${encodeURIComponent(protectedRoute)}`,
  );
  await expect(
    page.getByRole('heading', { name: /계정으로 돌아와/ }),
  ).toBeVisible();
};
