import { ApiError } from '@/lib/api/client';

type ErrorRecord = Record<string, unknown>;

const isErrorRecord = (value: unknown): value is ErrorRecord => {
  return typeof value === 'object' && value !== null;
};

const readMessage = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    const messages = value
      .map((item) => readMessage(item))
      .filter((item): item is string => item !== null);

    return messages.length > 0 ? messages.join(', ') : null;
  }

  if (isErrorRecord(value)) {
    const nestedMessages = Object.entries(value)
      .map(([key, nestedValue]) => {
        const message = readMessage(nestedValue);
        return message ? `${key} ${message}` : null;
      })
      .filter((item): item is string => item !== null);

    return nestedMessages.length > 0 ? nestedMessages.join(', ') : null;
  }

  return null;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = '요청을 처리하지 못했습니다.',
): string => {
  if (error instanceof ApiError) {
    if (isErrorRecord(error.response)) {
      const errors = readMessage(error.response.errors);
      const message = readMessage(error.response.message);
      return errors ?? message ?? error.message ?? fallback;
    }

    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
