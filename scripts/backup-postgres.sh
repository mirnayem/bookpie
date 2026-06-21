#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$BACKUP_DIR"

pg_dump "$DATABASE_URL" --format=custom --no-owner --no-acl > "$BACKUP_DIR/bookpie-$TIMESTAMP.dump"
echo "$BACKUP_DIR/bookpie-$TIMESTAMP.dump"
