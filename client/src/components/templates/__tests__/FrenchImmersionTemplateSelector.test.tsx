import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FrenchImmersionTemplateSelector from '../FrenchImmersionTemplateSelector';
import type { PlanTemplate } from '../../../types/template';

// Mock the template data
jest.mock('../../../data/templates/french-immersion/grade1-templates', () => ({
  getAllGrade1FITemplates: () => ({
    lessonTemplates: [
      {
        id: '1',
        title: 'Les couleurs',
        titleFr: 'The Colors',
        type: 'LESSON_PLAN',
        tags: ['colors', 'art-integration'],
        description: 'Learn basic colors in French',
        content: {
          culturalConnections: { francophoneCulture: ['French art'] },
        },
        estimatedMinutes: 45,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdById: 'user1',
        isSystem: true,
        isPublic: true,
        visibility: 'PUBLIC',
        usageCount: 0,
        fiMetadata: {
          timeOfYear: 'September',
          frenchProficiencyLevel: 'Beginner'
        }
      },
      {
        id: '2',
        title: 'Numbers 1-10',
        titleFr: null,
        type: 'LESSON_PLAN',
        tags: ['numbers', 'guided'],
        description: 'structured lesson for numbers',
        content: {
          assessmentNotes: 'Observe counting ability',
          parentCommunication: { englishMessage: 'Practice at home' }
        },
        estimatedMinutes: 30,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdById: 'user1',
        isSystem: true,
        isPublic: true,
        visibility: 'PUBLIC',
        usageCount: 0,
      }
    ],
    unitTemplates: [
      {
        id: '3',
        title: 'Ma famille',
        titleFr: '',
        type: 'UNIT_PLAN',
        tags: ['family', 'cultural'],
        description: null,
        content: {
          assessments: [{ type: 'formative', description: 'Daily check' }],
        },
        estimatedWeeks: 2,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdById: 'user1',
        isSystem: true,
        isPublic: true,
        visibility: 'PUBLIC',
        usageCount: 0,
        fiMetadata: {
          timeOfYear: 'October'
        }
      }
    ]
  })
}));

