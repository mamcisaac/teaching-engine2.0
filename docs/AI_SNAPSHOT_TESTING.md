# AI Snapshot Testing Documentation

This document describes the comprehensive AI snapshot testing system implemented for Teaching Engine 2.0, designed to protect against AI output drift and regressions.

## Overview

The AI snapshot testing system captures and validates AI-generated educational content to ensure consistency, quality, and appropriateness across deployments. It provides automated regression detection and content validation for all AI-powered endpoints.

## Architecture

### Core Components

1. **Snapshot Infrastructure** (`tests/ai-snapshots/`)
   - Base testing framework with consistent setup/teardown
   - Content normalization and diff utilities
   - Validation and quality scoring systems

2. **Test Data Generation** (`tests/utils/ai-testing/`)
   - Deterministic test scenarios across grades K-6
   - Subject-specific test data (Math, Language Arts, Science, Social Studies)
   - Mock response generators for offline testing

3. **Content Validation** (`tests/ai-snapshots/content-validation.test.ts`)
   - Educational appropriateness checking
   - Age-appropriate vocabulary validation
   - Curriculum alignment verification
   - Accessibility and inclusion standards

4. **CI/CD Integration** (`.github/workflows/ai-regression.yml`)
   - Automated snapshot testing on code changes
   - Change detection and approval workflows
   - Quality trend analysis and reporting

## Test Coverage

### Supported Endpoints

- **Long-Range Plans** (`/api/long-range-plans/ai-draft`)
- **Unit Plans** (`/api/unit-plans/ai-draft`)
- **Lesson Plans** (`/api/lesson-plans/ai-draft`)
- **Daybook Entries** (`/api/daybook/ai-draft`)

### Test Scenarios

Each endpoint is tested with scenarios covering:

- **Grades**: K-6 (with grade-specific expectations)
- **Subjects**: Mathematics, Language Arts, Science, Social Studies
- **Complexity Levels**: Basic, Intermediate, Advanced
- **Special Cases**: Accommodations, cross-curricular links, assessments

## Usage

### Running Tests Locally

```bash
# Run all AI snapshot tests
pnpm test tests/ai-snapshots/

# Run specific test suite
pnpm test tests/ai-snapshots/long-range-plans.snapshot.test.ts

# Run with real OpenAI API (requires API key)
OPENAI_TEST_API_KEY=your_key pnpm test tests/ai-snapshots/

# Generate coverage report
pnpm test:coverage tests/ai-snapshots/
```

### Environment Variables

```bash
AI_TESTING_MODE=snapshot     # Enable snapshot testing mode
AI_TESTING_CACHE=true       # Cache responses to reduce API costs
OPENAI_TEST_API_KEY=key      # Use real OpenAI API (optional)
NODE_ENV=test               # Ensure test environment
```

### Updating Snapshots

When AI outputs change and you need to update snapshots:

```bash
# Interactive update with review
tsx server/scripts/update-ai-snapshots.ts

# Update specific test type
tsx server/scripts/update-ai-snapshots.ts --test-type long-range-plans

# Dry run to preview changes
tsx server/scripts/update-ai-snapshots.ts --dry-run

# Force update without review (CI)
tsx server/scripts/update-ai-snapshots.ts --force --no-review
```

## Snapshot Structure

### Snapshot File Format

```json
{
  "metadata": {
    "testType": "long-range-plan",
    "scenario": "grade-1-math-basic",
    "normalizedAt": "[NORMALIZED_TIMESTAMP]",
    "version": "1.0.0"
  },
  "input": {
    "subject": "Mathematics",
    "grade": 1,
    "academicYear": "2024-2025",
    "expectations": [...]
  },
  "response": {
    "units": [...]
  },
  "validation": {
    "isValid": true,
    "contentScore": 85,
    "structureScore": 90,
    "issues": [],
    "warnings": []
  }
}
```

### Directory Structure

```
tests/ai-snapshots/
├── snapshots/
│   ├── long-range-plans/
│   │   ├── grade-1-math-basic.snapshot.json
│   │   ├── grade-1-math-intermediate.snapshot.json
│   │   └── ...
│   ├── unit-plans/
│   ├── lesson-plans/
│   ├── daybook/
│   └── validation-reports/
├── ai-snapshot-base.test.ts
├── long-range-plans.snapshot.test.ts
├── unit-plans.snapshot.test.ts
├── lesson-plans.snapshot.test.ts
├── daybook.snapshot.test.ts
└── content-validation.test.ts
```

## Content Validation

### Quality Metrics

1. **Content Score** (0-100)
   - Educational appropriateness
   - Age-appropriate vocabulary
   - Curriculum alignment
   - Substantive content depth

2. **Structure Score** (0-100)
   - Required field presence
   - Format consistency
   - Logical organization
   - Complete information

