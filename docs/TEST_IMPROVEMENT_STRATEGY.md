# Test Coverage Improvement Strategy

**Last Updated**: 2025-07-03  
**Goal**: Achieve 90% test coverage within 3 months  
**Current**: 62% → Target: 90%

## Executive Summary

This document provides concrete, actionable steps to improve test coverage from 62% to 90%. Each section includes specific code examples and time estimates.

## Week-by-Week Implementation Plan

### Week 1-2: Foundation & Quick Wins
**Goal**: 62% → 70% coverage

#### Tasks
1. **Fix Failing Tests** (Day 1)
   - Review and fix the 3 failing unit tests
   - Ensure CI pipeline is green

2. **Test Infrastructure** (Days 2-3)
   ```typescript
   // Create test factories
   // factories/userFactory.ts
   export const createTestUser = (overrides = {}) => ({
     id: faker.datatype.uuid(),
     email: faker.internet.email(),
     role: 'teacher',
     ...overrides
   });

   // factories/lessonPlanFactory.ts
   export const createTestLessonPlan = (overrides = {}) => ({
     id: faker.datatype.uuid(),
     title: faker.lorem.sentence(),
     gradeLevel: faker.helpers.arrayElement(['1', '2', '3']),
     subject: faker.helpers.arrayElement(['Math', 'Science']),
     ...overrides
   });
   ```

3. **Basic CRUD Tests** (Days 4-5)
   ```typescript
   // Example: StudentService CRUD tests
   describe('StudentService', () => {
     describe('CRUD Operations', () => {
       test('should create student', async () => {
         const student = await studentService.create({
           name: 'Test Student',
           grade: '3'
         });
         expect(student.id).toBeDefined();
       });

       test('should handle duplicate email', async () => {
         const email = 'duplicate@test.com';
         await studentService.create({ email });
         await expect(studentService.create({ email }))
           .rejects.toThrow('Email already exists');
       });
     });
   });
   ```

### Week 3-4: Authentication & Security
**Goal**: 70% → 75% coverage

#### Priority Files
- `src/middleware/auth.ts` (22% → 95%)
- `src/middleware/rateLimiter.ts` (0% → 90%)
- `src/utils/privacy.ts` (0% → 100%)

#### Example Tests
```typescript
// auth.middleware.test.ts
describe('Auth Middleware', () => {
  test('should reject missing token', async () => {
    const req = mockRequest({ headers: {} });
    const res = mockResponse();
    const next = jest.fn();
    
    await authMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('should validate JWT token', async () => {
    const token = generateTestToken({ userId: '123' });
    const req = mockRequest({ 
      headers: { authorization: `Bearer ${token}` }
    });
    
    await authMiddleware(req, res, next);
    
    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalled();
  });

  test('should reject expired token', async () => {
    const token = generateTestToken({ 
      userId: '123',
      expiresIn: '-1h' // Expired
    });
    
    await authMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Token expired'
    });
  });
});
```

### Week 5-6: AI Services Infrastructure
**Goal**: 75% → 80% coverage

#### Mock Setup
```typescript
// mocks/openai.mock.ts
export const mockOpenAIClient = {
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              lessonPlan: {
                title: 'Mock Lesson',
                objectives: ['Objective 1']
              }
            })
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 200,
          total_tokens: 300
        }
      })
    }
  }
};
```

