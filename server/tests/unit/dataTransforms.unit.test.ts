import { describe, it, expect } from '@jest/globals';

describe('Data Transformation Unit Tests', () => {
  describe('Activity Data Transformations', () => {
    const createRawActivity = (overrides = {}) => ({
      id: 1,
      title: 'Test Activity',
      titleEn: 'Test Activity EN',
      titleFr: 'Test Activity FR',
      activityType: 'LESSON',
      milestoneId: 1,
      orderIndex: 0,
      durationMins: 60,
      privateNote: 'Private note',
      privateNoteEn: 'Private note EN',
      privateNoteFr: 'Private note FR',
      publicNote: 'Public note',
      publicNoteEn: 'Public note EN',
      publicNoteFr: 'Public note FR',
      materialsText: 'paper, pencils',
      materialsTextEn: 'paper, pencils',
      materialsTextFr: 'papier, crayons',
      tags: ['test', 'unit'],
      isSubFriendly: true,
      isFallback: false,
      completedAt: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      userId: 1,
      ...overrides,
    });

    it('should extract materials list from materialsText', () => {
      const activity = createRawActivity({
        materialsText: 'paper, pencils, rulers, erasers',
      });

      const extractMaterialsList = (text: string | null): string[] => {
        if (!text) return [];
        return text
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      };

      const materialsList = extractMaterialsList(activity.materialsText);

      expect(materialsList).toEqual(['paper', 'pencils', 'rulers', 'erasers']);
    });

    it('should calculate completion status', () => {
      const calculateCompletionStatus = (completedAt: Date | null): 'completed' | 'pending' => {
        return completedAt ? 'completed' : 'pending';
      };

      const pendingActivity = createRawActivity({ completedAt: null });
      const completedActivity = createRawActivity({ completedAt: new Date() });

      expect(calculateCompletionStatus(pendingActivity.completedAt)).toBe('pending');
      expect(calculateCompletionStatus(completedActivity.completedAt)).toBe('completed');
    });

    it('should format duration for display', () => {
      const formatDuration = (minutes: number | null): string => {
        if (!minutes) return 'No duration set';
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const remainingMins = minutes % 60;
        if (remainingMins === 0) return `${hours}h`;
        return `${hours}h ${remainingMins}min`;
      };

      expect(formatDuration(null)).toBe('No duration set');
      expect(formatDuration(30)).toBe('30 min');
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(90)).toBe('1h 30min');
      expect(formatDuration(150)).toBe('2h 30min');
      expect(formatDuration(180)).toBe('3h');
    });

    it('should transform activity for API response', () => {
      const transformActivityForAPI = (activity: unknown, language = 'en') => {
        const titleKey = language === 'fr' ? 'titleFr' : 'titleEn';
        const noteKey = language === 'fr' ? 'publicNoteFr' : 'publicNoteEn';

        return {
          id: activity.id,
          title: activity[titleKey] || activity.title,
          type: activity.activityType,
          duration: activity.durationMins,
          completed: !!activity.completedAt,
          materials: activity.materialsText?.split(',').map((m: string) => m.trim()) || [],
          tags: activity.tags || [],
          isSubFriendly: activity.isSubFriendly,
          note: activity[noteKey] || activity.publicNote,
          orderIndex: activity.orderIndex,
        };
      };

      const activity = createRawActivity();

      const englishTransform = transformActivityForAPI(activity, 'en');
      expect(englishTransform.title).toBe('Test Activity EN');
      expect(englishTransform.note).toBe('Public note EN');
      expect(englishTransform.materials).toEqual(['paper', 'pencils']);
      expect(englishTransform.completed).toBe(false);

      const frenchTransform = transformActivityForAPI(activity, 'fr');
      expect(frenchTransform.title).toBe('Test Activity FR');
      expect(frenchTransform.note).toBe('Public note FR');
    });
  });

  describe('Milestone Data Transformations', () => {
    const createRawMilestone = (overrides = {}) => ({
      id: 1,
      title: 'Test Milestone',
      titleEn: 'Test Milestone EN',
      titleFr: 'Test Milestone FR',
      subjectId: 1,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      targetDate: new Date('2024-01-31'),
      estHours: 20,
      description: 'Test description',
      descriptionEn: 'Test description EN',
      descriptionFr: 'Test description FR',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      userId: 1,
      activities: [],
      ...overrides,
    });

    it('should calculate milestone progress', () => {
      const calculateProgress = (activities: unknown[]): number => {
        if (activities.length === 0) return 0;
        const completed = activities.filter((a) => a.completedAt).length;
        return completed / activities.length;
      };

      const noActivities = [];
      const allCompleted = [
        { id: 1, completedAt: new Date() },
        { id: 2, completedAt: new Date() },
      ];
      const partialCompleted = [
        { id: 1, completedAt: new Date() },
        { id: 2, completedAt: null },
        { id: 3, completedAt: new Date() },
      ];

      expect(calculateProgress(noActivities)).toBe(0);
      expect(calculateProgress(allCompleted)).toBe(1);
      expect(calculateProgress(partialCompleted)).toBeCloseTo(0.667, 2);
    });

    it('should calculate days remaining', () => {
      const calculateDaysRemaining = (endDate: Date | null): number | null => {
        if (!endDate) return null;
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      };

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);

      expect(calculateDaysRemaining(null)).toBeNull();
      expect(calculateDaysRemaining(futureDate)).toBe(7);
      expect(calculateDaysRemaining(pastDate)).toBe(-3);
    });

    it('should determine milestone status', () => {
      const getMilestoneStatus = (
        endDate: Date | null,
        progress: number,
      ): 'completed' | 'in-progress' | 'overdue' | 'not-started' => {
        if (progress === 1) return 'completed';
        if (!endDate) {
          return progress > 0 ? 'in-progress' : 'not-started';
        }

        const today = new Date();
        const isOverdue = endDate < today;

        if (isOverdue && progress === 0) return 'overdue';
        if (isOverdue) return 'in-progress'; // Overdue but some progress
        return progress > 0 ? 'in-progress' : 'not-started';
      };

      const today = new Date();
      const future = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const past = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      expect(getMilestoneStatus(null, 0)).toBe('not-started');
      expect(getMilestoneStatus(null, 0.5)).toBe('in-progress');
      expect(getMilestoneStatus(null, 1)).toBe('completed');
      expect(getMilestoneStatus(future, 0)).toBe('not-started');
      expect(getMilestoneStatus(future, 0.5)).toBe('in-progress');
      expect(getMilestoneStatus(future, 1)).toBe('completed');
      expect(getMilestoneStatus(past, 0)).toBe('overdue');
      expect(getMilestoneStatus(past, 0.5)).toBe('in-progress');
      expect(getMilestoneStatus(past, 1)).toBe('completed');
    });

    it('should transform milestone for dashboard display', () => {
      const transformMilestoneForDashboard = (milestone: unknown) => {
        const activities = milestone.activities || [];
        const progress =
          activities.length === 0
            ? 0
            : activities.filter((a: unknown) => a.completedAt).length / activities.length;

        const today = new Date();
        const daysRemaining = milestone.endDate
          ? Math.ceil((milestone.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        return {
          id: milestone.id,
          title: milestone.title,
          progress: Math.round(progress * 100),
          daysRemaining,
          isOverdue: milestone.endDate ? milestone.endDate < today : false,
          totalActivities: activities.length,
          completedActivities: activities.filter((a: unknown) => a.completedAt).length,
          estHours: milestone.estHours,
        };
      };

      const milestone = createRawMilestone({
        activities: [
          { id: 1, completedAt: new Date() },
          { id: 2, completedAt: null },
          { id: 3, completedAt: new Date() },
        ],
        endDate: new Date('2024-12-31'),
      });

      const transformed = transformMilestoneForDashboard(milestone);

      expect(transformed.progress).toBe(67); // 2/3 * 100
      expect(transformed.totalActivities).toBe(3);
      expect(transformed.completedActivities).toBe(2);
      expect(transformed.estHours).toBe(20);
    });
  });

  describe('Date and Time Transformations', () => {
    it('should format dates for different locales', () => {
      // Use UTC to avoid timezone issues
      const testDate = new Date(Date.UTC(2024, 2, 15)); // Month is 0-indexed, so 2 = March

      // Use toLocaleDateString with UTC timezone to get consistent results
      const formatDateForLocaleUTC = (date: Date, locale: string): string => {
        return date.toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC',
        });
      };

      expect(formatDateForLocaleUTC(testDate, 'en-US')).toBe('March 15, 2024');
      expect(formatDateForLocaleUTC(testDate, 'fr-FR')).toBe('15 mars 2024');
    });

    it('should calculate relative time', () => {
      const getRelativeTime = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'today';
        if (diffDays === 1) return 'yesterday';
        if (diffDays === -1) return 'tomorrow';
        if (diffDays > 0) return `${diffDays} days ago`;
        return `in ${Math.abs(diffDays)} days`;
      };

      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      expect(getRelativeTime(today)).toBe('today');
      expect(getRelativeTime(yesterday)).toBe('yesterday');
      expect(getRelativeTime(tomorrow)).toBe('tomorrow');
      expect(getRelativeTime(lastWeek)).toBe('7 days ago');
      expect(getRelativeTime(nextWeek)).toBe('in 7 days');
    });

    it('should convert minutes to time slots', () => {
      const minutesToTimeSlot = (startMin: number, endMin: number): string => {
        const formatTime = (minutes: number): string => {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          const period = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
          return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
        };

        return `${formatTime(startMin)} - ${formatTime(endMin)}`;
      };

      expect(minutesToTimeSlot(480, 540)).toBe('8:00 AM - 9:00 AM');
      expect(minutesToTimeSlot(720, 780)).toBe('12:00 PM - 1:00 PM');
      expect(minutesToTimeSlot(810, 870)).toBe('1:30 PM - 2:30 PM');
      expect(minutesToTimeSlot(0, 60)).toBe('12:00 AM - 1:00 AM');
    });
  });

  describe('Aggregation Transformations', () => {
    it('should aggregate outcome coverage by subject', () => {
      const aggregateOutcomeCoverageBySubject = (coverage: unknown[]): Record<string, unknown> => {
        const subjects: Record<string, unknown> = {};

        coverage.forEach((item) => {
          const subject = item.outcome.subject;
          if (!subjects[subject]) {
            subjects[subject] = {
              total: 0,
              covered: 0,
              partial: 0,
              uncovered: 0,
            };
          }

          subjects[subject].total++;
          subjects[subject][item.status]++;
        });

        // Calculate percentages
        Object.keys(subjects).forEach((subject) => {
          const data = subjects[subject];
          data.coveragePercentage =
            data.total > 0
              ? Math.round(((data.covered + data.partial * 0.5) / data.total) * 100)
              : 0;
        });

        return subjects;
      };

      const coverageData = [
        { outcome: { subject: 'FRA' }, status: 'covered' },
        { outcome: { subject: 'FRA' }, status: 'partial' },
        { outcome: { subject: 'FRA' }, status: 'uncovered' },
        { outcome: { subject: 'MAT' }, status: 'covered' },
        { outcome: { subject: 'MAT' }, status: 'covered' },
      ];

      const result = aggregateOutcomeCoverageBySubject(coverageData);

      expect(result.FRA.total).toBe(3);
      expect(result.FRA.covered).toBe(1);
      expect(result.FRA.partial).toBe(1);
      expect(result.FRA.uncovered).toBe(1);
      expect(result.FRA.coveragePercentage).toBe(50); // (1 + 0.5) / 3 * 100

      expect(result.MAT.total).toBe(2);
      expect(result.MAT.covered).toBe(2);
      expect(result.MAT.coveragePercentage).toBe(100);
    });

    it('should group activities by week', () => {
      const groupActivitiesByWeek = (activities: unknown[]): Record<string, unknown[]> => {
        const getWeekKey = (date: Date): string => {
          const startOfWeek = new Date(date);
          const day = startOfWeek.getDay();
          const diff = startOfWeek.getDate() - day;
          startOfWeek.setDate(diff);
          return startOfWeek.toISOString().split('T')[0];
        };

        const groups: Record<string, unknown[]> = {};

        activities.forEach((activity) => {
          if (activity.completedAt) {
            const weekKey = getWeekKey(new Date(activity.completedAt));
            if (!groups[weekKey]) {
              groups[weekKey] = [];
            }
            groups[weekKey].push(activity);
          }
        });

        return groups;
      };

      const activities = [
        { id: 1, title: 'Activity 1', completedAt: new Date('2024-01-01') },
        { id: 2, title: 'Activity 2', completedAt: new Date('2024-01-03') },
        { id: 3, title: 'Activity 3', completedAt: new Date('2024-01-08') },
        { id: 4, title: 'Activity 4', completedAt: null },
      ];

      const grouped = groupActivitiesByWeek(activities);

      // Should have 2 weeks with activities
      expect(Object.keys(grouped)).toHaveLength(2);

      // Check that activities are grouped correctly
      const weekKeys = Object.keys(grouped).sort();
      expect(grouped[weekKeys[0]]).toHaveLength(2); // Jan 1 and Jan 3
      expect(grouped[weekKeys[1]]).toHaveLength(1); // Jan 8
    });
  });
});
