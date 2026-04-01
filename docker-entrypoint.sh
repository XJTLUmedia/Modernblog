#!/bin/sh
set -eu

# Only run migrations when starting the app server
if [ "${1:-}" = "node" ] && [ "${2:-}" = "server.js" ]; then
  PRISMA_VERSION="6.19.2"
  if [ -n "${DATABASE_URL:-}" ]; then
    # Set provider based on DATABASE_URL
    node scripts/set-prisma-provider.mjs

    # Detect database type for migration strategy
    case "${DATABASE_URL}" in
      postgres://*|postgresql://*)
        echo "PostgreSQL detected — running prisma db push (pinned to ${PRISMA_VERSION})..."
        npx -y prisma@"${PRISMA_VERSION}" db push --skip-generate
        ;;
      *)
        echo "SQLite detected — running prisma migrate deploy (pinned to ${PRISMA_VERSION})..."
        npx -y prisma@"${PRISMA_VERSION}" migrate deploy
        ;;
    esac
  else
    echo "DATABASE_URL not set; skipping database setup."
  fi
fi

exec "$@"
