/**
 * Prisma Provider Switcher
 * 
 * Automatically sets the Prisma schema provider based on the DATABASE_URL.
 * Supports both SQLite (local) and PostgreSQL (Vercel/production).
 * 
 * Detection order:
 *   1. PRISMA_PROVIDER env var (explicit override: "sqlite" or "postgresql")
 *   2. DATABASE_URL / POSTGRES_PRISMA_URL / POSTGRES_URL auto-detection
 *   3. Defaults to "sqlite" if nothing is set
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

function detectProvider() {
  // 1. Explicit override
  const explicit = process.env.PRISMA_PROVIDER;
  if (explicit === 'postgresql' || explicit === 'sqlite') {
    return explicit;
  }

  // 2. Auto-detect from URL
  const dbUrl = process.env.DATABASE_URL
    || process.env.POSTGRES_PRISMA_URL
    || process.env.POSTGRES_URL
    || '';

  if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    return 'postgresql';
  }

  // 3. Default to sqlite
  return 'sqlite';
}

function buildDatasourceBlock(provider) {
  if (provider === 'postgresql') {
    const lines = [
      'datasource db {',
      '  provider  = "postgresql"',
      '  url       = env("DATABASE_URL")',
    ];
    // Only add directUrl if DIRECT_URL is set (used for Vercel connection pooling)
    if (process.env.DIRECT_URL) {
      lines.push('  directUrl = env("DIRECT_URL")');
    }
    lines.push('}');
    return lines.join('\n');
  }
  return `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`;
}

const provider = detectProvider();
let schema = fs.readFileSync(schemaPath, 'utf8');

// Replace the datasource block
schema = schema.replace(
  /datasource\s+db\s*\{[^}]+\}/,
  buildDatasourceBlock(provider)
);

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log(`✅ Prisma provider set to: ${provider}`);
