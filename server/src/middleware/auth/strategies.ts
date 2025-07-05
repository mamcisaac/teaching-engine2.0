/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
// Express types imported but not used in this file
import { prisma } from '../../prisma.js';
import { hashPassword, verifyPassword, validatePasswordStrength } from './password';
import { generateTokenPair } from './jwt';
import { LoginCredentials, RegistrationData, TokenResponse, UserResponse, UserRole } from './types';
import { AuthenticationError, ValidationError, ConflictError } from '../errorHandler.js';
import logger from '../../logger.js';

/**
 * Register a new user
 */
export async function register(data: RegistrationData): Promise<{
  user: UserResponse;
  tokens: TokenResponse;
}> {
  // Validate password strength
  const passwordValidation = validatePasswordStrength(data.password);
  if (!passwordValidation.isValid) {
    throw new ValidationError('Invalid password: ' + passwordValidation.errors.join(', '));
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      password: hashedPassword,
      name: data.name,
      role: data.role || UserRole.TEACHER,
    },
  });

  logger.info({ userId: user.id, email: user.email }, `New user registered: ${user.email}`);

  // Generate tokens
  const tokens = generateTokenPair({
    id: user.id,
    email: user.email,
    role: user.role,
    organizationId: undefined,
  });

  return {
    user: sanitizeUser(user),
    tokens: {
      ...tokens,
      expiresIn: '24h',
      tokenType: 'Bearer',
    },
  };
}

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<{
  user: UserResponse;
  tokens: TokenResponse;
}> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: credentials.email.toLowerCase() },
  });

  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Verify password
  const isValidPassword = await verifyPassword(credentials.password, user.password);
  if (!isValidPassword) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Log last login
  logger.info(
    { userId: user.id, email: user.email },
    `User ${user.email} logged in at ${new Date().toISOString()}`,
  );

  // Generate tokens
  const tokens = generateTokenPair({
    id: user.id,
    email: user.email,
    role: user.role,
    organizationId: undefined,
  });

  return {
    user: sanitizeUser(user),
    tokens: {
      ...tokens,
      expiresIn: '24h',
      tokenType: 'Bearer',
    },
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshTokens(_refreshToken: string): Promise<TokenResponse> {
  // This would typically verify the refresh token
  // and generate new tokens. For now, simplified implementation
  throw new Error('Refresh token functionality not implemented');
}

/**
 * Logout user (optional - for token blacklisting)
 */
export async function logout(userId: number): Promise<void> {
  // In a stateless JWT system, logout is typically handled client-side
  // This could be used for token blacklisting if implemented
  logger.info({ userId }, `User ${userId} logged out`);
}

/**
 * Change user password
 */
export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  // Validate new password
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.isValid) {
    throw new ValidationError('Invalid password: ' + passwordValidation.errors.join(', '));
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  // Verify current password
  const isValidPassword = await verifyPassword(currentPassword, user.password);
  if (!isValidPassword) {
    throw new AuthenticationError('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  logger.info({ userId: user.id, email: user.email }, `Password changed for user: ${user.email}`);
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    // Don't reveal if user exists
    logger.warn({ email }, `Password reset requested for non-existent email: ${email}`);
    return;
  }

  // Generate reset token (simplified - should use crypto.randomBytes)
  const resetToken = Math.random().toString(36).substring(2, 15);
  const resetExpires = new Date(Date.now() + 3600000); // 1 hour

  // TODO: Implement password reset token storage
  // Current User model doesn't support passwordResetToken/passwordResetExpires
  // Need to add these fields to the schema or use a separate table

  // NOTE: Email service integration needed for production
  // For now, reset token should be communicated through secure channel
  logger.info(
    { userId: user.id, email: user.email },
    `Password reset requested for: ${user.email}`,
  );
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  // Validate new password
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.isValid) {
    throw new ValidationError('Invalid password: ' + passwordValidation.errors.join(', '));
  }

  // TODO: Implement reset token validation
  // Current User model doesn't support passwordResetToken/passwordResetExpires
  // For now, reject all reset attempts
  throw new AuthenticationError(
    'Password reset functionality not yet implemented - User model needs passwordResetToken/passwordResetExpires fields',
  );
}

/**
 * Remove sensitive fields from user object
 */
function sanitizeUser(user: {
  id: number;
  email: string;
  name: string;
  role: string;
  preferredLanguage: string;
}): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    organizationId: undefined,
    createdAt: new Date(), // Fallback since model doesn't have this
    updatedAt: new Date(), // Fallback since model doesn't have this
  };
}
