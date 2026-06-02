import { apiFetch } from './client';
import type { TagListResponse } from './types';

export const getTags = async (): Promise<TagListResponse> => {
  return apiFetch<TagListResponse>('/tags');
};
