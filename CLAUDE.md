# CLAUDE.md - Claude Code Configuration

# This file contains persistent instructions that override default behaviors

# Documentation: https://docs.anthropic.com/en/docs/claude-code/memory

## Core Coding Principles

1. **No artifacts** - Direct code only
2. **Less is more** - Rewrite existing components vs adding new
3. **No fallbacks** - They hide real failures
4. **Full code output** - Never say "[X] remains unchanged"
5. **Clean codebase** - Flag obsolete files for removal
6. **Think first** - Clear thinking prevents bugs

## Project Overview

Teaching Engine 2.0 is a comprehensive digital teaching assistant for elementary school teachers. Goal: reduce teacher workload by 60% while improving curriculum coverage through intelligent automation and planning tools.

## Documentation Structure

### Documentation Files & Purpose

Create `./docs/` folder and maintain these files throughout development:

- `ROADMAP.md` - Overview, features, architecture, future plans
- `API_REFERENCE.md` - All endpoints, request/response schemas, examples
- `DATA_FLOW.md` - System architecture, data patterns, component interactions
- `SCHEMAS.md` - Database schemas, data models, validation rules
- `BUG_REFERENCE.md` - Known issues, root causes, solutions, workarounds
- `VERSION_LOG.md` - Release history, version numbers, change summaries
- `memory-archive/` - Historical CLAUDE.md content (auto-created by /prune)

### Documentation Standards

**Format Requirements**:

