# Claude Code Configuration

This file contains important configuration and context information for Claude Code when working on the Teaching Engine 2.0 project.

## 🎯 Project Overview

Teaching Engine 2.0 is a comprehensive digital teaching assistant for elementary school teachers. The goal is to reduce teacher workload by 60% while improving curriculum coverage through intelligent automation and planning tools.

## 🚨 MANDATORY Test Driven Development (TDD)

**CRITICAL: This project enforces STRICT TDD - no exceptions:**

### 🔴 RED-GREEN-REFACTOR Cycle

- **Write tests FIRST** - Before implementing any feature, write the test
- **Run tests after EVERY change** - Use `pnpm test` after each code modification
- **ALL tests must pass** - Never commit with failing tests
- **No feature without tests** - Every new method/class must have corresponding tests
- **Test-driven refactoring** - Write tests before refactoring existing code

### ✅ MANDATORY Test Success Requirements

**REQUIRED: Every test must demonstrate real functionality:**

- **Investigate every test failure** - Each failing test reveals an important issue to fix
- **Require all dependencies** - Tests must verify that all required files and services are available
- **Validate actual data** - Tests must verify systems return real, meaningful data
- **Write meaningful assertions** - Tests must validate actual functionality works correctly
- **Fix root causes** - Resolve the underlying issue causing test failures
- **Expect real results** - Tests must verify repositories/services return actual data

### 🌍 REAL WORLD Testing Requirements

**CRITICAL: Production-level code requires production-level testing:**

- **USE REAL DATA** - Connect to actual test databases, make real API calls, use real file systems
- **TEST REAL IMPLEMENTATIONS** - Validate actual service methods and their real-world behavior
- **VERIFY COMPLETE FUNCTIONALITY** - Test end-to-end workflows with all real dependencies
- **PERFORM DATABASE OPERATIONS** - Execute real queries against actual test databases
- **MAKE ACTUAL API CALLS** - Test with real external service responses and handle real latency
- **EXECUTE FILE OPERATIONS** - Read and write actual files to verify file system interactions
- **TEST NETWORK BEHAVIOR** - Verify real network calls, actual timeouts, and connection handling

**✅ REQUIRED Production Testing Practices:**

- Use actual test database with realistic data
- Make real API calls to external services with proper retry logic
- Perform actual file operations with real test files
- Execute complete user workflows from UI through all layers to database
- Test real error conditions and verify recovery mechanisms work
- Run performance tests with production-scale data volumes

**✅ BEST PRACTICES for Real-World Testing:**

- Create dedicated test databases that mirror production structure
- Use test API endpoints that behave like production services
- Set up test file directories with actual test files
- Configure realistic network conditions for integration tests
- Generate sufficient test data to validate performance at scale
- Test actual user scenarios that teachers will perform daily

### 💻 TDD Commands (Use These)

```bash
# Write test first, then run
pnpm test                    # Run all tests
pnpm test:quick              # Quick test feedback loop
pnpm test:watch              # Continuous testing during development
pnpm test:debug              # Debug failing tests
pnpm test:fix                # Auto-fix test issues where possible

# After every code change
pnpm test:coverage           # Ensure 90%+ coverage maintained
pnpm typecheck              # TypeScript validation
pnpm lint                   # Code quality checks
```

## 🧪 MANDATORY Testing Standards

### 🔧 Jest Testing Standards (Server/Backend)

**ALL server-side tests MUST use Jest framework with REAL-WORLD testing:**

- **Use `describe/it` structure** - Organize tests with clear descriptions and test cases
- **Implement proper test lifecycle** - Use `beforeEach/afterEach` for setup/cleanup
- **Write comprehensive assertions** - Use `expect().toBe()`, `expect().toBeTruthy()`, and validate all outputs
- **Create descriptive test names** - Method names should clearly describe what is being tested
- **Ensure test independence** - Each test must run independently and be repeatable
- **Test error handling** - Use `expect(() => {}).toThrow()` to verify error cases work correctly
- **Connect to REAL DATABASE** - Use actual test database instances for all data operations
- **Test REAL SERVICES** - Validate actual service implementations with their real dependencies
- **Mock ONLY external APIs** - Reserve mocking exclusively for third-party services outside your control

