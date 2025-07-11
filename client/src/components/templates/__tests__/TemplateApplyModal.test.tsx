import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';
import TemplateApplyModal from '../TemplateApplyModal';
import type { PlanTemplate } from '../../../types/template';
import { api } from '../../../api';

// Mock the API
jest.mock('../../../api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the Select components
jest.mock('../../ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select-container">
      <select 
        value={value} 
        onChange={(e) => onValueChange(e.target.value)}
        data-testid="select"
      >
        {children}
      </select>
    </div>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: () => null,
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('TemplateApplyModal - Strict Boolean Expressions', () => {
  const mockOnClose = jest.fn();
  
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
    (api.get as jest.Mock).mockResolvedValue({ data: [] });
    (api.post as jest.Mock).mockResolvedValue({ data: { id: 'new-plan-id' } });
  });

  describe('Form Validation', () => {
    it('should validate unit plan requires longRangePlanId when empty string', async () => {
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const };
      renderWithProviders(
        <TemplateApplyModal template={template} isOpen={true} onClose={mockOnClose} />
      );

      // Submit form without selecting long-range plan
      const submitButton = screen.getByText('Apply Template');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please select a long-range plan');
      });
    });

    it('should validate lesson plan requires unitPlanId when empty string', async () => {
      const template = { ...baseTemplate, type: 'LESSON_PLAN' as const };
      renderWithProviders(
        <TemplateApplyModal template={template} isOpen={true} onClose={mockOnClose} />
      );

      // Submit form without selecting unit plan
      const submitButton = screen.getByText('Apply Template');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please select a unit plan');
      });
    });

    it('should allow submission when unit plan has valid longRangePlanId', async () => {
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const };
      const longRangePlans = [
        { id: 'lrp1', title: 'Long Range Plan 1', subject: 'Math', grade: '5' }
      ];
      (api.get as jest.Mock).mockResolvedValueOnce({ data: longRangePlans });

      renderWithProviders(
        <TemplateApplyModal template={template} isOpen={true} onClose={mockOnClose} />
      );

      // Wait for data to load
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/long-range-plans');
      });

      // Select a long-range plan
      const select = screen.getByTestId('select');
      fireEvent.change(select, { target: { value: 'lrp1' } });

      // Submit form
      const submitButton = screen.getByText('Apply Template');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/templates/1/apply', expect.objectContaining({
          longRangePlanId: 'lrp1',
        }));
      });
    });
  });

  describe('Template Duration Display', () => {
    it('should not display duration when estimatedWeeks is null', () => {
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const, estimatedWeeks: null };
      renderWithProviders(
        <TemplateApplyModal template={template} isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.queryByText(/Duration: \d+ weeks/)).not.toBeInTheDocument();
    });

    it('should not display duration when estimatedWeeks is undefined', () => {
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const, estimatedWeeks: undefined };
      renderWithProviders(
        <TemplateApplyModal template={template} isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.queryByText(/Duration: \d+ weeks/)).not.toBeInTheDocument();
    });

    it('should not display duration when estimatedWeeks is 0', () => {
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const, estimatedWeeks: 0 };
      renderWithProviders(
        <TemplateApplyModal template={template} isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.queryByText(/Duration: \d+ weeks/)).not.toBeInTheDocument();
    });

    it('should display duration when estimatedWeeks is valid', () => {
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const, estimatedWeeks: 3 };
      renderWithProviders(
        <TemplateApplyModal template={template} isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.getByText('Duration: 3 weeks')).toBeInTheDocument();
    });

    it('should not display duration when estimatedMinutes is null', () => {
      const template = { ...baseTemplate, type: 'LESSON_PLAN' as const, estimatedMinutes: null };
      renderWithProviders(
        <TemplateApplyModal template={template} isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.queryByText(/Duration: \d+ minutes/)).not.toBeInTheDocument();
    });

    it('should not display duration when estimatedMinutes is 0', () => {
      const template = { ...baseTemplate, type: 'LESSON_PLAN' as const, estimatedMinutes: 0 };
      renderWithProviders(
        <TemplateApplyModal template={template} isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.queryByText(/Duration: \d+ minutes/)).not.toBeInTheDocument();
    });

    it('should display duration when estimatedMinutes is valid', () => {
      const template = { ...baseTemplate, type: 'LESSON_PLAN' as const, estimatedMinutes: 45 };
      renderWithProviders(
        <TemplateApplyModal template={template} isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.getByText('Duration: 45 minutes')).toBeInTheDocument();
    });
  });

  describe('Tags Display', () => {
    it('should not render tags section when tags array is empty', () => {
      const template = { ...baseTemplate, tags: [] };
      renderWithProviders(
        <TemplateApplyModal template={template} isOpen={true} onClose={mockOnClose} />
      );

      // Look for the tags container - it should not exist when tags is empty
      const tagsContainer = screen.queryByText(/px-2 py-1 bg-white/);
      expect(tagsContainer).not.toBeInTheDocument();
    });

    it('should render tags when array has items', () => {
      const template = { ...baseTemplate, tags: ['math', 'algebra'] };
      renderWithProviders(
        <TemplateApplyModal template={template} isOpen={true} onClose={mockOnClose} />
      );

      expect(screen.getByText('math')).toBeInTheDocument();
      expect(screen.getByText('algebra')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to unit plan page on successful unit plan creation', async () => {
      const template = { ...baseTemplate, type: 'UNIT_PLAN' as const };
      const longRangePlans = [
        { id: 'lrp1', title: 'Long Range Plan 1', subject: 'Math', grade: '5' }
      ];
      (api.get as jest.Mock).mockResolvedValueOnce({ data: longRangePlans });
      (api.post as jest.Mock).mockResolvedValueOnce({ data: { id: 'unit-123' } });

      renderWithProviders(
        <TemplateApplyModal template={template} isOpen={true} onClose={mockOnClose} />
      );

      // Wait for data to load
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/long-range-plans');
      });

      // Select a long-range plan
      const select = screen.getByTestId('select');
      fireEvent.change(select, { target: { value: 'lrp1' } });

      // Submit form
      const submitButton = screen.getByText('Apply Template');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/planner/units/unit-123');
        expect(toast.success).toHaveBeenCalledWith('Unit created from template');
      });
    });

    it('should navigate to lesson plan page on successful lesson plan creation', async () => {
      const template = { ...baseTemplate, type: 'LESSON_PLAN' as const };
      const unitPlans = [
        { id: 'unit1', title: 'Unit Plan 1' }
      ];
      (api.get as jest.Mock).mockResolvedValueOnce({ data: unitPlans });
      (api.post as jest.Mock).mockResolvedValueOnce({ data: { id: 'lesson-456' } });

      renderWithProviders(
        <TemplateApplyModal template={template} isOpen={true} onClose={mockOnClose} />
      );

      // Wait for data to load
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/unit-plans');
      });

      // Select a unit plan
      const select = screen.getByTestId('select');
      fireEvent.change(select, { target: { value: 'unit1' } });

      // Submit form
      const submitButton = screen.getByText('Apply Template');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/planner/lessons/lesson-456');
        expect(toast.success).toHaveBeenCalledWith('Lesson created from template');
      });
    });
  });
});