// Import from the database package
import { PrismaClient as DatabasePrismaClient } from '@teaching-engine/database';

import { unitPlanProtectionMiddleware } from '../../packages/database/prisma/middleware/unit-plan-protection';

// Re-export everything from database package except PrismaClient and prisma
export {
  Prisma,
  type User,
  type CurriculumExpectation,
  type LongRangePlan,
  type UnitPlan,
  type ETFOLessonPlan,
  type DaybookEntry,
  type SubstitutePlan,
  type Newsletter,
  type CalendarEvent,
  type Notification,
  type ActivityCollection,
  type PlanTemplate,
  type Subject,
  type ClassroomAnnouncement,
  type UnavailableBlock,
  type CurriculumImport,
  type ExpectationCluster,
  type ClassRoutine,
  type CurriculumExpectationEmbedding,
  type LongRangePlanExpectation,
  type UnitPlanExpectation,
  type UnitPlanResource,
  type ETFOLessonPlanExpectation,
  type ETFOLessonPlanResource,
  type DaybookEntryExpectation,
  type ExternalActivity,
  type ActivityImport,
  type ActivityRating,
  type ActivityCollectionItem,
  type WeeklyPlannerState,
  type TemplateRating,
  type TemplateVariation,
  type RecentPlanAccess,
  // The following types are not exported from the database package
  // TODO: Add these to Prisma schema or remove usage
  // type CalendarEventType,
  // type CalendarEventSource,
  // type UnavailableBlockType,
  // type ImportStatus,
  // type TemplateType,
  // type TemplateCategory
} from '@teaching-engine/database';

// Create singleton instance for server usage
const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof DatabasePrismaClient> | undefined;
  testPrismaClient: InstanceType<typeof DatabasePrismaClient> | undefined;
};

// In test environment, use the test client if available
const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

// Create a getter that always returns the current test client
const getPrisma = (): DatabasePrismaClient => {
  if (isTestEnvironment && globalForPrisma.testPrismaClient !== undefined) {
    return globalForPrisma.testPrismaClient;
  }
  
  // For unit tests without proper database setup, throw a helpful error
  if (isTestEnvironment && !globalForPrisma.testPrismaClient) {
    throw new Error(
      'Database client not initialized for tests. ' +
      'Unit tests should mock the database. ' +
      'Integration tests should use proper test setup with database initialization.'
    );
  }
  
  if (!globalForPrisma.prisma) {
    const client = new DatabasePrismaClient({
      // Reduce logging to minimize memory usage
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
    
    // Apply unit plan protection middleware
    client.$use(unitPlanProtectionMiddleware);
    
    // Set connection pool limits to reduce memory usage
    client.$connect();
    
    globalForPrisma.prisma = client;
  }
  
  return globalForPrisma.prisma;
};

// Create a proxy to always use the current client
export const prisma = new Proxy({} as InstanceType<typeof DatabasePrismaClient>, {
  get(_target, prop): unknown {
    const client = getPrisma();
    return client[prop as keyof InstanceType<typeof DatabasePrismaClient>];
  },
  has(_target, prop): boolean {
    const client = getPrisma();
    return prop in client;
  },
});

if (process.env.NODE_ENV !== 'production' && !isTestEnvironment) {
  globalForPrisma.prisma = getPrisma();
}

// Export PrismaClient with our own name to avoid conflicts
export { DatabasePrismaClient as PrismaClient };
