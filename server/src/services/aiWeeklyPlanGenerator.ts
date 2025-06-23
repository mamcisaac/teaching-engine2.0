import { prisma } from '../prisma';
import { openai } from './llmService';
import { z } from 'zod';
import logger from '../logger';
import { aiActivityGeneratorEnhanced } from './aiActivityGeneratorEnhanced';

// Schema for weekly plan generation
const WeeklyPlanSchema = z.object({
  monday: z.array(z.object({
    time: z.string(),
    subject: z.string(),
    activityTitle: z.string(),
    activityDescription: z.string(),
    duration: z.number(),
    outcomeIds: z.array(z.string()),
    materials: z.array(z.string()).optional(),
  })),
  tuesday: z.array(z.any()),
  wednesday: z.array(z.any()),
  thursday: z.array(z.any()),
  friday: z.array(z.any()),
  qualityMetrics: z.object({
    coverageScore: z.number(),
    balanceScore: z.number(),
    pacingScore: z.number(),
    overallScore: z.number(),
  }),
});

interface GeneratePlanParams {
  userId: number;
  weekStart: string;
  preferences?: {
    subjectHours?: Record<string, number>;
    preferredComplexity?: 'simple' | 'moderate' | 'complex';
    includeAssessments?: boolean;
    bufferTime?: number; // Minutes of buffer between activities
    priorityOutcomes?: string[];
  };
}

interface TimetableSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
}

export class AIWeeklyPlanGeneratorService {
  /**
   * Generate a complete weekly plan with AI optimization
   */
  async generateWeeklyPlan(params: GeneratePlanParams) {
    const { userId, weekStart, preferences = {} } = params;

    try {
      // 1. Analyze curriculum gaps
      const gapAnalysis = await aiActivityGeneratorEnhanced.analyzeCurriculumGaps(userId);
      
      // 2. Get user's timetable
      const timetable = await this.getUserTimetable(userId);
      
      // 3. Check for holidays/events in the week
      const weekEvents = await this.getWeekEvents(weekStart);
      
      // 4. Get existing activities for the week
      const existingActivities = await this.getExistingActivities(userId, weekStart);
      
      // 5. Calculate available slots
      const availableSlots = this.calculateAvailableSlots(
        timetable,
        weekEvents,
        existingActivities,
        preferences.bufferTime || 5
      );

      // 6. Generate AI plan
      const plan = await this.generateAIPlan(
        userId,
        availableSlots,
        gapAnalysis,
        preferences
      );

      // 7. Save the generated plan
      const savedPlan = await this.savePlan(userId, weekStart, plan, preferences);

      return {
        planId: savedPlan.id,
        plan,
        metrics: plan.qualityMetrics,
        availableSlots: availableSlots.length,
        gapsCovered: plan.gapsCovered,
      };

    } catch (error) {
      logger.error('Error generating weekly plan:', error);
      throw error;
    }
  }

  /**
   * Apply a generated plan to the actual calendar
   */
  async applyPlanToCalendar(planId: number, userId: number) {
    const plan = await prisma.aIGeneratedPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || plan.userId !== userId) {
      throw new Error('Plan not found or unauthorized');
    }

    if (plan.accepted) {
      throw new Error('Plan already applied');
    }

    const planData = JSON.parse(plan.planData);
    const createdActivities = [];

