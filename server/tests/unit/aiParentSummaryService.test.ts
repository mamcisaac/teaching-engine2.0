import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  generateParentSummary,
  ParentSummaryRequest,
} from '../../src/services/aiParentSummaryService';
import { prisma } from '../../src/prisma';

// Mock Prisma
jest.mock('../../src/prisma', () => ({
  prisma: {
    student: {
      findFirst: jest.fn(),
    },
  },
}));

describe('AIParentSummaryService', () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateParentSummary', () => {
    const baseRequest: ParentSummaryRequest = {
      studentId: 1,
      from: new Date('2024-01-01'),
      to: new Date('2024-01-31'),
      userId: 123,
    };

    it('should generate bilingual summary for student with activities', async () => {
      const mockStudent = {
        id: 1,
        firstName: 'Emma',
        lastName: 'Johnson',
        goals: [
          { id: 1, description: 'Improve reading fluency', createdAt: new Date('2024-01-15') },
          { id: 2, description: 'Master multiplication tables', createdAt: new Date('2024-01-20') },
        ],
        reflections: [
          { id: 1, content: 'Great progress today', date: new Date('2024-01-10') },
          { id: 2, content: 'Needs more practice', date: new Date('2024-01-25') },
        ],
      };

      (mockPrisma.student.findFirst as jest.Mock).mockResolvedValue(mockStudent);

      const result = await generateParentSummary(baseRequest);

      expect(result).toHaveProperty('french');
      expect(result).toHaveProperty('english');

      // Verify French content
      expect(result.french).toContain('Emma Johnson');
      expect(result.french).toContain('0 activités'); // No activities in current implementation
      expect(result.french).toContain('2 objectifs personnalisés');
      expect(result.french).toContain('2 réflexions');

      // Verify English content
      expect(result.english).toContain('Emma Johnson');
      expect(result.english).toContain('0 learning activities');
      expect(result.english).toContain('2 personalized learning goals');
      expect(result.english).toContain('2 learning reflections');

      // Verify database query
      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
          userId: 123,
        },
        include: {
          goals: {
            where: {
              createdAt: {
                gte: baseRequest.from,
                lte: baseRequest.to,
              },
            },
          },
          reflections: {
            where: {
              date: {
                gte: baseRequest.from,
                lte: baseRequest.to,
              },
            },
          },
        },
      });
    });

    it('should handle student with no goals or reflections', async () => {
      const mockStudent = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        goals: [],
        reflections: [],
      };

      (mockPrisma.student.findFirst as jest.Mock).mockResolvedValue(mockStudent);

      const result = await generateParentSummary(baseRequest);

      // Verify content handles zero counts gracefully
      expect(result.french).toContain('John Doe');
      expect(result.french).not.toContain('0 objectifs'); // Should not mention if zero
      expect(result.french).not.toContain('0 réflexions');

      expect(result.english).toContain('John Doe');
      expect(result.english).not.toContain('0 personalized');
      expect(result.english).not.toContain('0 learning reflections');
    });

    it('should handle focus areas in request', async () => {
      const mockStudent = {
        id: 1,
        firstName: 'Sarah',
        lastName: 'Smith',
        goals: [{ id: 1, description: 'Math goal', createdAt: new Date('2024-01-15') }],
        reflections: [],
      };

      (mockPrisma.student.findFirst as jest.Mock).mockResolvedValue(mockStudent);

      const requestWithFocus: ParentSummaryRequest = {
        ...baseRequest,
        focus: ['Mathematics', 'Problem Solving'],
      };

      const result = await generateParentSummary(requestWithFocus);

      // Focus areas should be tracked but not necessarily displayed in basic implementation
      expect(result.french).toBeDefined();
      expect(result.english).toBeDefined();
    });

    it('should throw error when student not found', async () => {
      (mockPrisma.student.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(generateParentSummary(baseRequest)).rejects.toThrow(
        'Failed to generate parent summary',
      );

      expect(console.error).toHaveBeenCalledWith(
        'Error generating parent summary:',
        expect.any(Error),
      );
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      (mockPrisma.student.findFirst as jest.Mock).mockRejectedValue(dbError);

      await expect(generateParentSummary(baseRequest)).rejects.toThrow(
        'Failed to generate parent summary',
      );

      expect(console.error).toHaveBeenCalledWith('Error generating parent summary:', dbError);
    });

    it('should handle null goals and reflections fields', async () => {
      const mockStudent = {
        id: 1,
        firstName: 'Test',
        lastName: 'Student',
        goals: null,
        reflections: null,
      };

      (mockPrisma.student.findFirst as jest.Mock).mockResolvedValue(mockStudent);

      const result = await generateParentSummary(baseRequest);

      expect(result.french).toContain('Test Student');
      expect(result.english).toContain('Test Student');
      // Should not crash with null values
    });

    it('should generate appropriate date-based queries', async () => {
      const mockStudent = {
        id: 1,
        firstName: 'Alice',
        lastName: 'Brown',
        goals: [],
        reflections: [],
      };

      (mockPrisma.student.findFirst as jest.Mock).mockResolvedValue(mockStudent);

      const specificDateRequest: ParentSummaryRequest = {
        studentId: 5,
        from: new Date('2024-02-01'),
        to: new Date('2024-02-29'),
        userId: 456,
      };

      await generateParentSummary(specificDateRequest);

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          id: 5,
          userId: 456,
        },
        include: {
          goals: {
            where: {
              createdAt: {
                gte: new Date('2024-02-01'),
                lte: new Date('2024-02-29'),
              },
            },
          },
          reflections: {
            where: {
              date: {
                gte: new Date('2024-02-01'),
                lte: new Date('2024-02-29'),
              },
            },
          },
        },
      });
    });

    it('should handle large numbers of goals and reflections', async () => {
      const manyGoals = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        description: `Goal ${i + 1}`,
        createdAt: new Date('2024-01-15'),
      }));

      const manyReflections = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        content: `Reflection ${i + 1}`,
        date: new Date('2024-01-20'),
      }));

      const mockStudent = {
        id: 1,
        firstName: 'Busy',
        lastName: 'Student',
        goals: manyGoals,
        reflections: manyReflections,
      };

      (mockPrisma.student.findFirst as jest.Mock).mockResolvedValue(mockStudent);

      const result = await generateParentSummary(baseRequest);

      expect(result.french).toContain('15 objectifs personnalisés');
      expect(result.french).toContain('20 réflexions');
      expect(result.english).toContain('15 personalized learning goals');
      expect(result.english).toContain('20 learning reflections');
    });

    it('should handle special characters in student names', async () => {
      const mockStudent = {
        id: 1,
        firstName: 'Jean-François',
        lastName: "O'Connor",
        goals: [],
        reflections: [],
      };

      (mockPrisma.student.findFirst as jest.Mock).mockResolvedValue(mockStudent);

      const result = await generateParentSummary(baseRequest);

      expect(result.french).toContain("Jean-François O'Connor");
      expect(result.english).toContain("Jean-François O'Connor");
    });
  });

  describe('Summary content generation', () => {
    const baseRequest: ParentSummaryRequest = {
      studentId: 1,
      from: new Date('2024-01-01'),
      to: new Date('2024-01-31'),
      userId: 123,
    };

    it('should include curriculum outcomes when activities have them', async () => {
      // This test documents the TODO for future implementation
      const mockStudent = {
        id: 1,
        firstName: 'Test',
        lastName: 'Student',
        goals: [],
        reflections: [],
      };

      (mockPrisma.student.findFirst as jest.Mock).mockResolvedValue(mockStudent);

      const result = await generateParentSummary(baseRequest);

      // Currently, activities are empty array (TODO)
      expect(result.french).toContain('0 activités');
      expect(result.english).toContain('0 learning activities');

      // When implemented, should include outcomes from activities
    });

    it('should format summary with proper grammar for single items', async () => {
      const mockStudent = {
        id: 1,
        firstName: 'Single',
        lastName: 'Goal',
        goals: [{ id: 1, description: 'One goal', createdAt: new Date('2024-01-15') }],
        reflections: [{ id: 1, content: 'One reflection', date: new Date('2024-01-20') }],
      };

      (mockPrisma.student.findFirst as jest.Mock).mockResolvedValue(mockStudent);

      const result = await generateParentSummary(baseRequest);

      // Should use singular forms
      expect(result.french).toContain('1 objectif');
      expect(result.french).toContain('1 réflexion');
      expect(result.english).toContain('1 personalized learning goal');
      expect(result.english).toContain('1 learning reflection');
    });

    it('should generate summaries even with partial data', async () => {
      const mockStudent = {
        id: 1,
        firstName: 'Partial',
        lastName: 'Data',
        goals: [{ id: 1, description: 'Goal', createdAt: new Date('2024-01-15') }],
        reflections: undefined, // Undefined instead of empty array
      };

      (mockPrisma.student.findFirst as jest.Mock).mockResolvedValue(mockStudent);

      const result = await generateParentSummary(baseRequest);

      expect(result.french).toContain('Partial Data');
      expect(result.french).toContain('1 objectif');
      expect(result.english).toContain('Partial Data');
      expect(result.english).toContain('1 personalized learning goal');
    });
  });

  describe('Error handling', () => {
    const baseRequest: ParentSummaryRequest = {
      studentId: 1,
      from: new Date('2024-01-01'),
      to: new Date('2024-01-31'),
      userId: 123,
    };

    it('should handle missing required fields in request gracefully', async () => {
      const invalidRequest = {
        ...baseRequest,
        studentId: null as any,
      };

      const mockStudent = {
        id: 1,
        firstName: 'Test',
        lastName: 'Student',
        goals: [],
        reflections: [],
      };

      (mockPrisma.student.findFirst as jest.Mock).mockResolvedValue(mockStudent);

      // Should still attempt to process
      await generateParentSummary(invalidRequest);

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          id: null,
          userId: 123,
        },
        include: expect.any(Object),
      });
    });

    it('should provide meaningful error messages', async () => {
      (mockPrisma.student.findFirst as jest.Mock).mockResolvedValue(null);

      try {
        await generateParentSummary(baseRequest);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toEqual(new Error('Failed to generate parent summary'));
      }
    });

    it('should handle unexpected data structures', async () => {
      const mockStudent = {
        id: 1,
        firstName: 123, // Wrong type
        lastName: null,
        goals: 'not-an-array', // Wrong type
        reflections: {},
      } as any;

      (mockPrisma.student.findFirst as jest.Mock).mockResolvedValue(mockStudent);

      const result = await generateParentSummary(baseRequest);

      // Should handle gracefully
      expect(result.french).toContain('123 null'); // Converts to string
      expect(result.english).toContain('123 null');
    });
  });
});
