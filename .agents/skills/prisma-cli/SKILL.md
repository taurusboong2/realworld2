---
name: prisma-cli-sqlite
description: Prisma CLI commands reference optimized for SQLite. Use when running Prisma CLI commands, setting up SQLite projects, generating client, running migrations, or starting Prisma Studio. Triggers on "prisma init", "prisma generate", "prisma migrate", "prisma db", "prisma studio".
license: MIT
metadata:
  author: prisma
  version: "7.6.0"
---

# Prisma CLI Reference (SQLite Optimized)

## Command Categories

| Category | Commands | Purpose |
|----------|----------|---------|
| Setup | `init` | Bootstrap new SQLite Prisma project |
| Generation | `generate` | Generate Prisma Client |
| Validation | `validate`, `format` | Schema validation and formatting |
| Database | `db pull`, `db push`, `db seed` | Direct SQLite operations |
| Migrations | `migrate dev`, `migrate deploy`, `migrate reset`, `migrate status` | Schema migrations |
| Utility | `studio`, `version`, `debug` | Development GUI and debugging |

---

## Quick Reference

### Project Setup & Validation
```bash
# Initialize project with SQLite provider
prisma init --datasource-provider sqlite

# Validate & Format schema
prisma validate
prisma format