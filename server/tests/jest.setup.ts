import { execSync } from 'node:child_process';
import { config } from 'dotenv';
import { resolve } from 'path';

export default async () => {
  config({ path: resolve(__dirname, '../.env.test') });
  execSync('pnpm exec prisma generate --schema=../prisma/schema.prisma', {
    stdio: 'inherit',
  });
  execSync('pnpm exec prisma migrate deploy --schema=../prisma/schema.prisma', {
    stdio: 'inherit',
  });
};
