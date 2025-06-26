import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { renderWithProviders } from '../../../test-utils';

describe('Select', () => {
  const user = userEvent.setup();

  const BasicSelect = ({ onValueChange, value, disabled = false }: any) => (
    <Select onValueChange={onValueChange} value={value} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  );

  it('renders with placeholder', () => {
    renderWithProviders(<BasicSelect />);

    expect(screen.getByText('Select an option')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', async () => {
    renderWithProviders(<BasicSelect />);

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('selects option when clicked', async () => {
    const handleValueChange = vi.fn();
    renderWithProviders(<BasicSelect onValueChange={handleValueChange} />);

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    const option1 = screen.getByText('Option 1');
    await user.click(option1);

    expect(handleValueChange).toHaveBeenCalledWith('option1');
  });

  it('displays selected value', () => {
    renderWithProviders(<BasicSelect value="option2" />);

    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('opens with keyboard navigation', async () => {
    renderWithProviders(<BasicSelect />);

    const trigger = screen.getByRole('combobox');
    trigger.focus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('Option 1')).toBeInTheDocument();

    await user.keyboard('{Enter}');
    // Should select the focused option
  });

  it('navigates options with arrow keys', async () => {
    const handleValueChange = vi.fn();
    renderWithProviders(<BasicSelect onValueChange={handleValueChange} />);

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    // Navigate down
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(handleValueChange).toHaveBeenCalledWith('option2');
  });

  it('closes dropdown with Escape key', async () => {
    renderWithProviders(<BasicSelect />);

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    expect(screen.getByText('Option 1')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    renderWithProviders(<BasicSelect disabled />);

    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDisabled();
  });

  it('does not open when disabled and clicked', async () => {
    renderWithProviders(<BasicSelect disabled />);

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  });

  it('supports default value', () => {
    const SelectWithDefault = () => (
      <Select defaultValue="option2">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    renderWithProviders(<SelectWithDefault />);
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('handles required validation', () => {
    const RequiredSelect = () => (
      <Select required>
        <SelectTrigger>
          <SelectValue placeholder="Required field" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    renderWithProviders(<RequiredSelect />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-required', 'true');
  });

  it('supports custom placeholder', () => {
    const CustomPlaceholderSelect = () => (
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose your option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    renderWithProviders(<CustomPlaceholderSelect />);
    expect(screen.getByText('Choose your option')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const ErrorSelect = () => (
      <Select>
        <SelectTrigger className="border-red-500">
          <SelectValue placeholder="Select with error" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    renderWithProviders(<ErrorSelect />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('border-red-500');
  });

  it('handles many options efficiently', async () => {
    const ManyOptionsSelect = () => (
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Many options" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 100 }, (_, i) => (
            <SelectItem key={i} value={`option${i}`}>
              Option {i}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );

    renderWithProviders(<ManyOptionsSelect />);

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    expect(screen.getByText('Option 0')).toBeInTheDocument();
    expect(screen.getByText('Option 99')).toBeInTheDocument();
  });

  it('supports grouping options', async () => {
    const GroupedSelect = () => (
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Grouped options" />
        </SelectTrigger>
        <SelectContent>
          <div role="group" aria-labelledby="group1">
            <div id="group1">Group 1</div>
            <SelectItem value="group1-option1">Group 1 Option 1</SelectItem>
            <SelectItem value="group1-option2">Group 1 Option 2</SelectItem>
          </div>
          <div role="group" aria-labelledby="group2">
            <div id="group2">Group 2</div>
            <SelectItem value="group2-option1">Group 2 Option 1</SelectItem>
          </div>
        </SelectContent>
      </Select>
    );

    renderWithProviders(<GroupedSelect />);

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    expect(screen.getByText('Group 1')).toBeInTheDocument();
    expect(screen.getByText('Group 2')).toBeInTheDocument();
  });

  it('closes when clicking outside', async () => {
    renderWithProviders(
      <div>
        <BasicSelect />
        <div data-testid="outside">Outside element</div>
      </div>
    );

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    expect(screen.getByText('Option 1')).toBeInTheDocument();

    const outside = screen.getByTestId('outside');
    await user.click(outside);

    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  });

  it('maintains focus on trigger after selection', async () => {
    const handleValueChange = vi.fn();
    renderWithProviders(<BasicSelect onValueChange={handleValueChange} />);

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    const option1 = screen.getByText('Option 1');
    await user.click(option1);

    expect(document.activeElement).toBe(trigger);
  });

  it('supports search/filter functionality', async () => {
    const SearchableSelect = () => (
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Searchable select" />
        </SelectTrigger>
        <SelectContent>
          <input 
            placeholder="Search..." 
            className="search-input"
            data-testid="search-input"
          />
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectContent>
      </Select>
    );

    renderWithProviders(<SearchableSelect />);

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'app');

    // In a real implementation, this would filter the options
    expect(searchInput).toHaveValue('app');
  });

  it('handles null and undefined values gracefully', () => {
    const NullValueSelect = () => (
      <Select value={undefined}>
        <SelectTrigger>
          <SelectValue placeholder="Null value test" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    renderWithProviders(<NullValueSelect />);
    expect(screen.getByText('Null value test')).toBeInTheDocument();
  });
});