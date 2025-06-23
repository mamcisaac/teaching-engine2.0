import { prisma } from '../prisma';
import { SubPlanData, SubPlanOptions, buildSubPlanData } from './subPlanService';

export interface WeeklyPlanData {
  startDate: string;
  endDate: string;
  days: SubPlanData[];
  weeklyOverview: {
    subjects: Array<{
      name: string;
      totalHours: number;
      keyTopics: string[];
      outcomes: Array<{
        code: string;
        description: string;
      }>;
    }>;
    milestones: Array<{
      title: string;
      targetDate: string;
      progress: number;
      subject: string;
    }>;
    assessments: Array<{
      title: string;
      date: string;
      subject: string;
      type: string;
    }>;
    specialEvents: Array<{
      title: string;
      date: string;
      time?: string;
      impact: string; // How it affects the regular schedule
    }>;
  };
  continuityNotes: Array<{
    day: string;
    previousDay?: string;
    connections: string[];
    preparations: string[];
  }>;
  emergencyBackupPlans: Array<{
    subject: string;
    activities: string[];
    materials: string[];
  }>;
}

/**
 * Extract a comprehensive weekly substitute plan with cross-day continuity
 */
export async function extractWeeklyPlan(
  startDate: string,
  numDays: number = 5,
  options: SubPlanOptions = {}
): Promise<WeeklyPlanData> {
  const { userId = 1 } = options;
  
  // Generate data for each day
  const days: SubPlanData[] = [];
  const startDateObj = new Date(startDate);
  
  for (let i = 0; i < numDays; i++) {
    const currentDate = new Date(startDateObj);
    currentDate.setUTCDate(startDateObj.getUTCDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    const dayData = await buildSubPlanData(dateStr, options);
    days.push(dayData);
  }

  // Calculate end date
  const endDateObj = new Date(startDateObj);
  endDateObj.setUTCDate(startDateObj.getUTCDate() + numDays - 1);
  const endDate = endDateObj.toISOString().split('T')[0];

  // Extract weekly overview data
  const weeklyOverview = await extractWeeklyOverview(startDate, endDate, userId);
  
  // Generate continuity notes
  const continuityNotes = generateContinuityNotes(days);
  
  // Create emergency backup plans
  const emergencyBackupPlans = await generateEmergencyBackupPlans();

  return {
    startDate,
    endDate,
    days,
    weeklyOverview,
    continuityNotes,
    emergencyBackupPlans
  };
}

/**
 * Extract weekly overview with subjects, milestones, and assessments
 */
async function extractWeeklyOverview(startDate: string, endDate: string, userId: number) {
  const weekStart = new Date(startDate);
  weekStart.setUTCHours(0, 0, 0, 0);
  const weekEnd = new Date(endDate);
  weekEnd.setUTCHours(23, 59, 59, 999);

  // Get all daily plans for the week
  const weeklyPlans = await prisma.dailyPlan.findMany({
    where: {
      date: {
        gte: weekStart,
        lte: weekEnd
      }
    },
    include: {
      items: {
        include: {
          activity: {
            include: {
              milestone: {
                include: {
                  subject: true
                }
              },
              outcomes: {
                include: {
                  outcome: true
                }
              }
            }
          },
          slot: {
            include: {
              subject: true
            }
          }
        }
      }
    }
  });

  // Get milestones for the period
  const milestones = await prisma.milestone.findMany({
    where: {
      OR: [
        {
          targetDate: {
            gte: weekStart,
            lte: weekEnd
          }
        },
        {
          activities: {
            some: {
              dailyPlanItems: {
                some: {
                  dailyPlan: {
                    date: {
                      gte: weekStart,
                      lte: weekEnd
                    }
                  }
                }
              }
            }
          }
        }
      ]
    },
    include: {
      subject: true,
      activities: {
        include: {
          dailyPlanItems: true
        }
      }
    }
  });

  // Get assessment results for the week
  const assessments = await prisma.assessmentResult.findMany({
    where: {
      date: {
        gte: weekStart,
        lte: weekEnd
      }
    },
    include: {
      template: true
    }
  });

  // Get special events
  const specialEvents = await prisma.calendarEvent.findMany({
    where: {
      start: {
        gte: weekStart
      },
      end: {
        lte: weekEnd
      }
    }
  });

  // Process subjects and calculate hours
  const subjectMap = new Map<string, {
    name: string;
    totalHours: number;
    keyTopics: Set<string>;
    outcomes: Map<string, { code: string; description: string }>;
  }>();

  for (const plan of weeklyPlans) {
    for (const item of plan.items) {
      const subject = item.slot?.subject || item.activity?.milestone?.subject;
      if (!subject) continue;

      if (!subjectMap.has(subject.name)) {
        subjectMap.set(subject.name, {
          name: subject.name,
          totalHours: 0,
          keyTopics: new Set(),
          outcomes: new Map()
        });
      }

      const subjectData = subjectMap.get(subject.name)!;
      
      // Add duration (assuming 15-minute slots, could be made configurable)
      subjectData.totalHours += 0.25;
      
      // Add activity topics
      if (item.activity?.title) {
        subjectData.keyTopics.add(item.activity.title);
      }
      
      // Add outcomes
      if (item.activity?.outcomes) {
        for (const outcomeRel of item.activity.outcomes) {
          const outcome = outcomeRel.outcome;
          subjectData.outcomes.set(outcome.id, {
            code: outcome.code,
            description: outcome.description
          });
        }
      }
    }
  }

  // Convert to final format
  const subjects = Array.from(subjectMap.values()).map(s => ({
    name: s.name,
    totalHours: Math.round(s.totalHours * 4) / 4, // Round to nearest quarter hour
    keyTopics: Array.from(s.keyTopics).slice(0, 5), // Limit to top 5
    outcomes: Array.from(s.outcomes.values())
  }));

  // Process milestones
  const processedMilestones = milestones.map(milestone => {
    const totalActivities = milestone.activities.length;
    const completedActivities = milestone.activities.filter(a => 
      a.completedAt !== null
    ).length;
    const progress = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

    return {
      title: milestone.title,
      targetDate: milestone.targetDate ? milestone.targetDate.toISOString().split('T')[0] : '',
      progress: Math.round(progress),
      subject: milestone.subject.name
    };
  });

  // Process assessments
  const processedAssessments = assessments.map(assessment => ({
    title: assessment.template.title,
    date: assessment.date.toISOString().split('T')[0],
    subject: assessment.template.type || 'General',
    type: assessment.template.type || 'Assessment'
  }));

  // Process special events
  const processedEvents = specialEvents.map(event => ({
    title: event.title,
    date: event.start.toISOString().split('T')[0],
    time: event.allDay ? undefined : event.start.toISOString().split('T')[1].slice(0, 5),
    impact: determineEventImpact(event.title, event.allDay)
  }));

  return {
    subjects,
    milestones: processedMilestones,
    assessments: processedAssessments,
    specialEvents: processedEvents
  };
}

/**
 * Generate continuity notes showing how each day builds on the previous
 */
function generateContinuityNotes(days: SubPlanData[]): Array<{
  day: string;
  previousDay?: string;
  connections: string[];
  preparations: string[];
}> {
  const notes = [];

  for (let i = 0; i < days.length; i++) {
    const currentDay = days[i];
    const previousDay = i > 0 ? days[i - 1] : undefined;
    
    const connections: string[] = [];
    const preparations: string[] = [];

    if (previousDay) {
      // Find subject connections
      const currentSubjects = extractSubjectsFromSchedule(currentDay.schedule);
      const previousSubjects = extractSubjectsFromSchedule(previousDay.schedule);
      
      const commonSubjects = currentSubjects.filter(s => 
        previousSubjects.some(ps => ps.subject === s.subject)
      );

      for (const subject of commonSubjects) {
        const prevActivity = previousSubjects.find(ps => ps.subject === subject.subject);
        if (prevActivity && subject.activity !== prevActivity.activity) {
          connections.push(
            `${subject.subject}: Continue from "${prevActivity.activity}" to "${subject.activity}"`
          );
        }
      }

      // Check for materials/setup needed
      const currentActivities = currentDay.schedule
        .filter(s => s.activity)
        .map(s => s.activity!);
      
      if (currentActivities.some(a => a.toLowerCase().includes('project'))) {
        preparations.push('Ensure project materials from previous day are available');
      }
      
      if (currentActivities.some(a => a.toLowerCase().includes('presentation'))) {
        preparations.push('Set up presentation equipment and student work displays');
      }
    }

    // Add general preparations for the day
    const dayActivities = currentDay.schedule.filter(s => s.activity);
    if (dayActivities.length > 0) {
      preparations.push('Review daily schedule and prepare transition materials');
    }

    notes.push({
      day: currentDay.date,
      previousDay: previousDay?.date,
      connections,
      preparations
    });
  }

  return notes;
}

/**
 * Generate emergency backup plans by subject
 */
async function generateEmergencyBackupPlans() {
  const subjects = await prisma.subject.findMany({
    include: {
      milestones: {
        include: {
          activities: {
            where: {
              isFallback: true
            },
            take: 3
          }
        }
      }
    }
  });

  return subjects.map(subject => {
    // Collect all fallback activities from all milestones
    const fallbackActivities: Array<{ title: string }> = [];
    subject.milestones.forEach(milestone => {
      milestone.activities.forEach(activity => {
        if (activity.isFallback) {
          fallbackActivities.push(activity);
        }
      });
    });
    
    return {
      subject: subject.name,
      activities: fallbackActivities.slice(0, 3).map(a => a.title),
      materials: generateSubjectMaterials(subject.name)
    };
  });
}

/**
 * Extract subjects from schedule entries
 */
function extractSubjectsFromSchedule(schedule: Array<{ time: string; activity?: string; note?: string }>) {
  return schedule
    .filter(entry => entry.activity && !entry.note)
    .map(entry => ({
      time: entry.time,
      activity: entry.activity!,
      subject: inferSubjectFromActivity(entry.activity!)
    }));
}

/**
 * Infer subject from activity name (basic heuristic)
 */
function inferSubjectFromActivity(activity: string): string {
  const lower = activity.toLowerCase();
  
  if (lower.includes('math') || lower.includes('number') || lower.includes('calculation')) {
    return 'Mathematics';
  }
  if (lower.includes('read') || lower.includes('writing') || lower.includes('language')) {
    return 'Language Arts';
  }
  if (lower.includes('science') || lower.includes('experiment') || lower.includes('nature')) {
    return 'Science';
  }
  if (lower.includes('social') || lower.includes('history') || lower.includes('geography')) {
    return 'Social Studies';
  }
  if (lower.includes('art') || lower.includes('draw') || lower.includes('paint')) {
    return 'Arts';
  }
  if (lower.includes('pe') || lower.includes('physical') || lower.includes('sport')) {
    return 'Physical Education';
  }
  
  return 'General';
}

/**
 * Determine impact of calendar events on schedule
 */
function determineEventImpact(title: string, allDay: boolean): string {
  const lower = title.toLowerCase();
  
  if (allDay) {
    if (lower.includes('holiday') || lower.includes('break')) {
      return 'No classes - school closed';
    }
    if (lower.includes('pd') || lower.includes('development')) {
      return 'No students - professional development day';
    }
    if (lower.includes('assembly')) {
      return 'Modified schedule for all-school assembly';
    }
  }
  
  if (lower.includes('fire drill')) {
    return 'Brief interruption - practice emergency procedures';
  }
  if (lower.includes('photo')) {
    return 'Students may be called out for individual/class photos';
  }
  if (lower.includes('visit') || lower.includes('guest')) {
    return 'Special visitor - may affect regular activities';
  }
  
  return 'May affect regular schedule - check with office';
}

/**
 * Generate common materials list by subject
 */
function generateSubjectMaterials(subject: string): string[] {
  const commonMaterials = [
    'Whiteboard markers',
    'Paper and pencils',
    'Timer for activities'
  ];

  switch (subject.toLowerCase()) {
    case 'mathematics':
      return [...commonMaterials, 'Calculators', 'Math manipulatives', 'Graph paper'];
    case 'language arts':
      return [...commonMaterials, 'Reading books', 'Writing journals', 'Dictionary'];
    case 'science':
      return [...commonMaterials, 'Science notebooks', 'Safety goggles', 'Basic lab supplies'];
    case 'social studies':
      return [...commonMaterials, 'Maps', 'Timeline materials', 'Research books'];
    case 'arts':
      return [...commonMaterials, 'Art supplies', 'Drawing paper', 'Colored pencils'];
    default:
      return commonMaterials;
  }
}