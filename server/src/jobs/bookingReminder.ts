import cron from 'node-cron';
import { prisma } from '../prisma';

/**
 * Send notifications to remind teachers about upcoming equipment bookings.
 */
export async function sendEquipmentBookingReminders() {
  const today = new Date().toISOString().slice(0, 10);
  const bookings = await prisma.equipmentBooking.findMany({
    where: { status: { not: 'CANCELLED' } },
  });
  for (const b of bookings) {
    const needed = new Date(b.neededBy);
    const lead = b.leadTimeDays;
    const reminderDates = [
      new Date(needed.getTime() - lead * 86400000),
      new Date(needed.getTime() - Math.floor(lead / 2) * 86400000),
      new Date(needed.getTime() - 86400000),
    ];
    if (reminderDates.some((d) => d.toISOString().slice(0, 10) === today)) {
      await prisma.notification.create({
        data: {
          type: 'BOOKING_REMINDER',
          message: `Prepare booking for ${b.resourceName} needed on ${b.neededBy.toISOString().slice(0, 10)}.`,
        },
      });
    }
  }
}

/**
 * Schedule the booking reminder job to run daily at 8 AM.
 */
export function scheduleEquipmentBookingReminders() {
  cron.schedule('0 8 * * *', sendEquipmentBookingReminders);
}
