/**
 * SubstitutePlanFactory - Creates detailed substitute teacher plans
 */

import { SubstitutePlan, Prisma } from '@prisma/client';
import { BaseFactory, FactoryOptions } from '../base/BaseFactory';

export class SubstitutePlanFactory extends BaseFactory<SubstitutePlan> {
  private createdPlans: string[] = [];

  constructor(options?: FactoryOptions) {
    super(options);
  }

  /**
   * Create a substitute plan
   */
  async create(overrides?: Partial<SubstitutePlan>): Promise<SubstitutePlan> {
    const date = overrides?.date || this.generateSchoolDate({ excludeWeekends: true });
    const gradeData = this.generateGradeLevel();
    
    const plan: SubstitutePlan = {
      id: this.faker.string.uuid(),
      userId: overrides?.userId || this.faker.number.int({ min: 1, max: 1000 }),
      title: overrides?.title || `Sub Plan - ${date.toLocaleDateString()}`,
      date,
      grade: overrides?.grade || gradeData.grade,
      
      // Class information
      classInfo: overrides?.classInfo || this.generateClassInfo(),
      scheduleNotes: overrides?.scheduleNotes || this.generateSchedule(),
      
      // Student information
      studentNotes: overrides?.studentNotes || this.generateStudentNotes(),
      medicalAlerts: overrides?.medicalAlerts || this.generateMedicalAlerts(),
      behaviorSupport: overrides?.behaviorSupport || this.generateBehaviorSupport(),
      
      // Emergency information
      emergencyProcedures: overrides?.emergencyProcedures || this.generateEmergencyInfo(),
      contactInfo: overrides?.contactInfo || this.generateContactInfo(),
      
      // Lesson plans
      lessonPlans: overrides?.lessonPlans || this.generateSubLessonPlans(),
      materials: overrides?.materials || this.generateMaterialsLocation(),
      
      // Extra activities
      backupActivities: overrides?.backupActivities || this.generateBackupActivities(),
      earlyFinishers: overrides?.earlyFinishers || this.generateEarlyFinisherActivities(),
      
      // End of day
      dismissalProcedure: overrides?.dismissalProcedure || this.generateDismissalInfo(),
      homeworkNotes: overrides?.homeworkNotes || this.generateHomeworkNotes(),
      
      // Additional notes
      additionalNotes: overrides?.additionalNotes || this.generateAdditionalNotes(),
      
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as SubstitutePlan;

    if (this.prisma && this.options?.persist !== false) {
      const created = await this.prisma.substitutePlan.create({ data: plan });
      this.createdPlans.push(created.id);
      return created;
    }

    return plan;
  }

  /**
   * Generate class information
   */
  private generateClassInfo(): string {
    const templates = [
      'Grade 3, Room 204. 24 students. Generally well-behaved and eager to learn.',
      'Grade 5/6 split class. 26 students. High energy but respond well to clear expectations.',
      'Grade 1, Room 102. 20 students. Need frequent movement breaks and visual supports.',
      'Grade 4 French Immersion. 22 students. Instructions can be given in English if needed.',
    ];

    return this.faker.helpers.arrayElement(templates);
  }

  /**
   * Generate daily schedule
   */
  private generateSchedule(): string {
    return `8:45 - Entry & Attendance
9:00-10:00 - Language Arts (see lesson plan)
10:00-10:15 - Snack & Washroom
10:15-11:15 - Mathematics (see lesson plan)
11:15-11:30 - Recess (duty today - vest in closet)
11:30-12:15 - Science (see lesson plan)
12:15-1:00 - Lunch
1:00-1:45 - Geography (library period - Mrs. Smith will come get class)
1:45-2:30 - Art (see lesson plan)
2:30-2:45 - Pack up & Dismissal prep
2:45-3:00 - Dismissal`;
  }

  /**
   * Generate student notes
   */
  private generateStudentNotes(): string[] {
    return [
      'Emma - Class helper, very responsible',
      'Liam - May need extra support with reading',
      'Sophia - English Language Learner, paired with Ava for support',
      'Noah - Gets anxious with changes, reassure him you\'re here to help',
      'Mason - Very active, benefits from movement breaks',
      'Olivia - Gifted student, has extension work in folder',
    ];
  }

  /**
   * Generate medical alerts
   */
  private generateMedicalAlerts(): string[] {
    return [
      'Ethan - Severe peanut allergy, EpiPen in office',
      'Ava - Asthma, inhaler in backpack',
      'Jacob - Diabetes, may need snack outside scheduled time',
    ];
  }

  /**
   * Generate behavior support strategies
   */
  private generateBehaviorSupport(): string[] {
    return [
      'Class uses hand signals: 1 finger = water, 2 = bathroom, 3 = question',
      'Attention getter: "Class, class" they respond "Yes, yes"',
      'Behavior chart on wall - move clips up for good choices',
      'If issues arise: 1) Reminder 2) Move seat 3) Reflection sheet 4) Call office',
      'Positive reinforcement works best with this group',
    ];
  }

  /**
   * Generate emergency information
   */
  private generateEmergencyInfo(): string {
    return `Fire Drill: Line up at door, exit through main entrance, meet at basketball court
Lockdown: Lock door, cover window, students sit against back wall, stay quiet
Office: Extension 101
Nearest washroom: Down hall to the right
First aid kit: Top shelf of tall cabinet
Emergency folder: Red binder on desk`;
  }

  /**
   * Generate contact information
   */
  private generateContactInfo(): string[] {
    return [
      'Principal: Mrs. Johnson - Extension 100',
      'Secretary: Mr. Davis - Extension 101',
      'Teaching Partner: Ms. Williams, Room 206',
      'EA Support: Mrs. Brown (arrives at 10:30)',
      'My cell (emergencies only): 555-0123',
    ];
  }

  /**
   * Generate substitute lesson plans
   */
  private generateSubLessonPlans(): any[] {
    return [
      {
        subject: 'Language Arts',
        time: '9:00-10:00',
        objective: 'Students will identify main idea and supporting details',
        materials: 'Reading folders on back table, graphic organizers in bin',
        instructions: '1. Read story together (books on desk)\n2. Complete graphic organizer\n3. Share with partner\n4. If time, silent reading',
        assessment: 'Collect graphic organizers for review',
      },
      {
        subject: 'Mathematics',
        time: '10:15-11:15',
        objective: 'Practice 2-digit addition with regrouping',
        materials: 'Math workbooks, base-10 blocks in blue bin',
        instructions: '1. Number talk warm-up (write 47+38 on board)\n2. Workbook pages 45-46\n3. Early finishers: Math games in cabinet',
        assessment: 'Check workbook completion',
      },
      {
        subject: 'Science',
        time: '11:30-12:15',
        objective: 'Observe and record plant growth',
        materials: 'Plant journals, measuring tools in science kit',
        instructions: '1. Students get plants from windowsill\n2. Measure and record in journals\n3. Draw observations\n4. Water if soil is dry',
        assessment: 'Observation notes in journals',
      },
    ];
  }

  /**
   * Generate materials location
   */
  private generateMaterialsLocation(): string {
    return `• Answer keys: Top desk drawer (please return)
• Extra pencils: Pencil box on bookshelf
• Worksheets: Already photocopied in folders
• Art supplies: Lower cabinet
• Technology: Laptop cart (code: 1234)
• Books: Class library organized by level
• Games/Activities: Top shelf of closet`;
  }

  /**
   * Generate backup activities
   */
  private generateBackupActivities(): string[] {
    return [
      'Read aloud: "Charlotte\'s Web" on my desk (chapter bookmarked)',
      'Math review games in "Emergency Sub" folder',
      'Writing prompt cards in writing center',
      'Science videos bookmarked on class laptop',
      'Art project: How-to-draw books in art bin',
      'Movement break: GoNoodle videos (login on sticky note)',
    ];
  }

  /**
   * Generate early finisher activities
   */
  private generateEarlyFinisherActivities(): string[] {
    return [
      'Quiet reading from book bins',
      'Math puzzle sheets in "Fast Finishers" folder',
      'Creative writing in journals',
      'Help organize classroom library',
      'Practice spelling words',
      'Complete unfinished work from folder',
    ];
  }

  /**
   * Generate dismissal information
   */
  private generateDismissalInfo(): string {
    return `2:30 - Start pack up (agendas, homework, jackets)
2:40 - Stack chairs, tidy desks
2:45 - Bus students line up first (list on clipboard)
2:50 - Walkers and pick-ups line up
2:55 - Walk bus students to bus loop
3:00 - Dismiss walkers at main door
Parent pick-ups wait inside until parent arrives`;
  }

  /**
   * Generate homework notes
   */
  private generateHomeworkNotes(): string {
    return 'Math worksheet in homework folder (due tomorrow)\nReading: 20 minutes\nSpelling: Practice words for Friday test\nRemind students to return library books';
  }

  /**
   * Generate additional notes
   */
  private generateAdditionalNotes(): string {
    const notes = [
      'Students know routines well. They can help if you have questions.',
      'Please leave note about how the day went. Forms on my desk.',
      'If Billy\'s mom comes early, he has a dentist appointment.',
      'Rainy day schedule posted by door if needed.',
      'Thank you for taking care of my class! Coffee in staff room.',
    ];

    return this.faker.helpers.arrayElements(notes, 2).join(' ');
  }

  /**
   * Create detailed substitute plan with all components
   */
  async createDetailedSubPlan(options: {
    userId: number;
    date: Date;
    grade: number;
    includeEmergencyInfo?: boolean;
    includeStudentInfo?: boolean;
    includeSchedule?: boolean;
  }): Promise<SubstitutePlan> {
    const components: Partial<SubstitutePlan> = {
      userId: options.userId,
      date: options.date,
      grade: options.grade,
      title: `Detailed Sub Plan - ${options.date.toLocaleDateString()}`,
    };

    if (options.includeEmergencyInfo) {
      components.emergencyProcedures = this.generateDetailedEmergencyInfo();
    }

    if (options.includeStudentInfo) {
      components.studentNotes = this.generateDetailedStudentNotes();
      components.medicalAlerts = this.generateDetailedMedicalInfo();
    }

    if (options.includeSchedule) {
      components.scheduleNotes = this.generateDetailedSchedule();
    }

    return this.create(components);
  }

  /**
   * Generate detailed emergency information
   */
  private generateDetailedEmergencyInfo(): string {
    return `EMERGENCY PROCEDURES - PLEASE READ CAREFULLY

FIRE ALARM:
1. Take red emergency folder and class list
2. Line students up quickly and quietly at door
3. Exit through main entrance (or alternate route if blocked)
4. Proceed to basketball court (far end of playground)
5. Take attendance immediately
6. Wait for all-clear signal

LOCKDOWN (Announcement: "Lockdown, lockdown, lockdown"):
1. Lock classroom door immediately
2. Cover door window with black paper (top drawer)
3. Turn off lights
4. Students sit against back wall (away from windows)
5. Maintain absolute silence
6. Do NOT open door for anyone - wait for police/principal
7. If outside, go to nearest secure location

HOLD AND SECURE (External threat):
1. Bring any students from hallway inside
2. Lock door but continue normal activities
3. No one leaves classroom
4. Wait for further instructions

SHELTER IN PLACE (Environmental hazard):
1. Close all windows
2. Seal door gaps with towels (in emergency kit)
3. Continue activities away from windows
4. Monitor email for updates

MEDICAL EMERGENCY:
1. Do NOT move injured student
2. Send reliable student to office with red emergency card
3. Call office immediately: Extension 101
4. Comfort student, note time and symptoms
5. Clear area of other students if needed

Emergency Kit Location: Red backpack by door
Contains: First aid, flashlight, class list, emergency contacts`;
  }

  /**
   * Generate detailed student notes
   */
  private generateDetailedStudentNotes(): string[] {
    return [
      'CLASS LEADERS: Emma (line leader), Liam (door holder), Ava (paper passer)',
      'ACADEMIC SUPPORT: Noah - IEP for reading (modified work in blue folder)',
      'BEHAVIORAL: Mason - ADHD, needs movement breaks every 30 min (use timer)',
      'ELL STUDENTS: Sophia (Korean), Ahmad (Arabic) - pair with buddies for instructions',
      'GIFTED: Olivia & Ethan - extension work in "Challenge" folder if needed',
      'ANXIETY: Isabella - may ask to see counselor if overwhelmed (call office)',
      'SPEECH: Jacob - speech therapy Tues/Thurs 10:30 (aide will come)',
      'RELIABLE HELPERS: If you need anything, ask Emma, Ava, or Michael',
    ];
  }

  /**
   * Generate detailed medical information
   */
  private generateDetailedMedicalInfo(): string[] {
    return [
      '🚨 ETHAN - LIFE-THREATENING PEANUT ALLERGY 🚨',
      '   - EpiPen in office (backup in my desk - TOP DRAWER)',
      '   - Also allergic to tree nuts, sesame',
      '   - If exposed: 1) Give EpiPen 2) Call 911 3) Call office 4) Call parents',
      '',
      'AVA - Asthma',
      '   - Inhaler in her backpack (front pocket)',
      '   - May need before gym or if air quality poor',
      '   - If attack: 1) Get inhaler 2) Sit upright 3) Call office if no improvement',
      '',
      'JACOB - Type 1 Diabetes',
      '   - Glucose monitor and snacks in desk',
      '   - Check before lunch and gym',
      '   - If below 70 or above 250, call office immediately',
      '   - May need bathroom breaks - always allow',
      '',
      'MIA - Epilepsy',
      '   - If seizure: 1) Clear area 2) Time it 3) Turn on side 4) Call office',
      '   - Do NOT restrain or put anything in mouth',
    ];
  }

  /**
   * Generate detailed schedule
   */
  private generateDetailedSchedule(): string {
    return `DETAILED DAILY SCHEDULE - ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}

8:30 - Doors open (I usually arrive by 8:15)
8:45 - Bell rings, students enter
8:45-9:00 - MORNING ROUTINE
   • Take attendance (computer login on sticky note)
   • Lunch count on board
   • O Canada and announcements
   • Morning message on board
   • Calendar & weather helper

9:00-10:00 - LANGUAGE ARTS BLOCK
   • 9:00-9:15: Shared reading (book on easel)
   • 9:15-9:45: Writing workshop (see plans)
   • 9:45-10:00: Word study (list on board)

10:00-10:15 - SNACK & BATHROOM BREAK
   • Students eat at desks
   • 2 at a time for bathroom (use sign-out)

10:15-11:15 - MATHEMATICS
   • 10:15-10:25: Number talk/mental math
   • 10:25-10:55: Main lesson (see plans)
   • 10:55-11:15: Math centers (groups posted)

11:15-11:30 - RECESS
   • You have duty today (vest in closet)
   • Watch soccer field area
   • Whistle in vest pocket

11:30-12:15 - SCIENCE/SOCIAL STUDIES
   • Alternates daily (today is Science)
   • See detailed lesson plan

12:15-1:00 - LUNCH
   • Students dismissed at 12:15
   • Lunch supervisors take over
   • Staff room has coffee/microwave

1:00-1:45 - SPECIAL (Different each day)
   Monday: Music (Mr. Brown comes to class)
   Tuesday: Gym (walk class to gym)
   Wednesday: Library (Mrs. Smith picks up)
   Thursday: Art (in class)
   Friday: Computers (walk to lab, code: 5678)

1:45-2:30 - CHOICE TIME/CATCH-UP
   • Finish incomplete work
   • Reading/writing choice
   • Quiet activities

2:30-2:45 - PACK UP
   • Homework in agendas
   • Chairs up
   • Floor check
   • Backpacks & jackets

2:45-3:00 - DISMISSAL
   • Bus students first (list on clip board)
   • Then walkers
   • Pick-ups wait inside`;
  }

  /**
   * Create emergency sub plans folder
   */
  async createEmergencySubFolder(options: {
    userId: number;
    grade: number;
  }): Promise<SubstitutePlan[]> {
    const plans: SubstitutePlan[] = [];
    
    // Create plans for different scenarios
    const scenarios = [
      { title: 'Emergency Sub Plan - General', date: new Date() },
      { title: 'Emergency Sub Plan - Monday Schedule', date: this.getNextMonday() },
      { title: 'Emergency Sub Plan - Special Events Day', date: new Date() },
    ];

    for (const scenario of scenarios) {
      const plan = await this.createDetailedSubPlan({
        userId: options.userId,
        date: scenario.date,
        grade: options.grade,
        includeEmergencyInfo: true,
        includeStudentInfo: true,
        includeSchedule: true,
      });
      
      plans.push(plan);
    }

    return plans;
  }

  /**
   * Get next Monday date
   */
  private getNextMonday(): Date {
    const date = new Date();
    const day = date.getDay();
    const diff = day === 0 ? 1 : 8 - day;
    date.setDate(date.getDate() + diff);
    return date;
  }

  /**
   * Cleanup created plans
   */
  async cleanup(): Promise<void> {
    if (this.prisma && this.createdPlans.length > 0) {
      await this.prisma.substitutePlan.deleteMany({
        where: { id: { in: this.createdPlans } }
      });
      this.createdPlans = [];
    }
  }
}