import { describe, it, expect } from '@jest/globals';
import { getMilestoneProgress, getMilestoneUrgency } from '../../src/services/progressAnalytics';
import { enhancedFactories } from '../enhanced-factories';

describe('ProgressAnalytics Unit Tests', () => {
  describe('getMilestoneProgress', () => {
    it('should calculate completion rate correctly for milestone with no activities', async () => {
      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({
        subjectId: subject.id,
        title: 'Empty Milestone',
      });

      const progress = await getMilestoneProgress();
      const milestoneProgress = progress.find((p) => p.id === milestone.id);

      expect(milestoneProgress).toBeDefined();
      expect(milestoneProgress!.completionRate).toBe(0);
      expect(milestoneProgress!.title).toBe('Empty Milestone');
    });

    it('should calculate completion rate for milestone with all completed activities', async () => {
      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({
        subjectId: subject.id,
        title: 'Completed Milestone',
      });

      // Create 3 completed activities
      await Promise.all([
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: new Date(),
        }),
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: new Date(),
        }),
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: new Date(),
        }),
      ]);

      const progress = await getMilestoneProgress();
      const milestoneProgress = progress.find((p) => p.id === milestone.id);

      expect(milestoneProgress).toBeDefined();
      expect(milestoneProgress!.completionRate).toBe(1.0); // 100% complete
    });

    it('should calculate partial completion rate correctly', async () => {
      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({
        subjectId: subject.id,
        title: 'Partial Milestone',
      });

      // Create 4 activities: 2 completed, 2 not completed
      await Promise.all([
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: new Date(),
        }),
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: new Date(),
        }),
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: null,
        }),
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: null,
        }),
      ]);

      const progress = await getMilestoneProgress();
      const milestoneProgress = progress.find((p) => p.id === milestone.id);

      expect(milestoneProgress).toBeDefined();
      expect(milestoneProgress!.completionRate).toBe(0.5); // 50% complete
    });

    it('should handle milestones with targetDate', async () => {
      const targetDate = new Date('2024-12-31');
      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({
        subjectId: subject.id,
        title: 'Milestone with Target',
        targetDate,
      });

      const progress = await getMilestoneProgress();
      const milestoneProgress = progress.find((p) => p.id === milestone.id);

      expect(milestoneProgress).toBeDefined();
      expect(milestoneProgress!.targetDate).toEqual(targetDate);
    });

    it('should return all milestones', async () => {
      const subject = await enhancedFactories.subject.create();

      await Promise.all([
        enhancedFactories.milestone.create({ subjectId: subject.id, title: 'First' }),
        enhancedFactories.milestone.create({ subjectId: subject.id, title: 'Second' }),
        enhancedFactories.milestone.create({ subjectId: subject.id, title: 'Third' }),
      ]);

      const progress = await getMilestoneProgress();

      expect(progress.length).toBeGreaterThanOrEqual(3);

      const titles = progress.map((p) => p.title);
      expect(titles).toContain('First');
      expect(titles).toContain('Second');
      expect(titles).toContain('Third');
    });

    it('should handle edge case of single activity milestone', async () => {
      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({
        subjectId: subject.id,
        title: 'Single Activity',
      });

      await enhancedFactories.activity.create({
        milestoneId: milestone.id,
        completedAt: new Date(),
      });

      const progress = await getMilestoneProgress();
      const milestoneProgress = progress.find((p) => p.id === milestone.id);

      expect(milestoneProgress!.completionRate).toBe(1.0);
    });
  });

  describe('getMilestoneUrgency', () => {
    it('should calculate urgency for milestone with near deadline', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({
        subjectId: subject.id,
        title: 'Urgent Milestone',
        targetDate: tomorrow,
      });

      // Create incomplete activities
      await Promise.all([
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: null,
        }),
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: null,
        }),
      ]);

      const urgency = await getMilestoneUrgency();
      const milestoneUrgency = urgency.find((u) => u.id === milestone.id);

      expect(milestoneUrgency).toBeDefined();
      expect(milestoneUrgency!.urgency).toBeGreaterThan(0);
      // With 0% completion and 1 day left, urgency should be (1-0)/1 = 1
      expect(milestoneUrgency!.urgency).toBeCloseTo(1.0, 2);
    });

    it('should calculate lower urgency for milestone with distant deadline', async () => {
      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + 30);

      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({
        subjectId: subject.id,
        title: 'Future Milestone',
        targetDate: farFuture,
      });

      await enhancedFactories.activity.create({
        milestoneId: milestone.id,
        completedAt: null,
      });

      const urgency = await getMilestoneUrgency();
      const milestoneUrgency = urgency.find((u) => u.id === milestone.id);

      expect(milestoneUrgency).toBeDefined();
      // With 30 days left, urgency should be much lower
      expect(milestoneUrgency!.urgency).toBeLessThan(0.1);
    });

    it('should calculate lower urgency for mostly completed milestone', async () => {
      const nearDate = new Date();
      nearDate.setDate(nearDate.getDate() + 2);

      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({
        subjectId: subject.id,
        title: 'Nearly Done Milestone',
        targetDate: nearDate,
      });

      // Create 4 activities: 3 completed, 1 not completed
      await Promise.all([
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: new Date(),
        }),
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: new Date(),
        }),
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: new Date(),
        }),
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: null,
        }),
      ]);

      const urgency = await getMilestoneUrgency();
      const milestoneUrgency = urgency.find((u) => u.id === milestone.id);

      expect(milestoneUrgency).toBeDefined();
      expect(milestoneUrgency!.completionRate).toBe(0.75);
      // With 75% completion and 2 days left: urgency = (1-0.75)/2 = 0.125
      expect(milestoneUrgency!.urgency).toBeCloseTo(0.125, 3);
    });

    it('should handle milestones without target dates', async () => {
      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({
        subjectId: subject.id,
        title: 'No Deadline Milestone',
        targetDate: null,
      });

      await enhancedFactories.activity.create({
        milestoneId: milestone.id,
        completedAt: null,
      });

      const urgency = await getMilestoneUrgency();
      const milestoneUrgency = urgency.find((u) => u.id === milestone.id);

      expect(milestoneUrgency).toBeDefined();
      // Should default to 30 days: urgency = (1-0)/30 = 0.033...
      expect(milestoneUrgency!.urgency).toBeCloseTo(0.033, 3);
    });

    it('should sort milestones by urgency (highest first)', async () => {
      const subject = await enhancedFactories.subject.create();

      // Create milestones with different urgency levels
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const urgentMilestone = await enhancedFactories.milestone.create({
        subjectId: subject.id,
        title: 'Very Urgent',
        targetDate: tomorrow,
      });

      const moderateMilestone = await enhancedFactories.milestone.create({
        subjectId: subject.id,
        title: 'Moderate',
        targetDate: nextWeek,
      });

      // Add incomplete activities to both
      await enhancedFactories.activity.create({
        milestoneId: urgentMilestone.id,
        completedAt: null,
      });

      await enhancedFactories.activity.create({
        milestoneId: moderateMilestone.id,
        completedAt: null,
      });

      const urgency = await getMilestoneUrgency();

      // Find the positions of our test milestones
      const urgentIndex = urgency.findIndex((u) => u.id === urgentMilestone.id);
      const moderateIndex = urgency.findIndex((u) => u.id === moderateMilestone.id);

      expect(urgentIndex).toBeLessThan(moderateIndex);
      expect(urgency[urgentIndex].urgency).toBeGreaterThan(urgency[moderateIndex].urgency);
    });

    it('should handle completed milestones correctly', async () => {
      const nearDate = new Date();
      nearDate.setDate(nearDate.getDate() + 1);

      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({
        subjectId: subject.id,
        title: 'Completed Milestone',
        targetDate: nearDate,
      });

      await enhancedFactories.activity.create({
        milestoneId: milestone.id,
        completedAt: new Date(),
      });

      const urgency = await getMilestoneUrgency();
      const milestoneUrgency = urgency.find((u) => u.id === milestone.id);

      expect(milestoneUrgency).toBeDefined();
      expect(milestoneUrgency!.completionRate).toBe(1.0);
      expect(milestoneUrgency!.urgency).toBe(0); // No urgency for completed milestones
    });

    it('should handle past due milestones', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({
        subjectId: subject.id,
        title: 'Overdue Milestone',
        targetDate: yesterday,
      });

      await enhancedFactories.activity.create({
        milestoneId: milestone.id,
        completedAt: null,
      });

      const urgency = await getMilestoneUrgency();
      const milestoneUrgency = urgency.find((u) => u.id === milestone.id);

      expect(milestoneUrgency).toBeDefined();
      // Past due milestones should have high urgency (daysLeft defaults to 1)
      expect(milestoneUrgency!.urgency).toBe(1.0);
    });
  });
});
