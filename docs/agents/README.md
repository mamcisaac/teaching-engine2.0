# Agent Documentation Hub

This directory contains comprehensive documentation for AI coding agents working on the Teaching Engine 2.0 project. All documentation is organized to ensure agents always understand what is intentional vs. what needs improvement.

## 📂 Documentation Structure

### 🎯 Core Project Understanding

- **[PROJECT_GOALS.md](../../PROJECT_GOALS.md)** - Core mission, architectural philosophy, and vision statement
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Complete technical implementation guide for phases 4-5
- **[AGENT_DOCUMENTATION_INSTRUCTIONS.md](../../AGENT_DOCUMENTATION_INSTRUCTIONS.md)** - Instructions for creating detailed documentation

### 🤝 Multi-Agent Development

- **[MULTI_AGENT_SETUP.md](./MULTI_AGENT_SETUP.md)** - Complete setup guide for multi-agent development workflow

### 📋 Task Management

- **[PHASE_IMPLEMENTATION_CHECKLIST.md](./PHASE_IMPLEMENTATION_CHECKLIST.md)** - Comprehensive checklist for all project phases (0-5)
- **[ENHANCEMENT_FEATURES.md](./ENHANCEMENT_FEATURES.md)** - Advanced features for post-MVP enhancements
- **[MISSING_FEATURES.md](./MISSING_FEATURES.md)** - Critical missing or underdeveloped features

### 🎨 Frontend Development

- **[UI_IMPLEMENTATION_GUIDE.md](./UI_IMPLEMENTATION_GUIDE.md)** - Detailed UI implementation checklist and specifications

### 📝 Agent Activity Logs

- **[logs/](./logs/)** - Individual agent development logs and progress tracking

## 🚀 Quick Start for New Agents

### 0. Setup Your Development Environment

Follow [MULTI_AGENT_SETUP.md](./MULTI_AGENT_SETUP.md) to:

- Create your personal git worktree
- Install dependencies and verify tests
- Set up your agent log file
- Understand coordination protocols

### 1. Understand the Project Goals

Start by reading [PROJECT_GOALS.md](../../PROJECT_GOALS.md) to understand:

- The core mission of Teaching Engine 2.0
- Target user profile (elementary teachers)
- Architectural philosophy and design decisions
- Success metrics and vision statement

### 2. Review Current Implementation Status

Check [PHASE_IMPLEMENTATION_CHECKLIST.md](./PHASE_IMPLEMENTATION_CHECKLIST.md) to see:

- What phases are complete (0-4 are done)
- Current status of Phase 5 features
- Detailed implementation requirements
- Success criteria for each feature

### 3. Choose Your Work Area

Select from available work:

- **Phase 5 Features**: Curriculum intelligence and AI integration
- **Enhancement Features**: Advanced calendar, notifications, and workflow improvements
- **Missing Features**: Critical gaps in core functionality
- **Bug Fixes**: Issues identified in existing features

### 4. Follow Documentation Standards

Read [AGENT_DOCUMENTATION_INSTRUCTIONS.md](../../AGENT_DOCUMENTATION_INSTRUCTIONS.md) to ensure you:

- Create proper technical specifications
- Document all design decisions
- Update your agent log regularly
- Follow code documentation standards

## 🤖 Agent Coordination

### Active Agent Guidelines

1. **Claim Your Work**: Update the appropriate TODO file when starting a feature
2. **Log Your Progress**: Maintain your agent log in `logs/AGENT-[NAME]-LOG.md`
3. **Document Decisions**: Record architectural choices and their rationale
4. **Communicate Changes**: Flag any database schema or API changes immediately

### Avoiding Conflicts

- Always pull latest before starting work
- Coordinate on shared files (database schemas, core APIs)
- Use feature branches for all development
- Test thoroughly before merging

## 📊 Project Context

### What's Built (Phases 0-4 Complete)

- ✅ Full CRUD API for curriculum management
- ✅ React UI with comprehensive forms and visualizations
- ✅ SQLite database with Prisma ORM
- ✅ Comprehensive test suite (Jest, Vitest, Playwright)
- ✅ Docker deployment and CI/CD pipeline
- ✅ Weekly planner automation
- ✅ Resource management system
- ✅ Progress alerts and notifications
- ✅ Newsletter generation with LLM enhancement
- ✅ Emergency substitute plans

### What's Next (Phase 5)

- 🚧 AI-powered curriculum import from PEI standards
- 🚧 Intelligent outcome clustering and milestone generation
- 🚧 Setup wizard for new teachers
- 🚧 Standards compliance tracking

### Enhancement Opportunities

- 📅 Advanced calendar integration with school events
- 🔔 Enhanced notification system with email fallbacks
- 📊 Year-at-a-glance planning views
- 🛠️ Equipment booking and logistics management

## 🎯 Success Metrics

### User Experience Goals

- **Planning Time Reduction**: 70% decrease (10 hours → 3 hours weekly)
- **Feature Adoption**: 90% utilization within 30 days
- **Error Rate**: <1% of user actions result in errors
- **User Satisfaction**: >4.5/5 in quarterly surveys

### Technical Standards

- **Test Coverage**: >90% for all new code
- **Performance**: <2 second page loads, <500ms API responses
- **Accessibility**: WCAG AA compliance
- **Security**: FERPA compliance for student data

## 🛡️ Quality Standards

### Code Requirements

- **TypeScript**: Strict mode, explicit types, no `any`
- **Testing**: TDD approach with comprehensive coverage
- **Documentation**: JSDoc for all components and functions
- **Performance**: Measured and optimized for teacher workflows

### Review Checklist

- [ ] All tests pass (`pnpm test`)
- [ ] TypeScript compiles without errors (`pnpm build`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Documentation updated
- [ ] Agent log updated with decisions made
- [ ] Performance impact measured

## 📚 Additional Resources

### External References

- [Prisma Documentation](https://www.prisma.io/docs)
- [React Query Patterns](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PEI Curriculum](https://www.princeedwardisland.ca/en/topic/curriculum)

### Internal Architecture

- **Backend**: Express with TypeScript
- **Database**: Shared Prisma package (`@teaching-engine/database`) with SQLite
- **Frontend**: React with TypeScript and TanStack Query
- **Styling**: Tailwind CSS utility classes only
- **Testing**: Jest/Vitest unit tests, Playwright E2E
- **Monorepo**: pnpm workspaces with organized package structure

## 🆘 Getting Help

### Common Issues

- **Database sync issues**: `pnpm --filter @teaching-engine/database db:generate`
- **Database migrations**: `pnpm --filter @teaching-engine/database db:migrate`
- **Port conflicts**: `lsof -ti:3000 | xargs kill -9`
- **Test failures**: Check Node version matches CI requirements

### Support Resources

- Review existing code patterns in `server/src/routes/` and `client/src/components/`
- Check recent commit history for implementation examples
- Consult the decision log for architectural precedents
- Ask for clarification on unclear requirements

## 🌟 Remember

**The goal is to build a tool that genuinely helps teachers.** Every feature should reduce workload, not add to it. When in doubt, prioritize simplicity and reliability over complexity.

**Success looks like**: A teacher saying "I can't imagine teaching without Teaching Engine 2.0" and meaning it from their heart.

---

_This documentation serves as the central hub for all agent coordination and development activities. Keep it updated as the project evolves._
