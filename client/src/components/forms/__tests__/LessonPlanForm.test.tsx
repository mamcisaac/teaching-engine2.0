/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * @file LessonPlanForm.test.tsx
 * @description Comprehensive tests for LessonPlanForm component including form validation,
 * bilingual support, ETFO three-part structure, and user interactions.
 */

import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import LessonPlanForm, { type LessonPlanFormData } from '../LessonPlanForm';
import { renderWithProviders, createMockUnitPlan } from '@/test-utils';

// Mock the RichTextEditor component
vi.mock('../../RichTextEditor', () => ({
  default: ({ value, onChange, placeholder }: unknown) => (
    <textarea
      data-testid="rich-text-editor"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

// Mock the ExpectationSelector component
vi.mock('../../planning/ExpectationSelector', () => ({
  default: ({ selectedIds, onSelectionChange }: unknown) => (
    <div data-testid="expectation-selector">
      <input
        type="checkbox"
        data-testid="expectation-1"
        onChange={(e) => {
          const newIds = e.target.checked
            ? [...selectedIds, 'exp-1']
            : selectedIds.filter((id: string) => id !== 'exp-1');
          onSelectionChange(newIds);
        }}
      />
      <label htmlFor="expectation-1">Test Expectation 1</label>
    </div>
  ),
}));

// Mock the BilingualTextInput component
vi.mock('../../BilingualTextInput', () => ({
  default: ({ value, valueFr, onChange, onChangeFr, label }: unknown) => (
    <div data-testid="bilingual-input">
      <label>{label}</label>
      <input
        data-testid={`${label}-en`}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={`${label} (English)`}
      />
      <input
        data-testid={`${label}-fr`}
        value={valueFr || ''}
        onChange={(e) => onChangeFr?.(e.target.value)}
        placeholder={`${label} (French)`}
      />
    </div>
  ),
}));

// Mock the LanguageContext
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en',
  }),
}));

// Mock data
const mockUnitPlan = createMockUnitPlan({
  id: 'unit-123',
  title: 'Test Unit Plan',
  subject: 'Mathematics',
  gradeLevel: 'Grade 3',
});

const mockUnitExpectations = [
  {
    id: 'exp-1',
    code: 'B1.1',
    description: 'demonstrate understanding of addition',
    strand: 'Number',
    subject: 'Mathematics',
    grade: 3,
  },
  {
    id: 'exp-2',
    code: 'B1.2',
    description: 'demonstrate understanding of subtraction',
    strand: 'Number',
    subject: 'Mathematics',
    grade: 3,
  },
];

