import type { Request } from 'express';

export type AuthUser = {
  id: number;
};

export type OptionalAuthenticatedRequest = Request & {
  user?: AuthUser;
};

export type AuthenticatedRequest = Request & {
  user: AuthUser;
};
