import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PEICurriculumConnector from '../PEICurriculumConnector';
import type { PEICurriculumAlignment, CurriculumOutcome } from '../../../types/peiCurriculum';

describe('PEICurriculumConnector - Strict Boolean Expressions', () => {
  const mockOnOutcomesSelect = jest.fn();

  const baseAlignment: PEICurriculumAlignment = {
    subject: 'French Language Arts',
    grade: 1,
    outcomes: [
      {
        code: 'FLA.1.1',
        description: 'Listen and respond to simple French instructions',
        indicators: ['Follow classroom routines', 'Respond to basic questions'],
        crossCurricularCompetencies: ['Communication']
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Strand Display', () => {
    it('should not display strand when null', () => {
      const alignments = [{ ...baseAlignment, strand: null }];
      render(
        <PEICurriculumConnector 
          alignments={alignments}
          onOutcomesSelect={mockOnOutcomesSelect}
        />
      );
      
      // Should show subject but not strand
      expect(screen.getByText('French Language Arts')).toBeInTheDocument();
      // Check that there's no paragraph with text-gray-600 class under the subject
      const subjectDiv = screen.getByText('French Language Arts').parentElement;
      const strandParagraph = subjectDiv?.querySelector('p.text-gray-600');
      expect(strandParagraph).not.toBeInTheDocument();
    });

    it('should not display strand when undefined', () => {
      const alignments = [{ ...baseAlignment, strand: undefined }];
      render(
        <PEICurriculumConnector 
          alignments={alignments}
          onOutcomesSelect={mockOnOutcomesSelect}
        />
      );
      
      expect(screen.getByText('French Language Arts')).toBeInTheDocument();
      const subjectDiv = screen.getByText('French Language Arts').parentElement;
      const strandParagraph = subjectDiv?.querySelector('p.text-gray-600');
      expect(strandParagraph).not.toBeInTheDocument();
    });

    it('should not display strand when empty string', () => {
      const alignments = [{ ...baseAlignment, strand: '' }];
      render(
        <PEICurriculumConnector 
          alignments={alignments}
          onOutcomesSelect={mockOnOutcomesSelect}
        />
      );
      
      expect(screen.getByText('French Language Arts')).toBeInTheDocument();
      const subjectDiv = screen.getByText('French Language Arts').parentElement;
      const strandParagraph = subjectDiv?.querySelector('p.text-gray-600');
      expect(strandParagraph).not.toBeInTheDocument();
    });

    it('should display strand when valid', () => {
      const alignments = [{ ...baseAlignment, strand: 'Oral Communication' }];
      render(
        <PEICurriculumConnector 
          alignments={alignments}
          onOutcomesSelect={mockOnOutcomesSelect}
        />
      );
      
      expect(screen.getByText('French Language Arts')).toBeInTheDocument();
      expect(screen.getByText('Oral Communication')).toBeInTheDocument();
    });
  });

  describe('Selected Outcomes', () => {
    it('should handle selected outcomes with empty array', () => {
      render(
        <PEICurriculumConnector 
          alignments={[baseAlignment]}
          selectedOutcomes={[]}
          onOutcomesSelect={mockOnOutcomesSelect}
        />
      );
      
      // Should show "No outcomes selected"
      expect(screen.getByText('No outcomes selected yet')).toBeInTheDocument();
    });

    it('should display selected outcomes', () => {
      const selectedOutcomes = [baseAlignment.outcomes[0]];
      render(
        <PEICurriculumConnector 
          alignments={[baseAlignment]}
          selectedOutcomes={selectedOutcomes}
          onOutcomesSelect={mockOnOutcomesSelect}
        />
      );
      
      // Should show the selected outcome code
      expect(screen.getByText('FLA.1.1')).toBeInTheDocument();
    });
  });

  describe('Outcome Selection', () => {
    it('should toggle outcome selection', () => {
      render(
        <PEICurriculumConnector 
          alignments={[baseAlignment]}
          onOutcomesSelect={mockOnOutcomesSelect}
        />
      );
      
      // Expand the strand
      const expandButton = screen.getByText('French Language Arts').closest('div.cursor-pointer');
      fireEvent.click(expandButton!);
      
      // Click to select outcome
      const selectButton = screen.getByText('Select');
      fireEvent.click(selectButton);
      
      expect(mockOnOutcomesSelect).toHaveBeenCalledWith([baseAlignment.outcomes[0]]);
    });
  });

  describe('Grade Display', () => {
    it('should display correct grade', () => {
      render(
        <PEICurriculumConnector 
          alignments={[baseAlignment]}
          onOutcomesSelect={mockOnOutcomesSelect}
          grade={1}
        />
      );
      
      expect(screen.getByText('PEI Grade 1 Curriculum Outcomes')).toBeInTheDocument();
    });

    it('should handle grade being undefined', () => {
      render(
        <PEICurriculumConnector 
          alignments={[baseAlignment]}
          onOutcomesSelect={mockOnOutcomesSelect}
        />
      );
      
      expect(screen.getByText('PEI Curriculum Outcomes')).toBeInTheDocument();
    });
  });

  describe('Theme Display', () => {
    it('should display theme when provided', () => {
      render(
        <PEICurriculumConnector 
          alignments={[baseAlignment]}
          onOutcomesSelect={mockOnOutcomesSelect}
          theme="Animals"
        />
      );
      
      expect(screen.getByText('Theme: Animals')).toBeInTheDocument();
    });

    it('should not display theme when undefined', () => {
      render(
        <PEICurriculumConnector 
          alignments={[baseAlignment]}
          onOutcomesSelect={mockOnOutcomesSelect}
        />
      );
      
      expect(screen.queryByText(/Theme:/)).not.toBeInTheDocument();
    });
  });
});