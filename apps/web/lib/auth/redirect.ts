const fallbackRedirectPath = '/';

const authPaths = ['/login', '/register'];

export const getSafeRedirectPath = (value: string | null) => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return fallbackRedirectPath;
  }

  const isAuthPath = authPaths.some((path) => {
    return value === path || value.startsWith(`${path}?`);
  });

  return isAuthPath ? fallbackRedirectPath : value;
};

export const getLoginHref = (redirectTo: string) => {
  const safeRedirectTo = getSafeRedirectPath(redirectTo);

  if (safeRedirectTo === fallbackRedirectPath) {
    return '/login';
  }

  return `/login?redirectTo=${encodeURIComponent(safeRedirectTo)}`;
};

export const getRegisterHref = (redirectTo: string) => {
  const safeRedirectTo = getSafeRedirectPath(redirectTo);

  if (safeRedirectTo === fallbackRedirectPath) {
    return '/register';
  }

  return `/register?redirectTo=${encodeURIComponent(safeRedirectTo)}`;
};
