# Claude Code Configuration

## 🔴 CRITICAL PROTECTION NOTICE: LONG RANGE PLANS ARE PERFECT

### ⛔ DO NOT MODIFY LONG RANGE PLANS
**Status as of August 18, 2025:** All 6 Long Range Plans are **PERFECT** and **PROTECTED**

**The following LRPs are LOCKED and must NEVER be changed:**
1. ✅ **Français (Immersion)** - 100% Perfect
2. ✅ **Mathématiques** - 100% Perfect  
3. ✅ **Sciences de la nature** - 100% Perfect (with safety protocols)
4. ✅ **Sciences humaines** - 100% Perfect (with family safety)
5. ✅ **Arts visuels** - 100% Perfect
6. ✅ **Formation personnelle et sociale** - 100% Perfect (with emotional safety)

**Protection Documents:**
- See `LRP_PERFECTION_CERTIFICATE.md` for certification details
- See `LRP_PROTECTION_PROTOCOL.md` for protection mechanisms
- Any modification attempts will be rejected

**These LRPs have been:**
- Manually perfected with careful thought
- Certified to meet 100% ETFO standards
- Verified for Grade 1 appropriateness
- Protected from any changes

## 🔴 CRITICAL: LESSON ORDERING IS NOW EXPLICIT

### ⚠️ All 970 Lessons Have Sequential Numbers
**Status as of January 5, 2025:** Every lesson has an explicit `lessonNumber` field

**Implementation Complete:**
- Database field `lessonNumber` added to ETFOLessonPlan table
- Unique constraint ensures no duplicates within units
- API endpoints order by lessonNumber automatically
- All 970 lessons numbered based on pedagogical sequence

**Protection:**
- See `LESSON_ORDERING_CANONICAL.md` for complete sequences
- See `scripts/assign-lesson-numbers.py` for numbering logic
- NEVER change lesson numbers without pedagogical review

## 🔴 CRITICAL PROTECTION NOTICE: UNIT PLANS ARE STRATEGICALLY PERFECT

### ⛔ DO NOT MODIFY UNIT PLANS
**Status as of August 20, 2025:** All 50 Unit Plans are **STRATEGICALLY PERFECT** and **PROTECTED**

**STRATEGIC PERFECTION ACHIEVED:**
- **Health/FPS Units:** Strategically redistributed (16+15+15+14+13 hours)
- **All Other Units:** Optimally scheduled and content-verified
- **Total Protection:** 50 units across 6 subjects locked

**Strategic Health/FPS Redistribution:**
1. ✅ **Mon corps et ma sécurité** - 16 hours (Foundation emphasis)
2. ✅ **Mes émotions et sentiments** - 15 hours (Complex skills support)
3. ✅ **Amitiés et relations positives** - 15 hours (Social practice time)
4. ✅ **Nutrition et mode de vie sain** - 14 hours (Concrete content)
5. ✅ **Grandir, changer et célébrer ensemble** - 13 hours (Streamlined)

**Result:** 73 hours = 97 lessons = Perfect rotation requirement ✅

**Protection Documents:**
- See `UNIT_PLANS_PERFECTION_CERTIFICATE.md` for strategic certification
- See `UNIT_PLANS_PROTECTION_PROTOCOL.md` for protection mechanisms
- Multi-layer protection: Database + API + Documentation

**These Unit Plans have been:**
- Strategically redistributed based on content complexity
- Optimally scheduled across the school year
- Data-verified for structural integrity
- Permanently protected from modification

## 🎯 REVOLUTIONARY: Emily's Teaching System - OPTIMAL DAILY INTEGRATION (August 18, 2025)

### 🌟 PEDAGOGICAL BREAKTHROUGH: Daily Integration Model
**REVOLUTIONARY APPROACH**: Eliminated problematic rotation gaps for ETFO-compliant daily instruction.

### Teaching Structure (Grade 1 French Immersion - 195 School Days)
Emily teaches **5 subjects daily** ALL IN FRENCH:
1. **French Language Arts:** 45 minutes daily = **195 lessons total**
2. **Mathematics (in French):** 45 minutes daily = **195 lessons total**
3. **Science (in French):** 45 minutes daily = **195 lessons total**
4. **Arts (in French):** 45 minutes daily = **195 lessons total**
5. **Social Studies/Health alternating (in French):** 45 minutes daily = **97-98 lessons each**

