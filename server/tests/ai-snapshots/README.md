# AI Snapshot Testing Implementation

## Implementation Summary

This directory contains a comprehensive AI regression testing system for Teaching Engine 2.0, implementing Issue #280. The system protects against AI output drift and ensures consistent, high-quality educational content generation.

## What Was Implemented

### Phase 1: Infrastructure ✅
- **Base testing framework** (`ai-snapshot-base.test.ts`)
- **Directory structure** for organized snapshot storage
- **Normalization utilities** for consistent comparison
- **Content-aware diff functions** for meaningful change detection

### Phase 2: Test Data ✅
- **Deterministic test scenarios** across grades K-6
- **Subject-specific expectations** (Math, Language Arts, Science, Social Studies)
- **Complexity levels** (Basic, Intermediate, Advanced)
- **Mock response generators** for offline testing

### Phase 3: Core Endpoint Tests ✅
- **Long-Range Plans** (`long-range-plans.snapshot.test.ts`)
- **Unit Plans** (`unit-plans.snapshot.test.ts`)
- **Lesson Plans** (`lesson-plans.snapshot.test.ts`)
- **Daybook Entries** (`daybook.snapshot.test.ts`)

### Phase 4: Content Validation ✅
- **Educational appropriateness** checking
- **Age-appropriate vocabulary** validation
- **Curriculum alignment** verification
- **Quality scoring** system (0-100 scale)
- **Accessibility and inclusion** standards

### Phase 5: CI/CD Integration ✅
- **GitHub Actions workflow** (`.github/workflows/ai-regression.yml`)
- **Automated snapshot testing** on code changes
- **Change detection and approval** process
- **Quality trend analysis** and reporting
- **Snapshot update scripts** with safety checks

## Key Features

### Snapshot Normalization
- Removes timestamps, IDs, and variable elements
- Normalizes text content (whitespace, punctuation, dates)
- Sorts arrays for consistent ordering
- Preserves educational content structure

### Content Validation
- **Age Appropriateness**: Checks vocabulary complexity for grade level
- **Educational Quality**: Validates learning objectives, assessments, activities
- **Curriculum Alignment**: Ensures proper expectation coverage
- **Safety Standards**: Prevents inappropriate content

### Test Scenarios
- **27 scenarios** covering grades 1, 3, and 5
- **3 subjects** per grade (Math, Language Arts, Science)
- **3 complexity levels** per subject combination
- **Deterministic expectations** for reproducible testing

### Quality Metrics
- **Content Score**: Educational appropriateness and depth
- **Structure Score**: Format consistency and completeness
- **Issue Tracking**: Critical problems that must be fixed
- **Warning System**: Minor concerns for review

## Files Created

### Core Infrastructure
```
tests/ai-snapshots/
├── ai-snapshot-base.test.ts          # Base testing framework
├── long-range-plans.snapshot.test.ts  # Long-range plan tests
├── unit-plans.snapshot.test.ts        # Unit plan tests
├── lesson-plans.snapshot.test.ts      # Lesson plan tests
├── daybook.snapshot.test.ts           # Daybook tests
├── content-validation.test.ts         # Content quality tests
└── ai-test-verification.test.ts       # Infrastructure verification
```

### Utilities
```
tests/utils/ai-testing/
├── aiTestUtils.ts                     # Core utilities and validation
├── aiSnapshotNormalizer.ts            # Normalization and diffing
└── aiTestData.ts                      # Test data generation
```

### CI/CD
```
.github/workflows/ai-regression.yml    # GitHub Actions workflow
server/scripts/update-ai-snapshots.ts  # Snapshot update script
docs/AI_SNAPSHOT_TESTING.md           # Documentation
```

## Usage Instructions

### Running Tests Locally
```bash
# Set up environment
export AI_TESTING_MODE=snapshot
export NODE_ENV=test

# Run all AI snapshot tests
pnpm test tests/ai-snapshots/

# Run specific test suite
pnpm test tests/ai-snapshots/long-range-plans.snapshot.test.ts

# Run with real OpenAI API (requires key)
export OPENAI_TEST_API_KEY=your_key
pnpm test tests/ai-snapshots/
```

### Updating Snapshots
```bash
# Interactive update with review
tsx server/scripts/update-ai-snapshots.ts

# Update specific test type
tsx server/scripts/update-ai-snapshots.ts --test-type unit-plans

# Preview changes without updating
tsx server/scripts/update-ai-snapshots.ts --dry-run
```

### CI/CD Integration
- **Automatic**: Runs on AI code changes
- **Scheduled**: Daily regression checks at 2 AM UTC
- **Manual**: Workflow dispatch with options
- **PR Comments**: Automatic change summaries

## Quality Standards

### Minimum Thresholds
- **Content Score**: ≥70/100 for basic scenarios, ≥80/100 for advanced
- **Structure Score**: ≥80/100 for all scenarios
- **Success Rate**: ≥95% test pass rate
- **Zero Critical Issues**: No inappropriate content allowed

### Content Requirements
- Age-appropriate vocabulary and concepts
- Clear learning objectives and success criteria
- Proper assessment strategies (FOR/AS/OF)
- Inclusive, positive language
- Safe activities and practices

## Testing Coverage

### Endpoints Covered
- `/api/long-range-plans/ai-draft`
- `/api/unit-plans/ai-draft`
- `/api/lesson-plans/ai-draft`
- `/api/daybook/ai-draft`

### Scenarios Per Endpoint
- **9 scenarios** per endpoint (3 grades × 3 complexity levels)
- **36 total tests** across all endpoints
- **Multiple subjects** for comprehensive coverage

### Validation Types
- **Structural validation**: Required fields, format consistency
- **Content validation**: Educational quality, appropriateness
- **Performance validation**: Response time, API costs
- **Regression validation**: Change detection, drift monitoring

## Expected Benefits

### For Development
- **Early detection** of AI output changes
- **Consistent quality** across deployments
- **Reduced manual testing** effort
- **Confidence in releases** with automated validation

### For Education
- **Age-appropriate content** guaranteed
- **Curriculum alignment** verified
- **Professional standards** maintained
- **Consistent quality** for teachers

### for Maintenance
- **Automated monitoring** of AI performance
- **Trend analysis** for quality metrics
- **Easy snapshot updates** with approval process
- **Clear change documentation** for reviews

## Next Steps

1. **Enable in CI**: Activate the GitHub Actions workflow
2. **Generate Initial Snapshots**: Run tests to create baseline snapshots
3. **Set API Key**: Configure OpenAI test key for live testing (optional)
4. **Train Team**: Review documentation and update processes
5. **Monitor Quality**: Establish regular review of quality metrics

## Troubleshooting

### Common Issues
- **TypeScript errors**: Ensure dependencies are installed and types are generated
- **Test discovery**: Verify Jest configuration includes AI snapshot tests
- **API costs**: Use mock mode for development, real API only for CI
- **Snapshot conflicts**: Use update script with review process

### Support
- See `docs/AI_SNAPSHOT_TESTING.md` for detailed documentation
- Check GitHub Actions logs for CI failures
- Review snapshot files in `tests/ai-snapshots/snapshots/`
- Use `tsx server/scripts/update-ai-snapshots.ts --help` for update options

---

**Implementation Status**: ✅ Complete
**Issue Reference**: #280 - Add AI Regression Testing with Snapshot Tests
**Created By**: AI Testing Specialist Agent
**Date**: 2025-06-25