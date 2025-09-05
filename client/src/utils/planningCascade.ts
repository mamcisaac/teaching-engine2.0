/**
 * Planning Cascade Utility Functions
 * Core functions for hierarchical curriculum planning
 */

import type {
  CascadeNode,
  LessonPlan,
  YearPlan,
  PlanningPanic,
  CascadeFilter,
  CascadeStatistics,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  CurriculumExpectation
} from '../types/planningCascade';

/**
 * EMERGENCY LESSON FINDER - Find ANY lesson by vague memory
 * "I need that butterfly lesson NOW!"
 */
export function findLessonPanicking(
  searchTerm: string,
  lessons?: LessonPlan[]
): Array<LessonPlan & { 
  whenIsProbablyScheduled: string;
  whatUnitIsItIn: string;
  didIAlreadyTeachIt: boolean;
}> {
  // In production, this would search the database
  // For now, use provided lessons or mock data
  const searchLower = searchTerm.toLowerCase();
  const allLessons = lessons || getMockLessons();
  
  // Fuzzy search across all lesson content
  const results = allLessons.filter(lesson => {
    const searchableContent = [
      lesson.name,
      ...(lesson.objectives || []),
      ...(lesson.activities || []),
      ...(lesson.materials || []),
      ...(lesson.assessment || []),
      lesson.notes || ''
    ].join(' ').toLowerCase();
    
    return searchableContent.includes(searchLower);
  });

  // Enhance results with panic-helpful info
  return results.map(lesson => ({
    ...lesson,
    whenIsProbablyScheduled: formatLessonDate(lesson.date),
    whatUnitIsItIn: lesson.unitId || 'Unknown Unit',
    didIAlreadyTeachIt: lesson.status === 'taught'
  }));
}

/**
 * PANIC COVERAGE GAPS - What haven't I covered before report cards?
 */
export function getPanicCoverageGaps(
  dueDate: Date,
  lessons?: LessonPlan[]
): {
  mustTeachToday: string[];
  canFudgeOnReportCard: string[];
  parentWillNotice: string[];
} {
  const allLessons = lessons || getMockLessons();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  
  // Find lessons that MUST be taught before report cards
  const untaughtLessons = allLessons.filter(l => l.status !== 'taught');
  
  // Categorize by urgency
  const critical = untaughtLessons.filter(l => {
    // Critical subjects parents care about
    return l.subject === 'Mathématiques' || 
           l.subject === 'Français' ||
           (l.name && l.name.toLowerCase().includes('counting')) ||
           (l.name && l.name.toLowerCase().includes('letter')) ||
           (l.name && l.name.toLowerCase().includes('reading'));
  });

  const fudgeable = untaughtLessons.filter(l => {
    // Subjects where "emerging" is acceptable
    return l.subject === 'Arts' || 
           l.subject === 'Éducation physique' ||
           (l.name && l.name.toLowerCase().includes('creative'));
  });

  const parentNotice = critical.filter(l => {
    // Things parents definitely check
    return (l.name && (
      l.name.toLowerCase().includes('skip counting') ||
      l.name.toLowerCase().includes('alphabet') ||
      l.name.toLowerCase().includes('numbers to 20')
    ));
  });

  return {
    mustTeachToday: critical.slice(0, 3).map(l => l.name),
    canFudgeOnReportCard: fudgeable.slice(0, 3).map(l => 
      `Say "emerging" for ${l.name}`
    ),
    parentWillNotice: parentNotice.map(l => 
      `${l.name} - parents drill this at home`
    )
  };
}

/**
 * EMERGENCY SUPPLY PLAN GENERATOR
 */
