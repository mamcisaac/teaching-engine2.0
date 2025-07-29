/**
 * Database Type Safety Integration Tests
 * 
 * Tests type safety fixes in database utilities with real database operations
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import * as dbUtils from '../../server/src/utils/database';
import { createTestApp, cleanupTestApp, resetTestDatabase, TestContext } from '../setup/integration-test-utils';

describe('Database Type Safety', () => {
  let testContext: TestContext;
  let prisma: PrismaClient;

  beforeAll(async () => {
    testContext = await createTestApp();
    prisma = testContext.prisma;
  });

  afterAll(async () => {
    await cleanupTestApp(testContext);
  });

  beforeEach(async () => {
    await resetTestDatabase(prisma);
  });

  describe('Pagination Parameter Type Safety', () => {
    it('should generate correct pagination params with type safety', () => {
      // Test with valid inputs
      const params1 = dbUtils.dbUtils.getPaginationParams(1, 20);
      expect(params1).toEqual({ skip: 0, take: 20 });
      
      const params2 = dbUtils.dbUtils.getPaginationParams(3, 10);
      expect(params2).toEqual({ skip: 20, take: 10 });
      
      // Test with defaults
      const params3 = dbUtils.dbUtils.getPaginationParams();
      expect(params3).toEqual({ skip: 0, take: 20 });
      
      // Test edge cases
      const params4 = dbUtils.dbUtils.getPaginationParams(0, 50);
      expect(params4).toEqual({ skip: -50, take: 50 }); // Potential bug: negative skip
      
      const params5 = dbUtils.dbUtils.getPaginationParams(-1, 10);
      expect(params5).toEqual({ skip: -20, take: 10 }); // Negative page handling
    });

    it('should work with real database queries', async () => {
      // Create test data
      const users = [];
      for (let i = 0; i < 25; i++) {
        users.push({
          email: `user${i}@example.com`,
          name: `User ${i}`,
          role: 'TEACHER'
        });
      }
      await prisma.user.createMany({ data: users });
      
      // Test pagination
      const page1Params = dbUtils.dbUtils.getPaginationParams(1, 10);
      const page1Results = await prisma.user.findMany({
        ...page1Params,
        orderBy: { email: 'asc' }
      });
      
      expect(page1Results).toHaveLength(10);
      expect(page1Results[0].email).toBe('user0@example.com');
      expect(page1Results[9].email).toBe('user9@example.com');
      
      const page2Params = dbUtils.dbUtils.getPaginationParams(2, 10);
      const page2Results = await prisma.user.findMany({
        ...page2Params,
        orderBy: { email: 'asc' }
      });
      
      expect(page2Results).toHaveLength(10);
      expect(page2Results[0].email).toBe('user10@example.com');
      expect(page2Results[9].email).toBe('user19@example.com');
    });
  });

  describe('Sorting Parameter Type Safety', () => {
    it('should validate sorting parameters with field security', () => {
      const allowedFields = ['name', 'email', 'createdAt'];
      
      // Valid field
      const sort1 = dbUtils.dbUtils.getSortingParams('name', 'asc', allowedFields);
      expect(sort1).toEqual({ name: 'asc' });
      
      const sort2 = dbUtils.dbUtils.getSortingParams('createdAt', 'desc', allowedFields);
      expect(sort2).toEqual({ createdAt: 'desc' });
      
      // Invalid field
      const sort3 = dbUtils.dbUtils.getSortingParams('password', 'asc', allowedFields);
      expect(sort3).toBeUndefined();
      
      // No sortBy provided
      const sort4 = dbUtils.dbUtils.getSortingParams(undefined, 'asc', allowedFields);
      expect(sort4).toBeUndefined();
      
      // Empty allowed fields
      const sort5 = dbUtils.dbUtils.getSortingParams('name', 'asc', []);
      expect(sort5).toBeUndefined();
    });

    it('should prevent SQL injection attempts', () => {
      const allowedFields = ['name', 'email'];
      
      // Attempt injection
      const maliciousField = "name'; DROP TABLE users; --";
      const result = dbUtils.dbUtils.getSortingParams(maliciousField, 'asc', allowedFields);
      
      expect(result).toBeUndefined(); // Should reject malicious input
    });
  });

  describe('Date Range Query Type Safety', () => {
    it('should build date range queries with type safety', () => {
      const allowedFields = ['createdAt', 'updatedAt'];
      
      // Valid date range
      const from = new Date('2024-01-01');
      const to = new Date('2024-12-31');
      
      const query1 = dbUtils.dbUtils.buildDateRangeQuery('createdAt', from, to, allowedFields);
      expect(query1).toEqual({
        createdAt: {
          gte: from,
          lte: to
        }
      });
      
      // Only from date
      const query2 = dbUtils.dbUtils.buildDateRangeQuery('updatedAt', from, undefined, allowedFields);
      expect(query2).toEqual({
        updatedAt: {
          gte: from
        }
      });
      
      // Only to date
      const query3 = dbUtils.dbUtils.buildDateRangeQuery('createdAt', undefined, to, allowedFields);
      expect(query3).toEqual({
        createdAt: {
          lte: to
        }
      });
      
      // Invalid field
      const query4 = dbUtils.dbUtils.buildDateRangeQuery('deletedAt', from, to, allowedFields);
      expect(query4).toEqual({});
      
      // String dates
      const query5 = dbUtils.dbUtils.buildDateRangeQuery(
        'createdAt', 
        '2024-01-01T00:00:00Z', 
        '2024-12-31T23:59:59Z',
        allowedFields
      );
      expect(query5.createdAt?.gte).toBeInstanceOf(Date);
      expect(query5.createdAt?.lte).toBeInstanceOf(Date);
    });

    it('should work with real database queries', async () => {
      // Create test data with different dates
      const dates = [
        new Date('2024-01-15'),
        new Date('2024-06-15'),
        new Date('2024-12-15')
      ];
      
      for (let i = 0; i < dates.length; i++) {
        await prisma.user.create({
          data: {
            email: `user${i}@example.com`,
            name: `User ${i}`,
            role: 'TEACHER',
            createdAt: dates[i]
          }
        });
      }
      
      // Query with date range
      const query = dbUtils.dbUtils.buildDateRangeQuery(
        'createdAt',
        new Date('2024-03-01'),
        new Date('2024-09-01'),
        ['createdAt']
      );
      
      const results = await prisma.user.findMany({
        where: query
      });
      
      expect(results).toHaveLength(1);
      expect(results[0].email).toBe('user1@example.com');
    });
  });

  describe('Search Query Type Safety', () => {
    it('should build search queries with field validation', () => {
      const allowedFields = ['name', 'email', 'description'];
      
      // Valid search
      const query1 = dbUtils.dbUtils.buildSearchQuery('test', ['name', 'email'], allowedFields);
      expect(query1).toEqual({
        OR: [
          { name: { contains: 'test', mode: 'insensitive' } },
          { email: { contains: 'test', mode: 'insensitive' } }
        ]
      });
      
      // Empty search term
      const query2 = dbUtils.dbUtils.buildSearchQuery('', ['name'], allowedFields);
      expect(query2).toEqual({});
      
      // No fields
      const query3 = dbUtils.dbUtils.buildSearchQuery('test', [], allowedFields);
      expect(query3).toEqual({});
      
      // Invalid fields
      const query4 = dbUtils.dbUtils.buildSearchQuery('test', ['password', 'secret'], allowedFields);
      expect(query4).toEqual({});
      
      // Mix of valid and invalid fields
      const query5 = dbUtils.dbUtils.buildSearchQuery('test', ['name', 'password'], allowedFields);
      expect(query5).toEqual({}); // Should reject all if any field is invalid
    });

    it('should handle search with real database', async () => {
      // Create test data
      await prisma.user.createMany({
        data: [
          { email: 'john.doe@example.com', name: 'John Doe', role: 'TEACHER' },
          { email: 'jane.smith@example.com', name: 'Jane Smith', role: 'TEACHER' },
          { email: 'bob.johnson@test.com', name: 'Bob Johnson', role: 'TEACHER' }
        ]
      });
      
      // Search for 'john'
      const searchQuery = dbUtils.dbUtils.buildSearchQuery(
        'john',
        ['name', 'email'],
        ['name', 'email']
      );
      
      const results = await prisma.user.findMany({
        where: searchQuery
      });
      
      expect(results).toHaveLength(2); // John Doe and Bob Johnson
      expect(results.map(u => u.name)).toContain('John Doe');
      expect(results.map(u => u.name)).toContain('Bob Johnson');
    });
  });

  describe('User Scoped Query Type Safety', () => {
    it('should build user-scoped queries correctly', () => {
      const userId = 123;
      
      // Simple user scope
      const query1 = dbUtils.dbUtils.buildUserScopedQuery(userId);
      expect(query1).toEqual({ userId: 123 });
      
      // With additional conditions
      const query2 = dbUtils.dbUtils.buildUserScopedQuery(userId, {
        status: 'active',
        type: 'lesson'
      });
      expect(query2).toEqual({
        userId: 123,
        status: 'active',
        type: 'lesson'
      });
      
      // Should not override userId
      const query3 = dbUtils.dbUtils.buildUserScopedQuery(123, {
        userId: 456, // Attempt to override
        other: 'value'
      });
      expect(query3).toEqual({
        userId: 123, // Original userId preserved
        other: 'value'
      });
    });
  });

  describe('Active Record Query Type Safety', () => {
    it('should build active queries with field validation', () => {
      const allowedFields = ['isActive', 'enabled', 'visible'];
      
      // Default field
      const query1 = dbUtils.dbUtils.buildActiveQuery();
      expect(query1).toEqual({ __invalid_field__: true }); // No allowed fields = invalid
      
      // Valid field
      const query2 = dbUtils.dbUtils.buildActiveQuery('isActive', {}, allowedFields);
      expect(query2).toEqual({ isActive: true });
      
      // Custom field
      const query3 = dbUtils.dbUtils.buildActiveQuery('enabled', { type: 'public' }, allowedFields);
      expect(query3).toEqual({ enabled: true, type: 'public' });
      
      // Invalid field
      const query4 = dbUtils.dbUtils.buildActiveQuery('malicious', {}, allowedFields);
      expect(query4).toEqual({ __invalid_field__: true });
    });
  });

  describe('Type Safety with Complex Operations', () => {
    it('should handle batch operations with type safety', async () => {
      // Test batchCreate
      const users = Array.from({ length: 250 }, (_, i) => ({
        email: `batch${i}@example.com`,
        name: `Batch User ${i}`,
        role: 'TEACHER' as const
      }));
      
      const created = await dbUtils.batchCreate(prisma.user, users, 100);
      expect(created).toBe(250);
      
      const count = await prisma.user.count();
      expect(count).toBe(250);
    });

    it('should handle upsert operations', async () => {
      const records = [
        {
          where: { email: 'user1@example.com' },
          create: { email: 'user1@example.com', name: 'User 1', role: 'TEACHER' },
          update: { name: 'Updated User 1' }
        },
        {
          where: { email: 'user2@example.com' },
          create: { email: 'user2@example.com', name: 'User 2', role: 'TEACHER' },
          update: { name: 'Updated User 2' }
        }
      ];
      
      // First upsert - should create
      await dbUtils.upsertMany(prisma.user, records);
      let users = await prisma.user.findMany({ orderBy: { email: 'asc' } });
      expect(users).toHaveLength(2);
      expect(users[0].name).toBe('User 1');
      
      // Second upsert - should update
      await dbUtils.upsertMany(prisma.user, records);
      users = await prisma.user.findMany({ orderBy: { email: 'asc' } });
      expect(users).toHaveLength(2);
      expect(users[0].name).toBe('Updated User 1');
    });

    it('should handle transactions with type safety', async () => {
      const result = await dbUtils.withTransaction(prisma, async (tx) => {
        const user = await tx.user.create({
          data: {
            email: 'transaction@example.com',
            name: 'Transaction User',
            role: 'TEACHER'
          }
        });
        
        // This would normally create related data
        // For now, just return the user
        return user;
      });
      
      expect(result.email).toBe('transaction@example.com');
      
      // Verify it was actually created
      const found = await prisma.user.findUnique({
        where: { email: 'transaction@example.com' }
      });
      expect(found).not.toBeNull();
    });
  });

  describe('Security and Edge Cases', () => {
    it('should handle SQL injection attempts in field names', () => {
      const maliciousFields = [
        "name'; DROP TABLE users; --",
        "email OR 1=1",
        "id); DELETE FROM users; --"
      ];
      
      const allowedFields = ['name', 'email'];
      
      for (const field of maliciousFields) {
        const sortResult = dbUtils.dbUtils.getSortingParams(field, 'asc', allowedFields);
        expect(sortResult).toBeUndefined();
        
        const dateResult = dbUtils.dbUtils.buildDateRangeQuery(field, new Date(), new Date(), allowedFields);
        expect(dateResult).toEqual({});
        
        const activeResult = dbUtils.dbUtils.buildActiveQuery(field, {}, allowedFields);
        expect(activeResult).toEqual({ __invalid_field__: true });
      }
    });

    it('should handle type coercion safely', async () => {
      // Test that numeric IDs are handled correctly
      const userId = 123;
      const query = dbUtils.dbUtils.buildUserScopedQuery(userId);
      
      // Create a user with this ID
      await prisma.user.create({
        data: {
          id: userId,
          email: 'test@example.com',
          name: 'Test User',
          role: 'TEACHER'
        }
      });
      
      const result = await prisma.user.findFirst({ where: query });
      expect(result).not.toBeNull();
      expect(result?.id).toBe(userId);
    });
  });
});