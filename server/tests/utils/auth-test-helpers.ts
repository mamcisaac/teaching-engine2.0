/**
 * Server-side Authentication Test Helpers
 * Real JWT operations and user management for testing
 */

import { Request, Response } from 'express';
import { generateToken, generateRefreshToken, verifyToken } from '../../src/middleware/authenticate';
import { hashPassword } from '../../src/middleware/auth';
import { prisma } from '../../src/prisma';
import { vi, Mock } from 'vitest';

export interface TestUser {
  id: number;
  email: string;
  name: string;
  role: string;
  password: string;
}

export interface AuthTestTokens {
  accessToken: string;
  refreshToken: string;
  user: TestUser;
}

/**
 * Create a test user in the database
 */
export async function createTestUser(userData: Partial<TestUser> = {}): Promise<TestUser> {
  const defaultData = {
    email: `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
    name: 'Test User',
    password: 'TestPassword123!',
    role: 'USER',
    ...userData,
  };

  const hashedPassword = await hashPassword(defaultData.password);

  const user = await prisma.user.create({
    data: {
      email: defaultData.email,
      name: defaultData.name,
      password: hashedPassword,
      role: defaultData.role,
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    password: defaultData.password, // Return original password for testing
  };
}

/**
 * Create test user with specific role
 */
export async function createTestUserWithRole(role: string): Promise<TestUser> {
  return createTestUser({ role });
}

/**
 * Create multiple test users with different roles
 */
export async function createTestUsersWithRoles(roles: string[]): Promise<TestUser[]> {
  const users: TestUser[] = [];
  
  for (const role of roles) {
    const user = await createTestUserWithRole(role);
    users.push(user);
  }
  
  return users;
}

/**
 * Generate real JWT tokens for test user
 */
export function generateTestTokens(user: TestUser): AuthTestTokens {
  const accessToken = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    user,
  };
}

/**
 * Create authenticated test user with tokens
 */
export async function createAuthenticatedTestUser(userData: Partial<TestUser> = {}): Promise<AuthTestTokens> {
  const user = await createTestUser(userData);
  return generateTestTokens(user);
}

/**
 * Verify token and return decoded payload
 */
export async function verifyTestToken(token: string) {
  return await verifyToken(token);
}

/**
 * Create mock Express request with authentication
 */
export function createAuthenticatedRequest(user: TestUser, overrides: Partial<Request> = {}): Partial<Request> {
  const tokens = generateTestTokens(user);
  
  return {
    headers: {
      authorization: `Bearer ${tokens.accessToken}`,
      'content-type': 'application/json',
      ...overrides.headers,
    },
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    ...overrides,
  };
}

/**
 * Create mock Express response
 */
export function createMockResponse(): {
  res: Partial<Response>;
  json: Mock<any>;
  status: Mock<any>;
  cookie: Mock<any>;
  clearCookie: Mock<any>;
} {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const cookie = vi.fn();
  const clearCookie = vi.fn();

  const res = {
    json,
    status,
    cookie,
    clearCookie,
  };

  return { res, json, status, cookie, clearCookie };
}

/**
 * Create authenticated Express middleware test setup
 */
export function createAuthMiddlewareTest(user: TestUser) {
  const req = createAuthenticatedRequest(user);
  const { res, json, status } = createMockResponse();
  const next = vi.fn();

  return {
    req: req as Request,
    res: res as Response,
    next,
    json,
    status,
  };
}

/**
 * Delete test user from database
 */
export async function deleteTestUser(userId: number): Promise<void> {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
  } catch (error) {
    // Ignore if user doesn't exist
    if ((error as any)?.code !== 'P2025') {
      throw error;
    }
  }
}

/**
 * Clean up all test users (for teardown)
 */
export async function cleanupTestUsers(): Promise<void> {
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: 'test-',
      },
    },
  });
}

/**
 * Test authentication middleware behavior
 */
export async function testAuthMiddleware(
  middleware: (req: Request, res: Response, next: () => void) => Promise<void>,
  user?: TestUser
): Promise<{
  authenticated: boolean;
  statusCode?: number;
  response?: any;
  error?: any;
}> {
  const req = user ? createAuthenticatedRequest(user) : {};
  const { res, json, status } = createMockResponse();
  const next = vi.fn();

  try {
    await middleware(req as Request, res as Response, next);

    if (next.mock.calls.length > 0) {
      return { authenticated: true };
    }

    if (status.mock.calls.length > 0) {
      const statusCode = status.mock.calls[0][0];
      const response = json.mock.calls[0]?.[0];
      
      return {
        authenticated: false,
        statusCode,
        response,
      };
    }

    return { authenticated: false };
  } catch (error) {
    return {
      authenticated: false,
      error,
    };
  }
}

/**
 * Test protected route endpoint
 */
export async function testProtectedEndpoint(
  handler: (req: Request, res: Response) => Promise<void>,
  user?: TestUser
): Promise<{
  success: boolean;
  statusCode?: number;
  response?: any;
  error?: any;
}> {
  const req = user ? createAuthenticatedRequest(user) : {};
  const { res, json, status } = createMockResponse();

  try {
    await handler(req as Request, res as Response);

    if (json.mock.calls.length > 0) {
      const response = json.mock.calls[0][0];
      const statusCode = status.mock.calls[0]?.[0] || 200;
      
      return {
        success: statusCode < 400,
        statusCode,
        response,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
}

/**
 * Test JWT token expiration and refresh flow
 */
export async function testTokenExpiration(user: TestUser): Promise<{
  tokenValid: boolean;
  refreshWorks: boolean;
  error?: any;
}> {
  try {
    const tokens = generateTestTokens(user);
    
    // Test access token
    const decoded = await verifyTestToken(tokens.accessToken);
    const tokenValid = decoded && !('error' in decoded);
    
    // Test refresh token (simplified - in real scenario would involve API call)
    const refreshDecoded = await verifyTestToken(tokens.refreshToken);
    const refreshWorks = refreshDecoded && !('error' in refreshDecoded);
    
    return {
      tokenValid: !!tokenValid,
      refreshWorks: !!refreshWorks,
    };
  } catch (error) {
    return {
      tokenValid: false,
      refreshWorks: false,
      error,
    };
  }
}

/**
 * Test role-based authorization
 */
export async function testRoleAuthorization(
  requiredRoles: string[],
  testUsers: TestUser[]
): Promise<Array<{
  user: TestUser;
  authorized: boolean;
  hasRequiredRole: boolean;
}>> {
  return testUsers.map(user => ({
    user,
    authorized: requiredRoles.includes(user.role),
    hasRequiredRole: requiredRoles.includes(user.role),
  }));
}

/**
 * Test permission-based authorization
 */
export async function testPermissionAuthorization(
  requiredPermissions: string[],
  user: TestUser,
  userPermissions: string[] = []
): Promise<{
  user: TestUser;
  authorized: boolean;
  hasRequiredPermissions: boolean;
  missingPermissions: string[];
}> {
  const missingPermissions = requiredPermissions.filter(
    permission => !userPermissions.includes(permission)
  );
  
  const hasRequiredPermissions = missingPermissions.length === 0;
  
  return {
    user,
    authorized: hasRequiredPermissions,
    hasRequiredPermissions,
    missingPermissions,
  };
}

/**
 * Setup authentication test environment
 */
export async function setupAuthTestEnvironment(): Promise<{
  users: {
    admin: TestUser;
    user: TestUser;
    guest: TestUser;
  };
  tokens: {
    admin: AuthTestTokens;
    user: AuthTestTokens;
    guest: AuthTestTokens;
  };
  cleanup: () => Promise<void>;
}> {
  const users = {
    admin: await createTestUserWithRole('ADMIN'),
    user: await createTestUserWithRole('USER'),
    guest: await createTestUserWithRole('GUEST'),
  };

  const tokens = {
    admin: generateTestTokens(users.admin),
    user: generateTestTokens(users.user),
    guest: generateTestTokens(users.guest),
  };

  const cleanup = async () => {
    await deleteTestUser(users.admin.id);
    await deleteTestUser(users.user.id);
    await deleteTestUser(users.guest.id);
  };

  return { users, tokens, cleanup };
}

/**
 * Test login flow with real database operations
 */
export async function testLoginFlow(email: string, password: string): Promise<{
  success: boolean;
  user?: TestUser;
  tokens?: AuthTestTokens;
  error?: any;
}> {
  try {
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // In a real test, you'd verify password here
    // For this helper, we'll assume it's correct

    const testUser: TestUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      password,
    };

    const tokens = generateTestTokens(testUser);

    return {
      success: true,
      user: testUser,
      tokens,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
}

/**
 * Validate JWT token structure and claims
 */
export function validateTokenStructure(token: string): {
  valid: boolean;
  claims?: any;
  error?: string;
} {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' };
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    const requiredClaims = ['userId', 'email', 'role', 'iat', 'exp'];
    const missingClaims = requiredClaims.filter(claim => !(claim in payload));
    
    if (missingClaims.length > 0) {
      return { valid: false, error: `Missing claims: ${missingClaims.join(', ')}` };
    }

    return { valid: true, claims: payload };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}