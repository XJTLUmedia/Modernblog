#!/bin/sh
set -eu

# Only run migrations when starting the app server
if [ "${1:-}" = "node" ] && [ "${2:-}" = "server.js" ]; then
  PRISMA_VERSION="6.19.2"
  if [ -n "${DATABASE_URL:-}" ]; then
    echo "Running prisma migrate deploy (pinned to ${PRISMA_VERSION})..."
    npx -y prisma@"${PRISMA_VERSION}" migrate deploy
  else
    echo "DATABASE_URL not set; skipping prisma migrate deploy."
  fi
fi

exec "$@"
