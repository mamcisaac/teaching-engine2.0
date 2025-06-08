import { config } from 'dotenv';
import fs from 'fs';

export default async () => {
  const testEnvPath = './.env.test';
  const offlineEnvPath = './.env.offline';
  if (fs.existsSync(testEnvPath)) {
    config({ path: testEnvPath });
  } else if (fs.existsSync(offlineEnvPath)) {
    config({ path: offlineEnvPath });
  }
};
