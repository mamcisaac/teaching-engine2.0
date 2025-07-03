/**
 * Test Data Builders with Fluent Interface
 * 
 * This file provides builder pattern implementations for creating complex test data
 * with a fluent, chainable API that makes test setup more readable and maintainable.
 */

import { PrismaClient } from '@teaching-engine/database';
import { getTestPrismaClient } from '../jest.setup';
import { modernFactories } from './modern-factories';

/**
 * Base Builder Interface
 */
abstract class BaseBuilder<T> {
  protected data: Partial<T> = {};
  protected prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || getTestPrismaClient();
  }

  /**
   * Build the data object without persisting to database
   */
  abstract build(): Partial<T>;

  /**
   * Create and persist the entity to database
   */
  abstract async create(): Promise<T>;

  /**
   * Reset the builder data
   */
  reset(): this {
    this.data = {};
    return this;
  }
}

/**
 * User Builder
 */
export class UserBuilder extends BaseBuilder<any> {
  teacher(): this {
    this.data.role = 'teacher';
    return this;
  }

  admin(): this {
    this.data.role = 'admin';
    return this;
  }

  withEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  preferEnglish(): this {
    this.data.preferredLanguage = 'en';
    return this;
  }

  preferFrench(): this {
    this.data.preferredLanguage = 'fr';
    return this;
  }

  build(): Partial<any> {
    return modernFactories.user.build(this.data);
  }

  async create(): Promise<any> {
    return await modernFactories.user.create(this.data);
  }
}

/**
 * Student Builder removed - app does not store student data
 */

/**
 * Curriculum Expectation Builder
 */
export class CurriculumExpectationBuilder extends BaseBuilder<any> {
  withCode(code: string): this {
    this.data.code = code;
    return this;
  }

  withDescription(description: string, descriptionFr?: string): this {
    this.data.description = description;
    if (descriptionFr) {
      this.data.descriptionFr = descriptionFr;
    }
    return this;
  }

  inStrand(strand: string, strandFr?: string): this {
    this.data.strand = strand;
    if (strandFr) {
      this.data.strandFr = strandFr;
    }
    return this;
  }

  inSubstrand(substrand: string, substrandFr?: string): this {
    this.data.substrand = substrand;
    if (substrandFr) {
      this.data.substrandFr = substrandFr;
    }
    return this;
  }

  forGrade(grade: number): this {
    this.data.grade = grade;
    return this;
  }

  forSubject(subject: string): this {
    this.data.subject = subject;
    return this;
  }

  mathematics(): this {
    return this.forSubject('Mathematics')
      .inStrand('Number Sense and Numeration', 'Sens du nombre et numération');
  }

  english(): this {
    return this.forSubject('English Language Arts')
      .inStrand('Reading', 'Lecture');
  }

  french(): this {
    return this.forSubject('French')
      .inStrand('Communication orale', 'Communication orale');
  }

  science(): this {
    return this.forSubject('Science')
      .inStrand('Life Systems', 'Systèmes vivants');
  }

  build(): Partial<any> {
    return modernFactories.curriculumExpectation.build(this.data);
  }

  async create(): Promise<any> {
    return await modernFactories.curriculumExpectation.create(this.data);
  }
}

/**
 * Long Range Plan Builder
 */
export class LongRangePlanBuilder extends BaseBuilder<any> {
  withTitle(title: string, titleFr?: string): this {
    this.data.title = title;
    if (titleFr) {
      this.data.titleFr = titleFr;
    }
    return this;
  }

  forAcademicYear(year: string): this {
    this.data.academicYear = year;
    return this;
  }

  fullYear(): this {
    this.data.term = 'Full Year';
    return this;
  }

  term1(): this {
    this.data.term = 'Term 1';
    return this;
  }

  term2(): this {
    this.data.term = 'Term 2';
    return this;
  }

  forGrade(grade: number): this {
    this.data.grade = grade;
    return this;
  }

  forSubject(subject: string): this {
    this.data.subject = subject;
    return this;
  }

  forTeacher(userId: number): this {
    this.data.userId = userId;
    return this;
  }

  withDescription(description: string, descriptionFr?: string): this {
    this.data.description = description;
    if (descriptionFr) {
      this.data.descriptionFr = descriptionFr;
    }
    return this;
  }

