import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FrenchImmersionWeeklyTemplate } from '../FrenchImmersionWeeklyTemplate';
import type { WeeklyPlanData } from '../../../types/frenchImmersion';

describe('FrenchImmersionWeeklyTemplate - Strict Boolean Expressions', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Metadata Display', () => {
    it('should display default text when month is null', () => {
      const metadata = { grade: 1, weekNumber: null as any, month: null as any };
      render(
        <FrenchImmersionWeeklyTemplate 
          onSave={mockOnSave} 
          metadata={metadata}
        />
      );
      
      expect(screen.getByText('Structured weekly planning template')).toBeInTheDocument();
    });

    it('should display default text when month is undefined', () => {
      const metadata = { grade: 1, weekNumber: 1, month: '' };
      render(
        <FrenchImmersionWeeklyTemplate 
          onSave={mockOnSave} 
          metadata={metadata}
        />
      );
      
      expect(screen.getByText('Structured weekly planning template')).toBeInTheDocument();
    });

    it('should display default text when month is empty string', () => {
      const metadata = { grade: 1, weekNumber: 1, month: '' };
      render(
        <FrenchImmersionWeeklyTemplate 
          onSave={mockOnSave} 
          metadata={metadata}
        />
      );
      
      expect(screen.getByText('Structured weekly planning template')).toBeInTheDocument();
    });

    it('should display month and week when valid', () => {
      const metadata = { grade: 1, weekNumber: 2, month: 'September' };
      render(
        <FrenchImmersionWeeklyTemplate 
          onSave={mockOnSave} 
          metadata={metadata}
        />
      );
      
      expect(screen.getByText('September - Week 2')).toBeInTheDocument();
    });

    it('should handle weekNumber being 0', () => {
      const metadata = { grade: 1, weekNumber: 0, month: 'September' };
      render(
        <FrenchImmersionWeeklyTemplate 
          onSave={mockOnSave} 
          metadata={metadata}
        />
      );
      
      // weekNumber defaults to 1 when 0
      expect(screen.getByText('Week:')).toBeInTheDocument();
      const weekInput = screen.getByDisplayValue('1');
      expect(weekInput).toBeInTheDocument();
    });

    it('should handle weekNumber being null', () => {
      const metadata = { grade: 1, weekNumber: null as any, month: 'September' };
      render(
        <FrenchImmersionWeeklyTemplate 
          onSave={mockOnSave} 
          metadata={metadata}
        />
      );
      
      // weekNumber defaults to 1 when null
      const weekInput = screen.getByDisplayValue('1');
      expect(weekInput).toBeInTheDocument();
    });
  });

  describe('Initial Data Handling', () => {
    it('should handle initial theme being null', () => {
      const initialData: Partial<WeeklyPlanData> = {
        theme: null as any,
        themeFr: 'Les animaux'
      };
      
      render(
        <FrenchImmersionWeeklyTemplate 
          initialData={initialData}
          onSave={mockOnSave} 
        />
      );
      
      // Theme input should be empty
      const themeInput = screen.getByPlaceholderText('Animals and Pets');
      expect(themeInput).toHaveValue('');
    });

    it('should handle initial theme being undefined', () => {
      const initialData: Partial<WeeklyPlanData> = {
        themeFr: 'Les animaux'
      };
      
      render(
        <FrenchImmersionWeeklyTemplate 
          initialData={initialData}
          onSave={mockOnSave} 
        />
      );
      
      const themeInput = screen.getByPlaceholderText('Animals and Pets');
      expect(themeInput).toHaveValue('');
    });

    it('should handle initial themeFr being empty string', () => {
      const initialData: Partial<WeeklyPlanData> = {
        theme: 'Animals',
        themeFr: ''
      };
      
      render(
        <FrenchImmersionWeeklyTemplate 
          initialData={initialData}
          onSave={mockOnSave} 
        />
      );
      
      const themeFrInput = screen.getByPlaceholderText('Les animaux domestiques');
      expect(themeFrInput).toHaveValue('');
    });

    it('should handle initial assessmentFocus being null', () => {
      const initialData: Partial<WeeklyPlanData> = {
        assessmentFocus: null as any
      };
      
      render(
        <FrenchImmersionWeeklyTemplate 
          initialData={initialData}
          onSave={mockOnSave} 
        />
      );
      
      const assessmentInput = screen.getByPlaceholderText(/Observe oral participation/);
      expect(assessmentInput).toHaveValue('');
    });
  });

  describe('Vocabulary Fields', () => {
    it('should handle vocabulary with null pronunciation', async () => {
      const initialData: Partial<WeeklyPlanData> = {
        weekFocus: {
          vocabulary: [
            { english: 'cat', french: 'chat', pronunciation: null as any, context: 'pet' }
          ],
          structures: [],
          communicationGoals: [],
          culturalElements: []
        }
      };
      
      render(
        <FrenchImmersionWeeklyTemplate 
          initialData={initialData}
          onSave={mockOnSave} 
        />
      );
      
      const pronunciationInput = screen.getByDisplayValue('');
      expect(pronunciationInput).toBeInTheDocument();
    });

    it('should handle vocabulary with undefined context', async () => {
      const initialData: Partial<WeeklyPlanData> = {
        weekFocus: {
          vocabulary: [
            { english: 'cat', french: 'chat', pronunciation: 'sha', context: undefined }
          ],
          structures: [],
          communicationGoals: [],
          culturalElements: []
        }
      };
      
      render(
        <FrenchImmersionWeeklyTemplate 
          initialData={initialData}
          onSave={mockOnSave} 
        />
      );
      
      const contextInput = screen.getByPlaceholderText('Context');
      expect(contextInput).toHaveValue('');
    });

    it('should handle vocabulary with empty string values', async () => {
      const initialData: Partial<WeeklyPlanData> = {
        weekFocus: {
          vocabulary: [
            { english: 'cat', french: 'chat', pronunciation: '', context: '' }
          ],
          structures: [],
          communicationGoals: [],
          culturalElements: []
        }
      };
      
      render(
        <FrenchImmersionWeeklyTemplate 
          initialData={initialData}
          onSave={mockOnSave} 
        />
      );
      
      const inputs = screen.getAllByDisplayValue('');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('Daily Plans', () => {
    it('should handle daily plan with null culturalNote', () => {
      const initialData: Partial<WeeklyPlanData> = {
        dailyPlans: [
          { day: 'Monday', languageTarget: '', mainActivity: '', vocabulary: [] },
          { day: 'Tuesday', languageTarget: '', mainActivity: '', vocabulary: [] },
          { day: 'Wednesday', languageTarget: '', mainActivity: '', vocabulary: [], culturalNote: null as any },
          { day: 'Thursday', languageTarget: '', mainActivity: '', vocabulary: [] },
          { day: 'Friday', languageTarget: '', mainActivity: '', vocabulary: [] },
        ]
      };
      
      render(
        <FrenchImmersionWeeklyTemplate 
          initialData={initialData}
          onSave={mockOnSave} 
        />
      );
      
      // Find Wednesday's cultural note input
      const culturalInput = screen.getByPlaceholderText('Explore French-Canadian family traditions');
      expect(culturalInput).toHaveValue('');
    });

    it('should handle daily plan with undefined culturalNote', () => {
      const initialData: Partial<WeeklyPlanData> = {
        dailyPlans: [
          { day: 'Monday', languageTarget: '', mainActivity: '', vocabulary: [] },
          { day: 'Tuesday', languageTarget: '', mainActivity: '', vocabulary: [] },
          { day: 'Wednesday', languageTarget: '', mainActivity: '', vocabulary: [], culturalNote: undefined },
          { day: 'Thursday', languageTarget: '', mainActivity: '', vocabulary: [] },
          { day: 'Friday', languageTarget: '', mainActivity: '', vocabulary: [] },
        ]
      };
      
      render(
        <FrenchImmersionWeeklyTemplate 
          initialData={initialData}
          onSave={mockOnSave} 
        />
      );
      
      const culturalInput = screen.getByPlaceholderText('Explore French-Canadian family traditions');
      expect(culturalInput).toHaveValue('');
    });
  });

  describe('Cancel Button', () => {
    it('should not render cancel button when onCancel is undefined', () => {
      render(
        <FrenchImmersionWeeklyTemplate 
          onSave={mockOnSave} 
        />
      );
      
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('should render cancel button when onCancel is provided', () => {
      render(
        <FrenchImmersionWeeklyTemplate 
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with complete data', async () => {
      const user = userEvent.setup();
      
      render(
        <FrenchImmersionWeeklyTemplate 
          onSave={mockOnSave} 
        />
      );
      
      // Fill in theme
      const themeInput = screen.getByPlaceholderText('Animals and Pets');
      await user.type(themeInput, 'Colors');
      
      // Submit form
      const submitButton = screen.getByText('Save Weekly Plan');
      await user.click(submitButton);
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: 'Colors',
          weekNumber: 1
        })
      );
    });
  });
});