describe('LessonPlanForm', () => {
  const user = userEvent.setup();
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    unitPlan: mockUnitPlan,
    unitExpectations: mockUnitExpectations,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      expect(screen.getByLabelText('Lesson Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Duration (minutes)')).toBeInTheDocument();
    });

    it('should render all tabs', () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Three-Part Lesson')).toBeInTheDocument();
      expect(screen.getByText('Materials & Grouping')).toBeInTheDocument();
      expect(screen.getByText('Differentiation')).toBeInTheDocument();
      expect(screen.getByText('Assessment')).toBeInTheDocument();
      expect(screen.getByText('Substitute Plans')).toBeInTheDocument();
    });

    it('should render unit plan selector when showUnitPlanSelector is true', () => {
      renderWithProviders(
        <LessonPlanForm
          {...defaultProps}
          showUnitPlanSelector={true}
          allUnitPlans={[mockUnitPlan]}
        />,
      );

      expect(screen.getByLabelText('Unit Plan')).toBeInTheDocument();
    });

    it('should render bilingual inputs for title and content fields', () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      expect(screen.getByTestId('bilingual-input')).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('should update lesson title', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const titleInput = screen.getByLabelText('Lesson Title');
      await user.type(titleInput, 'Introduction to Fractions');

      expect(titleInput).toHaveValue('Introduction to Fractions');
    });

    it('should update date field', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const dateInput = screen.getByLabelText('Date');
      await user.clear(dateInput);
      await user.type(dateInput, '2024-02-15');

      expect(dateInput).toHaveValue('2024-02-15');
    });

    it('should update duration field', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const durationInput = screen.getByLabelText('Duration (minutes)');
      await user.clear(durationInput);
      await user.type(durationInput, '45');

      expect(durationInput).toHaveValue('45');
    });

    it('should set default date to today', () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const dateInput = screen.getByLabelText('Date');
      const today = new Date().toISOString().split('T')[0];
      expect(dateInput).toHaveValue(today);
    });

    it('should set default duration to 60 minutes', () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const durationInput = screen.getByLabelText('Duration (minutes)');
      expect(durationInput).toHaveValue('60');
    });
  });

  describe('Three-Part Lesson Structure', () => {
    it('should render three-part lesson fields', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const threePartTab = screen.getByText('Three-Part Lesson');
      await user.click(threePartTab);

      expect(screen.getByText('Minds On')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Consolidation')).toBeInTheDocument();
    });

    it('should show ETFO guidance for each section', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const threePartTab = screen.getByText('Three-Part Lesson');
      await user.click(threePartTab);

      expect(screen.getByText(/Opening activities to engage students/)).toBeInTheDocument();
      expect(screen.getByText(/Main learning activities/)).toBeInTheDocument();
      expect(screen.getByText(/Closing activities to consolidate learning/)).toBeInTheDocument();
    });

    it('should update minds on content', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const threePartTab = screen.getByText('Three-Part Lesson');
      await user.click(threePartTab);

      const mindsOnEditor = screen.getAllByTestId('rich-text-editor')[0];
      await user.type(mindsOnEditor, 'Start with a warm-up activity');

      expect(mindsOnEditor).toHaveValue('Start with a warm-up activity');
    });
  });

  describe('Materials and Grouping', () => {
    it('should render materials section', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const materialsTab = screen.getByText('Materials & Grouping');
      await user.click(materialsTab);

      expect(screen.getByText('Materials Needed')).toBeInTheDocument();
      expect(screen.getByText('Grouping Strategy')).toBeInTheDocument();
    });

    it('should add new material item', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const materialsTab = screen.getByText('Materials & Grouping');
      await user.click(materialsTab);

      const addButton = screen.getByRole('button', { name: /add material/i });
      await user.click(addButton);

      const materialInputs = screen.getAllByPlaceholderText('Material or resource');
      expect(materialInputs).toHaveLength(2); // Should have original + new one
    });

    it('should remove material item', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const materialsTab = screen.getByText('Materials & Grouping');
      await user.click(materialsTab);

      // Add a material first
      const addButton = screen.getByRole('button', { name: /add material/i });
      await user.click(addButton);

      // Then remove it
      const removeButtons = screen.getAllByRole('button', { name: /remove material/i });
      await user.click(removeButtons[0]);

      const materialInputs = screen.getAllByPlaceholderText('Material or resource');
      expect(materialInputs).toHaveLength(1); // Back to original
    });

    it('should update grouping strategy', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const materialsTab = screen.getByText('Materials & Grouping');
      await user.click(materialsTab);

      const groupingSelect = screen.getByLabelText('Grouping Strategy');
      await user.selectOptions(groupingSelect, 'small groups');

      expect(groupingSelect).toHaveValue('small groups');
    });
  });

  describe('Differentiation', () => {
    it('should render differentiation sections', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const differentiationTab = screen.getByText('Differentiation');
      await user.click(differentiationTab);

      expect(screen.getByText('Accommodations')).toBeInTheDocument();
      expect(screen.getByText('Modifications')).toBeInTheDocument();
      expect(screen.getByText('Extensions')).toBeInTheDocument();
    });

    it('should add accommodation items', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const differentiationTab = screen.getByText('Differentiation');
      await user.click(differentiationTab);

      const addAccommodationButton = screen.getByRole('button', { name: /add accommodation/i });
      await user.click(addAccommodationButton);

      const accommodationInputs = screen.getAllByPlaceholderText(/accommodation/i);
      expect(accommodationInputs).toHaveLength(2);
    });

    it('should add modification items', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const differentiationTab = screen.getByText('Differentiation');
      await user.click(differentiationTab);

      const addModificationButton = screen.getByRole('button', { name: /add modification/i });
      await user.click(addModificationButton);

      const modificationInputs = screen.getAllByPlaceholderText(/modification/i);
      expect(modificationInputs).toHaveLength(2);
    });

    it('should add extension items', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const differentiationTab = screen.getByText('Differentiation');
      await user.click(differentiationTab);

      const addExtensionButton = screen.getByRole('button', { name: /add extension/i });
      await user.click(addExtensionButton);

      const extensionInputs = screen.getAllByPlaceholderText(/extension/i);
      expect(extensionInputs).toHaveLength(2);
    });
  });

  describe('Assessment', () => {
    it('should render assessment section', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const assessmentTab = screen.getByText('Assessment');
      await user.click(assessmentTab);

      expect(screen.getByText('Assessment Type')).toBeInTheDocument();
      expect(screen.getByText('Assessment Notes')).toBeInTheDocument();
    });

    it('should update assessment type', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const assessmentTab = screen.getByText('Assessment');
      await user.click(assessmentTab);

      const assessmentTypeSelect = screen.getByLabelText('Assessment Type');
      await user.selectOptions(assessmentTypeSelect, 'summative');

      expect(assessmentTypeSelect).toHaveValue('summative');
    });

    it('should default to formative assessment', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const assessmentTab = screen.getByText('Assessment');
      await user.click(assessmentTab);

      const assessmentTypeSelect = screen.getByLabelText('Assessment Type');
      expect(assessmentTypeSelect).toHaveValue('formative');
    });
  });

  describe('Substitute Plans', () => {
    it('should render substitute plans section', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const substitutePlansTab = screen.getByText('Substitute Plans');
      await user.click(substitutePlansTab);

      expect(screen.getByText('Substitute Teacher Friendly')).toBeInTheDocument();
      expect(screen.getByText('Special Notes for Substitute')).toBeInTheDocument();
    });

    it('should toggle substitute friendly option', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const substitutePlansTab = screen.getByText('Substitute Plans');
      await user.click(substitutePlansTab);

      const subFriendlySwitch = screen.getByRole('switch', {
        name: /substitute teacher friendly/i,
      });
      expect(subFriendlySwitch).toBeChecked(); // Should default to true

      await user.click(subFriendlySwitch);
      expect(subFriendlySwitch).not.toBeChecked();
    });

    it('should show substitute notes when sub friendly is enabled', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const substitutePlansTab = screen.getByText('Substitute Plans');
      await user.click(substitutePlansTab);

      expect(screen.getByText('Special Notes for Substitute')).toBeInTheDocument();
    });
  });

  describe('Curriculum Expectations', () => {
    it('should render expectation selector', () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      expect(screen.getByTestId('expectation-selector')).toBeInTheDocument();
    });

    it('should update selected expectations', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const expectationCheckbox = screen.getByTestId('expectation-1');
      await user.click(expectationCheckbox);

      expect(expectationCheckbox).toBeChecked();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      // Fill out required fields
      const titleInput = screen.getByLabelText('Lesson Title');
      await user.type(titleInput, 'Test Lesson');

      const submitButton = screen.getByRole('button', { name: /save lesson plan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Lesson',
            unitPlanId: 'unit-123',
            duration: 60,
          }),
        );
      });
    });

    it('should validate required fields', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /save lesson plan/i });
      await user.click(submitButton);

      // Should show validation errors for required fields
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    it('should show loading state during submission', () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} isSubmitting={true} />);

      const submitButton = screen.getByRole('button', { name: /saving/i });
      expect(submitButton).toBeDisabled();
    });

    it('should call onCancel when cancel button is clicked', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Initial Data', () => {
    it('should populate form with initial data', () => {
      const initialData: Partial<LessonPlanFormData> = {
        title: 'Existing Lesson',
        duration: 90,
        materials: ['Whiteboard', 'Worksheets'],
        assessmentType: 'summative',
      };

      renderWithProviders(<LessonPlanForm {...defaultProps} initialData={initialData} />);

      expect(screen.getByLabelText('Lesson Title')).toHaveValue('Existing Lesson');
      expect(screen.getByLabelText('Duration (minutes)')).toHaveValue('90');
    });

    it('should merge initial data with defaults', () => {
      const initialData: Partial<LessonPlanFormData> = {
        title: 'Partial Data',
      };

      renderWithProviders(<LessonPlanForm {...defaultProps} initialData={initialData} />);

      expect(screen.getByLabelText('Lesson Title')).toHaveValue('Partial Data');
      expect(screen.getByLabelText('Duration (minutes)')).toHaveValue('60'); // Default value
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      expect(screen.getByLabelText('Lesson Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Duration (minutes)')).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const titleInput = screen.getByLabelText('Lesson Title');
      titleInput.focus();
      expect(titleInput).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText('Date')).toHaveFocus();
    });

    it('should have proper tab semantics', () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(6); // Overview, Three-Part, Materials, Differentiation, Assessment, Substitute
    });

    it('should have proper error message association', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /save lesson plan/i });
      await user.click(submitButton);

      const titleInput = screen.getByLabelText('Lesson Title');
      const errorMessage = screen.getByText('Title is required');

      expect(titleInput).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(errorMessage.id || 'error'),
      );
    });
  });

  describe('Bilingual Support', () => {
    it('should render bilingual inputs for key fields', () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      expect(screen.getByTestId('bilingual-input')).toBeInTheDocument();
    });

    it('should update French content separately', async () => {
      renderWithProviders(<LessonPlanForm {...defaultProps} />);

      const frenchInput = screen.getByTestId('Lesson Title-fr');
      await user.type(frenchInput, 'Titre de la leçon');

      expect(frenchInput).toHaveValue('Titre de la leçon');
    });
  });
});