  withGoals(goals: string, goalsFr?: string): this {
    this.data.goals = goals;
    if (goalsFr) {
      this.data.goalsFr = goalsFr;
    }
    return this;
  }

  withThemes(themes: string[]): this {
    this.data.themes = JSON.stringify(themes);
    return this;
  }

  withOverarchingQuestions(questions: string): this {
    this.data.overarchingQuestions = questions;
    return this;
  }

  build(): Partial<any> {
    return modernFactories.longRangePlan.build(this.data);
  }

  async create(): Promise<any> {
    return await modernFactories.longRangePlan.create(this.data);
  }
}

/**
 * Unit Plan Builder
 */
export class UnitPlanBuilder extends BaseBuilder<any> {
  withTitle(title: string, titleFr?: string): this {
    this.data.title = title;
    if (titleFr) {
      this.data.titleFr = titleFr;
    }
    return this;
  }

  forLongRangePlan(longRangePlanId: string): this {
    this.data.longRangePlanId = longRangePlanId;
    return this;
  }

  forTeacher(userId: number): this {
    this.data.userId = userId;
    return this;
  }

  withDuration(startDate: Date, endDate: Date): this {
    this.data.startDate = startDate;
    this.data.endDate = endDate;
    return this;
  }

  withEstimatedHours(hours: number): this {
    this.data.estimatedHours = hours;
    return this;
  }

  withBigIdeas(bigIdeas: string, bigIdeasFr?: string): this {
    this.data.bigIdeas = bigIdeas;
    if (bigIdeasFr) {
      this.data.bigIdeasFr = bigIdeasFr;
    }
    return this;
  }

  withEssentialQuestions(questions: string[]): this {
    this.data.essentialQuestions = JSON.stringify(questions);
    return this;
  }

  withAssessmentPlan(plan: string): this {
    this.data.assessmentPlan = plan;
    return this;
  }

  withSuccessCriteria(criteria: string[]): this {
    this.data.successCriteria = JSON.stringify(criteria);
    return this;
  }

  withKeyVocabulary(vocabulary: string[]): this {
    this.data.keyVocabulary = JSON.stringify(vocabulary);
    return this;
  }

  withCrossCurricularConnections(connections: string): this {
    this.data.crossCurricularConnections = connections;
    return this;
  }

  build(): Partial<any> {
    return modernFactories.unitPlan.build(this.data);
  }

  async create(): Promise<any> {
    return await modernFactories.unitPlan.create(this.data);
  }
}

/**
 * ETFO Lesson Plan Builder
 */
export class ETFOLessonPlanBuilder extends BaseBuilder<any> {
  withTitle(title: string, titleFr?: string): this {
    this.data.title = title;
    if (titleFr) {
      this.data.titleFr = titleFr;
    }
    return this;
  }

  forUnit(unitPlanId: string): this {
    this.data.unitPlanId = unitPlanId;
    return this;
  }

  forTeacher(userId: number): this {
    this.data.userId = userId;
    return this;
  }

  onDate(date: Date): this {
    this.data.date = date;
    return this;
  }

  withDuration(minutes: number): this {
    this.data.duration = minutes;
    return this;
  }

  forGrade(grade: number): this {
    this.data.grade = grade;
    return this;
  }

  forSubject(subject: string): this {
    this.data.subject = subject;
    return this;
  }

  inLanguage(language: 'en' | 'fr'): this {
    this.data.language = language;
    return this;
  }

  withMindsOn(mindsOn: string, mindsOnFr?: string): this {
    this.data.mindsOn = mindsOn;
    if (mindsOnFr) {
      this.data.mindsOnFr = mindsOnFr;
    }
    return this;
  }

  withAction(action: string, actionFr?: string): this {
    this.data.action = action;
    if (actionFr) {
      this.data.actionFr = actionFr;
    }
    return this;
  }

  withConsolidation(consolidation: string, consolidationFr?: string): this {
    this.data.consolidation = consolidation;
    if (consolidationFr) {
      this.data.consolidationFr = consolidationFr;
    }
    return this;
  }

  withLearningGoals(goals: string, goalsFr?: string): this {
    this.data.learningGoals = goals;
    if (goalsFr) {
      this.data.learningGoalsFr = goalsFr;
    }
    return this;
  }

