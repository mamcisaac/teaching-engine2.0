/**
 * Privacy utilities for protecting user data
 * This application does not store any student data
 */

export interface PrivacyOptions {
  showFullData?: boolean;
  isOwner?: boolean;
}

/**
 * Masks sensitive user information based on privacy settings
 */
export function maskUserData(user: Record<string, unknown>, options: PrivacyOptions = {}): Record<string, unknown> | null {
  const {
    showFullData = true,
    isOwner = true,
  } = options;

  if (user === null || user === undefined) {
    return null;
  }

  const masked = { ...user };

  // Mask email if not owner
  if (!showFullData && !isOwner && typeof user.email === 'string') {
    const [localPart, domain] = user.email.split('@');
    masked.email = `${localPart.slice(0, 2)}***@${domain}`;
  }

  // Always remove sensitive fields
  delete masked.password;
  delete masked.passwordResetToken;
  delete masked.passwordResetExpires;

  // Remove system fields if not owner
  if (!isOwner) {
    delete masked.createdAt;
    delete masked.updatedAt;
  }

  return masked;
}

/**
 * Generates a privacy-safe user identifier for logging
 */
export function getUserIdentifier(user: Record<string, unknown>): string {
  if (user === null || user === undefined) {
    return 'unknown';
  }
  
  // Use partial email + partial ID for privacy
  const email = typeof user.email === 'string' ? user.email : 'unknown@example.com';
  const [localPart] = email.split('@');
  const idSuffix = user.id !== null && user.id !== undefined ? String(user.id).slice(-4) : '0000';
  
  return `${localPart.slice(0, 3)}-${idSuffix}`;
}

/**
 * Validates data access permissions
 */
export function validateDataAccess(
  userId: number,
  targetUserId: number,
  role = 'teacher'
): boolean {
  // Teachers can only access their own data
  if (role === 'teacher') {
    return userId === targetUserId;
  }
  
  // Admins can access any data
  if (role === 'admin') {
    return true;
  }
  
  return false;
}

/**
 * Sanitizes user data for export
 */
export function sanitizeUserDataForExport(users: Record<string, unknown>[]): Record<string, unknown>[] {
  return users.map(user => ({
    userId: getUserIdentifier(user),
    role: user.role ?? 'teacher',
    // Only include non-sensitive fields
    name: user.name,
    preferredLanguage: user.preferredLanguage,
  }));
}

/**
 * Anonymizes data for analytics
 */
export function anonymizeForAnalytics(data: Record<string, unknown>): Record<string, unknown> {
  const anonymized = { ...data };
  
  // Remove all PII
  delete anonymized.email;
  delete anonymized.name;
  delete anonymized.userId;
  
  // Replace with anonymous identifiers
  anonymized.userHash = data.userId !== null && data.userId !== undefined ? hashUserId(Number(data.userId)) : 'anonymous';
  
  return anonymized;
}

/**
 * Simple hash function for user IDs
 */
function hashUserId(userId: number): string {
  // Simple hash for demo - in production use proper hashing
  return `user_${(userId * 7919) % 10000}`;
}