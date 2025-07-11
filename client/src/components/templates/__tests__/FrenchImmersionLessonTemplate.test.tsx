import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FrenchImmersionLessonTemplate from '../FrenchImmersionLessonTemplate';
import type { FrenchImmersionLessonContent } from '../../../types/frenchImmersion';

describe('FrenchImmersionLessonTemplate - Strict Boolean Expressions', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Metadata Theme Display', () => {
    it('should display default text when theme is null', () => {
      const metadata = { grade: 1, subject: 'French', theme: null as any };
      render(
        <FrenchImmersionLessonTemplate 
          onSave={mockOnSave} 
          metadata={metadata}
        />
      );
      
      expect(screen.getByText('Structured bilingual learning template')).toBeInTheDocument();
    });

    it('should display default text when theme is undefined', () => {
      const metadata = { grade: 1, subject: 'French', theme: undefined };
      render(
        <FrenchImmersionLessonTemplate 
          onSave={mockOnSave} 
          metadata={metadata}
        />
      );
      
      expect(screen.getByText('Structured bilingual learning template')).toBeInTheDocument();
    });

    it('should display default text when theme is empty string', () => {
      const metadata = { grade: 1, subject: 'French', theme: '' };
      render(
        <FrenchImmersionLessonTemplate 
          onSave={mockOnSave} 
          metadata={metadata}
        />
      );
      
      expect(screen.getByText('Structured bilingual learning template')).toBeInTheDocument();
    });

    it('should display theme when valid', () => {
      const metadata = { grade: 1, subject: 'French', theme: 'Animals' };
      render(
        <FrenchImmersionLessonTemplate 
          onSave={mockOnSave} 
          metadata={metadata}
        />
      );
      
      expect(screen.getByText('Theme: Animals')).toBeInTheDocument();
    });
  });

  describe('Vocabulary Fields', () => {
    it('should handle vocabulary with null pronunciation', async () => {
      const initialData: Partial<FrenchImmersionLessonContent> = {
        languageFocus: {
          targetVocabulary: [
            { english: 'cat', french: 'chat', pronunciation: null as any, context: 'animal' }
          ],
          sentenceStructures: [],
          grammarPoints: [],
          pronunciationFocus: [],
        }
      };
      
      render(
        <FrenchImmersionLessonTemplate 
          initialData={initialData}
          onSave={mockOnSave} 
        />
      );
      
      const pronunciationInput = screen.getByDisplayValue('');
      expect(pronunciationInput).toBeInTheDocument();
    });

    it('should handle vocabulary with undefined pronunciation', async () => {
      const initialData: Partial<FrenchImmersionLessonContent> = {
        languageFocus: {
          targetVocabulary: [
            { english: 'cat', french: 'chat', pronunciation: undefined, context: 'animal' }
          ],
          sentenceStructures: [],
          grammarPoints: [],
          pronunciationFocus: [],
        }
      };
      
      render(
        <FrenchImmersionLessonTemplate 
          initialData={initialData}
          onSave={mockOnSave} 
        />
      );
      
      const inputs = screen.getAllByPlaceholderText('Pronunciation');
      expect(inputs[0]).toHaveValue('');
    });

    it('should handle vocabulary with valid pronunciation', async () => {
      const initialData: Partial<FrenchImmersionLessonContent> = {
        languageFocus: {
          targetVocabulary: [
            { english: 'cat', french: 'chat', pronunciation: 'sha', context: 'animal' }
          ],
          sentenceStructures: [],
          grammarPoints: [],
          pronunciationFocus: [],
        }
      };
      
      render(
        <FrenchImmersionLessonTemplate 
          initialData={initialData}
          onSave={mockOnSave} 
        />
      );
      
      expect(screen.getByDisplayValue('sha')).toBeInTheDocument();
    });

    it('should handle vocabulary with null context', async () => {
      const initialData: Partial<FrenchImmersionLessonContent> = {
        languageFocus: {
          targetVocabulary: [
            { english: 'cat', french: 'chat', pronunciation: 'sha', context: null as any }
          ],
          sentenceStructures: [],
          grammarPoints: [],
          pronunciationFocus: [],
        }
      };
      
      render(
        <FrenchImmersionLessonTemplate 
          initialData={initialData}
          onSave={mockOnSave} 
        />
      );
      
      const contextInputs = screen.getAllByPlaceholderText('Context/Visual');
      expect(contextInputs[0]).toHaveValue('');
    });

    it('should handle vocabulary with empty string context', async () => {
      const initialData: Partial<FrenchImmersionLessonContent> = {
        languageFocus: {
          targetVocabulary: [
            { english: 'cat', french: 'chat', pronunciation: 'sha', context: '' }
          ],
          sentenceStructures: [],
          grammarPoints: [],
          pronunciationFocus: [],
        }
      };
      
      render(
        <FrenchImmersionLessonTemplate 
          initialData={initialData}
          onSave={mockOnSave} 
        />
      );
      
      const contextInputs = screen.getAllByPlaceholderText('Context/Visual');
      expect(contextInputs[0]).toHaveValue('');
    });
  });

  describe('Cancel Button', () => {
    it('should not render cancel button when onCancel is undefined', () => {
      render(
        <FrenchImmersionLessonTemplate 
          onSave={mockOnSave} 
        />
      );
      
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('should render cancel button when onCancel is provided', () => {
      render(
        <FrenchImmersionLessonTemplate 
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(
        <FrenchImmersionLessonTemplate 
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );
      
      fireEvent.click(screen.getByText('Cancel'));
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with vocabulary data', async () => {
      const user = userEvent.setup();
      
      render(
        <FrenchImmersionLessonTemplate 
          onSave={mockOnSave} 
        />
      );
      
      // Add vocabulary
      const addVocabButton = screen.getByText('+ Add Vocabulary Word');
      await user.click(addVocabButton);
      
      // Fill in vocabulary
      const englishInput = screen.getByPlaceholderText('English word');
      const frenchInput = screen.getByPlaceholderText('Mot français');
      
      await user.type(englishInput, 'dog');
      await user.type(frenchInput, 'chien');
      
      // Submit form
      const submitButton = screen.getByText('Save Lesson Plan');
      await user.click(submitButton);
      
      // Wait for form submission
      await screen.findByText('Save Lesson Plan');
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          languageFocus: expect.objectContaining({
            targetVocabulary: [
              expect.objectContaining({
                english: 'dog',
                french: 'chien',
              })
            ]
          })
        })
      );
    });
  });

  describe('Grade Display', () => {
    it('should display Grade 1 when metadata grade is 1', () => {
      const metadata = { grade: 1, subject: 'French' };
      render(
        <FrenchImmersionLessonTemplate 
          onSave={mockOnSave} 
          metadata={metadata}
        />
      );
      
      expect(screen.getByText(/Tip for Grade 1 French Immersion:/)).toBeInTheDocument();
    });

    it('should display Primary when metadata grade is not 1', () => {
      const metadata = { grade: 2, subject: 'French' };
      render(
        <FrenchImmersionLessonTemplate 
          onSave={mockOnSave} 
          metadata={metadata}
        />
      );
      
      expect(screen.getByText(/Tip for Primary French Immersion:/)).toBeInTheDocument();
    });

    it('should display Primary when metadata is undefined', () => {
      render(
        <FrenchImmersionLessonTemplate 
          onSave={mockOnSave} 
        />
      );
      
      expect(screen.getByText(/Tip for Primary French Immersion:/)).toBeInTheDocument();
    });
  });
});