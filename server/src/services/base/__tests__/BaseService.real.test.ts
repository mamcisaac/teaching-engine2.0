/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Real Base Service Tests
 * Testing actual database operations, metrics collection, and service lifecycle
 */

import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { BaseService, ServiceHealth, ServiceMetrics } from '../BaseService';
import { prisma } from '../../../prisma';
import logger from '../../../logger';

// Create a concrete test service that extends BaseService
class TestRealService extends BaseService {
  constructor() {
    super('TestRealService');
  }

  // Real database operations for testing
  async createTestUser(email: string, name: string): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        return this.executeDbOperation(
          () => prisma.user.create({
            data: {
              email,
              name,
              role: 'TEACHER',
              hashedPassword: 'test-hash',
            },
          }),
          'createUser'
        );
      },
      'createTestUser'
    );
  }

  async findUserByEmail(email: string): Promise<any | null> {
    return this.executeWithMetrics(
      async () => {
        return this.executeDbOperation(
          () => prisma.user.findUnique({
            where: { email },
          }),
          'findUserByEmail'
        );
      },
      'findUserByEmail'
    );
  }

  async updateUser(userId: number, data: { name?: string; email?: string }): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        return this.executeDbOperation(
          () => prisma.user.update({
            where: { id: userId },
            data,
          }),
          'updateUser'
        );
      },
      'updateUser'
    );
  }

  async deleteUser(userId: number): Promise<void> {
    return this.executeWithMetrics(
      async () => {
        await this.executeDbOperation(
          () => prisma.user.delete({
            where: { id: userId },
          }),
          'deleteUser'
        );
      },
      'deleteUser'
    );
  }

  async listUsers(limit: number = 10): Promise<any[]> {
    return this.executeWithMetrics(
      async () => {
        return this.executeDbOperation(
          () => prisma.user.findMany({
            take: limit,
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              createdAt: true,
            },
          }),
          'listUsers'
        );
      },
      'listUsers'
    );
  }

  async countUsers(): Promise<number> {
    return this.executeWithMetrics(
      async () => {
        return this.executeDbOperation(
          () => prisma.user.count(),
          'countUsers'
        );
      },
      'countUsers'
    );
  }

  // Method that throws an error for testing error handling
  async simulateError(): Promise<never> {
    return this.executeWithMetrics(
      async () => {
        throw new Error('Simulated service error');
      },
      'simulateError'
    );
  }

  // Method with database constraint violation
  async createDuplicateUser(email: string): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        return this.executeDbOperation(
          () => prisma.user.create({
            data: {
              email,
              name: 'Duplicate User',
              role: 'TEACHER',
              hashedPassword: 'test-hash',
            },
          }),
          'createDuplicateUser'
        );
      },
      'createDuplicateUser'
    );
  }

  // Override checkDependencies to include database
  protected checkDependencies(): Record<string, boolean> {
    return {
      ...super.checkDependencies(),
      database: this.checkDatabaseConnection(),
      prisma: !!prisma,
    };
  }

  // Method to test complex database operations
  async performComplexOperation(userId: number): Promise<any> {
    return this.executeWithMetrics(
      async () => {
        // Transaction with multiple operations
        return this.executeDbOperation(
          () => prisma.$transaction(async (tx) => {
            // Update user
            const updatedUser = await tx.user.update({
              where: { id: userId },
              data: { name: 'Updated in transaction' },
            });

            // Create a subject for the user
            const subject = await tx.subject.create({
              data: {
                name: 'Test Subject',
                gradeLevel: 5,
                userId: userId,
              },
            });

            // Create curriculum expectations
            const expectations = await tx.curriculumExpectation.createMany({
              data: [
                {
                  code: 'A1.1',
                  description: 'Test expectation 1',
                  strand: 'Test Strand',
                  grade: 5,
                  subject: 'Mathematics',
                  subjectId: subject.id,
                },
                {
                  code: 'A1.2',
                  description: 'Test expectation 2',
                  strand: 'Test Strand',
                  grade: 5,
                  subject: 'Mathematics',
                  subjectId: subject.id,
                },
              ],
            });

            return {
              user: updatedUser,
              subject,
              expectationsCreated: expectations.count,
            };
          }),
          'complexTransaction'
        );
      },
      'performComplexOperation'
    );
  }
}

// Test service for testing inheritance and lifecycle
class InheritedTestService extends TestRealService {
  private customInitialized = false;

  constructor() {
    super();
  }

