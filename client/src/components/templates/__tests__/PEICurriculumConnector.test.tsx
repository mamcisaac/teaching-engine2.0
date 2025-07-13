import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PEICurriculumConnector } from '../PEICurriculumConnector';

describe('PEICurriculumConnector - Component Props', () => {
  const mockOnOutcomeSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with grade and subject', () => {
      render(
        <PEICurriculumConnector 
          grade={1}
          subject="French Language Arts"
          onOutcomeSelect={mockOnOutcomeSelect}
        />
      );
      
      expect(screen.getByText('Grade 1 French Immersion Learning Outcomes')).toBeInTheDocument();
      expect(screen.getByText('PEI Curriculum Integration')).toBeInTheDocument();
    });

    it('should render with All subjects', () => {
      render(
        <PEICurriculumConnector 
          grade={1}
          subject="All"
          onOutcomeSelect={mockOnOutcomeSelect}
        />
      );
      
      expect(screen.getByText('Grade 1 French Immersion Learning Outcomes')).toBeInTheDocument();
      // Should show multiple subjects when "All" is selected
      expect(screen.getByText('French Language Arts')).toBeInTheDocument();
    });

    it('should render with specific subject filter', () => {
      render(
        <PEICurriculumConnector 
          grade={1}
          subject="Mathematics"
          onOutcomeSelect={mockOnOutcomeSelect}
        />
      );
      
      expect(screen.getByText('Grade 1 French Immersion Learning Outcomes')).toBeInTheDocument();
    });
  });

  describe('Outcome Interaction', () => {
    it('should expand curriculum strands when clicked', () => {
      render(
        <PEICurriculumConnector 
          grade={1}
          subject="French Language Arts"
          onOutcomeSelect={mockOnOutcomeSelect}
        />
      );
      
      // Click to expand French Language Arts strand
      const expandButton = screen.getByText('French Language Arts').closest('div.cursor-pointer');
      fireEvent.click(expandButton!);
      
      // Should show outcomes after expansion
      expect(screen.getByText('FLA-OC-1.1')).toBeInTheDocument();
    });

    it('should handle outcome selection', () => {
      render(
        <PEICurriculumConnector 
          grade={1}
          subject="French Language Arts"
          onOutcomeSelect={mockOnOutcomeSelect}
        />
      );
      
      // Expand the strand first
      const expandButton = screen.getByText('French Language Arts').closest('div.cursor-pointer');
      fireEvent.click(expandButton!);
      
      // Click to select outcome
      const selectButton = screen.getAllByText('Select')[0];
      fireEvent.click(selectButton);
      
      expect(mockOnOutcomeSelect).toHaveBeenCalled();
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(
        <PEICurriculumConnector 
          grade={1}
          subject="All"
          onOutcomeSelect={mockOnOutcomeSelect}
        />
      );
      
      expect(screen.getByPlaceholderText('Search outcomes...')).toBeInTheDocument();
    });

    it('should handle search input changes', () => {
      render(
        <PEICurriculumConnector 
          grade={1}
          subject="All"
          onOutcomeSelect={mockOnOutcomeSelect}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search outcomes...');
      fireEvent.change(searchInput, { target: { value: 'French' } });
      
      expect((searchInput as HTMLInputElement).value).toBe('French');
    });
  });
});