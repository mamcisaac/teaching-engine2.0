# Claude Code Configuration

This file contains important configuration and context information for Claude Code when working on the Teaching Engine 2.0 project.

## 🎯 Project Overview

Teaching Engine 2.0 is a comprehensive digital teaching assistant for elementary school teachers. The goal is to reduce teacher workload by 60% while improving curriculum coverage through intelligent automation and planning tools.

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

### Code Standards

- TypeScript strict mode (no `any` types)
- Test-driven development (TDD)
- 90%+ test coverage for features
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

### Development Best Practices
- **DO NOT** reimplement existing features
- **DO NOT** make breaking changes to APIs or database schema
- **ALWAYS** maintain backward compatibility
- **ALWAYS** write tests for code (90%+ coverage)
- **ALWAYS** update documentation when changing functionality
- **USE** project slash commands for common tasks (see @docs/claude/commands.md)
- **FOLLOW** established workflows (see @docs/claude/workflows.md)

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
