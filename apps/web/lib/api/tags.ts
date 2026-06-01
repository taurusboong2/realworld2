import { apiFetch } from './client';
import type { TagListResponse } from './types';

export async function getTags(): Promise<TagListResponse> {
  return apiFetch<TagListResponse>('/tags');
}
