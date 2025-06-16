#!/usr/bin/env node

import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from '../src/prisma';
import { getAllTestOutcomes } from '../tests/test-data/curriculum-test-data';
import bcrypt from 'bcryptjs';

interface SetupOptions {
  ci?: boolean;
  clean?: boolean;
  seed?: boolean;
  verbose?: boolean;
}

class TestEnvironmentSetup {
  private options: SetupOptions;

  constructor(options: SetupOptions = {}) {
    this.options = {
      ci: process.env.CI === 'true',
      clean: true,
      seed: true,
      verbose: true,
      ...options,
    };
  }

  async setup(): Promise<void> {
    console.log('🔧 Setting up test environment...\n');

    try {
      // 1. Verify environment
      await this.verifyEnvironment();

      // 2. Clean up old test data
      if (this.options.clean) {
        await this.cleanupTestData();
      }

      // 3. Setup database
      await this.setupDatabase();

      // 4. Seed test data
      if (this.options.seed) {
        await this.seedTestData();
      }

      // 5. Verify setup
      await this.verifySetup();

      console.log('\n✅ Test environment setup complete!');
    } catch (error) {
      console.error('\n❌ Test environment setup failed:', error);
      process.exit(1);
    }
  }

  private async verifyEnvironment(): Promise<void> {
    this.log('📋 Verifying environment...');

    // Check Node version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    if (majorVersion < 18) {
      throw new Error(`Node.js 18+ required (current: ${nodeVersion})`);
    }
    this.log(`  ✓ Node.js ${nodeVersion}`);

    // Check required environment variables
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
    const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

