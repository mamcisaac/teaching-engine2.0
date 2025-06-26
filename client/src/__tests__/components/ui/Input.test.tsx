import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Input } from '../../../components/ui/Input';
import { renderWithProviders } from '../../../test-utils';

describe('Input', () => {
  const user = userEvent.setup();

  it('renders with default props', () => {
    renderWithProviders(<Input />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('input');
  });

  it('handles value changes', async () => {
    const handleChange = vi.fn();
    renderWithProviders(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test value');

    expect(handleChange).toHaveBeenCalledTimes(10); // Each character
    expect(input).toHaveValue('test value');
  });

  it('accepts placeholder text', () => {
    renderWithProviders(<Input placeholder="Enter your name" />);

    const input = screen.getByPlaceholderText('Enter your name');
    expect(input).toBeInTheDocument();
  });

  it('can be disabled', () => {
    renderWithProviders(<Input disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('does not accept input when disabled', async () => {
    const handleChange = vi.fn();
    renderWithProviders(<Input disabled onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    expect(handleChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('');
  });

  it('supports different input types', () => {
    const { rerender } = renderWithProviders(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password');

    rerender(<Input type="number" />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
  });

  it('shows error state with error prop', () => {
    renderWithProviders(<Input error />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  it('accepts custom className', () => {
    renderWithProviders(<Input className="custom-input" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    renderWithProviders(<Input ref={ref} />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('supports controlled component pattern', async () => {
    const handleChange = vi.fn();
    const { rerender } = renderWithProviders(
      <Input value="initial" onChange={handleChange} />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('initial');

    await user.clear(input);
    await user.type(input, 'new value');

    // Simulate controlled update
    rerender(<Input value="controlled value" onChange={handleChange} />);
    expect(input).toHaveValue('controlled value');
  });

  it('supports uncontrolled component pattern', async () => {
    renderWithProviders(<Input defaultValue="default" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('default');

    await user.clear(input);
    await user.type(input, 'user input');

    expect(input).toHaveValue('user input');
  });

  it('handles focus and blur events', async () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    renderWithProviders(<Input onFocus={handleFocus} onBlur={handleBlur} />);

    const input = screen.getByRole('textbox');
    
    await user.click(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    await user.tab();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard shortcuts', async () => {
    const handleKeyDown = vi.fn();
    renderWithProviders(<Input onKeyDown={handleKeyDown} />);

    const input = screen.getByRole('textbox');
    input.focus();

    await user.keyboard('{Enter}');
    await user.keyboard('{Escape}');
    await user.keyboard('{Tab}');

    expect(handleKeyDown).toHaveBeenCalledTimes(3);
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(
      <Input
        aria-label="Search input"
        aria-describedby="search-help"
        required
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label', 'Search input');
    expect(input).toHaveAttribute('aria-describedby', 'search-help');
    expect(input).toHaveAttribute('required');
  });

  it('supports maxLength constraint', async () => {
    renderWithProviders(<Input maxLength={5} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '1234567890');

    expect(input).toHaveValue('12345');
  });

  it('supports minLength validation', () => {
    renderWithProviders(<Input minLength={3} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('minLength', '3');
  });

  it('supports pattern validation', () => {
    renderWithProviders(<Input pattern="[0-9]*" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('pattern', '[0-9]*');
  });

  it('handles disabled state correctly', () => {
    renderWithProviders(<Input disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed disabled:opacity-50');
  });

  it('handles autoComplete correctly', () => {
    renderWithProviders(<Input autoComplete="email" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('autoComplete', 'email');
  });

  it('supports readonly state', async () => {
    const handleChange = vi.fn();
    renderWithProviders(<Input readOnly value="readonly" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readOnly');
    expect(input).toHaveValue('readonly');

    await user.type(input, 'test');
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('supports required attribute', () => {
    renderWithProviders(<Input required />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  it('handles value changes correctly', async () => {
    const handleChange = vi.fn();
    renderWithProviders(<Input value="test" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test');
    
    await user.clear(input);
    await user.type(input, 'new value');

    expect(handleChange).toHaveBeenCalled();
  });

  it('respects maxLength attribute', async () => {
    renderWithProviders(<Input maxLength={10} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '10');
  });
});