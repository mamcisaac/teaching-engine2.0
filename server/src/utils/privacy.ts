/**
 * Privacy utilities for protecting student data
 */

export interface PrivacyOptions {
  showFullName?: boolean;
  showGrade?: boolean;
  showReflections?: boolean;
  showGoals?: boolean;
  isOwner?: boolean;
}

/**
 * Masks sensitive student information based on privacy settings
 */
export function maskStudentData(student: Record<string, unknown>, options: PrivacyOptions = {}): Record<string, unknown> | null {
  const {
    showFullName = true,
    showGrade = true,
    showReflections = true,
    showGoals = true,
    isOwner = true,
  } = options;

  if (!student) return null;

  const masked = { ...student };

  // Mask name if needed
  if (!showFullName && !isOwner) {
    if (typeof student.firstName === 'string' && typeof student.lastName === 'string') {
      masked.firstName = student.firstName.charAt(0) + '***';
      masked.lastName = student.lastName.charAt(0) + '***';
      masked.name = `${masked.firstName} ${masked.lastName}`;
    }
  }

  // Remove grade if not allowed
  if (!showGrade && !isOwner) {
    delete masked.grade;
  }

  // Remove reflections if not allowed
  if (!showReflections && !isOwner) {
    delete masked.reflections;
    if (masked._count && typeof masked._count === 'object') {
      delete (masked._count as Record<string, unknown>).reflections;
    }
  }

  // Remove goals if not allowed
  if (!showGoals && !isOwner) {
    delete masked.goals;
    if (masked._count && typeof masked._count === 'object') {
      delete (masked._count as Record<string, unknown>).goals;
    }
  }

  // Always remove system fields
  delete masked.createdAt;
  delete masked.updatedAt;
  delete masked.userId; // Never expose the teacher's ID

  return masked;
}

/**
 * Generates a privacy-safe student identifier for logging
 */
export function getStudentIdentifier(student: Record<string, unknown>): string {
  if (!student) return 'unknown';
  
  // Use initials + partial ID for privacy
  const firstInitial = typeof student.firstName === 'string' ? student.firstName.charAt(0).toUpperCase() : 'X';
  const lastInitial = typeof student.lastName === 'string' ? student.lastName.charAt(0).toUpperCase() : 'X';
  const idSuffix = student.id ? String(student.id).slice(-4) : '0000';
  
  return `${firstInitial}${lastInitial}-${idSuffix}`;
}

/**
 * Checks if a user has permission to access detailed student data
 */
export function canAccessStudentDetails(
  userId: number,
  student: Record<string, unknown>,
  _permissionLevel: 'view' | 'edit' | 'delete' = 'view'
): boolean {
  // Teacher can only access their own students
  if (student.userId !== userId) {
    return false;
  }

  // Additional permission checks can be added here
  // For example, checking roles, time-based access, etc.

  return true;
}

/**
 * Sanitizes student data for export or sharing
 */
export function sanitizeStudentDataForExport(students: Record<string, unknown>[]): Record<string, unknown>[] {
  return students.map(student => ({
    // Only include necessary fields
    studentId: getStudentIdentifier(student),
    grade: student.grade,
    // Aggregate data only
    totalGoals: (student._count && typeof student._count === 'object' && (student._count as Record<string, unknown>).goals) || 0,
    totalReflections: (student._count && typeof student._count === 'object' && (student._count as Record<string, unknown>).reflections) || 0,
    totalArtifacts: (student._count && typeof student._count === 'object' && (student._count as Record<string, unknown>).artifacts) || 0,
    // No personally identifiable information
  }));
}

/**
 * Validates student data access request
 */
export function validateStudentDataAccess(
  requestingUserId: number,
  targetStudentId: number,
  _operation: 'read' | 'write' | 'delete'
): { allowed: boolean; reason?: string } {
  // Implement access control logic
  if (!requestingUserId) {
    return { allowed: false, reason: 'User not authenticated' };
  }

  if (!targetStudentId) {
    return { allowed: false, reason: 'Invalid student ID' };
  }

  // Additional validation can be added here
  // For example: checking if user is suspended, checking access logs for suspicious activity, etc.

  return { allowed: true };
}