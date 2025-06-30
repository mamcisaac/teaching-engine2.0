/**
 * Integration Test Data Seeder
 * 
 * This file provides comprehensive seeding capabilities for integration tests,
 * creating realistic classroom scenarios with complete ETFO planning hierarchies.
 */

import { PrismaClient } from '@teaching-engine/database';
import { getTestPrismaClient } from '../jest.setup';
import { modernFactories, testScenarios } from './modern-factories';
import { builders, quickScenarios } from './test-data-builders';

/**
 * Integration Test Data Seeder Class
 */
export class IntegrationTestSeeder {
  constructor(private prisma: PrismaClient = getTestPrismaClient()) {}

  /**
   * Create a complete school environment for integration testing
   */
  async createSchoolEnvironment(): Promise<any> {
    console.log('🏫 Creating school environment...');

    // Create teachers for different grades and language tracks
    const englishTeacher = await builders.user()
      .teacher()
      .withEmail('teacher.english@testschool.edu')
      .withName('Ms. Sarah Johnson')
      .preferEnglish()
      .create();

    const frenchTeacher = await builders.user()
      .teacher()
      .withEmail('teacher.french@testschool.edu')  
      .withName('Mme. Marie Dubois')
      .preferFrench()
      .create();

    const adminUser = await builders.user()
      .admin()
      .withEmail('admin@testschool.edu')
      .withName('Dr. Principal Smith')
      .preferEnglish()
      .create();

    // Create subjects for each teacher
    const englishSubjects = [];
    for (const subjectId of ['english', 'math', 'science', 'social-studies']) {
      const subject = await modernFactories.subject.createFromFixture(subjectId, {
        userId: englishTeacher.id,
      });
      englishSubjects.push(subject);
    }

    const frenchSubjects = [];
    for (const subjectId of ['french', 'math', 'science']) {
      const subject = await modernFactories.subject.createFromFixture(subjectId, {
        userId: frenchTeacher.id,
      });
      frenchSubjects.push(subject);
    }

    // Create students for English teacher (Grade 3)
    const englishStudents = [];
    const englishStudentNames = [
      ['Emma', 'Johnson'], ['Liam', 'Chen'], ['Sophia', 'Williams'],
      ['Noah', 'Brown'], ['Olivia', 'Davis'], ['William', 'Miller']
    ];

    for (const [firstName, lastName] of englishStudentNames) {
      const student = await builders.student()
        .withName(firstName, lastName)
        .inGrade(3)
        .forTeacher(englishTeacher.id)
        .create();
      englishStudents.push(student);
    }

    // Create students for French teacher (Grade 4)
    const frenchStudents = [];
    const frenchStudentNames = [
      ['Gabriel', 'Dubois'], ['Camille', 'Martin'], ['Léo', 'Rousseau'],
      ['Chloé', 'Leroy'], ['Nathan', 'Moreau'], ['Amélie', 'Simon']
    ];

    for (const [firstName, lastName] of frenchStudentNames) {
      const student = await builders.student()
        .withName(firstName, lastName)
        .inGrade(4)
        .forTeacher(frenchTeacher.id)
        .create();
      frenchStudents.push(student);
    }

    console.log(`✅ Created ${englishStudents.length + frenchStudents.length} students`);

    // Create curriculum expectations
    const expectations = [];
    for (const expectationId of ['math-grade3-1', 'math-grade3-2', 'english-grade3-1', 'french-grade3-1', 'science-grade3-1']) {
      const expectation = await modernFactories.curriculumExpectation.createFromFixture(expectationId);
      expectations.push(expectation);
    }

    console.log(`✅ Created ${expectations.length} curriculum expectations`);

    // Create complete planning hierarchy for English teacher
    const englishPlanning = await this.createCompletePlanningHierarchy({
      teacher: englishTeacher,
      grade: 3,
      subject: 'Mathematics',
      expectations: expectations.filter(e => e.subject === 'Mathematics'),
    });

    // Create some external activities
    const activities = [];
    for (const activityId of ['tpt-activity-1', 'oer-activity-1', 'khan-activity-1']) {
      const activity = await modernFactories.externalActivity.createFromFixture(activityId);
      activities.push(activity);
    }

    // Create activity collections
    const mathCollection = await builders.activityCollection()
      .withName('Mathematics Activities')
      .withDescription('Curated math activities for Grade 3')
      .forUser(englishTeacher.id)
      .public()
      .create();

    // Add activities to collection
    for (const activity of activities.filter(a => a.subject === 'Mathematics')) {
      await this.prisma.activityCollectionItem.create({
        data: {
          collectionId: mathCollection.id,
          activityId: activity.id,
        },
      });
    }

    // Create calendar events
    const events = [];
    for (const eventId of ['pd-day-1', 'assembly-1', 'field-trip-1']) {
      const event = await modernFactories.calendarEvent.createFromFixture(eventId, {
        teacherId: englishTeacher.id,
      });
      events.push(event);
    }

    // Create class routines
    const routines = [];
    for (const routineId of ['morning-routine', 'transition-bathroom', 'behavior-attention', 'emergency-fire']) {
      const routine = await modernFactories.classRoutine.createFromFixture(routineId, {
        userId: englishTeacher.id,
      });
      routines.push(routine);
    }

    // Create some newsletters and parent messages
    const newsletters = await this.createParentCommunication(englishTeacher, englishStudents);

    console.log('🎉 School environment created successfully!');

    return {
      teachers: {
        english: englishTeacher,
        french: frenchTeacher,
        admin: adminUser,
      },
      subjects: {
        english: englishSubjects,
        french: frenchSubjects,
      },
      students: {
        english: englishStudents,
        french: frenchStudents,
      },
      expectations,
      planning: englishPlanning,
      activities,
      collections: [mathCollection],
      events,
      routines,
      newsletters,
    };
  }

