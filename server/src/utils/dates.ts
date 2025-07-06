/* eslint-disable @typescript-eslint/no-explicit-any */
// Common date/time manipulation utilities

// Date range helpers
export const getDateRanges = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return {
    now,
    today,
    yesterday: new Date(today.getTime() - 24 * 60 * 60 * 1000),
    tomorrow: new Date(today.getTime() + 24 * 60 * 60 * 1000),

    // Week ranges
    startOfWeek: getStartOfWeek(now),
    endOfWeek: getEndOfWeek(now),
    startOfLastWeek: getStartOfWeek(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)),
    endOfLastWeek: getEndOfWeek(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)),

    // Month ranges
    startOfMonth: new Date(now.getFullYear(), now.getMonth(), 1),
    endOfMonth: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
    startOfLastMonth: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    endOfLastMonth: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),

    // Year ranges
    startOfYear: new Date(now.getFullYear(), 0, 1),
    endOfYear: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),

    // Relative dates
    oneHourAgo: new Date(now.getTime() - 60 * 60 * 1000),
    oneDayAgo: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    oneWeekAgo: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    oneMonthAgo: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
    threeMonthsAgo: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
    sixMonthsAgo: new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
    oneYearAgo: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
  };
};

// Get start of week (Monday by default)
export const getStartOfWeek = (date: Date, startDay = 1): Date => {
  const d = new Date(date);
  const _day = d.getDay();
  const diff = d.getDate() - _day + (_day === 0 ? -6 : startDay);
  return new Date(d.setDate(diff));
};

// Get end of week (Sunday by default)
export const getEndOfWeek = (date: Date, startDay = 1): Date => {
  const start = getStartOfWeek(date, startDay);
  return new Date(
    start.getTime() +
      6 * 24 * 60 * 60 * 1000 +
      23 * 60 * 60 * 1000 +
      59 * 60 * 1000 +
      59 * 1000 +
      999,
  );
};

// Date formatting
export const formatDate = (date: Date | string, format = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const _day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', _day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

// Human-readable date formatting
export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
return 'just now';
}
  if (diffMins < 60) {
return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
}
  if (diffHours < 24) {
return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
}
  if (diffDays < 7) {
return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
  if (diffDays < 30) {
return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
}
  if (diffDays < 365) {
return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
}

  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
};

// Date validation
export const isValidDate = (date: unknown): boolean => {
  if (!date) {
return false;
}
  const d = date instanceof Date ? date : new Date(date as string | number);
  return d instanceof Date && !isNaN(d.getTime());
};

// Date comparison
export const isSameDay = (date1: Date, date2: Date): boolean => (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );

export const isToday = (date: Date): boolean => isSameDay(date, new Date());

export const isPast = (date: Date): boolean => date.getTime() < new Date().getTime();

export const isFuture = (date: Date): boolean => date.getTime() > new Date().getTime();

export const isBetween = (date: Date, start: Date, end: Date): boolean => {
  const time = date.getTime();
  return time >= start.getTime() && time <= end.getTime();
};

// Date calculations
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addWeeks = (date: Date, weeks: number): Date => addDays(date, weeks * 7);

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

export const getDaysBetween = (date1: Date, date2: Date): number => {
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
};

export const getWeeksBetween = (date1: Date, date2: Date): number => Math.floor(getDaysBetween(date1, date2) / 7);

// Academic year helpers
export const getAcademicYear = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Academic year typically starts in September
  if (month >= 8) {
    // September or later
    return `${year}-${year + 1}`;
  } 
    return `${year - 1}-${year}`;
  
};

export const getAcademicTerm = (date: Date = new Date()): string => {
  const month = date.getMonth();

  if (month >= 8 || month <= 0) {
return 'Fall';
} // Sep-Jan
  if (month >= 1 && month <= 5) {
return 'Winter';
} // Feb-Jun
  return 'Summer'; // Jul-Aug
};

// Time zone helpers (using UTC)
export const toUTCDate = (date: Date): Date => new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds(),
    ),
  );

export const fromUTCDate = (utcDate: Date): Date => new Date(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate(),
    utcDate.getUTCHours(),
    utcDate.getUTCMinutes(),
    utcDate.getUTCSeconds(),
    utcDate.getUTCMilliseconds(),
  );

// Parse flexible date input
export const parseFlexibleDate = (input: string | Date | number): Date | null => {
  if (input instanceof Date) {
return input;
}

  if (typeof input === 'number') {
    // Assume timestamp in milliseconds
    return new Date(input);
  }

  if (typeof input === 'string') {
    // Try parsing common formats
    const patterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    ];

    for (const pattern of patterns) {
      if (pattern.test(input)) {
        const date = new Date(input);
        if (isValidDate(date)) {
return date;
}
      }
    }

    // Try natural language
    const lowerInput = input.toLowerCase();
    if (lowerInput === 'today') {
return getDateRanges().today;
}
    if (lowerInput === 'yesterday') {
return getDateRanges().yesterday;
}
    if (lowerInput === 'tomorrow') {
return getDateRanges().tomorrow;
}

    // Try default parsing
    const date = new Date(input);
    if (isValidDate(date)) {
return date;
}
  }

  return null;
};
