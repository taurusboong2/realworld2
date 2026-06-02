import { apiFetch } from './client';
import type { ProfileResponse } from './types';

const profilePath = (username: string) => {
  return `/profiles/${encodeURIComponent(username)}`;
};

export const getProfile = async (
  username: string,
): Promise<ProfileResponse> => {
  return apiFetch<ProfileResponse>(profilePath(username));
};

export const followProfile = async (
  username: string,
): Promise<ProfileResponse> => {
  return apiFetch<ProfileResponse>(`${profilePath(username)}/follow`, {
    method: 'POST',
  });
};

export const unfollowProfile = async (
  username: string,
): Promise<ProfileResponse> => {
  return apiFetch<ProfileResponse>(`${profilePath(username)}/follow`, {
    method: 'DELETE',
  });
};
