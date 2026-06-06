'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, type ReactNode } from 'react';
import { getLoginHref } from '@/lib/auth/redirect';
import { useAuth } from '@/lib/auth/use-auth';

type RequireAuthProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

function DefaultAuthFallback() {
  return (
    <main className="protected-page protected-page-muted">
      <section className="protected-shell">
        <div className="protected-skeleton protected-skeleton-kicker" />
        <div className="protected-skeleton protected-skeleton-title" />
        <div className="protected-skeleton protected-skeleton-panel" />
      </section>
    </main>
  );
}

export function RequireAuth({
  children,
  fallback = <DefaultAuthFallback />,
}: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status } = useAuth();

  const redirectTo = useMemo(() => {
    const queryString = searchParams.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (status !== 'unauthenticated') {
      return;
    }

    router.replace(getLoginHref(redirectTo));
  }, [redirectTo, router, status]);

  if (status !== 'authenticated') {
    return fallback;
  }

  return children;
}
