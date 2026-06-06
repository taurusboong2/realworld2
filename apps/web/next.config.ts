import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  transpilePackages: ['@repo/database'],
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/adapter-better-sqlite3',
    'better-sqlite3',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    const nestApiUrl = process.env.NEST_API_URL ?? 'http://localhost:3001';

    return [
      {
        source: '/api/nest/:path*',
        destination: `${nestApiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
