import path from 'node:path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@repo/database';

const databaseUrl = `file:${path.resolve(
  __dirname,
  '../../../../packages/database/dev.db',
)}`;
const globalPrisma = globalThis as typeof globalThis & {
  realworldPrisma?: PrismaClient;
};

const prisma =
  globalPrisma.realworldPrisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: databaseUrl,
    }),
  });

globalPrisma.realworldPrisma = prisma;

export { prisma };
