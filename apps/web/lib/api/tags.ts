import { apiClient, requestApi } from './client';
import type { TagListResponse } from './types';

export const getTags = async (): Promise<TagListResponse> => {
  return requestApi(apiClient.get<TagListResponse>('/tags'));
};
