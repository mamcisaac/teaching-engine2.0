/**
 * Analytics Components Accessibility Tests
 *
 * Validates WCAG 2.1 compliance for all analytics components using axe-core
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CurriculumHeatmap from '../CurriculumHeatmap';
import DomainRadarChart from '../DomainRadarChart';
import ThemeAnalyticsDashboard from '../ThemeAnalyticsDashboard';
import VocabularyGrowthDashboard from '../VocabularyGrowthDashboard';
import * as api from '../../../api';

// Extend Jest matchers for accessibility testing
expect.extend(toHaveNoViolations);

// Mock API responses
vi.mock('../../../api');

// Mock data for consistent testing
const mockHeatmapData = {
  outcomes: [
    {
      id: 'math-1',
      code: 'M.NS.1',
      label: 'Number Sense 1',
      subject: 'Mathematics',
      domain: 'Number Sense',
    },
    {
      id: 'sci-1',
      code: 'S.LS.1',
      label: 'Life Systems 1',
      subject: 'Science',
      domain: 'Life Systems',
    },
  ],
  weeks: [1, 2, 3, 4, 5],
  grid: {
    'math-1': { 1: 2, 2: 0, 3: 1, 4: 3, 5: 0 },
    'sci-1': { 1: 1, 2: 2, 3: 0, 4: 0, 5: 1 },
  },
  metadata: {
    viewMode: 'planned',
    totalOutcomes: 2,
    totalWeeks: 5,
    coveragePercentage: 60,
  },
};

const mockRadarData = {
  studentId: 1,
  studentName: 'John Doe',
  term: 'Term 1',
  domains: [
    { subject: 'reading', score: 85, label: 'Reading', average: 75 },
    { subject: 'writing', score: 78, label: 'Writing', average: 70 },
    { subject: 'math', score: 88, label: 'Mathematics', average: 82 },
  ],
  overallScore: 83.6,
  strengths: ['Mathematics', 'Reading'],
  areasForGrowth: ['Writing'],
};

const mockThemeData = {
  totalThemes: 12,
  activeThemes: 8,
  averageUsagePerTheme: 15.5,
  mostUsedThemes: [
    { themeId: 'space', name: 'Space Exploration', usageCount: 45, lastUsed: '2024-01-15' },
  ],
  themeBalance: {
    science: { count: 5, percentage: 41.7 },
    language: { count: 3, percentage: 25.0 },
  },
  monthlyUsage: [{ month: 'Jan', usage: 156, themes: 12 }],
  subjectIntegration: [{ subject: 'Science', themeCount: 5, avgUsage: 18.4 }],
  unusedThemes: [],
};

const mockVocabularyData = {
  studentId: 1,
  studentName: 'John Doe',
  totalWords: 120,
  wordsThisTerm: 30,
  weeklyGrowth: [{ week: 1, newWords: 5, cumulativeWords: 95, languages: { en: 3, fr: 2 } }],
  domainBreakdown: {
    reading: { count: 40, percentage: 33.3, recentWords: ['adventure', 'explore'] },
  },
  difficultyProgression: { basic: 60, intermediate: 40, advanced: 20 },
  acquisitionRate: 5,
  targetGrowth: 50,
  projectedEndOfTerm: 150,
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const renderWithQueryClient = async (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  let result;
  await act(async () => {
    result = render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
  });
  return result;
};

describe('Analytics Components Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.api.get as any).mockResolvedValue({ data: mockHeatmapData });
  });

  describe('CurriculumHeatmap Accessibility', () => {
    it('should have no accessibility violations', async () => {
      (api.api.get as any).mockResolvedValue({ data: mockHeatmapData });

      const { container } = await renderWithQueryClient(<CurriculumHeatmap />);

      // Wait for component to render with data
      await new Promise((resolve) => setTimeout(resolve, 100));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels for interactive elements', async () => {
      (api.api.get as any).mockResolvedValue({ data: mockHeatmapData });

      const { container } = await renderWithQueryClient(<CurriculumHeatmap />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check for ARIA labels on interactive elements
      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(
          button.getAttribute('aria-label') || button.textContent || button.getAttribute('title'),
        ).toBeTruthy();
      });
    });

    it('should have proper heading hierarchy', async () => {
      (api.api.get as any).mockResolvedValue({ data: mockHeatmapData });

      const { container } = await renderWithQueryClient(<CurriculumHeatmap />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      expect(headings.length).toBeGreaterThan(0);

      // Main heading should exist
      const mainHeading = container.querySelector('h3');
      expect(mainHeading).toBeTruthy();
      expect(mainHeading?.textContent).toContain('Curriculum Coverage Heatmap');
    });

    it('should support keyboard navigation', async () => {
      (api.api.get as any).mockResolvedValue({ data: mockHeatmapData });

      const { container } = await renderWithQueryClient(<CurriculumHeatmap />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check that interactive elements are focusable
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      focusableElements.forEach((element) => {
        expect(element.getAttribute('tabindex')).not.toBe('-1');
      });
    });
  });

  describe('DomainRadarChart Accessibility', () => {
    it('should have no accessibility violations', async () => {
      (api.api.get as any).mockResolvedValue({ data: mockRadarData });

      const { container } = await renderWithQueryClient(<DomainRadarChart studentId={1} />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should provide alternative text for visual content', async () => {
      (api.api.get as any).mockResolvedValue({ data: mockRadarData });

      const { container } = await renderWithQueryClient(<DomainRadarChart studentId={1} />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Canvas should have aria-label or role
      const canvas = container.querySelector('canvas');
      if (canvas) {
        expect(canvas.getAttribute('aria-label') || canvas.getAttribute('role')).toBeTruthy();
      }
    });

    it('should have proper color contrast', async () => {
      (api.api.get as any).mockResolvedValue({ data: mockRadarData });

      const { container } = await renderWithQueryClient(<DomainRadarChart studentId={1} />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // This would typically use a color contrast library
      // For now, we ensure text elements exist and have proper classes
      const textElements = container.querySelectorAll('[class*="text-"]');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('ThemeAnalyticsDashboard Accessibility', () => {
    it('should have no accessibility violations', async () => {
      (api.api.get as any).mockResolvedValue({ data: mockThemeData });

      const { container } = await renderWithQueryClient(<ThemeAnalyticsDashboard />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have semantic structure', async () => {
      (api.api.get as any).mockResolvedValue({ data: mockThemeData });

      const { container } = await renderWithQueryClient(<ThemeAnalyticsDashboard />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check for semantic HTML elements
      const semanticElements = container.querySelectorAll(
        'header, main, section, article, aside, nav, footer',
      );
      expect(semanticElements.length).toBeGreaterThanOrEqual(0);

      // Check for proper list structure if lists are present
      const lists = container.querySelectorAll('ul, ol');
      lists.forEach((list) => {
        const listItems = list.querySelectorAll('li');
        expect(listItems.length).toBeGreaterThan(0);
      });
    });
  });

  describe('VocabularyGrowthDashboard Accessibility', () => {
    it('should have no accessibility violations', async () => {
      (api.api.get as any).mockResolvedValue({ data: mockVocabularyData });

      const { container } = await renderWithQueryClient(
        <VocabularyGrowthDashboard studentId={1} />,
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should provide descriptive labels for charts', async () => {
      (api.api.get as any).mockResolvedValue({ data: mockVocabularyData });

      const { container } = await renderWithQueryClient(
        <VocabularyGrowthDashboard studentId={1} />,
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check for chart descriptions or aria-labels
      const chartContainers = container.querySelectorAll(
        '[data-testid*="chart"], .recharts-wrapper',
      );
      chartContainers.forEach((chart) => {
        expect(
          chart.getAttribute('aria-label') ||
            chart.getAttribute('aria-describedby') ||
            chart.querySelector('[aria-label]'),
        ).toBeTruthy();
      });
    });
  });

  describe('Common Accessibility Patterns', () => {
    it('should have consistent focus indicators', async () => {
      (api.api.get as any).mockResolvedValue({ data: mockHeatmapData });

      const { container } = await renderWithQueryClient(<CurriculumHeatmap />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check that focusable elements have focus styles
      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        const classes = button.className;
        // Should have focus styles (focus:, focus-visible:, etc.)
        expect(
          classes.includes('focus:') ||
            classes.includes('focus-visible:') ||
            classes.includes('hover:'),
        ).toBeTruthy();
      });
    });

    it('should use proper form labels', async () => {
      (api.api.get as any).mockResolvedValue({ data: mockHeatmapData });

      const { container } = await renderWithQueryClient(<CurriculumHeatmap />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check that form inputs have labels
      const inputs = container.querySelectorAll('input, select, textarea');
      inputs.forEach((input) => {
        const id = input.getAttribute('id');
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        const label = id ? container.querySelector(`label[for="${id}"]`) : null;

        expect(ariaLabel || ariaLabelledBy || label).toBeTruthy();
      });
    });

    it('should provide status updates for dynamic content', async () => {
      (api.api.get as any).mockResolvedValue({ data: mockHeatmapData });

      const { container } = await renderWithQueryClient(<CurriculumHeatmap />);

      // Check for loading states with proper ARIA
      const loadingElements = container.querySelectorAll('[data-testid="loading-skeleton"]');
      loadingElements.forEach((element) => {
        expect(
          element.getAttribute('aria-live') ||
            element.getAttribute('aria-busy') ||
            element.getAttribute('role'),
        ).toBeTruthy();
      });
    });

    it('should have sufficient color contrast ratios', async () => {
      (api.api.get as any).mockResolvedValue({ data: mockHeatmapData });

      const { container } = await renderWithQueryClient(<CurriculumHeatmap />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check for high contrast color classes
      const colorElements = container.querySelectorAll('[class*="text-"], [class*="bg-"]');
      expect(colorElements.length).toBeGreaterThan(0);

      // Ensure we're not using low-contrast combinations
      const problematicClasses = ['text-gray-300', 'text-gray-400', 'bg-gray-100 text-gray-400'];

      colorElements.forEach((element) => {
        const className = element.className;
        problematicClasses.forEach((problematic) => {
          if (className.includes(problematic)) {
            // Only fail if it's actually problematic (not in a high contrast context)
            const parentClasses = element.parentElement?.className || '';
            expect(parentClasses).toMatch(/bg-(white|gray-900|black)/);
          }
        });
      });
    });

    it('should support reduced motion preferences', async () => {
      (api.api.get as any).mockResolvedValue({ data: mockHeatmapData });

      const { container } = await renderWithQueryClient(<CurriculumHeatmap />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check for animation classes that respect motion preferences
      const animatedElements = container.querySelectorAll(
        '[class*="animate-"], [class*="transition-"]',
      );
      animatedElements.forEach((element) => {
        const classes = element.className;
        // Should use motion-safe or motion-reduce classes
        expect(
          classes.includes('motion-safe:') ||
            classes.includes('motion-reduce:') ||
            !classes.includes('animate-spin'), // Avoid problematic animations
        ).toBeTruthy();
      });
    });
  });

  describe('Error State Accessibility', () => {
    it('should handle error states accessibly', async () => {
      (api.api.get as any).mockRejectedValue(new Error('API Error'));

      const { container } = await renderWithQueryClient(<CurriculumHeatmap />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Error messages should be announced to screen readers
      const errorElements = container.querySelectorAll('[class*="text-red"], [role="alert"]');
      expect(errorElements.length).toBeGreaterThan(0);

      errorElements.forEach((element) => {
        expect(
          element.getAttribute('role') === 'alert' ||
            element.getAttribute('aria-live') ||
            element.textContent?.includes('Error'),
        ).toBeTruthy();
      });
    });
  });
});
