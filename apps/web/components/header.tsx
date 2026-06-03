'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/use-auth';

const publicLinks = [
  { href: '/articles', label: 'Articles' },
  { href: '/login', label: 'Login' },
  { href: '/register', label: 'Register' },
];

function Logo() {
  return (
    <Link href="/" className="site-logo" aria-label="RealWorld home">
      <span className="site-logo-mark">R</span>
      <span className="site-logo-text">
        Real<span>World</span>
      </span>
    </Link>
  );
}

export function Header() {
  const router = useRouter();
  const { status, user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      router.push('/');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Logo />

        <nav className="site-nav" aria-label="Primary navigation">
          {status === 'loading' ? (
            <span className="site-nav-skeleton" aria-label="Loading user" />
          ) : user ? (
            <>
              <Link href="/articles" className="site-nav-link">
                Articles
              </Link>
              <Link href="/article/create" className="site-nav-link">
                New Article
              </Link>
              <Link href="/settings" className="site-nav-link">
                Settings
              </Link>
              <Link
                href={`/profile/${encodeURIComponent(user.username)}`}
                className="site-nav-link site-nav-link-active"
              >
                {user.username}
              </Link>
              <button
                type="button"
                className="site-nav-button"
                disabled={isLoggingOut}
                onClick={handleLogout}
              >
                {isLoggingOut ? 'Logging out' : 'Logout'}
              </button>
            </>
          ) : (
            publicLinks.map((link) => (
              <Link key={link.href} href={link.href} className="site-nav-link">
                {link.label}
              </Link>
            ))
          )}
        </nav>
      </div>
    </header>
  );
}
