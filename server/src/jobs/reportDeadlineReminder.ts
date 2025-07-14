import { schedule } from 'node-cron';

import { logger } from '../logger';
export async function sendReportDeadlineReminders(): Promise<void> {
  // DISABLED: ReportDeadline and Notification models have been archived
  // TODO: Implement using CalendarEvent with type REPORT_DEADLINE and ParentMessage for notifications
  logger.warn('sendReportDeadlineReminders is disabled - legacy models archived');
}

export function scheduleReportDeadlineReminders(): void {
  schedule('0 2 * * *', sendReportDeadlineReminders);
}
