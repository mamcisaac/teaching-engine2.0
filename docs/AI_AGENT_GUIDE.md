# AI Agent Guide for Teaching Engine 2.0

Welcome! This guide helps AI coding agents understand how to contribute effectively to the feature-complete Teaching Engine 2.0 project.

## 🎯 Project Overview

Teaching Engine 2.0 is a **feature-complete** digital teaching assistant that:
- Reduces teacher administrative workload by 60%+
- Manages curriculum planning, resources, and parent communication
- Integrates AI-powered assistance throughout the platform
- Serves elementary school teachers in Canada

**Important**: All five development phases are complete. Focus on enhancements, bug fixes, and optimizations rather than new core features.

## 🚀 Quick Orientation

### 1. Understand the Architecture

```
teaching-engine2.0/
├── client/          # React frontend (TypeScript, Tailwind)
├── server/          # Express backend (TypeScript, Prisma)
├── packages/
│   └── database/    # Shared Prisma models
└── tests/           # E2E Playwright tests
```

### 2. Key Technologies
- **Frontend**: React 18, TypeScript, TanStack Query, Tailwind CSS
- **Backend**: Express, TypeScript, Prisma ORM
- **Database**: SQLite (dev), PostgreSQL (prod-ready)
- **Testing**: Jest, Vitest, Playwright
- **AI Integration**: OpenAI API for content generation

### 3. Development Workflow

```bash
# Setup
pnpm install
cp server/.env.offline server/.env
pnpm --filter @teaching-engine/database db:migrate

# Development
pnpm run dev

# Testing
pnpm test
pnpm test:e2e
```

## 📋 Where to Contribute

### 1. Bug Fixes (Priority 1)
- Check [GitHub Issues](https://github.com/mamcisaac/teaching-engine2.0/issues)
- Focus on user-reported problems
- Ensure fixes don't break existing functionality

### 2. Approved Enhancements (Priority 2)
Review [docs/agents/ENHANCEMENT_FEATURES.md](agents/ENHANCEMENT_FEATURES.md) for:
- Advanced calendar integration
- Enhanced notification system
- Mobile app support
- Analytics dashboard improvements

### 3. Performance Optimization (Priority 3)
- Database query optimization
- Frontend bundle size reduction
- API response time improvements
- Caching strategies

### 4. Test Coverage (Priority 4)
- Increase coverage for edge cases
- Add missing integration tests
- Improve E2E test reliability

## ⚠️ Important Guidelines

### DO NOT:
- ❌ Reimplement existing features
- ❌ Make breaking changes to APIs
- ❌ Modify database schema without migration
- ❌ Remove or rename existing endpoints
- ❌ Change core business logic without discussion

### ALWAYS:
- ✅ Maintain backward compatibility
- ✅ Write tests for new code (90%+ coverage)
- ✅ Update documentation for changes
- ✅ Follow existing code patterns
- ✅ Run full test suite before submitting

## 🏗️ Code Standards

### TypeScript
```typescript
// ❌ Avoid
function processData(data: any): any { }

// ✅ Prefer
interface StudentData {
  id: string;
  name: string;
  grade: number;
}
function processData(data: StudentData): ProcessedResult { }
```

### Testing
```typescript
// Always test both success and error cases
describe('ActivityService', () => {
  it('should create activity with valid data', async () => {
    // Test implementation
  });
  
  it('should throw error with invalid data', async () => {
    // Error case test
  });
});
```

### API Patterns
```typescript
// Follow existing RESTful patterns
router.get('/api/activities', authenticateToken, async (req, res) => {
  // Implementation
});

router.post('/api/activities', authenticateToken, validateRequest(createActivitySchema), async (req, res) => {
  // Implementation
});
```

## 📚 Key Features to Understand

### 1. Curriculum Management
- Subjects → Milestones → Activities hierarchy
- Outcome tracking and coverage analysis
- Provincial curriculum integration

### 2. Planning Tools
- Weekly planner with AI suggestions
- Resource management system
- Emergency substitute plans

### 3. Communication
- Parent newsletter generation
- Bilingual support (French/English)
- Multiple export formats

### 4. AI Integration
- Activity generation for uncovered outcomes
- Content suggestions based on curriculum
- Smart material extraction

## 🔍 Before Making Changes

1. **Study Existing Code**
   - Review similar features in the codebase
   - Understand the established patterns
   - Check test coverage for the area

2. **Run Tests**
   ```bash
   # Run all tests first
   pnpm test
   
   # Run specific test file
   pnpm test -- ActivityService.test.ts
   ```

3. **Check Documentation**
   - API endpoints in route files
   - Component props in TypeScript interfaces
   - Database schema in Prisma files

## 🚨 Common Pitfalls

### 1. Database Changes
```typescript
// ❌ Don't modify schema directly
// ✅ Create a migration
pnpm --filter @teaching-engine/database db:migrate
```

### 2. State Management
```typescript
// ❌ Don't use global variables
// ✅ Use React Query for server state
const { data, error } = useQuery({
  queryKey: ['activities'],
  queryFn: fetchActivities
});
```

### 3. Error Handling
```typescript
// ❌ Don't ignore errors
// ✅ Handle errors gracefully
try {
  const result = await apiCall();
} catch (error) {
  logger.error('API call failed:', error);
  return res.status(500).json({ error: 'Internal server error' });
}
```

## 📝 Submission Checklist

Before submitting your changes:

- [ ] All tests pass (`pnpm test`)
- [ ] TypeScript compiles without errors (`pnpm build`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Documentation updated if needed
- [ ] No breaking changes to existing APIs
- [ ] Performance impact considered
- [ ] Follows existing code patterns

## 🎯 Success Criteria

Your contribution is successful when:
- It solves a real problem for teachers
- It maintains or improves performance
- It doesn't break existing functionality
- It includes comprehensive tests
- It follows project standards

## 🆘 Getting Help

- Review existing implementations in similar files
- Check test files for expected behavior
- Consult [CLAUDE.md](../CLAUDE.md) for commands
- Study [PROJECT_GOALS.md](../PROJECT_GOALS.md) for context

Remember: Teaching Engine 2.0 already successfully helps teachers. Your role is to enhance and maintain this success, not reinvent it.

---

_Happy coding! Your contributions help make teaching easier for educators everywhere._ 🍎