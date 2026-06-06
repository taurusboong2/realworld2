import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "prisma/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseUrl =
  process.env["DATABASE_URL"] ?? `file:${path.resolve(__dirname, "dev.db")}`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
