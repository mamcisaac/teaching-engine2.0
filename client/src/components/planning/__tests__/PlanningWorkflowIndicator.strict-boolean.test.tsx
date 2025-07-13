import React from 'react';

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { ETFOLevel } from '@/hooks/useWorkflowState';
import type { LevelProgress } from '@/hooks/useWorkflowState';

import { PlanningWorkflowIndicator } from '../PlanningWorkflowIndicator';

describe('PlanningWorkflowIndicator - Strict Boolean Expressions', () => {
  const mockProgress: LevelProgress[] = [
    {
      level: ETFOLevel.CURRICULUM_EXPECTATIONS,
      title: 'Curriculum Expectations',
      description: 'Import and organize curriculum expectations',
      isComplete: false,
      isAccessible: true,
      requiredFields: ['grade', 'subject'],
    },
    {
      level: ETFOLevel.LONG_RANGE_PLANS,
      title: 'Long-Range Plans',
      description: 'Create yearly overview',
      isComplete: false,
      isAccessible: false,
      requiredFields: undefined, // Test undefined case
    },
    {
      level: ETFOLevel.UNIT_PLANS,
      title: 'Unit Plans',
      description: 'Design detailed unit plans',
      isComplete: true,
      isAccessible: true,
      requiredFields: [], // Test empty array
    },
  ];

  describe('requiredFields handling', () => {
    it('should render required fields only when array exists and has items', () => {
      render(
        <MemoryRouter>
          <PlanningWorkflowIndicator
            progress={mockProgress}
            currentLevel={ETFOLevel.CURRICULUM_EXPECTATIONS}
          />
        </MemoryRouter>
      );

      // First item has requiredFields
      const gradeField = screen.getByText('grade');
      const subjectField = screen.getByText('subject');
      expect(gradeField).toBeInTheDocument();
      expect(subjectField).toBeInTheDocument();

      // Should show "Required:" label for first item
      const requiredLabels = screen.getAllByText('Required:');
      expect(requiredLabels).toHaveLength(1); // Only one item has non-empty requiredFields
    });

    it('should not render required fields section when undefined', () => {
      render(
        <MemoryRouter>
          <PlanningWorkflowIndicator
            progress={mockProgress}
            currentLevel={ETFOLevel.LONG_RANGE_PLANS}
          />
        </MemoryRouter>
      );

      // Long-range plans has undefined requiredFields
      const longRangeSection = screen.getByText('Long-Range Plans').closest('.flex-1');
      expect(longRangeSection?.textContent).not.toContain('Required:');
    });

    it('should not render required fields section when empty array', () => {
      render(
        <MemoryRouter>
          <PlanningWorkflowIndicator
            progress={mockProgress}
            currentLevel={ETFOLevel.UNIT_PLANS}
          />
        </MemoryRouter>
      );

      // Unit plans has empty requiredFields array
      const unitPlansSection = screen.getByText('Unit Plans').closest('.flex-1');
      expect(unitPlansSection?.textContent).not.toContain('Required:');
    });

    it('should handle null requiredFields', () => {
      const progressWithNull: LevelProgress[] = [
        {
          level: ETFOLevel.LESSON_PLANS,
          title: 'Lesson Plans',
          description: 'Plan individual lessons',
          isComplete: false,
          isAccessible: true,
          requiredFields: null as any, // Test null case
        },
      ];

      render(
        <MemoryRouter>
          <PlanningWorkflowIndicator
            progress={progressWithNull}
            currentLevel={ETFOLevel.LESSON_PLANS}
          />
        </MemoryRouter>
      );

      // Should not render required fields section
      expect(screen.queryByText('Required:')).not.toBeInTheDocument();
    });
  });

  describe('step icon rendering', () => {
    it('should render correct icon based on completion and accessibility', () => {
      render(
        <MemoryRouter>
          <PlanningWorkflowIndicator
            progress={mockProgress}
            currentLevel={ETFOLevel.CURRICULUM_EXPECTATIONS}
          />
        </MemoryRouter>
      );

      // Check for different icon types
      const checkIcons = document.querySelectorAll('.lucide-check-circle2');
      const lockIcons = document.querySelectorAll('.lucide-lock');
      const circleIcons = document.querySelectorAll('.lucide-circle');

      expect(checkIcons).toHaveLength(1); // Unit plans is complete
      expect(lockIcons).toHaveLength(1); // Long-range plans is not accessible
      expect(circleIcons).toHaveLength(1); // Curriculum expectations is current
    });
  });

  describe('navigation behavior', () => {
    it('should make accessible and complete levels clickable', () => {
      render(
        <MemoryRouter>
          <PlanningWorkflowIndicator
            progress={mockProgress}
            currentLevel={ETFOLevel.CURRICULUM_EXPECTATIONS}
          />
        </MemoryRouter>
      );

      // Accessible level should be a link
      const curriculumLink = screen.getByText('Curriculum Expectations').closest('a');
      expect(curriculumLink).toBeInTheDocument();
      expect(curriculumLink).toHaveAttribute('href', '/curriculum/import');

      // Complete level should be a link
      const unitPlansLink = screen.getByText('Unit Plans').closest('a');
      expect(unitPlansLink).toBeInTheDocument();
      expect(unitPlansLink).toHaveAttribute('href', '/planner/units');

      // Inaccessible level should not be a link
      const longRangeDiv = screen.getByText('Long-Range Plans').closest('div[class*="border"]');
      expect(longRangeDiv?.tagName).toBe('DIV');
      expect(longRangeDiv?.parentElement?.tagName).not.toBe('A');
    });
  });

  describe('badge rendering', () => {
    it('should show correct badges based on step status', () => {
      render(
        <MemoryRouter>
          <PlanningWorkflowIndicator
            progress={mockProgress}
            currentLevel={ETFOLevel.CURRICULUM_EXPECTATIONS}
          />
        </MemoryRouter>
      );

      // Check badge texts
      expect(screen.getByText('Complete')).toBeInTheDocument();
      expect(screen.getByText('Available')).toBeInTheDocument();
      expect(screen.getByText('Locked')).toBeInTheDocument();
    });
  });

  describe('step styling', () => {
    it('should apply correct styles based on step status', () => {
      render(
        <MemoryRouter>
          <PlanningWorkflowIndicator
            progress={mockProgress}
            currentLevel={ETFOLevel.CURRICULUM_EXPECTATIONS}
          />
        </MemoryRouter>
      );

      // Check border colors
      const curriculumStep = screen.getByText('Curriculum Expectations').closest('[class*="border"]');
      const longRangeStep = screen.getByText('Long-Range Plans').closest('[class*="border"]');
      const unitPlansStep = screen.getByText('Unit Plans').closest('[class*="border"]');

      expect(curriculumStep).toHaveClass('border-indigo-600', 'bg-indigo-50'); // Current
      expect(longRangeStep).toHaveClass('border-gray-300', 'bg-gray-50'); // Locked
      expect(unitPlansStep).toHaveClass('border-green-600', 'bg-green-50'); // Complete
    });
  });

  describe('progress connector lines', () => {
    it('should render connector lines between steps except after last step', () => {
      const fullProgress: LevelProgress[] = [
        ...mockProgress,
        {
          level: ETFOLevel.LESSON_PLANS,
          title: 'Lesson Plans',
          description: 'Plan individual lessons',
          isComplete: false,
          isAccessible: false,
          requiredFields: [],
          progressPercentage: 0,
          completedItems: 0,
          totalItems: 0
        },
        {
          level: ETFOLevel.DAYBOOK_ENTRIES,
          title: 'Daybook',
          description: 'Track and reflect',
          isComplete: false,
          isAccessible: false,
          requiredFields: [],
          progressPercentage: 0,
          completedItems: 0,
          totalItems: 0
        },
      ];

      render(
        <MemoryRouter>
          <PlanningWorkflowIndicator
            progress={fullProgress}
            currentLevel={ETFOLevel.CURRICULUM_EXPECTATIONS}
          />
        </MemoryRouter>
      );

      // Should have 4 connector lines (5 steps - 1)
      const connectorLines = document.querySelectorAll('.absolute.left-7.top-full');
      expect(connectorLines).toHaveLength(4);
    });
  });
});