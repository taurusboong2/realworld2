import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';

type MockUser = {
  id: number;
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  password: string;
  following: Set<string>;
};

type PublicUser = Omit<MockUser, 'password' | 'following'>;

type MockProfile = {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
};

type MockArticle = {
  slug: string;
  title: string;
  description: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  tagList: string[];
  favorited: boolean;
  favoritesCount: number;
  author: MockProfile;
};

const port = Number(process.env.PLAYWRIGHT_MOCK_API_PORT ?? 3101);
const authCookieName = 'realworld_auth_token';
const users = new Map<string, MockUser>();
const sessions = new Map<string, string>();
const articles = new Map<string, MockArticle>();

const toPublicUser = ({
  password: _password,
  following: _following,
  ...user
}: MockUser): PublicUser => {
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

const findUserByUsername = (username: string) => {
  return Array.from(users.values()).find((user) => user.username === username);
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

const toSlug = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

const toProfile = (
  user: MockUser | undefined,
  currentUser?: MockUser,
): MockProfile => {
  return {
    username: user?.username ?? 'mock_author',
    bio: user?.bio ?? null,
    image: user?.image ?? null,
    following:
      user && currentUser ? currentUser.following.has(user.username) : false,
  };
};

const getSeedArticle = (request: IncomingMessage): MockArticle => {
  const user = getCurrentUser(request);

  return {
    slug: 'mock-e2e-article',
    title: 'Mock E2E Article',
    description: 'A stable article returned by the Playwright mock API.',
    body: 'This article is served by the mock API server.',
    createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
    tagList: ['e2e', 'mock'],
    favorited: false,
    favoritesCount: 0,
    author: toProfile(user),
  };
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
    following: new Set(),
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

const handleUpdateCurrentUser = async (
  request: IncomingMessage,
  response: ServerResponse,
) => {
  const user = getCurrentUser(request);

  if (!user) {
    sendJson(response, 401, { errors: { body: ['unauthorized'] } });
    return;
  }

  const body = await readJsonBody<{
    user?: {
      username?: string;
      email?: string;
      password?: string;
      bio?: string;
      image?: string;
    };
  }>(request);
  const details = body.user ?? {};
  const nextEmail = details.email?.toLowerCase() ?? user.email;
  const usernameOwner = details.username
    ? findUserByUsername(details.username)
    : undefined;
  const emailOwner = users.get(nextEmail);

  if (usernameOwner && usernameOwner.id !== user.id) {
    sendJson(response, 409, { errors: { body: ['username already exists'] } });
    return;
  }

  if (emailOwner && emailOwner.id !== user.id) {
    sendJson(response, 409, { errors: { body: ['email already exists'] } });
    return;
  }

  const previousEmail = user.email;

  if (nextEmail !== previousEmail) {
    users.delete(user.email);
  }

  user.username = details.username ?? user.username;
  user.email = nextEmail;
  user.password = details.password ?? user.password;
  user.bio = details.bio ?? user.bio;
  user.image = details.image ?? user.image;
  users.set(user.email, user);

  if (nextEmail !== previousEmail) {
    for (const [token, email] of sessions) {
      if (email === previousEmail) {
        sessions.set(token, nextEmail);
      }
    }
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
  const url = new URL(request.url ?? '/', `http://localhost:${port}`);
  const tag = url.searchParams.get('tag');
  const author = url.searchParams.get('author');
  const limit = Number(url.searchParams.get('limit') ?? 20);
  const offset = Number(url.searchParams.get('offset') ?? 0);
  const currentArticles = [getSeedArticle(request), ...articles.values()];
  const filteredArticles = currentArticles.filter((article) => {
    return (
      (!tag || article.tagList.includes(tag)) &&
      (!author || article.author.username === author)
    );
  });
  const paginatedArticles = filteredArticles.slice(
    Number.isInteger(offset) && offset > 0 ? offset : 0,
    Number.isInteger(limit) && limit > 0 ? offset + limit : undefined,
  );

  sendJson(response, 200, {
    articles: paginatedArticles,
    articlesCount: filteredArticles.length,
  });
};

const handleFeed = (request: IncomingMessage, response: ServerResponse) => {
  const user = getCurrentUser(request);

  if (!user) {
    sendJson(response, 401, { errors: { body: ['unauthorized'] } });
    return;
  }

  const url = new URL(request.url ?? '/', `http://localhost:${port}`);
  const limit = Number(url.searchParams.get('limit') ?? 20);
  const offset = Number(url.searchParams.get('offset') ?? 0);
  const userArticles = Array.from(articles.values()).filter(
    (article) => article.author.username === user.username,
  );
  const paginatedArticles = userArticles.slice(
    Number.isInteger(offset) && offset > 0 ? offset : 0,
    Number.isInteger(limit) && limit > 0 ? offset + limit : undefined,
  );

  sendJson(response, 200, {
    articles: paginatedArticles,
    articlesCount: userArticles.length,
  });
};

const handleCreateArticle = async (
  request: IncomingMessage,
  response: ServerResponse,
) => {
  const user = getCurrentUser(request);

  if (!user) {
    sendJson(response, 401, { errors: { body: ['unauthorized'] } });
    return;
  }

  const body = await readJsonBody<{
    article?: {
      title?: string;
      description?: string;
      body?: string;
      tagList?: string[];
    };
  }>(request);
  const details = body.article;

  if (!details?.title || !details.description || !details.body) {
    sendJson(response, 422, { errors: { body: ['article is invalid'] } });
    return;
  }

  const now = new Date().toISOString();
  const baseSlug = toSlug(details.title) || `article-${articles.size + 1}`;
  const slug = articles.has(baseSlug)
    ? `${baseSlug}-${articles.size + 1}`
    : baseSlug;
  const article: MockArticle = {
    slug,
    title: details.title,
    description: details.description,
    body: details.body,
    createdAt: now,
    updatedAt: now,
    tagList: details.tagList ?? [],
    favorited: false,
    favoritesCount: 0,
    author: toProfile(user),
  };
  articles.set(slug, article);

  sendJson(response, 201, { article });
};

const handleArticleBySlug = (
  request: IncomingMessage,
  response: ServerResponse,
  slug: string,
) => {
  const article =
    articles.get(slug) ??
    (slug === 'mock-e2e-article' ? getSeedArticle(request) : undefined);

  if (!article) {
    sendJson(response, 404, { errors: { body: ['article not found'] } });
    return;
  }

  sendJson(response, 200, { article });
};

const handleUpdateArticle = async (
  request: IncomingMessage,
  response: ServerResponse,
  slug: string,
) => {
  const user = getCurrentUser(request);
  const article = articles.get(slug);

  if (!user) {
    sendJson(response, 401, { errors: { body: ['unauthorized'] } });
    return;
  }

  if (!article) {
    sendJson(response, 404, { errors: { body: ['article not found'] } });
    return;
  }

  if (article.author.username !== user.username) {
    sendJson(response, 403, { errors: { body: ['forbidden'] } });
    return;
  }

  const body = await readJsonBody<{
    article?: {
      title?: string;
      description?: string;
      body?: string;
    };
  }>(request);
  const details = body.article ?? {};
  const nextTitle = details.title ?? article.title;
  const nextSlug = details.title ? toSlug(details.title) || slug : slug;
  const updatedArticle: MockArticle = {
    ...article,
    slug: nextSlug,
    title: nextTitle,
    description: details.description ?? article.description,
    body: details.body ?? article.body,
    updatedAt: new Date().toISOString(),
  };

  articles.delete(slug);
  articles.set(nextSlug, updatedArticle);
  sendJson(response, 200, { article: updatedArticle });
};

const handleDeleteArticle = (
  request: IncomingMessage,
  response: ServerResponse,
  slug: string,
) => {
  const user = getCurrentUser(request);
  const article = articles.get(slug);

  if (!user) {
    sendJson(response, 401, { errors: { body: ['unauthorized'] } });
    return;
  }

  if (!article) {
    sendJson(response, 404, { errors: { body: ['article not found'] } });
    return;
  }

  if (article.author.username !== user.username) {
    sendJson(response, 403, { errors: { body: ['forbidden'] } });
    return;
  }

  articles.delete(slug);
  response.writeHead(204);
  response.end();
};

const handleComments = (_request: IncomingMessage, response: ServerResponse) => {
  sendJson(response, 200, { comments: [] });
};

const handleTags = (_request: IncomingMessage, response: ServerResponse) => {
  const dynamicTags = Array.from(articles.values()).flatMap(
    (article) => article.tagList,
  );
  const tags = Array.from(new Set(['e2e', 'mock', ...dynamicTags]));

  sendJson(response, 200, { tags });
};

const handleProfile = (
  request: IncomingMessage,
  response: ServerResponse,
  username: string,
) => {
  const user = findUserByUsername(username);

  if (!user) {
    sendJson(response, 404, { errors: { body: ['profile not found'] } });
    return;
  }

  sendJson(response, 200, {
    profile: toProfile(user, getCurrentUser(request)),
  });
};

const handleFollowProfile = (
  request: IncomingMessage,
  response: ServerResponse,
  username: string,
) => {
  const currentUser = getCurrentUser(request);
  const userToFollow = findUserByUsername(username);

  if (!currentUser) {
    sendJson(response, 401, { errors: { body: ['unauthorized'] } });
    return;
  }

  if (!userToFollow) {
    sendJson(response, 404, { errors: { body: ['profile not found'] } });
    return;
  }

  currentUser.following.add(userToFollow.username);
  sendJson(response, 200, { profile: toProfile(userToFollow, currentUser) });
};

const handleUnfollowProfile = (
  request: IncomingMessage,
  response: ServerResponse,
  username: string,
) => {
  const currentUser = getCurrentUser(request);
  const userToUnfollow = findUserByUsername(username);

  if (!currentUser) {
    sendJson(response, 401, { errors: { body: ['unauthorized'] } });
    return;
  }

  if (!userToUnfollow) {
    sendJson(response, 404, { errors: { body: ['profile not found'] } });
    return;
  }

  currentUser.following.delete(userToUnfollow.username);
  sendJson(response, 200, { profile: toProfile(userToUnfollow, currentUser) });
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

    if (route === 'PUT /api/user') {
      void handleUpdateCurrentUser(request, response);
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

    if (route === 'GET /api/articles/feed') {
      handleFeed(request, response);
      return;
    }

    if (route === 'POST /api/articles') {
      void handleCreateArticle(request, response);
      return;
    }

    const articleMatch = url.pathname.match(/^\/api\/articles\/([^/]+)$/);

    if (request.method === 'GET' && articleMatch) {
      handleArticleBySlug(
        request,
        response,
        decodeURIComponent(articleMatch[1]),
      );
      return;
    }

    if (request.method === 'PUT' && articleMatch) {
      void handleUpdateArticle(
        request,
        response,
        decodeURIComponent(articleMatch[1]),
      );
      return;
    }

    if (request.method === 'DELETE' && articleMatch) {
      handleDeleteArticle(
        request,
        response,
        decodeURIComponent(articleMatch[1]),
      );
      return;
    }

    const commentsMatch = url.pathname.match(
      /^\/api\/articles\/([^/]+)\/comments$/,
    );

    if (request.method === 'GET' && commentsMatch) {
      handleComments(request, response);
      return;
    }

    if (route === 'GET /api/tags') {
      handleTags(request, response);
      return;
    }

    const profileMatch = url.pathname.match(/^\/api\/profiles\/([^/]+)$/);

    if (request.method === 'GET' && profileMatch) {
      handleProfile(request, response, decodeURIComponent(profileMatch[1]));
      return;
    }

    const profileFollowMatch = url.pathname.match(
      /^\/api\/profiles\/([^/]+)\/follow$/,
    );

    if (request.method === 'POST' && profileFollowMatch) {
      handleFollowProfile(
        request,
        response,
        decodeURIComponent(profileFollowMatch[1]),
      );
      return;
    }

    if (request.method === 'DELETE' && profileFollowMatch) {
      handleUnfollowProfile(
        request,
        response,
        decodeURIComponent(profileFollowMatch[1]),
      );
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
