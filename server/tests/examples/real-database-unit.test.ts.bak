/**
 * Example: Unit Tests with Real Database
 * 
 * Shows how to write unit tests that use the real database
 * with proper isolation and test data factories.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { getTestContext, createTestData, getTestPrismaClient } from '../setup/enhanced-jest-setup';

describe('User Service - Real Database Unit Tests', () => {
  let testData: ReturnType<typeof createTestData>;
  let prisma: ReturnType<typeof getTestPrismaClient>;

  beforeEach(() => {
    testData = createTestData();
    prisma = getTestPrismaClient();
  });

  describe('User Creation', () => {
    it('should create a user with default role', async () => {
      // Create test user using factory
      const user = await testData.user({
        email: 'test@school.ca',
        name: 'Test Teacher',
      });

      // Verify in database
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(dbUser).toBeDefined();
      expect(dbUser.email).toBe('test@school.ca');
      expect(dbUser.role).toBe('teacher');
    });

    it('should enforce unique email constraint', async () => {
      // Create first user
      await testData.user({ email: 'duplicate@school.ca' });

      // Attempt to create duplicate
      await expect(
        testData.user({ email: 'duplicate@school.ca' })
      ).rejects.toThrow();
    });

    it('should create users with different roles', async () => {
      // Use factory methods for different user types
      const teacher = await testData.user();
      const principal = await testData.user({ role: 'principal' });
      const admin = await testData.user({ role: 'admin' });

      // Verify all users exist with correct roles
      const users = await prisma.user.findMany({
        where: {
          id: { in: [teacher.id, principal.id, admin.id] },
        },
        orderBy: { id: 'asc' },
      });

      expect(users).toHaveLength(3);
      expect(users.map(u => u.role)).toEqual(['teacher', 'principal', 'admin']);
    });
  });

  describe('User Relationships', () => {
    it('should create user with subjects', async () => {
      // Create user
      const user = await testData.user();

      // Create subjects for user
      const subjects = await prisma.subject.createMany({
        data: [
          { name: 'Mathematics', userId: user.id },
          { name: 'Science', userId: user.id },
        ],
      });

      // Verify relationship
      const userWithSubjects = await prisma.user.findUnique({
        where: { id: user.id },
        include: { subjects: true },
      });

      expect(userWithSubjects.subjects).toHaveLength(2);
      expect(userWithSubjects.subjects.map(s => s.name)).toContain('Mathematics');
    });

    it('should cascade delete user data', async () => {
      // Create user with related data
      const user = await testData.user();
      
      // Create long range plan
      const expectation = await testData.expectation();
      const longRangePlan = await testData.longRangePlan({
        userId: user.id,
      });

      // Link expectation
      await prisma.longRangePlanExpectation.create({
        data: {
          longRangePlanId: longRangePlan.id,
          expectationId: expectation.id,
        },
      });

      // Delete user
      await prisma.user.delete({ where: { id: user.id } });

      // Verify cascade delete
      const deletedPlan = await prisma.longRangePlan.findUnique({
        where: { id: longRangePlan.id },
      });

      expect(deletedPlan).toBeNull();
    });
  });

  describe('Batch Operations', () => {
    it('should efficiently create multiple users', async () => {
      // Create batch of users
      const users = await testData.users(10);

      // Verify count
      const count = await prisma.user.count();
      expect(count).toBe(10);

      // Verify all have unique emails
      const emails = users.map(u => u.email);
      const uniqueEmails = new Set(emails);
      expect(uniqueEmails.size).toBe(10);
    });

    it('should handle concurrent operations', async () => {
      // Create users concurrently
      const promises = Array(5).fill(null).map((_, i) => 
        testData.user({ name: `Teacher ${i}` })
      );

      const users = await Promise.all(promises);

      // Verify all created successfully
      expect(users).toHaveLength(5);
      expect(users.every(u => u.id)).toBeTruthy();
    });
  });

  describe('Query Performance', () => {
    it('should efficiently query with includes', async () => {
      // Create test scenario
      const user = await testData.user();
      const expectations = await testData.expectations(5);
      
      const longRangePlan = await testData.longRangePlan({
        userId: user.id,
      });

      // Link expectations
      await prisma.longRangePlanExpectation.createMany({
        data: expectations.map(e => ({
          longRangePlanId: longRangePlan.id,
          expectationId: e.id,
        })),
      });

      // Query with includes
      const result = await prisma.longRangePlan.findUnique({
        where: { id: longRangePlan.id },
        include: {
          user: true,
          expectations: {
            include: {
              expectation: true,
            },
          },
        },
      });

      expect(result.user.id).toBe(user.id);
      expect(result.expectations).toHaveLength(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle database constraints gracefully', async () => {
      // Test foreign key constraint
      await expect(
        prisma.longRangePlan.create({
          data: {
            userId: 999999, // Non-existent user
            title: 'Invalid Plan',
            academicYear: '2024-2025',
            grade: 4,
            subject: 'Math',
          },
        })
      ).rejects.toThrow();
    });

    it('should rollback on error in transaction', async () => {
      const user = await testData.user();
      
      try {
        await prisma.$transaction(async (tx) => {
          // Create plan
          await tx.longRangePlan.create({
            data: {
              userId: user.id,
              title: 'Transaction Test',
              academicYear: '2024-2025',
              grade: 4,
              subject: 'Math',
            },
          });

          // Force error
          throw new Error('Rollback test');
        });
      } catch (error) {
        // Expected error
      }

      // Verify rollback
      const plans = await prisma.longRangePlan.findMany({
        where: { userId: user.id },
      });

      expect(plans).toHaveLength(0);
    });
  });
});