    if (missingVars.length > 0) {
      // Set defaults for missing variables
      if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = 'file:../packages/database/prisma/test.db';
        this.log('  ⚠️  DATABASE_URL not set, using default test database');
      }
      if (!process.env.JWT_SECRET) {
        process.env.JWT_SECRET = 'test-secret-key';
        this.log('  ⚠️  JWT_SECRET not set, using default test secret');
      }
    }

    // Check database connectivity
    try {
      await prisma.$connect();
      await prisma.$disconnect();
      this.log('  ✓ Database connection');
    } catch (error) {
      throw new Error(`Database connection failed: ${error}`);
    }

    // Check for required tools
    try {
      execSync('which jest', { stdio: 'ignore' });
      this.log('  ✓ Jest installed');
    } catch {
      this.log('  ⚠️  Jest not found globally, using local version');
    }

    // Check disk space
    const stats = await fs.statfs(process.cwd());
    const freeGB = (stats.bavail * stats.bsize) / (1024 * 1024 * 1024);
    if (freeGB < 1) {
      throw new Error(`Insufficient disk space: ${freeGB.toFixed(2)}GB free (1GB required)`);
    }
    this.log(`  ✓ Disk space: ${freeGB.toFixed(2)}GB free`);
  }

  private async cleanupTestData(): Promise<void> {
    this.log('\n🧹 Cleaning up old test data...');

    // Clean test database files
    const testDbDir = path.join(process.cwd(), 'tests', 'temp');
    try {
      const files = await fs.readdir(testDbDir);
      const dbFiles = files.filter(
        (f) => f.endsWith('.db') || f.endsWith('.db-wal') || f.endsWith('.db-shm'),
      );

      for (const file of dbFiles) {
        await fs.unlink(path.join(testDbDir, file));
      }

      this.log(`  ✓ Removed ${dbFiles.length} old test database files`);
    } catch (error) {
      // Directory might not exist
      this.log('  ✓ No old test database files to clean');
    }

    // Clean test results
    const testResultsDir = path.join(process.cwd(), 'test-results');
    try {
      await fs.rm(testResultsDir, { recursive: true, force: true });
      this.log('  ✓ Removed old test results');
    } catch {
      // Directory might not exist
    }

    // Clean coverage reports
    const coverageDir = path.join(process.cwd(), 'coverage');
    try {
      await fs.rm(coverageDir, { recursive: true, force: true });
      this.log('  ✓ Removed old coverage reports');
    } catch {
      // Directory might not exist
    }
  }

  private async setupDatabase(): Promise<void> {
    this.log('\n🗄️  Setting up test database...');

    // Run migrations
    try {
      this.log('  ⏳ Running database migrations...');
      execSync('cd ../packages/database && npx prisma migrate deploy', {
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        env: process.env,
      });
      this.log('  ✓ Database migrations applied');
    } catch (error) {
      // Try db push as fallback
      this.log('  ⚠️  Migrations failed, trying db push...');
      try {
        execSync('cd ../packages/database && npx prisma db push --accept-data-loss', {
          stdio: this.options.verbose ? 'inherit' : 'pipe',
          env: process.env,
        });
        this.log('  ✓ Database schema pushed');
      } catch (pushError) {
        throw new Error('Failed to setup database schema');
      }
    }

    // Optimize for testing
    await prisma.$executeRawUnsafe('PRAGMA journal_mode = WAL');
    await prisma.$executeRawUnsafe('PRAGMA synchronous = NORMAL');
    await prisma.$executeRawUnsafe('PRAGMA cache_size = 10000');
    await prisma.$executeRawUnsafe('PRAGMA temp_store = MEMORY');
    await prisma.$executeRawUnsafe('PRAGMA busy_timeout = 30000');
    this.log('  ✓ Database optimized for testing');
  }

  private async seedTestData(): Promise<void> {
    this.log('\n🌱 Seeding test data...');

    // Clear existing data
    await this.clearAllData();

    // Create test users
    const users = await this.createTestUsers();
    this.log(`  ✓ Created ${users.length} test users`);

    // Create test subjects
    const subjects = await this.createTestSubjects();
    this.log(`  ✓ Created ${subjects.length} test subjects`);

    // Import curriculum data
    const outcomes = await this.importCurriculumData();
    this.log(`  ✓ Imported ${outcomes} curriculum outcomes`);

    // Create sample activities
    const activities = await this.createSampleActivities();
    this.log(`  ✓ Created ${activities} sample activities`);

    // Create test preferences
    await this.createTestPreferences();
    this.log('  ✓ Created test preferences');
  }

  private async clearAllData(): Promise<void> {
    // Use the test database manager's table deletion order
    const tables = [
      // Junction tables first
      'ActivityOutcome',
      'MilestoneOutcome',
      'OralRoutineOutcome',
      'ThematicUnitOutcome',
      'CognateOutcome',
      'MediaResourceOutcome',
      'ParentMessageOutcome',
      'ThematicUnitActivity',
      'CognateActivity',
      'MediaResourceActivity',
      'ParentMessageActivity',

      // Child tables
      'WeeklySchedule',
      'DailyPlanItem',
      'Note',
      'Resource',
      'SmartGoal',
      'DailyOralRoutine',
      'AssessmentResult',
      'SubstituteInfo',
      'UnavailableBlock',
      'EquipmentBooking',
      'ShareLink',
      'YearPlanEntry',

      // Main entity tables
      'Activity',
      'DailyPlan',
      'Milestone',
      'LessonPlan',
      'CalendarEvent',
      'ReportDeadline',
      'OralRoutineTemplate',
      'ThematicUnit',
      'CognatePair',
      'AssessmentTemplate',
      'MediaResource',
      'ParentMessage',

      // Base tables
      'Subject',
      'TimetableSlot',
      'Outcome',
      'User',

      // Configuration tables
      'TeacherPreferences',
      'MaterialList',
      'Notification',
      'Newsletter',
      'ParentContact',
      'Holiday',
    ];

    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF');

    try {
      for (const table of tables) {
        try {
          await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
          await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name = "${table}"`);
        } catch {
          // Table might not exist
        }
      }
    } finally {
      await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON');
    }
  }

  private async createTestUsers(): Promise<
    Array<{ id: number; email: string; name: string; role: string }>
  > {
    const hashedPassword = await bcrypt.hash('test123', 10);

    const users = [
      {
        email: 'teacher@test.com',
        password: hashedPassword,
        name: 'Test Teacher',
        role: 'teacher' as const,
      },
      {
        email: 'admin@test.com',
        password: hashedPassword,
        name: 'Test Admin',
        role: 'admin' as const,
      },
      {
        email: 'teacher2@test.com',
        password: hashedPassword,
        name: 'Test Teacher 2',
        role: 'teacher' as const,
      },
    ];

    return Promise.all(users.map((user) => prisma.user.create({ data: user })));
  }

  private async createTestSubjects(): Promise<Array<{ id: number; name: string; code: string }>> {
    const subjects = [
      { name: 'French Language Arts', code: 'FRA' },
      { name: 'Mathematics', code: 'MATH' },
      { name: 'English Language Arts', code: 'ENG' },
      { name: 'Science', code: 'SCI' },
      { name: 'Social Studies', code: 'SS' },
      { name: 'Physical Education', code: 'PE' },
      { name: 'Arts', code: 'ART' },
      { name: 'Music', code: 'MUS' },
    ];

    return Promise.all(subjects.map((subject) => prisma.subject.create({ data: subject })));
  }

  private async importCurriculumData(): Promise<number> {
    const outcomes = getAllTestOutcomes();

    await Promise.all(outcomes.map((outcome) => prisma.outcome.create({ data: outcome })));

    return outcomes.length;
  }

  private async createSampleActivities(): Promise<number> {
    const subjects = await prisma.subject.findMany();
    const outcomes = await prisma.outcome.findMany({ take: 10 });

    let activityCount = 0;

    for (const subject of subjects.slice(0, 3)) {
      // Create milestone
      const milestone = await prisma.milestone.create({
        data: {
          title: `${subject.name} - Unit 1`,
          subjectId: subject.id,
          description: `Introduction to ${subject.name}`,
        },
      });

      // Link outcomes
      const subjectOutcomes = outcomes.filter((o) => o.subject === subject.code);
      if (subjectOutcomes.length > 0) {
        await Promise.all(
          subjectOutcomes.slice(0, 3).map((outcome) =>
            prisma.milestoneOutcome.create({
              data: {
                milestoneId: milestone.id,
                outcomeId: outcome.id,
              },
            }),
          ),
        );
      }

      // Create activities
      const activities = [
        {
          title: `${subject.name} - Introduction`,
          milestoneId: milestone.id,
          description: 'Introductory lesson',
          duration: 45,
        },
        {
          title: `${subject.name} - Practice`,
          milestoneId: milestone.id,
          description: 'Guided practice session',
          duration: 30,
        },
        {
          title: `${subject.name} - Assessment`,
          milestoneId: milestone.id,
          description: 'Formative assessment',
          duration: 30,
        },
      ];

      await Promise.all(activities.map((activity) => prisma.activity.create({ data: activity })));

      activityCount += activities.length;
    }

    return activityCount;
  }

  private async createTestPreferences(): Promise<void> {
    await prisma.teacherPreferences.create({
      data: {
        teachingStyles: ['interactive', 'visual'],
        pacePreference: 'balanced',
        prepTime: 60,
        assessmentFrequency: 'weekly',
        communicationFrequency: 'weekly',
        planningHorizon: 'weekly',
        detailLevel: 'moderate',
      },
    });
  }

  private async verifySetup(): Promise<void> {
    this.log('\n🔍 Verifying setup...');

    const counts = {
      users: await prisma.user.count(),
      subjects: await prisma.subject.count(),
      outcomes: await prisma.outcome.count(),
      milestones: await prisma.milestone.count(),
      activities: await prisma.activity.count(),
    };

    Object.entries(counts).forEach(([entity, count]) => {
      if (count === 0) {
        throw new Error(`No ${entity} found in database`);
      }
      this.log(`  ✓ ${entity}: ${count}`);
    });

    // Test a sample query
    const testQuery = await prisma.outcome.findFirst({
      where: { code: '1CO.1' },
    });

    if (!testQuery) {
      throw new Error('Sample query failed - database may not be properly seeded');
    }
    this.log('  ✓ Sample queries working');
  }

  private log(message: string): void {
    if (this.options.verbose) {
      console.log(message);
    }
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options: SetupOptions = {
    ci: args.includes('--ci'),
    clean: !args.includes('--no-clean'),
    seed: !args.includes('--no-seed'),
    verbose: !args.includes('--quiet'),
  };

  new TestEnvironmentSetup(options)
    .setup()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { TestEnvironmentSetup };