- Use clear hierarchical headers (##, ###, ####)
- Include "Last Updated" date and version at top
- Keep line length ≤ 100 chars for readability
- Use code blocks with language hints
- Include practical examples, not just theory

**Content Guidelines**:

- Write for future developers (including yourself in 6 months)
- Focus on "why" not just "what"
- Link between related docs (use relative paths)
- Keep each doc focused on its purpose
- Update version numbers when content changes significantly

### Auto-Documentation Triggers

**ALWAYS document when**:

- Fixing bugs → Update `./docs/BUG_REFERENCE.md` with:
  - Bug description, root cause, solution, prevention strategy
- Adding features → Update `./docs/ROADMAP.md` with:
  - Feature description, architecture changes, API additions
- Changing APIs → Update `./docs/API_REFERENCE.md` with:
  - New/modified endpoints, breaking changes flagged, migration notes
- Architecture changes → Update `./docs/DATA_FLOW.md`
- Database changes → Update `./docs/SCHEMAS.md`
- Before ANY commit → Check if docs need updates

### Documentation Review Checklist

When running `/changes`, verify:

- [ ] All modified APIs documented in API_REFERENCE.md
- [ ] New bugs added to BUG_REFERENCE.md with solutions
- [ ] ROADMAP.md reflects completed/planned features
- [ ] VERSION_LOG.md has entry for current session
- [ ] Cross-references between docs are valid
- [ ] Examples still work with current code

## Test Driven Development (TDD)

**CRITICAL: This project enforces STRICT TDD - no exceptions**

### 🔴 RED-GREEN-REFACTOR Cycle

- Write tests FIRST - Before implementing any feature
- Run tests after EVERY change - Use `pnpm test`
- ALL tests must pass - Never commit with failing tests
- No feature without tests - Every new method/class must have tests
- Test-driven refactoring - Write tests before refactoring

### Test Standards

**Real-World Testing Requirements**:

- USE REAL DATA - Connect to actual test databases, make real API calls
- TEST REAL IMPLEMENTATIONS - Validate actual service methods
- VERIFY COMPLETE FUNCTIONALITY - Test end-to-end workflows
- Test with production-scale data volumes

**Testing Frameworks**:

- Backend: Jest with real database connections
- Frontend: Vitest + React Testing Library with real backend
- E2E: Playwright for user journey testing

**Coverage Requirements**:

- Unit Tests: 90% statement coverage, 85% branch coverage
- Integration Tests: All API endpoints must have tests
- E2E Tests: All critical user workflows
- Performance Tests: Response time benchmarks

### Essential Test Commands

```bash
pnpm test                    # Run all tests
pnpm test:coverage          # Ensure 90%+ coverage
pnpm typecheck              # TypeScript validation
pnpm lint                   # Code quality checks
```

## Proactive Behaviors

- **Bug fixes**: Always document in BUG_REFERENCE.md
- **Code changes**: Judge if documentable → Just do it
- **Project work**: Track with TodoWrite, document at end
- **Personal conversations**: Offer "Would you like this as a note?"

## Critical Reminders

- Do exactly what's asked - nothing more, nothing less
- NEVER create files unless absolutely necessary
- ALWAYS prefer editing existing files over creating new ones
- NEVER create documentation unless working on a coding project
- Use `claude code commit` to preserve this CLAUDE.md on new machines
- When coding, keep the project as modular as possible

---

# Project-Specific Configuration

## Tech Stack

- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (production), SQLite (development)
- **Frontend**: React with TypeScript, TanStack Query
- **Styling**: Tailwind CSS
- **Testing**: Jest/Vitest, Playwright
- **ORM**: Prisma

## Project Structure

```
teaching-engine2.0/
├── client/              # React frontend
├── server/              # Express backend
├── packages/
│   └── database/        # Shared Prisma database package
├── docs/                # Documentation
│   ├── agents/          # Agent coordination & guides
│   └── claude/          # Claude-specific docs
├── scripts/             # Setup and utility scripts
└── tests/               # E2E tests
```

## Development Commands

### Quick Reference

```bash
# Development
pnpm dev                     # Start all dev servers
pnpm dev:clean              # Clean restart

# Testing
pnpm test                   # Run all tests
pnpm test:coverage         # Check coverage
pnpm test:watch           # Watch mode

# Database
pnpm --filter @teaching-engine/database db:generate  # Generate Prisma client
pnpm --filter @teaching-engine/database db:migrate   # Run migrations
pnpm --filter @teaching-engine/database db:studio    # Open Prisma Studio
pnpm --filter @teaching-engine/database db:seed      # Seed database

# Quality
pnpm lint                  # Lint code
pnpm typecheck            # Type checking
pnpm build                # Production build
```

### Custom Slash Commands

- `/project:test` - Run comprehensive test suite with coverage
- `/project:db-reset` - Reset and seed development database
- `/project:dev-clean` - Clean start development servers
- `/project:build-check` - Full build pipeline with quality checks
- `/project:etfo` - Focus on ETFO lesson planning features
- `/project:curriculum` - Work with curriculum import/export

For complete command reference: @docs/claude/commands.md

## Key Documentation References

- Project roadmap: [docs/agents/ROADMAP_FEATURES.md](docs/agents/ROADMAP_FEATURES.md)
- Missing features: [docs/agents/MISSING_FEATURES.md](docs/agents/MISSING_FEATURES.md)
- Development workflows: @docs/claude/workflows.md
- Troubleshooting: @docs/claude/troubleshooting.md
- Custom commands: @docs/claude/commands.md

## 🆘 Common Issues

### Database Issues

```bash
# If Prisma client is out of sync
pnpm --filter @teaching-engine/database db:generate

# If migrations fail
pnpm --filter @teaching-engine/database db:push --force-reset
```

### Port Conflicts

```bash
# Kill processes on development ports
lsof -ti:3000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
```

## For AI Coding Agents

### Development Practices

- **STRICT TDD ENFORCEMENT** - Write tests FIRST, then implementation
- **ZERO TOLERANCE** - Never commit failing tests or code without tests
- **DO NOT** reimplement existing features
- **DO NOT** make breaking changes to APIs or database schema
- **ALWAYS** maintain backward compatibility
- **ALWAYS** achieve 90%+ test coverage - no exceptions
- **ALWAYS** update documentation when changing functionality
- **USE** project slash commands for common tasks
- **FOLLOW** established workflows

### Before Starting Work

1. Check GitHub Issues for reported bugs or requested features
2. Review roadmap features in docs/agents/ROADMAP_FEATURES.md
3. Ensure you understand the existing architecture
4. Follow all quality standards and use available slash commands

### Production-Quality Mindset

This is PRODUCTION software used by real teachers:

- Real teachers will use this - Every feature must work reliably
- Real student data - Handle actual curriculum data and lesson plans
- Real workflows - Test complete ETFO planning workflows
- Real performance - Test with realistic data volumes
- Real edge cases - Test actual error conditions
- Real integrations - Test with actual external services

---

_This file is automatically referenced by Claude Code for project context and development guidance._