  /**
   * Create a complete ETFO planning hierarchy
   */
  async createCompletePlanningHierarchy(options: {
    teacher: any;
    grade: number;
    subject: string;
    expectations: any[];
  }): Promise<any> {
    const { teacher, grade, subject, expectations } = options;

    console.log(`📚 Creating planning hierarchy for ${subject} Grade ${grade}...`);

    // Create long range plan
    const longRangePlan = await builders.longRangePlan()
      .withTitle(`Grade ${grade} ${subject} Long Range Plan`)
      .forAcademicYear('2024-2025')
      .fullYear()
      .forGrade(grade)
      .forSubject(subject)
      .forTeacher(teacher.id)
      .withDescription(`Comprehensive year-long plan for Grade ${grade} ${subject}`)
      .withGoals(`Students will develop strong foundational skills in ${subject.toLowerCase()}`)
      .withThemes(['Unit 1: Foundations', 'Unit 2: Building Skills', 'Unit 3: Application', 'Unit 4: Integration'])
      .withOverarchingQuestions(`How does ${subject.toLowerCase()} help us understand our world?`)
      .create();

    // Link expectations to long range plan
    for (const expectation of expectations) {
      await this.prisma.longRangePlanExpectation.create({
        data: {
          longRangePlanId: longRangePlan.id,
          expectationId: expectation.id,
          plannedTerm: 'Term 1',
        },
      });
    }

    // Create unit plans
    const unitPlans = [];
    const unitTitles = ['Number Sense and Counting', 'Place Value and Patterns', 'Addition and Subtraction'];

    for (let i = 0; i < 3; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + (i * 30));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 28);

      const unitPlan = await builders.unitPlan()
        .withTitle(unitTitles[i])
        .forLongRangePlan(longRangePlan.id)
        .forTeacher(teacher.id)
        .withDuration(startDate, endDate)
        .withEstimatedHours(20)
        .withBigIdeas(`Understanding ${unitTitles[i].toLowerCase()} builds mathematical thinking`)
        .withEssentialQuestions([
          `How do we use ${unitTitles[i].toLowerCase()} in everyday life?`,
          'What patterns can we discover?'
        ])
        .withAssessmentPlan('Ongoing formative assessment with summative evaluation at unit end')
        .withSuccessCriteria([
          'Students demonstrate understanding of key concepts',
          'Students can apply skills in new contexts'
        ])
        .withKeyVocabulary(['number', 'pattern', 'strategy', 'representation'])
        .withCrossCurricularConnections('Language Arts (mathematical vocabulary), Science (measurement and data)')
        .create();

