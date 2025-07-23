import { schedule } from 'node-cron';

import { logger } from '../logger';
export function sendReportDeadlineReminders(): void {
  // DISABLED: ReportDeadline and Notification models have been archived
  // TODO: Implement using CalendarEvent with type REPORT_DEADLINE and ParentMessage for notifications
  logger.warn('sendReportDeadlineReminders is disabled - legacy models archived');
}

export function scheduleReportDeadlineReminders(): void {
  schedule('0 2 * * *', () => {
    try {
      sendReportDeadlineReminders();
    } catch (error) {
      logger.error('Failed to send report deadline reminders:', error);
    }
  });
}
