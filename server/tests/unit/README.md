# Unit Tests for Discovery Services and Related Components

This directory contains comprehensive unit tests for the discovery, notification, embedding services, and connectors that Agent 12 was tasked to create.

## Test Files Created

### 1. `/tests/unit/discoveryServices.test.ts`
**Purpose**: Tests for curriculum and activity discovery services

**Coverage:**
- `CurriculumDiscoveryService`
  - Document discovery from government sources
  - URL validation and secure fetching
  - Document download and processing
  - Document verification and availability checking
  - Filtering and statistics
  - Error handling for network failures and malformed data
  - Caching behavior
  - Data transformation (grade parsing, subject normalization, etc.)

- `ActivityDiscoveryService`
  - Multi-connector search functionality
  - Activity import and rating
  - Collection management
  - Recommendation engine
  - Caching and performance optimization
  - Error handling for connector failures
  - Pagination and filtering

**Key Test Categories:**
- External API mocking with proper error scenarios
- Data transformation and validation
- Caching behavior verification
- Concurrent operation handling
- Security validation (URL checking, file size limits)

### 2. `/tests/unit/notificationService.test.ts`
**Purpose**: Tests for notification service functionality

**Coverage:**
- Notification sending (in-app, email, push)
- Template-based notifications with variable substitution
- User preference management
- Quiet hours functionality
- Bulk notification sending
- Notification lifecycle (mark as read, delete)
- Email formatting and styling
- Cleanup of expired notifications
- Error handling for email service failures

**Key Test Categories:**
- Multi-channel notification delivery
- Template processing and variable replacement
- Time-based logic (quiet hours, expiration)
- Bulk operation concurrency control
- Database error resilience
- Performance testing with large notification volumes

### 3. `/tests/unit/embeddingService.test.ts`
**Purpose**: Tests for AI embedding generation and similarity

**Coverage:**
- OpenAI API integration with retry logic
- Batch embedding generation with rate limiting
- Similarity calculation (cosine similarity)
- Expectation search and clustering
- Cache management for embeddings
- Error handling for API failures
- Performance optimization for large datasets

**Key Test Categories:**
- External AI service mocking
- Mathematical accuracy (similarity calculations)
- Batch processing efficiency
- Rate limiting and exponential backoff
- Database integration for embedding storage
- Memory management for large datasets

### 4. `/tests/unit/connectors.test.ts`
**Purpose**: Tests for external data source connectors

**Coverage:**
- `BaseConnector` utilities:
  - Data transformation helpers
  - Network request handling with timeout/retry
  - Grade range parsing
  - Subject normalization
  - Activity type inference
  - Material extraction from text
  - Duration parsing (ISO 8601, text formats)

- Individual connector implementations:
  - `OERConnector` for OER Commons
  - `CurriculumWebConnector` for government curriculum sites
  - `EducationWebConnector` for educational platforms

**Key Test Categories:**
- Real-world data format handling
- Network resilience (timeouts, retries, rate limiting)
- Text processing and pattern matching
- Error boundary testing
- Performance considerations for large datasets

## Test Implementation Highlights

### External API Mocking Strategy
All tests properly mock external dependencies:
- OpenAI API calls with realistic response formats
- HTTP requests with various error scenarios
- Database operations with Prisma mocks
- Email service integration

### Error Handling Patterns
Comprehensive error handling tests for:
- Network failures and timeouts
- API rate limiting and quota exhaustion
- Database connectivity issues
- Malformed data from external sources
- Security validation failures

### Performance Testing
Tests include performance considerations:
- Large dataset processing
- Concurrent operation handling
- Memory usage patterns
- Response time expectations
- Batch processing efficiency

### Security Testing
Security-focused test scenarios:
- URL validation for external requests
- File size limits for downloads
- Input sanitization
- Rate limiting compliance
- Error information disclosure prevention

## Running the Tests

```bash
# Run all discovery service tests
npm test -- --testPathPattern="tests/unit/discoveryServices.test.ts"

# Run notification service tests
npm test -- --testPathPattern="tests/unit/notificationService.test.ts"

# Run embedding service tests
npm test -- --testPathPattern="tests/unit/embeddingService.test.ts"

# Run connector tests
npm test -- --testPathPattern="tests/unit/connectors.test.ts"

# Run all unit tests
npm test -- --testPathPattern="tests/unit/"
```

## Test Coverage Goals

Each test file aims for:
- **90%+ code coverage** for critical business logic
- **Comprehensive error scenarios** covering all major failure modes
- **Performance benchmarks** for time-sensitive operations
- **Integration points** properly mocked and tested
- **Edge case handling** for malformed or unexpected data

## Mocking Strategy

### Service Dependencies
- **EmailService**: Mocked to test notification delivery without actual emails
- **Prisma Database**: Mocked with realistic data structures and error scenarios
- **OpenAI API**: Mocked with embedding generation responses and rate limiting
- **External HTTP APIs**: Mocked with various response formats and error conditions

### Time and Randomness
- **Date/Time**: Controlled for consistent testing of time-based features
- **Random Generation**: Seeded for predictable test outcomes
- **Network Delays**: Simulated for timeout and retry testing

## Integration with CI/CD

These tests are designed to:
- Run efficiently in CI environments
- Provide clear failure messages for debugging
- Generate coverage reports for quality metrics
- Support parallel execution where possible
- Clean up resources properly after execution

## Future Enhancements

Potential improvements for the test suite:
- **Contract testing** for external API compatibility
- **Load testing** for high-volume scenarios
- **Chaos engineering** for resilience validation
- **Visual regression testing** for email templates
- **Accessibility testing** for user interfaces

## Contributing

When adding new tests:
1. Follow the established mocking patterns
2. Include both success and failure scenarios
3. Test edge cases and boundary conditions
4. Maintain performance benchmarks
5. Update this documentation for significant changes

---

These unit tests provide comprehensive coverage for the discovery services ecosystem, ensuring reliability, performance, and maintainability of the Teaching Engine 2.0 platform.