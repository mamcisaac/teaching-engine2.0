/**
 * Substitute Plan Service
 * Generates substitute teacher plans and formats them for export
 */

// HTML escape utility to prevent XSS
function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m as keyof typeof map] || m);
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

export type SubstitutePlan = {
  title: string;
  dateFor: Date;
  grade: number | string;
  subject: string;
  schedule: ScheduleItem[];
  lessons: LessonInfo[];
  generalNotes: string;
  emergencyInfo: EmergencyInfo;
}

export class SubstitutePlanService {
  static async generateFromLessons(params: {
    date: Date;
    lessons: Array<{
      id: string;
      titleFr?: string;
      title?: string;
      subject?: string;
      duration?: number;
      slotNumber?: number;
      unitPlan?: {
        longRangePlan?: {
          subject?: string;
        };
      };
      resources?: Array<{
        title?: string;
        url?: string;
      }>;
      learningGoals?: string;
      mindsOnActivities?: string;
      actionActivities?: string;
      consolidationActivities?: string;
    }>;
    substituteInfo: {
      officePhone?: string;
      emergencyProcedures?: string;
      gradeLevel?: string;
      classroomNumber?: string;
      classSize?: number;
      nearbyTeacher?: string;
      nearbyTeacherRoom?: string;
      attentionSignal?: string;
      allergies?: string;
      medicalNeeds?: string;
      morningRoutine?: string;
      attendanceProcedure?: string;
      bathroomPolicy?: string;
      dismissalProcedure?: string;
      behaviorNotes?: string;
      rewardSystem?: string;
      studentHelpers?: string;
      materialsLocation?: string;
      extraActivities?: string;
      importantInfo?: string;
    };
    teacherName: string;
    grade: string;
  }): Promise<SubstitutePlan> {
    const { date, lessons, substituteInfo, teacherName, grade } = params;
    
    // Create schedule based on lessons
    const schedule = this.createScheduleFromLessons(lessons);
    
    // Format lessons for substitute
    const formattedLessons = lessons.map((lesson) => ({
      id: lesson.id,
      title: escapeHtml(lesson.titleFr || lesson.title || 'Lesson'),
      subject: escapeHtml(lesson.unitPlan?.longRangePlan?.subject || lesson.subject || 'General'),
      time: this._getTimeSlot(lesson.slotNumber || 0),
      duration: lesson.duration || 45,
      instructions: this._formatLessonInstructions(lesson),
      materials: (lesson.resources || []).map((r) => r.title || r.url).filter((material): material is string => material !== undefined) || [],
    }));
    
    // Create emergency info from substitute info
    const emergencyInfo: EmergencyInfo = {
      officePhone: substituteInfo.officePhone || 'See main office',
      procedures: substituteInfo.emergencyProcedures || 'Follow posted emergency procedures',
    };
    
    // Generate general notes from substitute info
    const generalNotes = this.createGeneralNotesFromInfo(teacherName, substituteInfo);
    
    return {
      title: `Substitute Plan - ${date.toLocaleDateString()}`,
      dateFor: date,
      grade: escapeHtml(grade || substituteInfo.gradeLevel || 'Not specified'),
      subject: 'All subjects',
      schedule,
      lessons: formattedLessons,
      generalNotes,
      emergencyInfo,
    };
  }
  
  static createScheduleFromLessons(lessons: Array<{
    titleFr?: string;
    title?: string;
    slotNumber?: number;
    duration?: number;
    unitPlan?: {
      longRangePlan?: {
        subject?: string;
      };
    };
  }>): ScheduleItem[] {
    const baseSchedule = this.createBasicSchedule();
    
    // Replace lesson blocks with actual lessons
    lessons.forEach((lesson, index) => {
      const slotTime = this._getTimeSlot(lesson.slotNumber || index);
      const scheduleIndex = baseSchedule.findIndex(item => item.time === slotTime);
      
      if (scheduleIndex !== -1) {
        baseSchedule[scheduleIndex] = {
          time: slotTime,
          activity: escapeHtml(lesson.titleFr || lesson.title || `Lesson ${index + 1}`),
          notes: `${escapeHtml(lesson.unitPlan?.longRangePlan?.subject || '')} - ${lesson.duration || 45} minutes`,
        };
      }
    });
    
    return baseSchedule;
  }
  
