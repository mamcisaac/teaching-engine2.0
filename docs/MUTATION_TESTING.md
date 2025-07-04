# Mutation Testing for Teaching Engine 2.0

## Overview

Mutation testing is a sophisticated testing technique that evaluates the quality of your test suite by introducing small changes (mutations) to your code and checking if your tests can detect these changes. This helps identify gaps in test coverage and ensures your tests are effective at catching real bugs.

## What is Mutation Testing?

Mutation testing works by:
1. **Creating Mutants**: Small changes are made to your source code (e.g., changing `>` to `>=`, `true` to `false`)
2. **Running Tests**: Your test suite runs against each mutant
3. **Scoring**: Mutants that cause tests to fail are "killed" (good), those that don't are "survivors" (bad)
4. **Reporting**: A mutation score is calculated: `(killed mutants / total mutants) * 100`

## Setup

### Packages Installed

**Server (Jest)**:
- `@stryker-mutator/core` - Core mutation testing framework
- `@stryker-mutator/javascript-mutator` - JavaScript/TypeScript mutation operators
- `@stryker-mutator/jest-runner` - Jest test runner integration
- `@stryker-mutator/typescript-checker` - TypeScript type checking
- `@stryker-mutator/html-reporter` - HTML report generation

**Client (Vitest)**:
- `@stryker-mutator/core` - Core mutation testing framework
- `@stryker-mutator/javascript-mutator` - JavaScript/TypeScript mutation operators
- `@stryker-mutator/vitest-runner` - Vitest test runner integration
- `@stryker-mutator/typescript-checker` - TypeScript type checking
- `@stryker-mutator/html-reporter` - HTML report generation

## Configuration Files

### Server Configuration

- **`stryker.conf.mjs`** - Full mutation testing configuration
- **`stryker.core.conf.mjs`** - Core business logic only (faster)

### Client Configuration

- **`stryker.conf.mjs`** - Full mutation testing configuration  
- **`stryker.core.conf.mjs`** - Core business logic only (faster)

## Mutation Score Thresholds

### Server Thresholds
- **High**: ≥85% - Excellent test quality
- **Low**: ≥70% - Acceptable test quality
- **Break**: <60% - Unacceptable, blocks CI

### Client Thresholds
- **High**: ≥80% - Excellent test quality
- **Low**: ≥65% - Acceptable test quality
- **Break**: <50% - Unacceptable, blocks CI

## Available Scripts

### Root Level Commands
```bash
# Run mutation testing on both server and client
pnpm test:mutation

# Run on specific target
pnpm test:mutation:server
pnpm test:mutation:client

# Run core business logic only (faster)
pnpm test:mutation:core

# CI mode with reduced output
pnpm test:mutation:ci

# Run server and client in parallel
pnpm test:mutation:parallel

# Generate detailed HTML reports
pnpm test:mutation:report
```

### Server-Specific Commands
```bash
cd server

# Full mutation testing
pnpm test:mutation

# Core business logic only
pnpm test:mutation:core

# Specific module testing
pnpm test:mutation:services
pnpm test:mutation:utils
pnpm test:mutation:middleware
pnpm test:mutation:routes

# CI-optimized run
pnpm test:mutation:ci
```

### Client-Specific Commands
```bash
cd client

# Full mutation testing
pnpm test:mutation

# Specific module testing
pnpm test:mutation:components
pnpm test:mutation:hooks
pnpm test:mutation:utils
pnpm test:mutation:services
pnpm test:mutation:stores
pnpm test:mutation:api

# CI-optimized run
pnpm test:mutation:ci
```

## Advanced Mutation Test Runner

The project includes a comprehensive mutation test runner (`scripts/mutation-test-runner.js`) with features:

### Features
- **Intelligent Targeting**: Run tests on server, client, or both
- **Scope Control**: Full testing vs core business logic only
- **Parallel Execution**: Run server and client tests simultaneously
- **Comprehensive Reporting**: JSON and HTML reports with detailed statistics
- **Threshold Enforcement**: Configurable quality gates
- **CI Integration**: Optimized for continuous integration environments

### Usage Examples
```bash
# Basic usage
node scripts/mutation-test-runner.js

# Target specific component
node scripts/mutation-test-runner.js --target server --scope core

# CI mode with custom threshold
node scripts/mutation-test-runner.js --ci --threshold 75

# Parallel execution with custom reporters
node scripts/mutation-test-runner.js --parallel --reporters "html,clear-text"

# Help
node scripts/mutation-test-runner.js --help
```

## CI/CD Integration

### GitHub Actions Workflow

The mutation testing workflow (`.github/workflows/mutation-testing.yml`) includes:

#### Triggers
- **Manual**: Workflow dispatch with configurable options
- **Scheduled**: Weekly runs on Sundays at 2 AM UTC
- **Pull Requests**: When labeled with `mutation-test` or `core-changes`
- **Path-based**: Changes to critical business logic files

#### Jobs
1. **Validate**: Quick test validation before mutation testing
2. **Server Mutation Testing**: Comprehensive server-side mutation testing
3. **Client Mutation Testing**: Comprehensive client-side mutation testing
4. **Report Generation**: Consolidate results and generate reports
5. **Quality Gate**: Enforce mutation score thresholds

#### Workflow Options
- **Target**: Choose server, client, or both
- **Scope**: Full testing or core business logic only
- **Threshold**: Override default mutation score thresholds

### CI Optimization

For pull requests:
- Automatically uses `core` scope for faster execution
- Non-blocking quality gate (warning only)
- Targeted testing based on changed files

