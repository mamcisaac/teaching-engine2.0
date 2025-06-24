# Troubleshooting Guide

Comprehensive troubleshooting guide for Teaching Engine 2.0 development issues.

## 🗃️ Database Issues

### Prisma Client Out of Sync
**Symptoms**: TypeScript errors about missing Prisma types, "PrismaClient is unable to connect"

**Solutions**:
```bash
# Regenerate Prisma client
pnpm --filter @teaching-engine/database db:generate

# If that fails, reset and regenerate
pnpm --filter @teaching-engine/database db:push --force-reset
pnpm --filter @teaching-engine/database db:generate
```

### Migration Failures
**Symptoms**: Migration fails to apply, database schema inconsistencies

**Solutions**:
```bash
# Check migration status
cd packages/database
npx prisma migrate status

# Reset migrations (DEVELOPMENT ONLY)
npx prisma migrate reset

# Manual migration repair
npx prisma db push --force-reset
npx prisma migrate dev
```

### Database Connection Issues
**Symptoms**: "Can't reach database server", connection timeout errors

**Solutions**:
1. Check `packages/database/.env` for correct `DATABASE_URL`
2. Ensure PostgreSQL is running (production) or SQLite file exists (development)
3. Verify network connectivity and firewall settings
4. Check if database user has proper permissions

```bash
# Test connection
cd packages/database
npx prisma db push --preview-feature
```

### Seed Data Issues
**Symptoms**: Seed script fails, constraint violations

**Solutions**:
```bash
# Reset and reseed
/project:db-reset

# Check for data conflicts in seed file
# Edit packages/database/prisma/seed.ts
# Ensure unique constraints are respected
```

## 🌐 Network and Port Issues

### Port Already in Use
**Symptoms**: "EADDRINUSE: address already in use :::3000"

**Solutions**:
```bash
# Kill processes on common ports
/project:dev-clean

# Manual port cleanup
lsof -ti:3000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:5555 | xargs kill -9  # Prisma Studio
```

### CORS Errors
**Symptoms**: "Access to fetch blocked by CORS policy"

**Solutions**:
1. Check server CORS configuration in `server/src/index.ts`
2. Ensure frontend is making requests to correct backend URL
3. Verify environment variables for API endpoints

```typescript
// Typical CORS setup
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
```

## 📦 Dependency Issues

### Package Installation Failures
**Symptoms**: `pnpm install` fails, dependency resolution errors

**Solutions**:
```bash
# Clear caches and reinstall
rm -rf node_modules */node_modules pnpm-lock.yaml
pnpm install

# If specific package fails
pnpm install package-name --force

# Check for conflicting peer dependencies
pnpm why package-name
```

### Version Conflicts
**Symptoms**: "Conflicting peer dependency", build failures after updates

**Solutions**:
```bash
# Check for outdated packages
pnpm outdated

# Update specific package
pnpm update package-name

# Resolve peer dependency conflicts
pnpm install --force
```

## 🔧 TypeScript Issues

### Type Errors After Database Changes
**Symptoms**: TypeScript complains about missing properties, incorrect types

**Solutions**:
```bash
# Regenerate Prisma client
pnpm --filter @teaching-engine/database db:generate

# Clear TypeScript cache
rm -rf */tsconfig.tsbuildinfo
pnpm typecheck
```

### Module Resolution Errors
**Symptoms**: "Cannot find module", path resolution failures

**Solutions**:
1. Check `tsconfig.json` path mappings
2. Verify imports use correct relative paths
3. Ensure barrel exports in `index.ts` files are correct

```bash
# Verify TypeScript configuration
pnpm typecheck --listFiles
```

## ⚡ Build and Runtime Issues

### Build Failures
**Symptoms**: `pnpm build` fails, compilation errors

**Solutions**:
```bash
# Check for type errors first
pnpm typecheck

# Clear build cache
rm -rf */dist */build
pnpm build

# Build specific workspace
pnpm --filter client build
pnpm --filter server build
```

### Runtime Errors
**Symptoms**: Application crashes, unhandled exceptions

**Solutions**:
1. Check logs for stack traces
2. Verify environment variables are set
3. Ensure all required services are running

```bash
# Check server logs
pnpm --filter server dev | tee server.log

# Verify environment
cat server/.env
cat client/.env
```

## 🧪 Test Issues

### Test Database Problems
**Symptoms**: Tests fail due to database issues, data contamination

**Solutions**:
```bash
# Use separate test database
export DATABASE_URL="file:./test.db"
/project:test

# Clear test data between runs
# Add to test setup: beforeEach(() => cleanDatabase())
```

### Flaky Tests
**Symptoms**: Tests pass/fail inconsistently, timing issues

**Solutions**:
1. Add proper `await` statements for async operations
2. Use test-specific timeouts for slow operations
3. Mock external dependencies properly
4. Ensure test isolation

```javascript
// Example test timeout
test('slow operation', async () => {
  // ... test code
}, 10000); // 10 second timeout
```

### Coverage Issues
**Symptoms**: Coverage reports missing files, incorrect percentages

**Solutions**:
```bash
# Generate fresh coverage report
rm -rf coverage
/project:test

# Check coverage configuration in package.json
# Ensure all source files are included
```

## 🔐 Authentication Issues

### JWT Token Problems
**Symptoms**: "Invalid token", authentication failures

**Solutions**:
1. Check JWT secret configuration
2. Verify token expiration settings
3. Ensure proper token storage/retrieval

```bash
# Check JWT configuration
grep -r "JWT" server/src/
```

### Session Issues
**Symptoms**: User logged out unexpectedly, session persistence problems

**Solutions**:
1. Check session storage configuration
2. Verify cookie settings (secure, httpOnly, etc.)
3. Ensure proper session cleanup

## 🎨 Frontend Issues

### Styling Problems
**Symptoms**: CSS not loading, Tailwind classes not working

**Solutions**:
```bash
# Rebuild Tailwind
cd client
npm run build:css

# Check for CSS conflicts
# Inspect element in browser dev tools
```

### State Management Issues
**Symptoms**: Component state not updating, stale data

**Solutions**:
1. Check React Query cache invalidation
2. Verify proper key dependencies in hooks
3. Ensure state updates are immutable

```typescript
// Proper state update
setUser(prevUser => ({ ...prevUser, name: newName }));
```

## 🚨 Emergency Recovery

### Complete Reset (Nuclear Option)
When everything is broken and you need a fresh start:

```bash
# 1. Backup any important local changes
git stash push -m "emergency backup"

# 2. Clean everything
rm -rf node_modules */node_modules pnpm-lock.yaml
rm -rf */dist */build coverage
rm -rf packages/database/prisma/dev.db*

# 3. Fresh install
pnpm install

# 4. Reset database
/project:db-reset

# 5. Verify everything works
/project:test
```

### Git Issues
**Symptoms**: Merge conflicts, corrupt repository

**Solutions**:
```bash
# Resolve merge conflicts
git mergetool

# Reset to last known good state
git reset --hard HEAD~1

# Emergency: reclone repository
cd ..
git clone https://github.com/your-repo/teaching-engine2.0.git teaching-engine2.0-fresh
```

## 📞 Getting Help

### Before Asking for Help
1. Check this troubleshooting guide
2. Search existing GitHub Issues
3. Check the project documentation in `docs/`
4. Try the nuclear reset option above

### When Reporting Issues
Include:
- Exact error message
- Steps to reproduce
- Environment details (Node version, OS, etc.)
- Recent changes made
- Relevant log files

### Useful Debugging Commands
```bash
# System information
node --version
pnpm --version
git status
git log --oneline -5

# Project health check
/project:build-check
/project:test
```