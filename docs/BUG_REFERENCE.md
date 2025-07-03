# Bug Reference Guide

**Last Updated**: 2025-07-03  
**Version**: 1.0.0

Comprehensive bug reference documentation for Teaching Engine 2.0 with known issues, solutions, and troubleshooting guidance.

## Overview

This document serves as the central repository for all known bugs, issues, and their solutions in Teaching Engine 2.0. It follows a structured approach to bug classification, documentation, and resolution tracking.

### Bug Tracking Philosophy

- **Transparency**: All bugs are documented openly with clear descriptions
- **Accountability**: Each bug includes root cause analysis and prevention strategies
- **Continuous Improvement**: Bugs are learning opportunities for system enhancement
- **User-Centric**: Focus on impact to teacher workflows and student outcomes

### Bug Classification System

| Severity     | Description                                         | Response Time |
| ------------ | --------------------------------------------------- | ------------- |
| **Critical** | System crashes, data loss, security vulnerabilities | < 2 hours     |
| **High**     | Major feature failures, performance issues          | < 24 hours    |
| **Medium**   | Minor feature issues, UI problems                   | < 1 week      |
| **Low**      | Enhancement requests, cosmetic issues               | Next release  |

## 🐛 Known Resolved Issues

### Feature Scope Issues

#### Issue #000: Collaboration Feature Creep Removal

**Status**: Resolved  
**Severity**: Medium  
**Last Occurred**: 2025-07-03

**Description**: The application had accumulated extensive collaboration features (teams, sharing, comments, resource libraries) that went beyond the core scope of single-teacher planning assistance.

**Root Cause**:

- Feature creep during development that extended beyond single-teacher use case
- Database models and UI components for multi-teacher collaboration
- Complex sharing and team management systems
- Public template libraries that encouraged collaboration

**Solution**:

```bash
# Removed collaboration models from Prisma schema
# Deleted backend route files: teams.ts, sharing.ts, comments.ts
# Removed frontend collaboration components
# Updated templateService to focus on private templates only
# Created database migration: 20250703125832_remove_collaboration_features
```

**Files Removed**:

- `server/src/routes/teams.ts`
- `server/src/routes/sharing.ts`
- `server/src/routes/comments.ts`
- `client/src/components/collaboration/` (entire directory)
- `client/src/pages/TeamsPage.tsx`
- `server/src/services/__tests__/lessonPlanService.test.ts`

**Files Modified**:

- `packages/database/prisma/schema.prisma` - Removed all collaboration models
- `server/src/index.ts` - Removed collaboration route imports
- `client/src/App.tsx` - Removed Teams routes
- `client/src/components/MainLayout.tsx` - Removed Teams navigation
- `server/src/services/templateService.ts` - Removed public sharing features

**Prevention Strategy**: 

- Maintain clear scope documentation focused on single-teacher use
- Regular scope reviews during feature development
- Reject features that encourage multi-user collaboration

### Database Issues

#### Issue #001: Prisma Client Out of Sync

**Status**: Resolved  
**Severity**: High  
**Last Occurred**: 2025-01-15

**Description**: TypeScript errors about missing Prisma types, "PrismaClient is unable to connect" errors during development.

**Root Cause**:

- Prisma client not regenerated after schema changes
- Database schema drift from migration files
- Workspace dependencies not properly linked

**Solution**:

```bash
# Regenerate Prisma client
pnpm --filter @teaching-engine/database db:generate

# If persists, force reset (DEVELOPMENT ONLY)
pnpm --filter @teaching-engine/database db:push --force-reset
pnpm --filter @teaching-engine/database db:generate
```

**Prevention Strategy**:

- Always run `db:generate` after schema changes
- Use pre-commit hooks to validate schema consistency
- Document schema changes in migration files

#### Issue #002: Database Connection Pool Exhaustion

**Status**: Resolved  
**Severity**: High  
**Last Occurred**: 2025-02-10

**Description**: "Connection pool exhausted" errors during test runs and high concurrent usage.

**Root Cause**:

- Tests not properly closing database connections
- Missing `$disconnect()` calls in async handlers
- Default connection pool size too small for test concurrency

**Solution**:

