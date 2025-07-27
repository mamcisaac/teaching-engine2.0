import type { Request } from 'express';
import type { JwtPayload } from 'jsonwebtoken';

// User roles enum
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  SUPPORT = 'SUPPORT',
}

// JWT token payload
export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
  permissions?: string[];
}

// User attached to authenticated requests
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: number;
}

// Authenticated request type
export interface AuthRequest extends Request {
  user?: AuthUser;
}

// JWT configuration
export interface JWTConfig {
  secret: string;
  expiresIn: string | number;
  refreshExpiresIn: string | number;
  issuer: string;
  audience: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration data
export interface RegistrationData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  organizationId?: number;
}

// Token response
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType: string;
}

// User response (without sensitive data)
export interface UserResponse {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: number;
  createdAt: Date;
  updatedAt: Date;
}