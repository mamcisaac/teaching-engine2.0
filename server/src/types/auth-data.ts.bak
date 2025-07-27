/**
 * Type definitions for authentication operations
 */

// Request body types
export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface RegisterRequestBody {
  email: string;
  password: string;
  name: string;
  organizationId?: number;
}

export interface ChangePasswordRequestBody {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequestBody {
  email: string;
}

export interface ResetPasswordRequestBody {
  token: string;
  newPassword: string;
}

// Response types
export interface AuthUserResponse {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

export interface LoginResponse {
  user: AuthUserResponse;
  accessToken: string;
}

export interface RegisterResponse {
  user: AuthUserResponse;
  accessToken: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string; // Only in development
}

export interface MessageResponse {
  message: string;
}

// Database user type
export interface DatabaseUser {
  id: number;
  email: string;
  password: string;
  name: string | null;
  role: string;
  preferredLanguage?: string | null;
  organizationId?: number | null;
}

// Token payload types
export interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

export interface ResetTokenPayload {
  userId: string;
  type: 'password-reset';
  exp: number;
  iat?: number;
}

// Password validation
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

// Prisma error types
export interface PrismaError {
  message?: string;
  code?: string;
  name?: string;
  stack?: string;
  meta?: unknown;
  toString?: () => string;
}

// Type guards
export function isLoginRequestBody(body: unknown): body is LoginRequestBody {
  return typeof body === 'object' && 
         body !== null && 
         'email' in body && 
         'password' in body &&
         typeof (body as LoginRequestBody).email === 'string' &&
         typeof (body as LoginRequestBody).password === 'string';
}

export function isRegisterRequestBody(body: unknown): body is RegisterRequestBody {
  return typeof body === 'object' && 
         body !== null && 
         'email' in body && 
         'password' in body &&
         'name' in body &&
         typeof (body as RegisterRequestBody).email === 'string' &&
         typeof (body as RegisterRequestBody).password === 'string' &&
         typeof (body as RegisterRequestBody).name === 'string';
}

export function isChangePasswordRequestBody(body: unknown): body is ChangePasswordRequestBody {
  return typeof body === 'object' && 
         body !== null && 
         'currentPassword' in body && 
         'newPassword' in body &&
         typeof (body as ChangePasswordRequestBody).currentPassword === 'string' &&
         typeof (body as ChangePasswordRequestBody).newPassword === 'string';
}

export function isForgotPasswordRequestBody(body: unknown): body is ForgotPasswordRequestBody {
  return typeof body === 'object' && 
         body !== null && 
         'email' in body &&
         typeof (body as ForgotPasswordRequestBody).email === 'string';
}

export function isResetPasswordRequestBody(body: unknown): body is ResetPasswordRequestBody {
  return typeof body === 'object' && 
         body !== null && 
         'token' in body && 
         'newPassword' in body &&
         typeof (body as ResetPasswordRequestBody).token === 'string' &&
         typeof (body as ResetPasswordRequestBody).newPassword === 'string';
}