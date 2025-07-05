/**
 * Database utilities for production-level testing
 *
 * Provides methods to setup, manage, and cleanup test database state
 * for integration tests that require real database operations.
 */

import { prisma } from '../../src/prisma';
import { CurriculumExpectation, CurriculumImport, User } from '@prisma/client';

export class DatabaseTestUtils {
  private testDataPrefix = 'TEST_';
  private createdIds: {
    users: string[];
    imports: string[];
    expectations: string[];
    embeddings: string[];
    clusters: string[];
  } = {
    users: [],
    imports: [],
    expectations: [],
    embeddings: [],
    clusters: [],
  };

  /**
   * Setup test database with clean state
   */
  async setupTestDatabase(): Promise<void> {
    try {
      // Ensure database connection is working
      await prisma.$connect();

      // Clean any existing test data
      await this.cleanupTestDatabase();

      console.log('Test database setup completed');
    } catch (_error) {
      console.error('Failed to setup test database:', error);
      throw error;
    }
  }

  /**
   * Reset test data to clean state
   */
  async resetTestData(): Promise<void> {
    try {
      // Clean up any data created during tests
      await this.cleanupCreatedData();

      // Reset the tracking arrays
      this.createdIds = {
        users: [],
        imports: [],
        expectations: [],
        embeddings: [],
        clusters: [],
      };
    } catch (_error) {
      console.error('Failed to reset test data:', error);
      throw error;
    }
  }

  /**
   * Create a test user for testing
   */
  async createTestUser(overrides: Partial<User> = {}): Promise<User> {
    const testUser = await prisma.user.create({
      data: {
        email: `${this.testDataPrefix}user_${Date.now()}@test.com`,
        name: `${this.testDataPrefix}Test User`,
        role: 'TEACHER',
        isActive: true,
        ...overrides,
      },
    });

    this.createdIds.users.push(testUser.id);
    return testUser;
  }

  /**
   * Create a test curriculum import
   */
  async createTestImport(
    userId?: string,
    overrides: Partial<CurriculumImport> = {},
  ): Promise<CurriculumImport> {
    const user = userId ? { id: userId } : await this.createTestUser();

    const testImport = await prisma.curriculumImport.create({
      data: {
        fileName: `${this.testDataPrefix}test_curriculum.pdf`,
        originalName: 'test_curriculum.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        userId: user.id,
        status: 'COMPLETED',
        ...overrides,
      },
    });

    this.createdIds.imports.push(testImport.id);
    return testImport;
  }

  /**
   * Create test curriculum expectations
   */
  async createTestExpectations(
    importId: string,
    count: number = 5,
    overrides: Partial<CurriculumExpectation> = {},
  ): Promise<CurriculumExpectation[]> {
    const expectations: CurriculumExpectation[] = [];

    for (let i = 0; i < count; i++) {
      const expectation = await prisma.curriculumExpectation.create({
        data: {
          code: `${this.testDataPrefix}EXP.${i + 1}`,
          description: `${this.testDataPrefix}Test expectation ${i + 1}: Students will demonstrate understanding of concept ${i + 1}`,
          subject: 'Mathematics',
          grade: 3,
          strand: 'Number Sense',
          importId,
          learningGoals: [`Goal ${i + 1}`, `Sub-goal ${i + 1}`],
          ...overrides,
        },
      });

      this.createdIds.expectations.push(expectation.id);
      expectations.push(expectation);
    }

    return expectations;
  }

  /**
   * Create realistic test curriculum data for AI testing
   */
  async createRealisticCurriculumData(): Promise<{
    import: CurriculumImport;
    expectations: CurriculumExpectation[];
  }> {
    const user = await this.createTestUser();
    const curriculumImport = await this.createTestImport(user.id);

    // Create diverse, realistic expectations for AI testing
    const expectationData = [
      {
        code: 'MA3.NS.1',
        description:
          'Represent and compare whole numbers up to 1000, including identifying the value of each digit',
        subject: 'Mathematics',
        grade: 3,
        strand: 'Number Sense and Numeration',
        learningGoals: ['Place value understanding', 'Number comparison', 'Digit identification'],
      },
      {
        code: 'MA3.NS.2',
        description: 'Add and subtract three-digit numbers using various strategies',
        subject: 'Mathematics',
        grade: 3,
        strand: 'Number Sense and Numeration',
        learningGoals: ['Addition strategies', 'Subtraction strategies', 'Mental math'],
      },
      {
        code: 'MA3.GM.1',
        description: 'Identify and classify geometric shapes by their properties',
        subject: 'Mathematics',
        grade: 3,
        strand: 'Geometry and Measurement',
        learningGoals: ['Shape identification', 'Property analysis', 'Classification skills'],
      },
      {
        code: 'LA3.R.1',
        description: 'Read grade-appropriate texts with fluency and comprehension',
        subject: 'Language Arts',
        grade: 3,
        strand: 'Reading',
        learningGoals: ['Reading fluency', 'Comprehension strategies', 'Text analysis'],
      },
      {
        code: 'SC3.LS.1',
        description: 'Understand the basic needs of living things and their habitats',
        subject: 'Science',
        grade: 3,
        strand: 'Life Systems',
        learningGoals: [
          'Habitat understanding',
          'Basic needs identification',
          'Environmental connections',
        ],
      },
    ];

    const expectations: CurriculumExpectation[] = [];
    for (const data of expectationData) {
      const expectation = await prisma.curriculumExpectation.create({
        data: {
          ...data,
          importId: curriculumImport.id,
        },
      });

      this.createdIds.expectations.push(expectation.id);
      expectations.push(expectation);
    }

    return { import: curriculumImport, expectations };
  }

