import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from './client/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;

const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`,
});

export const db = new PrismaClient({ adapter } as any);

export * from './client/index.js';
