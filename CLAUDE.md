# Claude Code Configuration

This file contains important configuration and context information for Claude Code when working on the Teaching Engine 2.0 project.

## 🎯 Project Overview

Teaching Engine 2.0 is a comprehensive digital teaching assistant for elementary school teachers. The goal is to reduce teacher workload by 60% while improving curriculum coverage through intelligent automation and planning tools.

## 📁 Key Documentation

### For AI Agents

- **[docs/agents/README.md](docs/agents/README.md)** - Complete agent documentation hub
- **[PROJECT_GOALS.md](PROJECT_GOALS.md)** - Core project goals and intentions
- **[AGENT_DOCUMENTATION_INSTRUCTIONS.md](AGENT_DOCUMENTATION_INSTRUCTIONS.md)** - Documentation standards for agents

### Implementation Guides

- **[docs/agents/IMPLEMENTATION_GUIDE.md](docs/agents/IMPLEMENTATION_GUIDE.md)** - Technical implementation guide for phases 4-5
- **[docs/agents/PHASE_IMPLEMENTATION_CHECKLIST.md](docs/agents/PHASE_IMPLEMENTATION_CHECKLIST.md)** - Comprehensive task checklist
- **[docs/agents/UI_IMPLEMENTATION_GUIDE.md](docs/agents/UI_IMPLEMENTATION_GUIDE.md)** - Frontend implementation details

### Task Lists

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

## 📊 Current Status

### Completed (Phases 0-5)

- ✅ Full CRUD API for curriculum management
- ✅ React UI with comprehensive features
- ✅ Weekly planner automation
- ✅ Resource management system
- ✅ Newsletter generation with LLM
- ✅ Emergency substitute plans
- ✅ Progress tracking and alerts
- ✅ **Phase 5: Curriculum Intelligence** (January 2025)
  - ✅ AI-powered curriculum import with file parsing
  - ✅ Intelligent outcome clustering with semantic analysis
  - ✅ Enhanced planning with thematic grouping
  - ✅ Bulk material generation with templates
  - ✅ Service infrastructure with health monitoring

### Future Enhancements

- 🔄 Setup wizard for new teachers
- 🔄 Advanced analytics dashboard
- 🔄 Mobile application support

## 🎯 Development Guidelines

### Code Standards

- TypeScript strict mode (no `any` types)
- Test-driven development (TDD)
- 90%+ test coverage for new features
- JSDoc comments for all public functions
- Conventional commit messages

### Testing Requirements

- Unit tests for all business logic
- Integration tests for API endpoints
- E2E tests for user workflows
- Performance benchmarks for critical paths

### Documentation Requirements

- Technical specifications for new features
- API documentation for all endpoints
- Decision logs for architectural choices
- Agent logs for development progress

## 🤖 For AI Agents

### Before Starting Work

1. Read [PROJECT_GOALS.md](PROJECT_GOALS.md) to understand the mission
2. Review current status in [docs/agents/PHASE_IMPLEMENTATION_CHECKLIST.md](docs/agents/PHASE_IMPLEMENTATION_CHECKLIST.md)
3. Choose your work area from available tasks
4. Update your agent log in `docs/agents/logs/`

### During Development

1. Follow TDD approach (write tests first)
2. Document all design decisions
3. Update relevant documentation files
4. Coordinate with other agents on shared components

### Quality Gates

- All tests must pass
- TypeScript compilation without errors
- Lint checks pass
- Documentation updated
- Performance impact measured

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

## 🌟 Success Vision

The ultimate goal is for teachers to say "I can't imagine teaching without Teaching Engine 2.0" and mean it from their heart. Every feature should reduce teacher workload while improving student outcomes.

---

_This file is automatically referenced by Claude Code for project context and development guidance._