  protected async initialize(): Promise<void> {
    await super.initialize();
    // Simulate custom initialization
    await new Promise(resolve => setTimeout(resolve, 10));
    this.customInitialized = true;
    this.logger.info('Custom initialization completed');
  }

  isCustomInitialized(): boolean {
    return this.customInitialized;
  }

  // Override health check with custom logic
  protected getHealthStatus(): 'healthy' | 'degraded' | 'unhealthy' {
    const baseStatus = super.getHealthStatus();
    
    // Add custom health criteria
    if (!this.customInitialized) {
      return 'unhealthy';
    }

    return baseStatus;
  }
}

describe('BaseService - Real Implementation Tests', () => {
  let testService: TestRealService;
  let inheritedService: InheritedTestService;
  let testUsers: any[] = [];

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.curriculumExpectation.deleteMany({
      where: { 
        OR: [
          { code: { startsWith: 'A1.' } },
          { description: { contains: 'Test expectation' } },
        ],
      },
    });
    
    await prisma.subject.deleteMany({
      where: { name: 'Test Subject' },
    });
    
    await prisma.user.deleteMany({
      where: { 
        email: { 
          in: [
            'test-real-service@example.com',
            'test-real-update@example.com',
            'test-real-duplicate@example.com',
            'test-real-complex@example.com',
          ],
        },
      },
    });
  });

  beforeEach(async () => {
    testService = new TestRealService();
    inheritedService = new InheritedTestService();
    testUsers = [];
  });

  afterEach(async () => {
    // Clean up test users
    for (const user of testUsers) {
      try {
        await prisma.curriculumExpectation.deleteMany({
          where: { subjectId: { in: await prisma.subject.findMany({ where: { userId: user.id } }).then(subjects => subjects.map(s => s.id)) } },
        });
        
        await prisma.subject.deleteMany({
          where: { userId: user.id },
        });
        
        await prisma.user.delete({
          where: { id: user.id },
        });
      } catch (error) {
        // User might already be deleted
      }
    }
    testUsers = [];

    await testService.shutdown();
    await inheritedService.shutdown();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Real Database Operations', () => {
    test('should create user with real database call', async () => {
      const email = 'test-real-service@example.com';
      const name = 'Real Test User';

      const user = await testService.createTestUser(email, name);
      testUsers.push(user);

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.name).toBe(name);
      expect(user.role).toBe('TEACHER');
      expect(user.id).toBeGreaterThan(0);

      // Verify user was actually created in database
      const dbUser = await prisma.user.findUnique({
        where: { email },
      });

      expect(dbUser).toBeDefined();
      expect(dbUser?.email).toBe(email);
      expect(dbUser?.name).toBe(name);

      logger.info('Real user creation test completed', {
        userId: user.id,
        email: user.email,
      });
    });

    test('should find user by email with real database query', async () => {
      const email = 'test-real-find@example.com';
      const name = 'Find Test User';

      // Create user first
      const createdUser = await testService.createTestUser(email, name);
      testUsers.push(createdUser);

      // Find user
      const foundUser = await testService.findUserByEmail(email);

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.email).toBe(email);
      expect(foundUser.name).toBe(name);

      // Test finding non-existent user
      const notFound = await testService.findUserByEmail('nonexistent@example.com');
      expect(notFound).toBeNull();

      logger.info('Real user find test completed', {
        foundUserId: foundUser.id,
        notFoundResult: notFound,
      });
    });

    test('should update user with real database operation', async () => {
      const email = 'test-real-update@example.com';
      const originalName = 'Original Name';
      const updatedName = 'Updated Name';

      // Create user
      const user = await testService.createTestUser(email, originalName);
      testUsers.push(user);

      // Update user
      const updatedUser = await testService.updateUser(user.id, {
        name: updatedName,
      });

      expect(updatedUser.id).toBe(user.id);
      expect(updatedUser.name).toBe(updatedName);
      expect(updatedUser.email).toBe(email);

      // Verify update in database
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(dbUser?.name).toBe(updatedName);

      logger.info('Real user update test completed', {
        userId: user.id,
        originalName,
        updatedName,
      });
    });

    test('should list users with real database query', async () => {
      // Create multiple test users
      const users = await Promise.all([
        testService.createTestUser('test-list-1@example.com', 'List User 1'),
        testService.createTestUser('test-list-2@example.com', 'List User 2'),
        testService.createTestUser('test-list-3@example.com', 'List User 3'),
      ]);
      testUsers.push(...users);

      // List users
      const userList = await testService.listUsers(5);

      expect(Array.isArray(userList)).toBe(true);
      expect(userList.length).toBeGreaterThanOrEqual(3);

      // Check that our test users are in the list
      const testUserIds = users.map(u => u.id);
      const foundTestUsers = userList.filter(u => testUserIds.includes(u.id));
      expect(foundTestUsers.length).toBe(3);

      // Verify user structure
      foundTestUsers.forEach(user => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('createdAt');
        expect(user).not.toHaveProperty('hashedPassword'); // Should be excluded
      });

      logger.info('Real user list test completed', {
        totalUsers: userList.length,
        testUsersFound: foundTestUsers.length,
      });
    });

    test('should count users with real database aggregation', async () => {
      const initialCount = await testService.countUsers();

      // Create test users
      const newUsers = await Promise.all([
        testService.createTestUser('test-count-1@example.com', 'Count User 1'),
        testService.createTestUser('test-count-2@example.com', 'Count User 2'),
      ]);
      testUsers.push(...newUsers);

      const finalCount = await testService.countUsers();

      expect(finalCount).toBe(initialCount + 2);

      logger.info('Real user count test completed', {
        initialCount,
        finalCount,
        usersAdded: newUsers.length,
      });
    });
  });

  describe('Real Complex Database Operations', () => {
    test('should perform complex transaction with multiple operations', async () => {
      // Create test user
      const user = await testService.createTestUser(
        'test-real-complex@example.com',
        'Complex Test User'
      );
      testUsers.push(user);

      // Perform complex operation
      const result = await testService.performComplexOperation(user.id);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.subject).toBeDefined();
      expect(result.expectationsCreated).toBe(2);

      // Verify transaction results
      expect(result.user.id).toBe(user.id);
      expect(result.user.name).toBe('Updated in transaction');
      expect(result.subject.name).toBe('Test Subject');
      expect(result.subject.userId).toBe(user.id);

      // Verify expectations were created
      const expectations = await prisma.curriculumExpectation.findMany({
        where: { subjectId: result.subject.id },
      });

      expect(expectations.length).toBe(2);
      expect(expectations[0].code).toBe('A1.1');
      expect(expectations[1].code).toBe('A1.2');

      logger.info('Complex transaction test completed', {
        userId: user.id,
        subjectId: result.subject.id,
        expectationsCreated: result.expectationsCreated,
      });
    });

    test('should handle transaction rollback on error', async () => {
      // Create test user
      const user = await testService.createTestUser(
        'test-rollback@example.com',
        'Rollback Test User'
      );
      testUsers.push(user);

      // Create a method that will cause transaction to fail
      const failingOperation = async () => {
        return testService.executeWithMetrics(
          async () => {
            return testService.executeDbOperation(
              () => prisma.$transaction(async (tx) => {
                // Update user successfully
                await tx.user.update({
                  where: { id: user.id },
                  data: { name: 'Should not persist' },
                });

                // This should cause the transaction to fail
                throw new Error('Transaction rollback test');
              }),
              'failingTransaction'
            );
          },
          'failingOperation'
        );
      };

      // Operation should fail
      await expect(failingOperation()).rejects.toThrow('Transaction rollback test');

      // Verify user was not updated (transaction rolled back)
      const unchangedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(unchangedUser?.name).toBe('Rollback Test User'); // Original name

      logger.info('Transaction rollback test completed', {
        userId: user.id,
        nameAfterRollback: unchangedUser?.name,
      });
    });
  });

  describe('Real Error Handling', () => {
    test('should handle and record service errors', async () => {
      const initialMetrics = testService.getMetrics();

      // Execute operation that will fail
      await expect(testService.simulateError()).rejects.toThrow('Simulated service error');

      const finalMetrics = testService.getMetrics();

      // Verify error was recorded in metrics
      expect(finalMetrics.totalRequests).toBe(initialMetrics.totalRequests + 1);
      expect(finalMetrics.failedRequests).toBe(initialMetrics.failedRequests + 1);
      expect(finalMetrics.successfulRequests).toBe(initialMetrics.successfulRequests);

      // Check operation-specific metrics
      expect(finalMetrics.operations['simulateError']).toBeDefined();
      expect(finalMetrics.operations['simulateError'].count).toBe(1);

      logger.info('Error handling test completed', {
        totalRequests: finalMetrics.totalRequests,
        failedRequests: finalMetrics.failedRequests,
      });
    });

    test('should handle database constraint violations', async () => {
      const email = 'test-real-duplicate@example.com';

      // Create first user
      const user1 = await testService.createTestUser(email, 'First User');
      testUsers.push(user1);

      // Try to create duplicate user (should fail due to unique email constraint)
      await expect(testService.createDuplicateUser(email)).rejects.toThrow();

      // Verify only one user with that email exists
      const users = await prisma.user.findMany({
        where: { email },
      });

      expect(users.length).toBe(1);
      expect(users[0].name).toBe('First User'); // Original user

      logger.info('Database constraint violation test completed', {
        email,
        usersWithEmail: users.length,
      });
    });
  });

  describe('Real Metrics Collection', () => {
    test('should collect accurate operation metrics', async () => {
      const email = 'test-metrics@example.com';

      // Perform multiple operations
      const user = await testService.createTestUser(email, 'Metrics User');
      testUsers.push(user);

      await testService.findUserByEmail(email);
      await testService.updateUser(user.id, { name: 'Updated Metrics User' });
      await testService.countUsers();

      const metrics = testService.getMetrics();

      // Verify overall metrics
      expect(metrics.totalRequests).toBeGreaterThanOrEqual(4);
      expect(metrics.successfulRequests).toBeGreaterThanOrEqual(4);
      expect(metrics.failedRequests).toBe(0);

      // Verify operation-specific metrics
      expect(metrics.operations['createTestUser']).toBeDefined();
      expect(metrics.operations['createTestUser'].count).toBeGreaterThanOrEqual(1);
      expect(metrics.operations['createTestUser'].averageDuration).toBeGreaterThan(0);

      expect(metrics.operations['findUserByEmail']).toBeDefined();
      expect(metrics.operations['updateUser']).toBeDefined();
      expect(metrics.operations['countUsers']).toBeDefined();

      logger.info('Metrics collection test completed', {
        totalRequests: metrics.totalRequests,
        successfulRequests: metrics.successfulRequests,
        operationsTracked: Object.keys(metrics.operations).length,
      });
    });

    test('should calculate accurate success/failure rates', async () => {
      // Perform successful operations
      const user = await testService.createTestUser(
        'test-success-rate@example.com',
        'Success Rate User'
      );
      testUsers.push(user);

      await testService.findUserByEmail(user.email);

      // Perform failed operation
      try {
        await testService.simulateError();
      } catch (error) {
        // Expected to fail
      }

      const metrics = testService.getMetrics();
      const successRate = metrics.successfulRequests / metrics.totalRequests;
      const errorRate = metrics.failedRequests / metrics.totalRequests;

      expect(successRate).toBeGreaterThan(0);
      expect(errorRate).toBeGreaterThan(0);
      expect(successRate + errorRate).toBe(1);

      logger.info('Success/failure rate test completed', {
        successRate: Math.round(successRate * 100),
        errorRate: Math.round(errorRate * 100),
        totalRequests: metrics.totalRequests,
      });
    });
  });

  describe('Real Health Checks', () => {
    test('should perform comprehensive health check', async () => {
      // Perform some operations to generate metrics
      const user = await testService.createTestUser(
        'test-health@example.com',
        'Health Test User'
      );
      testUsers.push(user);

      const health: ServiceHealth = await testService.healthCheck();

      expect(health).toBeDefined();
      expect(health.service).toBe('TestRealService');
      expect(health.status).toBe('healthy');
      expect(health.uptime).toBeGreaterThan(0);
      expect(health.metrics).toBeDefined();
      expect(health.dependencies).toBeDefined();

      // Check dependencies
      expect(health.dependencies.logger).toBe(true);
      expect(health.dependencies.database).toBe(true);
      expect(health.dependencies.prisma).toBe(true);

      // Check metrics structure
      expect(health.metrics.totalRequests).toBeGreaterThan(0);
      expect(health.metrics.successfulRequests).toBeGreaterThan(0);
      expect(health.metrics.operations).toBeDefined();

      logger.info('Health check test completed', {
        status: health.status,
        uptime: health.uptime,
        totalRequests: health.metrics.totalRequests,
        dependencies: Object.keys(health.dependencies).length,
      });
    });

    test('should report degraded status with high error rate', async () => {
      // Generate errors to increase error rate
      for (let i = 0; i < 5; i++) {
        try {
          await testService.simulateError();
        } catch (error) {
          // Expected to fail
        }
      }

      // Add one successful operation
      const user = await testService.createTestUser(
        'test-degraded@example.com',
        'Degraded Test User'
      );
      testUsers.push(user);

      const health = await testService.healthCheck();
      const errorRate = health.metrics.failedRequests / health.metrics.totalRequests;

      expect(errorRate).toBeGreaterThan(0.2); // Should be degraded
      expect(health.status).toBe('degraded');

      logger.info('Degraded status test completed', {
        status: health.status,
        errorRate: Math.round(errorRate * 100),
        failedRequests: health.metrics.failedRequests,
        totalRequests: health.metrics.totalRequests,
      });
    });
  });

  describe('Real Service Lifecycle', () => {
    test('should initialize inherited service correctly', async () => {
      expect(inheritedService.isCustomInitialized()).toBe(false);

      // Trigger initialization by performing an operation
      const user = await inheritedService.createTestUser(
        'test-inherited@example.com',
        'Inherited Test User'
      );
      testUsers.push(user);

      expect(inheritedService.isCustomInitialized()).toBe(true);
      expect(user).toBeDefined();
      expect(user.email).toBe('test-inherited@example.com');

      logger.info('Service inheritance test completed', {
        customInitialized: inheritedService.isCustomInitialized(),
        userId: user.id,
      });
    });

    test('should handle service shutdown gracefully', async () => {
      const user = await testService.createTestUser(
        'test-shutdown@example.com',
        'Shutdown Test User'
      );
      testUsers.push(user);

      // Get metrics before shutdown
      const metricsBeforeShutdown = testService.getMetrics();

      // Shutdown should not throw
      await expect(testService.shutdown()).resolves.not.toThrow();

      // Service should still provide metrics after shutdown
      const metricsAfterShutdown = testService.getMetrics();
      expect(metricsAfterShutdown.totalRequests).toBe(metricsBeforeShutdown.totalRequests);

      logger.info('Service shutdown test completed', {
        requestsBeforeShutdown: metricsBeforeShutdown.totalRequests,
        requestsAfterShutdown: metricsAfterShutdown.totalRequests,
      });
    });
  });

  describe('Real Performance Testing', () => {
    test('should handle concurrent database operations', async () => {
      const concurrentOperations = 10;
      const startTime = Date.now();

      // Create multiple users concurrently
      const userPromises = Array.from({ length: concurrentOperations }, (_, index) => 
        testService.createTestUser(
          `test-concurrent-${index}@example.com`,
          `Concurrent User ${index}`
        )
      );

      const users = await Promise.all(userPromises);
      testUsers.push(...users);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(users.length).toBe(concurrentOperations);
      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds

      // Verify all users were created
      for (let i = 0; i < concurrentOperations; i++) {
        expect(users[i].email).toBe(`test-concurrent-${i}@example.com`);
        expect(users[i].name).toBe(`Concurrent User ${i}`);
      }

      // Check metrics
      const metrics = testService.getMetrics();
      expect(metrics.operations['createTestUser'].count).toBeGreaterThanOrEqual(concurrentOperations);

      logger.info('Concurrent operations test completed', {
        operationsCount: concurrentOperations,
        totalTimeMs: totalTime,
        operationsPerSecond: Math.round(concurrentOperations / (totalTime / 1000)),
        averageOperationTime: metrics.operations['createTestUser'].averageDuration,
      });
    });

    test('should efficiently handle large dataset operations', async () => {
      const largeDatasetSize = 50;

      // Create many users for listing
      const batchSize = 10;
      for (let i = 0; i < largeDatasetSize; i += batchSize) {
        const batch = Array.from({ length: Math.min(batchSize, largeDatasetSize - i) }, (_, index) => 
          testService.createTestUser(
            `test-large-${i + index}@example.com`,
            `Large Dataset User ${i + index}`
          )
        );
        const batchUsers = await Promise.all(batch);
        testUsers.push(...batchUsers);
      }

      // Test listing performance
      const listStartTime = Date.now();
      const userList = await testService.listUsers(100);
      const listEndTime = Date.now();

      // Test counting performance
      const countStartTime = Date.now();
      const userCount = await testService.countUsers();
      const countEndTime = Date.now();

      expect(userList.length).toBeGreaterThanOrEqual(largeDatasetSize);
      expect(userCount).toBeGreaterThanOrEqual(largeDatasetSize);

      const listTime = listEndTime - listStartTime;
      const countTime = countEndTime - countStartTime;

      // Both operations should be reasonably fast
      expect(listTime).toBeLessThan(1000); // 1 second
      expect(countTime).toBeLessThan(500); // 0.5 seconds

      logger.info('Large dataset test completed', {
        datasetSize: largeDatasetSize,
        listTime,
        countTime,
        usersListed: userList.length,
        usersCount: userCount,
      });
    });
  });
});