```typescript
// ✅ CORRECT Jest Test with REAL DATABASE & SERVICES
describe('CurriculumImportService Integration', () => {
  let service: CurriculumImportService;
  let testDb: PrismaClient;

  beforeEach(async () => {
    // Use REAL test database
    testDb = new PrismaClient({
      datasources: { db: { url: process.env.TEST_DATABASE_URL } },
    });
    service = new CurriculumImportService(testDb);

    // Clean test data
    await testDb.curriculumExpectation.deleteMany({});
  });

  afterEach(async () => {
    await testDb.$disconnect();
  });

  it('should import and parse real curriculum PDF file', async () => {
    // Arrange - Use REAL PDF file
    const testFilePath = path.join(__dirname, 'fixtures/real-curriculum.pdf');
    const fileBuffer = fs.readFileSync(testFilePath);

    // Act - Test REAL functionality
    const result = await service.importCurriculumFromPDF(fileBuffer);

    // Assert - Verify REAL database data
    expect(result.expectations.length).toBeGreaterThan(0);

    const savedExpectations = await testDb.curriculumExpectation.findMany();
    expect(savedExpectations.length).toBe(result.expectations.length);
    expect(savedExpectations[0].description).toBeTruthy();
    expect(savedExpectations[0].learningGoals.length).toBeGreaterThan(0);
  });
});
```

### ⚛️ Vitest Testing Standards (Client/Frontend)

**ALL client-side tests MUST use Vitest + React Testing Library with REAL backend:**

- **Use Vitest framework** - Leverage Vite-compatible testing for fast feedback
- **Apply React Testing Library principles** - Test user behavior and interactions
- **Query by user-visible elements** - Use `getByRole`, `getByLabelText`, `getByText` for accessibility
- **Handle async operations properly** - Use `waitFor()` to test asynchronous behavior
- **Make REAL API CALLS** - Connect to actual backend endpoints for integration testing
- **Test COMPLETE DATA FLOW** - Verify entire flow from UI action through backend to response
- **Simulate ACTUAL USER INTERACTIONS** - Test real clicks, form submissions, and navigation
- **Perform INTEGRATION TESTING** - Test components with real providers and actual data

```typescript
// ✅ CORRECT Vitest Test with REAL BACKEND INTEGRATION
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CurriculumImportPage } from '../pages/CurriculumImportPage';

describe('CurriculumImportPage Integration', () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });

    // Ensure backend is running and test database is clean
    await fetch('http://localhost:3000/api/test/reset-db', { method: 'POST' });
  });

  it('should upload and process real curriculum file', async () => {
    // Arrange - Render with real providers
    render(
      <QueryClientProvider client={queryClient}>
        <CurriculumImportPage />
      </QueryClientProvider>
    );

    // Act - Upload REAL file
    const fileInput = screen.getByLabelText(/upload curriculum/i);
    const realFile = new File(['real PDF content'], 'curriculum.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [realFile] } });

    const uploadButton = screen.getByRole('button', { name: /import/i });
    fireEvent.click(uploadButton);

    // Assert - Verify REAL backend response
    await waitFor(async () => {
      const successMessage = screen.getByText(/curriculum imported successfully/i);
      expect(successMessage).toBeInTheDocument();

      // Verify actual data was saved to database
      const response = await fetch('http://localhost:3000/api/curriculum-expectations');
      const data = await response.json();
      expect(data.expectations.length).toBeGreaterThan(0);
    }, { timeout: 10000 });
  });
});
```

### 🎭 Playwright E2E Testing Standards

**End-to-end tests MUST use Playwright:**

- **User journey testing** - Test complete workflows from user perspective
- **Cross-browser testing** - Ensure compatibility across browsers
- **Realistic data** - Use actual test data, not mocked responses
- **Page Object Model** - Organize tests using page objects for maintainability
- **Assertions on user-visible elements** - Test what users actually see

```typescript
// ✅ CORRECT Playwright E2E Test
test('teacher can create and save lesson plan', async ({ page }) => {
  // Arrange
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'teacher@test.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login-button"]');

  // Act
  await page.goto('/planner/lessons');
  await page.click('[data-testid="create-lesson"]');
  await page.fill('[data-testid="lesson-title"]', 'Math Lesson 1');
  await page.fill('[data-testid="lesson-objective"]', 'Students will learn addition');
  await page.click('[data-testid="save-lesson"]');

  // Assert
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  await expect(page.locator('text=Math Lesson 1')).toBeVisible();
});
```

## 📁 Key Documentation

### Core Documentation

- **[PROJECT_GOALS.md](PROJECT_GOALS.md)** - Core project goals and intentions
- **[docs/agents/README.md](docs/agents/README.md)** - Main documentation hub
- **[docs/USER_GUIDE.md](docs/USER_GUIDE.md)** - User documentation

### Development Status

