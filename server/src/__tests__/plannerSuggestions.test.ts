import { describe, it, expect, beforeEach } from '@jest/globals';
import { getTestPrismaClient } from '../../tests/jest.setup';
import { getPlannerSuggestions } from '../services/plannerSuggestions';
import { addDays } from 'date-fns';

describe('PlannerSuggestions', () => {
  const prisma = getTestPrismaClient();
  const weekStart = new Date('2024-01-01'); // Monday
  const weekEnd = addDays(weekStart, 6); // Sunday

  beforeEach(async () => {
    // Clean up test data
    await prisma.dailyPlanItem.deleteMany();
    await prisma.activityOutcome.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.outcome.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('getPlannerSuggestions', () => {
    it('should return suggestions sorted by coverage status', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: 'hashed',
          name: 'Test Teacher',
          role: 'teacher',
        },
      });

      // Create subjects
      const mathSubject = await prisma.subject.create({
        data: { name: 'Mathematics' },
      });

      const scienceSubject = await prisma.subject.create({
        data: { name: 'Science' },
      });

      // Create outcomes with different coverage needs
      const outcomes = await Promise.all([
        prisma.outcome.create({
          data: { code: 'MATH-001', description: 'Basic Addition', subject: 'Math', grade: 1 },
        }),
        prisma.outcome.create({
          data: { code: 'MATH-002', description: 'Basic Subtraction', subject: 'Math', grade: 1 },
        }),
        prisma.outcome.create({
          data: { code: 'SCI-001', description: 'Plant Growth', subject: 'Science', grade: 1 },
        }),
        prisma.outcome.create({
          data: { code: 'SCI-002', description: 'Animal Habitats', subject: 'Science', grade: 1 },
        }),
      ]);

      // Create milestones within the week range
      const mathMilestone = await prisma.milestone.create({
        data: {
          title: 'Math Milestone 1',
          startDate: weekStart,
          endDate: new Date('2024-01-15'),
          subjectId: mathSubject.id,
          userId: user.id,
        },
      });

      const scienceMilestone = await prisma.milestone.create({
        data: {
          title: 'Science Milestone 1',
          startDate: new Date('2024-01-03'),
          endDate: new Date('2024-01-10'),
          subjectId: scienceSubject.id,
          userId: user.id,
        },
      });

      // Create activities with different outcome coverage
      // Activity 1: Links to uncovered outcome (MATH-001)
      const activity1 = await prisma.activity.create({
        data: {
          title: 'Addition Practice',
          milestoneId: mathMilestone.id,
          completedAt: null,
        },
      });

      await prisma.activityOutcome.create({
        data: { activityId: activity1.id, outcomeId: outcomes[0].id }, // MATH-001
      });

      // Activity 2: Links to partially covered outcome (MATH-002)
      const activity2 = await prisma.activity.create({
        data: {
          title: 'Subtraction Practice',
          milestoneId: mathMilestone.id,
          completedAt: null,
        },
      });

      await prisma.activityOutcome.create({
        data: { activityId: activity2.id, outcomeId: outcomes[1].id }, // MATH-002
      });

      // Create another activity for MATH-002 that's completed (to make it partial)
      const completedActivity = await prisma.activity.create({
        data: {
          title: 'Subtraction Basics',
          milestoneId: mathMilestone.id,
          completedAt: new Date(),
        },
      });

      await prisma.activityOutcome.create({
        data: { activityId: completedActivity.id, outcomeId: outcomes[1].id }, // MATH-002
      });

      // Activity 3: No outcomes (general activity)
      const activity3 = await prisma.activity.create({
        data: {
          title: 'Plant Growth Experiment',
          milestoneId: scienceMilestone.id,
          completedAt: null,
        },
      });

      // Activity 4: Links to already covered outcome (SCI-002)
      const activity4 = await prisma.activity.create({
        data: {
          title: 'Animal Habitats Study',
          milestoneId: scienceMilestone.id,
          completedAt: null,
        },
      });

      await prisma.activityOutcome.create({
        data: { activityId: activity4.id, outcomeId: outcomes[3].id }, // SCI-002
      });

      // Create a completed activity for SCI-002 to make it already covered
      const completedScienceActivity = await prisma.activity.create({
        data: {
          title: 'Animal Habitats Introduction',
          milestoneId: scienceMilestone.id,
          completedAt: new Date(),
        },
      });

      await prisma.activityOutcome.create({
        data: { activityId: completedScienceActivity.id, outcomeId: outcomes[3].id }, // SCI-002
      });

      // Get suggestions
      const suggestions = await getPlannerSuggestions(weekStart, user.id);

      expect(suggestions).toHaveLength(4);

      // First suggestion should cover uncovered outcomes
      const firstSuggestion = suggestions[0];
      expect(firstSuggestion.activityId).toBe(activity1.id);
      expect(firstSuggestion.title).toBe('Addition Practice');
      expect(firstSuggestion.coverageStatus).toBe('covers_uncovered');
      expect(firstSuggestion.linkedOutcomes).toContain('MATH-001');

      // Check that suggestions are properly sorted
      const coverageStatuses = suggestions.map((s) => s.coverageStatus);
      expect(coverageStatuses[0]).toBe('covers_uncovered');

      // Find specific suggestions
      const generalSuggestion = suggestions.find((s) => s.activityId === activity3.id);
      expect(generalSuggestion?.coverageStatus).toBe('general');
      expect(generalSuggestion?.linkedOutcomes).toHaveLength(0);

      const alreadyCoveredSuggestion = suggestions.find((s) => s.activityId === activity4.id);
      expect(alreadyCoveredSuggestion?.coverageStatus).toBe('already_covered');
    });

    it('should handle milestones without subjects', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test2@example.com',
          password: 'hashed',
          name: 'Test Teacher 2',
          role: 'teacher',
        },
      });

      // Create milestone without subject
      const milestone = await prisma.milestone.create({
        data: {
          title: 'Reading Milestone',
          startDate: new Date('2024-01-05'),
          endDate: new Date('2024-01-12'),
          userId: user.id,
          // No subjectId
        },
      });

      const activity = await prisma.activity.create({
        data: {
          title: 'Reading Comprehension',
          milestoneId: milestone.id,
          completedAt: null,
        },
      });

      const suggestions = await getPlannerSuggestions(weekStart, user.id);

      const uncategorizedSuggestion = suggestions.find((s) => s.activityId === activity.id);
      expect(uncategorizedSuggestion).toBeTruthy();
      expect(uncategorizedSuggestion?.subject).toBe('Uncategorized');
    });

    it('should only include activities from milestones in the date range', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test3@example.com',
          password: 'hashed',
          name: 'Test Teacher 3',
          role: 'teacher',
        },
      });

      const subject = await prisma.subject.create({
        data: { name: 'History' },
      });

      // Create milestone outside the week range
      const outsideMilestone = await prisma.milestone.create({
        data: {
          title: 'Future Milestone',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-02-15'),
          subjectId: subject.id,
          userId: user.id,
        },
      });

      await prisma.activity.create({
        data: {
          title: 'Future Activity',
          milestoneId: outsideMilestone.id,
          completedAt: null,
        },
      });

      // Create milestone within range
      const insideMilestone = await prisma.milestone.create({
        data: {
          title: 'Current Milestone',
          startDate: weekStart,
          endDate: weekEnd,
          subjectId: subject.id,
          userId: user.id,
        },
      });

      const currentActivity = await prisma.activity.create({
        data: {
          title: 'Current Activity',
          milestoneId: insideMilestone.id,
          completedAt: null,
        },
      });

      const suggestions = await getPlannerSuggestions(weekStart, user.id);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].activityId).toBe(currentActivity.id);
    });

    it('should exclude already scheduled activities', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test4@example.com',
          password: 'hashed',
          name: 'Test Teacher 4',
          role: 'teacher',
        },
      });

      const subject = await prisma.subject.create({
        data: { name: 'Art' },
      });

      const milestone = await prisma.milestone.create({
        data: {
          title: 'Art Projects',
          startDate: weekStart,
          endDate: weekEnd,
          subjectId: subject.id,
          userId: user.id,
        },
      });

      // Create unscheduled activity
      const unscheduledActivity = await prisma.activity.create({
        data: {
          title: 'Painting Project',
          milestoneId: milestone.id,
          completedAt: null,
        },
      });

      // Create scheduled activity
      const scheduledActivity = await prisma.activity.create({
        data: {
          title: 'Drawing Project',
          milestoneId: milestone.id,
          completedAt: null,
        },
      });

      // Create daily plan item for scheduled activity
      const dailyPlan = await prisma.dailyPlan.create({
        data: {
          date: weekStart,
          userId: user.id,
        },
      });

      await prisma.dailyPlanItem.create({
        data: {
          activityId: scheduledActivity.id,
          dailyPlanId: dailyPlan.id,
          startTime: '09:00',
          duration: 60,
        },
      });

      const suggestions = await getPlannerSuggestions(weekStart, user.id);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].activityId).toBe(unscheduledActivity.id);
    });

    it('should exclude completed activities', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test5@example.com',
          password: 'hashed',
          name: 'Test Teacher 5',
          role: 'teacher',
        },
      });

      const subject = await prisma.subject.create({
        data: { name: 'Music' },
      });

      const milestone = await prisma.milestone.create({
        data: {
          title: 'Music Theory',
          startDate: weekStart,
          endDate: weekEnd,
          subjectId: subject.id,
          userId: user.id,
        },
      });

      // Create incomplete activity
      const incompleteActivity = await prisma.activity.create({
        data: {
          title: 'Rhythm Practice',
          milestoneId: milestone.id,
          completedAt: null,
        },
      });

      // Create completed activity
      await prisma.activity.create({
        data: {
          title: 'Note Reading',
          milestoneId: milestone.id,
          completedAt: new Date(),
        },
      });

      const suggestions = await getPlannerSuggestions(weekStart, user.id);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].activityId).toBe(incompleteActivity.id);
    });

    it('should work without userId', async () => {
      // Create activity without specific user
      const subject = await prisma.subject.create({
        data: { name: 'Geography' },
      });

      const milestone = await prisma.milestone.create({
        data: {
          title: 'World Geography',
          startDate: weekStart,
          endDate: weekEnd,
          subjectId: subject.id,
          // No userId
        },
      });

      const activity = await prisma.activity.create({
        data: {
          title: 'Map Reading',
          milestoneId: milestone.id,
          completedAt: null,
        },
      });

      const suggestions = await getPlannerSuggestions(weekStart);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].activityId).toBe(activity.id);
    });

    it('should handle empty milestones', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test6@example.com',
          password: 'hashed',
          name: 'Test Teacher 6',
          role: 'teacher',
        },
      });

      const suggestions = await getPlannerSuggestions(weekStart, user.id);

      expect(suggestions).toEqual([]);
    });

    it('should sort by number of outcomes when coverage status is equal', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test7@example.com',
          password: 'hashed',
          name: 'Test Teacher 7',
          role: 'teacher',
        },
      });

      const subject = await prisma.subject.create({
        data: { name: 'Physics' },
      });

      const milestone = await prisma.milestone.create({
        data: {
          title: 'Physics Basics',
          startDate: weekStart,
          endDate: weekEnd,
          subjectId: subject.id,
          userId: user.id,
        },
      });

      // Create outcomes
      const outcomes = await Promise.all([
        prisma.outcome.create({
          data: { code: 'PHY-001', description: 'Force', subject: 'Physics', grade: 1 },
        }),
        prisma.outcome.create({
          data: { code: 'PHY-002', description: 'Motion', subject: 'Physics', grade: 1 },
        }),
        prisma.outcome.create({
          data: { code: 'PHY-003', description: 'Energy', subject: 'Physics', grade: 1 },
        }),
      ]);

      // Activity with 3 outcomes
      const activity1 = await prisma.activity.create({
        data: {
          title: 'Comprehensive Physics Lab',
          milestoneId: milestone.id,
          completedAt: null,
        },
      });

      await prisma.activityOutcome.createMany({
        data: outcomes.map((outcome) => ({
          activityId: activity1.id,
          outcomeId: outcome.id,
        })),
      });

      // Activity with 1 outcome
      const activity2 = await prisma.activity.create({
        data: {
          title: 'Simple Force Exercise',
          milestoneId: milestone.id,
          completedAt: null,
        },
      });

      await prisma.activityOutcome.create({
        data: { activityId: activity2.id, outcomeId: outcomes[0].id },
      });

      const suggestions = await getPlannerSuggestions(weekStart, user.id);

      expect(suggestions).toHaveLength(2);
      // Activity with more outcomes should come first when coverage status is equal
      expect(suggestions[0].linkedOutcomes).toHaveLength(3);
      expect(suggestions[1].linkedOutcomes).toHaveLength(1);
    });
  });
});