      unitPlans.push(unitPlan);

      // Link some expectations to each unit
      const unitExpectations = expectations.slice(0, Math.ceil(expectations.length / 3));
      for (const expectation of unitExpectations) {
        await this.prisma.unitPlanExpectation.create({
          data: {
            unitPlanId: unitPlan.id,
            expectationId: expectation.id,
          },
        });
      }
    }

    // Create lesson plans for first unit
    const lessonPlans = [];
    const firstUnit = unitPlans[0];

    for (let i = 0; i < 5; i++) {
      const lessonDate = new Date();
      lessonDate.setDate(lessonDate.getDate() + i);

      const lessonPlan = await builders.etfoLessonPlan()
        .withTitle(`${firstUnit.title} - Lesson ${i + 1}`)
        .forUnit(firstUnit.id)
        .forTeacher(teacher.id)
        .onDate(lessonDate)
        .withDuration(60)
        .forGrade(grade)
        .forSubject(subject)
        .inLanguage('en')
        .withMindsOn(`Students will review previous learning about ${firstUnit.title.toLowerCase()}`)
        .withAction(`Students will engage in hands-on activities to explore lesson ${i + 1} concepts`)
        .withConsolidation('Students will share their discoveries and reflect on their learning')
        .withLearningGoals(`Students will understand key concepts from lesson ${i + 1}`)
        .withMaterials(['manipulatives', 'worksheets', 'chart paper', 'markers'])
        .wholeClass()
        .withAccommodations(['visual supports', 'extended time', 'peer support'])
        .withModifications(['reduced complexity for struggling learners'])
        .withExtensions(['additional challenges for advanced learners'])
        .formativeAssessment()
        .subFriendly(`All materials are organized and ready. Lesson plan is straightforward for substitutes.`)
        .create();

      lessonPlans.push(lessonPlan);

      // Link expectations to lesson plan
      for (const expectation of expectations.slice(0, 2)) {
        await this.prisma.eTFOLessonPlanExpectation.create({
          data: {
            lessonPlanId: lessonPlan.id,
            expectationId: expectation.id,
          },
        });
      }
    }

    // Create daybook entries for first few lessons
    const daybookEntries = [];
    for (let i = 0; i < 3; i++) {
      const lesson = lessonPlans[i];
      const entry = await builders.daybookEntry()
        .forDate(lesson.date)
        .forLesson(lesson.id)
        .forTeacher(teacher.id)
        .whatWorked(`Students were highly engaged with the hands-on activities in lesson ${i + 1}`)
        .whatDidntWork(`Some students needed additional scaffolding with the more complex concepts`)
        .nextSteps(`Provide more concrete examples and visual supports for next lesson`)
        .studentEngagement('High - students actively participated throughout')
        .studentChallenges('A few students struggled with abstract thinking')
        .studentSuccesses('Most students grasped the key concepts and could explain their thinking')
        .withNotes(`Lesson ${i + 1} went well overall. Good balance of challenge and support.`)
        .withRating(4)
        .wouldReuse()
        .create();

      daybookEntries.push(entry);

      // Link expectations to daybook entry
      for (const expectation of expectations.slice(0, 2)) {
        await this.prisma.daybookEntryExpectation.create({
          data: {
            daybookEntryId: entry.id,
            expectationId: expectation.id,
            coverage: i === 0 ? 'introduced' : i === 1 ? 'developing' : 'consolidated',
          },
        });
      }
    }

    console.log(`✅ Created planning hierarchy: 1 LRP, ${unitPlans.length} units, ${lessonPlans.length} lessons, ${daybookEntries.length} daybook entries`);

    return {
      longRangePlan,
      unitPlans,
      lessonPlans,
      daybookEntries,
    };
  }

  /**
   * Create parent communication data
   */
  async createParentCommunication(teacher: any, students: any[]): Promise<any> {
    console.log('📧 Creating parent communication data...');

    // Create newsletters
    const newsletters = [];
    
    const weeklyNewsletter = await this.prisma.newsletter.create({
      data: {
        userId: teacher.id,
        title: 'Weekly Class Update',
        titleFr: 'Mise à jour hebdomadaire de la classe',
        studentIds: students.map(s => s.id),
        dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        dateTo: new Date(),
        tone: 'friendly',
        sections: [
          {
            type: 'learning',
            title: 'This Week\'s Learning',
            content: 'Students worked on number patterns and counting strategies.',
          },
          {
            type: 'events',
            title: 'Upcoming Events',
            content: 'Science Centre field trip on April 10th.',
          },
        ],
        isDraft: false,
        sentAt: new Date(),
      },
    });
    newsletters.push(weeklyNewsletter);

    // Create parent messages for individual students
    const parentMessages = [];
    for (const student of students.slice(0, 3)) {
      const message = await this.prisma.parentMessage.create({
        data: {
          userId: teacher.id,
          title: `Progress Update - ${student.firstName}`,
          timeframe: 'weekly',
          contentEn: `${student.firstName} has shown great progress this week in mathematics. They are demonstrating strong counting skills and beginning to recognize number patterns. Keep up the excellent work!`,
          contentFr: `${student.firstName} a montré de grands progrès cette semaine en mathématiques. Il/elle démontre de solides compétences de comptage et commence à reconnaître les motifs numériques. Continuez l'excellent travail!`,
        },
      });
      parentMessages.push(message);
    }

    console.log(`✅ Created ${newsletters.length} newsletters and ${parentMessages.length} parent messages`);

    return {
      newsletters,
      parentMessages,
    };
  }

  /**
   * Create student assessment data
   */
  async createStudentAssessments(teacher: any, students: any[]): Promise<any> {
    console.log('📊 Creating student assessment data...');

    const assessmentData = [];

    for (const student of students) {
      // Create student goals
      const goals = [];
      for (let i = 0; i < 2; i++) {
        const goal = await this.prisma.studentGoal.create({
          data: {
            studentId: student.id,
            text: i === 0 
              ? 'Improve counting accuracy to 100' 
              : 'Recognize and extend number patterns',
            status: i === 0 ? 'active' : 'completed',
          },
        });
        goals.push(goal);
      }

      // Create student reflections
      const reflections = [];
      for (let i = 0; i < 3; i++) {
        const reflection = await this.prisma.studentReflection.create({
          data: {
            studentId: student.id,
            content: `Today I learned about ${i === 0 ? 'counting' : i === 1 ? 'patterns' : 'numbers'}. It was ${['fun', 'challenging', 'interesting'][i]}.`,
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
            emoji: ['🙂', '😐', '😕'][i],
          },
        });
        reflections.push(reflection);
      }

      // Create student artifacts
      const artifacts = [];
      const artifact = await this.prisma.studentArtifact.create({
        data: {
          studentId: student.id,
          title: `${student.firstName}'s Counting Chart`,
          description: 'Student-created number chart showing counting patterns',
          outcomeIds: JSON.stringify(['3.N1.1', '3.N1.2']),
        },
      });
      artifacts.push(artifact);

      assessmentData.push({
        student,
        goals,
        reflections,
        artifacts,
      });
    }

    console.log(`✅ Created assessment data for ${students.length} students`);

    return assessmentData;
  }

  /**
   * Create a quick minimal setup for simple tests
   */
  async createMinimalSetup(): Promise<any> {
    const teacher = await builders.user()
      .teacher()
      .withEmail('minimal@test.com')
      .withName('Minimal Teacher')
      .preferEnglish()
      .create();

    const students = await modernFactories.student.createMany(2, {
      userId: teacher.id,
      grade: 3,
    });

    const subject = await modernFactories.subject.createFromFixture('math', {
      userId: teacher.id,
    });

    return {
      teacher,
      students,
      subject,
    };
  }

  /**
   * Clean up all test data (use with caution)
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up test data...');
    
    // Delete in reverse dependency order
    await this.prisma.daybookEntryExpectation.deleteMany();
    await this.prisma.daybookEntry.deleteMany();
    await this.prisma.eTFOLessonPlanExpectation.deleteMany();
    await this.prisma.eTFOLessonPlanResource.deleteMany();
    await this.prisma.eTFOLessonPlan.deleteMany();
    await this.prisma.unitPlanExpectation.deleteMany();
    await this.prisma.unitPlanResource.deleteMany();
    await this.prisma.unitPlan.deleteMany();
    await this.prisma.longRangePlanExpectation.deleteMany();
    await this.prisma.longRangePlan.deleteMany();
    await this.prisma.curriculumExpectationEmbedding.deleteMany();
    await this.prisma.curriculumExpectation.deleteMany();
    await this.prisma.activityCollectionItem.deleteMany();
    await this.prisma.activityCollection.deleteMany();
    await this.prisma.activityImport.deleteMany();
    await this.prisma.activityRating.deleteMany();
    await this.prisma.externalActivity.deleteMany();
    await this.prisma.studentArtifact.deleteMany();
    await this.prisma.studentReflection.deleteMany();
    await this.prisma.studentGoal.deleteMany();
    await this.prisma.parentSummary.deleteMany();
    await this.prisma.parentMessage.deleteMany();
    await this.prisma.newsletter.deleteMany();
    await this.prisma.student.deleteMany();
    await this.prisma.classRoutine.deleteMany();
    await this.prisma.calendarEvent.deleteMany();
    await this.prisma.subject.deleteMany();
    await this.prisma.user.deleteMany();

    console.log('✅ Cleanup completed');
  }
}

/**
 * Export convenience functions
 */
