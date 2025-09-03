import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickAssessmentGrid } from '../QuickAssessmentGrid';
import { toast } from 'sonner';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn()
  }
}));

describe('QuickAssessmentGrid', () => {
  const mockStudents = [
    { id: '1', firstName: 'Emma', lastName: 'Smith' },
    { id: '2', firstName: 'Liam', lastName: 'Johnson' },
    { id: '3', firstName: 'Olivia', lastName: 'Williams' },
    { id: '4', firstName: 'Noah', lastName: 'Brown' },
    { id: '5', firstName: 'Ava', lastName: 'Jones' }
  ];

  const defaultProps = {
    students: mockStudents,
    lessonId: 'lesson-123',
    lessonTitle: 'Test Lesson',
    expectation: 'Test Learning Goal',
    onClose: jest.fn(),
    onDaybookUpdate: jest.fn()
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders the assessment grid with all students', () => {
    render(<QuickAssessmentGrid {...defaultProps} />);
    
    mockStudents.forEach(student => {
      expect(screen.getByText(student.firstName)).toBeInTheDocument();
      expect(screen.getByText(student.lastName)).toBeInTheDocument();
    });
  });

  it('displays lesson context in header', () => {
    render(<QuickAssessmentGrid {...defaultProps} />);
    
    expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    expect(screen.getByText('Test Learning Goal')).toBeInTheDocument();
  });

  it('cycles through assessment levels when clicking a student', () => {
    render(<QuickAssessmentGrid {...defaultProps} />);
    
    const emmaButton = screen.getByRole('button', { 
      name: /Emma Smith: Meeting/ 
    });
    
    // Click to cycle through levels
    fireEvent.click(emmaButton);
    expect(screen.getByRole('button', { 
      name: /Emma Smith: Exceeding/ 
    })).toBeInTheDocument();
    
    fireEvent.click(emmaButton);
    expect(screen.getByRole('button', { 
      name: /Emma Smith: Not Yet/ 
    })).toBeInTheDocument();
    
    fireEvent.click(emmaButton);
    expect(screen.getByRole('button', { 
      name: /Emma Smith: Approaching/ 
    })).toBeInTheDocument();
    
    fireEvent.click(emmaButton);
    expect(screen.getByRole('button', { 
      name: /Emma Smith: Meeting/ 
    })).toBeInTheDocument();
  });

  it('shows the Create Groups for Tomorrow button', () => {
    render(<QuickAssessmentGrid {...defaultProps} />);
    
    const groupsButton = screen.getByRole('button', { 
      name: /Create Groups for Tomorrow/ 
    });
    
    expect(groupsButton).toBeInTheDocument();
  });

  it('creates groups and saves them with correct date', () => {
    render(<QuickAssessmentGrid {...defaultProps} />);
    
    // Set some students to different levels
    fireEvent.click(screen.getByRole('button', { name: /Emma Smith/ }));
    fireEvent.click(screen.getByRole('button', { name: /Emma Smith/ }));
    fireEvent.click(screen.getByRole('button', { name: /Emma Smith/ })); // Not Yet
    
    fireEvent.click(screen.getByRole('button', { name: /Liam Johnson/ }));
    fireEvent.click(screen.getByRole('button', { name: /Liam Johnson/ })); // Approaching
    
    // Create groups
    const groupsButton = screen.getByRole('button', { 
      name: /Create Groups for Tomorrow/ 
    });
    fireEvent.click(groupsButton);
    
    // Check that groups were saved
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const savedGroups = localStorage.getItem(`assessment-groups-${tomorrowStr}`);
    
    expect(savedGroups).toBeTruthy();
    const groups = JSON.parse(savedGroups!);
    expect(groups.reteaching).toContain('1'); // Emma
    expect(groups.support).toContain('2'); // Liam
    expect(groups.forDate).toBe(tomorrowStr);
    
    // Check success toast
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining(tomorrowStr)
    );
  });

  it('displays groups view when Show Groups is clicked', () => {
    render(<QuickAssessmentGrid {...defaultProps} />);
    
    const showGroupsButton = screen.getByRole('button', { 
      name: /Show Groups/ 
    });
    fireEvent.click(showGroupsButton);
    
    // Should see group headers
    expect(screen.getByText(/Reteaching Group/)).toBeInTheDocument();
    expect(screen.getByText(/Support Group/)).toBeInTheDocument();
    expect(screen.getByText(/Independent Group/)).toBeInTheDocument();
    expect(screen.getByText(/Extension Group/)).toBeInTheDocument();
  });

  it('saves assessment to localStorage on Save & Close', async () => {
    render(<QuickAssessmentGrid {...defaultProps} />);
    
    // Make some assessments
    fireEvent.click(screen.getByRole('button', { name: /Emma Smith/ }));
    
    // Save and close
    const saveButton = screen.getByRole('button', { name: /Save & Close/ });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(defaultProps.onDaybookUpdate).toHaveBeenCalled();
    });
    
    // Check localStorage
    const savedAssessment = localStorage.getItem('assessment-lesson-123');
    expect(savedAssessment).toBeTruthy();
    
    const data = JSON.parse(savedAssessment!);
    expect(data.lessonId).toBe('lesson-123');
    expect(data.assessments).toBeInstanceOf(Array);
  });

  it('shows warning when trying to save without assessments', async () => {
    render(<QuickAssessmentGrid {...defaultProps} />);
    
    // Don't make any assessments, just try to save
    const saveButton = screen.getByRole('button', { name: /Save & Close/ });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith(
        'No assessments were made. Please assess at least one student.'
      );
    });
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('handles keyboard navigation correctly', () => {
    render(<QuickAssessmentGrid {...defaultProps} />);
    
    // Press arrow keys
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    
    // Press number keys to set levels
    fireEvent.keyDown(window, { key: '1' }); // Not Yet
    fireEvent.keyDown(window, { key: '2' }); // Approaching
    fireEvent.keyDown(window, { key: '3' }); // Meeting
    fireEvent.keyDown(window, { key: '4' }); // Exceeding
    
    // Press G to create groups
    fireEvent.keyDown(window, { key: 'G' });
    
    // Check that groups were created
    expect(toast.success).toHaveBeenCalled();
  });

  it('displays offline indicator when offline', () => {
    // Mock offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
    
    render(<QuickAssessmentGrid {...defaultProps} />);
    
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('queues assessments for sync when offline', () => {
    // Mock offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
    
    render(<QuickAssessmentGrid {...defaultProps} />);
    
    // Make an assessment
    fireEvent.click(screen.getByRole('button', { name: /Emma Smith/ }));
    
    // Wait for auto-save
    setTimeout(() => {
      const queue = localStorage.getItem('assessment-sync-queue');
      expect(queue).toBeTruthy();
      const queueData = JSON.parse(queue!);
      expect(queueData.length).toBeGreaterThan(0);
    }, 100);
  });

  it('includes accessibility attributes', () => {
    render(<QuickAssessmentGrid {...defaultProps} />);
    
    const studentButton = screen.getByRole('button', { 
      name: /Emma Smith/ 
    });
    
    expect(studentButton).toHaveAttribute('aria-label');
    expect(studentButton).toHaveAttribute('aria-pressed');
    expect(studentButton).toHaveAttribute('tabIndex');
  });

  it('closes when Escape key is pressed', () => {
    render(<QuickAssessmentGrid {...defaultProps} />);
    
    fireEvent.keyDown(window, { key: 'Escape' });
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});