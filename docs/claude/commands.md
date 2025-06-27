# Custom Slash Commands

This file defines project-specific slash commands for Teaching Engine 2.0 development.

## Test Commands

### `/project:test`

**Description**: Run comprehensive test suite with coverage report
**Command**:

```bash
pnpm test && echo "✅ All tests passed! Running coverage..." && pnpm test:coverage
```

### `/project:test-quick`

**Description**: Run quick unit tests only (no E2E)
**Command**:

```bash
pnpm --filter server test && pnpm --filter client test
```

## Database Commands

### `/project:db-reset`

**Description**: Reset development database and seed with sample data
**Command**:

```bash
pnpm --filter @teaching-engine/database db:push --force-reset && pnpm --filter @teaching-engine/database db:seed
```

### `/project:db-studio`

**Description**: Open Prisma Studio for database inspection
**Command**:

```bash
pnpm --filter @teaching-engine/database db:studio
```

## Development Commands

### `/project:dev-clean`

**Description**: Clean up development processes and start fresh
**Command**:

```bash
pnpm dev:clean
```

### `/project:dev-start`

**Description**: Start development servers with improved process management
**Command**:

```bash
pnpm dev
```

### `/project:dev-reset`

**Description**: Full development reset (cleanup + database reset + restart)
**Command**:

```bash
pnpm dev:reset
```

### `/project:dev-debug`

**Description**: Show development server status and ports
**Command**:

```bash
pnpm dev:ports && echo "Logs:" && ls -la *.log 2>/dev/null || echo "No log files found"
```

### `/project:build-check`

**Description**: Run full build pipeline with type checking and linting
**Command**:

```bash
pnpm typecheck && pnpm lint && pnpm build
```

## Feature-Specific Commands

### `/project:etfo`

**Description**: Focus on ETFO lesson planning features - run related tests and show relevant files
**Command**:

```bash
echo "🎯 ETFO Lesson Planning Focus" && pnpm --filter server test -- etfo && echo "📁 Key ETFO files:" && find . -name "*etfo*" -type f | head -10
```

### `/project:curriculum`

**Description**: Work with curriculum import/export features
**Command**:

```bash
echo "📚 Curriculum Management Focus" && pnpm --filter server test -- curriculum && echo "📁 Key curriculum files:" && find . -name "*curriculum*" -type f | head -10
```

## Quality Assurance Commands

### `/project:performance`

**Description**: Run performance analysis and lighthouse audit
**Command**:

```bash
echo "⚡ Performance Analysis" && pnpm build && echo "Build size analysis:" && du -sh client/dist/* && echo "Server startup time:" && time node server/dist/index.js --version
```

### `/project:security`

**Description**: Run security audit and dependency check
**Command**:

```bash
pnpm audit && echo "🔍 Checking for known vulnerabilities..." && pnpm audit --audit-level moderate
```

## Usage Tips

1. **Copy to clipboard**: Use these commands with `/` prefix in Claude Code
2. **Customize**: Modify commands in this file to match your workflow
3. **Chain commands**: Use `&&` to run multiple commands in sequence
4. **Error handling**: Use `|| true` to continue on non-critical errors
5. **Add new commands**: Follow the pattern above for consistency

## Command Naming Convention

- `/project:` prefix for all project-specific commands
- Use kebab-case for multi-word commands
- Keep names short but descriptive
- Group related commands with common prefixes (test-, db-, etc.)