export const integrationSeeder = new IntegrationTestSeeder();

/**
 * Quick setup functions for common test scenarios
 */
export const seedingUtils = {
  /**
   * Setup for ETFO planning tests
   */
  async etfoPlanningSetup(): Promise<any> {
    return await quickScenarios.englishGrade5();
  },

  /**
   * Setup for curriculum import tests
   */
  async curriculumImportSetup(): Promise<any> {
    const teacher = await builders.user()
      .teacher()
      .withEmail('curriculum@test.com')
      .withName('Curriculum Teacher')
      .preferEnglish()
      .create();

    // Create curriculum import
    const curriculumImport = await getTestPrismaClient().curriculumImport.create({
      data: {
        userId: teacher.id,
        filename: 'test-curriculum.pdf',
        originalName: 'Grade 3 Math Curriculum.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024000,
        grade: 3,
        subject: 'Mathematics',
        status: 'COMPLETED',
        sourceFormat: 'pdf',
        totalOutcomes: 10,
        processedOutcomes: 10,
        processedAt: new Date(),
      },
    });

    return {
      teacher,
      curriculumImport,
    };
  },

  /**
   * Setup for newsletter and communication tests
   */
  async communicationSetup(): Promise<any> {
    const minimal = await integrationSeeder.createMinimalSetup();
    const communication = await integrationSeeder.createParentCommunication(
      minimal.teacher,
      minimal.students
    );

    return {
      ...minimal,
      ...communication,
    };
  },

  /**
   * Setup for activity discovery tests
   */
  async activityDiscoverySetup(): Promise<any> {
    const teacher = await builders.user()
      .teacher()
      .withEmail('activity@test.com')
      .withName('Activity Teacher')
      .preferEnglish()
      .create();

    const activities = await testScenarios.createActivityDiscovery({
      userId: teacher.id,
      activityCount: 3,
      collectionCount: 1,
    });

    return {
      teacher,
      ...activities,
    };
  },
};