  /**
   * Create test embeddings for expectations
   */
  async createTestEmbeddings(expectationIds: string[]): Promise<void> {
    for (const expectationId of expectationIds) {
      // Create realistic mock embedding vectors (1536 dimensions for OpenAI)
      const embedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);

      const embeddingRecord = await prisma.curriculumExpectationEmbedding.create({
        data: {
          expectationId,
          embedding,
          model: 'text-embedding-3-small',
        },
      });

      this.createdIds.embeddings.push(embeddingRecord.id);
    }
  }

  /**
   * Create test clusters
   */
  async createTestClusters(importId: string, expectationIds: string[]): Promise<void> {
    // Create a few test clusters
    const clusterData = [
      {
        clusterName: 'Number Operations',
        clusterType: 'skill',
        expectationIds: expectationIds.slice(0, 2),
        confidence: 0.85,
      },
      {
        clusterName: 'Geometric Understanding',
        clusterType: 'concept',
        expectationIds: expectationIds.slice(2, 3),
        confidence: 0.78,
      },
    ];

    for (const data of clusterData) {
      const cluster = await prisma.expectationCluster.create({
        data: {
          importId,
          ...data,
        },
      });

      this.createdIds.clusters.push(cluster.id);
    }
  }

  /**
   * Get test data counts for verification
   */
  async getTestDataCounts(): Promise<{
    users: number;
    imports: number;
    expectations: number;
    embeddings: number;
    clusters: number;
  }> {
    const [users, imports, expectations, embeddings, clusters] = await Promise.all([
      prisma.user.count({ where: { email: { startsWith: this.testDataPrefix } } }),
      prisma.curriculumImport.count({ where: { fileName: { startsWith: this.testDataPrefix } } }),
      prisma.curriculumExpectation.count({ where: { code: { startsWith: this.testDataPrefix } } }),
      prisma.curriculumExpectationEmbedding.count(),
      prisma.expectationCluster.count(),
    ]);

    return { users, imports, expectations, embeddings, clusters };
  }

  /**
   * Cleanup all test data
   */
  async cleanupTestDatabase(): Promise<void> {
    try {
      // Clean up test data in correct order (dependencies first)
      await this.cleanupCreatedData();

      // Clean up any remaining test data by prefix
      await prisma.expectationCluster.deleteMany({
        where: {
          import: {
            filename: { startsWith: this.testDataPrefix },
          },
        },
      });

      await prisma.curriculumExpectationEmbedding.deleteMany({
        where: {
          expectation: {
            code: { startsWith: this.testDataPrefix },
          },
        },
      });

      await prisma.curriculumExpectation.deleteMany({
        where: { code: { startsWith: this.testDataPrefix } },
      });

      await prisma.curriculumImport.deleteMany({
        where: { filename: { startsWith: this.testDataPrefix } },
      });

      await prisma.user.deleteMany({
        where: { email: { startsWith: this.testDataPrefix } },
      });

      console.log('Test database cleanup completed');
    } catch (_error) {
      console.error('Failed to cleanup test database:', error);
      throw error;
    }
  }

  /**
   * Clean up data created during current test run
   */
  private async cleanupCreatedData(): Promise<void> {
    try {
      // Delete in dependency order
      if (this.createdIds.clusters.length > 0) {
        await prisma.expectationCluster.deleteMany({
          where: { id: { in: this.createdIds.clusters } },
        });
      }

      if (this.createdIds.embeddings.length > 0) {
        await prisma.curriculumExpectationEmbedding.deleteMany({
          where: { id: { in: this.createdIds.embeddings } },
        });
      }

      if (this.createdIds.expectations.length > 0) {
        await prisma.curriculumExpectation.deleteMany({
          where: { id: { in: this.createdIds.expectations } },
        });
      }

      if (this.createdIds.imports.length > 0) {
        await prisma.curriculumImport.deleteMany({
          where: { id: { in: this.createdIds.imports } },
        });
      }

      if (this.createdIds.users.length > 0) {
        await prisma.user.deleteMany({
          where: { id: { in: this.createdIds.users } },
        });
      }
    } catch (_error) {
      console.error('Failed to cleanup created data:', error);
      throw error;
    }
  }

  /**
   * Verify database connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (_error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  /**
   * Get database statistics for monitoring
   */
  async getDatabaseStats(): Promise<{
    totalTables: number;
    testDataPresent: boolean;
    connectionHealthy: boolean;
  }> {
    try {
      const connectionHealthy = await this.verifyConnection();
      const testCounts = await this.getTestDataCounts();

      const testDataPresent = Object.values(testCounts).some((count) => count > 0);

      return {
        totalTables: 10, // Approximate table count
        testDataPresent,
        connectionHealthy,
      };
    } catch (_error) {
      return {
        totalTables: 0,
        testDataPresent: false,
        connectionHealthy: false,
      };
    }
  }
}