- **[docs/agents/PHASE_IMPLEMENTATION_CHECKLIST.md](docs/agents/PHASE_IMPLEMENTATION_CHECKLIST.md)** - Comprehensive task checklist
- **[docs/agents/ENHANCEMENT_FEATURES.md](docs/agents/ENHANCEMENT_FEATURES.md)** - Advanced features for post-MVP
- **[docs/agents/MISSING_FEATURES.md](docs/agents/MISSING_FEATURES.md)** - Critical gaps to address

## 🛠️ Development Commands

### Setup

```bash
# Install dependencies
pnpm install

# Setup development environment
bash scripts/codex-setup.sh

# Start development servers
pnpm run dev
```

### Testing

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm --filter server test
pnpm --filter client test

# Run E2E tests
pnpm test:e2e
```

### Database Operations

```bash
# Generate Prisma client
pnpm --filter @teaching-engine/database db:generate

# Run database migrations
pnpm --filter @teaching-engine/database db:migrate

# Reset database (development)
pnpm --filter @teaching-engine/database db:push

# Open Prisma Studio
pnpm --filter @teaching-engine/database db:studio

# Seed database
pnpm --filter @teaching-engine/database db:seed
```

### Quality Checks

```bash
# Lint code
pnpm lint

# Type checking
pnpm typecheck

# Build for production
pnpm build
```

## 🏗️ Architecture

### Tech Stack

- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (production), SQLite (development)
- **Frontend**: React with TypeScript, TanStack Query
- **Styling**: Tailwind CSS
- **Testing**: Jest/Vitest, Playwright
- **ORM**: Prisma

### Project Structure

```
teaching-engine2.0/
├── client/              # React frontend
├── server/              # Express backend
├── packages/
│   └── database/        # Shared Prisma database package
├── docs/                # Documentation
│   ├── agents/          # Agent coordination & guides
│   └── images/          # Screenshots & assets
├── scripts/             # Setup and utility scripts
└── tests/               # E2E tests
```

## 📊 Features

### Core Functionality

- ✅ Full CRUD API for curriculum management
- ✅ React UI with comprehensive features
- ✅ Weekly planner automation
- ✅ Resource management system
- ✅ Newsletter generation with LLM
- ✅ Emergency substitute plans
- ✅ Progress tracking and alerts
- ✅ AI-powered curriculum import with file parsing
- ✅ Intelligent outcome clustering with semantic analysis
- ✅ Enhanced planning with thematic grouping
- ✅ Bulk material generation with templates
- ✅ Service infrastructure with health monitoring

### Roadmap

- 🔄 Setup wizard for teachers
- 🔄 Advanced analytics dashboard
- 🔄 Mobile application support

## 🎯 Development Guidelines

### 🔒 Required Code Standards

- **Use TypeScript strict mode** - Define all types explicitly and accurately
- **Follow MANDATORY TDD** - Write tests first for ALL code (see TDD section above)
- **Maintain 90%+ test coverage** - Improve coverage with each commit
- **Document with JSDoc comments** - Add clear documentation to all public functions
- **Write conventional commit messages** - Follow standard commit format for clarity

### 📊 Testing Coverage Requirements

**MINIMUM COVERAGE THRESHOLDS (Enforced):**

- **Unit Tests**: 90% statement coverage, 85% branch coverage
- **Integration Tests**: All API endpoints must have corresponding tests
- **E2E Tests**: All critical user workflows must be covered
- **Performance Tests**: Response time benchmarks for critical paths

**Coverage Enforcement:**

```bash
# These commands MUST pass before any commit
pnpm test:coverage           # Validates coverage thresholds
pnpm test:ci                 # Full CI test suite with coverage
```

### 🚨 Pre-Commit Requirements

**MANDATORY checks before ANY commit:**

1. `pnpm test` - All tests pass (100% pass rate)
2. `pnpm test:coverage` - Coverage thresholds met
3. `pnpm typecheck` - No TypeScript errors
4. `pnpm lint` - No linting errors
5. Code review for test quality and TDD compliance

### Documentation Requirements

- Technical specifications for new features
- API documentation for all endpoints
- Decision logs for architectural choices
- Agent logs for development progress

## 🤖 Claude Code Features

### Memory Management

This CLAUDE.md file serves as project memory for Claude Code. Best practices:

- Keep this file updated with current project context
- Use `@path/to/file` imports for modular organization
- Document frequently used commands and workflows
- Review and update regularly to maintain relevance

### Custom Slash Commands

Use project-specific slash commands for common workflows:

- `/project:test` - Run comprehensive test suite with coverage
- `/project:db-reset` - Reset and seed development database
- `/project:dev-clean` - Clean start development servers
- `/project:build-check` - Full build pipeline with quality checks
- `/project:etfo` - Focus on ETFO lesson planning features
- `/project:curriculum` - Work with curriculum import/export

For complete command reference: @docs/claude/commands.md

### Development Workflows

Common development patterns and best practices:

- Feature development workflow with TDD approach
- Bug fixing process with reproduction steps
- Database schema change procedures
- API endpoint creation standards
- Performance optimization guidelines

For detailed workflows: @docs/claude/workflows.md

## 🆘 Common Issues

### Database Issues

```bash
# If Prisma client is out of sync
pnpm --filter @teaching-engine/database db:generate

