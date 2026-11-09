#!/bin/sh
# Full backup of the production database (schema + data of the `public` schema).
# Run before EVERY migration and regularly. Output goes to backups/ (gitignored — contains real data).
#
# Requires:
#   - pg_dump (macOS: `brew install libpq && brew link --force libpq`), version >= the server's Postgres
#   - .env.db with DATABASE_URL (see .env.db.example)
#
# Restore (only with a clear reason, never over live data without a fresh backup):
#   pg_restore --no-owner --no-privileges -d "$DATABASE_URL" backups/<file>.dump
set -eu

cd "$(dirname "$0")/.."

if [ ! -f .env.db ]; then
  echo "Missing .env.db — copy .env.db.example and fill in DATABASE_URL." >&2
  exit 1
fi

DATABASE_URL=$(grep -E '^DATABASE_URL=' .env.db | head -n1 | cut -d= -f2-)
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is empty in .env.db." >&2
  exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump not found. macOS: brew install libpq && brew link --force libpq" >&2
  exit 1
fi

mkdir -p backups
FILE="backups/oblacek-$(date +%Y-%m-%d_%H%M%S).dump"

# Read-only: pg_dump never modifies the database.
pg_dump "$DATABASE_URL" \
  --schema=public \
  --no-owner \
  --no-privileges \
  --format=custom \
  --file="$FILE"

echo "Backup saved: $FILE ($(du -h "$FILE" | cut -f1))"
