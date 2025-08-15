# Claude Code Configuration

## 🎯 CRITICAL: Emily's Teaching System - Rotation Model (OVERHAULED)

### Current System Status (August 15, 2025)
**COMPLETE OVERHAUL PERFORMED** - System restructured from broken concurrent model to proper rotation model:
- **528 lessons** (was 784 with 312% over-coverage)
- **27 rotation units** (was 40 overlapping units)
- **2-3 week units** (was up to 9 weeks)

### Teaching Structure (Grade 1 French Immersion)
Emily teaches **3 subjects per day**:
1. **French:** 75 minutes daily (morning, split block) - 195 lessons
2. **Math:** 35 minutes daily (mid-morning) - 195 lessons
3. **Rotating Subject:** 90 minutes daily (afternoon, double-block) - 138 lessons total

### Rotation Model (Sequential, Not Concurrent)
- **ONE subject at a time** for 2-3 weeks
- **Double-block afternoons** (2 × 45 min same subject)
- **Deep learning** through extended exploration
- **Proper distribution:** No over-coverage

### Lesson Distribution
- French: 195 lessons (100% daily coverage)
- Math: 195 lessons (100% daily coverage)
- Science: 48 lessons (5 rotation blocks)
- Social Studies: 30 lessons (2 rotation blocks)
- Arts: 30 lessons (2 rotation blocks)
- Health: 30 lessons (2 rotation blocks)

See `ROTATION_SCHEDULE_FINAL.md` and `OVERHAUL_SUCCESS.md` for details.

## ⚠️ CRITICAL: Assessment and Validation Principles

### NEVER Use Keyword Counting or Mechanical Validation
**All educational content assessment MUST be done through intelligent pedagogical analysis, NOT through:**
- ❌ Keyword searching or counting
- ❌ Pattern matching for specific phrases  
- ❌ Mechanical validation scripts
- ❌ Automated scoring based on text presence
- ❌ Checking for exact string matches

### Required: Intelligent Pedagogical Assessment
**When evaluating unit plans, lesson plans, or any educational content:**
- ✅ Understand the actual pedagogical content and meaning
- ✅ Assess whether learning objectives are meaningfully addressed
- ✅ Evaluate if differentiation strategies genuinely support diverse learners
- ✅ Verify assessment methods actually measure intended outcomes
- ✅ Confirm activities authentically engage students
- ✅ Use professional educational judgment, not mechanical rules

### Example of Proper Assessment
**WRONG**: "Unit scores 88% because it doesn't contain the keyword 'FORMATIVE'"
**RIGHT**: "Unit has comprehensive assessment including ongoing observations, portfolios, and self-reflection (formative) plus final exhibitions (summative), scoring 100%"

**WRONG**: "Missing 'forStruggling' keyword in differentiation"
**RIGHT**: "Differentiation includes visual supports, simplified tasks, and peer assistance for learners who need additional support"

### Implementation Note
All validation in this codebase must use intelligent agents performing meaningful pedagogical review. Never rely on keyword presence, string matching, or mechanical counting. Quality is determined by educational substance, not text patterns.

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

## Curriculum Extraction Guidelines

### ⚠️ CRITICAL: Context Overflow Prevention

**NEVER ATTEMPT TO READ THESE FILES DIRECTLY:**
- PR 2766 - Prog. Immersion 1re année 5.30.19.pdf (1.7MB) - **WILL CRASH CONTEXT**
- Unités transdisciplinaires 1re année (4.0MB) - **WILL CRASH CONTEXT**
- Grade 1 Health Curriculum.pdf (3.6MB) - **WILL CRASH CONTEXT**
- Any PDF over 1MB should be treated with extreme caution

### Mandatory Extraction Process for PR 2766

**Context Crash History:** Multiple failed attempts confirmed that reading PR 2766 directly causes immediate context overflow and conversation failure.

**ONLY WORKING METHOD:**
1. **Use pre-generated prompt files** (already created in project root):
   - `extraction_pr2766_français_langue_première_prompt.txt`
   - `extraction_pr2766_mathématiques_prompt.txt`
   - `extraction_pr2766_sciences_de_la_nature_prompt.txt`
   - `extraction_pr2766_sciences_humaines_prompt.txt`
   - `extraction_pr2766_arts_prompt.txt`
   - `extraction_pr2766_formation_personnelle_et_sociale_prompt.txt`

2. **Launch parallel Task agents**:
   - Each agent reads ONLY its prompt file
   - Each agent extracts ONE subject area
   - Results saved to `extraction_pr2766_[subject].json`

3. **Merge results**: `node scripts/extract-chunked.js merge`

### Recovery from Context Crash

When extraction causes context overflow:
1. Start new conversation
2. Read `EXTRACTION_SUMMARY.md` for status
3. Check existing `extraction*.json` files
4. Continue from last successful extraction
5. **DO NOT** attempt to read the problematic PDF again

### Extraction Status Files
- `EXTRACTION_STRATEGY.md` - Detailed extraction plan with warnings
- `EXTRACTION_SUMMARY.md` - Quick recovery guide with integrity incident log
- `CURRICULUM_EXTRACTION_STATUS.md` - Tracking table with progress
- `REAL_EXPECTATIONS_ONLY.json` - Verified extraction results (no synthetic data)

## Data Integrity Requirements

### CRITICAL: No Synthetic Data Policy

**Background:** On 2025-08-08, Task agents generated 53 synthetic curriculum expectations without reading source documents. This contaminated the curriculum database with fake educational data.

**Mandatory Rules:**
1. **NEVER** mark extraction as complete without source verification
2. **ALWAYS** ensure agents have actual access to source documents
3. **NEVER** generate plausible-looking data when source is unavailable
4. **ALWAYS** fail loudly rather than produce synthetic data

### Verification Requirements

Every extracted expectation MUST:
- Have a verifiable source document
- Include specific page numbers when possible
- Be traceable back to original text
- Pass validation against known curriculum patterns

### Extraction Validation Checklist
- [ ] Agent had direct access to source document
- [ ] Expectations cite correct source document
- [ ] Data patterns match PEI curriculum standards
- [ ] No expectations exist without source verification
- [ ] All codes follow documented patterns

### If Synthetic Data is Detected
1. Immediately delete contaminated files
2. Document the incident in EXTRACTION_SUMMARY.md
3. Re-extract using verified methods only
4. Update all tracking to reflect real state

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.