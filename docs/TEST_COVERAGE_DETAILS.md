# Detailed Test Coverage Report by File

**Generated**: 2025-07-03  
**Total Files Analyzed**: 85  
**Files with 0% Coverage**: 47 (55%)

## Files Requiring Immediate Attention (0% Coverage)

### AI Services - CRITICAL PRIORITY
| File | Lines | Why It's Critical |
|------|-------|-------------------|
| `aiService.ts` | 431 | Core AI orchestration, handles all AI requests |
| `aiAnalysisService.ts` | 296 | Analyzes curriculum and generates insights |
| `lessonGenerationService.ts` | 258 | Generates lesson plans - core feature |
| `openaiService.ts` | 332 | Direct OpenAI integration, cost center |
| `semanticChunkingService.ts` | 145 | Document processing for AI |
| `providers/baseProvider.ts` | 156 | Base class for all AI providers |
| `providers/openaiProvider.ts` | 247 | OpenAI implementation |
| `providers/anthropicProvider.ts` | 189 | Anthropic Claude integration |

### File Processing - HIGH PRIORITY
| File | Lines | Why It's Critical |
|------|-------|-------------------|
| `fileProcessingService.ts` | 312 | Handles all file uploads |
| `csvParser.ts` | 203 | Parses student data imports |
| `docxParser.ts` | 167 | Processes Word documents |
| `pdfParser.ts` | 234 | Extracts content from PDFs |
| `textExtractor.ts` | 298 | Core text extraction logic |
| `documentProcessor.ts` | 412 | Document analysis pipeline |

### Security & Privacy - CRITICAL PRIORITY
| File | Lines | Why It's Critical |
|------|-------|-------------------|
| `rateLimiter.ts` | 78 | Prevents API abuse |
| `privacy.ts` | 136 | Handles PII redaction |
| `contactValidation.ts` | 362 | Validates user input |
| `urlValidator.ts` | 225 | Prevents malicious URLs |

### Database Connectors - HIGH PRIORITY
| File | Lines | Why It's Critical |
|------|-------|-------------------|
| `baseConnector.ts` | 335 | Base database operations |
| `curriculumWebConnector.ts` | 458 | External curriculum data |
| `educationWebConnector.ts` | 490 | Education resource integration |
| `oerConnector.ts` | 297 | Open Educational Resources |
| `tptWebConnector.ts` | 369 | Teachers Pay Teachers integration |

### Core Services - HIGH PRIORITY
| File | Lines | Why It's Critical |
|------|-------|-------------------|
| `etfoIntegrationService.ts` | 930 | ETFO worksheet generation |
| `weeklyPlanExtractor.ts` | 497 | Weekly planning extraction |
| `webFetch.ts` | 142 | External data fetching |

## Files with Minimal Coverage (<10%)

### Business Logic Services
| File | Coverage | Lines Uncovered | Priority |
|------|----------|-----------------|----------|
| `curriculumService.ts` | 2.12% | 456/466 | HIGH |
| `workflowStateService.ts` | 7.40% | 350/378 | MEDIUM |
| `BaseService.ts` | 9.82% | 260/288 | HIGH |
| `lessonPlanService.ts` | 9.52% | 163/180 | HIGH |
| `studentService.ts` | 7.01% | 120/129 | MEDIUM |

### Utility Functions
| File | Coverage | Lines Uncovered | Priority |
|------|----------|-----------------|----------|
| `urlValidator.ts` | 1.85% | 220/224 | LOW |
| `routeFactory.ts` | 0% | 245/245 | MEDIUM |
| `schemaFactory.ts` | 0% | 159/159 | MEDIUM |

## Coverage Anti-Patterns Found

### 1. Entire Directories at 0%
- `src/services/ai/**/*` - No AI testing at all
- `src/services/fileParsing/**/*` - No file parsing tests
- `src/services/connectors/**/*` - No connector tests

### 2. Critical Paths Untested
- User authentication flow: 22% coverage
- File upload → AI processing → Lesson generation: 0% coverage
- Payment processing integration: 0% coverage

### 3. Error Handling Gaps
- No tests for error boundaries
- Exception handling untested in 90% of services
- No timeout or retry logic testing

## Test Debt by Component

### AI Services (0% Coverage)
**Files**: 15  
**Total Lines**: 3,421  
**Estimated Test Lines Needed**: ~6,800  
**Effort**: 2-3 weeks

### File Processing (0% Coverage)
**Files**: 8  
**Total Lines**: 1,812  
**Estimated Test Lines Needed**: ~3,600  
**Effort**: 1-2 weeks

### Database Layer (5% Coverage)
**Files**: 12  
**Total Lines**: 2,234  
**Estimated Test Lines Needed**: ~4,400  
**Effort**: 2 weeks

### Security/Auth (15% Coverage)
**Files**: 6  
**Total Lines**: 542  
**Estimated Test Lines Needed**: ~1,000  
**Effort**: 1 week

## Specific Test Cases Needed

### For AI Services
1. **Prompt Generation**
   - Template variable substitution
   - Context window management
   - Token counting accuracy
   - Prompt injection prevention

2. **Response Handling**
   - JSON parsing validation
   - Error response handling
   - Timeout scenarios
   - Rate limit handling

3. **Cost Management**
   - Token usage tracking
   - Cost calculation accuracy
   - Budget limit enforcement

### For File Processing
1. **Format Support**
   - Valid file parsing
   - Corrupted file handling
   - Large file processing
   - Memory management

2. **Content Extraction**
   - Text accuracy
   - Metadata extraction
   - Encoding detection
   - Language detection

### For Authentication
1. **Token Management**
   - JWT generation/validation
   - Refresh token flow
   - Token expiration
   - Blacklist handling

2. **Permission Checking**
   - Role-based access
   - Resource ownership
   - API key validation
   - Rate limiting per user

## Quick Wins (Can improve coverage by 10%+ quickly)

1. **Add Basic CRUD Tests** (5% improvement)
   - All repositories need basic CRUD coverage
   - Use shared test utilities
   - ~2 days effort

2. **Controller Input Validation** (3% improvement)
   - Test invalid inputs
   - Test missing required fields
   - ~1 day effort

3. **Utility Function Tests** (2% improvement)
   - Pure functions are easy to test
   - High value, low effort
   - ~1 day effort

## Testing Infrastructure Needed

### 1. Mock Factories
```typescript
// Need factories for:
- User objects with various roles
- Lesson plans with different states
- AI responses for different scenarios
- File upload data
- Curriculum objects
```

### 2. Test Data Builders
```typescript
// Builders needed for:
- Complex lesson plan hierarchies
- Student progress data
- Assessment results
- Weekly planning data
```

### 3. Integration Test Helpers
```typescript
// Helpers for:
- Database transaction rollback
- API request authentication
- File upload simulation
- AI service mocking
```

## Monthly Coverage Goals

### Month 1 Target: 70% Coverage
- Complete auth/security tests
- Basic CRUD for all services
- Controller validation tests

### Month 2 Target: 80% Coverage
- AI service infrastructure
- File processing tests
- Integration test suite

### Month 3 Target: 90% Coverage
- Complex business logic
- Edge case coverage
- Performance tests

## Conclusion

With 47 files having 0% coverage and critical services like AI and authentication severely under-tested, the codebase faces significant quality risks. The detailed analysis shows:

1. **3,421 lines** of AI code with zero tests
2. **1,812 lines** of file processing code untested
3. **Critical security code** at 15% coverage

Addressing these gaps requires:
- **8-10 weeks** of focused effort
- **~15,000 lines** of test code
- **Significant refactoring** for testability

The investment is justified by the risk reduction and improved developer velocity.