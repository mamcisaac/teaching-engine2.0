/**
 * Simplified Substitute Plan Service
 * Basic substitute teacher plan generation from lesson plans
 */

import { prisma } from '../prisma';
import type { Prisma } from '@prisma/client';
import logger from '../logger';

export interface SubstituteLesson {
  id: string;
  title: string;
  subject: string;
  time: string;
  duration: number;
  instructions: string;
  materials: string[];
}

export interface BasicScheduleItem {
  time: string;
  activity: string;
  notes?: string;
}

export interface SubstitutePlan {
  title: string;
  dateFor: Date;
  grade: number;
  subject?: string;
  schedule: BasicScheduleItem[];
  lessons: SubstituteLesson[];
  generalNotes: string;
  emergencyInfo: {
    officePhone: string;
    procedures: string;
  };
}

export interface GenerateSubstitutePlanParams {
  userId: number;
  dateFor: Date;
  title?: string;
  notes?: string;
}

export class SubstitutePlanService {
  /**
   * Generate a basic substitute plan from existing lesson plans
   */
  static async generate(params: GenerateSubstitutePlanParams): Promise<SubstitutePlan> {
    const { userId, dateFor, title, notes } = params;

    // Get the teacher's basic info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });

    // Get lesson plans for the specified date
    const lessonPlans = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId,
        date: {
          gte: new Date(dateFor.toDateString()),
          lt: new Date(new Date(dateFor).setDate(dateFor.getDate() + 1))
        }
      },
      include: {
        unitPlan: {
          select: {
            longRangePlan: {
              select: {
                grade: true,
                subject: true
              }
            }
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    // Extract grade and subject from first lesson plan
    const firstLesson = lessonPlans[0];
    const grade = firstLesson?.unitPlan?.longRangePlan?.grade || 1;
    const subject = firstLesson?.unitPlan?.longRangePlan?.subject || 'General';

    // Create basic schedule
    const schedule = this.createBasicSchedule();

    // Convert lesson plans to substitute format
    const lessons: SubstituteLesson[] = lessonPlans.map((lesson, index) => ({
      id: lesson.id,
      title: lesson.title,
      subject: lesson.unitPlan?.longRangePlan?.subject || 'General',
      time: this.getTimeSlot(index),
      duration: lesson.duration || 60,
      instructions: this.formatLessonInstructions(lesson),
      materials: Array.isArray(lesson.materials) ? lesson.materials as string[] : []
    }));

    return {
      title: title || `Substitute Plan - ${dateFor.toLocaleDateString()}`,
      dateFor,
      grade,
      subject,
      schedule,
      lessons,
      generalNotes: notes || this.createGeneralNotes(user?.name),
      emergencyInfo: {
        officePhone: 'See posted information near classroom phone',
        procedures: 'Follow posted emergency procedures. Contact main office for any concerns.'
      }
    };
  }

  /**
   * Create a basic daily schedule
   */
  private static createBasicSchedule(): BasicScheduleItem[] {
    return [
      { time: '8:30 AM', activity: 'Morning Entry', notes: 'Students enter, unpack, morning work' },
      { time: '9:00 AM', activity: 'Morning Meeting/Attendance', notes: 'Take attendance, morning announcements' },
      { time: '9:15 AM', activity: 'First Lesson Block', notes: 'See lesson plan' },
      { time: '10:30 AM', activity: 'Recess' },
      { time: '10:45 AM', activity: 'Second Lesson Block', notes: 'See lesson plan' },
      { time: '12:00 PM', activity: 'Lunch' },
      { time: '1:00 PM', activity: 'Third Lesson Block', notes: 'See lesson plan' },
      { time: '2:15 PM', activity: 'Clean Up & Pack Up', notes: 'Prepare for dismissal' },
      { time: '2:30 PM', activity: 'Dismissal', notes: 'Follow dismissal procedures' }
    ];
  }

  /**
   * Get time slot for lesson based on index
   */
  private static getTimeSlot(index: number): string {
    const timeSlots = ['9:15 AM', '10:45 AM', '1:00 PM'];
    return timeSlots[index] || timeSlots[0];
  }

  /**
   * Format lesson instructions for substitute
   */
  private static formatLessonInstructions(lesson: Prisma.ETFOLessonPlanGetPayload<{}>): string {
    let instructions = '';
    
    if (lesson.learningGoals) {
      instructions += `Learning Goals: ${lesson.learningGoals}\n\n`;
    }
    
    if (lesson.mindsOnActivities) {
      instructions += `Start (10 min): ${lesson.mindsOnActivities}\n\n`;
    }
    
    if (lesson.actionActivities) {
      instructions += `Main Activity: ${lesson.actionActivities}\n\n`;
    }
    
    if (lesson.consolidationActivities) {
      instructions += `Wrap-up: ${lesson.consolidationActivities}\n`;
    }

    return instructions || 'Follow the activities as outlined in the lesson plan binder.';
  }

  /**
   * Create general notes for substitute
   */
  private static createGeneralNotes(teacherName?: string | null): string {
    return `Welcome! Thank you for substituting today.

Key Information:
- Teacher: ${teacherName || 'See class information'}
- Attendance: Please take attendance first thing and send to office
- Behavior: Use positive reinforcement. Contact office for serious issues
- Early finishers: Students can read quietly or work on unfinished assignments
- Questions: Please contact the main office

Have a great day with the class!`;
  }

  /**
   * Export substitute plan as printable HTML
   */
  static async exportAsHTML(plan: SubstitutePlan): Promise<string> {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${plan.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2 { color: #333; }
    .schedule { margin: 20px 0; }
    .schedule-item { margin: 10px 0; }
    .lesson { border: 1px solid #ccc; padding: 15px; margin: 15px 0; }
    .emergency { background-color: #fee; padding: 10px; margin: 20px 0; }
    @media print { .page-break { page-break-after: always; } }
  </style>
</head>
<body>
  <h1>${plan.title}</h1>
  <p><strong>Date:</strong> ${plan.dateFor.toLocaleDateString()}</p>
  <p><strong>Grade:</strong> ${plan.grade} | <strong>Subject:</strong> ${plan.subject}</p>
  
  <div class="emergency">
    <h2>Emergency Information</h2>
    <p><strong>Office:</strong> ${plan.emergencyInfo.officePhone}</p>
    <p>${plan.emergencyInfo.procedures}</p>
  </div>
  
  <h2>Daily Schedule</h2>
  <div class="schedule">
    ${plan.schedule.map(item => `
      <div class="schedule-item">
        <strong>${item.time}:</strong> ${item.activity}
        ${item.notes ? `<br><em>${item.notes}</em>` : ''}
      </div>
    `).join('')}
  </div>
  
  <div class="page-break"></div>
  
  <h2>Lesson Plans</h2>
  ${plan.lessons.map(lesson => `
    <div class="lesson">
      <h3>${lesson.time} - ${lesson.title}</h3>
      <p><strong>Duration:</strong> ${lesson.duration} minutes</p>
      <p><strong>Materials:</strong> ${lesson.materials.join(', ') || 'See classroom supplies'}</p>
      <div>${lesson.instructions.replace(/\n/g, '<br>')}</div>
    </div>
  `).join('')}
  
  <div class="page-break"></div>
  
  <h2>General Notes</h2>
  <div>${plan.generalNotes.replace(/\n/g, '<br>')}</div>
</body>
</html>`;
  }
}

export default SubstitutePlanService;