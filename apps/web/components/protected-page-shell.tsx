import type { ReactNode } from 'react';

type ProtectedPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function ProtectedPageShell({
  eyebrow,
  title,
  description,
  children,
}: ProtectedPageShellProps) {
  return (
    <main className="protected-page">
      <section className="protected-shell">
        <div className="protected-head">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
