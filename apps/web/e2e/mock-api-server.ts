import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

type MockUser = {
  id: number;
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  password: string;
};

type PublicUser = Omit<MockUser, 'password'>;

const port = Number(process.env.PLAYWRIGHT_MOCK_API_PORT ?? 3101);
const authCookieName = 'realworld_auth_token';
const users = new Map<string, MockUser>();
const sessions = new Map<string, string>();

const toPublicUser = ({ password: _password, ...user }: MockUser): PublicUser => {
  return user;
};

const sendJson = (
  response: ServerResponse,
  statusCode: number,
  body: unknown,
  headers: Record<string, string> = {},
) => {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    ...headers,
  });
  response.end(JSON.stringify(body));
};

const readJsonBody = async <T>(request: IncomingMessage): Promise<T> => {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T;
};

const getCookieValue = (request: IncomingMessage, name: string) => {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const targetCookie = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`));

  return targetCookie
    ? decodeURIComponent(targetCookie.slice(name.length + 1))
    : null;
};

const getCurrentUser = (request: IncomingMessage) => {
  const token = getCookieValue(request, authCookieName);
  const email = token ? sessions.get(token) : undefined;

  return email ? users.get(email) : undefined;
};

const createAuthCookie = (token: string) => {
  return `${authCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax`;
};

const clearAuthCookie = () => {
  return `${authCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
};

const createSession = (email: string) => {
  const token = `mock-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2)}`;
  sessions.set(token, email);

  return token;
};

const handleRegister = async (
  request: IncomingMessage,
  response: ServerResponse,
) => {
  const body = await readJsonBody<{
    user?: { username?: string; email?: string; password?: string };
  }>(request);
  const details = body.user;

  if (!details?.username || !details.email || !details.password) {
    sendJson(response, 422, { errors: { body: ['user is invalid'] } });
    return;
  }

  const email = details.email.toLowerCase();

  if (users.has(email)) {
    sendJson(response, 409, { errors: { body: ['user already exists'] } });
    return;
  }

  const user: MockUser = {
    id: users.size + 1,
    username: details.username,
    email,
    password: details.password,
    bio: null,
    image: null,
  };
  users.set(email, user);

  sendJson(response, 201, { user: toPublicUser(user) }, {
    'Set-Cookie': createAuthCookie(createSession(email)),
  });
};

const handleLogin = async (
  request: IncomingMessage,
  response: ServerResponse,
) => {
  const body = await readJsonBody<{
    user?: { email?: string; password?: string };
  }>(request);
  const details = body.user;
  const email = details?.email?.toLowerCase();
  const user = email ? users.get(email) : undefined;

  if (!user || user.password !== details?.password) {
    sendJson(response, 401, { errors: { body: ['invalid credentials'] } });
    return;
  }

  sendJson(response, 200, { user: toPublicUser(user) }, {
    'Set-Cookie': createAuthCookie(createSession(user.email)),
  });
};

const handleCurrentUser = (
  request: IncomingMessage,
  response: ServerResponse,
) => {
  const user = getCurrentUser(request);

  if (!user) {
    sendJson(response, 401, { errors: { body: ['unauthorized'] } });
    return;
  }

  sendJson(response, 200, { user: toPublicUser(user) });
};

const handleLogout = (_request: IncomingMessage, response: ServerResponse) => {
  sendJson(response, 200, { ok: true }, {
    'Set-Cookie': clearAuthCookie(),
  });
};

const handleArticles = (
  request: IncomingMessage,
  response: ServerResponse,
) => {
  const user = getCurrentUser(request);
  const author = {
    username: user?.username ?? 'mock_author',
    bio: null,
    image: null,
    following: false,
  };

  sendJson(response, 200, {
    articles: [
      {
        slug: 'mock-e2e-article',
        title: 'Mock E2E Article',
        description: 'A stable article returned by the Playwright mock API.',
        body: 'This article is served by the mock API server.',
        createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
        updatedAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
        tagList: ['e2e', 'mock'],
        favorited: false,
        favoritesCount: 0,
        author,
      },
    ],
    articlesCount: 1,
  });
};

const handleTags = (_request: IncomingMessage, response: ServerResponse) => {
  sendJson(response, 200, { tags: ['e2e', 'mock'] });
};

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${port}`);
  const route = `${request.method ?? 'GET'} ${url.pathname}`;

  try {
    if (route === 'GET /api') {
      sendJson(response, 200, { status: 'ready' });
      return;
    }

    if (route === 'POST /api/users') {
      void handleRegister(request, response);
      return;
    }

    if (route === 'POST /api/users/login') {
      void handleLogin(request, response);
      return;
    }

    if (route === 'GET /api/user') {
      handleCurrentUser(request, response);
      return;
    }

    if (route === 'POST /api/users/logout') {
      handleLogout(request, response);
      return;
    }

    if (route === 'GET /api/articles') {
      handleArticles(request, response);
      return;
    }

    if (route === 'GET /api/tags') {
      handleTags(request, response);
      return;
    }

    sendJson(response, 404, { errors: { body: ['not found'] } });
  } catch (error) {
    sendJson(response, 500, {
      errors: {
        body: [error instanceof Error ? error.message : 'unknown error'],
      },
    });
  }
});

server.listen(port, () => {
  console.log(`Mock API server listening on http://localhost:${port}`);
});
