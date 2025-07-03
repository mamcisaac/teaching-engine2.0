/**
 * Newsletter Trigger Job
 * Scheduled job for triggering newsletter generation reminders
 */

import cron from 'node-cron';

// Newsletter reminder job - runs weekly on Friday at 3 PM
// This is a placeholder for future newsletter automation
export const newsletterTriggerJob = cron.schedule(
  '0 15 * * 5', // Every Friday at 3 PM
  () => {
    console.log('Newsletter reminder: Consider generating weekly parent newsletter');
    // In the future, this could send reminders to teachers
    // or automatically generate draft newsletters
  },
  {
    scheduled: false, // Don't start automatically
    timezone: 'America/Toronto'
  }
);

// Start the job (commented out for now)
// newsletterTriggerJob.start();

export default newsletterTriggerJob;