import { apiClient, requestApi } from './client';
import type { ProfileResponse } from './types';

const profilePath = (username: string) => {
  return `/profiles/${encodeURIComponent(username)}`;
};

export const getProfile = async (
  username: string,
): Promise<ProfileResponse> => {
  return requestApi(apiClient.get<ProfileResponse>(profilePath(username)));
};

export const followProfile = async (
  username: string,
): Promise<ProfileResponse> => {
  return requestApi(
    apiClient.post<ProfileResponse>(`${profilePath(username)}/follow`),
  );
};

export const unfollowProfile = async (
  username: string,
): Promise<ProfileResponse> => {
  return requestApi(
    apiClient.delete<ProfileResponse>(`${profilePath(username)}/follow`),
  );
};
