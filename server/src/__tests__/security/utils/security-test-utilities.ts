/**
 * Security Test Utilities
 * Common utilities and helpers for security testing
 */

import { PrismaClient } from '@teaching-engine/database';
import { generateAuthToken } from '../../../services/authService';
import bcrypt from 'bcryptjs';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: string;
  token: string;
}

export interface SecurityTestContext {
  prisma: PrismaClient;
  users: {
    admin: TestUser;
    moderator: TestUser;
    user: TestUser;
    inactive: TestUser;
  };
  tokens: {
    valid: string;
    expired: string;
    invalid: string;
    tampered: string;
  };
}

/**
 * Create test users with different roles for security testing
 */
export async function createSecurityTestUsers(
  prisma: PrismaClient,
): Promise<SecurityTestContext['users']> {
  const hashedPassword = await bcrypt.hash('SecureTestPassword123!', 10);
  const timestamp = Date.now();

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: `security.admin.${timestamp}@test.com`,
      name: 'Security Test Admin',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  // Create moderator user
  const moderatorUser = await prisma.user.create({
    data: {
      email: `security.moderator.${timestamp}@test.com`,
      name: 'Security Test Moderator',
      password: hashedPassword,
      role: 'MODERATOR',
      isActive: true,
    },
  });

  // Create regular user
  const regularUser = await prisma.user.create({
    data: {
      email: `security.user.${timestamp}@test.com`,
      name: 'Security Test User',
      password: hashedPassword,
      role: 'USER',
      isActive: true,
    },
  });

  // Create inactive user
  const inactiveUser = await prisma.user.create({
    data: {
      email: `security.inactive.${timestamp}@test.com`,
      name: 'Security Test Inactive User',
      password: hashedPassword,
      role: 'USER',
      isActive: false,
    },
  });

  // Generate tokens
  const adminToken = await generateAuthToken(adminUser.id.toString(), adminUser.email);
  const moderatorToken = await generateAuthToken(moderatorUser.id.toString(), moderatorUser.email);
  const userToken = await generateAuthToken(regularUser.id.toString(), regularUser.email);
  const inactiveToken = await generateAuthToken(inactiveUser.id.toString(), inactiveUser.email);

  return {
    admin: {
      id: adminUser.id.toString(),
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      token: adminToken,
    },
    moderator: {
      id: moderatorUser.id.toString(),
      email: moderatorUser.email,
      name: moderatorUser.name,
      role: moderatorUser.role,
      token: moderatorToken,
    },
    user: {
      id: regularUser.id.toString(),
      email: regularUser.email,
      name: regularUser.name,
      role: regularUser.role,
      token: userToken,
    },
    inactive: {
      id: inactiveUser.id.toString(),
      email: inactiveUser.email,
      name: inactiveUser.name,
      role: inactiveUser.role,
      token: inactiveToken,
    },
  };
}

/**
 * Create test tokens for security testing
 */
export async function createSecurityTestTokens(
  testUser: TestUser,
): Promise<SecurityTestContext['tokens']> {
  const jwt = await import('jsonwebtoken');
  const secret = process.env.JWT_SECRET!;

  // Valid token
  const validToken = testUser.token;

  // Expired token
  const expiredToken = jwt.sign({ userId: testUser.id, email: testUser.email }, secret, {
    expiresIn: '1ms',
  });

  // Invalid token (wrong secret)
  const invalidToken = jwt.sign({ userId: testUser.id, email: testUser.email }, 'wrong-secret', {
    expiresIn: '1h',
  });

  // Tampered token
  const tamperedToken = validToken.slice(0, -5) + 'XXXXX';

  return {
    valid: validToken,
    expired: expiredToken,
    invalid: invalidToken,
    tampered: tamperedToken,
  };
}

/**
 * Clean up test users after security testing
 */
export async function cleanupSecurityTestUsers(
  prisma: PrismaClient,
  users: SecurityTestContext['users'],
): Promise<void> {
  const userIds = Object.values(users).map((user) => parseInt(user.id));

  await prisma.user.deleteMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });
}

/**
 * Clean up test data by email pattern
 */
