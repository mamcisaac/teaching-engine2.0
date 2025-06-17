import { describe, it, expect, beforeEach } from '@jest/globals';
import { reorderActivities } from '../../src/services/activityService';
import { enhancedFactories } from '../enhanced-factories';
import { getTestPrismaClient } from '../jest.setup';

describe('ActivityService Unit Tests', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;

  beforeEach(() => {
    prisma = getTestPrismaClient();
  });

  describe('reorderActivities', () => {
    it('should reorder activities correctly', async () => {
      // Create test data
      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({ subjectId: subject.id });
      
      const activities = await Promise.all([
        enhancedFactories.activity.create({ milestoneId: milestone.id, title: 'First', orderIndex: 0 }),
        enhancedFactories.activity.create({ milestoneId: milestone.id, title: 'Second', orderIndex: 1 }),
        enhancedFactories.activity.create({ milestoneId: milestone.id, title: 'Third', orderIndex: 2 }),
      ]);

      // Reorder: [0, 1, 2] -> [2, 0, 1]
      const newOrder = [activities[2].id, activities[0].id, activities[1].id];
      const result = await reorderActivities(milestone.id, newOrder);

      // Verify the result
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(activities[2].id);
      expect(result[0].orderIndex).toBe(0);
      expect(result[1].id).toBe(activities[0].id);
      expect(result[1].orderIndex).toBe(1);
      expect(result[2].id).toBe(activities[1].id);
      expect(result[2].orderIndex).toBe(2);
    });

    it('should handle empty activity list', async () => {
      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({ subjectId: subject.id });

      const result = await reorderActivities(milestone.id, []);
      expect(result).toHaveLength(0);
    });

    it('should handle single activity', async () => {
      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({ subjectId: subject.id });
      const activity = await enhancedFactories.activity.create({ milestoneId: milestone.id });

      const result = await reorderActivities(milestone.id, [activity.id]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(activity.id);
      expect(result[0].orderIndex).toBe(0);
    });

    it('should maintain referential integrity', async () => {
      const subject = await enhancedFactories.subject.create();
      const milestone1 = await enhancedFactories.milestone.create({ subjectId: subject.id });
      const milestone2 = await enhancedFactories.milestone.create({ subjectId: subject.id });
      
      const activity1 = await enhancedFactories.activity.create({ milestoneId: milestone1.id });
      const activity2 = await enhancedFactories.activity.create({ milestoneId: milestone2.id });

      // Should only return activities for milestone1
      const result = await reorderActivities(milestone1.id, [activity1.id]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(activity1.id);

      // Verify milestone2's activity is unchanged
      const milestone2Activities = await prisma.activity.findMany({
        where: { milestoneId: milestone2.id },
        orderBy: { orderIndex: 'asc' }
      });
      expect(milestone2Activities).toHaveLength(1);
      expect(milestone2Activities[0].id).toBe(activity2.id);
    });

    it('should preserve activity properties during reorder', async () => {
      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({ subjectId: subject.id });
      
      const originalActivity = await enhancedFactories.activity.create({
        milestoneId: milestone.id,
        title: 'Test Activity',
        durationMins: 60,
        privateNote: 'Private note',
        publicNote: 'Public note',
        materialsText: 'Materials needed',
        tags: ['test', 'unit'],
        isSubFriendly: true,
        isFallback: false,
      });

      const result = await reorderActivities(milestone.id, [originalActivity.id]);
      const reorderedActivity = result[0];

      // Verify all properties are preserved
      expect(reorderedActivity.title).toBe('Test Activity');
      expect(reorderedActivity.durationMins).toBe(60);
      expect(reorderedActivity.privateNote).toBe('Private note');
      expect(reorderedActivity.publicNote).toBe('Public note');
      expect(reorderedActivity.materialsText).toBe('Materials needed');
      expect(reorderedActivity.tags).toEqual(['test', 'unit']);
      expect(reorderedActivity.isSubFriendly).toBe(true);
      expect(reorderedActivity.isFallback).toBe(false);
      expect(reorderedActivity.milestoneId).toBe(milestone.id);
    });

    it('should handle large number of activities efficiently', async () => {
      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({ subjectId: subject.id });
      
      // Create 50 activities
      const activities = await Promise.all(
        Array.from({ length: 50 }, (_, i) =>
          enhancedFactories.activity.create({
            milestoneId: milestone.id,
            title: `Activity ${i}`,
            orderIndex: i,
          })
        )
      );

      // Reverse the order
      const newOrder = activities.map(a => a.id).reverse();
      
      const startTime = Date.now();
      const result = await reorderActivities(milestone.id, newOrder);
      const duration = Date.now() - startTime;

      // Should complete quickly (under 1 second)
      expect(duration).toBeLessThan(1000);
      expect(result).toHaveLength(50);
      
      // Verify first and last items are correctly positioned
      expect(result[0].id).toBe(activities[49].id);
      expect(result[49].id).toBe(activities[0].id);
    });
  });
});