  withMaterials(materials: string[]): this {
    this.data.materials = JSON.stringify(materials);
    return this;
  }

  wholeClass(): this {
    this.data.grouping = 'whole class';
    return this;
  }

  smallGroup(): this {
    this.data.grouping = 'small group';
    return this;
  }

  pairs(): this {
    this.data.grouping = 'pairs';
    return this;
  }

  individual(): this {
    this.data.grouping = 'individual';
    return this;
  }

  withAccommodations(accommodations: string[]): this {
    this.data.accommodations = JSON.stringify(accommodations);
    return this;
  }

  withModifications(modifications: string[]): this {
    this.data.modifications = JSON.stringify(modifications);
    return this;
  }

  withExtensions(extensions: string[]): this {
    this.data.extensions = JSON.stringify(extensions);
    return this;
  }

  formativeAssessment(): this {
    this.data.assessmentType = 'formative';
    return this;
  }

  summativeAssessment(): this {
    this.data.assessmentType = 'summative';
    return this;
  }

  diagnosticAssessment(): this {
    this.data.assessmentType = 'diagnostic';
    return this;
  }

  subFriendly(notes?: string): this {
    this.data.isSubFriendly = true;
    if (notes) {
      this.data.subNotes = notes;
    }
    return this;
  }

  notSubFriendly(): this {
    this.data.isSubFriendly = false;
    return this;
  }

  build(): Partial<any> {
    return modernFactories.etfoLessonPlan.build(this.data);
  }

  async create(): Promise<any> {
    return await modernFactories.etfoLessonPlan.create(this.data);
  }
}

/**
 * Daybook Entry Builder
 */
export class DaybookEntryBuilder extends BaseBuilder<any> {
  forDate(date: Date): this {
    this.data.date = date;
    return this;
  }

  forLesson(lessonPlanId: string): this {
    this.data.lessonPlanId = lessonPlanId;
    return this;
  }

  forTeacher(userId: number): this {
    this.data.userId = userId;
    return this;
  }

  whatWorked(what: string, whatFr?: string): this {
    this.data.whatWorked = what;
    if (whatFr) {
      this.data.whatWorkedFr = whatFr;
    }
    return this;
  }

  whatDidntWork(what: string, whatFr?: string): this {
    this.data.whatDidntWork = what;
    if (whatFr) {
      this.data.whatDidntWorkFr = whatFr;
    }
    return this;
  }

  nextSteps(steps: string, stepsFr?: string): this {
    this.data.nextSteps = steps;
    if (stepsFr) {
      this.data.nextStepsFr = stepsFr;
    }
    return this;
  }

  classEngagement(engagement: string): this {
    this.data.classEngagement = engagement;
    return this;
  }

  commonChallenges(challenges: string): this {
    this.data.commonChallenges = challenges;
    return this;
  }

  notableAchievements(successes: string): this {
    this.data.notableAchievements = successes;
    return this;
  }

  withNotes(notes: string, notesFr?: string): this {
    this.data.notes = notes;
    if (notesFr) {
      this.data.notesFr = notesFr;
    }
    return this;
  }

  withPrivateNotes(notes: string): this {
    this.data.privateNotes = notes;
    return this;
  }

  withRating(rating: number): this {
    this.data.overallRating = rating;
    return this;
  }

  wouldReuse(): this {
    this.data.wouldReuseLesson = true;
    return this;
  }

  wouldNotReuse(): this {
    this.data.wouldReuseLesson = false;
    return this;
  }

  build(): Partial<any> {
    return modernFactories.daybookEntry.build(this.data);
  }

  async create(): Promise<any> {
    return await modernFactories.daybookEntry.create(this.data);
  }
}

/**
 * Activity Collection Builder
 */
export class ActivityCollectionBuilder extends BaseBuilder<any> {
  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  forUser(userId: number): this {
    this.data.userId = userId;
    return this;
  }

  public(): this {
    this.data.isPublic = true;
    return this;
  }

  private(): this {
    this.data.isPublic = false;
    return this;
  }

  build(): Partial<any> {
    return {
      name: 'Test Collection',
      description: 'Test collection description',
      isPublic: false,
      ...this.data,
    };
  }

  async create(): Promise<any> {
    const collectionData = this.build();
    return await this.prisma.activityCollection.create({ data: collectionData });
  }
}

