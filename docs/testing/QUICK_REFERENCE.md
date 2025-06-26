# Testing Quick Reference

## 🚀 Essential Commands (Top 10)

```bash
# 1. Run all tests (most common)
pnpm test:all

# 2. Run unit tests only
pnpm test:unit

# 3. Run tests in watch mode
pnpm test:watch

# 4. Run with coverage
pnpm test:coverage

# 5. Debug test issues
pnpm test:debug

# 6. Validate environment
pnpm test:validate

# 7. Setup test environment
pnpm test:setup

# 8. Run E2E tests
pnpm test:e2e

# 9. Run ETFO tests
pnpm test:etfo

# 10. Run integration tests
pnpm test:integration
```

## 🎯 Command Categories

### Development Workflow
- `pnpm test:unit` - Quick unit tests
- `pnpm test:watch` - Watch mode for TDD
- `pnpm test:coverage` - Coverage reports

### Debugging & Setup
- `pnpm test:debug` - Verbose output with tips
- `pnpm test:validate` - Check environment
- `pnpm test:setup` - Initialize test environment

### Full Testing
- `pnpm test:all` - Complete test suite
- `pnpm test:integration` - API integration tests
- `pnpm test:e2e` - End-to-end testing

### Feature-Specific
- `pnpm test:etfo` - ETFO lesson planning
- `pnpm test:analytics` - Analytics features

## ⚡ Quick Start

```bash
# First time setup
pnpm test:setup

# Daily development
pnpm test:watch --server  # For backend work
pnpm test:watch --client  # For frontend work

# Before commit
pnpm test:all
```

## 🔧 Debugging Workflow

```bash
# 1. Check environment
pnpm test:validate

# 2. Fix issues
pnpm test:validate --fix

# 3. Debug specific tests
pnpm test:debug --server

# 4. Use VS Code debugger
# Press F5 and select debug configuration
```

## 📊 Advanced Usage

```bash
# Test isolation
pnpm test:isolate setup my-test-id

# Flaky test detection
pnpm test:flaky

# Performance analysis
TEST_PERFORMANCE=true pnpm test
```