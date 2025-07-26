/**
 * Substitute Plan Service
 * Generates substitute teacher plans and formats them for export
 */

interface LessonPlanDetails {
  learningGoals?: string;
  mindsOnActivities?: string;
  actionActivities?: string;
  consolidationActivities?: string;
}

export interface ScheduleItem {
  time: string;
  activity: string;
  notes?: string;
}

export interface LessonInfo {
  id: string;
  title: string;
  subject: string;
  time: string;
  duration: number;
  instructions: string;
  materials: string[];
}

export interface EmergencyInfo {
  officePhone: string;
  procedures: string;
}

export interface SubstitutePlan {
  title: string;
  dateFor: Date;
  grade: number;
  subject: string;
  schedule: ScheduleItem[];
  lessons: LessonInfo[];
  generalNotes: string;
  emergencyInfo: EmergencyInfo;
}

export class SubstitutePlanService {
  static generate(_params: unknown): SubstitutePlan {
    // Mock implementation for testing
    return {
      title: 'Test Substitute Plan',
      dateFor: new Date(),
      grade: 3,
      subject: 'General',
      schedule: this.createBasicSchedule(),
      lessons: [],
      generalNotes: this.createGeneralNotes(),
      emergencyInfo: {
        officePhone: 'Extension 123',
        procedures: 'Follow posted emergency procedures.',
      },
    };
  }

  static exportAsHTML(plan: SubstitutePlan): string {
    const dateStr = new Date(plan.dateFor.getTime() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]; // Subtract a day for formatting

    let html = `<!DOCTYPE html>
<html>
<head>
  <title>${plan.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .emergency { background-color: #fee; padding: 10px; margin: 10px 0; border: 1px solid #fcc; }
    .page-break { page-break-after: always; }
    @media print { .page-break { page-break-after: always; } }
  </style>
</head>
<body>
  <h1>${plan.title}</h1>
  <p><strong>Date:</strong> ${dateStr}</p>
  <p><strong>Grade:</strong> ${plan.grade}</p>
  <p><strong>Subject:</strong> ${plan.subject}</p>

  <div class="emergency">
    <h2>Emergency Information</h2>
    <p><strong>Office:</strong> ${plan.emergencyInfo.officePhone}</p>
    <p>${plan.emergencyInfo.procedures}</p>
  </div>

  <h2>Daily Schedule</h2>`;

    plan.schedule.forEach((item) => {
      html += `<p><strong>${item.time}:</strong> ${item.activity}`;
      if (item.notes != null && item.notes !== '') {
        html += ` <em>${item.notes}</em>`;
      }
      html += '</p>';
    });

    html += '<h2>Lesson Plans</h2>';
    plan.lessons.forEach((lesson) => {
      html += `<h3>${lesson.time} - ${lesson.title}</h3>
        <p><strong>Duration:</strong> ${lesson.duration} minutes</p>
        <p><strong>Materials:</strong> ${lesson.materials.length ? lesson.materials.join(', ') : 'See classroom supplies'}</p>
        <p>${lesson.instructions.replace(/\n/g, '<br>')}</p>`;
    });

    html += `<h2>General Notes</h2>
      <p>${plan.generalNotes.replace(/\n/g, '<br>')}</p>
    </body>
    </html>`;

    return html;
  }

  private static createBasicSchedule(): ScheduleItem[] {
    return [
      { time: '8:30 AM', activity: 'Morning Entry', notes: 'Students enter, unpack, morning work' },
      {
        time: '9:00 AM',
        activity: 'Morning Meeting/Attendance',
        notes: 'Take attendance, morning announcements',
      },
      { time: '9:15 AM', activity: 'First Lesson Block', notes: 'See lesson plan' },
      { time: '10:30 AM', activity: 'Nutrition Break' },
      { time: '10:45 AM', activity: 'Second Lesson Block', notes: 'See lesson plan' },
      { time: '12:00 PM', activity: 'Lunch Break' },
      { time: '1:00 PM', activity: 'Afternoon Lesson Block', notes: 'See lesson plan' },
      { time: '2:15 PM', activity: 'Pack Up/Clean Up' },
      { time: '2:30 PM', activity: 'Dismissal', notes: 'Follow dismissal procedures' },
    ];
  }

  // Method reserved for future time slot management
  private static _getTimeSlot(index: number): string {
    const timeSlots = ['9:15 AM', '10:45 AM', '1:00 PM'];
    if (index < 0 || index >= timeSlots.length) {
      return timeSlots[0]; // Return first slot for out-of-bounds indices
    }
    return timeSlots[index];
  }

  // Method reserved for future lesson formatting
  private static _formatLessonInstructions(lessonPlan: LessonPlanDetails | null | undefined): string {
    if (lessonPlan == null || typeof lessonPlan !== 'object') {
      return 'Follow the activities as outlined in the lesson plan binder.';
    }

    let instructions = '';

    if (lessonPlan.learningGoals != null && lessonPlan.learningGoals !== '') {
      instructions += `Learning Goals: ${lessonPlan.learningGoals}\n\n`;
    }

    if (lessonPlan.mindsOnActivities != null && lessonPlan.mindsOnActivities !== '') {
      instructions += `Start (10 min): ${lessonPlan.mindsOnActivities}\n\n`;
    }

    if (lessonPlan.actionActivities != null && lessonPlan.actionActivities !== '') {
      instructions += `Main Activity: ${lessonPlan.actionActivities}`;
      // Only add extra newlines if there are more sections coming
      if (lessonPlan.consolidationActivities != null && lessonPlan.consolidationActivities !== '') {
        instructions += '\n\n';
      }
    }

    if (lessonPlan.consolidationActivities != null && lessonPlan.consolidationActivities !== '') {
      instructions += `Wrap-up: ${lessonPlan.consolidationActivities}`;
    }

    return instructions.trim() || 'Follow the activities as outlined in the lesson plan binder.';
  }

  private static createGeneralNotes(teacherName?: string | null): string {
    const teacher = teacherName.trim() ? teacherName : 'See class information';

    return `Welcome! Thank you for substituting today.

Key Information:
Teacher: ${teacher}
Attendance: Please take attendance first thing in the morning
Behavior: Use positive reinforcement and follow classroom rules
Early finishers: Students can read quietly or work on additional practice
Questions: Please contact the main office if you need assistance

Have a great day with the class!`;
  }

  static recordNewsletterGeneration(_userId: number): Promise<void> {
    // Mock implementation that doesn't throw
    return Promise.resolve();
  }
}
