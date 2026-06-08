import { expect, type Page } from '@playwright/test';

const isFeedResponse = (url: string) => {
  return new URL(url).pathname.endsWith('/articles/feed');
};

export const waitForFeedToSettle = async (
  page: Page,
  action?: () => Promise<unknown>,
) => {
  const feedResponse = page.waitForResponse((response) => {
    return (
      response.request().method() === 'GET' &&
      isFeedResponse(response.url()) &&
      response.status() < 500
    );
  });

  if (action) {
    await Promise.all([feedResponse, action()]);
  } else {
    await feedResponse;
  }

  await expect(
    page.getByRole('region', { name: 'Personal feed articles' }),
  ).toHaveAttribute('aria-busy', 'false');
};
