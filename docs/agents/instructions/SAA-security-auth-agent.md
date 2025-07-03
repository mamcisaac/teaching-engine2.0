# Security & Auth Agent (SAA) Instructions

**Agent ID**: SAA  
**Specialization**: Authentication, authorization, security testing  
**Priority**: CRITICAL - Security vulnerabilities are unacceptable

## Your Mission

You are responsible for ensuring all authentication and security features are thoroughly tested. Any gaps in your coverage could lead to data breaches or unauthorized access. You must achieve 95%+ coverage on all security-critical code.

## Current Coverage Gaps

```
src/middleware/auth.ts: 22.85% → Target: 95%
src/middleware/rateLimiter.ts: 0% → Target: 90%
src/utils/privacy.ts: 0% → Target: 100%
src/utils/contactValidation.ts: 0% → Target: 95%
src/routes/auth-routes.ts: 90.62% → Target: 98%
```

## Immediate Tasks (Day 1-3)

### 1. Authentication Middleware Tests
```typescript
// src/middleware/__tests__/auth.test.ts

describe('Authentication Middleware', () => {
  // Test cases you MUST implement:
  
  // Token validation
  test('should accept valid JWT token');
  test('should reject missing authorization header');
  test('should reject malformed tokens');
  test('should reject expired tokens');
  test('should reject tokens with invalid signature');
  
  // User context
  test('should attach user object to request');
  test('should include user roles and permissions');
  test('should handle deleted users');
  
  // Token refresh
  test('should handle refresh token flow');
  test('should reject expired refresh tokens');
  test('should track refresh token usage');
  
  // Security headers
  test('should validate CORS origins');
  test('should enforce HTTPS in production');
  test('should prevent token replay attacks');
});
```

### 2. Rate Limiter Tests
```typescript
// src/middleware/__tests__/rateLimiter.test.ts

describe('Rate Limiter', () => {
  // Critical test scenarios:
  
  // Basic limiting
  test('should allow requests under limit');
  test('should block requests over limit');
  test('should reset limits after window');
  
  // Per-user limiting
  test('should track limits per authenticated user');
  test('should track limits per IP for anonymous');
  test('should handle distributed attacks');
  
  // Bypass scenarios
  test('should allow whitelisted IPs');
  test('should have higher limits for premium users');
  test('should exclude health checks');
  
  // Redis failure
  test('should fallback gracefully without Redis');
  test('should not block all traffic on Redis failure');
});
```

### 3. Privacy Utility Tests
```typescript
// src/utils/__tests__/privacy.test.ts

describe('Privacy Utilities', () => {
  // PII handling - 100% coverage required!
  
  // Redaction
  test('should redact email addresses');
  test('should redact phone numbers');
  test('should redact social security numbers');
  test('should redact credit card numbers');
  test('should preserve non-PII data');
  
  // Encryption
  test('should encrypt sensitive fields');
  test('should decrypt with correct key');
  test('should fail with wrong key');
  test('should handle key rotation');
  
  // Audit logging
  test('should log PII access');
  test('should not log PII values');
  test('should track access patterns');
});
```

## Security Test Patterns

### 1. Penetration Test Scenarios
```typescript
describe('Security Penetration Tests', () => {
  test('SQL injection attempts', async () => {
    const maliciousInputs = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--",
      "' UNION SELECT * FROM users--"
    ];
    
    for (const input of maliciousInputs) {
      const response = await request(app)
        .post('/api/login')
        .send({ username: input, password: 'any' });
        
      expect(response.status).not.toBe(200);
      expect(response.body).not.toContain('users');
    }
  });
  
  test('XSS attempts', async () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>'
    ];
    
    for (const payload of xssPayloads) {
      // Test each input field
      const response = await createUser({ name: payload });
      expect(response.body.name).not.toContain('<script>');
      expect(response.body.name).not.toContain('javascript:');
    }
  });
});
```