```typescript
// In test teardown
afterAll(async () => {
  await prisma.$disconnect();
});

// In production, configure connection pool
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=10&pool_timeout=20',
    },
  },
});
```

**Prevention Strategy**:

- Enforce connection cleanup in test setup
- Monitor connection pool usage in production
- Implement connection timeout handling

### Authentication & Authorization

#### Issue #003: JWT Token Expiration Race Condition

**Status**: Resolved  
**Severity**: Medium  
**Last Occurred**: 2025-02-20

**Description**: Users randomly logged out during active sessions, especially when switching between features quickly.

**Root Cause**:

- Token refresh logic not handling concurrent requests
- Race condition between token expiration and refresh
- Client not properly queuing requests during token refresh

**Solution**:

```typescript
// Implement token refresh queue
class TokenRefreshQueue {
  private refreshPromise: Promise<string> | null = null;

  async refreshToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    return result;
  }
}
```

**Prevention Strategy**:

- Implement proper token refresh queue
- Add comprehensive authentication flow tests
- Monitor token expiration patterns in production

### Performance Issues

#### Issue #004: Slow Planning Engine Response Times

**Status**: Resolved  
**Severity**: High  
**Last Occurred**: 2025-03-01

**Description**: AI planning engine taking 30+ seconds to generate lesson plans, causing timeouts.

**Root Cause**:

- Inefficient database queries for curriculum expectations
- N+1 query problem when loading related data
- Excessive API calls to OpenAI without caching

**Solution**:

```typescript
// Implement proper query optimization
const expectationsWithRelations = await prisma.curriculumExpectation.findMany({
  include: {
    longRangePlans: true,
    unitPlans: true,
    lessonPlans: true,
  },
  where: {
    grade: plan.grade,
    subject: plan.subject,
  },
});

// Add response caching
const cacheKey = `planning-${grade}-${subject}-${JSON.stringify(requirements)}`;
const cachedResult = await redis.get(cacheKey);
if (cachedResult) return JSON.parse(cachedResult);
```

**Prevention Strategy**:

- Implement query performance monitoring
- Add caching layers for expensive operations
- Load test planning engine with realistic data volumes

## 🚨 Known Active Issues

### Current Bugs Under Investigation

#### Issue #005: Test Security Validation Failures

**Status**: Active  
**Severity**: Medium  
**First Reported**: 2025-07-01

**Description**: Security validation tests failing due to mock configuration issues.

**Symptoms**:

- Unit tests expect security errors but don't throw
- Mock OpenAI responses not containing expected "MOCK" indicator
- Network call blocking not working as expected

**Current Error**:

```
FAIL Unit Tests tests/unit/security-validation.test.ts
  ● Security Mock Validation › should prevent real OpenAI API initialization
    expect(received).toThrow(expected)
    Expected substring: "SECURITY"
    Received function did not throw
```

**Temporary Workaround**:

```bash
# Skip security validation tests temporarily
npm test -- --testNamePattern="^(?!.*Security Mock Validation).*"
```

**Investigation Status**:

- Mock setup not properly intercepting OpenAI client creation
- Need to verify mock configuration in jest setup files
- May require refactoring of security validation approach

#### Issue #006: Error Reporting Integration Gap

**Status**: Active  
**Severity**: Low  
**First Reported**: 2025-06-15

**Description**: Error boundary components have placeholder TODO for error reporting service integration.

**Location**: `client/src/components/AuthErrorBoundary.tsx:344`

**Current Code**:

```typescript
// TODO: Send to error reporting service
console.error('AuthErrorBoundary caught error:', error);
```

**Impact**:

- Frontend errors not being tracked in production
- Missing error analytics for user experience issues
- Debugging production issues requires manual log analysis

**Planned Resolution**:

- Integrate with error reporting service (e.g., Sentry)
- Add error categorization and user impact tracking
- Implement privacy-safe error reporting

### Performance Bottlenecks

#### Issue #007: Large Dataset Loading Performance

**Status**: Monitoring  
**Severity**: Medium  
**First Reported**: 2025-05-20

**Description**: Application becomes slow when loading large curriculum datasets or extensive lesson plan collections.

**Symptoms**:

- Page load times > 3 seconds for curriculum browsing
- Memory usage spikes when loading full curriculum data
- Browser freezes during large data operations

