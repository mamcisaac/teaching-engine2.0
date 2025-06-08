import prisma from '../prisma';
import { sendEmail } from '../emailService';

export async function calculateProgress() {
  const subjects = await prisma.subject.findMany({
    include: {
      milestones: {
        include: { activities: true },
      },
    },
  });

  return subjects.map((s) => {
    const milestones = s.milestones.map((m) => {
      const completed = m.activities.filter((a) => a.completedAt).length;
      const progress = m.activities.length ? completed / m.activities.length : 0;
      return { id: m.id, title: m.title, progress, targetDate: m.targetDate };
    });
    const overall = milestones.reduce((acc, m) => acc + m.progress, 0) / (milestones.length || 1);
    return { id: s.id, name: s.name, progress: overall, milestones };
  });
}

export async function checkAlerts() {
  const progress = await calculateProgress();
  const alerts: string[] = [];
  for (const subject of progress) {
    for (const m of subject.milestones) {
      if (m.targetDate && m.progress < 1) {
        const daysLeft = (m.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (daysLeft <= 7) {
          const message = `Milestone "${m.title}" in subject "${subject.name}" is due soon with ${Math.round(
            m.progress * 100,
          )}% complete.`;
          await prisma.notification.create({ data: { message } });
          alerts.push(message);
        }
      }
    }
  }
  if (alerts.length && process.env.NOTIFY_EMAIL) {
    await sendEmail(process.env.NOTIFY_EMAIL, 'Teaching Engine Alerts', alerts.join('\n'));
  }
}