For scheduled runs:
- Full scope testing
- Strict quality gate enforcement
- Comprehensive reporting

## Core Business Logic Focus

### Server Core Modules
- `src/services/base/BaseService.ts`
- `src/services/curriculum/CurriculumImportOrchestrator.ts`
- `src/services/curriculum/validators/CurriculumValidator.ts`
- `src/services/curriculum/transformers/CurriculumTransformer.ts`
- `src/services/templates/TemplateOrchestrator.ts`
- `src/utils/validation.ts`
- `src/middleware/auth/strategies.ts`
- Critical route handlers and utilities

### Client Core Modules
- `src/hooks/useETFOPlanning.ts`
- `src/hooks/useAutoSave.tsx`
- `src/services/authService.ts`
- `src/services/lessonPlanService.ts`
- `src/stores/lessonPlanStore.ts`
- `src/utils/formValidation.ts`
- Core planning and form components

## Mutation Operators

### Included Mutations
- **Arithmetic Operators**: `+` ↔ `-`, `*` ↔ `/`
- **Logical Operators**: `&&` ↔ `||`, `!` removal
- **Comparison Operators**: `>` ↔ `>=`, `==` ↔ `!=`
- **Boolean Literals**: `true` ↔ `false`
- **Assignment Operators**: `+=` ↔ `-=`
- **Unary Operators**: `++` ↔ `--`
- **Method Expressions**: Function call modifications

### Excluded Mutations
- **String Literals**: Avoid breaking error messages and UI text
- **Object Literals**: Preserve configuration and props
- **Array Declarations**: Maintain data structure integrity

## Interpreting Results

### Mutation Score Guidelines
- **90%+**: Excellent - Comprehensive test coverage
- **80-89%**: Good - Strong test quality with minor gaps
- **70-79%**: Acceptable - Adequate testing, room for improvement
- **60-69%**: Poor - Significant testing gaps
- **<60%**: Unacceptable - Major test quality issues

### Common Mutation Survivors
1. **Logging Code**: Consider if logging needs testing
2. **Error Messages**: May not affect functionality
3. **Edge Cases**: Often reveals missing test cases
4. **Complex Conditions**: May indicate overly complex logic

### Improving Mutation Scores

#### Add Edge Case Tests
```javascript
// Before: Basic test
expect(validateEmail('test@example.com')).toBe(true);

// After: Edge case tests
expect(validateEmail('test@example.com')).toBe(true);
expect(validateEmail('')).toBe(false);
expect(validateEmail('invalid')).toBe(false);
expect(validateEmail(null)).toBe(false);
```

#### Test Error Conditions
```javascript
// Test both success and failure paths
it('should handle validation errors', () => {
  expect(() => validateRequired('')).toThrow('Field is required');
  expect(() => validateRequired('value')).not.toThrow();
});
```

#### Improve Assertions
```javascript
// Before: Weak assertion
expect(result).toBeTruthy();

// After: Specific assertion
expect(result.status).toBe('success');
expect(result.data).toHaveLength(3);
```

## Reports and Artifacts

### Generated Reports
- **HTML Report**: Interactive report with detailed mutation information
- **JSON Summary**: Machine-readable results for automation
- **Console Output**: Real-time progress and summary

### Report Locations
- Server: `server/reports/mutation/`
- Client: `client/reports/mutation/`
- Combined: `reports/mutation/`

### CI Artifacts
- Mutation reports are uploaded as GitHub Actions artifacts
- Available for 30 days after workflow completion
- Downloadable from the Actions tab

## Best Practices

### When to Run Mutation Tests
1. **Before Major Releases**: Ensure test quality
2. **After Refactoring**: Verify tests still catch bugs
3. **Weekly Scheduled**: Maintain ongoing quality
4. **Core Logic Changes**: Focus on business-critical code

### Performance Considerations
- Use `core` scope for faster feedback during development
- Run full scope weekly or before releases
- Consider parallel execution for comprehensive testing
- Monitor execution time and adjust timeouts as needed

### Integration with Development Workflow
1. **Pull Request Labels**: Add `mutation-test` label for comprehensive testing
2. **Core Changes**: Automatic testing for business logic modifications
3. **Manual Triggers**: On-demand testing with custom parameters
4. **Quality Gates**: Enforce standards without blocking development

## Troubleshooting

### Common Issues

#### High Memory Usage
```bash
# Reduce concurrent test runners
pnpm test:mutation:quick
```

#### Timeouts
```bash
# Increase timeout for complex mutations
stryker run --timeoutMS 120000
```

#### False Positives
- Review mutants that should survive (logging, error messages)
- Adjust excluded mutations in configuration
- Consider if the code actually needs testing

#### Low Mutation Scores
1. Analyze survived mutants in HTML report
2. Add missing test cases
3. Improve test assertions
4. Consider refactoring overly complex code

### Getting Help
- Check the HTML reports for detailed mutation information
- Review survived mutants to understand testing gaps
- Use the mutation test runner's debug output
- Consult Stryker documentation for advanced configuration

## Future Enhancements

### Planned Features
- **Incremental Mutation Testing**: Only test changed code
- **Baseline Comparison**: Track mutation score trends
- **Custom Mutation Operators**: Domain-specific mutations
- **Integration Testing**: Mutation testing for integration tests
- **Performance Optimization**: Faster execution strategies

### Contributing
- Report issues with mutation testing setup
- Suggest improvements to thresholds and configuration
- Contribute additional mutation operators
- Help improve documentation and best practices

---

*This mutation testing setup helps ensure the Teaching Engine 2.0 codebase maintains high-quality tests that effectively catch bugs and regressions.*