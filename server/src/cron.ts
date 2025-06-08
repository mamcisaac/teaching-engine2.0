import cron from 'node-cron';
import { checkAlerts } from './services/progressAnalytics';

export function startCronJobs() {
  if (process.env.NODE_ENV === 'test') return;
  cron.schedule('0 8 * * *', () => {
    checkAlerts().catch((err) => console.error(err));
  });
}
