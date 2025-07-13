import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { useHelpContent, useTutorials, useHelpAnalytics, useHelpSearch } from '../useHelp';
import { HelpProvider, useHelp } from '../../contexts/HelpContext';

// Mock the HelpContext
vi.mock('../../contexts/HelpContext', () => ({
  useHelp: vi.fn(() => ({
    state: {
      currentSection: null,
      activeFilters: [],
      searchQuery: '',
      completedTutorials: [],
      tutorialProgress: {},
      userProgress: {
        helpPagesViewed: [],
        tutorialsCompleted: [],
        totalTimeSpent: 0,
        lastVisited: null
      }
    },
    setSearchQuery: vi.fn(),
    setCurrentSection: vi.fn(),
    addFilter: vi.fn(),
    removeFilter: vi.fn(),
    clearFilters: vi.fn()
  })),
  HelpProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, {}, children)
}));

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => 
    React.createElement(HelpProvider, { children });
};

describe('useHelpContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all content when no filters are applied', () => {
    const { result } = renderHook(() => useHelpContent(), {
      wrapper: createWrapper()
    });

    expect(result.current.content.length).toBeGreaterThan(0);
    expect(result.current.totalCount).toBe(result.current.filteredCount);
  });

  it('should filter content by section', () => {
    vi.mocked(useHelp).mockReturnValue({
      state: {
        currentSection: 'getting-started',
        activeFilters: [],
        searchQuery: '',
        completedTutorials: [],
        tutorialProgress: {},
        userProgress: {
          helpPagesViewed: [],
          tutorialsCompleted: [],
          totalTimeSpent: 0,
          lastVisited: null
        }
      }
    });

    const { result } = renderHook(() => useHelpContent(), {
      wrapper: createWrapper()
    });

    result.current.content.forEach(item => {
      expect(item.section).toBe('getting-started');
    });
  });

  it('should filter content by search query', () => {
    vi.mocked(useHelp).mockReturnValue({
      state: {
        currentSection: null,
        activeFilters: [],
        searchQuery: 'ai',
        completedTutorials: [],
        tutorialProgress: {},
        userProgress: {
          helpPagesViewed: [],
          tutorialsCompleted: [],
          totalTimeSpent: 0,
          lastVisited: null
        }
      }
    });

    const { result } = renderHook(() => useHelpContent(), {
      wrapper: createWrapper()
    });

    // Should find AI-related content
    expect(result.current.content.length).toBeGreaterThan(0);
    result.current.content.forEach(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes('ai') ||
        item.content.toLowerCase().includes('ai') ||
        item.searchTerms.some(term => term.toLowerCase().includes('ai')) ||
        item.tags.some(tag => tag.toLowerCase().includes('ai'));
      expect(matchesSearch).toBe(true);
    });
  });

  it('should handle empty search query correctly', () => {
    vi.mocked(useHelp).mockReturnValue({
      state: {
        currentSection: null,
        activeFilters: [],
        searchQuery: '',
        completedTutorials: [],
        tutorialProgress: {},
        userProgress: {
          helpPagesViewed: [],
          tutorialsCompleted: [],
          totalTimeSpent: 0,
          lastVisited: null
        }
      }
    });

    const { result } = renderHook(() => useHelpContent(), {
      wrapper: createWrapper()
    });

    // Should return all content when search query is empty
    expect(result.current.content.length).toBe(result.current.totalCount);
  });

  it('should handle null search query correctly', () => {
    vi.mocked(useHelp).mockReturnValue({
      state: {
        currentSection: null,
        activeFilters: [],
        searchQuery: null,
        completedTutorials: [],
        tutorialProgress: {},
        userProgress: {
          helpPagesViewed: [],
          tutorialsCompleted: [],
          totalTimeSpent: 0,
          lastVisited: null
        }
      }
    });

    const { result } = renderHook(() => useHelpContent(), {
      wrapper: createWrapper()
    });

    // Should return all content when search query is null
    expect(result.current.content.length).toBe(result.current.totalCount);
  });

  it('should handle undefined search query correctly', () => {
    vi.mocked(useHelp).mockReturnValue({
      state: {
        currentSection: null,
        activeFilters: [],
        searchQuery: undefined,
        completedTutorials: [],
        tutorialProgress: {},
        userProgress: {
          helpPagesViewed: [],
          tutorialsCompleted: [],
          totalTimeSpent: 0,
          lastVisited: null
        }
      }
    });

    const { result } = renderHook(() => useHelpContent(), {
      wrapper: createWrapper()
    });

    // Should return all content when search query is undefined
    expect(result.current.content.length).toBe(result.current.totalCount);
  });

  it('should apply multiple filters', () => {
    vi.mocked(useHelp).mockReturnValue({
      state: {
        currentSection: null,
        activeFilters: ['beginner', 'ai'],
        searchQuery: '',
        completedTutorials: [],
        tutorialProgress: {},
        userProgress: {
          helpPagesViewed: [],
          tutorialsCompleted: [],
          totalTimeSpent: 0,
          lastVisited: null
        }
      }
    });

    const { result } = renderHook(() => useHelpContent(), {
      wrapper: createWrapper()
    });

    // Should have filtered content
    expect(result.current.content.length).toBeLessThan(result.current.totalCount);
  });
});

