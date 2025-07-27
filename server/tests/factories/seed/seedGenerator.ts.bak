/**
 * Seed Data Generator
 * 
 * Creates comprehensive seed data for development and testing
 * Run with: pnpm tsx tests/factories/seed/seedGenerator.ts
 */

import { PrismaClient } from '@prisma/client';
import { TeachingScenarios } from '../scenarios/TeachingScenarios';
import { PerformanceDataGenerator } from '../performance/PerformanceDataGenerator';
import { BilingualFactory } from '../localization/BilingualFactory';
import { UserFactory } from '../domain/UserFactory';
import { CurriculumFactory } from '../domain/CurriculumFactory';

const prisma = new PrismaClient();

interface SeedOptions {
  mode: 'minimal' | 'standard' | 'comprehensive' | 'performance';
  includeTestUsers?: boolean;
  includeDemoData?: boolean;
  includeBilingualContent?: boolean;
}

class SeedGenerator {
  private scenarios: TeachingScenarios;
  private perfGenerator: PerformanceDataGenerator;
  private bilingualFactory: BilingualFactory;
  private userFactory: UserFactory;
  private curriculumFactory: CurriculumFactory;

  constructor() {
    this.scenarios = new TeachingScenarios(prisma);
    this.perfGenerator = new PerformanceDataGenerator(prisma);
    this.bilingualFactory = new BilingualFactory();
    this.userFactory = new UserFactory({ persist: true });
    this.curriculumFactory = new CurriculumFactory({ persist: true });
    
    // Set prisma connections
    this.userFactory.setPrisma(prisma);
    this.curriculumFactory.setPrisma(prisma);
  }

