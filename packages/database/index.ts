import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/client";

export * from "./generated/client";

export function createPrismaClient(
  databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db",
) {
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

  return new PrismaClient({ adapter });
}