describe('FrenchImmersionTemplateSelector - Strict Boolean Expressions', () => {
  const mockOnTemplateSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Search Functionality', () => {
    it('should handle search with titleFr being null', () => {
      render(<FrenchImmersionTemplateSelector onTemplateSelect={mockOnTemplateSelect} />);
      
      const searchInput = screen.getByPlaceholderText('Search templates...');
      fireEvent.change(searchInput, { target: { value: 'colors' } });
      
      // Should find the template with matching title even though one has null titleFr
      expect(screen.getByText('Les couleurs')).toBeInTheDocument();
    });

    it('should handle search with titleFr being undefined', () => {
      render(<FrenchImmersionTemplateSelector onTemplateSelect={mockOnTemplateSelect} />);
      
      const searchInput = screen.getByPlaceholderText('Search templates...');
      fireEvent.change(searchInput, { target: { value: 'numbers' } });
      
      // Should find the Numbers template which has null titleFr
      expect(screen.getByText('Numbers 1-10')).toBeInTheDocument();
    });

    it('should handle search with titleFr being empty string', () => {
      render(<FrenchImmersionTemplateSelector onTemplateSelect={mockOnTemplateSelect} />);
      
      const searchInput = screen.getByPlaceholderText('Search templates...');
      fireEvent.change(searchInput, { target: { value: 'famille' } });
      
      // Should find Ma famille which has empty string titleFr
      expect(screen.getByText('Ma famille')).toBeInTheDocument();
    });
  });

  describe('Persona Filtering', () => {
    it('should handle templates without culturalConnections for jean-luc persona', () => {
      render(<FrenchImmersionTemplateSelector onTemplateSelect={mockOnTemplateSelect} />);
      
      // Select Jean-Luc persona
      const jeanLucButton = screen.getByText(/Jean-Luc/);
      fireEvent.click(jeanLucButton);
      
      // Should show template with culturalConnections
      expect(screen.getByText('Les couleurs')).toBeInTheDocument();
      // Should not show templates without culturalConnections or matching tags
      expect(screen.queryByText('Numbers 1-10')).not.toBeInTheDocument();
    });

    it('should handle templates without assessments for sophie persona', () => {
      render(<FrenchImmersionTemplateSelector onTemplateSelect={mockOnTemplateSelect} />);
      
      // Select Sophie persona
      const sophieButton = screen.getByText(/Sophie/);
      fireEvent.click(sophieButton);
      
      // Should show templates with assessments or assessmentNotes
      expect(screen.getByText('Numbers 1-10')).toBeInTheDocument();
      expect(screen.getByText('Ma famille')).toBeInTheDocument();
    });

    it('should handle templates with null description for marie-claire persona', () => {
      render(<FrenchImmersionTemplateSelector onTemplateSelect={mockOnTemplateSelect} />);
      
      // Select Marie-Claire persona
      const marieButton = screen.getByText(/Marie-Claire/);
      fireEvent.click(marieButton);
      
      // Should show template with parentCommunication
      expect(screen.getByText('Numbers 1-10')).toBeInTheDocument();
      // Should not show template with null description and no parent communication
      expect(screen.queryByText('Ma famille')).not.toBeInTheDocument();
    });

    it('should check for structured in description when not null', () => {
      render(<FrenchImmersionTemplateSelector onTemplateSelect={mockOnTemplateSelect} />);
      
      // Select Marie-Claire persona
      const marieButton = screen.getByText(/Marie-Claire/);
      fireEvent.click(marieButton);
      
      // Numbers template has "structured" in description
      expect(screen.getByText('Numbers 1-10')).toBeInTheDocument();
    });
  });

  describe('Template Display', () => {
    it('should not display titleFr when null', () => {
      render(<FrenchImmersionTemplateSelector onTemplateSelect={mockOnTemplateSelect} />);
      
      // Numbers template has null titleFr
      expect(screen.getByText('Numbers 1-10')).toBeInTheDocument();
      // Should not show any italic text for this template
      const numbersCard = screen.getByText('Numbers 1-10').closest('.overflow-hidden');
      expect(numbersCard?.querySelector('.italic')).not.toBeInTheDocument();
    });

    it('should not display titleFr when empty string', () => {
      render(<FrenchImmersionTemplateSelector onTemplateSelect={mockOnTemplateSelect} />);
      
      // Ma famille template has empty string titleFr
      expect(screen.getByText('Ma famille')).toBeInTheDocument();
      const familleCard = screen.getByText('Ma famille').closest('.overflow-hidden');
      expect(familleCard?.querySelector('.italic')).not.toBeInTheDocument();
    });

    it('should display titleFr when present', () => {
      render(<FrenchImmersionTemplateSelector onTemplateSelect={mockOnTemplateSelect} />);
      
      // Les couleurs template has titleFr
      expect(screen.getByText('The Colors')).toBeInTheDocument();
    });
  });

  describe('Time of Year Filter', () => {
    it('should filter by time of year when metadata exists', () => {
      render(<FrenchImmersionTemplateSelector onTemplateSelect={mockOnTemplateSelect} />);
      
      const timeSelect = screen.getByDisplayValue('All Months');
      fireEvent.change(timeSelect, { target: { value: 'September' } });
      
      // Should show only September template
      expect(screen.getByText('Les couleurs')).toBeInTheDocument();
      expect(screen.queryByText('Ma famille')).not.toBeInTheDocument();
      expect(screen.queryByText('Numbers 1-10')).not.toBeInTheDocument();
    });

    it('should handle templates without fiMetadata', () => {
      render(<FrenchImmersionTemplateSelector onTemplateSelect={mockOnTemplateSelect} />);
      
      const timeSelect = screen.getByDisplayValue('All Months');
      fireEvent.change(timeSelect, { target: { value: 'October' } });
      
      // Should show only October template
      expect(screen.getByText('Ma famille')).toBeInTheDocument();
      expect(screen.queryByText('Les couleurs')).not.toBeInTheDocument();
      expect(screen.queryByText('Numbers 1-10')).not.toBeInTheDocument();
    });
  });

  describe('Content Property Checks', () => {
    it('should properly check for culturalConnections existence', () => {
      render(<FrenchImmersionTemplateSelector onTemplateSelect={mockOnTemplateSelect} />);
      
      // Select Jean-Luc persona to test culturalConnections check
      const jeanLucButton = screen.getByText(/Jean-Luc/);
      fireEvent.click(jeanLucButton);
      
      // Should show template with culturalConnections
      expect(screen.getByText('Les couleurs')).toBeInTheDocument();
    });

    it('should properly check for assessments existence', () => {
      render(<FrenchImmersionTemplateSelector onTemplateSelect={mockOnTemplateSelect} />);
      
      // Select Sophie persona to test assessments check
      const sophieButton = screen.getByText(/Sophie/);
      fireEvent.click(sophieButton);
      
      // Should show templates with assessments
      expect(screen.getByText('Ma famille')).toBeInTheDocument();
    });

    it('should properly check for parentCommunication existence', () => {
      render(<FrenchImmersionTemplateSelector onTemplateSelect={mockOnTemplateSelect} />);
      
      // Select Marie-Claire persona to test parentCommunication check
      const marieButton = screen.getByText(/Marie-Claire/);
      fireEvent.click(marieButton);
      
      // Should show template with parentCommunication
      expect(screen.getByText('Numbers 1-10')).toBeInTheDocument();
    });
  });
});