export async function cleanupTestDataByEmail(
  prisma: PrismaClient,
  emailPattern: string,
): Promise<void> {
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: emailPattern,
      },
    },
  });
}

/**
 * Generate test data for performance and load testing
 */
export async function generateTestData(
  prisma: PrismaClient,
  count: number = 100,
): Promise<TestUser[]> {
  const users: TestUser[] = [];
  const hashedPassword = await bcrypt.hash('TestPassword123!', 10);

  for (let i = 0; i < count; i++) {
    const user = await prisma.user.create({
      data: {
        email: `load.test.${i}.${Date.now()}@test.com`,
        name: `Load Test User ${i}`,
        password: hashedPassword,
        role: 'USER',
        isActive: true,
      },
    });

    const token = await generateAuthToken(user.id.toString(), user.email);

    users.push({
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      token,
    });
  }

  return users;
}

/**
 * Simulate concurrent requests for load testing
 */
export async function simulateConcurrentRequests<T>(
  requestFn: () => Promise<T>,
  concurrency: number = 10,
  totalRequests: number = 100,
): Promise<T[]> {
  const results: T[] = [];
  const batches = Math.ceil(totalRequests / concurrency);

  for (let batch = 0; batch < batches; batch++) {
    const batchSize = Math.min(concurrency, totalRequests - batch * concurrency);
    const batchPromises = Array.from({ length: batchSize }, () => requestFn());

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Measure response time for performance testing
 */
export async function measureResponseTime<T>(
  fn: () => Promise<T>,
): Promise<{ result: T; duration: number }> {
  const startTime = Date.now();
  const result = await fn();
  const duration = Date.now() - startTime;

  return { result, duration };
}

/**
 * Generate random test data
 */
export class TestDataGenerator {
  static randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static randomEmail(): string {
    return `${this.randomString(8)}@${this.randomString(6)}.com`;
  }

  static randomPassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';

    let password = '';
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));

    // Add random characters to reach minimum length
    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = password.length; i < 12; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  static randomRole(): string {
    const roles = ['USER', 'MODERATOR', 'ADMIN'];
    return roles[Math.floor(Math.random() * roles.length)];
  }
}

/**
 * Security assertion helpers
 */
export class SecurityAssertions {
  /**
   * Assert that a response does not contain sensitive information
   */
  static assertNoSensitiveData(data: any): void {
    const sensitiveFields = [
      'password',
      'passwordHash',
      'secret',
      'privateKey',
      'token',
      'jwt',
      'ssn',
      'creditCard',
      'bankAccount',
    ];

    const dataString = JSON.stringify(data).toLowerCase();

    for (const field of sensitiveFields) {
      if (dataString.includes(field)) {
        throw new Error(`Response contains sensitive field: ${field}`);
      }
    }
  }

  /**
   * Assert that a string does not contain malicious content
   */
  static assertSanitized(input: string): void {
    const maliciousPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /onclick=/i,
      /drop\s+table/i,
      /union\s+select/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /--/,
      /\/\*/,
      /\$\{.*\}/,
      /\#\{.*\}/,
      /\{\{.*\}\}/,
      /\.\.\//,
      /\.\.\\/,
      /\x00/,
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(input)) {
        throw new Error(`Input contains malicious pattern: ${pattern.source}`);
      }
    }
  }

  /**
   * Assert that a response time is within acceptable limits
   */
  static assertResponseTime(duration: number, maxDuration: number = 5000): void {
    if (duration > maxDuration) {
      throw new Error(`Response time ${duration}ms exceeds maximum ${maxDuration}ms`);
    }
  }

  /**
   * Assert that rate limiting is working
   */
  static assertRateLimited(response: any): void {
    if (response.status !== 429) {
      throw new Error(`Expected rate limit (429), got ${response.status}`);
    }

    if (!response.headers['retry-after']) {
      throw new Error('Rate limited response missing Retry-After header');
    }

    if (!response.headers['x-ratelimit-limit']) {
      throw new Error('Rate limited response missing X-RateLimit-Limit header');
    }
  }
}

/**
 * Security test runner with common patterns
 */
