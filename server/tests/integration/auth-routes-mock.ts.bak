/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Mock Authentication Routes for Testing
 * Provides complete authentication functionality with proper error handling
 */

import { Router } from 'express';
import { PrismaClient } from '@teaching-engine/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation
function validatePasswordStrength(password: string): boolean {
  // At least 8 characters, mix of upper/lower/number
  if (password.length < 8) return false;
  if (password === password.toLowerCase()) return false; // No uppercase
  if (password === password.toUpperCase()) return false; // No lowercase
  if (!/\d/.test(password)) return false; // No number
  return true;
}

export function authRoutes(prisma: PrismaClient): Router {
  const router = Router();

  // Login endpoint
  router.post('/login', async (req, res) => {
    try {
      console.log('[AUTH] Login attempt:', {
        email: req.body.email,
        hasPassword: !!req.body.password,
      });

      // Validate input types
      if (typeof req.body.email !== 'string' || typeof req.body.password !== 'string') {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      let { email, password } = req.body;

      // Check for missing fields
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Trim and process email
      email = email.trim();

      // Truncate very long emails
      if (email.length > 255) {
        email = email.substring(0, 255);
      }

      // Validate email format
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Find user (case-insensitive for PostgreSQL, exact match for SQLite)
      console.log('[AUTH] Searching for user with email:', email);
      const user = await prisma.user
        .findFirst({
          where: {
            email: email,
          },
        })
        .catch((err) => {
          console.error('[AUTH] Database error finding user:', err);
          console.error('[AUTH] Error details:', {
            code: err.code,
            message: err.message,
            clientVersion: err.clientVersion
          });
          throw err;
        });

      console.log('[AUTH] User found:', { found: !!user, email: user?.email });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password - check if it's already hashed or plain text (for tests)
      let isPasswordValid = false;
      if (user.password.startsWith('$2')) {
        // It's a bcrypt hash
        isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('[AUTH] Bcrypt comparison:', { isValid: isPasswordValid });
      } else {
        // Plain text comparison for test data
        isPasswordValid = password === user.password;
        console.log('[AUTH] Plain text comparison:', {
          isValid: isPasswordValid,
          expected: user.password,
          got: password,
        });
      }

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id.toString(),
          email: user.email,
          iat: Math.floor(Date.now() / 1000),
        },
        process.env.JWT_SECRET!,
        { algorithm: 'HS256' },
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      // Set httpOnly cookie
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      res.json({
        user: userWithoutPassword,
        token,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error stack:', error.stack);
      
      // Handle specific database errors
      if (error.code === 'P2002' || error.code === 'P2021' || error.code === 'P2025') {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Return 500 for unexpected errors
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Register endpoint
  router.post('/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;

      // Basic validation
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate types
      if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
        return res.status(400).json({ error: 'Invalid field types' });
      }

      // Validate email format
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Validate name
      if (name.trim().length === 0) {
        return res.status(400).json({ error: 'Name cannot be empty' });
      }

      // Validate password length
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      // Validate password strength for weak passwords
      if (!validatePasswordStrength(password)) {
        return res.status(400).json({ error: 'Password does not meet security requirements' });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({ error: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'USER',
          preferredLanguage: 'en',
        },
      });

      // Generate token
      const token = jwt.sign(
        {
          userId: user.id.toString(),
          email: user.email,
          iat: Math.floor(Date.now() / 1000),
        },
        process.env.JWT_SECRET!,
        { algorithm: 'HS256' },
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      // Set httpOnly cookie
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      res.status(201).json({
        user: userWithoutPassword,
        token,
      });
    } catch (error: any) {
      console.error('Register error:', error);

      // Handle Zod validation errors
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
