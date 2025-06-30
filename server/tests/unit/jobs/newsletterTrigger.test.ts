import { jest } from '@jest/globals';
import { checkNewsletterTriggers, TermMidpoint, TERM_MIDPOINTS } from '../../../src/jobs/newsletterTrigger';

// Mock console.warn to capture output
const mockWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('Newsletter Trigger Job', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockWarn.mockRestore();
  });

  describe('checkNewsletterTriggers', () => {
    it('should trigger warning for current date midpoint', async () => {
      const today = new Date();
      const testMidpoints: TermMidpoint[] = [
        { term: 'Test Term', date: today },
        { term: 'Future Term', date: new Date(Date.now() + 86400000) }, // Tomorrow
      ];

      await checkNewsletterTriggers(testMidpoints);

      expect(mockWarn).toHaveBeenCalledWith(
        'Newsletter trigger for Test Term - Notification model archived'
      );
      expect(mockWarn).toHaveBeenCalledTimes(1);
    });

    it('should not trigger for non-matching dates', async () => {
      const testMidpoints: TermMidpoint[] = [
        { term: 'Past Term', date: new Date(Date.now() - 86400000) }, // Yesterday
        { term: 'Future Term', date: new Date(Date.now() + 86400000) }, // Tomorrow
      ];

      await checkNewsletterTriggers(testMidpoints);

      expect(mockWarn).not.toHaveBeenCalled();
    });

    it('should use default midpoints when none provided', async () => {
      await checkNewsletterTriggers();

      // Should check all default midpoints
      expect(TERM_MIDPOINTS).toHaveLength(3);
      expect(TERM_MIDPOINTS.map(mp => mp.term)).toEqual(['Term 1', 'Term 2', 'Term 3']);

      // No warnings expected since no dates match today
      expect(mockWarn).not.toHaveBeenCalled();
    });

    it('should handle multiple matching dates', async () => {
      const today = new Date();
      const testMidpoints: TermMidpoint[] = [
        { term: 'Term A', date: today },
        { term: 'Term B', date: today },
        { term: 'Term C', date: new Date(Date.now() + 86400000) }, // Tomorrow
      ];

      await checkNewsletterTriggers(testMidpoints);

      expect(mockWarn).toHaveBeenCalledWith(
        'Newsletter trigger for Term A - Notification model archived'
      );
      expect(mockWarn).toHaveBeenCalledWith(
        'Newsletter trigger for Term B - Notification model archived'
      );
      expect(mockWarn).toHaveBeenCalledTimes(2);
    });

    it('should handle empty midpoints array', async () => {
      await checkNewsletterTriggers([]);

      expect(mockWarn).not.toHaveBeenCalled();
    });

    it('should compare dates correctly ignoring time', async () => {
      const today = new Date();
      const sameDayDifferentTime = new Date(today);
      sameDayDifferentTime.setHours(23, 59, 59, 999); // End of day

      const testMidpoints: TermMidpoint[] = [
        { term: 'Same Day Different Time', date: sameDayDifferentTime },
      ];

      await checkNewsletterTriggers(testMidpoints);

      expect(mockWarn).toHaveBeenCalledWith(
        'Newsletter trigger for Same Day Different Time - Notification model archived'
      );
    });
  });

  describe('TERM_MIDPOINTS constant', () => {
    it('should have correct structure and data', () => {
      expect(TERM_MIDPOINTS).toHaveLength(3);
      
      const termNames = TERM_MIDPOINTS.map(mp => mp.term);
      expect(termNames).toEqual(['Term 1', 'Term 2', 'Term 3']);

      // Verify all dates are valid Date objects
      TERM_MIDPOINTS.forEach(mp => {
        expect(mp.date).toBeDefined();
        expect(typeof mp.date.getTime).toBe('function');
        expect(mp.date.getTime()).not.toBeNaN();
      });

      // Verify dates are reasonable (not in the distant past/future)
      const currentYear = new Date().getFullYear();
      TERM_MIDPOINTS.forEach(mp => {
        const year = mp.date.getFullYear();
        expect(year).toBeGreaterThanOrEqual(currentYear - 1);
        expect(year).toBeLessThanOrEqual(currentYear + 1);
      });
    });

    it('should have dates in chronological order within academic year', () => {
      // Term 1 (October) should be before Term 2 (February next year)
      // Term 2 (February) should be before Term 3 (May)
      expect(TERM_MIDPOINTS[0].term).toBe('Term 1');
      expect(TERM_MIDPOINTS[1].term).toBe('Term 2');
      expect(TERM_MIDPOINTS[2].term).toBe('Term 3');

      // October should be month 9 (0-based), February month 1, May month 4
      expect(TERM_MIDPOINTS[0].date.getMonth()).toBe(9); // October
      expect(TERM_MIDPOINTS[1].date.getMonth()).toBe(1); // February
      expect(TERM_MIDPOINTS[2].date.getMonth()).toBe(4); // May
    });
  });
});