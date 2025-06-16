import { jest } from '@jest/globals';
import { getResourceSuggestions } from '../services/resourceSuggestions';
import { prisma } from '../prisma';

// Create a mock for the findUnique method
const mockFindUnique = jest.fn();

describe('Resource Suggestions Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on the prisma.activity.findUnique method and replace it with our mock
    jest.spyOn(prisma.activity, 'findUnique').mockImplementation(mockFindUnique);
  });

  it('should return empty array for non-existent activity', async () => {
    mockFindUnique.mockResolvedValue(null);

    const suggestions = await getResourceSuggestions(999);
    expect(suggestions).toEqual([]);
  });

  it('should return suggestions for French activity with CO outcome', async () => {
    const mockActivity = {
      id: 1,
      title: 'French Listening Activity',
      outcomes: [
        {
          outcome: {
            id: 'outcome1',
            code: 'CO.1',
          },
        },
      ],
      milestone: {
        subject: {
          name: 'Français',
        },
      },
    };

    mockFindUnique.mockResolvedValue(mockActivity);

    const suggestions = await getResourceSuggestions(1);

    expect(suggestions).toHaveLength(2);

    // Check that we get oral communication suggestions
    const audioSuggestion = suggestions.find((s) => s.type === 'audio');
    expect(audioSuggestion).toBeDefined();
    expect(audioSuggestion?.title).toContain('Les Animaux');
    expect(audioSuggestion?.rationale).toContain('CO.1');

    const linkSuggestion = suggestions.find((s) => s.type === 'link');
    expect(linkSuggestion).toBeDefined();
    expect(linkSuggestion?.title).toContain('Interactive');
  });

  it('should return suggestions for reading outcomes', async () => {
    const mockActivity = {
      id: 2,
      title: 'Reading Comprehension',
      outcomes: [
        {
          outcome: {
            id: 'outcome2',
            code: 'CL.2',
          },
        },
      ],
      milestone: {
        subject: {
          name: 'Français',
        },
      },
    };

    mockFindUnique.mockResolvedValue(mockActivity);

    const suggestions = await getResourceSuggestions(2);

    expect(suggestions.length).toBeGreaterThan(0);

    // Check that we get reading-related suggestions
    const videoSuggestion = suggestions.find((s) => s.type === 'video');
    expect(videoSuggestion).toBeDefined();
    expect(videoSuggestion?.rationale).toContain('CL.2');
  });

  it('should return keyword-based suggestions', async () => {
    const mockActivity = {
      id: 3,
      title: 'Syllable Counting Game',
      outcomes: [],
      milestone: {
        subject: {
          name: 'Français',
        },
      },
    };

    mockFindUnique.mockResolvedValue(mockActivity);

    const suggestions = await getResourceSuggestions(3);

    expect(suggestions.length).toBeGreaterThan(0);

    // Check that we get syllable-related suggestions
    const worksheetSuggestion = suggestions.find(
      (s) => s.type === 'worksheet' && s.title.includes('Syllable'),
    );
    expect(worksheetSuggestion).toBeDefined();
  });

  it('should limit suggestions to 5 items', async () => {
    const mockActivity = {
      id: 4,
      title: 'Song and Number Activity',
      outcomes: [
        {
          outcome: {
            id: 'outcome1',
            code: 'CO.1',
          },
        },
        {
          outcome: {
            id: 'outcome2',
            code: 'CL.1',
          },
        },
      ],
      milestone: {
        subject: {
          name: 'Français',
        },
      },
    };

    mockFindUnique.mockResolvedValue(mockActivity);

    const suggestions = await getResourceSuggestions(4);

    expect(suggestions.length).toBeLessThanOrEqual(5);
  });
});