describe('useTutorials', () => {
  it('should return available tutorials', () => {
    const { result } = renderHook(() => useTutorials(), {
      wrapper: createWrapper()
    });

    expect(result.current.availableTutorials.length).toBeGreaterThan(0);
  });

  it('should filter tutorials by prerequisites', () => {
    vi.mocked(useHelp).mockReturnValue({
      state: {
        currentSection: null,
        activeFilters: [],
        searchQuery: '',
        completedTutorials: ['first-long-range-plan'],
        tutorialProgress: {},
        userProgress: {
          helpPagesViewed: [],
          tutorialsCompleted: [],
          totalTimeSpent: 0,
          lastVisited: null
        }
      }
    });

    const { result } = renderHook(() => useTutorials(), {
      wrapper: createWrapper()
    });

    // Should have tutorials that require 'first-long-range-plan' as prerequisite
    const advancedTutorials = result.current.availableTutorials.filter(
      t => t.prerequisites.includes('first-long-range-plan')
    );
    expect(advancedTutorials.length).toBeGreaterThan(0);
  });

  it('should calculate tutorial progress correctly', () => {
    vi.mocked(useHelp).mockReturnValue({
      state: {
        currentSection: null,
        activeFilters: [],
        searchQuery: '',
        completedTutorials: [],
        tutorialProgress: {
          'getting-started-tour': 2
        },
        userProgress: {
          helpPagesViewed: [],
          tutorialsCompleted: [],
          totalTimeSpent: 0,
          lastVisited: null
        }
      }
    });

    const { result } = renderHook(() => useTutorials(), {
      wrapper: createWrapper()
    });

    const progress = result.current.getTutorialProgress('getting-started-tour');
    expect(progress).toBe(50); // 2 out of 4 steps = 50%
  });

  it('should return 0 progress for non-existent tutorial', () => {
    const { result } = renderHook(() => useTutorials(), {
      wrapper: createWrapper()
    });

    const progress = result.current.getTutorialProgress('non-existent');
    expect(progress).toBe(0);
  });
});

describe('useHelpSearch', () => {
  it('should initialize with empty query', () => {
    const { result } = renderHook(() => useHelpSearch(), {
      wrapper: createWrapper()
    });

    expect(result.current.query).toBe('');
    expect(result.current.suggestions).toEqual([]);
  });

  it('should provide suggestions for queries longer than 1 character', () => {
    vi.useFakeTimers();
    
    const mockSetSearchQuery = vi.fn();
    
    vi.mocked(useHelp).mockReturnValue({
      state: {
        currentSection: null,
        activeFilters: [],
        searchQuery: 'ai',
        completedTutorials: [],
        tutorialProgress: {},
        userProgress: {
          helpPagesViewed: [],
          tutorialsCompleted: [],
          totalTimeSpent: 0,
          lastVisited: null
        }
      },
      setSearchQuery: mockSetSearchQuery
    });

    const { result } = renderHook(() => useHelpSearch(), {
      wrapper: createWrapper()
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.suggestions.length).toBeGreaterThan(0);
    
    vi.useRealTimers();
  });

  it('should not provide suggestions for single character queries', () => {
    vi.mocked(useHelp).mockReturnValue({
      state: {
        currentSection: null,
        activeFilters: [],
        searchQuery: 'a',
        completedTutorials: [],
        tutorialProgress: {},
        userProgress: {
          helpPagesViewed: [],
          tutorialsCompleted: [],
          totalTimeSpent: 0,
          lastVisited: null
        }
      },
      setSearchQuery: vi.fn()
    });

    const { result } = renderHook(() => useHelpSearch(), {
      wrapper: createWrapper()
    });

    expect(result.current.suggestions).toEqual([]);
  });

  it('should handle empty search query', () => {
    vi.mocked(useHelp).mockReturnValue({
      state: {
        currentSection: null,
        activeFilters: [],
        searchQuery: '',
        completedTutorials: [],
        tutorialProgress: {},
        userProgress: {
          helpPagesViewed: [],
          tutorialsCompleted: [],
          totalTimeSpent: 0,
          lastVisited: null
        }
      },
      setSearchQuery: vi.fn()
    });

    const { result } = renderHook(() => useHelpSearch(), {
      wrapper: createWrapper()
    });

    expect(result.current.suggestions).toEqual([]);
  });

  it('should provide popular searches', () => {
    const { result } = renderHook(() => useHelpSearch(), {
      wrapper: createWrapper()
    });

    expect(result.current.popularSearches).toContain('getting started');
    expect(result.current.popularSearches).toContain('ai prompts');
  });
});

describe('useHelpAnalytics', () => {
  it('should calculate analytics correctly', () => {
    vi.mocked(useHelp).mockReturnValue({
      state: {
        currentSection: null,
        activeFilters: [],
        searchQuery: '',
        completedTutorials: [],
        tutorialProgress: {},
        userProgress: {
          helpPagesViewed: ['page1', 'page2', 'page3'],
          tutorialsCompleted: ['tutorial1'],
          totalTimeSpent: 10,
          lastVisited: new Date()
        }
      }
    });

    const { result } = renderHook(() => useHelpAnalytics(), {
      wrapper: createWrapper()
    });

    expect(result.current.totalPagesViewed).toBe(3);
    expect(result.current.totalTutorialsCompleted).toBe(1);
    expect(result.current.totalTimeSpent).toBe(10);
    expect(result.current.engagementScore).toBeGreaterThan(0);
    expect(result.current.streak).toBe(3);
  });

  it('should cap engagement score at 100', () => {
    vi.mocked(useHelp).mockReturnValue({
      state: {
        currentSection: null,
        activeFilters: [],
        searchQuery: '',
        completedTutorials: [],
        tutorialProgress: {},
        userProgress: {
          helpPagesViewed: Array(50).fill('page'),
          tutorialsCompleted: Array(10).fill('tutorial'),
          totalTimeSpent: 100,
          lastVisited: new Date()
        }
      }
    });

    const { result } = renderHook(() => useHelpAnalytics(), {
      wrapper: createWrapper()
    });

    expect(result.current.engagementScore).toBe(100);
  });
});