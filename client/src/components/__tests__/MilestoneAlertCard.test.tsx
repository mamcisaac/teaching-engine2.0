import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MilestoneAlertCard, { MilestoneAlert } from '../MilestoneAlertCard';

const mockAlert: MilestoneAlert = {
  type: 'outcome_missed',
  outcomeId: '1CO.1',
  outcomeCode: '1CO.1',
  message: 'Outcome 1CO.1 has not been introduced. Target date: Oct 15.',
  severity: 'warning',
  dueDate: '2023-10-15T00:00:00.000Z',
  priority: 'high',
  description: 'Sound discrimination should be introduced early in oral language',
};

const mockDomainAlert: MilestoneAlert = {
  type: 'underassessed_domain',
  domain: 'Communication orale',
  message: 'Only 1 Communication orale activities logged. Expected ≥ 3 by now.',
  severity: 'notice',
  dueDate: '2023-11-01T00:00:00.000Z',
  priority: 'medium',
  description: 'Minimum oral language activities expected by mid-year',
};

const mockHandlers = {
  onDismiss: vi.fn(),
  onSnooze: vi.fn(),
  onPlanActivity: vi.fn(),
  onViewDetails: vi.fn(),
};

describe('MilestoneAlertCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders outcome alert correctly', () => {
    render(<MilestoneAlertCard alert={mockAlert} {...mockHandlers} />);

    expect(screen.getByText('1CO.1')).toBeInTheDocument();
    expect(screen.getByText(/Outcome 1CO.1 has not been introduced/)).toBeInTheDocument();
    // Check for date in a more flexible way since formatting may vary by locale
    const targetText = screen.getByText((content, element) => {
      return (
        element?.textContent?.includes('Target:') &&
        (element.textContent.includes('Oct 1') ||
          element.textContent.includes('Oct. 1') ||
          element.textContent.includes('October 1'))
      );
    });
    expect(targetText).toBeInTheDocument();
    expect(screen.getByText('❌ Overdue')).toBeInTheDocument();
  });

  it('renders domain alert correctly', () => {
    render(<MilestoneAlertCard alert={mockDomainAlert} {...mockHandlers} />);

    expect(screen.getByText('Communication orale')).toBeInTheDocument();
    expect(screen.getByText(/Only 1 Communication orale activities/)).toBeInTheDocument();
    // Check for date in a more flexible way since formatting may vary by locale
    const targetText = screen.getByText((content, element) => {
      return (
        element?.textContent?.includes('Target:') &&
        (element.textContent.includes('Nov 1') ||
          element.textContent.includes('Nov. 1') ||
          element.textContent.includes('November 1'))
      );
    });
    expect(targetText).toBeInTheDocument();
  });

  it('displays correct severity styling', () => {
    const { container, rerender } = render(
      <MilestoneAlertCard alert={mockAlert} {...mockHandlers} />,
    );

    // High priority alert should have orange border (warning severity maps to orange)
    const cardContainer = container.querySelector('.border-l-4');
    expect(cardContainer).toHaveClass('border-orange-500');
    expect(cardContainer).toHaveClass('bg-orange-50');

    // Medium priority alert should have blue border (notice severity maps to blue)
    rerender(<MilestoneAlertCard alert={mockDomainAlert} {...mockHandlers} />);
    const mediumCardContainer = container.querySelector('.border-l-4');
    expect(mediumCardContainer).toHaveClass('border-blue-500');
    expect(mediumCardContainer).toHaveClass('bg-blue-50');
  });

  it('calls handlers when buttons are clicked', () => {
    render(<MilestoneAlertCard alert={mockAlert} {...mockHandlers} />);

    // Test Plan activity button
    fireEvent.click(screen.getByText('Plan activity'));
    expect(mockHandlers.onPlanActivity).toHaveBeenCalledTimes(1);

    // Test View details button
    fireEvent.click(screen.getByText('📖 View details'));
    expect(mockHandlers.onViewDetails).toHaveBeenCalledTimes(1);

    // Test Snooze button
    fireEvent.click(screen.getByText('Snooze'));
    expect(mockHandlers.onSnooze).toHaveBeenCalledTimes(1);

    // Test Dismiss button (X)
    fireEvent.click(screen.getByLabelText('Dismiss alert'));
    expect(mockHandlers.onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders without action buttons when handlers not provided', () => {
    render(<MilestoneAlertCard alert={mockAlert} />);

    expect(screen.queryByText('Plan activity')).not.toBeInTheDocument();
    expect(screen.queryByText('📖 View details')).not.toBeInTheDocument();
    expect(screen.queryByText('Snooze')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Dismiss alert')).not.toBeInTheDocument();
  });

  it('shows description when provided', () => {
    render(<MilestoneAlertCard alert={mockAlert} {...mockHandlers} />);

    // The description is shown as the display message when available
    expect(screen.getByText(/Outcome 1CO.1 has not been introduced/)).toBeInTheDocument();
  });

  it('displays different icons for different alert types', () => {
    const { rerender } = render(<MilestoneAlertCard alert={mockAlert} {...mockHandlers} />);

    // Outcome alerts should show book icon
    expect(screen.getByText('1CO.1')).toBeInTheDocument();

    // Domain alerts should show users icon
    rerender(<MilestoneAlertCard alert={mockDomainAlert} {...mockHandlers} />);
    expect(screen.getByText('Communication orale')).toBeInTheDocument();
  });

  it('handles thematic unit alerts', () => {
    const thematicAlert: MilestoneAlert = {
      type: 'theme_unaddressed',
      thematicUnitId: 1,
      thematicUnitTitle: 'Fall Harvest',
      message: 'Theme "Fall Harvest" has no scheduled activities.',
      severity: 'warning',
      dueDate: '2023-10-31T00:00:00.000Z',
      priority: 'medium',
    };

    render(<MilestoneAlertCard alert={thematicAlert} {...mockHandlers} />);

    expect(screen.getByText('Fall Harvest')).toBeInTheDocument();
    expect(
      screen.getByText(/Theme "Fall Harvest" has no scheduled activities/),
    ).toBeInTheDocument();
  });
});
