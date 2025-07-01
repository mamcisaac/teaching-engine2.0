# AI Services Test Execution Guide

## 🚀 Quick Start

This guide shows how to run the production-level AI service tests implemented in Phase 1.

## 📋 Prerequisites

### 1. Environment Setup

```bash
# Required: OpenAI API Key
export OPENAI_API_KEY="sk-your-actual-openai-api-key-here"

# Required: Test Database
export DATABASE_URL="file:./test.db"

# Required: Jest Test Type
export TEST_TYPE="integration"
```

### 2. Project Setup

```bash
# Install dependencies (if not already done)
pnpm install

# Generate Prisma client
pnpm --filter @teaching-engine/database db:generate

# Setup test database
pnpm --filter @teaching-engine/database db:push
```

## 🧪 Running Individual Test Suites

### AIPlanningAssistantService Tests

```bash
# Run AI Planning Assistant production tests
TEST_TYPE=integration pnpm test tests/integration/aiPlanningAssistant.production.test.ts

# Expected output:
# - Service health checks
# - Long-range goals generation
# - Unit big ideas creation
# - Lesson activities planning
# - Materials list generation
# - Assessment strategies
# - Reflection prompts
# - Error handling validation
```

### EmbeddingService Tests

```bash
# Run Embedding Service production tests
TEST_TYPE=integration pnpm test tests/integration/embeddingService.production.test.ts

# Expected output:
# - Real embedding generation
# - Vector similarity calculations
# - Batch processing efficiency
# - Database integration
# - Search functionality
# - Caching validation
```

### ClusteringService Tests

```bash
# Run Clustering Service production tests
TEST_TYPE=integration pnpm test tests/integration/clusteringService.production.test.ts

# Expected output:
# - Hierarchical clustering
# - AI theme generation
# - Cluster quality analysis
# - Performance optimization
# - Database persistence
```

## 🎯 Running All AI Production Tests

### Complete Test Suite

```bash
# Run all AI service production tests together
TEST_TYPE=integration pnpm test tests/integration/*.production.test.ts

# Alternative: Run with verbose output
TEST_TYPE=integration pnpm test tests/integration/*.production.test.ts --verbose

# Alternative: Run with coverage
TEST_TYPE=integration pnpm test:coverage tests/integration/*.production.test.ts
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Missing OpenAI API Key

```bash
Error: OPENAI_API_KEY environment variable required for production tests

# Solution:
export OPENAI_API_KEY="sk-your-key-here"
# Or add to your .env file:
echo "OPENAI_API_KEY=sk-your-key-here" >> .env
```

#### 2. Database Connection Issues

```bash
Error: PrismaClientInitializationError

# Solution:
pnpm --filter @teaching-engine/database db:generate
pnpm --filter @teaching-engine/database db:push
```

#### 3. Test Type Configuration

```bash
Error: No tests found

# Solution:
TEST_TYPE=integration pnpm test [test-file]
# Make sure TEST_TYPE is set to "integration"
```

#### 4. API Rate Limits

```bash
Error: Rate limit exceeded

# Solution:
# Tests include retry logic, but if persistent:
# - Use a higher-tier OpenAI API key
# - Run tests individually with delays
# - Check your OpenAI usage quota
```

## 📊 Expected Test Results

### Success Indicators

- ✅ All tests pass without errors
- ✅ Real API calls succeed with meaningful responses
- ✅ AI outputs meet quality validation criteria
- ✅ Database operations complete successfully
- ✅ Performance metrics within acceptable ranges

### Example Successful Output

```bash
PASS tests/integration/aiPlanningAssistant.production.test.ts (45.2s)
  AIPlanningAssistantService - Production Integration
    Service Health and Configuration
      ✓ should report healthy status with valid API key (2.1s)
      ✓ should make successful test API call (1.8s)
    Long-Range Goals Generation
      ✓ should generate appropriate long-range goals for Grade 3 Mathematics (5.2s)
      ✓ should adapt goals for different grades and subjects (8.1s)
    Unit Big Ideas Generation
      ✓ should generate conceptual big ideas for fraction unit (4.3s)
    [... more tests ...]

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        45.234 s
```

## ⚡ Performance Expectations

### Typical Test Duration

- **AIPlanningAssistant Tests**: 30-45 seconds (15 tests)
- **EmbeddingService Tests**: 45-60 seconds (12 tests)
- **ClusteringService Tests**: 60-120 seconds (10 tests)
- **Total Suite**: 2.5-3.5 minutes for all tests

### API Call Timing

- **GPT-4 Calls**: 2-8 seconds per request
- **Embedding Calls**: 1-3 seconds per request
- **Batch Operations**: 5-15 seconds for small batches

## 🔒 Security Notes

### API Key Management

```bash
# ✅ Good: Use environment variables
export OPENAI_API_KEY="sk-..."

# ✅ Good: Use .env files (gitignored)
echo "OPENAI_API_KEY=sk-..." >> .env

# ❌ Bad: Hard-code in source files
const apiKey = "sk-..."; // Never do this!
```

### Test Data Isolation

- Tests use dedicated test database
- All test data is cleaned up after execution
- No production data is used or affected

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run AI Service Tests
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    DATABASE_URL: 'file:./test.db'
    TEST_TYPE: 'integration'
  run: |
    pnpm install
    pnpm --filter @teaching-engine/database db:generate
    pnpm test tests/integration/*.production.test.ts
```

### Environment Variables Required

```bash
# For CI/CD systems, set these as secrets/environment variables:
OPENAI_API_KEY=sk-...        # OpenAI API key
DATABASE_URL=file:./test.db  # Test database URL
TEST_TYPE=integration        # Jest configuration
NODE_ENV=test               # Node environment
```

## 📈 Quality Metrics

### What the Tests Validate

- **AI Output Quality**: Educational appropriateness and accuracy
- **Response Consistency**: Similar inputs produce consistent outputs
- **Performance**: Response times within acceptable limits
- **Error Handling**: Graceful handling of API failures
- **Data Integration**: Proper database storage and retrieval
- **Real-World Scenarios**: Tests with actual curriculum data

### Quality Thresholds

- **Response Time**: < 10 seconds per AI call
- **Content Length**: 10-500 characters for suggestions
- **Similarity Scores**: > 0.7 for related content
- **Error Recovery**: < 3 retries for transient failures

## 📞 Support

### If Tests Fail

1. **Check Prerequisites**: Ensure all environment variables are set
2. **Verify API Access**: Test OpenAI API key manually
3. **Database Issues**: Reset test database if needed
4. **Network Problems**: Check internet connectivity
5. **Rate Limits**: Wait and retry, or use higher-tier API key

### Getting Help

- Review logs for specific error messages
- Check API key permissions and quota
- Verify network connectivity to OpenAI
- Ensure test database is accessible

## 🎯 Next Steps

### After Successful Test Execution

1. **Review Results**: Analyze AI output quality and performance
2. **Adjust Thresholds**: Fine-tune quality criteria if needed
3. **Integration**: Incorporate into CI/CD pipeline
4. **Monitoring**: Set up production monitoring based on test insights
5. **Phase 2**: Plan additional AI service testing coverage
