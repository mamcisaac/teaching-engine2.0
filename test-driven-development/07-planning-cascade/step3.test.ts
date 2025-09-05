/**
 * TRUE TDD: Planning Cascade View
 * Step 3: Scheduling status
 * 
 * Discovering we need to track whether lessons are scheduled
 */

import { describe, it, expect } from 'vitest';

describe('Step 3: Tracking scheduling status', () => {
  it('should track if a lesson is scheduled', () => {
    // Discovering we need scheduling status
    interface LessonNode {
      id: string;
      title: string;
      scheduled: boolean;
      scheduleDate?: Date;
      scheduleTime?: string;
    }

    const scheduledLesson: LessonNode = {
      id: 'lesson-1',
      title: 'Five Senses Exploration',
      scheduled: true,
      scheduleDate: new Date('2024-10-12'),
      scheduleTime: '9:00 AM'
    };

    const unscheduledLesson: LessonNode = {
      id: 'lesson-2',
      title: 'Smell Memory Game',
      scheduled: false
    };

    expect(scheduledLesson.scheduled).toBe(true);
    expect(scheduledLesson.scheduleDate).toBeDefined();
    expect(unscheduledLesson.scheduled).toBe(false);
    expect(unscheduledLesson.scheduleDate).toBeUndefined();
  });

  it('should count unscheduled lessons in a unit', () => {
    interface Lesson {
      id: string;
      title: string;
      scheduled: boolean;
    }

    interface Unit {
      id: string;
      title: string;
      lessons: Lesson[];
    }

    function countUnscheduledLessons(unit: Unit): number {
      return unit.lessons.filter(l => !l.scheduled).length;
    }

    const unit: Unit = {
      id: 'unit-1',
      title: 'Our Senses',
      lessons: [
        { id: 'lesson-1', title: 'Five Senses', scheduled: true },
        { id: 'lesson-2', title: 'Touch and Texture', scheduled: true },
        { id: 'lesson-3', title: 'Smell Memory', scheduled: false },
        { id: 'lesson-4', title: 'Sound Patterns', scheduled: false }
      ]
    };

    const unscheduledCount = countUnscheduledLessons(unit);
    expect(unscheduledCount).toBe(2);
  });

  it('should provide scheduling summary for entire tree', () => {
    interface TreeNode {
      id: string;
      type: 'term' | 'unit' | 'lesson';
      title: string;
      scheduled?: boolean;
      children?: TreeNode[];
    }

    function getSchedulingSummary(node: TreeNode): { 
      total: number; 
      scheduled: number; 
      unscheduled: number;
      percentage: number;
    } {
      let total = 0;
      let scheduled = 0;

      function traverse(n: TreeNode) {
        if (n.type === 'lesson') {
          total++;
          if (n.scheduled) {
            scheduled++;
          }
        }
        n.children?.forEach(traverse);
      }

      traverse(node);
      
      return {
        total,
        scheduled,
        unscheduled: total - scheduled,
        percentage: total > 0 ? Math.round((scheduled / total) * 100) : 0
      };
    }

    const tree: TreeNode = {
      id: 'term-1',
      type: 'term',
      title: 'Term 1',
      children: [
        {
          id: 'unit-1',
          type: 'unit',
          title: 'Unit 1',
          children: [
            { id: 'l1', type: 'lesson', title: 'L1', scheduled: true },
            { id: 'l2', type: 'lesson', title: 'L2', scheduled: true },
            { id: 'l3', type: 'lesson', title: 'L3', scheduled: false }
          ]
        },
        {
          id: 'unit-2',
          type: 'unit',
          title: 'Unit 2',
          children: [
            { id: 'l4', type: 'lesson', title: 'L4', scheduled: true },
            { id: 'l5', type: 'lesson', title: 'L5', scheduled: false }
          ]
        }
      ]
    };

    const summary = getSchedulingSummary(tree);
    
    expect(summary.total).toBe(5);
    expect(summary.scheduled).toBe(3);
    expect(summary.unscheduled).toBe(2);
    expect(summary.percentage).toBe(60);
  });
});