import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import BilingualPlanView from '../BilingualPlanView';

// Mock child component
const MockChild = ({ language }: { language?: string }) => (
  <div data-testid="mock-child">
    Content in {language || 'default'}
  </div>
);

const renderWithLanguageProvider = (ui: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {ui}
    </LanguageProvider>
  );
};

describe('BilingualPlanView', () => {
  describe('Mode Selection', () => {
    it('should use defaultMode when no mode is provided', () => {
      renderWithLanguageProvider(
        <BilingualPlanView defaultMode="side-by-side">
          <MockChild />
        </BilingualPlanView>
      );

      // In side-by-side mode, we should see both language headers
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Français')).toBeInTheDocument();
    });

    it('should use controlled mode when provided', () => {
      renderWithLanguageProvider(
        <BilingualPlanView mode="toggle" defaultMode="side-by-side">
          <MockChild />
        </BilingualPlanView>
      );

      // In toggle mode, we should see the toggle buttons
      expect(screen.getByRole('button', { name: /🇨🇦 English/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /🇫🇷 Français/i })).toBeInTheDocument();
    });

    it('should handle undefined mode gracefully', () => {
      renderWithLanguageProvider(
        <BilingualPlanView mode={undefined}>
          <MockChild />
        </BilingualPlanView>
      );

      // Should default to 'toggle' mode
      expect(screen.getByRole('button', { name: /🇨🇦 English/i })).toBeInTheDocument();
    });
  });

  describe('Side-by-Side Mode', () => {
    it('should show both languages by default', () => {
      renderWithLanguageProvider(
        <BilingualPlanView mode="side-by-side">
          <MockChild />
        </BilingualPlanView>
      );

      const contents = screen.getAllByTestId('mock-child');
      expect(contents).toHaveLength(2);
      expect(contents[0]).toHaveTextContent('Content in en');
      expect(contents[1]).toHaveTextContent('Content in fr');
    });

    it('should toggle English visibility', () => {
      renderWithLanguageProvider(
        <BilingualPlanView mode="side-by-side">
          <MockChild />
        </BilingualPlanView>
      );

      const englishToggle = screen.getAllByRole('button')[2]; // First toggle button after mode buttons
      fireEvent.click(englishToggle);

      const contents = screen.getAllByTestId('mock-child');
      expect(contents).toHaveLength(1);
      expect(contents[0]).toHaveTextContent('Content in fr');
    });

    it('should toggle French visibility', () => {
      renderWithLanguageProvider(
        <BilingualPlanView mode="side-by-side">
          <MockChild />
        </BilingualPlanView>
      );

      const frenchToggle = screen.getAllByRole('button')[3]; // Second toggle button after mode buttons
      fireEvent.click(frenchToggle);

      const contents = screen.getAllByTestId('mock-child');
      expect(contents).toHaveLength(1);
      expect(contents[0]).toHaveTextContent('Content in en');
    });
  });

  describe('Toggle Mode', () => {
    it('should show content based on language selection', () => {
      renderWithLanguageProvider(
        <BilingualPlanView mode="toggle">
          <MockChild />
        </BilingualPlanView>
      );

      // Should show one content by default
      expect(screen.getByTestId('mock-child')).toBeInTheDocument();
    });

    it('should switch to English when English button is clicked', () => {
      renderWithLanguageProvider(
        <BilingualPlanView mode="toggle">
          <MockChild />
        </BilingualPlanView>
      );

      const englishButton = screen.getByRole('button', { name: /🇨🇦 English/i });
      fireEvent.click(englishButton);

      expect(screen.getByTestId('mock-child')).toBeInTheDocument();
    });

    it('should switch to French when French button is clicked', () => {
      renderWithLanguageProvider(
        <BilingualPlanView mode="toggle">
          <MockChild />
        </BilingualPlanView>
      );

      const frenchButton = screen.getByRole('button', { name: /🇫🇷 Français/i });
      fireEvent.click(frenchButton);

      expect(screen.getByTestId('mock-child')).toBeInTheDocument();
    });
  });

  describe('Overlay Mode', () => {
    it('should show both languages by default', () => {
      renderWithLanguageProvider(
        <BilingualPlanView mode="overlay">
          <MockChild />
        </BilingualPlanView>
      );

      const contents = screen.getAllByTestId('mock-child');
      expect(contents).toHaveLength(2);
    });

    it('should toggle language visibility with overlay buttons', () => {
      renderWithLanguageProvider(
        <BilingualPlanView mode="overlay">
          <MockChild />
        </BilingualPlanView>
      );

      // Click English toggle
      const englishToggle = screen.getByTitle('Toggle English');
      fireEvent.click(englishToggle);

      const contents = screen.getAllByTestId('mock-child');
      expect(contents).toHaveLength(1);
      expect(contents[0]).toHaveTextContent('Content in fr');
    });

    it('should show message when no language is selected', () => {
      renderWithLanguageProvider(
        <BilingualPlanView mode="overlay">
          <MockChild />
        </BilingualPlanView>
      );

      // Toggle off both languages
      const englishToggle = screen.getByTitle('Toggle English');
      const frenchToggle = screen.getByTitle('Toggle French');
      fireEvent.click(englishToggle);
      fireEvent.click(frenchToggle);

      expect(screen.getByText(/Please select at least one language to view/i)).toBeInTheDocument();
    });
  });

  describe('Mode Switching', () => {
    it('should switch between modes', () => {
      renderWithLanguageProvider(
        <BilingualPlanView>
          <MockChild />
        </BilingualPlanView>
      );

      // Start in toggle mode (default)
      expect(screen.getByRole('button', { name: /🇨🇦 English/i })).toBeInTheDocument();

      // Switch to side-by-side
      const sideBySideButton = screen.getByRole('button', { name: /Side by Side/i });
      fireEvent.click(sideBySideButton);

      // Should now show both language sections
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Français')).toBeInTheDocument();

      // Switch to overlay
      const overlayButton = screen.getByRole('button', { name: /Overlay/i });
      fireEvent.click(overlayButton);

      // Should show overlay toggle buttons
      expect(screen.getByTitle('Toggle English')).toBeInTheDocument();
      expect(screen.getByTitle('Toggle French')).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should render correctly for all mode conditions', () => {
      const { rerender } = renderWithLanguageProvider(
        <BilingualPlanView mode="side-by-side">
          <MockChild />
        </BilingualPlanView>
      );

      // Test side-by-side rendering
      expect(screen.getAllByTestId('mock-child')).toHaveLength(2);

      // Test toggle rendering
      rerender(
        <LanguageProvider>
          <BilingualPlanView mode="toggle">
            <MockChild />
          </BilingualPlanView>
        </LanguageProvider>
      );
      expect(screen.getByTestId('mock-child')).toBeInTheDocument();

      // Test overlay rendering
      rerender(
        <LanguageProvider>
          <BilingualPlanView mode="overlay">
            <MockChild />
          </BilingualPlanView>
        </LanguageProvider>
      );
      expect(screen.getAllByTestId('mock-child')).toHaveLength(2);
    });
  });
});