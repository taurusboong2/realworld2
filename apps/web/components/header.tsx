import Link from 'next/link';

type HeaderUser = {
  username: string;
};

type HeaderProps = {
  currentUser?: HeaderUser | null;
};

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

export function Header({ currentUser = null }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Logo />

        <nav className="site-nav" aria-label="Primary navigation">
          {currentUser ? (
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
                href={`/profile/${encodeURIComponent(currentUser.username)}`}
                className="site-nav-link site-nav-link-active"
              >
                {currentUser.username}
              </Link>
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
