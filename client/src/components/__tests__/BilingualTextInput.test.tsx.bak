import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BilingualTextInput } from '../BilingualTextInput';

// Mock the LanguageContext
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en',
  }),
}));

describe('BilingualTextInput', () => {
  const defaultProps = {
    label: 'Test Label',
    valueEn: '',
    valueFr: '',
    onChangeEn: vi.fn(),
    onChangeFr: vi.fn(),
  };

  describe('placeholder handling with strict boolean checks', () => {
    it('should handle undefined placeholders correctly', () => {
      render(<BilingualTextInput {...defaultProps} />);
      
      // Toggle to show both languages
      fireEvent.click(screen.getByText('bilingual_content'));
      
      // Both inputs should exist without placeholder
      const inputs = screen.getAllByRole('textbox');
      expect(inputs[0]).not.toHaveAttribute('placeholder');
      expect(inputs[1]).not.toHaveAttribute('placeholder');
    });

    it('should use general placeholder when language-specific ones are undefined', () => {
      render(
        <BilingualTextInput 
          {...defaultProps} 
          placeholder="General placeholder"
        />
      );
      
      // Toggle to show both languages
      fireEvent.click(screen.getByText('bilingual_content'));
      
      const inputs = screen.getAllByRole('textbox');
      expect(inputs[0]).toHaveAttribute('placeholder', 'General placeholder');
      expect(inputs[1]).toHaveAttribute('placeholder', 'General placeholder');
    });

    it('should use language-specific placeholders when provided', () => {
      render(
        <BilingualTextInput 
          {...defaultProps} 
          placeholderEn="English placeholder"
          placeholderFr="French placeholder"
        />
      );
      
      // Toggle to show both languages
      fireEvent.click(screen.getByText('bilingual_content'));
      
      const inputs = screen.getAllByRole('textbox');
      expect(inputs[0]).toHaveAttribute('placeholder', 'English placeholder');
      expect(inputs[1]).toHaveAttribute('placeholder', 'French placeholder');
    });

    it('should prefer language-specific placeholders over general placeholder', () => {
      render(
        <BilingualTextInput 
          {...defaultProps} 
          placeholder="General"
          placeholderEn="English specific"
          placeholderFr="French specific"
        />
      );
      
      // Toggle to show both languages
      fireEvent.click(screen.getByText('bilingual_content'));
      
      const inputs = screen.getAllByRole('textbox');
      expect(inputs[0]).toHaveAttribute('placeholder', 'English specific');
      expect(inputs[1]).toHaveAttribute('placeholder', 'French specific');
    });

    it('should handle empty string placeholders correctly', () => {
      render(
        <BilingualTextInput 
          {...defaultProps} 
          placeholder=""
          placeholderEn=""
          placeholderFr=""
        />
      );
      
      // Toggle to show both languages
      fireEvent.click(screen.getByText('bilingual_content'));
      
      const inputs = screen.getAllByRole('textbox');
      // Empty string should still be set as placeholder
      expect(inputs[0]).toHaveAttribute('placeholder', '');
      expect(inputs[1]).toHaveAttribute('placeholder', '');
    });
  });

  describe('preview section visibility with strict boolean checks', () => {
    it('should not show preview when both values are empty', () => {
      render(<BilingualTextInput {...defaultProps} />);
      
      expect(screen.queryByText(/French:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/English:/)).not.toBeInTheDocument();
    });

    it('should not show preview when values are empty strings', () => {
      render(
        <BilingualTextInput 
          {...defaultProps} 
          valueEn=""
          valueFr=""
        />
      );
      
      expect(screen.queryByText(/French:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/English:/)).not.toBeInTheDocument();
    });

    it('should show French preview when in English mode with French value', () => {
      render(
        <BilingualTextInput 
          {...defaultProps} 
          valueEn="English text"
          valueFr="French text"
        />
      );
      
      expect(screen.getByText('🇫🇷 French:')).toBeInTheDocument();
      expect(screen.getByText('French text')).toBeInTheDocument();
    });

    it('should handle whitespace-only values correctly', () => {
      render(
        <BilingualTextInput 
          {...defaultProps} 
          valueEn="   "
          valueFr="   "
        />
      );
      
      // Should show preview since technically the strings are not empty
      expect(screen.getByText('🇫🇷 French:')).toBeInTheDocument();
    });
  });

  describe('single language mode placeholder handling', () => {
    it('should handle undefined placeholders in single language mode', () => {
      render(<BilingualTextInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      expect(input).not.toHaveAttribute('placeholder');
    });

    it('should use correct placeholder based on current language', () => {
      render(
        <BilingualTextInput 
          {...defaultProps} 
          placeholderEn="English"
          placeholderFr="French"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'English');
    });

    it('should fallback to general placeholder when language-specific is undefined', () => {
      render(
        <BilingualTextInput 
          {...defaultProps} 
          placeholder="General"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'General');
    });
  });

  describe('onChange handlers', () => {
    it('should call correct handler based on language in single mode', () => {
      render(<BilingualTextInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'New text' } });
      
      expect(defaultProps.onChangeEn).toHaveBeenCalledWith('New text');
      expect(defaultProps.onChangeFr).not.toHaveBeenCalled();
    });

    it('should call correct handlers in bilingual mode', () => {
      render(<BilingualTextInput {...defaultProps} />);
      
      // Toggle to show both languages
      fireEvent.click(screen.getByText('bilingual_content'));
      
      const inputs = screen.getAllByRole('textbox');
      
      // Change English input
      fireEvent.change(inputs[0], { target: { value: 'English text' } });
      expect(defaultProps.onChangeEn).toHaveBeenCalledWith('English text');
      
      // Change French input
      fireEvent.change(inputs[1], { target: { value: 'French text' } });
      expect(defaultProps.onChangeFr).toHaveBeenCalledWith('French text');
    });
  });
});