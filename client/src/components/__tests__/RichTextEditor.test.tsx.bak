import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { RichTextEditor } from '../RichTextEditor';

// Mock sanitization utility
vi.mock('../../utils/sanitization', () => ({
  sanitizeHtml: vi.fn((html: string) => html),
}));

import { sanitizeHtml } from '../../utils/sanitization';

describe('RichTextEditor', () => {
  const mockOnChange = vi.fn();
  const mockSanitizeHtml = sanitizeHtml as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSanitizeHtml.mockImplementation((html: string) => html);
  });

  it('renders with initial value', () => {
    const initialValue = '<p>Initial content</p>';
    render(<RichTextEditor value={initialValue} onChange={mockOnChange} />);
    
    const editor = screen.getByRole('textbox');
    expect(editor.innerHTML).toBe(initialValue);
  });

  it('calls onChange when content is edited', () => {
    render(<RichTextEditor value="" onChange={mockOnChange} />);
    
    const editor = screen.getByRole('textbox');
    fireEvent.input(editor, { target: { innerHTML: '<p>New content</p>' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('<p>New content</p>');
  });

  it('sanitizes HTML content on input', () => {
    mockSanitizeHtml.mockReturnValue('<p>Sanitized content</p>');
    
    render(<RichTextEditor value="" onChange={mockOnChange} />);
    
    const editor = screen.getByRole('textbox');
    fireEvent.input(editor, { target: { innerHTML: '<script>alert("XSS")</script><p>Content</p>' } });
    
    expect(mockSanitizeHtml).toHaveBeenCalledWith('<script>alert("XSS")</script><p>Content</p>');
    expect(mockOnChange).toHaveBeenCalledWith('<p>Sanitized content</p>');
  });

  it('handles paste event correctly', () => {
    render(<RichTextEditor value="" onChange={mockOnChange} />);
    
    const editor = screen.getByRole('textbox');
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer(),
    });
    
    // Add plain text to clipboard
    pasteEvent.clipboardData?.setData('text/plain', 'Pasted text & <script>');
    
    fireEvent.paste(editor, pasteEvent);
    
    // Text should be escaped
    expect(mockOnChange).toHaveBeenCalledWith(expect.stringContaining('Pasted text &amp; &lt;script&gt;'));
  });

  it('applies custom className', () => {
    render(<RichTextEditor value="" onChange={mockOnChange} className="custom-class" />);
    
    const container = screen.getByRole('textbox').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('uses custom placeholder', () => {
    render(<RichTextEditor value="" onChange={mockOnChange} placeholder="Enter text here..." />);
    
    const editor = screen.getByRole('textbox');
    expect(editor).toHaveAttribute('data-placeholder', 'Enter text here...');
  });

  it('updates when value prop changes', () => {
    const { rerender } = render(<RichTextEditor value="<p>Initial</p>" onChange={mockOnChange} />);
    
    const editor = screen.getByRole('textbox');
    expect(editor.innerHTML).toBe('<p>Initial</p>');
    
    rerender(<RichTextEditor value="<p>Updated</p>" onChange={mockOnChange} />);
    expect(editor.innerHTML).toBe('<p>Updated</p>');
  });

  it('does not call onChange if content has not changed', () => {
    render(<RichTextEditor value="<p>Content</p>" onChange={mockOnChange} />);
    
    const editor = screen.getByRole('textbox');
    fireEvent.input(editor, { target: { innerHTML: '<p>Content</p>' } });
    
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('handles empty value correctly', () => {
    render(<RichTextEditor value="" onChange={mockOnChange} />);
    
    const editor = screen.getByRole('textbox');
    expect(editor.innerHTML).toBe('');
  });

  it('handles null and undefined values', () => {
    const { rerender } = render(<RichTextEditor value={null as any} onChange={mockOnChange} />);
    
    let editor = screen.getByRole('textbox');
    expect(editor.innerHTML).toBe('');
    
    rerender(<RichTextEditor value={undefined as any} onChange={mockOnChange} />);
    editor = screen.getByRole('textbox');
    expect(editor.innerHTML).toBe('');
  });

  it('updates display when sanitization changes content', () => {
    mockSanitizeHtml.mockReturnValue('<p>Safe content</p>');
    
    render(<RichTextEditor value="" onChange={mockOnChange} />);
    
    const editor = screen.getByRole('textbox');
    fireEvent.input(editor, { target: { innerHTML: '<script>bad</script><p>Unsafe content</p>' } });
    
    expect(editor.innerHTML).toBe('<p>Safe content</p>');
  });

  it('maintains contentEditable attribute', () => {
    render(<RichTextEditor value="" onChange={mockOnChange} />);
    
    const editor = screen.getByRole('textbox');
    expect(editor).toHaveAttribute('contentEditable', 'true');
  });

  it('has proper accessibility attributes', () => {
    render(<RichTextEditor value="" onChange={mockOnChange} />);
    
    const editor = screen.getByRole('textbox');
    expect(editor).toHaveAttribute('aria-label', 'Rich text editor');
    expect(editor).toHaveAttribute('aria-multiline', 'true');
  });

  it('escapes special HTML entities in pasted text', () => {
    render(<RichTextEditor value="" onChange={mockOnChange} />);
    
    const editor = screen.getByRole('textbox');
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer(),
    });
    
    pasteEvent.clipboardData?.setData('text/plain', '& < > " \'');
    
    fireEvent.paste(editor, pasteEvent);
    
    expect(mockOnChange).toHaveBeenCalledWith(expect.stringContaining('&amp; &lt; &gt; &quot; &#039;'));
  });
});