import Link from 'next/link';
import type { ReactNode } from 'react';

type RouteStatusScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
  code?: string;
  children?: ReactNode;
};

export function RouteStatusScreen({
  eyebrow,
  title,
  description,
  code,
  children,
}: RouteStatusScreenProps) {
  return (
    <main className="route-status-page">
      <section className="route-status-shell">
        <div className="route-status-panel">
          <div className="route-status-code">
            <p>{eyebrow}</p>
            <strong>{code ?? '!'}</strong>
          </div>

          <div className="route-status-copy">
            <h1>{title}</h1>
            <p>{description}</p>
            <div className="route-status-actions">
              {children ?? (
                <>
                  <Link href="/articles" className="route-status-primary">
                    Articles
                  </Link>
                  <Link href="/" className="route-status-secondary">
                    Home
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
