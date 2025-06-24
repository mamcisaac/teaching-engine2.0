# Development Workflows

Common development patterns and workflows for Teaching Engine 2.0.

## 🚀 Feature Development Workflow

### 1. Planning Phase
```markdown
1. Create GitHub issue or check existing issues
2. Review relevant documentation in docs/agents/
3. Check ENHANCEMENT_FEATURES.md for approved features
4. Plan implementation approach with architecture in mind
```

### 2. Implementation Phase
```bash
# Setup
git checkout -b feature/your-feature-name
pnpm install

# Development cycle
/project:test-quick          # Quick test before starting
# Make changes...
/project:test               # Full test after changes
/project:build-check        # Verify build integrity
```

### 3. Testing Requirements
- **Unit Tests**: 90%+ coverage for new business logic
- **Integration Tests**: API endpoints with realistic data
- **E2E Tests**: Critical user workflows
- **Performance Tests**: For features affecting response time

### 4. Documentation Updates
- Update relevant files in docs/
- Add JSDoc comments for public functions
- Update API documentation if endpoints changed
- Consider user guide updates

## 🐛 Bug Fixing Process

### 1. Reproduction
```bash
/project:dev-clean          # Clean environment
# Reproduce the bug
/project:test               # Check if tests catch the bug
```

### 2. Investigation
```markdown
1. Check logs and error messages
2. Review related code in the affected area
3. Use debugger or console.log strategically
4. Check database state with /project:db-studio
```

### 3. Fix Implementation
```bash
# Write failing test first (TDD)
# Implement fix
/project:test               # Verify fix works
/project:build-check        # Ensure no regressions
```

## 🗃️ Database Schema Changes

### Safe Migration Process
```bash
# 1. Backup current state
/project:db-studio          # Document current schema

# 2. Create migration
cd packages/database
npx prisma migrate dev --name descriptive-name

# 3. Update seed data if needed
# Edit prisma/seed.ts
/project:db-reset           # Test with fresh data

# 4. Update related TypeScript types
pnpm --filter @teaching-engine/database db:generate
```

### Schema Change Checklist
- [ ] Migration is reversible
- [ ] Seed data updated for new fields
- [ ] TypeScript types regenerated
- [ ] Related API endpoints updated
- [ ] Frontend components handle new data structure
- [ ] Tests updated for schema changes

## 🔌 API Endpoint Creation

### Standard API Pattern
```typescript
// 1. Define route in server/src/routes/
// 2. Add validation with Zod schemas
// 3. Implement service layer logic
// 4. Add error handling
// 5. Write integration tests
// 6. Document in comments
```

### Testing New Endpoints
```bash
# Test with curl or Postman
curl -X POST http://localhost:3000/api/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Run integration tests
/project:test -- --grep "your-endpoint"
```

## 📱 Frontend Component Development

### Component Creation Checklist
- [ ] Follow existing naming conventions (PascalCase)
- [ ] Use TypeScript with proper prop interfaces
- [ ] Implement responsive design with Tailwind
- [ ] Add proper error boundaries
- [ ] Include loading states
- [ ] Write unit tests with React Testing Library
- [ ] Test accessibility (keyboard navigation, screen readers)

### State Management Pattern
```typescript
// Use TanStack Query for server state
// Use React state for local component state
// Use context for app-wide state (auth, theme)
```

## 🔍 Performance Optimization

### Performance Analysis Workflow
```bash
/project:performance        # Run performance analysis
# Identify bottlenecks
# Implement optimizations
/project:build-check        # Verify optimizations don't break functionality
```

### Common Optimizations
- **Frontend**: Code splitting, lazy loading, memoization
- **Backend**: Database query optimization, caching, compression
- **Database**: Proper indexing, query optimization

## 🚢 Deployment Preparation

### Pre-deployment Checklist
```bash
/project:build-check        # Full build verification
/project:test               # Complete test suite
/project:security           # Security audit
```

### Deployment Steps
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Static assets optimized
- [ ] Monitoring and logging configured
- [ ] Rollback plan prepared

## 🤝 Code Review Guidelines

### Before Requesting Review
- [ ] All tests passing
- [ ] Code follows project conventions
- [ ] Documentation updated
- [ ] No debug code or console.logs
- [ ] Performance impact considered

### Reviewing Code
- [ ] Functionality works as expected
- [ ] Code is readable and maintainable
- [ ] Security best practices followed
- [ ] Test coverage adequate
- [ ] Performance implications acceptable

## 🆘 Troubleshooting Common Issues

### Port Conflicts
```bash
/project:dev-clean          # Kills processes and restarts clean
```

### Database Issues
```bash
/project:db-reset           # Nuclear option - resets everything
```

### Dependency Issues
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install                # Fresh install
```

### TypeScript Errors
```bash
pnpm typecheck              # Check for type errors
# Fix types, then regenerate if needed
pnpm --filter @teaching-engine/database db:generate
```