import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import TemplatePreviewModal from '../TemplatePreviewModal';
import type { PlanTemplate, UnitPlanContent, LessonPlanContent } from '../../../types/template';

describe('TemplatePreviewModal - Strict Boolean Expressions', () => {
  const mockOnClose = vi.fn();
  const mockOnApply = vi.fn();

  const baseTemplate: PlanTemplate = {
    id: '1',
    title: 'Test Template',
    type: 'UNIT_PLAN',
    category: 'BY_SUBJECT',
    tags: [],
    keywords: [],
    usageCount: 0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdByUserId: 1,
    isSystem: false,
    isPublic: true,
    content: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Metadata Display', () => {
    it('should not display subject when null', () => {
      const template = { ...baseTemplate, subject: undefined };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      const subjectElement = screen.queryByText(/capitalize/);
      expect(subjectElement).not.toBeInTheDocument();
    });

    it('should not display subject when undefined', () => {
      const template = { ...baseTemplate, subject: undefined };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      const subjectElement = screen.queryByText(/capitalize/);
      expect(subjectElement).not.toBeInTheDocument();
    });

    it('should not display subject when empty string', () => {
      const template = { ...baseTemplate, subject: '' };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      const subjectElement = screen.queryByText(/capitalize/);
      expect(subjectElement).not.toBeInTheDocument();
    });

    it('should display subject when valid', () => {
      const template = { ...baseTemplate, subject: 'math' };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.getByText('math')).toBeInTheDocument();
    });
  });

  describe('Grade Range Display', () => {
    it('should display "All grades" when both gradeMin and gradeMax are null', () => {
      const template = { ...baseTemplate, gradeMin: undefined, gradeMax: undefined };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.getByText('All grades')).toBeInTheDocument();
    });

    it('should display "All grades" when only gradeMin is null', () => {
      const template = { ...baseTemplate, gradeMin: undefined, gradeMax: 5 };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.getByText('All grades')).toBeInTheDocument();
    });

    it('should display "All grades" when only gradeMax is null', () => {
      const template = { ...baseTemplate, gradeMin: 3, gradeMax: undefined };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.getByText('All grades')).toBeInTheDocument();
    });

    it('should display grade range when both values are present', () => {
      const template = { ...baseTemplate, gradeMin: 3, gradeMax: 5 };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.getByText('Grades 3-5')).toBeInTheDocument();
    });
  });

  describe('Duration Display', () => {
    it('should display "Duration varies" when unit plan has no estimatedWeeks', () => {
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const, estimatedWeeks: undefined };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.getByText('Duration varies')).toBeInTheDocument();
    });

    it('should display "Duration varies" when estimatedWeeks is 0', () => {
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const, estimatedWeeks: 0 };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.getByText('Duration varies')).toBeInTheDocument();
    });

    it('should display weeks when estimatedWeeks is valid', () => {
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const, estimatedWeeks: 4 };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.getByText('4 weeks')).toBeInTheDocument();
    });

    it('should display "Duration varies" when lesson plan has no estimatedMinutes', () => {
      const template = { ...baseTemplate, type: 'LESSON_PLAN' as const, estimatedMinutes: undefined };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.getByText('Duration varies')).toBeInTheDocument();
    });

    it('should display minutes when estimatedMinutes is valid', () => {
      const template = { ...baseTemplate, type: 'LESSON_PLAN' as const, estimatedMinutes: 60 };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.getByText('60 minutes')).toBeInTheDocument();
    });
  });

  describe('Description Display', () => {
    it('should not display description section when null', () => {
      const template = { ...baseTemplate, description: undefined };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });

    it('should not display description section when empty string', () => {
      const template = { ...baseTemplate, description: '' };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });

    it('should display description when valid', () => {
      const template = { ...baseTemplate, description: 'This is a test description' };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('This is a test description')).toBeInTheDocument();
    });
  });

  describe('Tags Display', () => {
    it('should not display tags section when array is empty', () => {
      const template = { ...baseTemplate, tags: [] };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.queryByText('Tags')).not.toBeInTheDocument();
    });

    it('should display tags when array has items', () => {
      const template = { ...baseTemplate, tags: ['math', 'algebra', 'geometry'] };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.getByText('Tags')).toBeInTheDocument();
      expect(screen.getByText('math')).toBeInTheDocument();
      expect(screen.getByText('algebra')).toBeInTheDocument();
      expect(screen.getByText('geometry')).toBeInTheDocument();
    });
  });

  describe('Unit Structure Display', () => {
    it('should not display unit structure when null', () => {
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const, unitStructure: undefined };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.queryByText('Unit Structure')).not.toBeInTheDocument();
    });

    it('should not display unit structure when undefined', () => {
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const, unitStructure: undefined };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.queryByText('Unit Structure')).not.toBeInTheDocument();
    });

    it('should not display unit structure for lesson plans', () => {
      const template = { 
        ...baseTemplate, 
        type: 'LESSON_PLAN' as const, 
        unitStructure: { phases: [{ name: 'Phase 1' }] } 
      };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.queryByText('Unit Structure')).not.toBeInTheDocument();
    });

    it('should not display phases when phases array is empty', () => {
      const template = { 
        ...baseTemplate, 
        type: 'UNIT_PLAN' as const, 
        unitStructure: { phases: [] } 
      };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.queryByText('Unit Structure')).toBeInTheDocument();
      expect(screen.queryByText(/Phase/)).not.toBeInTheDocument();
    });

    it('should display phases when valid', () => {
      const template = { 
        ...baseTemplate, 
        type: 'UNIT_PLAN' as const, 
        unitStructure: { 
          phases: [
            { name: 'Introduction', description: 'Intro phase', estimatedDays: 2 },
            { name: 'Development', description: undefined, estimatedDays: undefined }
          ] 
        } 
      };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.getByText('Unit Structure')).toBeInTheDocument();
      expect(screen.getByText('Introduction')).toBeInTheDocument();
      expect(screen.getByText('Intro phase')).toBeInTheDocument();
      expect(screen.getByText('Estimated: 2 days')).toBeInTheDocument();
      expect(screen.getByText('Development')).toBeInTheDocument();
      // Null description and estimatedDays should not be displayed
      expect(screen.queryByText('No estimated days')).not.toBeInTheDocument();
    });
  });

  describe('Creator Info Display', () => {
    it('should display system template when createdByUser is null', () => {
      const template = { ...baseTemplate, createdByUser: undefined };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.getByText('System template')).toBeInTheDocument();
    });

    it('should display creator name when createdByUser exists', () => {
      const template = { 
        ...baseTemplate, 
        createdByUser: { id: 1, name: 'John Doe' } 
      };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.getByText('Created by John Doe')).toBeInTheDocument();
    });

    it('should not display usage count when 0', () => {
      const template = { ...baseTemplate, usageCount: 0 };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.queryByText(/Used \d+ times/)).not.toBeInTheDocument();
    });

    it('should display usage count when greater than 0', () => {
      const template = { ...baseTemplate, usageCount: 5 };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.getByText('• Used 5 times')).toBeInTheDocument();
    });
  });

  describe('Content Section Rendering', () => {
    it('should not render sections with null content in unit plan', () => {
      const content: UnitPlanContent = {
        overview: undefined,
        bigIdeas: 'Big ideas here',
        learningGoals: [],
        essentialQuestions: ['Question 1'],
      };
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const, content };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      // Overview section should not be rendered
      expect(screen.queryByText('Overview')).not.toBeInTheDocument();
      // Other sections should be rendered
      expect(screen.getByText('Big Ideas')).toBeInTheDocument();
    });

    it('should not render sections with empty arrays in unit plan', () => {
      const content: UnitPlanContent = {
        overview: 'Overview here',
        learningGoals: [],
        essentialQuestions: ['Question 1'],
      };
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const, content };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      // Learning goals section should not be rendered (empty array)
      expect(screen.queryByText('Learning Goals')).not.toBeInTheDocument();
      // Other sections should be rendered
      expect(screen.getByText('Essential Questions')).toBeInTheDocument();
    });

    it('should not render assessment timing when null', () => {
      const content: UnitPlanContent = {
        overview: 'Overview',
        assessments: [
          { type: 'Formative', description: 'Test', timing: undefined },
          { type: 'Summative', description: 'Final', timing: 'End of unit' }
        ]
      };
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const, content };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      // Click to expand assessments
      fireEvent.click(screen.getByText('Assessments'));
      
      // First assessment should not show timing
      expect(screen.queryByText('No timing specified')).not.toBeInTheDocument();
      // Second assessment should show timing
      expect(screen.getByText('Timing: End of unit')).toBeInTheDocument();
    });

    it('should not render sections with null content in lesson plan', () => {
      const content: LessonPlanContent = {
        objectives: ['Objective 1'],
        materials: undefined,
        mindsOn: 'Minds on activity',
        action: undefined,
        consolidation: 'Consolidation activity',
        assessmentType: 'formative',
        assessmentNotes: undefined,
      };
      const template = { ...baseTemplate, type: 'LESSON_PLAN' as const, content };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      // Null sections should not be rendered
      expect(screen.queryByText('Materials')).not.toBeInTheDocument();
      expect(screen.queryByText('Action')).not.toBeInTheDocument();
      expect(screen.queryByText('Assessment')).not.toBeInTheDocument();
      // Valid sections should be rendered
      expect(screen.getByText('Learning Objectives')).toBeInTheDocument();
    });

    it('should not display assessment type when null in lesson plan', () => {
      const content: LessonPlanContent = {
        objectives: ['Objective 1'],
        assessmentType: undefined,
        assessmentNotes: 'Assessment notes here',
      };
      const template = { ...baseTemplate, type: 'LESSON_PLAN' as const, content };
      render(<TemplatePreviewModal template={template} onClose={mockOnClose} onApply={mockOnApply} />);
      
      // Click to expand assessment
      fireEvent.click(screen.getByText('Assessment'));
      
      // Type section should not be shown when null
      expect(screen.queryByText('Type:')).not.toBeInTheDocument();
      // Notes should still be shown
      expect(screen.getByText('Assessment notes here')).toBeInTheDocument();
    });
  });

  describe('Button Actions', () => {
    it('should call onClose when close button is clicked', () => {
      render(<TemplatePreviewModal template={baseTemplate} onClose={mockOnClose} onApply={mockOnApply} />);
      
      fireEvent.click(screen.getByText('Close'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onApply when use template button is clicked', () => {
      render(<TemplatePreviewModal template={baseTemplate} onClose={mockOnClose} onApply={mockOnApply} />);
      
      fireEvent.click(screen.getByText('Use This Template'));
      expect(mockOnApply).toHaveBeenCalledWith(baseTemplate);
    });
  });
});