# Multi-Agent Development Setup Instructions

## Your Setup Tasks

### 1. Create Your Personal Worktree

```bash
# Replace [YOUR-NAME] with your unique agent name (e.g., "alex", "maya", "sam")
git worktree add ../te2-[YOUR-NAME] main
cd ../te2-[YOUR-NAME]
```

### 2. Verify Your Environment

```bash
# Confirm you're in your personal worktree
pwd
# Should show: /path/to/te2-[YOUR-NAME]

git branch --show-current
# Should show: main

# Install dependencies
pnpm install

# Verify you can run tests
pnpm test
```

### 3. Create Your Agent Log File

```bash
# Create your coordination log
touch AGENT-[YOUR-NAME]-LOG.md
```

Add this initial entry to your log file:

```markdown
# Agent [YOUR-NAME] Development Log

## Status: Awaiting Task Assignment

**Started:** [Current Date/Time]
**Worktree:** ../te2-[YOUR-NAME]
**Current Branch:** main

## Setup Complete

- [x] Personal worktree created
- [x] Dependencies installed
- [x] Tests verified
- [ ] Task assignment received
- [ ] Feature branch created

## Awaiting Assignment

Ready to receive specific task and create feature branch.

## Files I'm Working On

(Will update when task is assigned)

-

## Coordination Notes

(Log any conflicts, dependencies, or coordination needs)

-

## Commits Made

(Track your commits for merge coordination)

-
```

### 4. Review Project Context

```bash
# Review existing project structure
cat README.md | head -50

# Check current development status
pnpm db:status
```

### 5. Coordination Protocol

**IMPORTANT: Sync with other agents regularly**

```bash
# Before starting any work session
git pull origin main
git fetch --all

# Check what branches other agents have created
git branch -a
```

**Before starting work:**

1. **Sync first:** Run `git pull origin main` and `git fetch --all`
2. Use the `memory` MCP to check what other agents are working on
3. Read all existing AGENT-\*-LOG.md files to see others' progress
4. Update your log with your intended changes
5. Check if your changes will conflict with others

**During development (after task assignment):**

1. Create your feature branch: `git checkout -b feat/[FEATURE-NAME]`
2. **Sync periodically:** Every hour, run `git fetch --all` to see other agents' commits
3. Commit frequently with descriptive messages using git commands
4. Use the `memory` MCP to store important decisions and coordinate with other agents
5. Update your log file with each significant change
6. Use conventional commit format: `feat:`, `fix:`, `docs:`, `test:`

**Before making major changes:**

```bash
# Always sync first to avoid conflicts
git pull origin main
git fetch --all

# Check if others have modified shared files
git log --oneline --since="1 hour ago" --all
```

**File coordination rules:**

- Only ONE agent should modify `package.json` at a time
- Only ONE agent should modify `prisma/schema.prisma` at a time
- Coordinate on shared components in `client/src/components/`
- API routes: prefix your routes with your feature name

**Daily check-ins:**
Update your log and memory MCP with:

```markdown
## [Date] Status Update

**Progress:** [What you accomplished]
**Next:** [What you're working on next]  
**Blockers:** [Any issues or dependencies]
**Files modified:** [List of files you've changed]
**Last sync:** [When you last ran git pull/fetch]
```

**Critical sync points:**

- ⚠️ **Before modifying shared files** (`package.json`, `schema.prisma`)
- ⚠️ **Before creating database migrations**
- ⚠️ **Before major architectural changes**
- ⚠️ **Every morning when starting work**
- ⚠️ **Before requesting merges**

### 6. Available Tools

**Memory MCP** - Use for persistent context and coordination between agents
**Firecrawl MCP** - Use for web scraping curriculum standards and documentation  
**Git CLI** - Use standard git commands for all version control operations
**Standard Node.js/React development** - All normal development tools work

### 7. Testing Protocol

```bash
# Before each commit
pnpm test
pnpm lint

# Before requesting merge
pnpm test:all
pnpm build
```

### 8. Ready for Task Assignment

Confirm setup by running:

```bash
echo "Agent setup complete!"
echo "Agent name: [YOUR-NAME]"
echo "Worktree: $(pwd)"
echo "Current branch: $(git branch --show-current)"
echo "Ready for task assignment!"
```

---

## When You Receive Your Task Assignment

**After getting your specific task, create your feature branch:**

```bash
# Create and switch to feature branch
# Replace [FEATURE-NAME] with your assigned feature
git checkout -b feat/[FEATURE-NAME]

# Update your log file with the assignment details
# Then begin development work
```

---

## Agent Coordination

**Understanding worktree coordination:**

- ✅ **You WILL see:** Other agents' committed changes (after `git pull/fetch`)
- ✅ **You WILL see:** New branches other agents create
- ✅ **You WILL see:** Shared git history and commits
- ❌ **You WON'T see:** Other agents' uncommitted file changes
- ❌ **You WON'T see:** Changes automatically - you must sync

**Use memory MCP frequently** to:

- Store your current status and plans
- Check what other agents are working on
- Log important decisions and discoveries
- Coordinate file modifications
- **Log your sync status** - when you last pulled updates

**Memory coordination pattern:**

```bash
# Store updates like:
# "Agent-Alex: Setup complete, awaiting task assignment in worktree te2-alex"
# "Agent-Maya: Working on curriculum import, created feat/curriculum-standards branch, last sync 10:30am"
# "Agent-Sam: UI testing assignment received, modified components in feat/ui-automation, synced with main"
```

**Emergency coordination:**
If you encounter conflicts or need help:

1. Add `⚠️ COORDINATION NEEDED` to your log file
2. Use memory MCP to flag the issue
3. Describe the problem clearly
4. Wait for coordinator response

---

## Merge Request Protocol

When ready to merge:

1. Ensure all tests pass: `pnpm test:all`
2. Update your log with final status
3. Use memory MCP to announce completion
4. Create merge request with:
   - Clear description of changes
   - List of files modified
   - Any breaking changes
   - Test coverage verification

**Commit conventions:** `feat: add curriculum import functionality`
**Branch naming:** `feat/[feature-name]`
