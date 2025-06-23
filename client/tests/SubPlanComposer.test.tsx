import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubPlanComposer from '../src/components/SubPlanComposer';
import * as api from '../src/api';

// Mock the API module
vi.mock('../src/api');

// Mock the Toast hook
vi.mock('../src/components/Toast', () => ({
  useToast: () => ({
    showToast: vi.fn()
  })
}));

describe('SubPlanComposer', () => {
  const mockOnClose = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock API responses
    vi.mocked(api.getClassRoutines).mockResolvedValue([
      {
        id: 1,
        userId: 1,
        title: 'Morning Circle',
        description: 'Daily morning routine',
        category: 'morning',
        timeOfDay: '9:00 AM',
        priority: 10,
        isActive: true
      }
    ]);
    
    vi.mocked(api.generateSubPlanWithOptions).mockResolvedValue({
      data: new ArrayBuffer(8),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    });
  });

  it('renders with default options', () => {
    render(<SubPlanComposer onClose={mockOnClose} />);
    
    expect(screen.getByText('Generate Substitute Plan')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toHaveValue(new Date().toISOString().slice(0, 10));
    expect(screen.getByLabelText('Number of Days')).toHaveValue('1');
    
    // Check default checkboxes
    expect(screen.getByLabelText('Daily Schedule & Activities')).toBeChecked();
    expect(screen.getByLabelText('Current Student Goals')).toBeChecked();
    expect(screen.getByLabelText('Class Routines & Procedures')).toBeChecked();
    expect(screen.getByLabelText('Anonymize Student Names')).not.toBeChecked();
  });

  it('generates sub plan with selected options', async () => {
    render(<SubPlanComposer onClose={mockOnClose} />);
    
    // Change some options
    const anonymizeCheckbox = screen.getByLabelText('Anonymize Student Names');
    await user.click(anonymizeCheckbox);
    
    const emailInput = screen.getByLabelText('Email To (optional)');
    await user.type(emailInput, 'substitute@school.com');
    
    const notesTextarea = screen.getByLabelText('Additional Notes');
    await user.type(notesTextarea, 'Special instructions');
    
    // Generate plan
    const generateButton = screen.getByText('Generate Plan');
    await user.click(generateButton);
    
    await waitFor(() => {
      expect(api.generateSubPlanWithOptions).toHaveBeenCalledWith({
        date: expect.any(String),
        days: 1,
        includeGoals: true,
        includeRoutines: true,
        includePlans: true,
        anonymize: true,
        saveRecord: false,
        emailTo: 'substitute@school.com',
        notes: 'Special instructions',
        userId: 1
      });
    });
  });

  it('manages class routines', async () => {
    render(<SubPlanComposer onClose={mockOnClose} />);
    
    // Open routine manager
    const manageButton = screen.getByText('Manage Routines');
    await user.click(manageButton);
    
    await waitFor(() => {
      expect(screen.getByText('Class Routines')).toBeInTheDocument();
      expect(screen.getByText('Morning Circle')).toBeInTheDocument();
    });
    
    // Add new routine
    const titleInput = screen.getByPlaceholderText('Title');
    await user.type(titleInput, 'Dismissal Procedure');
    
    const descriptionInput = screen.getByPlaceholderText('Description');
    await user.type(descriptionInput, 'End of day routine');
    
    const categorySelect = screen.getByDisplayValue('Morning');
    await user.selectOptions(categorySelect, 'dismissal');
    
    vi.mocked(api.saveClassRoutine).mockResolvedValue({
      id: 2,
      userId: 1,
      title: 'Dismissal Procedure',
      description: 'End of day routine',
      category: 'dismissal',
      isActive: true
    });
    
    const addButton = screen.getByText('Add Routine');
    await user.click(addButton);
    
    await waitFor(() => {
      expect(api.saveClassRoutine).toHaveBeenCalledWith({
        title: 'Dismissal Procedure',
        description: 'End of day routine',
        category: 'dismissal',
        timeOfDay: '',
        priority: 0,
        userId: 1,
        isActive: true
      });
    });
  });

  it('deletes routine after confirmation', async () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(<SubPlanComposer onClose={mockOnClose} />);
    
    // Open routine manager
    const manageButton = screen.getByText('Manage Routines');
    await user.click(manageButton);
    
    await waitFor(() => {
      expect(screen.getByText('Morning Circle')).toBeInTheDocument();
    });
    
    vi.mocked(api.deleteClassRoutine).mockResolvedValue({ success: true });
    
    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);
    
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this routine?');
    
    await waitFor(() => {
      expect(api.deleteClassRoutine).toHaveBeenCalledWith(1);
    });
    
    confirmSpy.mockRestore();
  });

  it('displays PDF preview after generation', async () => {
    render(<SubPlanComposer onClose={mockOnClose} />);
    
    const generateButton = screen.getByText('Generate Plan');
    await user.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Preview')).toBeInTheDocument();
      const iframe = screen.getByTitle(/preview/i) || document.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(screen.getByText('Download PDF')).toBeInTheDocument();
    });
  });

  it('saves record when option is selected', async () => {
    render(<SubPlanComposer onClose={mockOnClose} />);
    
    const saveCheckbox = screen.getByLabelText('Save this plan for future reference');
    await user.click(saveCheckbox);
    
    const generateButton = screen.getByText('Generate Plan');
    await user.click(generateButton);
    
    await waitFor(() => {
      expect(api.generateSubPlanWithOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          saveRecord: true
        })
      );
    });
  });

  it('handles different day counts', async () => {
    render(<SubPlanComposer onClose={mockOnClose} />);
    
    const daysSelect = screen.getByLabelText('Number of Days');
    await user.selectOptions(daysSelect, '3');
    
    const generateButton = screen.getByText('Generate Plan');
    await user.click(generateButton);
    
    await waitFor(() => {
      expect(api.generateSubPlanWithOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          days: 3
        })
      );
    });
  });

  it('closes dialog when cancel is clicked', async () => {
    render(<SubPlanComposer onClose={mockOnClose} />);
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});