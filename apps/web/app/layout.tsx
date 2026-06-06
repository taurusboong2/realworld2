import type { Metadata } from 'next';
import { AuthProvider } from '@/components/auth-provider';
import { Header } from '@/components/header';
import './globals.css';

export const metadata: Metadata = {
  title: 'RealWorld2 Dashboard',
  description: 'Next.js dashboard connected to Nest, Prisma, and SQLite.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