/**
 * Complex Scenario Builder
 * 
 * This builder creates complete planning scenarios with all related entities
 */
export class ScenarioBuilder {
  private prisma: PrismaClient;
  private _teacher?: any;
  private _students: any[] = [];
  private _subjects: any[] = [];
  private _expectations: any[] = [];
  private _longRangePlans: any[] = [];
  private _unitPlans: any[] = [];
  private _lessonPlans: any[] = [];
  private _daybookEntries: any[] = [];

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || getTestPrismaClient();
  }

  /**
   * Create a teacher for the scenario
   */
  async withTeacher(name?: string, preferredLanguage: 'en' | 'fr' = 'en'): Promise<this> {
    this._teacher = await new UserBuilder(this.prisma)
      .teacher()
      .withName(name || 'Test Teacher')
      .preferEnglish()
      .create();
    
    if (preferredLanguage === 'fr') {
      this._teacher = await this.prisma.user.update({
        where: { id: this._teacher.id },
        data: { preferredLanguage: 'fr' },
      });
    }

    return this;
  }

  /**
   * Add students to the scenario
   */
  async withStudents(count: number, grade: number = 3): Promise<this> {
    if (!this._teacher) {
      throw new Error('Teacher must be created first');
    }

    const studentNames = [
      ['Emma', 'Johnson'], ['Liam', 'Chen'], ['Sophia', 'Williams'],
      ['Noah', 'Brown'], ['Olivia', 'Davis'], ['William', 'Miller'],
      ['Ava', 'Wilson'], ['James', 'Moore'], ['Isabella', 'Anderson'],
      ['Alexander', 'Taylor'], ['Mia', 'Thomas'], ['Benjamin', 'Jackson'],
    ];

    for (let i = 0; i < count; i++) {
      const [firstName, lastName] = studentNames[i % studentNames.length];
      const student = await new StudentBuilder(this.prisma)
        .withName(`${firstName}${i > 11 ? ` ${Math.floor(i / 12) + 1}` : ''}`, lastName)
        .inGrade(grade)
        .forTeacher(this._teacher.id)
        .create();
      
      this._students.push(student);
    }

    return this;
  }

  /**
   * Add subjects to the scenario
   */
  async withSubjects(subjects: string[]): Promise<this> {
    if (!this._teacher) {
      throw new Error('Teacher must be created first');
    }

    for (const subject of subjects) {
      const subjectRecord = await modernFactories.subject.createFromFixture(
        subject, 
        { userId: this._teacher.id }
      );
      this._subjects.push(subjectRecord);
    }

    return this;
  }

  /**
   * Create a complete planning hierarchy for mathematics
   */
  async withMathPlanningHierarchy(): Promise<this> {
    if (!this._teacher) {
      throw new Error('Teacher must be created first');
    }

    // Create curriculum expectations
    const mathExpectations = [];
    for (const expectationId of ['math-grade3-1', 'math-grade3-2']) {
      const expectation = await modernFactories.curriculumExpectation.createFromFixture(expectationId);
      mathExpectations.push(expectation);
      this._expectations.push(expectation);
    }

    // Create long range plan
    const longRangePlan = await new LongRangePlanBuilder(this.prisma)
      .withTitle('Grade 3 Mathematics')
      .forAcademicYear('2024-2025')
      .fullYear()
      .forGrade(3)
      .forSubject('Mathematics')
      .forTeacher(this._teacher.id)
      .withThemes(['Number Sense', 'Algebra', 'Geometry', 'Data Management'])
      .create();

    this._longRangePlans.push(longRangePlan);

    // Link expectations to long range plan
    for (const expectation of mathExpectations) {
      await this.prisma.longRangePlanExpectation.create({
        data: {
          longRangePlanId: longRangePlan.id,
          expectationId: expectation.id,
        },
      });
    }

    // Create unit plans
    const unitPlan = await new UnitPlanBuilder(this.prisma)
      .withTitle('Number Sense and Counting')
      .forLongRangePlan(longRangePlan.id)
      .forTeacher(this._teacher.id)
      .withDuration(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
      .withEstimatedHours(20)
      .withBigIdeas('Numbers help us understand quantities and relationships')
      .withEssentialQuestions(['How do we use numbers in everyday life?'])
      .withKeyVocabulary(['number', 'count', 'pattern', 'place value'])
      .create();

    this._unitPlans.push(unitPlan);

    // Link expectations to unit plan
    for (const expectation of mathExpectations) {
      await this.prisma.unitPlanExpectation.create({
        data: {
          unitPlanId: unitPlan.id,
          expectationId: expectation.id,
        },
      });
    }

    // Create lesson plans
    for (let i = 0; i < 3; i++) {
      const lessonDate = new Date();
      lessonDate.setDate(lessonDate.getDate() + i);

      const lessonPlan = await new ETFOLessonPlanBuilder(this.prisma)
        .withTitle(`Counting Lesson ${i + 1}`)
        .forUnit(unitPlan.id)
        .forTeacher(this._teacher.id)
        .onDate(lessonDate)
        .withDuration(60)
        .forGrade(3)
        .forSubject('Mathematics')
        .inLanguage('en')
        .withMindsOn('Review previous counting strategies')
        .withAction('Practice counting with manipulatives')
        .withConsolidation('Share counting strategies with class')
        .withLearningGoals('Students will count accurately to 100')
        .withMaterials(['counting bears', 'number charts', 'worksheets'])
        .wholeClass()
        .formativeAssessment()
        .subFriendly('All materials prepared in math bin')
        .create();

      this._lessonPlans.push(lessonPlan);

      // Create daybook entry for first lesson
      if (i === 0) {
        const daybookEntry = await new DaybookEntryBuilder(this.prisma)
          .forDate(lessonDate)
          .forLesson(lessonPlan.id)
          .forTeacher(this._teacher.id)
          .whatWorked('Students engaged with manipulatives')
          .whatDidntWork('Some students needed more scaffolding')
          .nextSteps('Provide additional practice opportunities')
          .classEngagement('High - active participation')
          .withRating(4)
          .wouldReuse()
          .create();

        this._daybookEntries.push(daybookEntry);
      }
    }

    return this;
  }

  /**
   * Build and return the complete scenario
   */
  build(): any {
    return {
      teacher: this._teacher,
      students: this._students,
      subjects: this._subjects,
      expectations: this._expectations,
      longRangePlans: this._longRangePlans,
      unitPlans: this._unitPlans,
      lessonPlans: this._lessonPlans,
      daybookEntries: this._daybookEntries,
    };
  }
}