#### AI Service Tests
```typescript
// aiService.test.ts
describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Lesson Generation', () => {
    test('should generate lesson plan', async () => {
      const input = {
        grade: '3',
        subject: 'Math',
        topic: 'Fractions'
      };
      
      const result = await aiService.generateLesson(input);
      
      expect(result).toMatchObject({
        title: expect.any(String),
        objectives: expect.arrayContaining([
          expect.any(String)
        ])
      });
      
      // Verify prompt was constructed correctly
      expect(mockOpenAIClient.chat.completions.create)
        .toHaveBeenCalledWith(
          expect.objectContaining({
            model: 'gpt-4',
            messages: expect.arrayContaining([
              expect.objectContaining({
                role: 'system',
                content: expect.stringContaining('lesson plan')
              })
            ])
          })
        );
    });

    test('should handle API errors gracefully', async () => {
      mockOpenAIClient.chat.completions.create
        .mockRejectedValueOnce(new Error('API Error'));
      
      const result = await aiService.generateLesson({});
      
      expect(result).toMatchObject({
        error: 'Failed to generate lesson',
        fallback: true
      });
    });

    test('should track token usage', async () => {
      await aiService.generateLesson({});
      
      const usage = await aiService.getTokenUsage();
      expect(usage.total).toBe(300);
    });
  });
});
```

### Week 7-8: File Processing
**Goal**: 80% → 85% coverage

#### Test File Setup
```typescript
// test-files/index.ts
export const testFiles = {
  validPDF: fs.readFileSync('./test-files/sample.pdf'),
  corruptPDF: fs.readFileSync('./test-files/corrupt.pdf'),
  largePDF: fs.readFileSync('./test-files/large.pdf'), // 50MB
  validDOCX: fs.readFileSync('./test-files/sample.docx'),
  validCSV: fs.readFileSync('./test-files/students.csv')
};
```

#### Parser Tests
```typescript
// pdfParser.test.ts
describe('PDFParser', () => {
  test('should extract text from PDF', async () => {
    const result = await pdfParser.parse(testFiles.validPDF);
    
    expect(result.text).toContain('Expected content');
    expect(result.metadata).toMatchObject({
      pageCount: expect.any(Number),
      author: expect.any(String)
    });
  });

  test('should handle corrupt PDF', async () => {
    await expect(pdfParser.parse(testFiles.corruptPDF))
      .rejects.toThrow('Invalid PDF format');
  });

  test('should handle large files', async () => {
    const result = await pdfParser.parse(testFiles.largePDF);
    
    expect(result.chunks).toHaveLength(10); // Should chunk
    expect(result.memoryUsage).toBeLessThan(100 * 1024 * 1024); // <100MB
  });
});
```

### Week 9-10: Integration & E2E Tests
**Goal**: 85% → 90% coverage

#### Integration Test Example
```typescript
// integration/lesson-generation.test.ts
describe('Lesson Generation Flow', () => {
  test('complete flow: upload → parse → AI → save', async () => {
    // 1. Upload curriculum document
    const uploadResponse = await request(app)
      .post('/api/curriculum/upload')
      .attach('file', testFiles.validPDF)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(uploadResponse.status).toBe(200);
    const { documentId } = uploadResponse.body;
    
    // 2. Wait for processing
    await waitForProcessing(documentId);
    
    // 3. Generate lesson from curriculum
    const lessonResponse = await request(app)
      .post('/api/lessons/generate')
      .send({
        documentId,
        grade: '3',
        duration: 60
      })
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(lessonResponse.status).toBe(201);
    expect(lessonResponse.body).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      objectives: expect.any(Array),
      activities: expect.any(Array)
    });
    
    // 4. Verify saved to database
    const lesson = await lessonRepository.findById(
      lessonResponse.body.id
    );
    expect(lesson).toBeDefined();
  });
});
```

## Test Categories and Priorities

### P0 - Critical (Week 1-2)
1. **Authentication flows** - Security critical
2. **Payment processing** - Financial impact
3. **Data privacy** - Compliance required

### P1 - High (Week 3-4)
1. **AI service core** - Main value proposition
2. **File uploads** - User-facing feature
3. **CRUD operations** - Basic functionality

### P2 - Medium (Week 5-6)
1. **Email notifications** - User communication
2. **Search functionality** - User experience
3. **Reporting** - Analytics

### P3 - Low (Week 7-8)
1. **Admin features** - Internal tools
2. **Deprecated endpoints** - Legacy code
3. **Utility helpers** - Nice to have

## Testing Best Practices