**Mitigation Strategies**:

- Implement pagination for large datasets
- Use virtual scrolling for long lists
- Add loading states and progressive data loading
- Cache frequently accessed curriculum data

**Monitoring**:

- Track page load performance metrics
- Monitor memory usage patterns
- Set up alerts for performance degradation

## 🔧 Common User-Reported Issues

### Workflow Problems

#### Issue #008: Lesson Plan Template Inconsistencies

**Status**: Resolved  
**Severity**: Medium  
**Resolution Date**: 2025-06-01

**Description**: ETFO lesson plan templates not consistently following three-part structure.

**User Impact**:

- Teachers confused by template variations
- Inconsistent lesson plan quality
- Extra manual editing required

**Resolution**:

- Standardized all templates to follow ETFO three-part structure
- Added template validation in planning engine
- Created template preview functionality

#### Issue #009: Curriculum Expectation Mapping Confusion

**Status**: Active  
**Severity**: High  
**First Reported**: 2025-06-20

**Description**: Teachers reporting difficulty understanding how curriculum expectations map to their lesson plans.

**User Feedback**:

- "I can't tell which expectations are covered in my unit"
- "The curriculum codes don't match what I'm familiar with"
- "Need clearer visual indication of curriculum coverage"

**Proposed Solutions**:

- Implement curriculum coverage visualization
- Add curriculum expectation tooltips with plain language descriptions
- Create curriculum alignment report feature

### Data Import/Export Issues

#### Issue #010: Curriculum Data Import Validation

**Status**: Active  
**Severity**: Medium  
**First Reported**: 2025-07-01

**Description**: Curriculum import process not properly validating data format, leading to inconsistent curriculum expectations.

**Symptoms**:

- Duplicate curriculum codes in database
- Missing required fields in imported data
- Encoding issues with French language content

**Current Workaround**:

```bash
# Manual cleanup of duplicate curriculum codes
pnpm --filter @teaching-engine/database db:seed -- --clean-duplicates
```

**Planned Resolution**:

- Add comprehensive validation schema for curriculum imports
- Implement data deduplication logic
- Add support for bilingual content validation

## 🏗️ Development & Deployment Issues

### Build and Environment Issues

#### Issue #011: Port Conflicts in Development

**Status**: Resolved  
**Severity**: Low  
**Resolution Date**: 2025-05-10

**Description**: Development servers fail to start due to port conflicts.

**Common Scenarios**:

- Previous development sessions not properly terminated
- Multiple developers on same machine
- Background processes using default ports

**Resolution**:

```bash
# Automated port cleanup
lsof -ti:3000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:5555 | xargs kill -9  # Prisma Studio

# Or use the helper command
pnpm run dev:clean
```

**Prevention**:

- Added automated port cleanup to development scripts
- Implement graceful shutdown handlers
- Use dynamic port assignment when possible

#### Issue #012: TypeScript Build Errors After Updates

**Status**: Resolved  
**Severity**: High  
**Resolution Date**: 2025-06-05

**Description**: TypeScript compilation errors after dependency updates, particularly affecting Prisma client types.

**Root Cause**:

- Prisma client regeneration not triggered after updates
- TypeScript cache not cleared after type changes
- Workspace dependencies not properly linked

**Solution**:

```bash
# Post-update cleanup script
rm -rf */tsconfig.tsbuildinfo
pnpm --filter @teaching-engine/database db:generate
pnpm typecheck
```

**Prevention**:

- Added post-install hooks for Prisma client generation
- Implement dependency update checklist
- Add TypeScript strict mode enforcement

### Testing Infrastructure Issues

#### Issue #013: Flaky E2E Tests

**Status**: Active  
**Severity**: Medium  
**First Reported**: 2025-06-25

**Description**: End-to-end tests occasionally fail due to timing issues and race conditions.

**Common Failures**:

- Authentication flow tests timing out
- Database operations not completing before assertions
- Network requests failing intermittently

**Mitigation Strategies**:

```typescript
// Implement proper wait strategies
await page.waitForSelector('[data-testid="login-success"]', { timeout: 10000 });

// Add retry logic for flaky operations
await retry(
  async () => {
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  },
  { retries: 3 },
);
```

