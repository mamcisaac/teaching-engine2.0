import { app } from '../src/index';
import { authRequest } from './test-auth-helper';
import { getTestPrismaClient } from './jest.setup';
import { setupAuthenticatedTest } from './test-setup-helpers';

describe('Equipment Booking API', () => {
  let teacherId: number;
  let prisma: ReturnType<typeof getTestPrismaClient>;
  const auth = authRequest(app);

  beforeAll(async () => {
    prisma = getTestPrismaClient();
  });

  beforeEach(async () => {
    // Setup auth for each test to handle database resets
    await setupAuthenticatedTest(prisma, auth);

    // Create a teacher for the equipment bookings
    const teacher = await prisma.user.create({
      data: { email: `eb${Date.now()}@e.com`, password: 'x', name: 'EB' },
    });
    teacherId = teacher.id;
  });

  // No need for afterAll cleanup - database is reset after each test

  it('creates and lists bookings', async () => {
    const create = await auth.post('/api/equipment-bookings').send({
      teacherId,
      resourceName: 'iPad Cart',
      neededBy: '2025-03-01T00:00:00.000Z',
      leadTimeDays: 10,
    });
    expect(create.status).toBe(201);
    const list = await auth.get(`/api/equipment-bookings?teacherId=${teacherId}`);
    expect(list.status).toBe(200);
    expect(list.body.length).toBeGreaterThan(0);
  });

  describe('Edge Cases', () => {
    it('should handle empty data scenarios', async () => {
      // Test with missing required fields
      const missingTeacher = await auth.post('/api/equipment-bookings').send({
        resourceName: 'iPad Cart',
        neededBy: '2025-03-01T00:00:00.000Z',
        leadTimeDays: 10,
      });
      expect(missingTeacher.status).toBe(400);

      const missingResource = await auth.post('/api/equipment-bookings').send({
        teacherId,
        neededBy: '2025-03-01T00:00:00.000Z',
        leadTimeDays: 10,
      });
      expect(missingResource.status).toBe(400);

      // Test empty string values
      const emptyResource = await auth.post('/api/equipment-bookings').send({
        teacherId,
        resourceName: '',
        neededBy: '2025-03-01T00:00:00.000Z',
        leadTimeDays: 10,
      });
      expect(emptyResource.status).toBe(400);
    });

    it('should handle maximum data limits', async () => {
      // Test extremely long resource names
      const longResourceName = 'a'.repeat(1000);
      const longName = await auth.post('/api/equipment-bookings').send({
        teacherId,
        resourceName: longResourceName,
        neededBy: '2025-03-01T00:00:00.000Z',
        leadTimeDays: 10,
      });
      expect(longName.status).toBe(400);

      // Test maximum lead time
      const maxLeadTime = await auth.post('/api/equipment-bookings').send({
        teacherId,
        resourceName: 'iPad Cart',
        neededBy: '2025-03-01T00:00:00.000Z',
        leadTimeDays: 999999,
      });
      expect(maxLeadTime.status).toBe(400);
    });

    it('should handle special characters and Unicode', async () => {
      const specialChars = [
        'iPad Cart (français)',
        'Équipement spécial',
        'iPad 📱 Cart',
        'Equipment "Quote" Test',
        "Equipment 'Apostrophe' Test",
        'Equipment\\BackslashTest',
        'Equipment%PercentTest',
      ];

      for (const resourceName of specialChars) {
        const response = await auth.post('/api/equipment-bookings').send({
          teacherId,
          resourceName,
          neededBy: '2025-03-01T00:00:00.000Z',
          leadTimeDays: 5,
        });
        // Should handle special characters gracefully
        expect([200, 201, 400]).toContain(response.status);
      }
    });

    it('should handle invalid date formats', async () => {
      const invalidDates = [
        'invalid-date',
        '2025-13-01T00:00:00.000Z', // Invalid month
        '2025-02-30T00:00:00.000Z', // Invalid day
        '2025-01-01T25:00:00.000Z', // Invalid hour
        '2025-01-01', // Missing time
        '', // Empty string
        null, // Null value
        undefined, // Undefined value
      ];

      for (const date of invalidDates) {
        const response = await auth.post('/api/equipment-bookings').send({
          teacherId,
          resourceName: 'iPad Cart',
          neededBy: date,
          leadTimeDays: 10,
        });
        expect(response.status).toBe(400);
      }
    });

    it('should handle past dates', async () => {
      const pastDate = new Date('2020-01-01T00:00:00.000Z');
      const response = await auth.post('/api/equipment-bookings').send({
        teacherId,
        resourceName: 'iPad Cart',
        neededBy: pastDate.toISOString(),
        leadTimeDays: 10,
      });
      expect(response.status).toBe(400);
    });

    it('should handle negative and zero values', async () => {
      // Test negative lead time
      const negativeLeadTime = await auth.post('/api/equipment-bookings').send({
        teacherId,
        resourceName: 'iPad Cart',
        neededBy: '2025-03-01T00:00:00.000Z',
        leadTimeDays: -5,
      });
      expect(negativeLeadTime.status).toBe(400);

      // Test zero lead time
      const zeroLeadTime = await auth.post('/api/equipment-bookings').send({
        teacherId,
        resourceName: 'iPad Cart',
        neededBy: '2025-03-01T00:00:00.000Z',
        leadTimeDays: 0,
      });
      expect([200, 201, 400]).toContain(zeroLeadTime.status);

      // Test negative teacher ID
      const negativeTeacher = await auth.post('/api/equipment-bookings').send({
        teacherId: -1,
        resourceName: 'iPad Cart',
        neededBy: '2025-03-01T00:00:00.000Z',
        leadTimeDays: 10,
      });
      expect(negativeTeacher.status).toBe(400);
    });

    it('should handle concurrent booking requests', async () => {
      const bookingData = {
        teacherId,
        resourceName: 'Shared iPad Cart',
        neededBy: '2025-04-01T00:00:00.000Z',
        leadTimeDays: 10,
      };

      // Create multiple concurrent booking requests
      const concurrentRequests = Array.from({ length: 5 }, () =>
        auth.post('/api/equipment-bookings').send(bookingData),
      );

      const responses = await Promise.all(concurrentRequests);

      // At least one should succeed
      const successfulRequests = responses.filter((r) => r.status === 201);
      expect(successfulRequests.length).toBeGreaterThan(0);
    });

    it('should handle extreme numeric values', async () => {
      const extremeValues = [
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
        Infinity,
        -Infinity,
        NaN,
      ];

      for (const value of extremeValues) {
        const response = await auth.post('/api/equipment-bookings').send({
          teacherId: value,
          resourceName: 'iPad Cart',
          neededBy: '2025-03-01T00:00:00.000Z',
          leadTimeDays: 10,
        });
        expect(response.status).toBe(400);
      }
    });

    it('should handle malformed JSON and request bodies', async () => {
      // Test with invalid JSON structure
      const malformedRequests = [
        { teacherId: 'not-a-number' },
        { leadTimeDays: 'not-a-number' },
        { neededBy: 12345 }, // Number instead of string
        { additionalField: 'should-be-ignored' },
      ];

      for (const data of malformedRequests) {
        const response = await auth.post('/api/equipment-bookings').send({
          ...data,
          teacherId: data.teacherId || teacherId,
          resourceName: 'iPad Cart',
          neededBy: data.neededBy || '2025-03-01T00:00:00.000Z',
          leadTimeDays: data.leadTimeDays || 10,
        });

        // Should handle malformed data gracefully
        expect([200, 201, 400]).toContain(response.status);
      }
    });

    it('should handle timezone edge cases', async () => {
      const timezoneTestCases = [
        '2025-03-01T00:00:00.000Z', // UTC
        '2025-03-01T05:00:00.000-05:00', // EST
        '2025-03-01T23:59:59.999Z', // End of day UTC
        '2025-03-01T00:00:00.001Z', // Start of day UTC
      ];

      for (const dateString of timezoneTestCases) {
        const response = await auth.post('/api/equipment-bookings').send({
          teacherId,
          resourceName: 'Timezone Test Cart',
          neededBy: dateString,
          leadTimeDays: 5,
        });

        // Should handle all valid ISO date formats
        expect([200, 201]).toContain(response.status);
      }
    });

    it('should handle leap year and DST transitions', async () => {
      const specialDates = [
        '2024-02-29T00:00:00.000Z', // Leap year
        '2025-03-09T07:00:00.000Z', // DST begins (US)
        '2025-11-02T06:00:00.000Z', // DST ends (US)
        '2025-12-31T23:59:59.999Z', // Year end
        '2026-01-01T00:00:00.000Z', // Year start
      ];

      for (const dateString of specialDates) {
        const response = await auth.post('/api/equipment-bookings').send({
          teacherId,
          resourceName: 'Calendar Edge Case Cart',
          neededBy: dateString,
          leadTimeDays: 7,
        });

        expect([200, 201]).toContain(response.status);
      }
    });
  });
});
