export interface EmergencyScenario {
  id: string;
  name: string;
  description: string;
  procedures: string[];
  materials: string[];
  contacts: Array<{
    role: string;
    number: string;
    when: string;
  }>;
  modifications: {
    schedule: string[];
    activities: string[];
    safety: string[];
  };
  template: string;
}

export interface ScenarioDetectionResult {
  scenarios: EmergencyScenario[];
  triggers: string[];
  recommendedScenario?: EmergencyScenario;
}

/**
 * Extract appropriate emergency scenario templates based on conditions
 */
export async function extractScenarioTemplates(conditions?: {
  weather?: 'normal' | 'severe' | 'extreme';
  technology?: 'working' | 'partial' | 'down';
  staffing?: 'full' | 'short' | 'emergency';
  building?: 'normal' | 'maintenance' | 'emergency';
}): Promise<ScenarioDetectionResult> {
  const allScenarios = getAllScenarios();
  const triggers: string[] = [];
  let recommendedScenario: EmergencyScenario | undefined;

  // Analyze conditions and determine triggers
  if (conditions) {
    if (conditions.weather === 'severe' || conditions.weather === 'extreme') {
      triggers.push('severe_weather');
      recommendedScenario = allScenarios.find((s) => s.id === 'severe_weather');
    }

    if (conditions.technology === 'down') {
      triggers.push('technology_failure');
      if (!recommendedScenario) {
        recommendedScenario = allScenarios.find((s) => s.id === 'technology_failure');
      }
    }

    if (conditions.building === 'emergency') {
      triggers.push('lockdown');
      recommendedScenario = allScenarios.find((s) => s.id === 'lockdown'); // Override others
    }

    if (conditions.staffing === 'emergency' || conditions.staffing === 'short') {
      triggers.push('staff_shortage');
      if (!recommendedScenario) {
        recommendedScenario = allScenarios.find((s) => s.id === 'staff_shortage');
      }
    }
  }

  // If no specific conditions, provide general scenario
  if (!recommendedScenario) {
    recommendedScenario = allScenarios.find((s) => s.id === 'general_emergency');
  }

  return {
    scenarios: allScenarios,
    triggers,
    recommendedScenario,
  };
}

/**
 * Get specific scenario by ID
 */
export function getScenarioById(scenarioId: string): EmergencyScenario | undefined {
  return getAllScenarios().find((s) => s.id === scenarioId);
}

/**
 * Generate scenario-specific substitute plan content
 */
export function generateScenarioContent(
  scenario: EmergencyScenario,
  teacherName?: string,
  className?: string,
): string {
  const template = scenario.template
    .replace('{{TEACHER_NAME}}', teacherName || '[Teacher Name]')
    .replace('{{CLASS_NAME}}', className || '[Class Name]')
    .replace('{{DATE}}', new Date().toLocaleDateString())
    .replace('{{TIME}}', new Date().toLocaleTimeString());

  return template;
}

/**
 * Check current conditions and auto-select scenario
 */
export async function autoDetectScenario(_userId: number = 1): Promise<EmergencyScenario> {
  // In a real implementation, this might check:
  // - Weather APIs
  // - System status
  // - School announcements
  // - Staff availability

  // For now, we'll use a simple heuristic based on time and recent patterns
  const currentHour = new Date().getHours();
  const isWeekend = [0, 6].includes(new Date().getDay());

  // Check if there are any system issues (mock detection)
  // DISABLED: Legacy dailyPlan model removed in ETFO migration
  const recentPlans: Array<unknown> = []; // Legacy dailyPlan query disabled

  // Simple heuristics for scenario detection
  if (currentHour < 6 || currentHour > 20 || isWeekend) {
    // Off-hours emergency
    return getScenarioById('general_emergency')!;
  }

  if (recentPlans.length === 0) {
    // No recent planning data - might be start of year or system issues
    return getScenarioById('staff_shortage')!;
  }

  // Default to general scenario
  return getScenarioById('general_emergency')!;
}

/**
 * Get all available emergency scenarios
 */