**Investigation Status**:

- Implementing more robust wait strategies
- Adding test isolation improvements
- Considering test environment optimization

#### Issue #015: Extremely Low Test Coverage Percentages

**Status**: Resolved  
**Severity**: High  
**First Reported**: 2025-07-03
**Fixed**: 2025-07-03

**Description**: Test coverage reporting extremely low percentages (0.93% statements, 0.64% branches) in CI, despite having 84 test files.

**Root Cause**:
- Jest configuration defaults to running only unit tests when no TEST_TYPE is specified
- Only 3 unit test files exist out of 84 total test files
- Coverage command wasn't setting TEST_TYPE environment variable
- Most tests are integration (50) and security (13) tests, not unit tests

**Test Distribution**:
```
Unit tests: 3 files
Security tests: 13 files
Integration tests: 50 files
Other tests: 18 files
Total: 84 test files
```

**Solution**:
1. Updated `scripts/smart-test-runner-enhanced.js` to set TEST_TYPE='all' instead of undefined
2. Updated `server/package.json` test:coverage script to include TEST_TYPE=all

```bash
# Before
"test:coverage": "NODE_OPTIONS='--experimental-vm-modules' jest --coverage"

# After  
"test:coverage": "NODE_OPTIONS='--experimental-vm-modules' TEST_TYPE=all jest --coverage"
```

**Prevention Strategy**:
- Always verify coverage includes all test types
- Monitor coverage metrics for sudden drops
- Document test type distribution in test documentation
- Consider setting TEST_TYPE=all as default for coverage runs

**Impact**:
- CI/CD pipeline showing misleading coverage metrics
- Developers unable to assess true test coverage
- Risk of shipping untested code due to false coverage reports

## 🔒 Security Considerations

### Security Issues (Historical)

#### Issue #014: API Rate Limiting Bypass

**Status**: Resolved  
**Severity**: Critical  
**Resolution Date**: 2025-04-15

**Description**: API rate limiting could be bypassed using different IP addresses or user agents.

**Security Impact**:

- Potential for DoS attacks
- API abuse by malicious users
- Excessive resource consumption

**Resolution**:

- Implemented multi-layer rate limiting (IP, user, endpoint)
- Added rate limiting monitoring and alerting
- Implemented progressive penalties for violations

**Prevention**:

- Regular security audits of rate limiting logic
- Penetration testing of API endpoints
- Monitoring for unusual traffic patterns

#### Issue #015: JWT Token Security Hardening

**Status**: Resolved  
**Severity**: High  
**Resolution Date**: 2025-03-20

**Description**: JWT tokens not properly secured against common attacks.

**Vulnerabilities**:

- Missing token expiration validation
- Weak signing algorithms
- Token storage in localStorage

**Resolution**:

- Implemented proper token expiration handling
- Upgraded to RS256 signing algorithm
- Moved token storage to secure httpOnly cookies
- Added token refresh mechanism

## 📊 Bug Prevention Strategies

### Code Quality Measures

#### Automated Testing Requirements

- **Unit Tests**: 90% statement coverage, 85% branch coverage
- **Integration Tests**: All API endpoints must have tests
- **E2E Tests**: All critical user workflows covered
- **Performance Tests**: Response time benchmarks for all features

#### Code Review Standards

- All code changes require peer review
- Security-focused reviews for authentication/authorization changes
- Performance impact assessment for database changes
- Documentation updates required for API changes

#### Monitoring and Alerting

- **Error Rate Monitoring**: Alert on error rate > 1%
- **Performance Monitoring**: Alert on response time > 2 seconds
- **Database Monitoring**: Alert on connection pool utilization > 80%
- **Security Monitoring**: Alert on unusual authentication patterns

### Development Best Practices

#### Database Changes

- Always use migrations for schema changes
- Test migrations on production-like data
- Include rollback procedures for all migrations
- Document schema changes in SCHEMAS.md

#### API Development

- Follow OpenAPI specification for all endpoints
- Implement comprehensive input validation
- Add proper error handling and logging
- Include API documentation in API_REFERENCE.md

#### Frontend Development

- Implement proper error boundaries
- Add loading states for all async operations
- Follow accessibility guidelines
- Test across different browser environments

