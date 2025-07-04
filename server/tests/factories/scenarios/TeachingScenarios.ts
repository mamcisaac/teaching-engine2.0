/**
 * TeachingScenarios - Creates complete teaching scenarios for testing
 * 
 * Provides realistic, interconnected data for common teaching workflows
 */

import { PrismaClient } from '@prisma/client';
import { UserFactory } from '../domain/UserFactory';
import { CurriculumFactory } from '../domain/CurriculumFactory';
import { LessonPlanFactory } from '../domain/LessonPlanFactory';
import { UnitPlanFactory } from '../domain/UnitPlanFactory';
import { LongRangePlanFactory } from '../domain/LongRangePlanFactory';
import { DaybookFactory } from '../domain/DaybookFactory';
import { SubstitutePlanFactory } from '../domain/SubstitutePlanFactory';
import { faker } from '@faker-js/faker';

export class TeachingScenarios {
  private prisma?: PrismaClient;
  private userFactory: UserFactory;
  private curriculumFactory: CurriculumFactory;
  private lessonPlanFactory: LessonPlanFactory;
  private unitPlanFactory: UnitPlanFactory;
  private longRangePlanFactory: LongRangePlanFactory;
  private daybookFactory: DaybookFactory;
  private substitutePlanFactory: SubstitutePlanFactory;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma;
    
    // Initialize all factories
    this.userFactory = new UserFactory({ persist: !!prisma });
    this.curriculumFactory = new CurriculumFactory({ persist: !!prisma });
    this.lessonPlanFactory = new LessonPlanFactory({ persist: !!prisma });
    this.unitPlanFactory = new UnitPlanFactory({ persist: !!prisma });
    this.longRangePlanFactory = new LongRangePlanFactory({ persist: !!prisma });
    this.daybookFactory = new DaybookFactory({ persist: !!prisma });
    this.substitutePlanFactory = new SubstitutePlanFactory({ persist: !!prisma });