export function generateSupplyPlan(
  when: string | Date,
  lessons?: LessonPlan[]
): string {
  const date = typeof when === 'string' ? 
    (when === 'tomorrow' ? new Date(Date.now() + 24*60*60*1000) : new Date()) : 
    when;
    
  const allLessons = lessons || getMockLessons();
  
  // Find lessons scheduled for that day
  const dayLessons = allLessons.filter(l => {
    const lessonDate = new Date(l.date);
    return lessonDate.toDateString() === date.toDateString();
  }).slice(0, 5); // Max 5 lessons for the day

  const plan = `
SUPPLY TEACHER PLAN - ${date.toLocaleDateString()}
=============================================

⚠️ IMPORTANT NOTES:
- DO NOT attempt science experiment (materials in locked cabinet)
- Worksheets in top drawer of my desk
- Call office if: Emma, Liam, or Jackson need support
- Snack time is SACRED (10:00am sharp or chaos ensues)

📚 TODAY'S LESSONS:
${dayLessons.length > 0 ? dayLessons.map((l, i) => `
${i + 1}. ${l.name} (${formatTime(l.date)})
   - Subject: ${l.subject}
   - Materials: ${l.materials?.join(', ') || 'See folder on desk'}
   - Activity: ${l.activities?.[0] || 'Worksheet #' + (i + 42)}
   - If this fails: Free reading/drawing time
`).join('') : `
1. Math: Counting worksheet (folder on desk)
2. French: Picture book reading
3. Art: Free drawing time
4. Science: Watch Magic School Bus video
5. Gym: Indoor free play
`}

🚨 BEHAVIOR MANAGEMENT:
- Attention getter: "1-2-3, eyes on me!"
- Reward system: Stickers in top drawer
- Emergency: Call office at ext. 100

📞 EMERGENCY CONTACTS:
- Office: ext. 100
- Next door teacher: Mrs. Smith (Room 203)
- Principal: Mr. Johnson (if things go really sideways)

💊 MEDICAL ALERTS:
- Sarah: EpiPen in nurse's office (peanut allergy)
- Marcus: Inhaler in backpack (asthma)

🎯 SURVIVAL TIPS:
- They love "Simon Says" if you need 5 minutes
- Emergency videos on my desktop (password: butterfly123)
- Snacks in bottom drawer (ONLY if desperate)
- Line up alphabetically works like magic

Good luck! You've got this! 
- Ms. Emily

P.S. If all else fails, reading + drawing = happy kids
`;

  return plan;
}

