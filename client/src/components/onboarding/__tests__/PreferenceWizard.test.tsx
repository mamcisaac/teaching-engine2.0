import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PreferenceWizard } from '../PreferenceWizard';
import { vi } from 'vitest';

describe('PreferenceWizard', () => {
  const mockOnComplete = vi.fn();
  const mockOnSkip = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Component rendering', () => {
    it('should render all sections', () => {
      render(<PreferenceWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      
      expect(screen.getByText('Customize Your Experience')).toBeTruthy();
      expect(screen.getByText('What grade do you teach?')).toBeTruthy();
      expect(screen.getByText('Which subjects do you teach?')).toBeTruthy();
      expect(screen.getByText('How detailed do you like your lesson plans?')).toBeTruthy();
      expect(screen.getByText('How much AI assistance would you like?')).toBeTruthy();
      expect(screen.getByText('Notification Preferences')).toBeTruthy();
      expect(screen.getByText('Interface Theme')).toBeTruthy();
    });
  });

  describe('Skip button', () => {
    it('should call onSkip when Skip for Now is clicked', () => {
      render(<PreferenceWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      
      const skipButton = screen.getByText('Skip for Now');
      fireEvent.click(skipButton);
      
      expect(mockOnSkip).toHaveBeenCalledTimes(1);
    });
  });

  describe('Save button validation', () => {
    it('should be disabled when grade is not selected', () => {
      render(<PreferenceWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      
      const saveButton = screen.getByText('Save Preferences');
      expect(saveButton).toHaveProperty('disabled', true);
    });

    it('should be disabled when grade is empty string', () => {
      render(<PreferenceWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      
      const saveButton = screen.getByText('Save Preferences');
      
      // The initial state has grade as empty string
      expect(saveButton).toHaveProperty('disabled', true);
    });

    it('should be disabled when no subjects are selected', () => {
      render(<PreferenceWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      
      // Select a grade
      const gradeSelect = screen.getByText('Select your grade');
      fireEvent.click(gradeSelect);
      fireEvent.click(screen.getByText('Grade 1'));
      
      // But don't select any subjects
      const saveButton = screen.getByText('Save Preferences');
      expect(saveButton).toHaveProperty('disabled', true);
    });

    it('should be enabled when grade is selected and at least one subject is checked', () => {
      render(<PreferenceWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      
      // Select a grade
      const gradeSelect = screen.getByText('Select your grade');
      fireEvent.click(gradeSelect);
      fireEvent.click(screen.getByText('Grade 1'));
      
      // Select a subject
      const mathCheckbox = screen.getByLabelText('Mathematics');
      fireEvent.click(mathCheckbox);
      
      const saveButton = screen.getByText('Save Preferences');
      expect(saveButton).toHaveProperty('disabled', false);
    });
  });

  describe('Form interactions', () => {
    it('should update preferences when grade is selected', () => {
      render(<PreferenceWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      
      const gradeSelect = screen.getByText('Select your grade');
      fireEvent.click(gradeSelect);
      fireEvent.click(screen.getByText('Grade 3'));
      
      // Should show selected value
      expect(screen.getByText('Grade 3')).toBeTruthy();
    });

    it('should update preferences when subjects are selected', () => {
      render(<PreferenceWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      
      const mathCheckbox = screen.getByLabelText('Mathematics');
      const scienceCheckbox = screen.getByLabelText('Science');
      
      fireEvent.click(mathCheckbox);
      fireEvent.click(scienceCheckbox);
      
      expect(mathCheckbox).toHaveProperty('checked', true);
      expect(scienceCheckbox).toHaveProperty('checked', true);
    });

    it('should allow unchecking subjects', () => {
      render(<PreferenceWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      
      const mathCheckbox = screen.getByLabelText('Mathematics');
      
      // Check
      fireEvent.click(mathCheckbox);
      expect(mathCheckbox).toHaveProperty('checked', true);
      
      // Uncheck
      fireEvent.click(mathCheckbox);
      expect(mathCheckbox).toHaveProperty('checked', false);
    });

    it('should update planning style preference', () => {
      render(<PreferenceWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      
      const briefRadio = screen.getByLabelText('Brief - Key points and activities only');
      fireEvent.click(briefRadio);
      
      expect(briefRadio).toHaveProperty('checked', true);
    });

    it('should update AI assistance level', () => {
      render(<PreferenceWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      
      const highRadio = screen.getByLabelText('High - Proactive suggestions and automated planning');
      fireEvent.click(highRadio);
      
      expect(highRadio).toHaveProperty('checked', true);
    });

    it('should update notification preferences', () => {
      render(<PreferenceWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      
      const curriculumCheckbox = screen.getByLabelText('Curriculum updates and new features');
      
      expect(curriculumCheckbox).toHaveProperty('checked', false);
      
      fireEvent.click(curriculumCheckbox);
      expect(curriculumCheckbox).toHaveProperty('checked', true);
    });

    it('should update theme preference', () => {
      render(<PreferenceWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      
      const themeSelect = screen.getAllByRole('combobox')[1]; // Second select is theme
      fireEvent.click(themeSelect);
      fireEvent.click(screen.getByText('Dark Theme'));
      
      expect(screen.getByText('Dark Theme')).toBeTruthy();
    });
  });

  describe('Save preferences', () => {
    it('should save preferences to localStorage and call onComplete', () => {
      render(<PreferenceWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      
      // Select a grade
      const gradeSelect = screen.getByText('Select your grade');
      fireEvent.click(gradeSelect);
      fireEvent.click(screen.getByText('Grade 2'));
      
      // Select subjects
      fireEvent.click(screen.getByLabelText('Mathematics'));
      fireEvent.click(screen.getByLabelText('Language Arts'));
      
      // Save
      const saveButton = screen.getByText('Save Preferences');
      fireEvent.click(saveButton);
      
      // Check localStorage
      const savedData = JSON.parse(localStorage.getItem('teacher-preferences') || '{}');
      expect(savedData.grade).toBe('Grade 2');
      expect(savedData.subjects).toContain('Mathematics');
      expect(savedData.subjects).toContain('Language Arts');
      
      // Check callback
      expect(mockOnComplete).toHaveBeenCalledWith(expect.objectContaining({
        grade: 'Grade 2',
        subjects: expect.arrayContaining(['Mathematics', 'Language Arts']),
        planningStyle: 'detailed',
        aiAssistanceLevel: 'moderate',
        theme: 'light',
        notifications: {
          deadlineReminders: true,
          weeklyDigest: true,
          curriculumUpdates: false,
        },
      }));
    });
  });
});