  static createGeneralNotesFromInfo(teacherName: string, info?: {
    classroomNumber?: string;
    classSize?: number;
    nearbyTeacher?: string;
    nearbyTeacherRoom?: string;
    attentionSignal?: string;
    allergies?: string;
    medicalNeeds?: string;
    morningRoutine?: string;
    attendanceProcedure?: string;
    bathroomPolicy?: string;
    dismissalProcedure?: string;
    behaviorNotes?: string;
    rewardSystem?: string;
    studentHelpers?: string;
    materialsLocation?: string;
    extraActivities?: string;
    importantInfo?: string;
  }): string {
    let notes = `Welcome! Thank you for substituting today.\n\n`;
    notes += `Key Information:\n`;
    notes += `- Teacher: ${escapeHtml(teacherName)}\n`;
    
    if (info) {
      if (info.classroomNumber) notes += `- Classroom: ${escapeHtml(info.classroomNumber)}\n`;
      if (info.classSize) notes += `- Class Size: ${info.classSize} students\n`;
      if (info.nearbyTeacher) notes += `- Nearby Teacher: ${escapeHtml(info.nearbyTeacher)} (Room ${escapeHtml(info.nearbyTeacherRoom || 'nearby')})\n`;
      
      if (info.attentionSignal) notes += `\nAttention Signal: ${escapeHtml(info.attentionSignal)}\n`;
      
      if (info.allergies) notes += `\n⚠️ ALLERGIES:\n${escapeHtml(info.allergies)}\n`;
      if (info.medicalNeeds) notes += `\n⚠️ MEDICAL NEEDS:\n${escapeHtml(info.medicalNeeds)}\n`;
      
      if (info.morningRoutine) notes += `\nMorning Routine:\n${escapeHtml(info.morningRoutine)}\n`;
      if (info.attendanceProcedure) notes += `\nAttendance: ${escapeHtml(info.attendanceProcedure)}\n`;
      if (info.bathroomPolicy) notes += `\nBathroom Policy: ${escapeHtml(info.bathroomPolicy)}\n`;
      if (info.dismissalProcedure) notes += `\nDismissal: ${escapeHtml(info.dismissalProcedure)}\n`;
      
      if (info.behaviorNotes) notes += `\nBehavior Management:\n${escapeHtml(info.behaviorNotes)}\n`;
      if (info.rewardSystem) notes += `\nReward System: ${escapeHtml(info.rewardSystem)}\n`;
      
      if (info.studentHelpers) notes += `\nStudent Helpers:\n${escapeHtml(info.studentHelpers)}\n`;
      if (info.materialsLocation) notes += `\nMaterials Location: ${escapeHtml(info.materialsLocation)}\n`;
      if (info.extraActivities) notes += `\nExtra Activities: ${escapeHtml(info.extraActivities)}\n`;
      
      if (info.importantInfo) notes += `\n⚠️ IMPORTANT:\n${info.importantInfo}\n`;
    } else {
      notes += this.createGeneralNotes(teacherName);
    }
    
    notes += `\nHave a great day with the class!`;
    return notes;
  }

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
    const dateStr = plan.dateFor.toLocaleDateString();

    let html = `<!DOCTYPE html>
<html>
<head>
  <title>${plan.title}</title>
  <meta charset="UTF-8">
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 20px; 
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #333; border-bottom: 3px solid #333; padding-bottom: 10px; }
    h2 { color: #555; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 25px; }
    h3 { color: #666; margin-top: 20px; }
    .emergency { 
      background-color: #fee; 
      padding: 15px; 
      margin: 15px 0; 
      border: 2px solid #fcc; 
      border-radius: 5px;
    }
    .schedule-item {
      margin: 10px 0;
      padding: 8px;
      background: #f9f9f9;
      border-left: 3px solid #4CAF50;
    }
    .lesson-card {
      border: 1px solid #ddd;
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
      background: #fafafa;
    }
    .page-break { page-break-after: always; }
    @media print { 
      .page-break { page-break-after: always; }
      body { margin: 0; padding: 10px; }
    }
    .header-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .materials {
      background: #e8f5e9;
      padding: 8px;
      border-radius: 3px;
      margin-top: 10px;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  </style>
</head>
<body>
  <h1>${plan.title}</h1>
  <div class="header-info">
    <div>
      <strong>Date:</strong> ${dateStr}<br>
      <strong>Grade:</strong> ${plan.grade}<br>
      <strong>Subject:</strong> ${plan.subject}
    </div>
    <div>
      <strong>Prepared:</strong> ${new Date().toLocaleDateString()}<br>
      <strong>Total Lessons:</strong> ${plan.lessons.length}
    </div>
  </div>

  <div class="emergency">
    <h2>🚨 Emergency Information</h2>
    <p><strong>Office:</strong> ${plan.emergencyInfo.officePhone}</p>
    <p>${plan.emergencyInfo.procedures.replace(/\n/g, '<br>')}</p>
  </div>

  <h2>📅 Daily Schedule</h2>
  <div class="schedule-container">`;

