/**
 * Safe date formatting utilities to prevent RangeError crashes
 * These utilities handle invalid dates gracefully with fallbacks
 */

import { format } from 'date-fns';

/**
 * Convert a value to a Date object or null if invalid
 */
export const toDateOrNull = (v: unknown): Date | null => {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Check if a value is a valid date
 */
export const isValidDate = (v: unknown): boolean => {
  return toDateOrNull(v) !== null;
};

/**
 * Format a date with fallback for invalid dates
 * @param v - The value to format (string, Date, or unknown)
 * @param fmt - date-fns format string
 * @param fallback - Fallback string if date is invalid (default: '—')
 */
export const formatOr = (v: unknown, fmt: string, fallback = '—'): string => {
  const d = toDateOrNull(v);
  if (!d) return fallback;
  try {
    return format(d, fmt);
  } catch {
    return fallback;
  }
};

/**
 * Format a date safely for display
 * Common formats with safe fallbacks
 */
export const formatDate = (v: unknown, fallback = 'Non planifiée'): string => {
  return formatOr(v, 'PPP', fallback); // e.g., "September 9, 2025"
};

export const formatShortDate = (v: unknown, fallback = '—'): string => {
  return formatOr(v, 'MMM d, yyyy', fallback); // e.g., "Sep 9, 2025"
};

export const formatTime = (v: unknown, fallback = '—'): string => {
  return formatOr(v, 'h:mm a', fallback); // e.g., "3:00 PM"
};

export const formatDateTime = (v: unknown, fallback = 'Non planifiée'): string => {
  return formatOr(v, 'PPP à h:mm a', fallback); // e.g., "September 9, 2025 à 3:00 PM"
};

export const formatWeekday = (v: unknown, fallback = '—'): string => {
  return formatOr(v, 'EEEE', fallback); // e.g., "Monday"
};