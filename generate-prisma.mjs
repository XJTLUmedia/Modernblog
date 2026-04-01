/**
 * Prisma client generation helper.
 * Runs provider detection + prisma generate.
 * Usage: node generate-prisma.mjs
 */
import { execSync } from 'child_process';

try {
  console.log('Setting Prisma provider...');
  execSync('node scripts/set-prisma-provider.mjs', { stdio: 'inherit' });

  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('✅ Prisma Client generated');
} catch (error) {
  console.error('❌ Error generating Prisma Client:', error.message);
  process.exit(1);
}
