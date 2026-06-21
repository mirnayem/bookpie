#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

if [[ $# -ne 1 ]]; then
  echo "Usage: scripts/restore-postgres.sh path/to/backup.dump" >&2
  exit 1
fi

pg_restore --clean --if-exists --no-owner --no-acl --dbname "$DATABASE_URL" "$1"