    plan.schedule.forEach((item) => {
      html += `<div class="schedule-item">
        <strong>${item.time}:</strong> ${item.activity}`;
      if (item.notes) {
        html += ` <em>(${item.notes})</em>`;
      }
      html += '</div>';
    });

    html += `</div>

  <h2>📚 Lesson Plans</h2>`;

    if (plan.lessons.length === 0) {
      html += '<p>No lessons scheduled for this day.</p>';
    } else {
      plan.lessons.forEach((lesson) => {
        html += `<div class="lesson-card">
          <h3>${lesson.time} - ${lesson.title}</h3>
          <p><strong>Subject:</strong> ${lesson.subject}</p>
          <p><strong>Duration:</strong> ${lesson.duration} minutes</p>`;
        
        if (lesson.materials && lesson.materials.length > 0) {
          html += `<div class="materials">
            <strong>Materials:</strong> ${lesson.materials.join(', ')}
          </div>`;
        }
        
        html += `<div style="margin-top: 10px;">
          <strong>Instructions:</strong><br>
          <pre>${lesson.instructions}</pre>
        </div>
        </div>`;
      });
    }

    html += `
  <div class="page-break"></div>
  <h2>📋 General Notes</h2>
  <pre>${plan.generalNotes}</pre>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; color: #888;">
    <small>Generated on ${new Date().toLocaleString()}</small>
  </div>
</body>
</html>`;

    return html;
  }

  static createBasicSchedule(): ScheduleItem[] {
    return [
      { time: '8:30 AM', activity: 'Morning Entry', notes: 'Students enter, unpack, morning work' },
      { time: '9:00 AM', activity: 'Morning Meeting/Attendance', notes: 'Take attendance, morning announcements' },
      { time: '9:15 AM', activity: 'First Lesson Block', notes: 'See lesson plan' },
      { time: '10:30 AM', activity: 'Recess', notes: '15 minute break' },
      { time: '10:45 AM', activity: 'Second Lesson Block', notes: 'See lesson plan' },
      { time: '12:00 PM', activity: 'Lunch', notes: 'Students go to cafeteria' },
      { time: '1:00 PM', activity: 'Third Lesson Block', notes: 'See lesson plan' },
      { time: '2:15 PM', activity: 'Clean Up & Pack Up', notes: 'Prepare for dismissal' },
      { time: '2:30 PM', activity: 'Dismissal', notes: 'Follow dismissal procedures' },
    ];
  }

  static _getTimeSlot(index: number): string {
    const slots = ['9:15 AM', '10:45 AM', '1:00 PM'];
    if (index < 0 || index >= slots.length) {
      return slots[0] || '9:15 AM';
    }
    return slots[index] || '9:15 AM';
  }

  static _formatLessonInstructions(lessonPlan?: {
    learningGoals?: string;
    mindsOnActivities?: string;
    actionActivities?: string;
    consolidationActivities?: string;
  }): string {
    if (!lessonPlan || typeof lessonPlan !== 'object') {
      return 'Follow the activities as outlined in the lesson plan binder.';
    }

    let instructions = '';
    
    if (lessonPlan.learningGoals) {
      instructions += `Learning Goals: ${escapeHtml(lessonPlan.learningGoals)}\n\n`;
    }

    if (lessonPlan.mindsOnActivities) {
      instructions += `Start (10 min): ${escapeHtml(lessonPlan.mindsOnActivities)}\n\n`;
    }

    if (lessonPlan.actionActivities) {
      instructions += `Main Activity: ${escapeHtml(lessonPlan.actionActivities)}\n\n`;
    }

    if (lessonPlan.consolidationActivities) {
      instructions += `Wrap-up: ${escapeHtml(lessonPlan.consolidationActivities)}`;
    }

    return instructions.trim() || 'Follow the activities as outlined in the lesson plan binder.';
  }

  static createGeneralNotes(teacherName?: string): string {
    return `Welcome! Thank you for substituting today.

Key Information:
- Teacher: ${teacherName || 'See class information'}
- Attendance: Please take attendance first thing in the morning
- Behavior: Use positive reinforcement. See behavior chart on wall.
- Early finishers: Students can read quietly or work on unfinished work
- Questions: Please contact the main office at extension 100

Have a great day with the class!`;
  }
}