### 1. Test Naming Convention
```typescript
// Format: should_expectedBehavior_when_condition
test('should_returnError_when_invalidInput', () => {});
test('should_generateLesson_when_validCurriculum', () => {});
```

### 2. Test Structure
```typescript
describe('ServiceName', () => {
  describe('MethodName', () => {
    describe('Happy Path', () => {
      test('should succeed with valid input', () => {});
    });
    
    describe('Error Cases', () => {
      test('should handle missing required fields', () => {});
      test('should handle invalid data types', () => {});
    });
    
    describe('Edge Cases', () => {
      test('should handle empty arrays', () => {});
      test('should handle max length strings', () => {});
    });
  });
});
```

### 3. Mock Management
```typescript
// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Restore original implementations
afterAll(() => {
  jest.restoreAllMocks();
});
```

## Metrics and Monitoring

### Weekly Metrics
```bash
# Track coverage trend
npm run test:coverage -- --json > coverage-week-1.json

# Generate coverage report
npm run test:coverage -- --coverageReporters=html

# Check specific module coverage
npm run test:coverage -- src/services/ai
```

### Coverage Dashboards
1. **CI Integration**: Add coverage badges to README
2. **Trend Tracking**: Weekly coverage graphs
3. **Module Breakdown**: Coverage by feature area

## Common Pitfalls to Avoid

### 1. Coverage vs Quality
```typescript
// Bad: Testing for coverage only
test('should call function', () => {
  service.doSomething();
  expect(service.doSomething).toHaveBeenCalled();
});

// Good: Testing behavior
test('should process payment and update balance', async () => {
  const initialBalance = await getBalance(userId);
  await service.processPayment(userId, 100);
  const newBalance = await getBalance(userId);
  expect(newBalance).toBe(initialBalance - 100);
});
```

### 2. Over-Mocking
```typescript
// Bad: Mocking everything
jest.mock('./entire-module');

// Good: Mock only external dependencies
jest.mock('openai');
jest.mock('@aws-sdk/client-s3');
// Keep internal logic unmocked
```

### 3. Flaky Tests
```typescript
// Bad: Time-dependent test
test('should expire after 1 hour', async () => {
  await sleep(3600000); // Don't do this!
  expect(isExpired()).toBe(true);
});

// Good: Control time
test('should expire after 1 hour', async () => {
  jest.useFakeTimers();
  jest.advanceTimersByTime(3600000);
  expect(isExpired()).toBe(true);
  jest.useRealTimers();
});
```

## Success Criteria

### End of Month 1 (70% Coverage)
- [ ] All controllers have >80% coverage
- [ ] Authentication fully tested
- [ ] Basic CRUD operations tested
- [ ] Test infrastructure in place

### End of Month 2 (80% Coverage)
- [ ] AI services have mock infrastructure
- [ ] File processing tested
- [ ] Integration tests running
- [ ] CI pipeline includes coverage checks

### End of Month 3 (90% Coverage)
- [ ] All critical paths tested
- [ ] E2E tests for main workflows
- [ ] Performance benchmarks in place
- [ ] Documentation complete

## Resource Requirements

### Team Allocation
- **2 Senior Engineers**: 50% time for 3 months
- **1 QA Engineer**: 100% time for 3 months
- **1 DevOps Engineer**: 20% time for CI/CD improvements

### Budget
- **AI API Testing**: $500/month for test API calls
- **Testing Tools**: $200/month (coverage tools, monitoring)
- **CI/CD Resources**: $300/month (additional runners)

Total: ~$3,000 for 3-month improvement program

## Conclusion

Improving test coverage from 62% to 90% is achievable within 3 months with dedicated effort. The key is to:

1. Start with critical security paths
2. Build proper testing infrastructure
3. Focus on high-risk areas first
4. Maintain momentum with weekly goals
5. Track progress with metrics

The investment will pay off through:
- Reduced production incidents
- Faster development cycles
- Easier onboarding
- Higher code quality
- Better system documentation