function getAllScenarios(): EmergencyScenario[] {
  return [
    {
      id: 'general_emergency',
      name: 'General Emergency Plan',
      description: 'Standard emergency substitute plan for unexpected absences',
      procedures: [
        'Contact office immediately upon arrival',
        'Review daily schedule posted on desk',
        'Follow regular classroom routines as much as possible',
        'Take attendance at the beginning of each class period',
        'Maintain normal break and lunch schedules',
        'Report any issues to the office immediately',
      ],
      materials: [
        'Emergency sub folder (in top desk drawer)',
        'Class lists with emergency contacts',
        'Daily schedule and room routines',
        'Generic activity worksheets',
        'Books for silent reading time',
      ],
      contacts: [
        { role: 'Emergency Services', number: '911', when: 'For life-threatening emergencies only' },
        { role: 'Principal', number: 'Ext. 100', when: 'For any emergencies or major issues' },
        {
          role: 'Office',
          number: 'Ext. 101',
          when: 'For attendance, late students, or general questions',
        },
        { role: 'Vice Principal', number: 'Ext. 102', when: 'For discipline issues' },
        {
          role: 'School Nurse',
          number: 'Ext. 105',
          when: 'For health emergencies or student illness',
        },
      ],
      modifications: {
        schedule: [
          'Follow posted schedule as closely as possible',
          'Allow extra time for transitions between activities',
          'Be flexible with timing if students need more help',
        ],
        activities: [
          'Use pre-planned backup activities if technology fails',
          'Focus on review and reinforcement rather than new concepts',
          'Allow for more independent work time',
        ],
        safety: [
          'Keep classroom door locked during class',
          'Know location of emergency exits',
          'Familiarize yourself with evacuation procedures',
        ],
      },
      template: `EMERGENCY SUBSTITUTE PLAN - {{CLASS_NAME}}
Date: {{DATE}}
Teacher: {{TEACHER_NAME}}
Substitute: _______________

IMPORTANT: Please read this entire plan before students arrive.

DAILY SCHEDULE:
[Specific schedule will be inserted here]

EMERGENCY CONTACTS:
- Principal: Ext. 100
- Office: Ext. 101
- Vice Principal: Ext. 102

CLASSROOM PROCEDURES:
1. Students enter quietly and begin morning routine
2. Take attendance using class list in red folder
3. Follow posted schedule as closely as possible
4. For any issues, call the office immediately

BACKUP ACTIVITIES:
If planned activities cannot be completed:
- Silent reading from classroom library
- Math review worksheets (in green folder)
- Journal writing prompts (posted on wall)

Thank you for covering this class. Please leave detailed notes about the day.`,
    },

    {
      id: 'technology_failure',
      name: 'Technology Failure Plan',
      description: 'Plan for when computers, internet, or smart boards are not working',
      procedures: [
        'Do not attempt to fix technical equipment',
        'Report technology issues to IT support immediately',
        'Switch to paper-based alternatives for all activities',
        'Use analog teaching tools (whiteboard, printed materials)',
        'Inform students of technology issues and adjust expectations',
        "Focus on activities that don't require technology",
      ],
      materials: [
        'Printed worksheets and activities (in blue folder)',
        'Whiteboard markers and erasers',
        'Physical manipulatives and teaching aids',
        'Books and reading materials',
        'Paper and pencils for all students',
        'Analog timer or watch',
      ],
      contacts: [
        { role: 'Emergency Services', number: '911', when: 'For life-threatening emergencies only' },
        { role: 'IT Support', number: 'Ext. 150', when: 'To report technology issues' },
        { role: 'Office', number: 'Ext. 101', when: 'To inform of technology problems' },
        {
          role: 'Principal',
          number: 'Ext. 100',
          when: 'If technology failure affects safety or major activities',
        },
      ],
      modifications: {
        schedule: [
          'Allow extra time for distributing materials',
          'Simplify transitions that normally use technology',
          'Extend activities that work well without technology',
        ],
        activities: [
          'Replace digital activities with hands-on alternatives',
          'Use printed versions of all worksheets',
          'Focus on discussion-based learning',
          'Increase physical movement and group work',
        ],
        safety: [
          'Ensure emergency communication methods still work',
          'Have backup plans for dismissal procedures',
          'Keep manual attendance records',
        ],
      },
      template: `TECHNOLOGY FAILURE SUBSTITUTE PLAN - {{CLASS_NAME}}
Date: {{DATE}}
Teacher: {{TEACHER_NAME}}

⚠️ TECHNOLOGY ALERT: Systems may not be working normally

IMPORTANT NOTES:
- Do NOT attempt to fix any technology
- Use only paper-based materials and activities
- Report any tech issues to IT Support (Ext. 150)

NO-TECH DAILY SCHEDULE:
[Modified schedule with analog alternatives]

BACKUP ACTIVITIES (No Technology Required):
- Reading from physical books
- Hand-written assignments
- Group discussions and presentations
- Physical math manipulatives
- Art projects with paper/pencils

MATERIALS LOCATION:
- Blue folder: Printed worksheets
- Supply cabinet: Paper, pencils, manipulatives
- Bookshelf: Reading materials

Remember: Focus on engagement over technology!`,
    },

    {
      id: 'severe_weather',
      name: 'Severe Weather Plan',
      description: 'Plan for severe weather conditions affecting normal operations',
      procedures: [
        'Monitor weather announcements throughout the day',
        'Keep students calm and informed appropriately for their age',
        'Be prepared for modified dismissal procedures',
        'Keep students away from windows during severe weather',
        "Follow school's severe weather protocols",
        'Have indoor activities ready if outdoor time is cancelled',
      ],
      materials: [
        'Weather-appropriate indoor activities',
        'Comfort items (books, quiet games)',
        'Extra snacks in case of delayed dismissal',
        'Battery-powered radio for updates',
        'Flashlights (in emergency kit)',
        'First aid kit (check location)',
      ],
      contacts: [
        { role: 'Emergency Services', number: '911', when: 'For life-threatening emergencies only' },
        { role: 'Office', number: 'Ext. 101', when: 'For weather updates and dismissal changes' },
        { role: 'Principal', number: 'Ext. 100', when: 'For emergency decisions' },
        {
          role: 'District Office',
          number: '555-0123',
          when: 'For district-wide weather decisions',
        },
        { role: 'Transportation', number: '555-0124', when: 'For bus schedule changes' },
      ],
      modifications: {
        schedule: [
          'Cancel any outdoor activities or field trips',
          'Be prepared for early dismissal or extended day',
          'Keep flexible schedule based on weather updates',
          'Plan for possible indoor recess/PE',
        ],
        activities: [
          'Focus on calming, indoor activities',
          'Have extra movies or quiet games ready',
          'Prepare extended activities in case of long day',
          'Include weather education if appropriate',
        ],
        safety: [
          'Know location of severe weather shelter area',
          'Keep emergency supplies accessible',
          'Monitor school communications constantly',
          'Stay calm to keep students calm',
        ],
      },
      template: `SEVERE WEATHER SUBSTITUTE PLAN - {{CLASS_NAME}}
Date: {{DATE}}
Teacher: {{TEACHER_NAME}}

🌪️ WEATHER ALERT: Severe weather conditions expected

SAFETY FIRST:
- Keep students away from windows
- Monitor school announcements
- Be prepared for modified dismissal
- Weather shelter area: [Location]

INDOOR SCHEDULE:
[Modified schedule with indoor alternatives]

WEATHER-SAFE ACTIVITIES:
- Indoor games and movement
- Weather science discussions
- Quiet reading time
- Art projects
- Movies if extended day needed

IMPORTANT: Stay calm, keep students informed age-appropriately.
Check office every hour for updates.`,
    },

    {
      id: 'lockdown',
      name: 'Lockdown/Security Plan',
      description: 'Plan for security situations requiring lockdown procedures',
      procedures: [
        'Follow school lockdown procedures immediately',
        'Lock classroom door and turn off lights',
        'Keep students quiet and away from windows/doors',
        'Do not open door for anyone except identified school officials',
        'Take attendance silently',
        'Wait for all-clear from administration',
      ],
      materials: [
        'Emergency contact list',
        'First aid kit',
        'Water bottles (if available)',
        'Quiet activities (books, paper)',
        'Charged phone/communication device',
        'Emergency procedures card',
      ],
      contacts: [
        {
          role: '911',
          number: '911',
          when: 'Only if immediate danger and no school contact available',
        },
        {
          role: 'Principal',
          number: 'Ext. 100',
          when: 'Follow their lead - do not call unless emergency',
        },
        { role: 'Office', number: 'Ext. 101', when: 'Only if specifically instructed' },
      ],
      modifications: {
        schedule: [
          'All normal schedules are suspended',
          'Remain in secure location until all-clear',
          'No movement between rooms',
          'Cancel all outside activities',
        ],
        activities: [
          'Silent activities only',
          'No technology that makes noise',
          'Comfort and calm students quietly',
          'Reading or quiet drawing',
        ],
        safety: [
          'Door locked, lights off',
          'Students away from windows/doors',
          'Maintain silence',
          'Follow official instructions only',
        ],
      },
      template: `🔒 LOCKDOWN PROCEDURES - {{CLASS_NAME}}
Date: {{DATE}}

THIS IS A LOCKDOWN SITUATION

IMMEDIATE ACTIONS:
1. Lock door, turn off lights
2. Move students away from windows/doors
3. Keep everyone quiet
4. Take silent attendance
5. Wait for official all-clear

DO NOT:
- Open door for anyone
- Use phones unless emergency
- Make noise
- Leave secure area

KEEP STUDENTS CALM:
- Speak in whispers only
- Provide comfort quietly
- Use silent activities

Wait for administration's all-clear before resuming normal activities.`,
    },

    {
      id: 'staff_shortage',
      name: 'Staff Shortage Plan',
      description: 'Plan for when multiple staff are absent or unavailable',
      procedures: [
        'Check with office for class combinations or room changes',
        'Be prepared to supervise larger groups',
        'Focus on simple, manageable activities',
        'Use peer helpers and responsible students',
        'Communicate frequently with remaining staff',
        'Prioritize safety and basic routines',
      ],
      materials: [
        'Large group activity supplies',
        'Extra seating arrangements',
        'Simple worksheets for various grade levels',
        'Movies or educational videos',
        'Books for independent reading',
        'Art supplies for quiet activities',
      ],
      contacts: [
        { role: 'Emergency Services', number: '911', when: 'For life-threatening emergencies only' },
        { role: 'Principal', number: 'Ext. 100', when: 'For grouping decisions and support' },
        { role: 'Vice Principal', number: 'Ext. 102', when: 'For assistance with large groups' },
        {
          role: 'Office',
          number: 'Ext. 101',
          when: 'For student location and parent communication',
        },
      ],
      modifications: {
        schedule: [
          'Simplified schedule with longer activity blocks',
          'Combined classes for some activities',
          'Extra supervision during transitions',
          'Modified lunch and break schedules',
        ],
        activities: [
          'Simple, independent activities',
          'Large group games and activities',
          'Extended movie/video time if needed',
          'Cross-grade buddy reading',
        ],
        safety: [
          'Maintain higher supervision ratios',
          'Use buddy system for bathroom breaks',
          'Keep accurate headcounts',
          'Have emergency evacuation plan for larger groups',
        ],
      },
      template: `STAFF SHORTAGE SUBSTITUTE PLAN
Date: {{DATE}}
Classes Combined: _______________

⚠️ MULTIPLE STAFF ABSENT - LARGE GROUP MANAGEMENT

STUDENT COUNT: ________
ADDITIONAL CLASSES: _______________

SIMPLIFIED SCHEDULE:
- Focus on basic routines
- Longer activity periods
- Extra supervision for transitions

LARGE GROUP ACTIVITIES:
- Movies/educational videos
- Group reading time
- Simple art projects
- Indoor games

SAFETY REMINDERS:
- Higher supervision needed
- Buddy system for movements
- Frequent headcounts
- Office support available

Stay flexible and prioritize safety!`,
    },
  ];
}