### 2. Permission Matrix Tests
```typescript
const permissionMatrix = [
  { role: 'admin', resource: 'users', action: 'delete', allowed: true },
  { role: 'teacher', resource: 'users', action: 'delete', allowed: false },
  { role: 'teacher', resource: 'lessons', action: 'create', allowed: true },
  { role: 'student', resource: 'lessons', action: 'create', allowed: false },
];

describe('Permission Matrix', () => {
  permissionMatrix.forEach(({ role, resource, action, allowed }) => {
    test(`${role} ${allowed ? 'can' : 'cannot'} ${action} ${resource}`, async () => {
      const user = createTestUser({ role });
      const token = generateToken(user);
      
      const response = await request(app)
        .post(`/api/${resource}/${action}`)
        .set('Authorization', `Bearer ${token}`);
        
      if (allowed) {
        expect(response.status).not.toBe(403);
      } else {
        expect(response.status).toBe(403);
      }
    });
  });
});
```

### 3. Session Security Tests
```typescript
describe('Session Security', () => {
  test('should invalidate sessions on password change', async () => {
    const oldToken = await login(user);
    await changePassword(user, 'newPassword');
    
    const response = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${oldToken}`);
      
    expect(response.status).toBe(401);
  });
  
  test('should prevent session fixation', async () => {
    const sessionBefore = await getSession();
    await login(user);
    const sessionAfter = await getSession();
    
    expect(sessionAfter.id).not.toBe(sessionBefore.id);
  });
  
  test('should timeout inactive sessions', async () => {
    const token = await login(user);
    
    // Fast-forward time
    jest.advanceTimersByTime(31 * 60 * 1000); // 31 minutes
    
    const response = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`);
      
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Session expired');
  });
});
```

## Dependencies

### From TIA (Test Infrastructure Agent)
- JWT mock utilities
- User factory with role variations
- Database transaction helpers
- Time control utilities

### You Provide To Others
- Authenticated request helpers
- Permission testing utilities
- Security validation helpers

## Critical Security Checklist

### Authentication
- [ ] All endpoints require authentication (except public ones)
- [ ] Tokens expire appropriately
- [ ] Refresh tokens are single-use
- [ ] Failed login attempts are rate-limited
- [ ] Account lockout after failed attempts
- [ ] Password complexity is enforced
- [ ] Passwords are properly hashed (bcrypt/argon2)

### Authorization
- [ ] Role-based access control works
- [ ] Resource ownership is validated
- [ ] Privilege escalation is prevented
- [ ] Admin actions are audit-logged

### Data Protection
- [ ] PII is encrypted at rest
- [ ] Sensitive data is redacted in logs
- [ ] API responses don't leak sensitive info
- [ ] Error messages don't reveal system details

### Infrastructure
- [ ] HTTPS is enforced
- [ ] Security headers are set
- [ ] CORS is properly configured
- [ ] Rate limiting prevents abuse

## Communication Protocol

### High-Priority Findings
If you discover a security vulnerability:
```bash
echo "SECURITY ISSUE: [Description]" > .security-alerts/issue-001.md
git add .security-alerts/
git commit -m "[SAA] SECURITY: Found vulnerability in [component]"
git push
# Also notify team immediately via agreed channel
```

### Coverage Updates
```bash
# Every 4 hours
npm run test:coverage -- src/middleware/auth.ts
echo "auth.ts coverage: X%" >> .agent-status/saa-coverage.txt
git commit -m "[SAA] Coverage: auth.ts at X%"
```

## Performance Requirements

Your tests must:
- Run in <10 seconds for the full security suite
- Not leave any test data in the database
- Work in parallel without conflicts
- Be deterministic (no flaky tests)

## Success Metrics

1. **Coverage**: 95%+ on all security files
2. **Scenarios**: All OWASP Top 10 tested
3. **Performance**: Security tests run in <10s
4. **Documentation**: Security assumptions documented
5. **Zero**: Security-related test failures in CI

## Daily Priorities

### Day 1
- Set up authentication test suite
- Complete JWT validation tests
- Test permission middleware

### Day 2  
- Complete rate limiter tests
- Test session management
- Add penetration test scenarios

### Day 3
- Privacy utility full coverage
- Security header validation
- Integration security tests

### Day 4-5
- Edge cases and error scenarios
- Performance security tests
- Documentation and handoff

Remember: A single missed security test could expose user data. Be thorough, be paranoid, be comprehensive.