    try {
      // Create activities for each day
      for (const [day, dayActivities] of Object.entries(planData)) {
        if (day === 'qualityMetrics' || day === 'gapsCovered') continue;

        for (const plannedActivity of dayActivities as any[]) {
          // First, generate the AI activity if needed
          let activityId: number;

          if (plannedActivity.aiSuggestionId) {
            // Convert existing AI suggestion to activity
            const result = await prisma.aISuggestedActivity.findUnique({
              where: { id: plannedActivity.aiSuggestionId },
            });

            if (result) {
              const activity = await this.createActivityFromSuggestion(result, userId);
              activityId = activity.id;
            } else {
              continue;
            }
          } else {
            // Create new activity
            const activity = await prisma.activity.create({
              data: {
                title: plannedActivity.activityTitle,
                titleFr: plannedActivity.activityTitle,
                publicNote: plannedActivity.activityDescription,
                publicNoteFr: plannedActivity.activityDescription,
                durationMins: plannedActivity.duration,
                materialsText: plannedActivity.materials?.join(', '),
                userId,
                milestoneId: plannedActivity.milestoneId || 1, // TODO: Better milestone selection
                outcomes: {
                  create: plannedActivity.outcomeIds.map((id: string) => ({
                    outcomeId: id,
                  })),
                },
              },
            });
            activityId = activity.id;
          }

          // Schedule the activity
          const scheduledDate = this.getDateForDay(plan.weekStart, day);
          await this.scheduleActivity(
            activityId,
            scheduledDate,
            plannedActivity.time,
            plannedActivity.duration
          );

          createdActivities.push({
            activityId,
            day,
            time: plannedActivity.time,
          });
        }
      }

      // Mark plan as applied
      await prisma.aIGeneratedPlan.update({
        where: { id: planId },
        data: {
          accepted: true,
          appliedAt: new Date(),
        },
      });

      return {
        success: true,
        activitiesCreated: createdActivities.length,
        activities: createdActivities,
      };

    } catch (error) {
      logger.error('Error applying plan to calendar:', error);
      // Rollback created activities if needed
      throw error;
    }
  }

  /**
   * Generate AI plan based on available slots and curriculum gaps
   */
  private async generateAIPlan(
    userId: number,
    availableSlots: any[],
    gapAnalysis: any,
    preferences: any
  ) {
    const systemPrompt = `You are an expert educational planner creating a weekly schedule for a Grade 1 French Immersion teacher.

Your goals:
1. Maximize curriculum coverage, especially for uncovered outcomes
2. Balance subject distribution according to provincial requirements
3. Create logical activity progressions within each day
4. Respect the teacher's timetable and available time slots
5. Include variety in activity types and complexity

Consider:
- Available time slots and their subjects
- Priority outcomes that need coverage
- Appropriate pacing for 6-7 year old students
- Need for assessment opportunities
- Buffer time between activities

Provide a detailed weekly plan with quality metrics.`;

    const slotsbyDay = this.groupSlotsByDay(availableSlots);
    const priorityOutcomes = gapAnalysis.priorityGaps.slice(0, 20).map((g: any) => ({
      id: g.outcome.id,
      code: g.outcome.code,
      description: g.outcome.description,
      subject: g.outcome.milestones[0]?.milestone.subject.name,
    }));

    const userPrompt = `Create a weekly plan for:
Week starting: ${new Date(availableSlots[0]?.date).toLocaleDateString()}

Available slots by day:
${JSON.stringify(slotsbyDay, null, 2)}

Priority outcomes to cover:
${JSON.stringify(priorityOutcomes, null, 2)}

Preferences:
- Complexity: ${preferences.preferredComplexity || 'moderate'}
- Include assessments: ${preferences.includeAssessments || false}
- Buffer time: ${preferences.bufferTime || 5} minutes

Generate a plan following this exact JSON structure:
{
  "monday": [
    {
      "time": "09:00",
      "subject": "Mathematics",
      "activityTitle": "Exploration des nombres",
      "activityDescription": "Les élèves explorent les nombres 1-10 avec des manipulatifs",
      "duration": 30,
      "outcomeIds": ["outcome1"],
      "materials": ["cubes", "cartes numériques"]
    }
  ],
  "tuesday": [...],
  "wednesday": [...],
  "thursday": [...],
  "friday": [...],
  "qualityMetrics": {
    "coverageScore": 0.85,
    "balanceScore": 0.90,
    "pacingScore": 0.88,
    "overallScore": 0.88
  },
  "gapsCovered": ["outcome1", "outcome2"]
}`;

    try {
      if (!openai) {
        throw new Error('OpenAI not configured');
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from AI');
      }

      const parsedPlan = JSON.parse(responseContent);
      
      // Add the gapsCovered field if not present
      if (!parsedPlan.gapsCovered) {
        parsedPlan.gapsCovered = this.extractCoveredOutcomes(parsedPlan);
      }

      return parsedPlan;

    } catch (error) {
      logger.error('Error generating AI plan:', error);
      // Return a fallback plan
      return this.generateFallbackPlan(availableSlots, gapAnalysis);
    }
  }

  /**
   * Get user's timetable configuration
   */
  private async getUserTimetable(userId: number): Promise<TimetableSlot[]> {
    const timetableSlots = await prisma.timetableSlot.findMany({
      where: { subjectId: { not: null } },
      include: { subject: true },
    });

    return timetableSlots.map(slot => ({
      dayOfWeek: slot.day,
      startTime: this.minutesToTime(slot.startMin),
      endTime: this.minutesToTime(slot.endMin),
      subject: slot.subject?.name || 'Unknown',
    }));
  }

  /**
   * Convert minutes from midnight to HH:MM format
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Get events/holidays for the week
   */
  private async getWeekEvents(weekStart: string) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 4); // Friday

    const events = await prisma.calendarEvent.findMany({
      where: {
        start: {
          gte: new Date(weekStart),
          lte: weekEnd,
        },
      },
    });

    return events;
  }

  /**
   * Get existing activities already scheduled for the week
   */
  private async getExistingActivities(userId: number, weekStart: string) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 4);

    const lessonPlan = await prisma.lessonPlan.findUnique({
      where: { weekStart: new Date(weekStart) },
      include: {
        schedule: {
          include: {
            activity: true,
          },
        },
      },
    });

    return lessonPlan?.schedule || [];
  }

  /**
   * Calculate available time slots for new activities
   */
  private calculateAvailableSlots(
    timetable: TimetableSlot[],
    events: any[],
    existingActivities: any[],
    bufferTime: number
  ) {
    const availableSlots = [];
    const weekDays = [1, 2, 3, 4, 5]; // Monday to Friday

    for (const day of weekDays) {
      const daySlots = timetable.filter(slot => slot.dayOfWeek === day);
      const dayEvents = events.filter(event => 
        new Date(event.date).getDay() === day
      );
      const dayActivities = existingActivities.filter(activity =>
        new Date(activity.date).getDay() === day
      );

      for (const slot of daySlots) {
        // Check if slot is blocked by events
        const isBlocked = dayEvents.some(event => 
          this.timeOverlaps(slot.startTime, slot.endTime, event.startTime, event.endTime)
        );

        if (!isBlocked) {
          // Calculate remaining time in slot
          const slotDuration = this.getMinutesBetween(slot.startTime, slot.endTime);
          const usedTime = dayActivities
            .filter(a => this.timeOverlaps(slot.startTime, slot.endTime, a.startTime, a.endTime))
            .reduce((total, a) => total + (a.activity?.durationMins || 0), 0);

          const availableTime = slotDuration - usedTime - bufferTime;

          if (availableTime >= 15) { // Minimum 15 minutes for an activity
            availableSlots.push({
              day,
              date: this.getDateForDayNumber(new Date(), day),
              startTime: this.addMinutes(slot.startTime, usedTime),
              availableMinutes: availableTime,
              subject: slot.subject,
            });
          }
        }
      }
    }

    return availableSlots;
  }

  /**
   * Save generated plan to database
   */
  private async savePlan(
    userId: number,
    weekStart: string,
    plan: any,
    preferences: any
  ) {
    return prisma.aIGeneratedPlan.create({
      data: {
        userId,
        weekStart: new Date(weekStart),
        planData: JSON.stringify(plan),
        parameters: JSON.stringify(preferences),
        qualityScore: plan.qualityMetrics?.overallScore || 0.75,
      },
    });
  }

  /**
   * Create activity from AI suggestion
   */
  private async createActivityFromSuggestion(suggestion: any, userId: number) {
    const materials = typeof suggestion.materials === 'string' 
      ? JSON.parse(suggestion.materials) 
      : suggestion.materials;

    return prisma.activity.create({
      data: {
        title: suggestion.title,
        titleFr: suggestion.title,
        publicNote: suggestion.descriptionFr,
        publicNoteFr: suggestion.descriptionFr,
        publicNoteEn: suggestion.descriptionEn,
        materialsText: materials.join(', '),
        materialsTextFr: materials.join(', '),
        durationMins: suggestion.duration,
        userId,
        milestoneId: 1, // TODO: Better milestone selection
      },
    });
  }

  /**
   * Schedule an activity for a specific date/time
   */
  private async scheduleActivity(
    activityId: number,
    date: Date,
    startTime: string,
    duration: number
  ) {
    // Get or create lesson plan for the week
    const weekStart = this.getWeekStart(date);
    let lessonPlan = await prisma.lessonPlan.findUnique({
      where: { weekStart },
    });

    if (!lessonPlan) {
      lessonPlan = await prisma.lessonPlan.create({
        data: { weekStart },
      });
    }

    // Calculate end time
    const endTime = this.addMinutes(startTime, duration);

    // Create weekly schedule entry
    return prisma.weeklySchedule.create({
      data: {
        lessonPlanId: lessonPlan.id,
        activityId,
        day: new Date(date).getDay(),
      },
    });
  }

  // Helper methods

  private groupSlotsByDay(slots: any[]) {
    const grouped: Record<string, any[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    };

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    for (const slot of slots) {
      const dayName = dayNames[slot.day];
      if (grouped[dayName]) {
        grouped[dayName].push(slot);
      }
    }

    return grouped;
  }

  private timeOverlaps(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    const s1 = this.timeToMinutes(start1);
    const e1 = this.timeToMinutes(end1);
    const s2 = this.timeToMinutes(start2);
    const e2 = this.timeToMinutes(end2);

    return s1 < e2 && s2 < e1;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private getMinutesBetween(start: string, end: string): number {
    return this.timeToMinutes(end) - this.timeToMinutes(start);
  }

  private addMinutes(time: string, minutes: number): string {
    const totalMinutes = this.timeToMinutes(time) + minutes;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private getDateForDay(weekStart: Date, dayName: string): Date {
    const dayMap: Record<string, number> = {
      monday: 0,
      tuesday: 1,
      wednesday: 2,
      thursday: 3,
      friday: 4,
    };

    const date = new Date(weekStart);
    date.setDate(date.getDate() + (dayMap[dayName] || 0));
    return date;
  }

  private getDateForDayNumber(baseDate: Date, dayNumber: number): Date {
    const date = new Date(baseDate);
    const currentDay = date.getDay();
    const daysUntilTarget = (dayNumber - currentDay + 7) % 7;
    date.setDate(date.getDate() + daysUntilTarget);
    return date;
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private extractCoveredOutcomes(plan: any): string[] {
    const outcomes = new Set<string>();
    
    for (const day of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']) {
      if (plan[day]) {
        for (const activity of plan[day]) {
          if (activity.outcomeIds) {
            activity.outcomeIds.forEach((id: string) => outcomes.add(id));
          }
        }
      }
    }

    return Array.from(outcomes);
  }

  private generateFallbackPlan(availableSlots: any[], gapAnalysis: any) {
    // Simple fallback plan generation
    const plan: any = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      qualityMetrics: {
        coverageScore: 0.5,
        balanceScore: 0.5,
        pacingScore: 0.5,
        overallScore: 0.5,
      },
      gapsCovered: [],
    };

    // Distribute priority outcomes across available slots
    const priorityOutcomes = gapAnalysis.priorityGaps.slice(0, 10);
    let outcomeIndex = 0;

    for (const slot of availableSlots.slice(0, 15)) { // Max 15 activities
      const outcome = priorityOutcomes[outcomeIndex % priorityOutcomes.length];
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][slot.day];

      if (plan[dayName]) {
        plan[dayName].push({
          time: slot.startTime,
          subject: slot.subject,
          activityTitle: `Activité - ${outcome.outcome.code}`,
          activityDescription: outcome.outcome.description,
          duration: Math.min(30, slot.availableMinutes),
          outcomeIds: [outcome.outcome.id],
          materials: ['matériel de base'],
        });

        plan.gapsCovered.push(outcome.outcome.id);
      }

      outcomeIndex++;
    }

    return plan;
  }
}

export const aiWeeklyPlanGenerator = new AIWeeklyPlanGeneratorService();