import { schedule } from 'node-cron';

import { logger } from '../logger';
/**
 * Send notifications to remind teachers about upcoming equipment bookings.
 */
export async function sendEquipmentBookingReminders(): Promise<void> {
  // DISABLED: EquipmentBooking and Notification models have been archived
  // TODO: Implement using CalendarEvent with type EQUIPMENT_BOOKING and ParentMessage for notifications
  logger.warn('sendEquipmentBookingReminders is disabled - legacy models archived');
}

/**
 * Schedule the booking reminder job to run daily at 8 AM.
 */
export function scheduleEquipmentBookingReminders(): void {
  schedule('0 8 * * *', sendEquipmentBookingReminders);
}
