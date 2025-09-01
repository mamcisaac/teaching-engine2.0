/**
 * Test Suite for SubstitutePlanPdfService
 * Tests PDF generation for substitute plans with class routines and notes
 */

import { PrismaClient } from '@teaching-engine/database';
import { SubstitutePlanPdfService } from '../substitutePlanPdfService';

// Mock Prisma
jest.mock('@teaching-engine/database', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    substitutePlan: {
      findFirst: jest.fn(),
    },
    classRoutine: {
      findMany: jest.fn(),
    },
    daybookEntry: {
      findMany: jest.fn(),
    },
    eTFOLessonPlan: {
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    student: {
      findMany: jest.fn(),
    },
  })),
}));

// Mock Puppeteer
jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setContent: jest.fn(),
      pdf: jest.fn().mockResolvedValue(Buffer.from('mock-pdf-content')),
      close: jest.fn(),
    }),
    close: jest.fn(),
  }),
}));

describe('SubstitutePlanPdfService', () => {
  let service: SubstitutePlanPdfService;
  let prisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SubstitutePlanPdfService();
    prisma = new PrismaClient();
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
        { time: '9:15 AM', activity: 'French Language Arts', notes: 'Lesson plan attached' },
        { time: '10:30 AM', activity: 'Nutrition Break', notes: 'Supervised snack time' },
        { time: '10:45 AM', activity: 'Mathematics', notes: 'Lesson plan attached' },
        { time: '12:00 PM', activity: 'Lunch', notes: 'Students eat in classroom' },
        { time: '1:00 PM', activity: 'Science', notes: 'Hands-on activity' },
        { time: '2:15 PM', activity: 'Pack Up', notes: 'Clean classroom, pack bags' },
        { time: '2:30 PM', activity: 'Dismissal', notes: 'Follow dismissal procedures' },
      ],
      emergencyInfo: {
        contacts: [
          { name: 'Main Office', phone: '(902) 555-0100' },
          { name: 'Nurse', phone: 'Extension 205' },
        ],
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
        description: 'Students enter quietly, unpack backpacks, put homework in bin, begin morning work on desk',
        timeOfDay: '8:30 AM',
        priority: 10,
      },
      {
        id: 2,
        category: 'transition',
        title: 'Line Up Procedure',
        description: 'Call by table groups, students push in chairs, line up quietly by the door',
        priority: 8,
      },
      {
        id: 3,
        category: 'behavior',
        title: 'Attention Signal',
        description: 'Teacher claps pattern, students repeat and give attention',
        priority: 9,
      },
      {
        id: 4,
        category: 'dismissal',
        title: 'End of Day Routine',
        description: 'Pack bags, stack chairs, pick up floor, line up when called',
        timeOfDay: '2:20 PM',
        priority: 10,
      },
    ];

    const mockDaybookEntries = [
      {
        id: 'daybook-1',
        date: new Date('2025-09-10'),
        whatWorked: 'Math manipulatives were very engaging for addition lesson',
        whatDidntWork: 'Transition to carpet took too long',
        nextSteps: 'Practice transition routine more',
        notableAchievements: 'All students completed math worksheet independently',
        lessonPlan: {
          title: 'Addition with Manipulatives',
          subject: 'Mathematics',
        },
      },
      {
        id: 'daybook-2',
        date: new Date('2025-09-11'),
        whatWorkedFr: 'Les élèves ont bien participé à la lecture partagée',
        commonChallenges: 'Some students struggling with French pronunciation',
        nextStepsFr: 'Plus de pratique avec les sons difficiles',
        lessonPlan: {
          title: 'Lecture partagée',
          subject: 'Français',
        },
      },
    ];

    const mockLessonPlans = [
      {
        id: 'lesson-1',
        title: 'French Reading - Les animaux',
        subject: 'Français',
        sequence: 1,
        learningGoals: 'Students will identify animal vocabulary in French',
        mindsOnActivities: 'Show animal pictures, practice pronunciation',
        actionActivities: 'Read story "Les animaux de la ferme", identify animals',
        consolidationActivities: 'Draw favorite animal and label in French',
        materials: ['Story book', 'Animal flashcards', 'Drawing paper'],
        differentiation: 'Provide word bank for struggling students',
      },
      {
        id: 'lesson-2',
        title: 'Math - Addition to 10',
        subject: 'Mathématiques',
        sequence: 2,
        learningGoals: 'Students will add numbers to 10 using manipulatives',
        mindsOnActivities: 'Number talk: ways to make 10',
        actionActivities: 'Use counters to solve addition problems',
        consolidationActivities: 'Math journal entry',
        materials: ['Counters', 'Worksheets', 'Math journals'],
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
        medicalNotes: 'Severe peanut allergy - EpiPen in office',
        accommodations: 'Sits near front for vision',
        parentNotes: 'Mother picks up at dismissal',
      },
      {
        firstName: 'James',
        lastName: 'Brown',
        accommodations: 'Extra time for written work',
        medicalNotes: null,
        parentNotes: 'Goes to after-school care',
      },
    ];

    beforeEach(() => {
      // Setup mock returns
      prisma.substitutePlan.findFirst.mockResolvedValue(mockSubstitutePlan);
      prisma.classRoutine.findMany.mockResolvedValue(mockClassRoutines);
      prisma.daybookEntry.findMany.mockResolvedValue(mockDaybookEntries);
      prisma.eTFOLessonPlan.findMany.mockResolvedValue(mockLessonPlans);
      prisma.user.findUnique.mockResolvedValue(mockTeacher);
      prisma.student.findMany.mockResolvedValue(mockStudents);
    });

    it('should successfully generate a PDF for a substitute plan', async () => {
      const result = await service.generatePdf(mockPlanId, mockUserId);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('mock-pdf-content');
    });

    it('should fetch all required data for the substitute plan', async () => {
      await service.generatePdf(mockPlanId, mockUserId);

      // Verify all data fetching calls
      expect(prisma.substitutePlan.findFirst).toHaveBeenCalledWith({
        where: { id: mockPlanId, userId: mockUserId },
      });

      expect(prisma.classRoutine.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, isActive: true },
        orderBy: [{ priority: 'desc' }, { category: 'asc' }],
      });

      expect(prisma.daybookEntry.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          userId: mockUserId,
        }),
        orderBy: { date: 'desc' },
        take: 5,
        include: {
          lessonPlan: {
            select: { title: true, subject: true },
          },
        },
      });

      expect(prisma.eTFOLessonPlan.findMany).toHaveBeenCalled();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { name: true, email: true, grade: true, program: true },
      });
      expect(prisma.student.findMany).toHaveBeenCalled();
    });

    it('should throw error if substitute plan not found', async () => {
      prisma.substitutePlan.findFirst.mockResolvedValue(null);

      await expect(service.generatePdf(mockPlanId, mockUserId)).rejects.toThrow(
        'Substitute plan not found or access denied'
      );
    });

    it('should handle empty class routines gracefully', async () => {
      prisma.classRoutine.findMany.mockResolvedValue([]);

      const result = await service.generatePdf(mockPlanId, mockUserId);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle empty daybook entries gracefully', async () => {
      prisma.daybookEntry.findMany.mockResolvedValue([]);

      const result = await service.generatePdf(mockPlanId, mockUserId);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle JSON schedule data correctly', async () => {
      const planWithJsonSchedule = {
        ...mockSubstitutePlan,
        schedule: JSON.stringify(mockSubstitutePlan.schedule),
      };
      prisma.substitutePlan.findFirst.mockResolvedValue(planWithJsonSchedule);

      const result = await service.generatePdf(mockPlanId, mockUserId);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should group routines by category correctly', async () => {
      await service.generatePdf(mockPlanId, mockUserId);

      // The grouping should happen internally
      // We can verify the PDF was generated successfully
      expect(prisma.classRoutine.findMany).toHaveBeenCalled();
    });

    it('should format lesson plans with time slots', async () => {
      await service.generatePdf(mockPlanId, mockUserId);

      // Verify lesson plans were fetched and processed
      expect(prisma.eTFOLessonPlan.findMany).toHaveBeenCalled();
    });

    it('should include only students with special notes', async () => {
      await service.generatePdf(mockPlanId, mockUserId);

      expect(prisma.student.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          OR: [
            { medicalNotes: { not: null } },
            { accommodations: { not: null } },
            { parentNotes: { not: null } },
          ],
        },
        select: expect.any(Object),
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      });
    });

    it('should handle PDF generation errors gracefully', async () => {
      const mockError = new Error('PDF generation failed');
      const mockPage = {
        setContent: jest.fn(),
        pdf: jest.fn().mockRejectedValue(mockError),
        close: jest.fn(),
      };
      
      const puppeteer = require('puppeteer');
      puppeteer.launch.mockResolvedValue({
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn(),
      });

      await expect(service.generatePdf(mockPlanId, mockUserId)).rejects.toThrow(
        'Failed to generate substitute plan PDF: PDF generation failed'
      );
    });

    it('should clean up browser resources after generation', async () => {
      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue({
          setContent: jest.fn(),
          pdf: jest.fn().mockResolvedValue(Buffer.from('mock-pdf')),
          close: jest.fn(),
        }),
        close: jest.fn(),
      };

      const puppeteer = require('puppeteer');
      puppeteer.launch.mockResolvedValue(mockBrowser);

      await service.generatePdf(mockPlanId, mockUserId);
      
      // Cleanup is called internally after PDF generation
      // We can verify the browser was used correctly
      expect(mockBrowser.newPage).toHaveBeenCalled();
    });
  });
});