  /**
   * Main seed function
   */
  async seed(options: SeedOptions = { mode: 'standard' }) {
    console.log(`🌱 Starting seed generation in ${options.mode} mode...`);
    
    try {
      // Clear existing data if needed
      if (process.env.CLEAR_DB === 'true') {
        await this.clearDatabase();
      }

      switch (options.mode) {
        case 'minimal':
          await this.seedMinimal(options);
          break;
        case 'standard':
          await this.seedStandard(options);
          break;
        case 'comprehensive':
          await this.seedComprehensive(options);
          break;
        case 'performance':
          await this.seedPerformance(options);
          break;
      }

      console.log('✅ Seed generation completed successfully!');
    } catch (_error) {
      console.error('❌ Seed generation failed:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Minimal seed - Just enough to get started
   */
  private async seedMinimal(options: SeedOptions) {
    console.log('Creating minimal seed data...');

    // Create test user
    const testUser = await this.userFactory.create({
      email: 'teacher@test.com',
      password: 'password123',
      name: 'Test Teacher',
    });

    // Create basic curriculum for one grade
    const curriculum = await this.curriculumFactory.createGradeCurriculum(3);

    // Create new teacher setup
    const setup = await this.scenarios.newTeacherSetup({
      grade: 3,
      subjects: ['Mathematics', 'Language'],
    });

    console.log(`Created:
      - 1 test user (teacher@test.com / password123)
      - ${Object.values(curriculum.subjects).flat().length} curriculum expectations
      - 1 teacher with basic setup
      - ${setup.lessons.length} lesson plans`);
  }

  /**
   * Standard seed - Good for development
   */
  private async seedStandard(options: SeedOptions) {
    console.log('Creating standard seed data...');

    // Create test users
    if (options.includeTestUsers !== false) {
      await this.createTestUsers();
    }

    // Create curriculum for grades 1-6
    console.log('Creating curriculum data...');
    for (let grade = 1; grade <= 6; grade++) {
      await this.curriculumFactory.createGradeCurriculum(grade);
    }

    // Create demo teachers with different scenarios
    if (options.includeDemoData !== false) {
      await this.createDemoScenarios(options);
    }

    // Create sample templates
    await this.createSampleTemplates();

    console.log('Standard seed data created successfully');
  }

  /**
   * Comprehensive seed - Full feature showcase
   */
  private async seedComprehensive(options: SeedOptions) {
    console.log('Creating comprehensive seed data...');

    // Start with standard seed
    await this.seedStandard(options);

    // Add school-wide data
    console.log('Creating school-wide data...');
    const schoolStaff = await this.userFactory.createSchoolStaff({
      schoolName: 'Maple Grove Elementary',
      size: 'medium',
    });

    // Create full year planning for multiple teachers
    console.log('Creating full year plans...');
    for (const teacher of schoolStaff.teachers.slice(0, 5)) {
      await this.scenarios.fullSchoolYearPlan({
        teacher,
        grade: this.getRandomGrade(),
        subjects: this.getGradeSubjects(),
      });
    }

    // Add special scenarios
    console.log('Creating special scenarios...');
    await this.createSpecialScenarios();

    // Add bilingual content if requested
    if (options.includeBilingualContent) {
      await this.createBilingualContent();
    }

    console.log('Comprehensive seed data created successfully');
  }

  /**
   * Performance seed - For load testing
   */
  private async seedPerformance(options: SeedOptions) {
    console.log('Creating performance test data...');
    
    await this.perfGenerator.generateSchoolBoardData({
      numberOfSchools: 5,
      teachersPerSchool: 20,
      yearsOfData: 2,
    });

    // Also create query performance test data
    await this.perfGenerator.generateQueryPerformanceData();

    console.log('Performance test data created successfully');
  }

  /**
   * Create test users for development
   */
  private async createTestUsers() {
    const testUsers = [
      {
        email: 'admin@test.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
      },
      {
        email: 'teacher@test.com',
        password: 'teacher123',
        name: 'Demo Teacher',
        role: 'teacher',
      },
      {
        email: 'supply@test.com',
        password: 'supply123',
        name: 'Supply Teacher',
        role: 'supply',
      },
      {
        email: 'principal@test.com',
        password: 'principal123',
        name: 'Principal Smith',
        role: 'principal',
      },
    ];

    console.log('Creating test users...');
    for (const userData of testUsers) {
      try {
        await this.userFactory.create(userData);
        console.log(`  ✓ Created ${userData.email}`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`  - ${userData.email} already exists`);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Create demonstration scenarios
   */
  private async createDemoScenarios(options: SeedOptions) {
    console.log('Creating demo scenarios...');

    // New teacher scenario
    const newTeacher = await this.scenarios.newTeacherSetup({
      grade: 3,
      subjects: ['Mathematics', 'Language', 'Science'],
    });
    console.log('  ✓ New teacher setup created');

    // Experienced teacher with full planning
    const experiencedTeacher = await this.scenarios.fullSchoolYearPlan({
      grade: 5,
      subjects: ['Mathematics', 'Language', 'Science', 'Social Studies'],
    });
    console.log('  ✓ Experienced teacher with full year plan created');

    // Substitute teacher scenario
    await this.scenarios.substituteTeacherDay({
      grade: 2,
    });
    console.log('  ✓ Substitute teacher day created');

    // Parent-teacher conference prep
    await this.scenarios.parentTeacherConference({
      numberOfStudents: 24,
    });
    console.log('  ✓ Parent-teacher conference scenario created');

    // Cross-curricular project
    await this.scenarios.crossCurricularProject({
      theme: 'Our Local Community',
      subjects: ['Social Studies', 'Language', 'Art'],
    });
    console.log('  ✓ Cross-curricular project created');

    // French immersion classroom (if bilingual enabled)
    if (options.includeBilingualContent) {
      await this.scenarios.frenchImmersionClassroom({
        grade: 4,
        percentFrench: 50,
      });
      console.log('  ✓ French immersion classroom created');
    }
  }

  /**
   * Create sample templates
   */
  private async createSampleTemplates() {
    console.log('Creating sample templates...');

    const templates = [
      {
        name: 'Math Problem Solving',
        type: 'lesson',
        subject: 'Mathematics',
        content: {
          mindsOn: 'Number talk with today\'s problem',
          action: 'Guided practice, then independent work',
          consolidation: 'Gallery walk to share strategies',
        },
      },
      {
        name: 'Reading Response',
        type: 'lesson',
        subject: 'Language',
        content: {
          mindsOn: 'Book talk and predictions',
          action: 'Independent reading with sticky notes',
          consolidation: 'Partner discussion and sharing',
        },
      },
      {
        name: 'Science Investigation',
        type: 'lesson',
        subject: 'Science',
        content: {
          mindsOn: 'Wonder wall - What do you notice?',
          action: 'Hands-on investigation and data recording',
          consolidation: 'Conclusions and next questions',
        },
      },
      {
        name: 'Weekly Newsletter',
        type: 'communication',
        subject: 'General',
        content: {
          sections: ['Learning Highlights', 'Upcoming Events', 'Home Connections'],
        },
      },
    ];

    // Create templates in database
    for (const template of templates) {
      await prisma.planTemplate.create({
        data: {
          title: template.name,
          description: `Standard template for ${template.subject}`,
          category: template.type,
          gradeLevel: JSON.stringify([1, 2, 3, 4, 5, 6]),
          subject: template.subject,
          templateData: template.content,
          isPublic: true,
          userId: 1, // Admin user
        },
      });
    }

    console.log(`  ✓ Created ${templates.length} sample templates`);
  }

  /**
   * Create special education and inclusion scenarios
   */
  private async createSpecialScenarios() {
    // Special education support scenario
    await this.scenarios.specialEducationSupport({
      numberOfIEPs: 5,
      supportLevel: 'medium',
    });
    console.log('  ✓ Special education support scenario created');

    // Report card period scenario
    await this.scenarios.reportCardPeriod({
      term: 1,
      grade: 4,
    });
    console.log('  ✓ Report card period scenario created');
  }

  /**
   * Create bilingual content
   */
  private async createBilingualContent() {
    console.log('Creating bilingual content...');

    // Create bilingual curriculum expectations
    const grades = [1, 2, 3, 4, 5, 6];
    const subjects = ['Mathematics', 'Science', 'Language'];

    for (const grade of grades) {
      for (const subject of subjects) {
        const expectations = await this.curriculumFactory.createMany(5, {
          grade,
          subject,
          descriptionFr: 'Description en français',
          strandFr: 'Domaine',
        });
      }
    }

    console.log('  ✓ Bilingual curriculum expectations created');

    // Create French immersion resources
    const frenchResources = await this.bilingualFactory.generateFrenchImmersionLesson({
      grade: 3,
      subject: 'mathematics',
      immersionLevel: 'middle',
    });

    console.log('  ✓ French immersion resources created');
  }

  /**
   * Clear database (be careful!)
   */
  private async clearDatabase() {
    console.log('⚠️  Clearing existing database...');
    
    // Delete in correct order to respect foreign keys
    await prisma.daybookEntryExpectation.deleteMany({});
    await prisma.eTFOLessonPlanExpectation.deleteMany({});
    await prisma.unitPlanExpectation.deleteMany({});
    await prisma.longRangePlanExpectation.deleteMany({});
    
    await prisma.daybookEntry.deleteMany({});
    await prisma.eTFOLessonPlanResource.deleteMany({});
    await prisma.eTFOLessonPlan.deleteMany({});
    await prisma.unitPlanResource.deleteMany({});
    await prisma.unitPlan.deleteMany({});
    await prisma.longRangePlan.deleteMany({});
    
    await prisma.curriculumExpectationEmbedding.deleteMany({});
    await prisma.curriculumExpectation.deleteMany({});
    await prisma.expectationCluster.deleteMany({});
    await prisma.curriculumImport.deleteMany({});
    
    await prisma.substitutePlan.deleteMany({});
    await prisma.newsletter.deleteMany({});
    await prisma.classRoutine.deleteMany({});
    await prisma.classroomAnnouncement.deleteMany({});
    await prisma.planTemplate.deleteMany({});
    
    await prisma.user.deleteMany({});
    
    console.log('  ✓ Database cleared');
  }

  /**
   * Helper methods
   */
  private getRandomGrade(): number {
    return Math.floor(Math.random() * 8) + 1;
  }

  private getGradeSubjects(): string[] {
    const core = ['Mathematics', 'Language'];
    const additional = ['Science', 'Social Studies', 'French', 'The Arts'];
    const numAdditional = Math.floor(Math.random() * 3) + 1;
    
    return [
      ...core,
      ...additional.slice(0, numAdditional),
    ];
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] as SeedOptions['mode'] || 'standard';
  
  const validModes = ['minimal', 'standard', 'comprehensive', 'performance'];
  if (!validModes.includes(mode)) {
    console.error(`Invalid mode: ${mode}`);
    console.error(`Valid modes: ${validModes.join(', ')}`);
    process.exit(1);
  }

  const options: SeedOptions = {
    mode,
    includeTestUsers: !args.includes('--no-test-users'),
    includeDemoData: !args.includes('--no-demo'),
    includeBilingualContent: args.includes('--bilingual'),
  };

  console.log('Seed Configuration:', options);
  
  const generator = new SeedGenerator();
  await generator.seed(options);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
}

export { SeedGenerator, SeedOptions };