/**
 * Export builder instances for easy use
 */
export const builders = {
  user: () => new UserBuilder(),
  // student builder removed - app does not store student data
  curriculumExpectation: () => new CurriculumExpectationBuilder(),
  longRangePlan: () => new LongRangePlanBuilder(),
  unitPlan: () => new UnitPlanBuilder(),
  etfoLessonPlan: () => new ETFOLessonPlanBuilder(),
  daybookEntry: () => new DaybookEntryBuilder(),
  activityCollection: () => new ActivityCollectionBuilder(),
  scenario: () => new ScenarioBuilder(),
};

/**
 * Quick scenario builders for common test cases
 */
export const quickScenarios = {
  /**
   * Create a Grade 3 French Immersion classroom
   */
  async frenchImmersionGrade3(): Promise<any> {
    return await new ScenarioBuilder()
      .withTeacher('Mme. Dubois', 'fr')
      .then(s => s.withStudents(6, 3))
      .then(s => s.withSubjects(['french', 'math', 'science']))
      .then(s => s.withMathPlanningHierarchy())
      .then(s => s.build());
  },

  /**
   * Create a Grade 5 English classroom with full planning
   */
  async englishGrade5(): Promise<any> {
    return await new ScenarioBuilder()
      .withTeacher('Ms. Johnson', 'en')
      .then(s => s.withStudents(8, 5))
      .then(s => s.withSubjects(['english', 'math', 'science', 'social-studies']))
      .then(s => s.withMathPlanningHierarchy())
      .then(s => s.build());
  },

  /**
   * Create a minimal teacher setup for quick tests
   */
  async minimalTeacher(): Promise<any> {
    const teacher = await builders.user()
      .teacher()
      .withName('Quick Test Teacher')
      .preferEnglish()
      .create();

    const students = await modernFactories.student.createMany(3, {
      userId: teacher.id,
      grade: 3,
    });

    return { teacher, students };
  },
};