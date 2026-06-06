import type { Request } from 'express';

export const extractCookieValue = (
  request: Request,
  cookieName: string,
): string | undefined => {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) {
    return undefined;
  }

  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const target = cookies.find((cookie) => cookie.startsWith(`${cookieName}=`));

  if (!target) {
    return undefined;
  }

  try {
    return decodeURIComponent(target.slice(cookieName.length + 1));
  } catch {
    return undefined;
  }
};
