import { apiClient, requestApi } from './client';
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
  return requestApi(apiClient.get<UsersResponse>('/users'));
};

export const registerUser = async (
  { username, email, password }: RegisterUserInput,
): Promise<AuthResponse> => {
  return requestApi(
    apiClient.post<AuthResponse>('/users', {
      user: {
        username,
        email,
        password,
      },
    }),
  );
};

export const loginUser = async (
  { email, password }: LoginUserInput,
): Promise<AuthResponse> => {
  return requestApi(
    apiClient.post<AuthResponse>('/users/login', {
      user: {
        email,
        password,
      },
    }),
  );
};

export const logoutUser = async (): Promise<LogoutResponse> => {
  return requestApi(apiClient.post<LogoutResponse>('/users/logout'));
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
  return requestApi(apiClient.get<AuthResponse>('/user'));
};

export const updateCurrentUser = async (
  { username, email, password, bio, image }: UpdateCurrentUserInput,
): Promise<AuthResponse> => {
  return requestApi(
    apiClient.put<AuthResponse>('/user', {
      user: {
        username,
        email,
        password,
        bio,
        image,
      },
    }),
  );
};
