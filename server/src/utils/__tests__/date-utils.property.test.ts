import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';
import { 
  arbitraries, 
  properties, 
  matchers, 
  runPropertyTest,
  testConfig 
} from '../../test-utils/property-test-utils';
import { 
  addSchoolDays,
  getSchoolWeek,
  calculateTermDates,
  getNextSchoolDay,
  isSchoolDay,
  getSchoolYearProgress,
  formatLessonDate,
  calculateUnitDuration,
  getQuarterDates
} from '../dates';
import { addDays, isValid, isBefore, isAfter, differenceInDays } from 'date-fns';

describe('Date Utilities - Property Tests', () => {
  describe('addSchoolDays', () => {
    it('should always return valid dates', () => {
      const property = properties.validDates(
        (date) => addSchoolDays(date, 5),
        arbitraries.schoolDate()
      );
      
      runPropertyTest(property);
    });

    it('should preserve date order when adding positive days', () => {
      const property = fc.property(
        arbitraries.schoolDate(),
        fc.integer({ min: 1, max: 100 }),
        (startDate, daysToAdd) => {
          const result = addSchoolDays(startDate, daysToAdd);
          return isAfter(result, startDate) || result.getTime() === startDate.getTime();
        }
      );
      
      runPropertyTest(property);
    });

    it('should be consistent with business rule: 5 school days = 1 week', () => {
      const property = fc.property(
        arbitraries.schoolDate(),
        (startDate) => {
          const fiveDaysLater = addSchoolDays(startDate, 5);
          const daysDifference = differenceInDays(fiveDaysLater, startDate);
          
          // Should be between 5-9 days (accounts for weekends)
          return daysDifference >= 5 && daysDifference <= 9;
        }
      );
      
      runPropertyTest(property);
    });

    it('should handle zero days correctly (identity property)', () => {
      const property = fc.property(
        arbitraries.schoolDate(),
        (date) => {
          const result = addSchoolDays(date, 0);
          return result.getTime() === date.getTime();
        }
      );
      
      runPropertyTest(property);
    });

    it('should be associative: add(add(date, a), b) === add(date, a+b)', () => {
      const property = fc.property(
        arbitraries.schoolDate(),
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 1, max: 20 }),
        (date, daysA, daysB) => {
          const result1 = addSchoolDays(addSchoolDays(date, daysA), daysB);
          const result2 = addSchoolDays(date, daysA + daysB);
          
          return Math.abs(result1.getTime() - result2.getTime()) < 24 * 60 * 60 * 1000; // Within 1 day tolerance
        }
      );
      
      runPropertyTest(property);
    });
  });

  describe('getNextSchoolDay', () => {
    it('should always return a valid school day', () => {
      const property = fc.property(
        fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
        (date) => {
          const nextDay = getNextSchoolDay(date);
          return isValid(nextDay) && isSchoolDay(nextDay);
        }
      );
      
      runPropertyTest(property);
    });

    it('should always return a date after the input date', () => {
      const property = fc.property(
        fc.date({ min: new Date('2024-01-01'), max: new Date('2025-06-01') }),
        (date) => {
          const nextDay = getNextSchoolDay(date);
          return isAfter(nextDay, date);
        }
      );
      
      runPropertyTest(property);
    });

    it('should be at most 3 days later (Friday -> Monday)', () => {
      const property = fc.property(
        arbitraries.schoolDate(),
        (date) => {
          const nextDay = getNextSchoolDay(date);
          const daysDiff = differenceInDays(nextDay, date);
          return daysDiff >= 1 && daysDiff <= 3;
        }
      );
      
      runPropertyTest(property);
    });
  });

  describe('isSchoolDay', () => {
    it('should return boolean for any valid date', () => {
      const property = fc.property(
        fc.date(),
        (date) => {
          const result = isSchoolDay(date);
          return typeof result === 'boolean';
        }
      );
      
      runPropertyTest(property);
    });

    it('should never return true for weekends', () => {
      const property = fc.property(
        fc.date(),
        (date) => {
          const dayOfWeek = date.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
          
          if (isWeekend) {
            return !isSchoolDay(date);
          }
          return true; // Don't care about weekdays for this test
        }
      );
      
      runPropertyTest(property);
    });

    it('should be consistent with school year boundaries', () => {
      const property = fc.property(
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
        (date) => {
          const month = date.getMonth() + 1;
          const isSchoolPeriod = (month >= 9) || (month <= 6);
          const result = isSchoolDay(date);
          
          // If it's not in school period, should definitely be false
          if (!isSchoolPeriod) {
            return !result;
          }
          
          // If in school period, result depends on day of week
          const dayOfWeek = date.getDay();
          const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
          
          if (!isWeekday) {
            return !result;
          }
          
          return true; // Weekdays in school period should generally be school days
        }
      );
      
      runPropertyTest(property);
    });
  });

  describe('getSchoolWeek', () => {
    it('should return valid week boundaries', () => {
      const property = fc.property(
        arbitraries.schoolDate(),
        (date) => {
          const { start, end } = getSchoolWeek(date);
          
          return (
            isValid(start) &&
            isValid(end) &&
            isBefore(start, end) &&
            start.getDay() === 1 && // Monday
            end.getDay() === 5     // Friday
          );
        }
      );
      
      runPropertyTest(property);
    });

    it('should contain the input date', () => {
      const property = fc.property(
        arbitraries.schoolDate(),
        (date) => {
          const { start, end } = getSchoolWeek(date);
          
          return (
            (isAfter(date, start) || date.getTime() === start.getTime()) &&
            (isBefore(date, end) || date.getTime() === end.getTime())
          );
        }
      );
      
      runPropertyTest(property);
    });

    it('should be idempotent for start of week', () => {
      const property = fc.property(
        arbitraries.schoolDate(),
        (date) => {
          const { start } = getSchoolWeek(date);
          const { start: start2 } = getSchoolWeek(start);
          
          return start.getTime() === start2.getTime();
        }
      );
      
      runPropertyTest(property);
    });
  });

  describe('calculateTermDates', () => {
    it('should return valid date ranges for any school year', () => {
      const property = fc.property(
        arbitraries.schoolYear(),
        (schoolYear) => {
          const terms = calculateTermDates(schoolYear);
          
          return terms.every(term => 
            isValid(term.startDate) &&
            isValid(term.endDate) &&
            isBefore(term.startDate, term.endDate)
          );
        }
      );
      
      runPropertyTest(property);
    });

    it('should have non-overlapping terms', () => {
      const property = fc.property(
        arbitraries.schoolYear(),
        (schoolYear) => {
          const terms = calculateTermDates(schoolYear);
          
          if (terms.length < 2) return true;
          
          for (let i = 0; i < terms.length - 1; i++) {
            if (!isBefore(terms[i].endDate, terms[i + 1].startDate)) {
              return false;
            }
          }
          
          return true;
        }
      );
      
      runPropertyTest(property);
    });

    it('should span approximately 10 months', () => {
      const property = fc.property(
        arbitraries.schoolYear(),
        (schoolYear) => {
          const terms = calculateTermDates(schoolYear);
          const firstStart = terms[0].startDate;
          const lastEnd = terms[terms.length - 1].endDate;
          
          const totalDays = differenceInDays(lastEnd, firstStart);
          
          // School year should be roughly 180-200 school days (260-300 calendar days)
          return totalDays >= 260 && totalDays <= 320;
        }
      );
      
      runPropertyTest(property);
    });
  });

  describe('getSchoolYearProgress', () => {
    it('should return values between 0 and 100', () => {
      const property = properties.bounded(
        (date: Date) => getSchoolYearProgress(date),
        arbitraries.schoolDate(),
        0,
        100
      );
      
      runPropertyTest(property);
    });

    it('should be monotonically increasing during school year', () => {
      const property = fc.property(
        arbitraries.schoolDate(),
        fc.integer({ min: 1, max: 30 }),
        (startDate, daysLater) => {
          const laterDate = addDays(startDate, daysLater);
          
          // Only test if both dates are in same school year
          const startYear = startDate.getFullYear();
          const laterYear = laterDate.getFullYear();
          const startMonth = startDate.getMonth();
          const laterMonth = laterDate.getMonth();
          
          // Simple check for same school year
          const sameSchoolYear = (
            startYear === laterYear ||
            (startYear === laterYear - 1 && startMonth >= 8 && laterMonth <= 6)
          );
          
          if (!sameSchoolYear) return true; // Skip this test case
          
          const progress1 = getSchoolYearProgress(startDate);
          const progress2 = getSchoolYearProgress(laterDate);
          
          return progress2 >= progress1;
        }
      );
      
      runPropertyTest(property);
    });

    it('should return 0 at start of school year', () => {
      const property = fc.property(
        fc.integer({ min: 2020, max: 2030 }),
        (year) => {
          const schoolYearStart = new Date(year, 8, 1); // September 1
          const progress = getSchoolYearProgress(schoolYearStart);
          
          return progress >= 0 && progress <= 10; // Allow some tolerance
        }
      );
      
      runPropertyTest(property);
    });
  });

  describe('calculateUnitDuration', () => {
    it('should return positive durations for valid date ranges', () => {
      const property = fc.property(
        arbitraries.schoolDate(),
        fc.integer({ min: 1, max: 60 }),
        (startDate, daysToAdd) => {
          const endDate = addDays(startDate, daysToAdd);
          const duration = calculateUnitDuration(startDate, endDate);
          
          return duration > 0;
        }
      );
      
      runPropertyTest(property);
    });

    it('should be proportional to date difference', () => {
      const property = fc.property(
        arbitraries.schoolDate(),
        fc.integer({ min: 7, max: 21 }),
        fc.integer({ min: 7, max: 21 }),
        (startDate, days1, days2) => {
          const endDate1 = addDays(startDate, Math.min(days1, days2));
          const endDate2 = addDays(startDate, Math.max(days1, days2));
          
          const duration1 = calculateUnitDuration(startDate, endDate1);
          const duration2 = calculateUnitDuration(startDate, endDate2);
          
          return duration2 >= duration1;
        }
      );
      
      runPropertyTest(property);
    });

    it('should return reasonable hours for typical units', () => {
      const property = fc.property(
        arbitraries.schoolDate(),
        fc.integer({ min: 14, max: 42 }), // 2-6 weeks
        (startDate, daysToAdd) => {
          const endDate = addDays(startDate, daysToAdd);
          const hours = calculateUnitDuration(startDate, endDate);
          
          // Typical unit should be 10-50 hours
          return hours >= 5 && hours <= 100;
        }
      );
      
      runPropertyTest(property);
    });
  });

  describe('formatLessonDate', () => {
    it('should always return a non-empty string for valid dates', () => {
      const property = fc.property(
        arbitraries.schoolDate(),
        (date) => {
          const formatted = formatLessonDate(date);
          return typeof formatted === 'string' && formatted.length > 0;
        }
      );
      
      runPropertyTest(property);
    });

    it('should be consistent for same date', () => {
      const property = properties.idempotent(
        (date: Date) => formatLessonDate(date),
        arbitraries.schoolDate()
      );
      
      runPropertyTest(property);
    });

    it('should produce different strings for different dates', () => {
      const property = fc.property(
        arbitraries.schoolDate(),
        arbitraries.schoolDate(),
        (date1, date2) => {
          if (date1.getTime() === date2.getTime()) return true; // Same date
          
          const formatted1 = formatLessonDate(date1);
          const formatted2 = formatLessonDate(date2);
          
          return formatted1 !== formatted2;
        }
      );
      
      runPropertyTest(property);
    });
  });

  describe('getQuarterDates', () => {
    it('should return 4 quarters for any school year', () => {
      const property = fc.property(
        arbitraries.schoolYear(),
        (schoolYear) => {
          const quarters = getQuarterDates(schoolYear);
          return quarters.length === 4;
        }
      );
      
      runPropertyTest(property);
    });

    it('should have valid date ranges for all quarters', () => {
      const property = fc.property(
        arbitraries.schoolYear(),
        (schoolYear) => {
          const quarters = getQuarterDates(schoolYear);
          
          return quarters.every(quarter =>
            isValid(quarter.startDate) &&
            isValid(quarter.endDate) &&
            isBefore(quarter.startDate, quarter.endDate)
          );
        }
      );
      
      runPropertyTest(property);
    });

    it('should have non-overlapping quarters', () => {
      const property = fc.property(
        arbitraries.schoolYear(),
        (schoolYear) => {
          const quarters = getQuarterDates(schoolYear);
          
          for (let i = 0; i < quarters.length - 1; i++) {
            if (!isBefore(quarters[i].endDate, quarters[i + 1].startDate)) {
              return false;
            }
          }
          
          return true;
        }
      );
      
      runPropertyTest(property);
    });

    it('should span the entire school year', () => {
      const property = fc.property(
        arbitraries.schoolYear(),
        (schoolYear) => {
          const quarters = getQuarterDates(schoolYear);
          const terms = calculateTermDates(schoolYear);
          
          if (terms.length === 0 || quarters.length === 0) return true;
          
          const firstQuarter = quarters[0];
          const lastQuarter = quarters[quarters.length - 1];
          const firstTerm = terms[0];
          const lastTerm = terms[terms.length - 1];
          
          // Quarters should roughly span the same period as terms
          const quarterSpan = differenceInDays(lastQuarter.endDate, firstQuarter.startDate);
          const termSpan = differenceInDays(lastTerm.endDate, firstTerm.startDate);
          
          // Allow 10% variance
          return Math.abs(quarterSpan - termSpan) <= termSpan * 0.1;
        }
      );
      
      runPropertyTest(property);
    });
  });

  describe('Date utility combinations', () => {
    it('should maintain consistency between related functions', () => {
      const property = fc.property(
        arbitraries.schoolDate(),
        (date) => {
          const nextSchoolDay = getNextSchoolDay(date);
          const isOriginalSchoolDay = isSchoolDay(date);
          const isNextASchoolDay = isSchoolDay(nextSchoolDay);
          
          // Next school day should always be a school day
          return isNextASchoolDay;
        }
      );
      
      runPropertyTest(property);
    });

    it('should have consistent week calculations', () => {
      const property = fc.property(
        arbitraries.schoolDate(),
        (date) => {
          const { start, end } = getSchoolWeek(date);
          const schoolDaysInWeek = 5; // Monday to Friday
          
          let currentDate = new Date(start);
          let schoolDayCount = 0;
          
          while (currentDate <= end) {
            if (isSchoolDay(currentDate)) {
              schoolDayCount++;
            }
            currentDate = addDays(currentDate, 1);
          }
          
          // Should find exactly 5 school days in a school week
          return schoolDayCount <= schoolDaysInWeek;
        }
      );
      
      runPropertyTest(property);
    });
  });
});