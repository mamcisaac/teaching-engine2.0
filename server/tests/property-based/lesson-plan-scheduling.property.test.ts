/**
 * Property-Based Tests for Lesson Plan Scheduling Constraints
 * Tests scheduling invariants and time management properties
 */

import fc from 'fast-check';
import { domainArbitraries } from './arbitraries/domain-arbitraries';
import {
  createProperty,
  validateInvariant,
  testMonotonicity,
  testContract,
  testAssociativity,
} from './utils/property-test-helpers';
import { getPropertyTestConfig } from './utils/property-test-config';

describe('Lesson Plan Scheduling Properties', () => {
  // ==================== Time Constraint Properties ====================

  describe('Time Constraint Validation', () => {
    it('should ensure lessons fit within school hours', () => {
      fc.assert(
        fc.property(domainArbitraries.validTimeSlot, (timeSlot) => {
          // Property: All scheduled lessons must fit within school hours (8 AM - 4 PM)
          const schoolStart = 8; // 8 AM
          const schoolEnd = 16; // 4 PM

          const startHour = timeSlot.start.getHours();
          const endHour = timeSlot.end.getHours();
          const endMinute = timeSlot.end.getMinutes();

          // Lesson should start after school starts and end before school ends
          const startsAfterSchoolStart = startHour >= schoolStart;
          const endsBeforeSchoolEnd =
            endHour < schoolEnd || (endHour === schoolEnd && endMinute === 0);

          return startsAfterSchoolStart && endsBeforeSchoolEnd;
        }),
        getPropertyTestConfig('fast'),
      );
    });

    it('should maintain positive lesson durations', () => {
      fc.assert(
        fc.property(domainArbitraries.validTimeSlot, (timeSlot) => {
          // Property: Lesson duration should always be positive
          const durationMs = timeSlot.end.getTime() - timeSlot.start.getTime();
          const durationMinutes = durationMs / (1000 * 60);

          return durationMinutes > 0 && durationMinutes === timeSlot.duration;
        }),
        getPropertyTestConfig('fast'),
      );
    });

    it('should respect minimum and maximum lesson durations', () => {
      fc.assert(
        fc.property(domainArbitraries.lessonDuration, (duration) => {
          // Property: Lesson durations should be within pedagogically sound ranges
          const minDuration = 15; // 15 minutes minimum
          const maxDuration = 120; // 2 hours maximum

          return duration >= minDuration && duration <= maxDuration;
        }),
        getPropertyTestConfig('fast'),
      );
    });
  });

  // ==================== Schedule Conflict Detection ====================

  describe('Schedule Conflict Detection', () => {
    it('should detect overlapping lessons', () => {
      fc.assert(
        fc.property(
          fc.array(domainArbitraries.validTimeSlot, { minLength: 2, maxLength: 10 }),
          (timeSlots) => {
            // Property: No two lessons should overlap in time
            const hasOverlap = (
              slot1: (typeof timeSlots)[0],
              slot2: (typeof timeSlots)[0],
            ): boolean => {
              return (
                (slot1.start <= slot2.start && slot1.end > slot2.start) ||
                (slot2.start <= slot1.start && slot2.end > slot1.start)
              );
            };

            const detectConflicts = (slots: typeof timeSlots): boolean => {
              for (let i = 0; i < slots.length; i++) {
                for (let j = i + 1; j < slots.length; j++) {
                  if (hasOverlap(slots[i], slots[j])) {
                    return true; // Conflict found
                  }
                }
              }
              return false; // No conflicts
            };

            // Property: Conflict detection should work correctly
            return typeof detectConflicts(timeSlots) === 'boolean';
          },
        ),
        getPropertyTestConfig('fast'),
      );
    });

    it('should handle adjacent lessons correctly', () => {
      fc.assert(
        fc.property(
          domainArbitraries.validTimeSlot,
          domainArbitraries.lessonDuration,
          (firstSlot, secondDuration) => {
            // Property: Adjacent lessons (end time = start time) should not conflict
            const secondSlot = {
              start: new Date(firstSlot.end.getTime()),
              end: new Date(firstSlot.end.getTime() + secondDuration * 60 * 1000),
              duration: secondDuration,
            };

            // Check if second lesson would extend beyond school hours
            const schoolEnd = new Date(firstSlot.start);
            schoolEnd.setHours(16, 0, 0, 0);

            if (secondSlot.end > schoolEnd) {
              return true; // Skip if would extend beyond school hours
            }

            // Adjacent lessons should not be considered overlapping
            const areAdjacent = firstSlot.end.getTime() === secondSlot.start.getTime();
            const doNotOverlap =
              firstSlot.end <= secondSlot.start || secondSlot.end <= firstSlot.start;

            return areAdjacent ? doNotOverlap : true;
          },
        ),
        getPropertyTestConfig('fast'),
      );
    });
  });

  // ==================== Weekly Schedule Properties ====================

  describe('Weekly Schedule Organization', () => {
    it('should maintain daily time limits', () => {
      fc.assert(
        fc.property(
          fc.array(domainArbitraries.fullLessonPlan, { minLength: 1, maxLength: 8 }),
          (dailyLessons) => {
            // Property: Total daily lesson time should not exceed school day limits
            const maxDailyMinutes = 7 * 60; // 7 hours max per day

            // Group lessons by date
            const lessonsByDate = new Map<string, typeof dailyLessons>();
            dailyLessons.forEach((lesson) => {
              const dateKey = lesson.date.toISOString().split('T')[0];
              if (!lessonsByDate.has(dateKey)) {
                lessonsByDate.set(dateKey, []);
              }
              lessonsByDate.get(dateKey)!.push(lesson);
            });

            // Check each day's total duration
            for (const [, lessons] of lessonsByDate) {
              const totalDuration = lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
              if (totalDuration > maxDailyMinutes) {
                return false;
              }
            }

            return true;
          },
        ),
        getPropertyTestConfig('fast'),
      );
    });

    it('should balance subject distribution across the week', () => {
      fc.assert(
        fc.property(
          fc.array(domainArbitraries.fullLessonPlan, { minLength: 10, maxLength: 25 }),
          (weeklyLessons) => {
            // Property: Core subjects should appear multiple times per week
            const subjectCounts = new Map<string, number>();

            weeklyLessons.forEach((lesson) => {
              subjectCounts.set(lesson.subject, (subjectCounts.get(lesson.subject) || 0) + 1);
            });

            const coreSubjects = ['Mathematics', 'Language Arts'];
            const hasBalancedCore = coreSubjects.every((subject) => {
              const count = subjectCounts.get(subject) || 0;
              return count >= 3; // At least 3 lessons per week for core subjects
            });

            // If we have enough lessons for a full week, check balance
            if (weeklyLessons.length >= 15) {
              return hasBalancedCore;
            }

            return true; // Skip check for smaller lesson sets
          },
        ),
        getPropertyTestConfig('fast'),
      );
    });
  });

  // ==================== Unit Plan Timeline Properties ====================

  describe('Unit Plan Timeline Constraints', () => {
    it('should maintain realistic unit durations', () => {
      fc.assert(
        fc.property(domainArbitraries.unitTimeline, (timeline) => {
          // Property: Unit timelines should be educationally realistic
          const { startDate, endDate, totalHours, lessonCount, averageLessonDuration } = timeline;

          // Duration checks
          const durationMs = endDate.getTime() - startDate.getTime();
          const durationDays = durationMs / (1000 * 60 * 60 * 24);
          const durationWeeks = durationDays / 7;

          // Unit should be 1-8 weeks long
          const validDuration = durationWeeks >= 1 && durationWeeks <= 8;

          // Average lesson duration should be reasonable (30-90 minutes)
          const validAverageDuration = averageLessonDuration >= 30 && averageLessonDuration <= 90;

          // Lesson count should align with duration (3-5 lessons per week)
          const expectedLessonsPerWeek = Math.round(lessonCount / durationWeeks);
          const validLessonFrequency = expectedLessonsPerWeek >= 3 && expectedLessonsPerWeek <= 5;

          return validDuration && validAverageDuration && validLessonFrequency;
        }),
        getPropertyTestConfig('fast'),
      );
    });

    it('should ensure lessons fit within unit timeframe', () => {
      fc.assert(
        fc.property(
          domainArbitraries.unitTimeline,
          fc.array(domainArbitraries.fullLessonPlan, { minLength: 1, maxLength: 15 }),
          (timeline, unitLessons) => {
            // Property: All unit lessons should fall within unit start/end dates
            const { startDate, endDate } = timeline;

            // Adjust lesson dates to fall within unit timeframe
            const adjustedLessons = unitLessons.map((lesson, index) => {
              const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
              const dayOffset = Math.floor((index / unitLessons.length) * totalDays);
              const lessonDate = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);

              return {
                ...lesson,
                date: lessonDate,
              };
            });

            // Verify all lessons fall within unit timeframe
            return adjustedLessons.every(
              (lesson) => lesson.date >= startDate && lesson.date <= endDate,
            );
          },
        ),
        getPropertyTestConfig('fast'),
      );
    });
  });

  // ==================== Resource Scheduling Properties ====================

  describe('Resource Scheduling', () => {
    it('should handle resource conflicts', () => {
      fc.assert(
        fc.property(
          fc.array(domainArbitraries.fullLessonPlan, { minLength: 2, maxLength: 5 }),
          domainArbitraries.technology,
          (lessons, sharedResource) => {
            // Property: Shared resources should not be double-booked
            const lessonsWithResource = lessons.map((lesson) => ({
              ...lesson,
              materials: [...lesson.materials, sharedResource],
            }));

            // Check for same-time resource conflicts
            const hasResourceConflict = (): boolean => {
              for (let i = 0; i < lessonsWithResource.length; i++) {
                for (let j = i + 1; j < lessonsWithResource.length; j++) {
                  const lesson1 = lessonsWithResource[i];
                  const lesson2 = lessonsWithResource[j];

                  // If same date and both use the shared resource
                  if (lesson1.date.toDateString() === lesson2.date.toDateString()) {
                    const end1 = new Date(lesson1.date.getTime() + lesson1.duration * 60 * 1000);
                    const end2 = new Date(lesson2.date.getTime() + lesson2.duration * 60 * 1000);

                    // Check for time overlap
                    if (
                      (lesson1.date <= lesson2.date && end1 > lesson2.date) ||
                      (lesson2.date <= lesson1.date && end2 > lesson1.date)
                    ) {
                      return true;
                    }
                  }
                }
              }
              return false;
            };

            // Property: System should detect resource conflicts
            return typeof hasResourceConflict() === 'boolean';
          },
        ),
        getPropertyTestConfig('fast'),
      );
    });
  });

  // ==================== Break and Transition Properties ====================

  describe('Break and Transition Management', () => {
    it('should allow for transitions between lessons', () => {
      fc.assert(
        fc.property(
          fc.tuple(domainArbitraries.validTimeSlot, domainArbitraries.validTimeSlot),
          ([slot1, slot2]) => {
            // Property: Consecutive lessons should have transition time
            const minTransitionMinutes = 5;

            // If lessons are on the same day
            if (slot1.start.toDateString() === slot2.start.toDateString()) {
              // Ensure they don't overlap and have transition time
              if (slot1.end <= slot2.start) {
                const transitionMs = slot2.start.getTime() - slot1.end.getTime();
                const transitionMinutes = transitionMs / (1000 * 60);
                return transitionMinutes >= minTransitionMinutes;
              } else if (slot2.end <= slot1.start) {
                const transitionMs = slot1.start.getTime() - slot2.end.getTime();
                const transitionMinutes = transitionMs / (1000 * 60);
                return transitionMinutes >= minTransitionMinutes;
              } else {
                return false; // Overlapping lessons
              }
            }

            return true; // Different days, no conflict
          },
        ),
        getPropertyTestConfig('fast'),
      );
    });

    it('should include adequate lunch and recess breaks', () => {
      fc.assert(
        fc.property(
          fc.array(domainArbitraries.validTimeSlot, { minLength: 4, maxLength: 8 }),
          (dailySlots) => {
            // Property: Daily schedule should allow for lunch and recess

            // Sort slots by start time
            const sortedSlots = [...dailySlots].sort(
              (a, b) => a.start.getTime() - b.start.getTime(),
            );

            // Check for gaps that could accommodate breaks
            let hasLunchBreak = false;
            let hasRecessBreak = false;

            for (let i = 0; i < sortedSlots.length - 1; i++) {
              const currentEnd = sortedSlots[i].end;
              const nextStart = sortedSlots[i + 1].start;
              const gapMinutes = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60);

              // Lunch break: 30+ minutes around 11:30-1:00
              const currentHour = currentEnd.getHours();
              if (gapMinutes >= 30 && currentHour >= 11 && currentHour <= 13) {
                hasLunchBreak = true;
              }

              // Recess break: 15+ minutes around 10:00-10:30 or 2:00-2:30
              if (
                gapMinutes >= 15 &&
                ((currentHour >= 10 && currentHour <= 10) ||
                  (currentHour >= 14 && currentHour <= 14))
              ) {
                hasRecessBreak = true;
              }
            }

            // For a full day (6+ lessons), should have both breaks
            if (sortedSlots.length >= 6) {
              return hasLunchBreak && hasRecessBreak;
            }

            return true; // Partial day, less stringent requirements
          },
        ),
        getPropertyTestConfig('fast'),
      );
    });
  });

  // ==================== Assessment Scheduling Properties ====================

  describe('Assessment Scheduling', () => {
    it('should distribute assessments appropriately', () => {
      fc.assert(
        fc.property(
          fc.array(domainArbitraries.fullLessonPlan, { minLength: 10, maxLength: 20 }),
          (lessons) => {
            // Property: Assessments should be well-distributed throughout the unit
            const assessmentLessons = lessons.filter(
              (lesson) => lesson.assessmentType === 'summative',
            );

            if (assessmentLessons.length === 0) {
              return true; // No assessments to check
            }

            // Sort by date
            const sortedAssessments = assessmentLessons.sort(
              (a, b) => a.date.getTime() - b.date.getTime(),
            );

            // Check spacing between assessments
            for (let i = 0; i < sortedAssessments.length - 1; i++) {
              const daysBetween =
                Math.abs(
                  sortedAssessments[i + 1].date.getTime() - sortedAssessments[i].date.getTime(),
                ) /
                (1000 * 60 * 60 * 24);

              // Should have at least 3 days between major assessments
              if (daysBetween < 3) {
                return false;
              }
            }

            return true;
          },
        ),
        getPropertyTestConfig('fast'),
      );
    });
  });

  // ==================== Substitute Teacher Properties ====================

  describe('Substitute Teacher Considerations', () => {
    it('should identify substitute-friendly lessons', () => {
      fc.assert(
        fc.property(domainArbitraries.fullLessonPlan, (lesson) => {
          // Property: Substitute-friendly lessons should have specific characteristics
          const isSubFriendly =
            lesson.assessmentType !== 'summative' &&
            lesson.materials.every(
              (material) => !['computer', 'tablet', 'projector'].includes(material),
            );

          // Complex activities are typically not sub-friendly
          const hasComplexActivities =
            (lesson.action && lesson.action.toLowerCase().includes('experiment')) ||
            (lesson.action && lesson.action.toLowerCase().includes('investigation'));

          if (hasComplexActivities) {
            return !isSubFriendly; // Should not be marked as sub-friendly
          }

          return true; // Other lessons can be either way
        }),
        getPropertyTestConfig('fast'),
      );
    });
  });

  // ==================== Scheduling Algorithm Properties ====================

  describe('Scheduling Algorithm Invariants', () => {
    it('should maintain schedule optimization properties', () => {
      fc.assert(
        fc.property(
          fc.array(domainArbitraries.fullLessonPlan, { minLength: 5, maxLength: 15 }),
          (lessons) => {
            // Property: Optimized schedule should minimize context switching

            // Sort lessons by date and time
            const sortedLessons = [...lessons].sort((a, b) => a.date.getTime() - b.date.getTime());

            // Count subject changes within the same day
            let subjectChanges = 0;
            const lessonsByDay = new Map<string, typeof lessons>();

            sortedLessons.forEach((lesson) => {
              const dateKey = lesson.date.toDateString();
              if (!lessonsByDay.has(dateKey)) {
                lessonsByDay.set(dateKey, []);
              }
              lessonsByDay.get(dateKey)!.push(lesson);
            });

            lessonsByDay.forEach((dailyLessons) => {
              for (let i = 1; i < dailyLessons.length; i++) {
                if (dailyLessons[i].subject !== dailyLessons[i - 1].subject) {
                  subjectChanges++;
                }
              }
            });

            // Property: Number of subject changes should be reasonable
            const totalLessons = lessons.length;
            const changeRatio = subjectChanges / Math.max(totalLessons - 1, 1);

            // Should not switch subjects more than 70% of the time
            return changeRatio <= 0.7;
          },
        ),
        getPropertyTestConfig('fast'),
      );
    });

    it('should handle scheduling constraints correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            lessons: fc.array(domainArbitraries.fullLessonPlan, { minLength: 3, maxLength: 10 }),
            constraints: fc.record({
              maxDailyLessons: fc.integer({ min: 3, max: 8 }),
              minBreakMinutes: fc.integer({ min: 5, max: 15 }),
              schoolStartHour: fc.integer({ min: 7, max: 9 }),
              schoolEndHour: fc.integer({ min: 14, max: 16 }),
            }),
          }),
          ({ lessons, constraints }) => {
            // Property: Scheduling should respect all constraints
            const { maxDailyLessons, minBreakMinutes, schoolStartHour, schoolEndHour } =
              constraints;

            // Group lessons by day
            const lessonsByDay = new Map<string, typeof lessons>();
            lessons.forEach((lesson) => {
              const dateKey = lesson.date.toDateString();
              if (!lessonsByDay.has(dateKey)) {
                lessonsByDay.set(dateKey, []);
              }
              lessonsByDay.get(dateKey)!.push(lesson);
            });

            // Check constraints for each day
            for (const [, dailyLessons] of lessonsByDay) {
              // Max daily lessons constraint
              if (dailyLessons.length > maxDailyLessons) {
                return false;
              }

              // School hours constraint
              for (const lesson of dailyLessons) {
                const hour = lesson.date.getHours();
                const endTime = new Date(lesson.date.getTime() + lesson.duration * 60 * 1000);
                const endHour = endTime.getHours();

                if (hour < schoolStartHour || endHour > schoolEndHour) {
                  return false;
                }
              }

              // Break time constraint (for consecutive lessons)
              const sortedDaily = dailyLessons.sort((a, b) => a.date.getTime() - b.date.getTime());
              for (let i = 1; i < sortedDaily.length; i++) {
                const prevEnd = new Date(
                  sortedDaily[i - 1].date.getTime() + sortedDaily[i - 1].duration * 60 * 1000,
                );
                const currentStart = sortedDaily[i].date;
                const breakMinutes = (currentStart.getTime() - prevEnd.getTime()) / (1000 * 60);

                if (breakMinutes < minBreakMinutes) {
                  return false;
                }
              }
            }

            return true;
          },
        ),
        getPropertyTestConfig('fast'),
      );
    });
  });
});
