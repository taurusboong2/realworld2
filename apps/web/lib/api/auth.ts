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

export const getUsers = async (): Promise<UsersResponse> => {
  return apiFetch<UsersResponse>('/users');
};

export const registerUser = async (
  user: RegisterUserInput,
): Promise<AuthResponse> => {
  return apiFetch<AuthResponse>('/users', {
    method: 'POST',
    body: { user },
  });
};

export const loginUser = async (
  user: LoginUserInput,
): Promise<AuthResponse> => {
  return apiFetch<AuthResponse>('/users/login', {
    method: 'POST',
    body: { user },
  });
};

export const logoutUser = async (): Promise<LogoutResponse> => {
  return apiFetch<LogoutResponse>('/users/logout', {
    method: 'POST',
  });
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
  return apiFetch<AuthResponse>('/user');
};

export const updateCurrentUser = async (
  user: UpdateCurrentUserInput,
): Promise<AuthResponse> => {
  return apiFetch<AuthResponse>('/user', {
    method: 'PUT',
    body: { user },
  });
};
