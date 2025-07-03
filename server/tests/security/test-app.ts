/**
 * Test application setup for security tests
 * Creates a minimal Express app with security middleware
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { sanitizeInput } from '../../src/middleware/inputSanitization';
import { rateLimiters } from '../../src/middleware/rateLimiter';
import jwt from 'jsonwebtoken';

// Test-specific authentication middleware that uses the correct JWT secret
const testAuthenticate = async (req: any, res: any, next: any) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Check cookies as fallback
    if (!token && req.cookies) {
      token = req.cookies.token || req.cookies.authToken;
    }

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided',
      });
    }

    // Verify token with the test JWT secret
    const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'teaching-engine',
      audience: 'teaching-engine-users',
    }) as any;

    // Attach user to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
      permissions: decoded.permissions || [],
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
};

// Wrapper to handle async authenticate middleware
const asyncAuthenticate = (req: any, res: any, next: any) => {
  testAuthenticate(req, res, next).catch(next);
};
import bcrypt from 'bcryptjs';

// JWT configuration will be handled by test-env.ts

export function createTestApp() {
  const app = express();

  // Security headers
  app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests",
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });

  // CORS
  const corsOptions = {
    origin: (origin: string | undefined, callback: Function) => {
      const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.use(cors(corsOptions));
  app.use(express.json({ limit: '1mb' })); // Limit payload size
  app.use(cookieParser());
  app.use(sanitizeInput);

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Mock user database
  const mockUsers = new Map();

  // Login endpoint with rate limiting
  // Skip rate limiting in test environment for login
  const loginRateLimit =
    process.env.NODE_ENV === 'test'
      ? (_req: any, _res: any, next: any) => next()
      : rateLimiters.auth;
  app.post('/api/login', loginRateLimit, async (req, res) => {
    try {
      const { email, password: passwordInput } = req.body as { email: string; password: string };

      // Input validation
      if (
        !email ||
        !passwordInput ||
        typeof email !== 'string' ||
        typeof passwordInput !== 'string'
      ) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const sanitizedEmail = email.trim().toLowerCase().slice(0, 255);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      const user = mockUsers.get(sanitizedEmail);
      if (!user) {
        // Simulate password comparison to prevent timing attacks
        await bcrypt.compare(passwordInput, '$2a$12$dummy.hash.to.prevent.timing.attacks');
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(passwordInput, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        {
          userId: user.id.toString(),
          email: user.email,
          role: user.role,
          permissions: [],
          iat: Math.floor(Date.now() / 1000),
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '7d',
          issuer: 'teaching-engine',
          audience: 'teaching-engine-users',
        },
      );

      const { password, ...userData } = user;

      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ user: userData });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Logout endpoint
  app.post('/api/logout', (_req, res) => {
    res.clearCookie('authToken');
    res.json({ message: 'Logged out successfully' });
  });

  // Protected endpoints for testing
  app.get('/api/auth/me', asyncAuthenticate, (req, res) => {
    const user = mockUsers.get(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password, ...userData } = user;
    res.json(userData);
  });

  // Test endpoints for validation
  app.post('/api/students', asyncAuthenticate, (req, res) => {
    const { firstName, lastName, grade } = req.body;

    // Basic validation
    if (!firstName || !lastName || grade === undefined || grade === null) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Empty string validation
    if (firstName.trim() === '' || lastName.trim() === '') {
      return res.status(400).json({ error: 'Names cannot be empty' });
    }

    // After sanitization, all values are strings - check if grade can be converted to number
    const gradeNum = typeof grade === 'number' ? grade : parseInt(grade);
    if (typeof firstName !== 'string' || typeof lastName !== 'string' || isNaN(gradeNum)) {
      return res.status(400).json({ error: 'Invalid data types' });
    }

    // Length validation
    if (firstName.length > 255 || lastName.length > 255) {
      return res.status(400).json({ error: 'Name too long' });
    }

    // Create mock student - note that sanitization has already occurred via middleware
    const student = {
      id: Math.floor(Math.random() * 1000),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: `${firstName.trim()} ${lastName.trim()}`,
      grade: gradeNum,
      userId: req.user.id,
    };

    res.status(201).json(student);
  });

  app.get('/api/students', asyncAuthenticate, (_req, res) => {
    res.json([]);
  });

  app.get('/api/students/:id', asyncAuthenticate, (req, res) => {
    res.status(404).json({ error: 'Student not found' });
  });

  app.put('/api/students/:id', asyncAuthenticate, (req, res) => {
    res.status(404).json({ error: 'Student not found' });
  });

  app.delete('/api/students/:id', asyncAuthenticate, (req, res) => {
    res.status(404).json({ error: 'Student not found' });
  });

  // Other test endpoints
  app.post('/api/unit-plans', asyncAuthenticate, (req, res) => {
    const { title, subject, grade, term } = req.body;

    if (!title || !subject || !grade || !term) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    res.status(201).json({
      id: Math.floor(Math.random() * 1000),
      title,
      subject,
      grade,
      term,
      userId: req.user.id,
    });
  });

  app.get('/api/unit-plans', asyncAuthenticate, (_req, res) => {
    res.json([]);
  });

  app.post('/api/long-range-plans', asyncAuthenticate, (req, res) => {
    const { title, subject, grade, year } = req.body;

    if (!title || !subject || !grade || !year) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    res.status(201).json({
      id: Math.floor(Math.random() * 1000),
      title,
      subject,
      grade,
      year,
      userId: req.user.id,
    });
  });

  app.get('/api/long-range-plans', asyncAuthenticate, (_req, res) => {
    res.json([]);
  });

  app.post('/api/etfo-lesson-plans', asyncAuthenticate, (req, res) => {
    const { title, subject, grade, date, content, objectives } = req.body;

    // Validate date first - after sanitization it might be empty
    if (date && typeof date === 'string' && date.trim()) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
    }

    if (!title || !subject || !grade || !date || !date.trim()) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    res.status(201).json({
      id: Math.floor(Math.random() * 1000),
      title,
      subject,
      grade,
      date,
      content: content || '',
      objectives: objectives || [],
      userId: req.user.id,
    });
  });

  app.get('/api/etfo-lesson-plans', asyncAuthenticate, (_req, res) => {
    res.json([]);
  });

  app.get('/api/curriculum-expectations', asyncAuthenticate, (_req, res) => {
    res.json([]);
  });

  // File upload endpoint
  app.post('/api/curriculum-import/upload', asyncAuthenticate, (req, res) => {
    res.status(404).json({ error: 'Not implemented in test' });
  });

  app.post('/api/curriculum/import', asyncAuthenticate, (req, res) => {
    res.status(404).json({ error: 'Not implemented in test' });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);

    // Handle JSON parsing errors
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Invalid JSON' });
    }

    // Handle payload too large
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Payload too large' });
    }

    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
    });
  });

  return {
    app,
    mockUsers,
  };
}
