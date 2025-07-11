import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { format } from 'date-fns';
import TemplateCard from '../TemplateCard';
import type { PlanTemplate } from '../../../types/template';

describe('TemplateCard - Strict Boolean Expressions', () => {
  const mockOnPreview = jest.fn();
  const mockOnApply = jest.fn();
  const mockOnDuplicate = jest.fn();

  const baseTemplate: PlanTemplate = {
    id: '1',
    title: 'Test Template',
    type: 'UNIT_PLAN',
    tags: [],
    usageCount: 0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdById: 'user1',
    isSystem: false,
    isPublic: true,
    visibility: 'PUBLIC',
    content: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Duration Display', () => {
    it('should handle estimatedWeeks when it is null', () => {
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const, estimatedWeeks: null };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.getByText('Duration not specified')).toBeInTheDocument();
    });

    it('should handle estimatedWeeks when it is undefined', () => {
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const, estimatedWeeks: undefined };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.getByText('Duration not specified')).toBeInTheDocument();
    });

    it('should handle estimatedWeeks when it is 0', () => {
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const, estimatedWeeks: 0 };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.getByText('Duration not specified')).toBeInTheDocument();
    });

    it('should display weeks correctly when estimatedWeeks is valid', () => {
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const, estimatedWeeks: 3 };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.getByText('3 weeks')).toBeInTheDocument();
    });

    it('should handle estimatedMinutes when it is null', () => {
      const template = { ...baseTemplate, type: 'LESSON_PLAN' as const, estimatedMinutes: null };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.getByText('Duration not specified')).toBeInTheDocument();
    });

    it('should handle estimatedMinutes when it is 0', () => {
      const template = { ...baseTemplate, type: 'LESSON_PLAN' as const, estimatedMinutes: 0 };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.getByText('Duration not specified')).toBeInTheDocument();
    });
  });

  describe('Grade Range Display', () => {
    it('should handle when both gradeMin and gradeMax are null', () => {
      const template = { ...baseTemplate, gradeMin: null, gradeMax: null };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.getByText('All grades')).toBeInTheDocument();
    });

    it('should handle when only gradeMin is null', () => {
      const template = { ...baseTemplate, gradeMin: null, gradeMax: 5 };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.getByText('All grades')).toBeInTheDocument();
    });

    it('should handle when only gradeMax is null', () => {
      const template = { ...baseTemplate, gradeMin: 3, gradeMax: null };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.getByText('All grades')).toBeInTheDocument();
    });

    it('should display single grade when min equals max', () => {
      const template = { ...baseTemplate, gradeMin: 3, gradeMax: 3 };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.getByText('Grade 3')).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should not render subject when null', () => {
      const template = { ...baseTemplate, subject: null };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      const subjectElement = screen.queryByText(/capitalize/);
      expect(subjectElement).not.toBeInTheDocument();
    });

    it('should not render subject when undefined', () => {
      const template = { ...baseTemplate, subject: undefined };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      const subjectElement = screen.queryByText(/capitalize/);
      expect(subjectElement).not.toBeInTheDocument();
    });

    it('should not render subject when empty string', () => {
      const template = { ...baseTemplate, subject: '' };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      const subjectElement = screen.queryByText(/capitalize/);
      expect(subjectElement).not.toBeInTheDocument();
    });

    it('should not render system badge when isSystem is false', () => {
      const template = { ...baseTemplate, isSystem: false };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.queryByText('System')).not.toBeInTheDocument();
    });

    it('should not render description when null', () => {
      const template = { ...baseTemplate, description: null };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      const descElement = screen.queryByText(/line-clamp-2/);
      expect(descElement).not.toBeInTheDocument();
    });

    it('should not render description when empty string', () => {
      const template = { ...baseTemplate, description: '' };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      const descElement = screen.queryByText(/line-clamp-2/);
      expect(descElement).not.toBeInTheDocument();
    });
  });

  describe('Rating Display', () => {
    it('should not render rating when averageRating is null', () => {
      const template = { ...baseTemplate, averageRating: null };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.queryByTestId('star-icon')).not.toBeInTheDocument();
    });

    it('should not render rating when averageRating is 0', () => {
      const template = { ...baseTemplate, averageRating: 0 };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.queryByTestId('star-icon')).not.toBeInTheDocument();
    });

    it('should render rating count when _count.ratings exists', () => {
      const template = { 
        ...baseTemplate, 
        averageRating: 4.5,
        _count: { ratings: 10 }
      };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.getByText('(10)')).toBeInTheDocument();
    });

    it('should not render rating count when _count is null', () => {
      const template = { 
        ...baseTemplate, 
        averageRating: 4.5,
        _count: null
      };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
    });
  });

  describe('Tags Display', () => {
    it('should not render tags section when tags array is empty', () => {
      const template = { ...baseTemplate, tags: [] };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      const tagsContainer = screen.queryByText(/\+\d+ more/);
      expect(tagsContainer).not.toBeInTheDocument();
    });

    it('should render tags when array has items', () => {
      const template = { ...baseTemplate, tags: ['math', 'algebra', 'geometry'] };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.getByText('math')).toBeInTheDocument();
      expect(screen.getByText('algebra')).toBeInTheDocument();
      expect(screen.getByText('geometry')).toBeInTheDocument();
    });
  });

  describe('Duplicate Button', () => {
    it('should not render duplicate button when onDuplicate is undefined', () => {
      render(<TemplateCard template={baseTemplate} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.queryByTitle('Duplicate template')).not.toBeInTheDocument();
    });

    it('should render duplicate button when onDuplicate is provided', () => {
      render(
        <TemplateCard 
          template={baseTemplate} 
          onPreview={mockOnPreview} 
          onApply={mockOnApply}
          onDuplicate={mockOnDuplicate}
        />
      );
      expect(screen.getByTitle('Duplicate template')).toBeInTheDocument();
    });
  });

  describe('Creator Info', () => {
    it('should show system template when createdByUser is null', () => {
      const template = { ...baseTemplate, createdByUser: null };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.getByText('System template')).toBeInTheDocument();
    });

    it('should show creator name when createdByUser exists', () => {
      const template = { 
        ...baseTemplate, 
        createdByUser: { id: '1', name: 'John Doe', email: 'john@example.com' }
      };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.getByText('Created by John Doe')).toBeInTheDocument();
    });

    it('should not render last used date when lastUsedAt is null', () => {
      const template = { ...baseTemplate, lastUsedAt: null };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      expect(screen.queryByText(/Last used/)).not.toBeInTheDocument();
    });

    it('should render last used date when lastUsedAt exists', () => {
      const lastUsedDate = '2024-03-15';
      const template = { ...baseTemplate, lastUsedAt: lastUsedDate };
      render(<TemplateCard template={template} onPreview={mockOnPreview} onApply={mockOnApply} />);
      const formattedDate = format(new Date(lastUsedDate), 'MMM d, yyyy');
      expect(screen.getByText(`• Last used ${formattedDate}`)).toBeInTheDocument();
    });
  });

  describe('Button Actions', () => {
    it('should call onPreview when preview button is clicked', () => {
      render(<TemplateCard template={baseTemplate} onPreview={mockOnPreview} onApply={mockOnApply} />);
      fireEvent.click(screen.getByText('Preview'));
      expect(mockOnPreview).toHaveBeenCalledWith(baseTemplate);
    });

    it('should call onApply when use template button is clicked', () => {
      render(<TemplateCard template={baseTemplate} onPreview={mockOnPreview} onApply={mockOnApply} />);
      fireEvent.click(screen.getByText('Use Template'));
      expect(mockOnApply).toHaveBeenCalledWith(baseTemplate);
    });

    it('should call onDuplicate when duplicate button is clicked', () => {
      render(
        <TemplateCard 
          template={baseTemplate} 
          onPreview={mockOnPreview} 
          onApply={mockOnApply}
          onDuplicate={mockOnDuplicate}
        />
      );
      fireEvent.click(screen.getByTitle('Duplicate template'));
      expect(mockOnDuplicate).toHaveBeenCalledWith(baseTemplate);
    });
  });
});