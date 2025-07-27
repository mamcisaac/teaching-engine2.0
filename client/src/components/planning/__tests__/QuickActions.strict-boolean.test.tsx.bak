import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { QuickActions } from '../QuickActions';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('QuickActions - Strict Boolean Expressions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isNew badge rendering', () => {
    it('should render New badge only when isNew is explicitly true', () => {
      render(
        <MemoryRouter>
          <QuickActions />
        </MemoryRouter>
      );

      // Count "New" badges - only Quick Lesson and Browse Templates have isNew: true
      const newBadges = screen.getAllByText('New');
      expect(newBadges).toHaveLength(2);

      // Verify Quick Lesson has New badge
      const quickLessonButton = screen.getByText('Quick Lesson').closest('button');
      const quickLessonNewBadge = quickLessonButton?.querySelector('.bg-red-500');
      expect(quickLessonNewBadge).toBeInTheDocument();
      expect(quickLessonNewBadge?.textContent).toBe('New');

      // Verify Browse Templates has New badge
      const templatesButton = screen.getByText('Browse Templates').closest('button');
      const templatesNewBadge = templatesButton?.querySelector('.bg-red-500');
      expect(templatesNewBadge).toBeInTheDocument();
      expect(templatesNewBadge?.textContent).toBe('New');
    });

    it('should not render New badge when isNew is undefined', () => {
      render(
        <MemoryRouter>
          <QuickActions />
        </MemoryRouter>
      );

      // Actions without isNew should not have the badge
      const importButton = screen.getByText('Import Curriculum').closest('button');
      const importNewBadge = importButton?.querySelector('.bg-red-500');
      expect(importNewBadge).not.toBeInTheDocument();

      const unitPlanButton = screen.getByText('New Unit Plan').closest('button');
      const unitPlanNewBadge = unitPlanButton?.querySelector('.bg-red-500');
      expect(unitPlanNewBadge).not.toBeInTheDocument();

      const duplicateButton = screen.getByText('Duplicate Plan').closest('button');
      const duplicateNewBadge = duplicateButton?.querySelector('.bg-red-500');
      expect(duplicateNewBadge).not.toBeInTheDocument();
    });

    it('should not render New badge when isNew is false', () => {
      // This test verifies that if isNew were false (not in current implementation),
      // the badge would not render
      render(
        <MemoryRouter>
          <QuickActions />
        </MemoryRouter>
      );

      // Count total action buttons
      const actionButtons = screen.getAllByRole('button').filter(btn => 
        btn.classList.contains('relative') && 
        btn.classList.contains('flex-col')
      );

      // Count buttons with New badges
      const buttonsWithNewBadge = actionButtons.filter(btn => 
        btn.querySelector('.bg-red-500')
      );

      // Only 2 out of 9 actions should have New badge
      expect(actionButtons).toHaveLength(9);
      expect(buttonsWithNewBadge).toHaveLength(2);
    });
  });

  describe('onDuplicatePlan callback', () => {
    it('should handle onDuplicatePlan callback when provided', async () => {
      const user = userEvent.setup();
      const onDuplicatePlan = vi.fn();

      render(
        <MemoryRouter>
          <QuickActions onDuplicatePlan={onDuplicatePlan} />
        </MemoryRouter>
      );

      const duplicateButton = screen.getByText('Duplicate Plan').closest('button');
      await user.click(duplicateButton!);

      expect(onDuplicatePlan).toHaveBeenCalledWith('select');
    });

    it('should handle undefined onDuplicatePlan gracefully', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <QuickActions />
        </MemoryRouter>
      );

      const duplicateButton = screen.getByText('Duplicate Plan').closest('button');
      
      // Should not throw error when clicking without callback
      await expect(user.click(duplicateButton!)).resolves.not.toThrow();
    });
  });

  describe('action navigation', () => {
    it('should navigate to correct routes for each action', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <QuickActions />
        </MemoryRouter>
      );

      // Test Import Curriculum navigation
      const importButton = screen.getByText('Import Curriculum').closest('button');
      await user.click(importButton!);
      expect(mockNavigate).toHaveBeenCalledWith('/curriculum/import');

      // Test New Unit Plan navigation
      const unitPlanButton = screen.getByText('New Unit Plan').closest('button');
      await user.click(unitPlanButton!);
      expect(mockNavigate).toHaveBeenCalledWith('/planner/units');

      // Test Quick Lesson navigation
      const quickLessonButton = screen.getByText('Quick Lesson').closest('button');
      await user.click(quickLessonButton!);
      expect(mockNavigate).toHaveBeenCalledWith('/planner/quick-lesson');
    });
  });

  describe('batch actions', () => {
    it('should render all batch action buttons', () => {
      render(
        <MemoryRouter>
          <QuickActions />
        </MemoryRouter>
      );

      expect(screen.getByText('Export Plans')).toBeInTheDocument();
      expect(screen.getByText('Share with Team')).toBeInTheDocument();
      expect(screen.getByText('Print Plans')).toBeInTheDocument();
    });

    it('should navigate to correct routes for batch actions', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <QuickActions />
        </MemoryRouter>
      );

      // Test Export navigation
      const exportButton = screen.getByRole('button', { name: /export plans/i });
      await user.click(exportButton);
      expect(mockNavigate).toHaveBeenCalledWith('/planner/export');

      // Test Share navigation  
      const shareButton = screen.getByRole('button', { name: /share with team/i });
      await user.click(shareButton);
      expect(mockNavigate).toHaveBeenCalledWith('/planner/share');

      // Test Print navigation
      const printButton = screen.getByRole('button', { name: /print plans/i });
      await user.click(printButton);
      expect(mockNavigate).toHaveBeenCalledWith('/planner/print');
    });
  });

  describe('action card rendering', () => {
    it('should render all quick action cards with correct structure', () => {
      render(
        <MemoryRouter>
          <QuickActions />
        </MemoryRouter>
      );

      // Check that all actions are rendered
      const expectedActions = [
        'Import Curriculum',
        'New Unit Plan',
        'Quick Lesson',
        'Unit Lesson',
        'Duplicate Plan',
        'Weekly Planner',
        'Browse Templates',
        'AI Assistant',
        'Parent Newsletter'
      ];

      expectedActions.forEach(action => {
        expect(screen.getByText(action)).toBeInTheDocument();
      });
    });

    it('should render action descriptions', () => {
      render(
        <MemoryRouter>
          <QuickActions />
        </MemoryRouter>
      );

      expect(screen.getByText('Upload PDF/DOCX files')).toBeInTheDocument();
      expect(screen.getByText('Start from scratch or template')).toBeInTheDocument();
      expect(screen.getByText('Standalone lesson plan')).toBeInTheDocument();
    });
  });
});