    // Set prisma if provided
    if (prisma) {
      this.userFactory.setPrisma(prisma);
      this.curriculumFactory.setPrisma(prisma);
      this.lessonPlanFactory.setPrisma(prisma);
      this.unitPlanFactory.setPrisma(prisma);
      this.longRangePlanFactory.setPrisma(prisma);
      this.daybookFactory.setPrisma(prisma);
      this.substitutePlanFactory.setPrisma(prisma);
    }
  }

  /**
   * Scenario 1: New Teacher Setup
   * A new teacher starting their first year
   */
  async newTeacherSetup(options?: {
    grade?: number;
    subjects?: string[];
    language?: 'en' | 'fr' | 'bilingual';
  }) {
    const grade = options?.grade || faker.number.int({ min: 1, max: 8 });
    const subjects = options?.subjects || ['Mathematics', 'Language', 'Science'];
    
    // Create new teacher
    const teacher = await this.userFactory.createWithPreferences({
      grades: [grade],
      subjects,
      language: options?.language || 'en',
      experience: 'new',
    });

    // Create curriculum expectations for their grade
    const expectations: any = {};
    for (const subject of subjects) {
      expectations[subject] = await this.curriculumFactory.createStrand({
        subject,
        grade,
        strand: this.getMainStrand(subject),
        count: 10,
      });
    }

    // Create first long-range plan
    const longRangePlan = await this.longRangePlanFactory.create({
      userId: teacher.id,
      title: `${teacher.metadata.gradesTaught[0]} Year Plan`,
      grade,
      subject: subjects[0],
      academicYear: this.getCurrentSchoolYear(),
    });

    // Create first unit plan
    const unitPlan = await this.unitPlanFactory.create({
      userId: teacher.id,
      longRangePlanId: longRangePlan.id,
      title: 'Getting Started Unit',
      description: 'Building classroom community and establishing routines',
    });

    // Create first week of lessons
    const lessons = await this.lessonPlanFactory.createWeekOfLessons({
      userId: teacher.id,
      unitPlanId: unitPlan.id,
      grade,
      subject: subjects[0],
      startDate: new Date(),
    });

    // Create welcome materials
    const substitutePlan = await this.substitutePlanFactory.create({
      userId: teacher.id,
      title: 'Emergency Sub Plan - First Month',
      date: new Date(),
    });

    return {
      teacher,
      expectations,
      longRangePlan,
      unitPlan,
      lessons,
      substitutePlan,
      summary: {
        teacherName: teacher.name,
        grade,
        subjects,
        totalExpectations: Object.values(expectations).flat().length,
        lessonsCreated: lessons.length,
      },
    };
  }

  /**
   * Scenario 2: Full School Year Planning
   * Complete year plan with all components
   */
  async fullSchoolYearPlan(options?: {
    teacher?: any;
    grade?: number;
    subjects?: string[];
  }) {
    const teacher = options?.teacher || await this.userFactory.create();
    const grade = options?.grade || faker.number.int({ min: 1, max: 8 });
    const subjects = options?.subjects || ['Mathematics', 'Language', 'Science', 'Social Studies'];
    
    const yearData = {
      teacher,
      academicYear: this.getCurrentSchoolYear(),
      longRangePlans: [] as any[],
      unitPlans: [] as any[],
      lessonPlans: [] as any[],
      expectations: {} as any,
    };

    // Create expectations for all subjects
    for (const subject of subjects) {
      const gradeCurriculum = await this.curriculumFactory.createGradeCurriculum(grade);
      yearData.expectations[subject] = gradeCurriculum.subjects[subject] || [];
    }

    // Create long-range plans for each subject
    for (const subject of subjects) {
      const lrp = await this.longRangePlanFactory.create({
        userId: teacher.id,
        title: `Grade ${grade} ${subject} Year Plan`,
        grade,
        subject,
        academicYear: yearData.academicYear,
      });
      yearData.longRangePlans.push(lrp);

      // Create units for each term
      const termUnits = await this.unitPlanFactory.createTermUnits({
        userId: teacher.id,
        longRangePlanId: lrp.id,
        term: 1,
        grade,
        subject,
      });
      yearData.unitPlans.push(...termUnits);

      // Create sample lessons for first unit
      if (termUnits.length > 0) {
        const weekLessons = await this.lessonPlanFactory.createWeekOfLessons({
          userId: teacher.id,
          unitPlanId: termUnits[0].id,
          grade,
          subject,
          startDate: termUnits[0].startDate,
        });
        yearData.lessonPlans.push(...weekLessons);
      }
    }

    // Create daybook entries for first week
    const daybookEntries = [];
    for (const lesson of yearData.lessonPlans.slice(0, 5)) {
      const entry = await this.daybookFactory.create({
        userId: teacher.id,
        lessonPlanId: lesson.id,
        date: lesson.date,
      });
      daybookEntries.push(entry);
    }

    return {
      ...yearData,
      daybookEntries,
      summary: {
        teacher: teacher.name,
        grade,
        subjects,
        totalUnits: yearData.unitPlans.length,
        totalLessons: yearData.lessonPlans.length,
        planningComplete: true,
      },
    };
  }

  /**
   * Scenario 3: Substitute Teacher Day
   * Everything needed for a supply teacher
   */
  async substituteTeacherDay(options?: {
    regularTeacher?: any;
    date?: Date;
    grade?: number;
  }) {
    const regularTeacher = options?.regularTeacher || 
      await this.userFactory.create({ name: 'Ms. Johnson' });
    
    const supplyTeacher = await this.userFactory.createSupplyTeacher();
    const date = options?.date || new Date();
    const grade = options?.grade || 3;

    // Create substitute plan
    const subPlan = await this.substitutePlanFactory.createDetailedSubPlan({
      userId: regularTeacher.id,
      date,
      grade,
      includeEmergencyInfo: true,
      includeStudentInfo: true,
      includeSchedule: true,
    });

    // Create substitute-friendly lessons
    const lessons = await this.lessonPlanFactory.createSubFriendlyLessons(3, {
      grade,
      subject: 'Mathematics',
    });

    // Create class routines
    const routines = await this.createClassRoutines(regularTeacher.id);

    // Create emergency backup activities
    const backupActivities = {
      morning: 'Silent reading with reading response journal',
      math: 'Math review worksheets in "Extra Practice" folder',
      afternoon: 'Art project: Draw and write about your favorite book character',
    };

    return {
      regularTeacher,
      supplyTeacher,
      subPlan,
      lessons,
      routines,
      backupActivities,
      summary: {
        date: date.toDateString(),
        grade,
        totalLessons: lessons.length,
        hasEmergencyPlan: true,
        isSubFriendly: true,
      },
    };
  }

  /**
   * Scenario 4: Parent-Teacher Conference Prep
   * All materials needed for conferences
   */
  async parentTeacherConference(options?: {
    teacher?: any;
    numberOfStudents?: number;
    conferenceWeek?: Date;
  }) {
    const teacher = options?.teacher || await this.userFactory.create();
    const numberOfStudents = options?.numberOfStudents || 25;
    const conferenceWeek = options?.conferenceWeek || 
      this.getNextConferenceWeek();

    // Create recent lesson plans showing variety
    const recentLessons = await this.lessonPlanFactory.createMany(10, {
      userId: teacher.id,
    });

    // Create assessment data
    const assessmentData = this.generateAssessmentData(numberOfStudents);

    // Create unit summaries
    const unitSummaries = await this.unitPlanFactory.createMany(3, {
      userId: teacher.id,
    });

    // Create communication logs
    const communicationLogs = this.generateCommunicationLogs(numberOfStudents);

    // Create conference schedule
    const conferenceSchedule = this.generateConferenceSchedule(
      numberOfStudents, 
      conferenceWeek
    );

    return {
      teacher,
      recentLessons,
      assessmentData,
      unitSummaries,
      communicationLogs,
      conferenceSchedule,
      summary: {
        totalStudents: numberOfStudents,
        conferencesScheduled: conferenceSchedule.length,
        week: conferenceWeek.toDateString(),
        preparationComplete: true,
      },
    };
  }

  /**
   * Scenario 5: Report Card Period
   * Everything needed for report card writing
   */
  async reportCardPeriod(options?: {
    teacher?: any;
    term?: number;
    grade?: number;
  }) {
    const teacher = options?.teacher || await this.userFactory.create();
    const term = options?.term || 1;
    const grade = options?.grade || 5;

    // Create term's worth of lesson plans
    const termStart = this.getTermStartDate(term);
    const lessons = [];
    
    for (let week = 0; week < 10; week++) {
      const weekStart = new Date(termStart);
      weekStart.setDate(weekStart.getDate() + (week * 7));
      
      const weekLessons = await this.lessonPlanFactory.createWeekOfLessons({
        userId: teacher.id,
        unitPlanId: faker.string.uuid(),
        grade,
        subject: 'Mathematics',
        startDate: weekStart,
      });
      lessons.push(...weekLessons);
    }

    // Create daybook reflections
    const daybookEntries = [];
    for (const lesson of lessons.slice(0, 20)) {
      const entry = await this.daybookFactory.create({
        userId: teacher.id,
        lessonPlanId: lesson.id,
        date: lesson.date,
        includeReflection: true,
      });
      daybookEntries.push(entry);
    }

    // Generate learning skills tracking
    const learningSkills = this.generateLearningSkillsData(25);

    // Create comment bank
    const commentBank = this.generateCommentBank();

    return {
      teacher,
      term,
      grade,
      lessons,
      daybookEntries,
      learningSkills,
      commentBank,
      summary: {
        totalLessons: lessons.length,
        totalReflections: daybookEntries.length,
        reportCardReady: true,
      },
    };
  }

  /**
   * Scenario 6: Cross-Curricular Project
   * Integrated learning across subjects
   */
  async crossCurricularProject(options?: {
    teacher?: any;
    theme?: string;
    subjects?: string[];
    duration?: number;
  }) {
    const teacher = options?.teacher || await this.userFactory.create();
    const theme = options?.theme || 'Our Community Heroes';
    const subjects = options?.subjects || ['Language', 'Social Studies', 'Art', 'Drama'];
    const duration = options?.duration || 15; // days

    // Create integrated unit plans
    const units = await this.unitPlanFactory.createIntegratedUnit({
      userId: teacher.id,
      longRangePlanId: faker.string.uuid(),
      subjects,
      theme,
    });

    // Create cross-curricular expectations
    const expectations = await this.curriculumFactory.createCrossCurricular({
      subjects,
      grade: 4,
      theme,
    });

    // Create integrated lessons
    const lessons = [];
    for (const unit of units) {
      const unitLessons = await this.lessonPlanFactory.createMany(3, {
        userId: teacher.id,
        unitPlanId: unit.id,
        title: `${theme} - ${unit.title}`,
      });
      lessons.push(...unitLessons);
    }

    // Create culminating task plan
    const culminatingTask = {
      title: `${theme} Community Fair`,
      description: 'Students will create presentations showcasing their learning',
      components: subjects.map(s => ({
        subject: s,
        task: this.getCulminatingTaskForSubject(s, theme),
      })),
    };

    return {
      teacher,
      theme,
      units,
      expectations,
      lessons,
      culminatingTask,
      summary: {
        theme,
        subjectsIntegrated: subjects.length,
        totalLessons: lessons.length,
        duration: `${duration} days`,
      },
    };
  }

  /**
   * Scenario 7: French Immersion Classroom
   * Bilingual teaching scenario
   */
  async frenchImmersionClassroom(options?: {
    grade?: number;
    percentFrench?: number;
  }) {
    const grade = options?.grade || 2;
    const percentFrench = options?.percentFrench || 50;

    // Create bilingual teacher
    const teacher = await this.userFactory.createWithPreferences({
      grades: [grade],
      subjects: ['Mathematics', 'Science', 'French Language Arts'],
      language: 'bilingual',
    });

    // Create French curriculum expectations
    const frenchExpectations = await this.curriculumFactory.createMany(20, {
      grade,
      subject: 'French Language Arts',
      descriptionFr: faker.lorem.sentence(),
    });

    // Create bilingual unit plans
    const mathUnit = await this.unitPlanFactory.create({
      userId: teacher.id,
      title: 'Numbers and Operations',
      titleFr: 'Nombres et opérations',
      grade,
      subject: 'Mathematics',
    });

    const scienceUnit = await this.unitPlanFactory.create({
      userId: teacher.id,
      title: 'Living Things',
      titleFr: 'Les êtres vivants',
      grade,
      subject: 'Science',
    });

    // Create bilingual lessons
    const frenchLessons = await this.lessonPlanFactory.createMany(5, {
      userId: teacher.id,
      language: 'fr',
      unitPlanId: mathUnit.id,
    });

    const englishLessons = await this.lessonPlanFactory.createMany(5, {
      userId: teacher.id,
      language: 'en',
      unitPlanId: scienceUnit.id,
    });

    // Create bilingual resources
    const resources = {
      anchorCharts: [
        { en: 'Problem Solving Steps', fr: 'Étapes de résolution de problèmes' },
        { en: 'Science Vocabulary', fr: 'Vocabulaire scientifique' },
      ],
      wordWalls: {
        math: ['addition/addition', 'subtract/soustraire', 'equal/égal'],
        science: ['observe/observer', 'predict/prédire', 'experiment/expérimenter'],
      },
    };

    return {
      teacher,
      frenchExpectations,
      units: [mathUnit, scienceUnit],
      frenchLessons,
      englishLessons,
      resources,
      summary: {
        grade,
        percentFrench,
        totalBilingualLessons: frenchLessons.length + englishLessons.length,
        immersionLevel: percentFrench >= 50 ? 'Full' : 'Partial',
      },
    };
  }

  /**
   * Scenario 8: Special Education Support
   * Inclusive classroom with differentiated instruction
   */
  async specialEducationSupport(options?: {
    teacher?: any;
    numberOfIEPs?: number;
    supportLevel?: 'low' | 'medium' | 'high';
  }) {
    const teacher = options?.teacher || await this.userFactory.create();
    const numberOfIEPs = options?.numberOfIEPs || 5;
    const supportLevel = options?.supportLevel || 'medium';

    // Create modified expectations
    const modifiedExpectations = await this.curriculumFactory.createMany(15, {
      description: faker.helpers.arrayElement([
        'identify and describe simple patterns',
        'demonstrate understanding with support',
        'participate in guided activities',
      ]),
    });

    // Create differentiated lessons
    const lessons = await this.lessonPlanFactory.createMany(10, {
      userId: teacher.id,
      accommodations: this.generateAccommodations(supportLevel),
      modifications: this.generateModifications(supportLevel),
    });

    // Create IEP tracking data
    const iepData = this.generateIEPData(numberOfIEPs);

    // Create support resources
    const supportResources = {
      visualSupports: [
        'Visual schedule cards',
        'First/Then boards',
        'Choice boards',
        'Token economy charts',
      ],
      sensoryTools: [
        'Fidget tools',
        'Noise-cancelling headphones',
        'Weighted lap pads',
        'Standing desks',
      ],
      academicSupports: [
        'Graphic organizers',
        'Word prediction software',
        'Text-to-speech tools',
        'Manipulatives',
      ],
    };

    return {
      teacher,
      modifiedExpectations,
      lessons,
      iepData,
      supportResources,
      summary: {
        studentsWithIEPs: numberOfIEPs,
        supportLevel,
        totalAccommodations: lessons[0]?.accommodations?.length || 0,
        inclusiveEnvironment: true,
      },
    };
  }

  // Helper methods

  private getMainStrand(subject: string): string {
    const strands: Record<string, string> = {
      Mathematics: 'Number Sense and Numeration',
      Language: 'Reading',
      Science: 'Life Systems',
      'Social Studies': 'Heritage and Identity',
    };
    return strands[subject] || 'General';
  }

  private getCurrentSchoolYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  }

  private getNextConferenceWeek(): Date {
    const now = new Date();
    const month = now.getMonth();
    
    // Conference weeks typically in November and March
    if (month < 10) {
      return new Date(now.getFullYear(), 10, 15); // November 15
    } else {
      return new Date(now.getFullYear() + 1, 2, 15); // March 15
    }
  }

  private getTermStartDate(term: number): Date {
    const now = new Date();
    const year = now.getFullYear();
    
    switch (term) {
      case 1:
        return new Date(year, 8, 1); // September 1
      case 2:
        return new Date(year + 1, 0, 15); // January 15
      default:
        return new Date(year, 8, 1);
    }
  }

  private async createClassRoutines(userId: number) {
    const routines = [
      {
        title: 'Morning Entry Routine',
        description: 'Students enter quietly, unpack, complete morning work',
        category: 'morning',
        timeOfDay: '8:45 AM',
      },
      {
        title: 'Transition Between Subjects',
        description: 'Clean up materials, stand and stretch, prepare for next subject',
        category: 'transition',
        timeOfDay: 'Between lessons',
      },
      {
        title: 'End of Day Routine',
        description: 'Pack up, clean desks, stack chairs, line up by bus/walker',
        category: 'dismissal',
        timeOfDay: '3:15 PM',
      },
    ];

    // Would create these in database if prisma is available
    return routines;
  }

  private generateAssessmentData(numberOfStudents: number) {
    const assessments = [];
    for (let i = 0; i < numberOfStudents; i++) {
      assessments.push({
        studentId: `STU${i + 1}`,
        mathLevel: faker.helpers.arrayElement(['Below', 'Approaching', 'Meeting', 'Exceeding']),
        readingLevel: faker.helpers.arrayElement(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']),
        writingLevel: faker.helpers.arrayElement(['Emerging', 'Developing', 'Proficient']),
      });
    }
    return assessments;
  }

  private generateCommunicationLogs(numberOfStudents: number) {
    const logs = [];
    for (let i = 0; i < Math.floor(numberOfStudents * 0.3); i++) {
      logs.push({
        studentId: `STU${faker.number.int({ min: 1, max: numberOfStudents })}`,
        date: faker.date.recent({ days: 30 }),
        type: faker.helpers.arrayElement(['Phone', 'Email', 'Note', 'Meeting']),
        topic: faker.helpers.arrayElement(['Progress update', 'Behavior', 'Achievement', 'Concern']),
        notes: faker.lorem.sentence(),
      });
    }
    return logs;
  }

  private generateConferenceSchedule(numberOfStudents: number, startDate: Date) {
    const schedule = [];
    const currentDate = new Date(startDate);
    const timeslots = ['3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM'];
    
    for (let i = 0; i < numberOfStudents; i++) {
      schedule.push({
        studentId: `STU${i + 1}`,
        date: new Date(currentDate),
        time: faker.helpers.arrayElement(timeslots),
        duration: 20,
      });
      
      // Move to next day after 6 conferences
      if ((i + 1) % 6 === 0) {
        currentDate.setDate(currentDate.getDate() + 1);
        // Skip weekend
        if (currentDate.getDay() === 6) currentDate.setDate(currentDate.getDate() + 2);
      }
    }
    return schedule;
  }

  private generateLearningSkillsData(numberOfStudents: number) {
    const skills = ['Responsibility', 'Organization', 'Independent Work', 
                   'Collaboration', 'Initiative', 'Self-Regulation'];
    const data = [];
    
    for (let i = 0; i < numberOfStudents; i++) {
      const studentSkills: any = { studentId: `STU${i + 1}` };
      skills.forEach(skill => {
        studentSkills[skill] = faker.helpers.arrayElement(['E', 'G', 'S', 'N']);
      });
      data.push(studentSkills);
    }
    return data;
  }

  private generateCommentBank() {
    return {
      strengths: [
        'demonstrates strong problem-solving skills',
        'works well collaboratively with peers',
        'shows creativity in their approach to learning',
        'actively participates in class discussions',
        'takes pride in their work',
      ],
      improvements: [
        'would benefit from additional practice with',
        'is encouraged to ask for help when needed',
        'should focus on organizing their work',
        'needs to develop strategies for',
        'is working on improving',
      ],
      nextSteps: [
        'continue to challenge themselves with',
        'practice daily reading at home',
        'use math manipulatives to support learning',
        'participate more actively in group work',
        'develop independence in',
      ],
    };
  }

  private generateAccommodations(level: 'low' | 'medium' | 'high'): string[] {
    const base = ['Preferential seating', 'Visual supports'];
    const medium = [...base, 'Extended time', 'Frequent breaks', 'Chunk assignments'];
    const high = [...medium, 'Scribe for written work', 'Reduced workload', 'Alternative workspace'];
    
    return level === 'high' ? high : level === 'medium' ? medium : base;
  }

  private generateModifications(level: 'low' | 'medium' | 'high'): string[] {
    const base = ['Simplified instructions'];
    const medium = [...base, 'Modified expectations', 'Adapted materials'];
    const high = [...medium, 'Alternative curriculum', 'Individualized program'];
    
    return level === 'high' ? high : level === 'medium' ? medium : base;
  }

  private generateIEPData(count: number) {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        studentId: `IEP${i + 1}`,
        primaryNeed: faker.helpers.arrayElement(['Learning Disability', 'ADHD', 'ASD', 'Developmental']),
        accommodations: this.generateAccommodations('medium'),
        modifications: this.generateModifications('low'),
        goals: [
          'Improve reading comprehension by one grade level',
          'Develop organizational skills for task completion',
          'Increase math problem-solving accuracy to 70%',
        ],
      });
    }
    return data;
  }

  private getCulminatingTaskForSubject(subject: string, theme: string): string {
    const tasks: Record<string, string> = {
      Language: `Write and present a speech about a ${theme.toLowerCase()}`,
      'Social Studies': `Create a timeline or map showing ${theme.toLowerCase()} in our community`,
      Art: `Design a mural representing ${theme.toLowerCase()}`,
      Drama: `Perform a skit demonstrating the importance of ${theme.toLowerCase()}`,
      Science: `Create an experiment or demonstration related to ${theme.toLowerCase()}`,
      Mathematics: `Analyze data and create graphs about ${theme.toLowerCase()}`,
    };
    return tasks[subject] || `Create a project about ${theme.toLowerCase()}`;
  }

  /**
   * Cleanup all created data
   */
  async cleanup() {
    await Promise.all([
      this.userFactory.cleanup(),
      this.curriculumFactory.cleanup(),
      this.lessonPlanFactory.cleanup(),
      this.unitPlanFactory.cleanup(),
      this.longRangePlanFactory.cleanup(),
      this.daybookFactory.cleanup(),
      this.substitutePlanFactory.cleanup(),
    ]);
  }
}