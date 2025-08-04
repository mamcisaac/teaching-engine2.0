# Claude Code Configuration

## Build Commands

⚠️ **IMPORTANT**: This is a pnpm workspace project. Root-level npm commands won't work.

### Starting the Development Servers
```bash
# Method 1: Start both servers separately (recommended)
cd server && npm run dev &
cd ../client && npm run dev

# Method 2: Alternative approach
# Terminal 1:
cd server && npm run dev
# Terminal 2: 
cd client && npm run dev
```

### Other Commands
- `cd client && npm run build`: Build the client
- `cd server && npm run build`: Build the server
- `cd client && npm run test`: Run client tests
- `cd server && npm run test`: Run server tests
- `cd client && npm run lint`: Run client ESLint
- `cd server && npm run lint`: Run server ESLint
- `cd client && npm run typecheck`: Run client TypeScript checking
- `cd server && npm run typecheck`: Run server TypeScript checking

## Known Issues & Solutions

### Module Resolution Error: '@shared/utils/typeGuards'

**Problem**: Server fails to start with error:
```
Error: Cannot find module '@shared/utils/typeGuards'
```

**Root Cause**: TypeScript path mapping configured but module resolution not working with tsx runner.

**Current Status**: 
- Server tsconfig.json has correct path mapping: `"@shared/*": ["../shared/*"]`
- Shared utilities exist at `/shared/utils/typeGuards.ts`
- 7 server files use this import pattern

**Temporary Workaround**: 
The app is functional but server needs module resolution fix.

**Files Affected**:
- `server/src/middleware/cache.ts`
- `server/src/utils/database.ts`
- `server/src/routes/curriculum-expectations.ts`
- `server/src/routes/daybook-entries.ts`
- `server/src/routes/newsletter.ts`
- `server/src/routes/lesson-plans.ts`
- `server/src/middleware/validation.ts`

### Current Subject Selection Implementation

**Working Features**:
- ✅ Onboarding flow with 4 steps
- ✅ Subject selection with core/optional/specialist categories
- ✅ localStorage persistence with `STORAGE_KEYS` constants
- ✅ 68 Grade 1 French Immersion curriculum expectations seeded
- ✅ Subject filtering throughout the application
- ✅ Coverage tracking based on selected subjects

**Technical Implementation**:
- React Context API for onboarding state
- localStorage for subject persistence (`teacher-subjects` key)
- Constants defined in `client/src/constants/subjects.ts`
- Subject validation with warnings for missing core subjects

## Grade 1 French Immersion Curriculum Details

### Complete Curriculum Coverage (68 Expectations)
- **Français langue première**: 15 expectations
- **Mathématiques**: 20 expectations  
- **Sciences et technologie**: 10 expectations
- **Études sociales**: 8 expectations
- **Arts**: 10 expectations
- **English Language Arts**: 5 expectations

### Database Seeding
```bash
# Seed the complete Grade 1 curriculum
pnpm --filter @teaching-engine/database db:seed

# Reset and re-seed if needed
pnpm --filter @teaching-engine/database db:reset
pnpm --filter @teaching-engine/database db:seed
```

### Subject Selection Constants
Defined in `client/src/constants/subjects.ts`:
- `CORE_SUBJECTS`: Français langue première, Mathématiques
- `SPECIALIST_SUBJECTS`: Éducation physique, Éducation à la santé
- `STORAGE_KEYS`: localStorage key constants

## Code Style Preferences
- Use ES modules (import/export) syntax
- Destructure imports when possible
- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Use async/await instead of Promise chains
- Prefer const/let over var

## Workflow Guidelines
- Always run typecheck after making code changes: `cd client && npm run typecheck` and `cd server && npm run typecheck`
- Run tests before committing changes: `cd client && npm run test` and `cd server && npm run test`
- Use meaningful commit messages
- Create feature branches for new functionality
- Ensure all tests pass before merging
- **Remember**: This is a pnpm workspace - use individual package commands, not root-level npm commands

## Important Notes
- **Use TodoWrite extensively** for all complex task coordination
- **Leverage Task tool** for parallel agent execution on independent work
- **Store all important information in Memory** for cross-agent coordination
- **Use batch file operations** whenever reading/writing multiple files
- **Monitor progress** with TodoRead during long-running operations
- **Enable parallel execution** with --parallel flags for maximum efficiency
- **CRITICAL**: This is a pnpm workspace - never use root-level npm commands
- **Module Resolution Issue**: Server has known '@shared/utils/typeGuards' import issue

This configuration ensures optimal use of Claude Code's batch tools for swarm orchestration and parallel task execution, specifically optimized for Grade 1 French Immersion teaching in PEI.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.