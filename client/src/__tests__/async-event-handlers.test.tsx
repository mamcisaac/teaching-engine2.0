import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Test component with async event handler
function AsyncFormComponent({ onSubmit }: { onSubmit: (data: { name: string }) => Promise<void> }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This pattern causes a floating promise error
    void onSubmit({ name: 'test' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" />
      <button type="submit">Submit</button>
    </form>
  );
}

// Test component with improper async handler (the error case)
function ImproperAsyncForm({ onSubmit }: { onSubmit: (data: { name: string }) => Promise<void> }) {
  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      await onSubmit({ name: 'test' });
    }}>
      <input name="name" />
      <button type="submit">Submit</button>
    </form>
  );
}

describe('Async Event Handler Patterns', () => {
  const user = userEvent.setup();

  it('handles async form submission without floating promise', async () => {
    const mockSubmit = vi.fn().mockResolvedValue(undefined);
    
    render(<AsyncFormComponent onSubmit={mockSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({ name: 'test' });
    });
  });

  it('properly voids async operations in event handlers', async () => {
    const mockAsyncOperation = vi.fn().mockResolvedValue('result');
    
    function ButtonWithAsync() {
      const handleClick = () => {
        // Proper way: use void operator for fire-and-forget
        void mockAsyncOperation();
      };
      
      return <button onClick={handleClick}>Click me</button>;
    }
    
    render(<ButtonWithAsync />);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    await user.click(button);
    
    expect(mockAsyncOperation).toHaveBeenCalledTimes(1);
  });

  it('handles async operations that need to be awaited', async () => {
    const mockAsyncOperation = vi.fn().mockResolvedValue('result');
    let operationResult: string | null = null;
    
    function ButtonWithAwait() {
      const handleClick = () => {
        // When you need the result, create a wrapper function
        const performOperation = async () => {
          operationResult = await mockAsyncOperation();
        };
        void performOperation();
      };
      
      return <button onClick={handleClick}>Click me</button>;
    }
    
    render(<ButtonWithAwait />);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    await user.click(button);
    
    await waitFor(() => {
      expect(operationResult).toBe('result');
    });
  });

  it('handles errors in async event handlers', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockSubmit = vi.fn().mockRejectedValue(new Error('Submit failed'));
    
    function FormWithErrorHandling({ onSubmit }: { onSubmit: () => Promise<void> }) {
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        void onSubmit().catch((error) => {
          console.error('Form submission failed:', error);
        });
      };
      
      return (
        <form onSubmit={handleSubmit}>
          <button type="submit">Submit</button>
        </form>
      );
    }
    
    render(<FormWithErrorHandling onSubmit={mockSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Form submission failed:',
        expect.any(Error)
      );
    });
    
    consoleErrorSpy.mockRestore();
  });
});