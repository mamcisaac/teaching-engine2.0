import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import ExpectationSelector from '../../components/planning/ExpectationSelector';
import { renderWithProviders } from '../../test-utils';
import * as etfoHooks from '../../hooks/useETFOPlanning';

// Mock the planning hooks
vi.mock('../../hooks/useETFOPlanning', () => ({
  useCurriculumExpectations: vi.fn(),
}));

describe('ExpectationSelector', () => {
  const user = userEvent.setup();

  const mockExpectations = [
    {
      id: '1',
      code: 'A1.1',
      description: 'Number sense and numeration',
      strand: 'Number Sense',
      substrand: 'Quantity Relationships',
      grade: 3,
      subject: 'Mathematics',
      type: 'overall',
    },
    {
      id: '2',
      code: 'A1.2',
      description: 'Counting and cardinality',
      strand: 'Number Sense',
      substrand: 'Counting',
      grade: 3,
      subject: 'Mathematics',
      type: 'specific',
    },
    {
      id: '3',
      code: 'B1.1',
      description: 'Patterns and algebra',
      strand: 'Algebra',
      substrand: 'Patterns',
      grade: 3,
      subject: 'Mathematics',
      type: 'overall',
    },
  ];

  const defaultProps = {
    selectedIds: [],
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    (etfoHooks.useCurriculumExpectations as any).mockReturnValue({
      data: mockExpectations,
      isLoading: false,
      error: null,
    });
  });

  it('renders with default props', () => {
    renderWithProviders(<ExpectationSelector {...defaultProps} />);

    expect(screen.getByText('Curriculum Expectations')).toBeInTheDocument();
    expect(screen.getByText('Select curriculum expectations...')).toBeInTheDocument();
  });

  it('renders with custom label and placeholder', () => {
    renderWithProviders(
      <ExpectationSelector
        {...defaultProps}
        label="Choose Expectations"
        placeholder="Pick expectations..."
      />
    );

    expect(screen.getByText('Choose Expectations')).toBeInTheDocument();
    expect(screen.getByText('Pick expectations...')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', async () => {
    renderWithProviders(<ExpectationSelector {...defaultProps} />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    expect(screen.getByPlaceholderText('Search expectations...')).toBeInTheDocument();
    expect(screen.getByText('Number Sense')).toBeInTheDocument();
    expect(screen.getByText('Algebra')).toBeInTheDocument();
  });

  it('filters expectations by search query', async () => {
    renderWithProviders(<ExpectationSelector {...defaultProps} />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    const searchInput = screen.getByPlaceholderText('Search expectations...');
    await user.type(searchInput, 'algebra');

    expect(screen.getByText('Algebra')).toBeInTheDocument();
    expect(screen.queryByText('Number Sense')).not.toBeInTheDocument();
  });

  it('expands and collapses strands', async () => {
    renderWithProviders(<ExpectationSelector {...defaultProps} />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Initially, substrands might not be visible
    const numberSenseStrand = screen.getByText('Number Sense');
    await user.click(numberSenseStrand);

    // Should show substrands
    expect(screen.getByText('Quantity Relationships')).toBeInTheDocument();
    expect(screen.getByText('Counting')).toBeInTheDocument();

    // Click again to collapse
    await user.click(numberSenseStrand);

    expect(screen.queryByText('Quantity Relationships')).not.toBeInTheDocument();
  });

  it('selects single expectation when multiSelect is false', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <ExpectationSelector
        {...defaultProps}
        onChange={onChange}
        multiSelect={false}
      />
    );

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Expand strand
    await user.click(screen.getByText('Number Sense'));

    // Select expectation
    const expectation = screen.getByText('A1.1');
    await user.click(expectation);

    expect(onChange).toHaveBeenCalledWith(['1']);
  });

  it('selects multiple expectations when multiSelect is true', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <ExpectationSelector
        {...defaultProps}
        onChange={onChange}
        multiSelect={true}
      />
    );

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Expand strands
    await user.click(screen.getByText('Number Sense'));
    await user.click(screen.getByText('Algebra'));

    // Select multiple expectations
    await user.click(screen.getByText('A1.1'));
    await user.click(screen.getByText('B1.1'));

    expect(onChange).toHaveBeenCalledWith(['1']);
    expect(onChange).toHaveBeenCalledWith(['1', '3']);
  });

  it('deselects already selected expectations', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <ExpectationSelector
        {...defaultProps}
        selectedIds={['1']}
        onChange={onChange}
      />
    );

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    await user.click(screen.getByText('Number Sense'));

    // Click already selected expectation to deselect
    const selectedExpectation = screen.getByText('A1.1');
    expect(selectedExpectation).toHaveClass('selected'); // Assume this class exists
    await user.click(selectedExpectation);

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('displays selected expectations as badges', () => {
    renderWithProviders(
      <ExpectationSelector
        {...defaultProps}
        selectedIds={['1', '3']}
      />
    );

    expect(screen.getByText('A1.1')).toBeInTheDocument();
    expect(screen.getByText('B1.1')).toBeInTheDocument();
  });

  it('removes selected expectation when badge is clicked', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <ExpectationSelector
        {...defaultProps}
        selectedIds={['1', '3']}
        onChange={onChange}
      />
    );

    // Find and click the X button on the first badge
    const removeButton = screen.getAllByRole('button', { name: /remove/i })[0];
    await user.click(removeButton);

    expect(onChange).toHaveBeenCalledWith(['3']); // Remove '1', keep '3'
  });

  it('shows loading state', () => {
    (etfoHooks.useCurriculumExpectations as any).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });

    renderWithProviders(<ExpectationSelector {...defaultProps} />);

    const trigger = screen.getByRole('button');
    expect(trigger).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    (etfoHooks.useCurriculumExpectations as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Failed to load'),
    });

    renderWithProviders(<ExpectationSelector {...defaultProps} />);

    expect(screen.getByText(/error loading expectations/i)).toBeInTheDocument();
  });

  it('shows empty state when no expectations found', async () => {
    (etfoHooks.useCurriculumExpectations as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<ExpectationSelector {...defaultProps} />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    expect(screen.getByText('No expectations found')).toBeInTheDocument();
  });

  it('filters by grade and subject', () => {
    renderWithProviders(
      <ExpectationSelector
        {...defaultProps}
        grade={3}
        subject="Mathematics"
      />
    );

    expect(etfoHooks.useCurriculumExpectations).toHaveBeenCalledWith({
      grade: 3,
      subject: 'Mathematics',
    });
  });

  it('shows required indicator when required', () => {
    renderWithProviders(
      <ExpectationSelector
        {...defaultProps}
        required={true}
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message', () => {
    renderWithProviders(
      <ExpectationSelector
        {...defaultProps}
        error="Please select at least one expectation"
      />
    );

    expect(screen.getByText('Please select at least one expectation')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('error'); // Assume error styling
  });

  it('is disabled when disabled prop is true', () => {
    renderWithProviders(
      <ExpectationSelector
        {...defaultProps}
        disabled={true}
      />
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toBeDisabled();
  });

  it('handles keyboard navigation', async () => {
    renderWithProviders(<ExpectationSelector {...defaultProps} />);

    const trigger = screen.getByRole('button');
    
    // Open with Space key
    trigger.focus();
    await user.keyboard(' ');

    expect(screen.getByPlaceholderText('Search expectations...')).toBeInTheDocument();

    // Navigate with arrow keys
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByText('Number Sense'));

    // Select with Enter
    await user.keyboard('{Enter}');
    // Should expand the strand
  });

  it('clears search when dropdown closes', async () => {
    renderWithProviders(<ExpectationSelector {...defaultProps} />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    const searchInput = screen.getByPlaceholderText('Search expectations...');
    await user.type(searchInput, 'test search');

    // Close dropdown
    await user.keyboard('{Escape}');

    // Reopen
    await user.click(trigger);

    // Search should be cleared
    expect(screen.getByPlaceholderText('Search expectations...')).toHaveValue('');
  });

  it('groups expectations by strand and substrand correctly', async () => {
    renderWithProviders(<ExpectationSelector {...defaultProps} />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Should show strands as main categories
    expect(screen.getByText('Number Sense')).toBeInTheDocument();
    expect(screen.getByText('Algebra')).toBeInTheDocument();

    // Expand Number Sense
    await user.click(screen.getByText('Number Sense'));

    // Should show substrands
    expect(screen.getByText('Quantity Relationships')).toBeInTheDocument();
    expect(screen.getByText('Counting')).toBeInTheDocument();
  });

  it('shows expectation codes and descriptions', async () => {
    renderWithProviders(<ExpectationSelector {...defaultProps} />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    await user.click(screen.getByText('Number Sense'));

    expect(screen.getByText('A1.1')).toBeInTheDocument();
    expect(screen.getByText('Number sense and numeration')).toBeInTheDocument();
  });

  it('handles very long lists efficiently', async () => {
    const manyExpectations = Array.from({ length: 1000 }, (_, i) => ({
      id: `${i + 1}`,
      code: `A${i + 1}.1`,
      description: `Expectation ${i + 1}`,
      strand: 'Test Strand',
      substrand: 'Test Substrand',
      grade: 3,
      subject: 'Mathematics',
      type: 'specific',
    }));

    (etfoHooks.useCurriculumExpectations as any).mockReturnValue({
      data: manyExpectations,
      isLoading: false,
      error: null,
    });

    renderWithProviders(<ExpectationSelector {...defaultProps} />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Should render without performance issues
    expect(screen.getByText('Test Strand')).toBeInTheDocument();
  });
});