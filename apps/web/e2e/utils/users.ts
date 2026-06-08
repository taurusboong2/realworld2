import { expect, type Page } from '@playwright/test';
import { uniqueId } from './strings';

export type TestUser = {
  username: string;
  email: string;
  password: string;
};

export const createTestUser = (prefix = 'e2e'): TestUser => {
  const id = uniqueId();

  return {
    username: `${prefix}_${id}`,
    email: `${prefix}_${id}@example.com`,
    password: 'Password123!',
  };
};

export const signUp = async (page: Page, prefix = 'e2e') => {
  const user = createTestUser(prefix);

  await page.goto('/register');
  await page.getByLabel('Username').fill(user.username);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: '회원가입' }).click();
  await expect(page).toHaveURL('/');

  return user;
};