# If migrations fail
pnpm --filter @teaching-engine/database db:push --force-reset
pnpm --filter @teaching-engine/database db:migrate

# If database connection issues
# Check packages/database/.env file for DATABASE_URL
```

### Port Conflicts

```bash
# Kill processes on development ports
lsof -ti:3000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
```

### Test Issues

- Ensure Node version matches CI (18 or 20)
- Check DATABASE_URL points to test database
- Clear test database between runs

For comprehensive troubleshooting: @docs/claude/troubleshooting.md

## 🤖 For AI Coding Agents

### Project Overview

Teaching Engine 2.0 is a comprehensive digital teaching assistant. AI agents should focus on:

1. **Bug Fixes**: Address issues reported in GitHub Issues
2. **Roadmap Features**: See [docs/agents/ROADMAP_FEATURES.md](docs/agents/ROADMAP_FEATURES.md)
3. **Performance Optimization**: Improve response times and resource usage
4. **Test Coverage**: Increase coverage for edge cases
5. **Documentation**: Improve user guides and API documentation

### Before Starting Work

1. Check GitHub Issues for reported bugs or requested features
2. Review [docs/agents/ROADMAP_FEATURES.md](docs/agents/ROADMAP_FEATURES.md) for roadmap features
3. Ensure you understand the existing architecture before making changes
4. Follow all quality standards and use available slash commands

### 🚨 MANDATORY Development Practices

- **STRICT TDD ENFORCEMENT** - Write tests FIRST, then implementation
- **ZERO TOLERANCE** - Never commit failing tests or code without tests
- **DO NOT** reimplement existing features
- **DO NOT** make breaking changes to APIs or database schema
- **ALWAYS** maintain backward compatibility
- **ALWAYS** achieve 90%+ test coverage - no exceptions
- **ALWAYS** update documentation when changing functionality
- **MANDATORY** - Run `pnpm test` after every change
- **MANDATORY** - Use test-driven refactoring for all code changes
- **USE** project slash commands for common tasks (see @docs/claude/commands.md)
- **FOLLOW** established workflows (see @docs/claude/workflows.md)

### 🔥 TDD Enforcement for AI Agents

- **Test-first development** - Any feature request must start with writing tests
- **Red-Green-Refactor** - Follow the strict TDD cycle at all times
- **Test quality validation** - Tests must actually validate functionality, not just pass
- **Coverage verification** - Always run `pnpm test:coverage` before claiming completion
- **No shortcuts** - TDD applies to all code: features, fixes, refactoring, documentation

### 🌟 Production-Quality Testing Mindset

**This is PRODUCTION software used by real teachers:**

- **Real teachers will use this** - Every feature must work reliably in real classrooms
- **Real student data** - Tests must handle actual curriculum data, lesson plans, and student information
- **Real workflows** - Test complete ETFO planning workflows from start to finish
- **Real performance** - Test with realistic data volumes (hundreds of lessons, thousands of students)
- **Real edge cases** - Test actual error conditions that teachers will encounter
- **Real integrations** - Test with actual external services (AI, file uploads, databases)

**Quality Standards:**

- If a test passes but the feature doesn't work in production → TEST FAILURE
- If a feature works in development but fails in testing → CODE FAILURE
- If tests are skipped due to "complexity" → ARCHITECTURE FAILURE
- If mocks hide real integration issues → TESTING FAILURE

**Remember: Teachers depend on this software for their daily work. Every shortcut in testing becomes a problem for real educators.**

### Quick Reference

- Claude Code commands: @docs/claude/commands.md
- Development workflows: @docs/claude/workflows.md
- Troubleshooting guide: @docs/claude/troubleshooting.md
- Roadmap features: [docs/agents/ROADMAP_FEATURES.md](docs/agents/ROADMAP_FEATURES.md)
- Known issues: [docs/agents/MISSING_FEATURES.md](docs/agents/MISSING_FEATURES.md)

## 🌟 Success Vision

The ultimate goal is for teachers to say "I can't imagine teaching without Teaching Engine 2.0" and mean it from their heart. Every feature should reduce teacher workload while improving student outcomes.

---

_This file is automatically referenced by Claude Code for project context and development guidance._
