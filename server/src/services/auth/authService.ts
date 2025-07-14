/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { hash, compare } from 'bcryptjs';

import { BaseService } from '../base/BaseService';

export class AuthService extends BaseService {
  private static instance: AuthService | undefined;
  private readonly saltRounds = 12;

  private constructor() {
    super('AuthService');
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Validates password strength and security requirements
   */
  async validatePassword(password: string): Promise<void> {
    if (!password || typeof password !== 'string') {
      throw new Error('Password is required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      throw new Error('Password must be no more than 128 characters long');
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const weakPasswords = ['password123', '123456789', 'qwerty123', 'admin123', 'teacher123'];

    if (weakPasswords.some((weak) => password.toLowerCase().includes(weak.toLowerCase()))) {
      throw new Error('Password is too common. Please choose a more secure password');
    }

    this.logger.info('Password validation passed');
  }

  /**
   * Hashes a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    try {
      await this.validatePassword(password);

      const hashed = await hash(password, this.saltRounds);
      this.logger.info('Password hashed successfully');

      return hashed;
    } catch (error) {
      this.logger.error({ error }, 'Password hashing failed');
      throw error;
    }
  }

  /**
   * Compares a password with its hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      const isMatch = await compare(password, hash);
      this.logger.info({ isMatch }, 'Password comparison completed');

      return isMatch;
    } catch (error) {
      this.logger.error({ error }, 'Password comparison failed');
      throw new Error('Authentication failed');
    }
  }

  /**
   * Generates a secure temporary password
   */
  generateTemporaryPassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';

    const allChars = uppercase + lowercase + numbers + symbols;

    let password = '';

    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * Generates a test authentication token (for testing purposes only)
   */
  generateAuthToken(userId: number, email: string): string {
    // This is a simple test token - in production, use proper JWT
    const payload = {
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    };

    // Simple base64 encoding for testing - replace with proper JWT in production
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Export individual functions for backward compatibility
export const validatePassword = authService.validatePassword.bind(authService);
export const hashPassword = authService.hashPassword.bind(authService);
export const comparePassword = authService.comparePassword.bind(authService);
export const generateAuthToken = authService.generateAuthToken.bind(authService);