export class SecurityTestRunner {
  private prisma: PrismaClient;
  private testUsers: SecurityTestContext['users'] | null = null;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Setup security test environment
   */
  async setup(): Promise<SecurityTestContext> {
    this.testUsers = await createSecurityTestUsers(this.prisma);
    const tokens = await createSecurityTestTokens(this.testUsers.user);

    return {
      prisma: this.prisma,
      users: this.testUsers,
      tokens,
    };
  }

  /**
   * Cleanup security test environment
   */
  async cleanup(): Promise<void> {
    if (this.testUsers) {
      await cleanupSecurityTestUsers(this.prisma, this.testUsers);
      this.testUsers = null;
    }
  }

  /**
   * Run authentication bypass tests
   */
  async testAuthenticationBypass(
    requestFn: (token?: string) => Promise<any>,
    expectStatus: number = 401,
  ): Promise<void> {
    const bypassAttempts = [
      undefined, // No token
      '', // Empty token
      'invalid-token', // Invalid token
      'Bearer', // Bearer without token
      'Bearer ', // Bearer with space only
      'Bearer invalid', // Bearer with invalid token
      'Basic dXNlcjpwYXNz', // Basic auth instead of Bearer
      'Token valid-token', // Wrong auth scheme
    ];

    for (const attempt of bypassAttempts) {
      const response = await requestFn(attempt);

      if (response.status !== expectStatus) {
        throw new Error(`Authentication bypass attempt succeeded with: ${attempt || 'no token'}`);
      }
    }
  }

  /**
   * Run authorization escalation tests
   */
  async testAuthorizationEscalation(
    requestFn: (token: string) => Promise<any>,
    requiredRole: string = 'ADMIN',
  ): Promise<void> {
    if (!this.testUsers) {
      throw new Error('Test users not initialized. Call setup() first.');
    }

    const testTokens = [this.testUsers.user.token, this.testUsers.moderator.token];

    // Only test with tokens that shouldn't have access
    const tokensToTest =
      requiredRole === 'ADMIN' ? testTokens : testTokens.filter((_, index) => index === 0); // Only user token for moderator-required endpoints

    for (const token of tokensToTest) {
      const response = await requestFn(token);

      if (response.status < 400) {
        throw new Error(`Authorization escalation successful with insufficient privileges`);
      }
    }
  }

  /**
   * Test input validation with malicious payloads
   */
  async testInputValidation(
    requestFn: (payload: any) => Promise<any>,
    maliciousPayloads: any[],
  ): Promise<void> {
    for (const payload of maliciousPayloads) {
      const response = await requestFn(payload);

      // Should either reject the input or sanitize it
      if (response.status === 200) {
        // If accepted, ensure content is sanitized
        SecurityAssertions.assertSanitized(JSON.stringify(response.body));
      } else {
        // Should return appropriate error status
        if (response.status < 400 || response.status >= 500) {
          throw new Error(
            `Unexpected status ${response.status} for malicious payload: ${JSON.stringify(payload)}`,
          );
        }
      }
    }
  }

  /**
   * Test rate limiting behavior
   */
  async testRateLimiting(
    requestFn: () => Promise<any>,
    maxRequests: number = 10,
    windowMs: number = 60000,
  ): Promise<void> {
    const requests = [];

    // Make requests to exceed rate limit
    for (let i = 0; i < maxRequests + 5; i++) {
      requests.push(requestFn());
    }

    const responses = await Promise.all(requests);

    // Should have some rate limited responses
    const rateLimitedCount = responses.filter((r) => r.status === 429).length;

    if (rateLimitedCount === 0) {
      throw new Error('Rate limiting not working - no requests were rate limited');
    }

    // Check rate limit headers
    const rateLimitedResponse = responses.find((r) => r.status === 429);
    if (rateLimitedResponse) {
      SecurityAssertions.assertRateLimited(rateLimitedResponse);
    }
  }
}

export default {
  createSecurityTestUsers,
  createSecurityTestTokens,
  cleanupSecurityTestUsers,
  cleanupTestDataByEmail,
  generateTestData,
  simulateConcurrentRequests,
  measureResponseTime,
  TestDataGenerator,
  SecurityAssertions,
  SecurityTestRunner,
};