## 🆘 Emergency Procedures

### Critical Bug Response

#### Immediate Actions (< 2 hours)

1. **Assess Impact**: Determine user impact and affected systems
2. **Isolate Issue**: Reproduce bug in isolated environment
3. **Implement Hotfix**: Deploy minimal fix to restore functionality
4. **Document Everything**: Record timeline, actions taken, and lessons learned

#### Follow-up Actions (< 24 hours)

1. **Root Cause Analysis**: Identify underlying cause of the issue
2. **Comprehensive Fix**: Implement proper solution with tests
3. **Update Documentation**: Update this guide with new issue
4. **Review Prevention**: Assess how similar issues can be prevented

### System Recovery Procedures

#### Database Recovery

```bash
# Restore from backup
pg_restore --clean --no-acl --no-owner -h localhost -U postgres -d teaching_engine backup.sql

# Verify data integrity
pnpm --filter @teaching-engine/database db:validate
```

#### Application Recovery

```bash
# Complete environment reset
rm -rf node_modules */node_modules pnpm-lock.yaml
rm -rf */dist */build coverage
pnpm install
pnpm build
```

#### Emergency Contacts

- **System Administrator**: [Contact Info]
- **Database Administrator**: [Contact Info]
- **Security Team**: [Contact Info]
- **Product Owner**: [Contact Info]

## 📈 Bug Metrics and Reporting

### Key Performance Indicators

#### Bug Resolution Metrics

- **Mean Time to Resolution (MTTR)**: Target < 24 hours for high severity
- **First Response Time**: Target < 2 hours for critical issues
- **Bug Escape Rate**: Target < 5% of bugs reaching production
- **Customer Satisfaction**: Target > 90% satisfaction with bug resolution

#### Quality Metrics

- **Bug Density**: Bugs per 1000 lines of code
- **Recurrence Rate**: Percentage of bugs that reoccur
- **Test Coverage**: Maintained at > 90% for critical paths
- **Code Review Coverage**: 100% of changes reviewed

### Reporting Schedule

#### Daily Reports

- Critical and high severity bug status
- Test failure summaries
- Performance alerts

#### Weekly Reports

- Bug resolution summary
- Quality metrics review
- Prevention strategy effectiveness

#### Monthly Reports

- Comprehensive bug analysis
- Trend analysis and predictions
- Process improvement recommendations

## 🔄 Continuous Improvement

### Learning from Bugs

#### Post-Mortem Process

1. **Incident Timeline**: Document what happened when
2. **Root Cause Analysis**: Identify primary and contributing factors
3. **Prevention Strategies**: Define specific actions to prevent recurrence
4. **Process Improvements**: Update development processes as needed

#### Knowledge Sharing

- Share lessons learned in team meetings
- Update documentation with new insights
- Create training materials for common issues
- Contribute to industry best practices

### Tool and Process Evolution

#### Monitoring Improvements

- Implement better error detection
- Add performance monitoring
- Enhance user experience tracking
- Improve alerting accuracy

#### Development Process Enhancements

- Refine testing strategies
- Improve code review processes
- Enhance deployment procedures
- Optimize development workflows

## 📚 References and Resources

### Internal Documentation

- [Troubleshooting Guide](./claude/troubleshooting.md)
- [Testing Developer Guide](./testing/developer-guide.md)
- [API Reference](./API_REFERENCE.md)
- [Data Flow Documentation](./DATA_FLOW.md)

### External Resources

- [Jest Testing Framework](https://jestjs.io/docs/troubleshooting)
- [Playwright Debugging](https://playwright.dev/docs/debug)
- [Prisma Troubleshooting](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance)
- [Express.js Error Handling](https://expressjs.com/en/guide/error-handling.html)

### Emergency Contacts

- **Development Team**: [Contact Information]
- **System Operations**: [Contact Information]
- **Security Team**: [Contact Information]
- **Product Management**: [Contact Information]

---

**Note**: This document is a living reference that should be updated whenever new bugs are discovered, resolved, or when prevention strategies are implemented. All team members are responsible for maintaining the accuracy and completeness of this documentation.

**Remember**: Every bug is an opportunity to improve the system and prevent similar issues in the future. Document thoroughly, learn consistently, and share knowledge openly.