### OPTIMAL Lesson Distribution (975 Total Lessons)
**Daily Teaching Load: 5 lessons per day × 195 days = 975 lessons**

**Daily Subjects (ETFO Compliant):**
- French Language Arts: 195 lessons (1 per day × 195 days)
- Mathematics: 195 lessons (1 per day × 195 days)
- Science: 195 lessons (1 per day × 195 days)
- Arts: 195 lessons (1 per day × 195 days)

**Alternating Subjects (Every Other Day):**
- Social Studies: 97 lessons (every other day)
- Health/FPS: 98 lessons (every other day)

### Hours Calculation for Planning
- **French Language Arts:** 195 lessons × 45 min = 146.25 hours
- **Mathematics:** 195 lessons × 45 min = 146.25 hours
- **Science:** 195 lessons × 45 min = 146.25 hours
- **Arts:** 195 lessons × 45 min = 146.25 hours
- **Social Studies:** 97 lessons × 45 min = 72.75 hours
- **Health/FPS:** 98 lessons × 45 min = 73.5 hours
- **TOTAL:** 975 lessons = 731.25 hours
- **FRENCH IMMERSION:** 100% instruction conducted in French

### Pedagogical Advantages
- **ETFO Compliance:** Daily continuity enables proper assessment and planning
- **Skill Building:** All subjects benefit from daily practice and progression
- **French Immersion Depth:** Complete immersion maintained across all content areas
- **Grade 1 Appropriate:** Predictable routine with optimal 45-minute lessons

See `UNIVERSAL_TRUTH_LESSON_REQUIREMENTS.md` for complete details.

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

## Database Restoration & Path Configuration

### 🔴 CRITICAL: Database Path Mismatch Issue

**Problem**: After database backup restoration, Prisma client returns empty results (0 lessons, 0 users) despite database containing all 970 lessons and user data.

**Root Cause**: Relative DATABASE_URL paths in .env files don't resolve correctly from different execution contexts, causing Prisma to connect to empty database files instead of the restored data.

**Symptoms**:
- `prisma.ETFOLessonPlan.count()` returns 0
- `prisma.user.count()` returns 0
- SQLite direct queries show all data exists
- Database files exist at expected paths with correct sizes

### Solution: Use Absolute Database Paths

**Fix both .env files after any database restoration:**

1. **Server .env file** (`/server/.env`):
```bash
# WRONG (relative path - causes connection failures)
DATABASE_URL="file:./prisma/prisma/dev.db"

# CORRECT (absolute path - works reliably)
DATABASE_URL="file:/Users/michaelmcisaac/Github/teaching-engine2.0/server/prisma/prisma/dev.db"
```

2. **Database package .env file** (`/packages/database/.env`):
```bash
# WRONG (relative path - causes connection failures)
DATABASE_URL="file:./prisma/prisma/dev.db"

# CORRECT (absolute path - works reliably)
DATABASE_URL="file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/prisma/dev.db"
```

### Restoration Checklist

After restoring any database backup:

1. **Update both .env files** with absolute paths (see above)
2. **Regenerate Prisma clients**:
   ```bash
   cd packages/database && npx prisma generate && npm run build
   ```
3. **Test connection**:
   ```bash
   cd server
   node -e "const {PrismaClient} = require('@teaching-engine/database'); const p = new PrismaClient(); p.ETFOLessonPlan.count().then(c => console.log('Lessons:', c)).finally(() => p.\$disconnect())"
   ```
   Should output: `Lessons: 970`

4. **Verify all data accessible**:
   - Emily McIsaac (userId: 23) exists
   - 970 lessons accessible
   - 50 unit plans accessible
   - 6 long range plans accessible

**This database path mismatch occurs EVERY TIME a database backup is restored** due to workspace path resolution differences.

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
- **Français (Immersion)**: 15 expectations
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
- `CORE_SUBJECTS`: Français (Immersion), Mathématiques
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