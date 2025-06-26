import cron from 'node-cron';

export async function sendReportDeadlineReminders() {
  // DISABLED: ReportDeadline and Notification models have been archived
  // TODO: Implement using CalendarEvent with type REPORT_DEADLINE and ParentMessage for notifications
  console.warn('sendReportDeadlineReminders is disabled - legacy models archived');
}

export function scheduleReportDeadlineReminders() {
  cron.schedule('0 2 * * *', sendReportDeadlineReminders);
}