// Helper functions
function formatLessonDate(date: Date): string {
  const lessonDate = new Date(date);
  const today = new Date();
  const diffDays = Math.floor((lessonDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'TODAY!';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday (missed!)';
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago (OVERDUE!)`;
  if (diffDays <= 7) return `This ${lessonDate.toLocaleDateString('en-US', { weekday: 'long' })}`;
  
  return lessonDate.toLocaleDateString();
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  });
}

function getMockLessons(): LessonPlan[] {
  // Mock data for development
  return [
    {
      id: 'lesson-butterfly',
      name: 'Life Cycle of a Butterfly',
      subject: 'Sciences',
      grade: 1,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      duration: 45,
      objectives: ['Understand metamorphosis', 'Identify butterfly stages'],
      activities: ['Read The Very Hungry Caterpillar', 'Create butterfly lifecycle craft'],
      materials: ['Book', 'Construction paper', 'Glue', 'Scissors'],
      assessment: ['Observation checklist', 'Student drawings'],
      unitId: 'unit-science-lifecycles',
      sequenceNumber: 42,
      status: 'planned'
    },
    {
      id: 'lesson-counting',
      name: 'Counting to 20',
      subject: 'Mathématiques',
      grade: 1,
      date: new Date(),
      duration: 45,
      objectives: ['Count to 20', 'Recognize numbers 1-20'],
      activities: ['Number song', 'Counting manipulatives'],
      materials: ['Number cards', 'Counting bears'],
      assessment: ['Oral counting assessment'],
      unitId: 'unit-math-numbers',
      sequenceNumber: 15,
      status: 'planned'
    },
    {
      id: 'lesson-letters',
      name: 'Letter Recognition A-M',
      subject: 'Français',
      grade: 1,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      duration: 45,
      objectives: ['Identify letters A-M', 'Letter sounds'],
      activities: ['Alphabet song', 'Letter matching game'],
      materials: ['Alphabet cards', 'Letter worksheets'],
      assessment: ['Letter identification check'],
      unitId: 'unit-french-alphabet',
      sequenceNumber: 8,
      status: 'planned'
    }
  ];
}

/**
 * Original function for backward compatibility
 * Find lessons that are causing planning panic
 */
export function findLessonsPanicking(
  lessons: LessonPlan[],
  currentDate: Date = new Date()
): PlanningPanic {
  const panicData: PlanningPanic = {
    level: 'calm',
    message: '',
    missingLessons: [],
    uncoveredExpectations: [],
    schedulingConflicts: [],
    suggestions: []
  };

  // Check for missing lessons
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);
  
  const overdueLesson = lessons.filter(lesson => {
    const lessonDate = new Date(lesson.date);
    lessonDate.setHours(0, 0, 0, 0);
    return lessonDate < today && lesson.status === 'planned';
  });

  if (overdueLesson.length > 0) {
    panicData.missingLessons = overdueLesson.map(l => l.id);
    panicData.level = overdueLesson.length > 5 ? 'extreme' : 
                      overdueLesson.length > 3 ? 'high' :
                      overdueLesson.length > 1 ? 'moderate' : 'mild';
    
    panicData.message = `URGENT: ${overdueLesson.length} overdue lessons! Immediate action required!`;
    panicData.suggestions = [
      'Reschedule overdue lessons immediately',
      'Consider combining similar lessons',
      'Request planning time or support'
    ];
  }

  return panicData;
}

/**
 * Get year at a glance view
 */
export function getYearAtGlance(yearPlan: YearPlan): CascadeStatistics {
  let totalLessons = 0;
  let completedLessons = 0;
  let upcomingLessons = 0;
  const bySubject: CascadeStatistics['bySubject'] = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Process each subject
  for (const subject of yearPlan.subjects) {
    let subjectTotal = 0;
    let subjectCompleted = 0;
    
    for (const term of subject.terms) {
      for (const unit of term.units) {
        for (const week of unit.weeks) {
          for (const lesson of week.lessons) {
            totalLessons++;
            subjectTotal++;
            
            if (lesson.status === 'taught') {
              completedLessons++;
              subjectCompleted++;
            } else if (new Date(lesson.date) >= today) {
              upcomingLessons++;
            }
          }
        }
      }
    }

    const coverage = subject.curriculum.filter(exp => exp.covered).length / 
                    (subject.curriculum.length || 1);
    
    bySubject[subject.subject] = {
      planned: subjectTotal,
      completed: subjectCompleted,
      coverage: Math.round(coverage * 100)
    };
  }

  // Calculate overdue items
  let overdueItems = 0;
  for (const subject of yearPlan.subjects) {
    for (const term of subject.terms) {
      for (const unit of term.units) {
        for (const week of unit.weeks) {
          for (const lesson of week.lessons) {
            const lessonDate = new Date(lesson.date);
            lessonDate.setHours(0, 0, 0, 0);
            if (lessonDate < today && lesson.status === 'planned') {
              overdueItems++;
            }
          }
        }
      }
    }
  }

  // Check for panic areas
  const panicAreas: PlanningPanic[] = [];
  for (const subject of yearPlan.subjects) {
    const subjectLessons: LessonPlan[] = [];
    for (const term of subject.terms) {
      for (const unit of term.units) {
        for (const week of unit.weeks) {
          subjectLessons.push(...week.lessons);
        }
      }
    }
    
    if (subjectLessons.length > 0) {
      const panic = findLessonPanicking(subjectLessons);
      if (panic.level !== 'calm') {
        panicAreas.push(panic);
      }
    }
  }

  const coveragePercentage = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  return {
    totalLessons,
    completedLessons,
    upcomingLessons,
    overdueItems,
    coveragePercentage,
    bySubject,
    panicAreas
  };
}

/**
 * Validate curriculum sequence
 */
export function validateCurriculumSequence(
  lessons: LessonPlan[],
  expectations: CurriculumExpectation[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check for missing sequence numbers
  const sequenceNumbers = new Set(lessons.map(l => l.sequenceNumber));
  const maxSequence = Math.max(...Array.from(sequenceNumbers), 0);
  
  for (let i = 1; i <= maxSequence; i++) {
    if (!sequenceNumbers.has(i)) {
      errors.push({
        type: 'sequence_gap',
        message: `Missing lesson at sequence position ${i}`,
        affectedItems: [`sequence_${i}`],
        severity: 'error'
      });
    }
  }

  // Check for duplicate sequence numbers
  const sequenceCount: Record<number, string[]> = {};
  for (const lesson of lessons) {
    if (!sequenceCount[lesson.sequenceNumber]) {
      sequenceCount[lesson.sequenceNumber] = [];
    }
    sequenceCount[lesson.sequenceNumber].push(lesson.id);
  }

  for (const [seq, ids] of Object.entries(sequenceCount)) {
    if (ids.length > 1) {
      errors.push({
        type: 'duplicate_lesson',
        message: `Multiple lessons with sequence number ${seq}`,
        affectedItems: ids,
        severity: 'error'
      });
    }
  }

  // Check for uncovered expectations
  const coveredExpectationIds = new Set(
    lessons.flatMap(l => l.objectives || [])
  );
  
  const uncoveredExpectations = expectations.filter(
    exp => !exp.covered && !coveredExpectationIds.has(exp.id)
  );

  if (uncoveredExpectations.length > 0) {
    errors.push({
      type: 'missing_expectation',
      message: `${uncoveredExpectations.length} curriculum expectations not covered`,
      affectedItems: uncoveredExpectations.map(e => e.code),
      severity: uncoveredExpectations.length > 5 ? 'critical' : 'error'
    });
  }

  // Check for time conflicts
  const dateMap: Record<string, LessonPlan[]> = {};
  for (const lesson of lessons) {
    const dateKey = new Date(lesson.date).toISOString().split('T')[0];
    if (!dateMap[dateKey]) {
      dateMap[dateKey] = [];
    }
    dateMap[dateKey].push(lesson);
  }

  for (const [date, dayLessons] of Object.entries(dateMap)) {
    if (dayLessons.length > 6) {
      warnings.push({
        type: 'rushed_unit',
        message: `Too many lessons scheduled for ${date}`,
        affectedItems: dayLessons.map(l => l.id),
        suggestion: 'Consider spreading lessons across multiple days'
      });
    }
  }

  // Check for assessment balance
  const assessmentLessons = lessons.filter(
    l => l.assessment && l.assessment.length > 0
  );
  
  if (assessmentLessons.length < lessons.length * 0.1) {
    warnings.push({
      type: 'sparse_assessment',
      message: 'Insufficient assessment activities',
      affectedItems: [],
      suggestion: 'Add more formative assessment opportunities'
    });
  }

  // Check for differentiation
  const differentiatedLessons = lessons.filter(
    l => l.differentiation && l.differentiation.length > 0
  );
  
  if (differentiatedLessons.length < lessons.length * 0.3) {
    warnings.push({
      type: 'missing_differentiation',
      message: 'Limited differentiation strategies',
      affectedItems: [],
      suggestion: 'Include more differentiation options for diverse learners'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Build cascade tree from flat data
 */
export function buildCascadeTree(
  yearPlan: YearPlan,
  filter?: CascadeFilter
): CascadeNode {
  const rootNode: CascadeNode = {
    id: yearPlan.id,
    type: 'year',
    name: `Year ${yearPlan.year}`,
    description: `Grade ${yearPlan.grade} Annual Plan`,
    startDate: yearPlan.startDate,
    endDate: yearPlan.endDate,
    subject: 'All Subjects',
    grade: yearPlan.grade,
    status: 'in_progress',
    completionPercentage: 0,
    children: []
  };

  let totalLessons = 0;
  let completedLessons = 0;

  // Build subject nodes
  for (const subject of yearPlan.subjects) {
    if (filter?.subjects && !filter.subjects.includes(subject.subject)) {
      continue;
    }

    const subjectNode: CascadeNode = {
      id: subject.id,
      type: 'year',
      name: subject.subject,
      description: `${subject.totalHours} hours`,
      startDate: yearPlan.startDate,
      endDate: yearPlan.endDate,
      subject: subject.subject,
      grade: yearPlan.grade,
      status: 'in_progress',
      completionPercentage: 0,
      parentId: rootNode.id,
      children: []
    };

    // Build term nodes
    for (const term of subject.terms) {
      const termNode: CascadeNode = {
        id: term.id,
        type: 'term',
        name: term.name,
        description: `Term ${term.termNumber}`,
        startDate: term.startDate,
        endDate: term.endDate,
        subject: subject.subject,
        grade: yearPlan.grade,
        status: 'in_progress',
        completionPercentage: 0,
        parentId: subjectNode.id,
        children: []
      };

      // Build unit nodes
      for (const unit of term.units) {
        const unitNode: CascadeNode = {
          id: unit.id,
          type: 'unit',
          name: unit.name,
          description: unit.description,
          startDate: unit.weeks[0]?.startDate || term.startDate,
          endDate: unit.weeks[unit.weeks.length - 1]?.endDate || term.endDate,
          subject: subject.subject,
          grade: yearPlan.grade,
          status: 'in_progress',
          completionPercentage: 0,
          parentId: termNode.id,
          children: []
        };

        // Build week nodes
        for (const week of unit.weeks) {
          const weekNode: CascadeNode = {
            id: week.id,
            type: 'week',
            name: `Week ${week.weekNumber}`,
            description: week.theme || '',
            startDate: week.startDate,
            endDate: week.endDate,
            subject: subject.subject,
            grade: yearPlan.grade,
            status: 'in_progress',
            completionPercentage: 0,
            parentId: unitNode.id,
            children: []
          };

          // Build lesson nodes
          let weekCompleted = 0;
          for (const lesson of week.lessons) {
            totalLessons++;
            if (lesson.status === 'taught') {
              completedLessons++;
              weekCompleted++;
            }

            const lessonNode: CascadeNode = {
              id: lesson.id,
              type: 'lesson',
              name: lesson.name,
              description: lesson.objectives?.join(', '),
              startDate: lesson.date,
              endDate: new Date(new Date(lesson.date).getTime() + lesson.duration * 60000),
              subject: lesson.subject,
              grade: lesson.grade,
              status: lesson.status === 'taught' ? 'completed' : 
                      lesson.status === 'skipped' ? 'blocked' : 'planned',
              completionPercentage: lesson.status === 'taught' ? 100 : 0,
              parentId: weekNode.id,
              metadata: {
                panicLevel: lesson.panicLevel,
                materials: lesson.materials,
                assessment: lesson.assessment
              }
            };

            weekNode.children!.push(lessonNode);
          }

          weekNode.completionPercentage = week.lessons.length > 0
            ? Math.round((weekCompleted / week.lessons.length) * 100)
            : 0;

          unitNode.children!.push(weekNode);
        }

        // Calculate unit completion
        const unitLessons = unit.weeks.flatMap(w => w.lessons);
        const unitCompleted = unitLessons.filter(l => l.status === 'taught').length;
        unitNode.completionPercentage = unitLessons.length > 0
          ? Math.round((unitCompleted / unitLessons.length) * 100)
          : 0;

        termNode.children!.push(unitNode);
      }

      // Calculate term completion
      const termLessons = term.units.flatMap(u => u.weeks.flatMap(w => w.lessons));
      const termCompleted = termLessons.filter(l => l.status === 'taught').length;
      termNode.completionPercentage = termLessons.length > 0
        ? Math.round((termCompleted / termLessons.length) * 100)
        : 0;

      subjectNode.children!.push(termNode);
    }

    // Calculate subject completion
    const subjectLessons = subject.terms.flatMap(t => 
      t.units.flatMap(u => u.weeks.flatMap(w => w.lessons))
    );
    const subjectCompleted = subjectLessons.filter(l => l.status === 'taught').length;
    subjectNode.completionPercentage = subjectLessons.length > 0
      ? Math.round((subjectCompleted / subjectLessons.length) * 100)
      : 0;

    rootNode.children!.push(subjectNode);
  }

  // Calculate overall completion
  rootNode.completionPercentage = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  return rootNode;
}

/**
 * Filter cascade nodes based on criteria
 */
export function filterCascade(
  node: CascadeNode,
  filter: CascadeFilter
): CascadeNode | null {
  // Check if node matches filter
  if (filter.subjects && !filter.subjects.includes(node.subject)) {
    return null;
  }

  if (filter.grades && !filter.grades.includes(node.grade)) {
    return null;
  }

  if (filter.dateRange) {
    const nodeStart = new Date(node.startDate);
    const nodeEnd = new Date(node.endDate);
    const rangeStart = new Date(filter.dateRange.start);
    const rangeEnd = new Date(filter.dateRange.end);
    
    if (nodeEnd < rangeStart || nodeStart > rangeEnd) {
      return null;
    }
  }

  if (filter.status && !filter.status.includes(node.status)) {
    return null;
  }

  if (filter.searchTerm) {
    const searchLower = filter.searchTerm.toLowerCase();
    const matches = 
      node.name.toLowerCase().includes(searchLower) ||
      node.description?.toLowerCase().includes(searchLower);
    
    if (!matches && (!node.children || node.children.length === 0)) {
      return null;
    }
  }

  // Filter children recursively
  if (node.children) {
    const filteredChildren = node.children
      .map(child => filterCascade(child, filter))
      .filter(child => child !== null) as CascadeNode[];

    if (filteredChildren.length === 0 && filter.searchTerm) {
      // If no children match and we're searching, exclude this node too
      const searchLower = filter.searchTerm.toLowerCase();
      const matches = 
        node.name.toLowerCase().includes(searchLower) ||
        node.description?.toLowerCase().includes(searchLower);
      
      if (!matches) {
        return null;
      }
    }

    return {
      ...node,
      children: filteredChildren
    };
  }

  return node;
}

/**
 * Calculate statistics for a cascade node
 */
export function calculateNodeStatistics(node: CascadeNode): {
  totalItems: number;
  completedItems: number;
  blockedItems: number;
  plannedItems: number;
  progressPercentage: number;
} {
  let totalItems = 0;
  let completedItems = 0;
  let blockedItems = 0;
  let plannedItems = 0;

  function countNode(n: CascadeNode): void {
    if (n.type === 'lesson') {
      totalItems++;
      if (n.status === 'completed') completedItems++;
      else if (n.status === 'blocked') blockedItems++;
      else if (n.status === 'planned') plannedItems++;
    }

    if (n.children) {
      n.children.forEach(countNode);
    }
  }

  countNode(node);

  const progressPercentage = totalItems > 0
    ? Math.round((completedItems / totalItems) * 100)
    : 0;

  return {
    totalItems,
    completedItems,
    blockedItems,
    plannedItems,
    progressPercentage
  };
}

/**
 * Get upcoming lessons
 */
export function getUpcomingLessons(
  yearPlan: YearPlan,
  daysAhead: number = 7
): LessonPlan[] {
  const upcoming: LessonPlan[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  for (const subject of yearPlan.subjects) {
    for (const term of subject.terms) {
      for (const unit of term.units) {
        for (const week of unit.weeks) {
          for (const lesson of week.lessons) {
            const lessonDate = new Date(lesson.date);
            lessonDate.setHours(0, 0, 0, 0);
            
            if (lessonDate >= today && lessonDate <= futureDate && lesson.status === 'planned') {
              upcoming.push(lesson);
            }
          }
        }
      }
    }
  }

  return upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Suggest lesson reschedule
 */
export function suggestReschedule(
  lesson: LessonPlan,
  availableSlots: Date[],
  constraints?: {
    maxPerDay?: number;
    preferredTime?: string;
    avoidDates?: Date[];
  }
): Date | null {
  const validSlots = availableSlots.filter(slot => {
    // Check if date is not in avoid list
    if (constraints?.avoidDates) {
      const slotDate = slot.toISOString().split('T')[0];
      const isAvoided = constraints.avoidDates.some(
        avoid => avoid.toISOString().split('T')[0] === slotDate
      );
      if (isAvoided) return false;
    }

    // Check preferred time
    if (constraints?.preferredTime) {
      const slotTime = slot.toTimeString().substring(0, 5);
      if (slotTime !== constraints.preferredTime) return false;
    }

    return true;
  });

  // Return the first valid slot
  return validSlots[0] || null;
}

/**
 * Generate planning recommendations
 */
export function generateRecommendations(
  statistics: CascadeStatistics,
  validation: ValidationResult
): string[] {
  const recommendations: string[] = [];

  // Based on completion rate
  if (statistics.coveragePercentage < 25) {
    recommendations.push('Focus on establishing a consistent teaching routine');
  } else if (statistics.coveragePercentage < 50) {
    recommendations.push('Good progress! Consider reviewing pace to ensure year-end completion');
  } else if (statistics.coveragePercentage < 75) {
    recommendations.push('On track! Start planning for year-end assessments');
  }

  // Based on overdue items
  if (statistics.overdueItems > 10) {
    recommendations.push('Urgent: Address overdue lessons immediately or mark as skipped');
  } else if (statistics.overdueItems > 5) {
    recommendations.push('Several lessons need attention - consider catch-up sessions');
  } else if (statistics.overdueItems > 0) {
    recommendations.push('Update status for overdue lessons');
  }

  // Based on panic areas
  for (const panic of statistics.panicAreas) {
    if (panic.level === 'extreme' || panic.level === 'high') {
      recommendations.push(...panic.suggestions);
    }
  }

  // Based on validation errors
  for (const error of validation.errors) {
    if (error.type === 'missing_expectation' && error.affectedItems.length > 5) {
      recommendations.push('Review curriculum coverage - several expectations not addressed');
    }
    if (error.type === 'sequence_gap') {
      recommendations.push('Fill gaps in lesson sequence for continuity');
    }
  }

  // Based on validation warnings
  for (const warning of validation.warnings) {
    if (warning.suggestion) {
      recommendations.push(warning.suggestion);
    }
  }

  // Subject-specific recommendations
  for (const [subject, data] of Object.entries(statistics.bySubject)) {
    if (data.coverage < 50 && data.planned > 0) {
      recommendations.push(`Review ${subject} planning - coverage is below 50%`);
    }
    if (data.completed < data.planned * 0.3 && statistics.coveragePercentage > 30) {
      recommendations.push(`${subject} is falling behind compared to other subjects`);
    }
  }

  return [...new Set(recommendations)]; // Remove duplicates
}