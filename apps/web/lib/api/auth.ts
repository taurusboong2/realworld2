import { apiFetch } from './client';
import type { AuthResponse, LogoutResponse, UsersResponse } from './types';

export type RegisterUserInput = {
  username: string;
  email: string;
  password: string;
};

export type LoginUserInput = {
  email: string;
  password: string;
};

export type UpdateCurrentUserInput = Partial<{
  username: string;
  email: string;
  password: string;
  bio: string;
  image: string;
}>;

export async function getUsers(): Promise<UsersResponse> {
  return apiFetch<UsersResponse>('/users');
}

export async function registerUser(
  user: RegisterUserInput,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/users', {
    method: 'POST',
    body: { user },
  });
}

export async function loginUser(user: LoginUserInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/users/login', {
    method: 'POST',
    body: { user },
  });
}

export async function logoutUser(): Promise<LogoutResponse> {
  return apiFetch<LogoutResponse>('/users/logout', {
    method: 'POST',
  });
}

export async function getCurrentUser(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/user');
}

export async function updateCurrentUser(
  user: UpdateCurrentUserInput,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/user', {
    method: 'PUT',
    body: { user },
  });
}
