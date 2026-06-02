import axios, { AxiosError, type AxiosResponse } from 'axios';

export class ApiError extends Error {
  status: number;
  response: unknown;

  constructor(message: string, status: number, response: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

const browserApiBaseUrl = '/api/nest';
const serverApiBaseUrl = `${process.env.NEST_API_URL ?? 'http://localhost:3001'}/api`;

export const apiClient = axios.create({
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

const getApiBaseUrl = () => {
  return typeof window === 'undefined' ? serverApiBaseUrl : browserApiBaseUrl;
};

const toApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    return new ApiError(
      error.message,
      error.response?.status ?? 0,
      error.response?.data ?? null,
    );
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 0, null);
  }

  return new ApiError('Unknown API error', 0, null);
};

export const requestApi = async <T>(
  request: Promise<AxiosResponse<T>>,
): Promise<T> => {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
};

apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
});
