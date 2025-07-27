/**
 * DaybookFactory - Creates daybook entries for daily reflections
 */

import { DaybookEntry, Prisma } from '@prisma/client';
import { BaseFactory, FactoryOptions } from '../base/BaseFactory';

export class DaybookFactory extends BaseFactory<DaybookEntry> {
  private createdEntries: string[] = [];

  constructor(options?: FactoryOptions) {
    super(options);
  }

  /**
   * Create a daybook entry
   */
  async create(overrides?: Partial<DaybookEntry> & { 
    includeReflection?: boolean;
    lessonPlanId?: string;
  }): Promise<DaybookEntry> {
    const date = overrides?.date || this.generateSchoolDate({ excludeWeekends: true });
    
    const entry: DaybookEntry = {
      id: this.faker.string.uuid(),
      userId: overrides?.userId || this.faker.number.int({ min: 1, max: 1000 }),
      date,
      lessonPlanId: overrides?.lessonPlanId || null,
      
      // Quick notes during the day
      quickNotes: overrides?.quickNotes || this.generateQuickNotes(),
      
      // Student observations
      observations: overrides?.observations || this.generateObservations(),
      
      // Teaching reflections
      reflections: overrides?.reflections || 
        (overrides?.includeReflection ? this.generateReflections() : null),
      whatWorkedWell: overrides?.whatWorkedWell || this.generateWhatWorked(),
      whatToImprove: overrides?.whatToImprove || this.generateImprovements(),
      
      // Assessment notes
      assessmentNotes: overrides?.assessmentNotes || this.generateAssessmentNotes(),
      
      // Attendance and behavior
      absentStudents: overrides?.absentStudents || this.generateAbsentStudents(),
      behaviorNotes: overrides?.behaviorNotes || this.generateBehaviorNotes(),
      
      // Parent communication
      parentContacts: overrides?.parentContacts || this.generateParentContacts(),
      
      // Tomorrow's prep
      tomorrowReminders: overrides?.tomorrowReminders || this.generateReminders(),
      
      // Mood and energy
      teacherMood: overrides?.teacherMood || 
        this.faker.helpers.arrayElement(['great', 'good', 'okay', 'tired', 'stressed']) as any,
      classEnergy: overrides?.classEnergy || 
        this.faker.helpers.arrayElement(['high', 'engaged', 'typical', 'low', 'challenging']) as any,
      
      // Special events
      specialEvents: overrides?.specialEvents || this.generateSpecialEvents(),
      
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as DaybookEntry;

    if (this.prisma && this.options?.persist !== false) {
      const created = await this.prisma.daybookEntry.create({ data: entry });
      this.createdEntries.push(created.id);
      return created;
    }

    return entry;
  }

  /**
   * Generate quick notes
   */
  private generateQuickNotes(): string {
    const notes = [
      'Fire drill interrupted math lesson - need to revisit fractions tomorrow',
      'Great discussion during read-aloud - students making deep connections',
      'Technology issues with smartboard - had to adapt lesson on the fly',
      'Students very engaged with hands-on science experiment',
      'Successful math centers - all groups working independently',
      'Writing workshop went long - adjust schedule tomorrow',
      'Guest speaker was fantastic - students asked great questions',
      'Indoor recess - used time for extra reading',
    ];

    return this.faker.helpers.arrayElement(notes);
  }

  /**
   * Generate student observations
   */
  private generateObservations(): string {
    const observations = [
      'Emma showed leadership during group work today',
      'Marcus struggling with multiplication - needs extra support',
      'Noticed Sophia helping peers without being asked',
      'Alex had breakthrough moment with reading comprehension',
      'Class working well together on collaborative project',
      'Several students need reminders about organization',
      'Strong participation during science discussions',
      'Writing stamina improving across the class',
    ];

    return this.faker.helpers.arrayElements(observations, 2).join('. ');
  }

  /**
   * Generate teaching reflections
   */
  private generateReflections(): string {
    const reflections = [
      'The hands-on approach really helped students grasp the concept. Need to incorporate more manipulatives in future lessons.',
      'Pacing was too quick for some students. Should have included more guided practice before independent work.',
      'Student engagement was high when I incorporated their interests into the examples. Remember this for unit planning.',
      'The differentiated groups worked well today. Students were appropriately challenged at their levels.',
      'Need to rethink the assessment approach - formative check-ins would be more effective than end-of-lesson quiz.',
      'Technology integration enhanced the lesson significantly. Students were able to visualize abstract concepts better.',
      'Classroom management strategy of positive reinforcement showing good results. Continue this approach.',
      'Cross-curricular connections made the learning more meaningful. Students saw real-world applications.',
    ];

    return this.faker.helpers.arrayElement(reflections);
  }

  /**
   * Generate what worked well
   */
  private generateWhatWorked(): string {
    const successes = [
      'Think-pair-share strategy',
      'Visual anchor charts',
      'Hands-on manipulatives',
      'Small group rotations',
      'Exit ticket questions',
      'Movement breaks between activities',
      'Student choice in topics',
      'Peer feedback sessions',
      'Real-world connections',
      'Collaborative problem solving',
    ];

    return this.faker.helpers.arrayElements(successes, 2).join(', ');
  }

  /**
   * Generate areas for improvement
   */
  private generateImprovements(): string {
    const improvements = [
      'Time management - ran out of time for closure',
      'Need more differentiation for advanced learners',
      'Clearer instructions for independent work',
      'Better transitions between activities',
      'More wait time after questions',
      'Incorporate more student voice',
      'Check for understanding more frequently',
      'Prepare extension activities',
    ];

    return this.faker.helpers.arrayElement(improvements);
  }

  /**
   * Generate assessment notes
   */
  private generateAssessmentNotes(): string[] {
    return this.faker.helpers.arrayElements([
      'Reading: 3 students moved up a level',
      'Math: Most students mastered 2-digit addition',
      'Writing: Need to review paragraph structure',
      'Science: Strong understanding of life cycles',
      'Oral: Improvement in presentation skills',
      'Group work: Collaboration skills developing',
    ], 2);
  }

  /**
   * Generate absent students
   */
  private generateAbsentStudents(): string[] {
    if (this.faker.datatype.boolean({ probability: 0.7 })) {
      return [];
    }
    
    const students = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason'];
    return this.faker.helpers.arrayElements(students, this.faker.number.int({ min: 1, max: 3 }));
  }

  /**
   * Generate behavior notes
   */
  private generateBehaviorNotes(): string | null {
    if (this.faker.datatype.boolean({ probability: 0.6 })) {
      return null;
    }

    const notes = [
      'Had to speak with Jacob about interrupting - used behavior chart',
      'Excellent behavior today - class earned extra computer time',
      'Some issues during transition times - need to review expectations',
      'Peer conflict at recess resolved with restorative conversation',
      'Positive behavior rewards working well - continue token system',
    ];

    return this.faker.helpers.arrayElement(notes);
  }

  /**
   * Generate parent contacts
   */
  private generateParentContacts(): string[] {
    if (this.faker.datatype.boolean({ probability: 0.7 })) {
      return [];
    }

    const contacts = [
      'Called Maya\'s parents about reading progress',
      'Email to Ben\'s family about upcoming field trip',
      'Quick chat with Ali\'s mom at pickup - behavior improving',
      'Sent home note about missing homework',
      'Positive call home about leadership skills',
    ];

    return this.faker.helpers.arrayElements(contacts, 1);
  }

  /**
   * Generate tomorrow's reminders
   */
  private generateReminders(): string {
    const reminders = [
      'Prep science materials, review math assessments',
      'Photocopy worksheets, set up centers',
      'Guest speaker arriving at 10am - prepare questions',
      'Library visit - bring book bins',
      'Gym day - remind students to bring sneakers',
      'Parent volunteer coming - prepare tasks',
      'Field trip permission forms due',
      'Start new read-aloud book',
    ];

    return this.faker.helpers.arrayElements(reminders, 2).join('; ');
  }

  /**
   * Generate special events
   */
  private generateSpecialEvents(): string | null {
    if (this.faker.datatype.boolean({ probability: 0.8 })) {
      return null;
    }

    const events = [
      'Assembly - students performed admirably',
      'Birthday celebration for classmate',
      'Principal visit - shared our projects',
      'School photographer - class photo day',
      'Special guest reader from community',
      'Science fair project presentations',
      'Music class performance practice',
    ];

    return this.faker.helpers.arrayElement(events);
  }

  /**
   * Create a week of daybook entries
   */
  async createWeekOfEntries(options: {
    userId: number;
    startDate: Date;
    includeReflections?: boolean;
  }): Promise<DaybookEntry[]> {
    const entries: DaybookEntry[] = [];
    const currentDate = new Date(options.startDate);

    for (let i = 0; i < 5; i++) { // Monday to Friday
      // Skip weekends
      if (currentDate.getDay() === 0) currentDate.setDate(currentDate.getDate() + 1);
      if (currentDate.getDay() === 6) currentDate.setDate(currentDate.getDate() + 2);

      const entry = await this.create({
        userId: options.userId,
        date: new Date(currentDate),
        includeReflection: options.includeReflections && i % 2 === 0, // Every other day
      });

      entries.push(entry);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return entries;
  }

  /**
   * Create report card period entries
   */
  async createReportCardEntries(options: {
    userId: number;
    numberOfWeeks: number;
  }): Promise<DaybookEntry[]> {
    const entries: DaybookEntry[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (options.numberOfWeeks * 7));

    for (let week = 0; week < options.numberOfWeeks; week++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + (week * 7));

      const weekEntries = await this.createWeekOfEntries({
        userId: options.userId,
        startDate: weekStart,
        includeReflections: true,
      });

      entries.push(...weekEntries);
    }

    return entries;
  }

  /**
   * Create challenging day entry
   */
  async createChallengingDay(options: {
    userId: number;
    date?: Date;
  }): Promise<DaybookEntry> {
    return this.create({
      userId: options.userId,
      date: options.date,
      quickNotes: 'Difficult day - multiple behavior issues and lesson disruptions',
      observations: 'Several students off-task. Group dynamics challenging.',
      whatWorkedWell: 'Individual check-ins, movement breaks',
      whatToImprove: 'Need clearer expectations and more structured activities',
      behaviorNotes: 'Multiple redirections needed. Implemented calm-down corner.',
      teacherMood: 'stressed',
      classEnergy: 'challenging',
      tomorrowReminders: 'Reset expectations, plan engaging hands-on activities',
      reflections: 'Need to identify triggers and adjust classroom environment. Consider seating changes.',
    });
  }

  /**
   * Create successful day entry
   */
  async createSuccessfulDay(options: {
    userId: number;
    date?: Date;
  }): Promise<DaybookEntry> {
    return this.create({
      userId: options.userId,
      date: options.date,
      quickNotes: 'Fantastic day! Students engaged and learning goals met',
      observations: 'High engagement, excellent collaboration, breakthrough moments',
      whatWorkedWell: 'Hands-on activities, clear instructions, student choice',
      whatToImprove: 'Could extend successful activities in future',
      assessmentNotes: ['All students met learning targets', 'Strong demonstration of understanding'],
      teacherMood: 'great',
      classEnergy: 'high',
      parentContacts: ['Sent positive notes home to three families'],
      reflections: 'Perfect example of how engaged students can be. Remember these strategies.',
    });
  }

  /**
   * Cleanup created entries
   */
  async cleanup(): Promise<void> {
    if (this.prisma && this.createdEntries.length > 0) {
      await this.prisma.daybookEntry.deleteMany({
        where: { id: { in: this.createdEntries } }
      });
      this.createdEntries = [];
    }
  }
}