### Validation Rules

#### Educational Appropriateness
- No violent, sexual, or inappropriate content
- Age-appropriate vocabulary and concepts
- Positive, inclusive language
- Safe practices and activities

#### Curriculum Alignment
- Clear learning objectives
- Proper assessment strategies
- Grade-level expectations
- Subject-specific terminology

#### Quality Standards
- Minimum content length requirements
- Non-repetitive, varied content
- Clear, actionable language
- Professional teaching standards

## CI/CD Integration

### Automated Testing

The GitHub Actions workflow runs on:
- Push to main/develop branches
- Pull requests affecting AI code
- Daily scheduled runs (2 AM UTC)
- Manual workflow dispatch

### Change Detection

When snapshots change:
1. **Pull Requests**: Comment with change summary and require review
2. **Main Branch**: Fail the build to prevent drift
3. **Scheduled Runs**: Create issue for investigation

### Quality Monitoring

Continuous monitoring includes:
- Success rate tracking
- Quality score trends
- Performance benchmarks
- Content appropriateness alerts

## Best Practices

### For Developers

1. **Before Code Changes**
   - Run snapshot tests locally
   - Review any changes carefully
   - Understand why outputs changed

2. **After AI Updates**
   - Regenerate snapshots with review
   - Validate content quality
   - Update documentation if needed

3. **Reviewing Changes**
   - Check educational appropriateness
   - Verify curriculum alignment
   - Ensure age-appropriate content
   - Validate structural completeness

### For Content Review

1. **Snapshot Updates**
   - Always review changes before approval
   - Check multiple scenarios for consistency
   - Validate against educational standards
   - Test with real classroom contexts

2. **Quality Assurance**
   - Monitor quality score trends
   - Investigate unexpected changes
   - Maintain content standards
   - Update validation rules as needed

## Troubleshooting

### Common Issues

1. **Tests Failing Locally**
   ```bash
   # Check environment setup
   pnpm test:validate
   
   # Ensure database is running
   pnpm --filter @teaching-engine/database db:push
   
   # Clear test cache
   rm -rf tests/ai-snapshots/snapshots/validation-reports/
   ```

2. **Snapshot Changes Not Detected**
   ```bash
   # Force regeneration
   rm -rf tests/ai-snapshots/snapshots/
   pnpm test tests/ai-snapshots/
   ```

3. **Quality Validation Failures**
   ```bash
   # Check validation logs
   cat tests/ai-snapshots/snapshots/validation-reports/*-results.json
   
   # Review content manually
   tsx server/scripts/update-ai-snapshots.ts --dry-run
   ```

### Performance Issues

1. **Slow Test Execution**
   - Use mock mode instead of real API
   - Enable response caching
   - Run specific test suites only

2. **API Cost Management**
   - Set `AI_TESTING_CACHE=true`
   - Use mock responses for development
   - Limit real API tests to CI only

## Configuration

### Test Scenarios

Add new test scenarios in `tests/utils/ai-testing/aiTestData.ts`:

```typescript
// Add new subject
'grade-4-arts': [
  {
    id: 'test-arts4-overall-1',
    code: 'A4.CR.A1',
    description: 'create artistic works expressing personal ideas',
    strand: 'Creating and Presenting',
    grade: 4,
    subject: 'Arts',
    type: 'overall',
    keywords: ['creativity', 'expression', 'artistic'],
  }
]
```

### Validation Rules

Customize validation in `tests/utils/ai-testing/aiTestUtils.ts`:

```typescript
// Add new inappropriate content patterns
private static readonly AGE_INAPPROPRIATE_PATTERNS = [
  /\b(new_pattern|another_pattern)\b/gi,
  // ... existing patterns
];

// Add new required elements
private static readonly REQUIRED_EDUCATIONAL_ELEMENTS = {
  newContentType: ['required', 'fields', 'here'],
  // ... existing elements
};
```

## Reporting and Analytics

### Test Reports

Generated reports include:
- Test execution summary
- Quality score trends
- Content validation results
- Performance metrics

### Quality Dashboard

Access quality metrics through:
- CI/CD workflow artifacts
- Local test reports in `tests/ai-snapshots/snapshots/`
- Summary reports at `ai-snapshot-summary.json`

## Contributing

### Adding New Tests

1. Create test scenario in `aiTestData.ts`
2. Add mock response in `AITestMockResponses`
3. Create snapshot test file
4. Update validation rules if needed
5. Run tests and commit snapshots

### Updating Validation

1. Modify validation rules in `aiTestUtils.ts`
2. Test with existing snapshots
3. Update documentation
4. Consider backward compatibility

---

For more information, see:
- [Testing Documentation](../docs/TESTING.md)
- [AI Services Documentation](../docs/AI_SERVICES.md)
- [Contributing Guidelines](../CONTRIBUTING.md)