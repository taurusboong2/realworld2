import Link from 'next/link';
import type { ReactNode } from 'react';

type AuthFormShellProps = {
  title: string;
  eyebrow: string;
  description: string;
  switchHref: string;
  switchLabel: string;
  switchText: string;
  children: ReactNode;
};

export function AuthFormShell({
  title,
  eyebrow,
  description,
  switchHref,
  switchLabel,
  switchText,
  children,
}: AuthFormShellProps) {
  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-intro">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <p className="auth-switch">
            {switchText}{' '}
            <Link href={switchHref}>{switchLabel}</Link>
          </p>
        </div>

        <div className="auth-panel">{children}</div>
      </section>
    </main>
  );
}
