import 'dotenv/config';

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key];

  if (value !== undefined && value !== '') {
    return value;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Missing required environment variable: ${key}`);
};

const parseNumberEnv = (key: string, fallback: string): number => {
  const value = Number(getEnv(key, fallback));

  if (!Number.isFinite(value)) {
    throw new Error(`Invalid number environment variable: ${key}`);
  }

  return value;
};

export const env = {
  port: parseNumberEnv('PORT', '3001'),
  nodeEnv: getEnv('NODE_ENV', 'development'),
  authCookieName: getEnv('AUTH_COOKIE_NAME', 'realworld_auth_token'),
  jwtSecret: getEnv('JWT_SECRET', 'dev-secret-change-me'),
  jwtExpiresInSeconds: parseNumberEnv('JWT_EXPIRES_IN_SECONDS', '604800'),
} as const;

if (env.nodeEnv === 'production' && env.jwtSecret === 'dev-secret-change-me') {
  throw new Error('JWT_SECRET must be set in production');
}
