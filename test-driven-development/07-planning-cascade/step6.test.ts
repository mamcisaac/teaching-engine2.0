/**
 * TRUE TDD: Planning Cascade View
 * Step 6: Filtering and search
 * 
 * Discovering we need to filter the tree view
 */

import { describe, it, expect } from 'vitest';

describe('Step 6: Tree filtering capabilities', () => {
  it('should filter to show only unscheduled lessons', () => {
    // Discovering we need filtering
    interface Lesson {
      id: string;
      title: string;
      scheduled: boolean;
    }

    function filterUnscheduled(lessons: Lesson[]): Lesson[] {
      return lessons.filter(l => !l.scheduled);
    }

    const lessons: Lesson[] = [
      { id: 'l1', title: 'Lesson 1', scheduled: true },
      { id: 'l2', title: 'Lesson 2', scheduled: false },
      { id: 'l3', title: 'Lesson 3', scheduled: true },
      { id: 'l4', title: 'Lesson 4', scheduled: false }
    ];

    const unscheduled = filterUnscheduled(lessons);
    
    expect(unscheduled).toHaveLength(2);
    expect(unscheduled[0].id).toBe('l2');
    expect(unscheduled[1].id).toBe('l4');
  });

  it('should search tree by text', () => {
    interface TreeNode {
      id: string;
      title: string;
      type: string;
      children?: TreeNode[];
    }

    function searchTree(node: TreeNode, searchText: string): TreeNode[] {
      const results: TreeNode[] = [];
      const lowerSearch = searchText.toLowerCase();

      function traverse(n: TreeNode) {
        if (n.title.toLowerCase().includes(lowerSearch)) {
          results.push(n);
        }
        n.children?.forEach(traverse);
      }

      traverse(node);
      return results;
    }

    const tree: TreeNode = {
      id: 'root',
      title: 'Year Plan',
      type: 'root',
      children: [
        {
          id: 'term-1',
          title: 'Term 1',
          type: 'term',
          children: [
            {
              id: 'unit-1',
              title: 'Patterns and Numbers',
              type: 'unit',
              children: [
                { id: 'l1', title: 'AB Patterns', type: 'lesson' },
                { id: 'l2', title: 'Number Recognition', type: 'lesson' }
              ]
            },
            {
              id: 'unit-2',
              title: 'Our Senses',
              type: 'unit',
              children: [
                { id: 'l3', title: 'Five Senses', type: 'lesson' }
              ]
            }
          ]
        }
      ]
    };

    const patternResults = searchTree(tree, 'pattern');
    expect(patternResults).toHaveLength(2);
    expect(patternResults[0].title).toBe('Patterns and Numbers');
    expect(patternResults[1].title).toBe('AB Patterns');

    const senseResults = searchTree(tree, 'sense');
    expect(senseResults).toHaveLength(2);
  });

  it('should filter by expectation coverage', () => {
    interface UnitNode {
      id: string;
      title: string;
      expectations: string[];
    }

    function filterByExpectation(
      units: UnitNode[],
      targetExpectation: string
    ): UnitNode[] {
      return units.filter(unit => 
        unit.expectations.includes(targetExpectation)
      );
    }

    const units: UnitNode[] = [
      { id: 'u1', title: 'Numbers', expectations: ['MATH.1.NS.1', 'MATH.1.NS.2'] },
      { id: 'u2', title: 'Patterns', expectations: ['MATH.1.PA.1'] },
      { id: 'u3', title: 'Measurement', expectations: ['MATH.1.NS.2', 'MATH.1.ME.1'] },
      { id: 'u4', title: 'Geometry', expectations: ['MATH.1.GE.1'] }
    ];

    const unitsWithNS2 = filterByExpectation(units, 'MATH.1.NS.2');
    
    expect(unitsWithNS2).toHaveLength(2);
    expect(unitsWithNS2[0].title).toBe('Numbers');
    expect(unitsWithNS2[1].title).toBe('Measurement');
  });

  it('should combine multiple filters', () => {
    interface Lesson {
      id: string;
      title: string;
      scheduled: boolean;
      subject: string;
      expectations: string[];
    }

    interface FilterCriteria {
      onlyUnscheduled?: boolean;
      subject?: string;
      hasExpectation?: string;
    }

    function filterLessons(lessons: Lesson[], criteria: FilterCriteria): Lesson[] {
      return lessons.filter(lesson => {
        if (criteria.onlyUnscheduled && lesson.scheduled) {
          return false;
        }
        if (criteria.subject && lesson.subject !== criteria.subject) {
          return false;
        }
        if (criteria.hasExpectation && !lesson.expectations.includes(criteria.hasExpectation)) {
          return false;
        }
        return true;
      });
    }

    const lessons: Lesson[] = [
      { 
        id: 'l1', 
        title: 'Math Patterns', 
        scheduled: true, 
        subject: 'Math',
        expectations: ['MATH.1.PA.1']
      },
      { 
        id: 'l2', 
        title: 'French Reading', 
        scheduled: false, 
        subject: 'French',
        expectations: ['FR.1.R.1']
      },
      { 
        id: 'l3', 
        title: 'Math Counting', 
        scheduled: false, 
        subject: 'Math',
        expectations: ['MATH.1.NS.1']
      },
      { 
        id: 'l4', 
        title: 'Math Shapes', 
        scheduled: false, 
        subject: 'Math',
        expectations: ['MATH.1.GE.1', 'MATH.1.PA.1']
      }
    ];

    // Filter for unscheduled Math lessons with pattern expectations
    const filtered = filterLessons(lessons, {
      onlyUnscheduled: true,
      subject: 'Math',
      hasExpectation: 'MATH.1.PA.1'
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('l4');
  });
});