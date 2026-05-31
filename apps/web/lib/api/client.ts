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

type ApiFetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

const browserApiBaseUrl = '/api/nest';
const serverApiBaseUrl = `${process.env.NEST_API_URL ?? 'http://localhost:3001'}/api`;

function getApiBaseUrl() {
  return typeof window === 'undefined' ? serverApiBaseUrl : browserApiBaseUrl;
}

function buildUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${getApiBaseUrl()}${normalizedPath}`;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text) as unknown;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, headers, ...init } = options;

  const response = await fetch(buildUrl(path), {
    ...init,
    credentials: 'include',
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await readJson(response);

  if (!response.ok) {
    throw new ApiError(response.statusText, response.status, data);
  }

  return data as T;
}
