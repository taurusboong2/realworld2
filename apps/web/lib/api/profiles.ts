import { apiFetch } from './client';
import type { ProfileResponse } from './types';

function profilePath(username: string) {
  return `/profiles/${encodeURIComponent(username)}`;
}

export async function getProfile(username: string): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>(profilePath(username));
}

export async function followProfile(
  username: string,
): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>(`${profilePath(username)}/follow`, {
    method: 'POST',
  });
}

export async function unfollowProfile(
  username: string,
): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>(`${profilePath(username)}/follow`, {
    method: 'DELETE',
  });
}
