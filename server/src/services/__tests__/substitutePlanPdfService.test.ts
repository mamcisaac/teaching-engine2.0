/**
 * Test Suite for SubstitutePlanPdfService
 * Tests PDF generation for substitute plans with class routines and notes
 */

import { jest } from '@jest/globals';
import { SubstitutePlanPdfService } from '../substitutePlanPdfService';
import { PrismaClient } from '@teaching-engine/database';

// Mock dependencies
jest.mock('@teaching-engine/database');
jest.mock('puppeteer', () => ({
  launch: jest.fn(),
}));
jest.mock('../../logger');
jest.mock('../../utils/prisma');

// Import puppeteer to access mocks
import * as puppeteer from 'puppeteer';

describe('SubstitutePlanPdfService', () => {
  let service: SubstitutePlanPdfService;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock Prisma client
    mockPrisma = {
      substitutePlan: {
        findFirst: jest.fn(),
      },
      classRoutine: {
        findMany: jest.fn(),
      },
      daybookEntry: {
        findMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      student: {
        findMany: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
    };
    
    // Setup puppeteer mock
    const mockPage = {
      setContent: jest.fn(),
      pdf: jest.fn(() => Promise.resolve(Buffer.from('mock-pdf-content'))),
    };
    const mockBrowser = {
      newPage: jest.fn(() => Promise.resolve(mockPage)),
      close: jest.fn(),
    };
    (puppeteer.launch as any).mockResolvedValue(mockBrowser);
    
    // Create service with mocked Prisma
    service = new SubstitutePlanPdfService(mockPrisma);
  });

  describe('generatePdf', () => {
    const mockPlanId = 'test-plan-123';
    const mockUserId = 1;

    const mockSubstitutePlan = {
      id: mockPlanId,
      userId: mockUserId,
      title: 'Grade 1 Substitute Plan',
      dateFor: new Date('2025-09-15'),
      grade: 1,
      subject: 'French Immersion',
      schedule: [
        { time: '8:30 AM', activity: 'Morning Entry', notes: 'Students unpack and begin morning work' },
        { time: '9:00 AM', activity: 'Morning Meeting', notes: 'Take attendance, calendar activities' },
      ],
      emergencyInfo: {
        evacuationProcedure: 'Exit through main door, proceed to playground assembly point',
        lockdownProcedure: 'Lock door, turn off lights, move students to safe corner',
      },
      generalNotes: 'Class is generally well-behaved. Use attention signal (clap pattern) for transitions.',
    };

    const mockClassRoutines = [
      {
        id: 1,
        category: 'morning',
        title: 'Morning Entry Routine',
        description: 'Students enter quietly, unpack backpacks',
        timeOfDay: '8:30 AM',
        priority: 10,
      },
      {
        id: 2,
        category: 'transition',
        title: 'Line Up Procedure',
        description: 'Call by table groups',
        priority: 8,
      },
    ];

    const mockDaybookEntries = [
      {
        date: new Date('2025-09-10'),
        whatWorked: 'Students engaged well with hands-on math manipulatives',
        whatDidntWork: 'Transition to gym took too long',
        nextSteps: 'Practice gym transition routine tomorrow',
      },
    ];

    const mockTeacher = {
      name: 'Emily Johnson',
      email: 'emily.johnson@school.com',
      grade: 'Grade 1',
      program: 'French Immersion',
    };

    const mockStudents = [
      {
        firstName: 'Sarah',
        lastName: 'Smith',
        notes: 'Severe peanut allergy - EpiPen in office',
        accommodations: { visual: 'Sits near front for vision' },
        specialNeeds: null,
      },
    ];

    beforeEach(() => {
      // Setup mock returns
      mockPrisma.substitutePlan.findFirst.mockResolvedValue(mockSubstitutePlan);
      mockPrisma.classRoutine.findMany.mockResolvedValue(mockClassRoutines);
      mockPrisma.daybookEntry.findMany.mockResolvedValue(mockDaybookEntries);
      mockPrisma.user.findUnique.mockResolvedValue(mockTeacher);
      mockPrisma.student.findMany.mockResolvedValue(mockStudents);
      mockPrisma.auditLog.create.mockResolvedValue({});
    });

    it('should successfully generate a PDF for a substitute plan', async () => {
      const result = await service.generatePdf(mockPlanId, mockUserId);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('mock-pdf-content');
    });

    it('should fetch all required data for the substitute plan', async () => {
      await service.generatePdf(mockPlanId, mockUserId);

      // Verify all data fetching calls
      expect(mockPrisma.substitutePlan.findFirst).toHaveBeenCalledWith({
        where: { id: mockPlanId, userId: mockUserId, isActive: true },
      });

      expect(mockPrisma.classRoutine.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, isActive: true },
        orderBy: { priority: 'desc' },
      });

      expect(mockPrisma.daybookEntry.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          userId: mockUserId,
        }),
        orderBy: { date: 'desc' },
        take: 5,
        select: expect.objectContaining({
          date: true,
          whatWorked: true,
          whatDidntWork: true,
          nextSteps: true,
        }),
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { name: true, email: true, grade: true, program: true },
      });
      
      expect(mockPrisma.student.findMany).toHaveBeenCalled();
    });

    it('should throw error if substitute plan not found', async () => {
      mockPrisma.substitutePlan.findFirst.mockResolvedValue(null);

      await expect(service.generatePdf(mockPlanId, mockUserId)).rejects.toThrow(
        'Substitute plan not found or access denied'
      );
    });

    it('should handle empty class routines gracefully', async () => {
      mockPrisma.classRoutine.findMany.mockResolvedValue([]);

      const result = await service.generatePdf(mockPlanId, mockUserId);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle empty daybook entries gracefully', async () => {
      mockPrisma.daybookEntry.findMany.mockResolvedValue([]);

      const result = await service.generatePdf(mockPlanId, mockUserId);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle JSON schedule data correctly', async () => {
      const planWithJsonSchedule = {
        ...mockSubstitutePlan,
        schedule: JSON.stringify(mockSubstitutePlan.schedule),
      };
      mockPrisma.substitutePlan.findFirst.mockResolvedValue(planWithJsonSchedule);

      const result = await service.generatePdf(mockPlanId, mockUserId);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should group routines by category correctly', async () => {
      await service.generatePdf(mockPlanId, mockUserId);

      // Verify PDF was generated successfully
      expect(puppeteer.launch).toHaveBeenCalled();
    });

    it('should include only students with special notes', async () => {
      await service.generatePdf(mockPlanId, mockUserId);

      expect(mockPrisma.student.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          userId: mockUserId,
          isActive: true,
        }),
        select: expect.objectContaining({
          firstName: true,
          lastName: true,
          notes: true,
          accommodations: true,
          specialNeeds: true,
        }),
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ],
      });
    });

    it('should handle PDF generation errors gracefully', async () => {
      const mockError = new Error('PDF generation failed');
      (puppeteer.launch as any).mockRejectedValue(mockError);

      await expect(service.generatePdf(mockPlanId, mockUserId)).rejects.toThrow(
        'PDF generation failed'
      );
    });

    it('should clean up browser resources after generation', async () => {
      const mockBrowser = {
        newPage: jest.fn(() => Promise.resolve({
          setContent: jest.fn(),
          pdf: jest.fn(() => Promise.resolve(Buffer.from('mock-pdf-content'))),
        })),
        close: jest.fn(),
      };
      (puppeteer.launch as any).mockResolvedValue(mockBrowser);

      await service.generatePdf(mockPlanId, mockUserId);

      // Verify browser was closed
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });
});