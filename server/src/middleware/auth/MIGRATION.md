# Authentication Module Migration Guide

## Overview

We've consolidated the split authentication logic from `auth.ts` (626 lines) and `authenticate.ts` (591 lines) into a modular, well-organized authentication system.

## New Structure

```
src/middleware/auth/
├── index.ts       # Main exports
├── jwt.ts         # JWT token management
├── password.ts    # Password hashing and validation
├── middleware.ts  # Express middleware functions
├── strategies.ts  # Authentication strategies (login, register, etc.)
└── types.ts       # TypeScript interfaces and types
```

## Migration Steps

### 1. Update Imports

**Old:**
```typescript
import { authenticate, authorize } from '../middleware/authenticate';
import { hashPassword, verifyPassword } from '../middleware/auth';
import { generateToken, generateRefreshToken } from '../middleware/authenticate';
```

**New:**
```typescript
import { 
  authenticate, 
  authorize, 
  hashPassword, 
  verifyPassword,
  generateAccessToken,
  generateRefreshToken 
} from '../middleware/auth';
```

### 2. Update Token Generation

**Old:**
```typescript
const token = generateToken(user);
```

**New:**
```typescript
// For backward compatibility
const token = generateToken(user);

// Or use the new explicit names
const accessToken = generateAccessToken(user);
const refreshToken = generateRefreshToken(user.id);

// Or generate both at once
const { accessToken, refreshToken } = generateTokenPair(user);
```

### 3. Update Authentication Strategies

**Old:**
```typescript
// Scattered across routes
const hashedPassword = await hashPassword(password);
const user = await prisma.user.create({ ... });
const token = generateToken(user);
```

**New:**
```typescript
import { register, login } from '../middleware/auth';

// Register
const { user, tokens } = await register({
  email,
  password,
  name,
  role,
});

// Login
const { user, tokens } = await login({ email, password });
```

### 4. Update Route Protection

**Old:**
```typescript
router.get('/protected', authenticate, async (req, res) => {
  // Access user via req.user
});

router.get('/admin', authenticate, authorize('ADMIN'), async (req, res) => {
  // Admin only route
});
```

**New:**
```typescript
import { authenticate, authorize, UserRole } from '../middleware/auth';

router.get('/protected', authenticate, async (req, res) => {
  // Access user via req.user (type-safe with AuthRequest)
});

router.get('/admin', authenticate, authorize(UserRole.ADMIN), async (req, res) => {
  // Admin only route
});
```

### 5. Type Safety

**Old:**
```typescript
// Loose typing
req.user = { id: user.id, email: user.email };
```

**New:**
```typescript
import { AuthRequest } from '../middleware/auth';

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  const user = req.user; // Fully typed!
  res.json(user);
});
```

## Benefits

1. **Single Source of Truth** - All auth logic in one place
2. **Better Organization** - Clear separation of concerns
3. **Type Safety** - Full TypeScript support with proper types
4. **Easier Testing** - Modular structure makes testing easier
5. **Consistent API** - Unified interface for all auth operations
6. **Better Error Handling** - Consistent error messages and types

## Deprecated Functions

The following are deprecated but still available for backward compatibility:

- `generateToken()` - Use `generateAccessToken()` instead
- Direct password hashing in routes - Use `register()` strategy
- Manual token verification - Use `authenticate` middleware

## New Features

1. **Password Strength Validation** - Built-in password requirements
2. **Token Pair Generation** - Access + refresh tokens
3. **Optional Authentication** - `optionalAuthenticate` middleware
4. **Organization Requirements** - `requireOrganization` middleware
5. **Password Reset Flow** - Complete reset functionality
6. **Change Password** - Secure password change with verification

## Example: Complete Auth Flow

```typescript
import { 
  register, 
  login, 
  authenticate, 
  authorize, 
  UserRole 
} from '../middleware/auth';

// Registration endpoint
router.post('/auth/register', async (req, res, next) => {
  try {
    const { user, tokens } = await register(req.body);
    res.json({ user, tokens });
  } catch (error) {
    next(error);
  }
});

// Login endpoint
router.post('/auth/login', async (req, res, next) => {
  try {
    const { user, tokens } = await login(req.body);
    res.json({ user, tokens });
  } catch (error) {
    next(error);
  }
});

// Protected endpoint
router.get('/api/profile', authenticate, async (req: AuthRequest, res) => {
  res.json(req.user);
});

// Role-based endpoint
router.delete(
  '/api/users/:id', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  async (req, res) => {
    // Admin only
  }
);
```