/**
 * Additional Test Coverage for Report Generator Service
 * 
 * Tests critical paths and edge cases that weren't covered in existing tests
 * to improve overall test coverage for the report generation functionality
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ReportGeneratorService } from '../../src/services/reportGeneratorService';
import { getTestPrismaClient, createTestData } from '../jest.setup';
import { addDays, subDays, format } from 'date-fns';

// Mock dependencies
jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    font: jest.fn().mockReturnThis(),
    fillColor: jest.fn().mockReturnThis(),
    rect: jest.fn().mockReturnThis(),
    fill: jest.fn().mockReturnThis(),
    pipe: jest.fn(),
    end: jest.fn(),
    on: jest.fn((event, callback) => {
      if (event === 'end') {
        setTimeout(callback, 10);
      }
    }),
  }));
});

jest.mock('fs/promises', () => ({
  writeFile: jest.fn(),
  readFile: jest.fn(),
  mkdir: jest.fn(),
  unlink: jest.fn(),
}));

jest.mock('canvas', () => ({
  createCanvas: jest.fn(() => ({
    getContext: jest.fn(() => ({
      fillStyle: '',
      fillRect: jest.fn(),
      fillText: jest.fn(),
      measureText: jest.fn(() => ({ width: 100 })),
      font: '',
    })),
    toDataURL: jest.fn(() => 'data:image/png;base64,test'),
  })),
}));

describe('ReportGeneratorService Coverage Tests', () => {
  let service: ReportGeneratorService;
  let mockUser: any;
  let mockStudent: any;
  let mockOutcomes: any[];

  beforeEach(async () => {
    // Create test data
    const testData = await createTestData(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email: 'teacher@example.com',
          password: 'hashed_password',
          name: 'Test Teacher',
          role: 'teacher',
        },
      });

      const student = await prisma.student.create({
        data: {
          firstName: 'Test',
          lastName: 'Student',
          grade: 5,
          userId: user.id,
        },
      });

      // Create test outcomes
      const outcomes = await Promise.all([
        prisma.outcome.create({
          data: {
            code: 'A1.1',
            description: 'Demonstrate understanding of numbers',
            subject: 'Mathematics',
            grade: 5,
            domain: 'Number',
            userId: user.id,
          },
        }),
        prisma.outcome.create({
          data: {
            code: 'B2.2',
            description: 'Solve problems involving addition',
            subject: 'Mathematics',
            grade: 5,
            domain: 'Number',
            userId: user.id,
          },
        }),
      ]);

      return { user, student, outcomes };
    });

    mockUser = testData.user;
    mockStudent = testData.student;
    mockOutcomes = testData.outcomes;
    service = new ReportGeneratorService();
  });

  describe('Progress Report Generation', () => {
    it('should generate progress report with no data', async () => {
      const startDate = subDays(new Date(), 30);
      const endDate = new Date();

      const result = await service.generateProgressReport(
        mockStudent.id,
        startDate,
        endDate,
        mockUser.id
      );

      expect(result).toBeDefined();
      expect(result.studentName).toBe('Test Student');
      expect(result.reportPeriod).toBeDefined();
    });

    it('should handle invalid date ranges', async () => {
      const startDate = new Date();
      const endDate = subDays(new Date(), 30); // End before start

      await expect(
        service.generateProgressReport(
          mockStudent.id,
          startDate,
          endDate,
          mockUser.id
        )
      ).rejects.toThrow();
    });

    it('should handle student not found', async () => {
      const invalidStudentId = 99999;
      const startDate = subDays(new Date(), 30);
      const endDate = new Date();

      await expect(
        service.generateProgressReport(
          invalidStudentId,
          startDate,
          endDate,
          mockUser.id
        )
      ).rejects.toThrow();
    });

    it('should handle unauthorized access to student', async () => {
      const otherUser = await createTestData(async (prisma) => {
        return await prisma.user.create({
          data: {
            email: 'other@example.com',
            password: 'hashed_password',
            name: 'Other Teacher',
            role: 'teacher',
          },
        });
      });

      const startDate = subDays(new Date(), 30);
      const endDate = new Date();

      await expect(
        service.generateProgressReport(
          mockStudent.id,
          startDate,
          endDate,
          otherUser.id
        )
      ).rejects.toThrow();
    });
  });

  describe('PDF Generation', () => {
    it('should generate PDF with complex data', async () => {
      // Create comprehensive test data
      const complexData = await createTestData(async (prisma) => {
        // Create activities with various statuses
        const milestone = await prisma.milestone.create({
          data: {
            title: 'Test Milestone',
            subjectId: 1,
            userId: mockUser.id,
          },
        });

        const activities = await Promise.all([
          prisma.activity.create({
            data: {
              title: 'Completed Activity',
              milestoneId: milestone.id,
              completedAt: new Date(),
              userId: mockUser.id,
            },
          }),
          prisma.activity.create({
            data: {
              title: 'In Progress Activity',
              milestoneId: milestone.id,
              userId: mockUser.id,
            },
          }),
        ]);

        return { milestone, activities };
      });

      const startDate = subDays(new Date(), 30);
      const endDate = new Date();

      const report = await service.generateProgressReport(
        mockStudent.id,
        startDate,
        endDate,
        mockUser.id
      );

      const pdfBuffer = await service.generatePDF(report);
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it('should handle PDF generation errors', async () => {
      const PDFDocument = require('pdfkit');
      PDFDocument.mockImplementationOnce(() => {
        throw new Error('PDF generation failed');
      });

      const report = {
        studentName: 'Test Student',
        reportPeriod: 'Test Period',
        outcomes: [],
        activities: [],
        progress: {},
      };

      await expect(
        service.generatePDF(report)
      ).rejects.toThrow('PDF generation failed');
    });

    it('should handle large reports with many sections', async () => {
      // Create a report with many items
      const largeReport = {
        studentName: 'Test Student',
        reportPeriod: 'Large Report Period',
        outcomes: Array(100).fill(null).map((_, i) => ({
          code: `A${i}.1`,
          description: `Test outcome ${i}`,
          progress: Math.random(),
        })),
        activities: Array(50).fill(null).map((_, i) => ({
          title: `Activity ${i}`,
          completed: i % 2 === 0,
          date: new Date(),
        })),
        progress: {
          overall: 0.75,
          bySubject: {
            Mathematics: 0.8,
            Science: 0.7,
          },
        },
      };

      const pdfBuffer = await service.generatePDF(largeReport);
      expect(pdfBuffer).toBeInstanceOf(Buffer);
    });
  });

  describe('Chart Generation', () => {
    it('should generate progress charts', async () => {
      const progressData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        values: [0.2, 0.4, 0.6, 0.8],
      };

      const chartDataUrl = await service.generateProgressChart(progressData);
      expect(chartDataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('should handle empty chart data', async () => {
      const emptyData = {
        labels: [],
        values: [],
      };

      const chartDataUrl = await service.generateProgressChart(emptyData);
      expect(chartDataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('should handle mismatched label and value arrays', async () => {
      const mismatchedData = {
        labels: ['Week 1', 'Week 2'],
        values: [0.5], // One less value than labels
      };

      await expect(
        service.generateProgressChart(mismatchedData)
      ).rejects.toThrow();
    });

    it('should handle invalid chart values', async () => {
      const invalidData = {
        labels: ['Week 1', 'Week 2'],
        values: [NaN, Infinity], // Invalid numbers
      };

      await expect(
        service.generateProgressChart(invalidData)
      ).rejects.toThrow();
    });
  });

  describe('Data Aggregation', () => {
    it('should calculate progress statistics correctly', async () => {
      // Create test activities with known completion dates
      const testData = await createTestData(async (prisma) => {
        const milestone = await prisma.milestone.create({
          data: {
            title: 'Test Milestone',
            subjectId: 1,
            userId: mockUser.id,
          },
        });

        const activities = await Promise.all([
          prisma.activity.create({
            data: {
              title: 'Activity 1',
              milestoneId: milestone.id,
              completedAt: subDays(new Date(), 5),
              userId: mockUser.id,
            },
          }),
          prisma.activity.create({
            data: {
              title: 'Activity 2',
              milestoneId: milestone.id,
              completedAt: subDays(new Date(), 3),
              userId: mockUser.id,
            },
          }),
          prisma.activity.create({
            data: {
              title: 'Activity 3',
              milestoneId: milestone.id,
              // Not completed
              userId: mockUser.id,
            },
          }),
        ]);

        return activities;
      });

      const startDate = subDays(new Date(), 30);
      const endDate = new Date();

      const stats = await service.calculateProgressStatistics(
        mockStudent.id,
        startDate,
        endDate,
        mockUser.id
      );

      expect(stats).toBeDefined();
      expect(stats.totalActivities).toBeGreaterThan(0);
      expect(stats.completedActivities).toBeGreaterThan(0);
      expect(stats.completionRate).toBeGreaterThanOrEqual(0);
      expect(stats.completionRate).toBeLessThanOrEqual(1);
    });

    it('should handle edge case with all activities completed', async () => {
      const testData = await createTestData(async (prisma) => {
        const milestone = await prisma.milestone.create({
          data: {
            title: 'Completed Milestone',
            subjectId: 1,
            userId: mockUser.id,
          },
        });

        await prisma.activity.create({
          data: {
            title: 'Completed Activity',
            milestoneId: milestone.id,
            completedAt: new Date(),
            userId: mockUser.id,
          },
        });

        return milestone;
      });

      const startDate = subDays(new Date(), 30);
      const endDate = new Date();

      const stats = await service.calculateProgressStatistics(
        mockStudent.id,
        startDate,
        endDate,
        mockUser.id
      );

      expect(stats.completionRate).toBe(1);
    });

    it('should handle edge case with no activities', async () => {
      const startDate = subDays(new Date(), 30);
      const endDate = new Date();

      const stats = await service.calculateProgressStatistics(
        mockStudent.id,
        startDate,
        endDate,
        mockUser.id
      );

      expect(stats.totalActivities).toBe(0);
      expect(stats.completedActivities).toBe(0);
      expect(stats.completionRate).toBe(0);
    });
  });

  describe('Template System', () => {
    it('should use custom report templates', async () => {
      const customTemplate = {
        title: 'Custom Report Template',
        sections: ['overview', 'progress', 'recommendations'],
        styling: {
          primaryColor: '#007acc',
          fontSize: 12,
        },
      };

      const startDate = subDays(new Date(), 30);
      const endDate = new Date();

      const report = await service.generateProgressReport(
        mockStudent.id,
        startDate,
        endDate,
        mockUser.id,
        customTemplate
      );

      expect(report).toBeDefined();
      expect(report.template).toBe(customTemplate);
    });

    it('should validate template configuration', async () => {
      const invalidTemplate = {
        // Missing required fields
        styling: {},
      };

      const startDate = subDays(new Date(), 30);
      const endDate = new Date();

      await expect(
        service.generateProgressReport(
          mockStudent.id,
          startDate,
          endDate,
          mockUser.id,
          invalidTemplate
        )
      ).rejects.toThrow();
    });
  });

  describe('Export Formats', () => {
    it('should export to multiple formats', async () => {
      const report = {
        studentName: 'Test Student',
        reportPeriod: 'Test Period',
        outcomes: [],
        activities: [],
        progress: {},
      };

      const formats = ['pdf', 'html', 'json'];
      
      for (const format of formats) {
        const exported = await service.exportReport(report, format);
        expect(exported).toBeDefined();
        
        if (format === 'pdf') {
          expect(exported).toBeInstanceOf(Buffer);
        } else if (format === 'html') {
          expect(typeof exported).toBe('string');
          expect(exported).toContain('<html>');
        } else if (format === 'json') {
          expect(typeof exported).toBe('string');
          const parsed = JSON.parse(exported);
          expect(parsed.studentName).toBe('Test Student');
        }
      }
    });

    it('should handle unsupported export formats', async () => {
      const report = {
        studentName: 'Test Student',
        reportPeriod: 'Test Period',
        outcomes: [],
        activities: [],
        progress: {},
      };

      await expect(
        service.exportReport(report, 'unsupported')
      ).rejects.toThrow();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle database connection failures', async () => {
      const prisma = getTestPrismaClient();
      const originalFind = prisma.student.findFirst;
      prisma.student.findFirst = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const startDate = subDays(new Date(), 30);
      const endDate = new Date();

      await expect(
        service.generateProgressReport(
          mockStudent.id,
          startDate,
          endDate,
          mockUser.id
        )
      ).rejects.toThrow('Database connection failed');

      // Restore original method
      prisma.student.findFirst = originalFind;
    });

    it('should handle memory constraints with large datasets', async () => {
      // Mock a scenario with very large amounts of data
      const prisma = getTestPrismaClient();
      const originalFind = prisma.activity.findMany;
      
      prisma.activity.findMany = jest.fn().mockResolvedValue(
        Array(10000).fill(null).map((_, i) => ({
          id: i,
          title: `Activity ${i}`,
          completedAt: i % 2 === 0 ? new Date() : null,
          milestoneId: 1,
          userId: mockUser.id,
        }))
      );

      const startDate = subDays(new Date(), 30);
      const endDate = new Date();

      const report = await service.generateProgressReport(
        mockStudent.id,
        startDate,
        endDate,
        mockUser.id
      );

      expect(report).toBeDefined();
      expect(report.activities.length).toBeLessThanOrEqual(1000); // Should limit for performance

      // Restore original method
      prisma.activity.findMany = originalFind;
    });

    it('should sanitize user input in reports', async () => {
      const maliciousStudent = await createTestData(async (prisma) => {
        return await prisma.student.create({
          data: {
            firstName: '<script>alert("xss")</script>',
            lastName: '<img src="x" onerror="alert(1)">',
            grade: 5,
            userId: mockUser.id,
          },
        });
      });

      const startDate = subDays(new Date(), 30);
      const endDate = new Date();

      const report = await service.generateProgressReport(
        maliciousStudent.id,
        startDate,
        endDate,
        mockUser.id
      );

      // Student name should be sanitized
      expect(report.studentName).not.toContain('<script>');
      expect(report.studentName).not.toContain('onerror');
      expect(report.studentName).not.toContain('<img');
    });
  });
});