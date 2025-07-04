# Pact Contract Testing Guide

## Overview

This guide explains how to use Pact contract testing in the Teaching Engine 2.0 project. Pact ensures that the frontend (consumer) and backend (provider) maintain compatible API contracts.

## Quick Start

### Running Contract Tests

```bash
# Install dependencies
pnpm install

# Run consumer tests (client-side)
cd client
pnpm test:pact

# Run provider tests (server-side)
cd ../server
pnpm test:pact:verify

# Run all contract tests
pnpm test:contract
```

### Local Pact Broker Setup

```bash
# Start local Pact Broker
docker-compose -f docker-compose.pact.yml up -d

# Access Pact Broker UI
open http://localhost:9292
# Default credentials: admin/admin
```

## Architecture

### Consumer Tests (Client)

Consumer tests define the expected API contracts from the client's perspective:

```
client/src/__tests__/pact/
├── setup.ts                     # Pact configuration
├── etfo-lesson-plans.pact.test.ts  # ETFO lesson plan contracts
├── unit-plans.pact.test.ts        # Unit plan contracts
└── daybook-entries.pact.test.ts   # Daybook entry contracts
```

### Provider Tests (Server)

Provider tests verify that the server implements the contracts correctly:

```
server/src/__tests__/pact/
├── pact-config.ts                      # Provider configuration
└── etfo-lesson-plans.pact-verify.test.ts  # Contract verification
```

## Writing Consumer Tests

### 1. Basic Structure

```typescript
import { PactV3, MatchersV3 } from '@pact-foundation/pact';

const provider = new PactV3({
  consumer: 'TeachingEngineClient',
  provider: 'TeachingEngineServer',
  // ... configuration
});

describe('API Contract Tests', () => {
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());
  afterEach(() => provider.verify());

  it('should handle API request', async () => {
    await provider
      .uponReceiving('a request description')
      .withRequest({
        method: 'GET',
        path: '/api/endpoint',
        headers: { Authorization: 'Bearer test-token' },
      })
      .willRespondWith({
        status: 200,
        body: { /* response */ },
      });

    // Make actual request and verify
  });
});
```

### 2. Using Matchers

Pact provides flexible matchers for dynamic content:

```typescript
const { like, eachLike, datetime, string, integer, boolean, regex } = MatchersV3;

const response = {
  id: string('cuid123'),              // Any string
  title: string('Example'),           // Any string
  date: datetime('2024-01-01T00:00:00Z'), // ISO datetime
  count: integer(42),                 // Any integer
  active: boolean(true),              // Any boolean
  items: eachLike({                   // Array of similar items
    name: string('Item'),
  }),
  status: regex(/^(active|inactive)$/, 'active'), // Pattern match
};
```

### 3. Provider States

Define states for test scenarios:

```typescript
await provider
  .given('a lesson plan exists')  // Provider state
  .uponReceiving('a request to get the lesson plan')
  .withRequest({ /* ... */ })
  .willRespondWith({ /* ... */ });
```

## Writing Provider Tests

### 1. State Handlers

Implement state handlers to set up test data:

```typescript
const verifierOptions = {
  stateHandlers: {
    'a lesson plan exists': async () => {
      // Create test data
      await createTestLessonPlan();
      return { description: 'Test data created' };
    },
  },
};
```

### 2. Request Filters

Handle authentication and request modifications:

```typescript
requestFilter: (req, res, next) => {
  if (req.headers.authorization === 'Bearer test-token') {
    req.headers.authorization = `Bearer ${actualTestToken}`;
  }
  next();
},
```

## Contract Publishing

### Manual Publishing

```bash
# Publish contracts to broker
cd client
pnpm test:pact:publish

# Verify contracts from broker
cd ../server
PACT_BROKER_URL=http://localhost:9292 pnpm test:pact:verify
```

### CI/CD Integration

The project includes GitHub Actions workflows for automated contract testing:

1. **Consumer tests** run and generate pact files
2. **Provider tests** verify the contracts
3. **Can-i-deploy** checks deployment compatibility
4. **Breaking changes** are detected in PRs

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Use unique IDs for test data
- Clean up after tests

### 2. Realistic Data

- Use production-like data structures
- Include all required fields
- Test error scenarios

### 3. Versioning

- Tag releases in Pact Broker
- Use semantic versioning
- Document breaking changes

### 4. Contract Evolution

- Add new endpoints as separate tests
- Deprecate old endpoints gradually
- Coordinate changes between teams

## Common Patterns

### Pagination

```typescript
const paginatedResponse = {
  items: eachLike({ /* item structure */ }),
  pagination: like({
    total: integer(100),
    limit: integer(20),
    offset: integer(0),
    hasMore: boolean(true),
  }),
};
```

### Error Responses

```typescript
await provider
  .uponReceiving('a request for non-existent resource')
  .withRequest({
    method: 'GET',
    path: '/api/resource/invalid-id',
  })
  .willRespondWith({
    status: 404,
    body: {
      error: string('Resource not found'),
      code: string('RESOURCE_NOT_FOUND'),
    },
  });
```

### File Uploads

```typescript
await provider
  .uponReceiving('a file upload request')
  .withRequest({
    method: 'POST',
    path: '/api/upload',
    headers: {
      'Content-Type': regex(/^multipart\/form-data/, 'multipart/form-data'),
    },
  })
  .willRespondWith({
    status: 201,
    body: {
      fileId: string('file123'),
      url: regex(/^https:\/\//, 'https://example.com/file'),
    },
  });
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure port 9393 is available for Pact mock server
2. **State setup failures**: Check database connections and test data
3. **Matcher mismatches**: Use appropriate matchers for dynamic content
4. **Timeout errors**: Increase test timeout for slow operations

### Debug Mode

Enable detailed logging:

```typescript
const provider = new PactV3({
  // ...
  logLevel: 'debug',
});
```

### Viewing Contracts

Generated contracts are stored in:
- Consumer: `client/pacts/`
- Published: Pact Broker UI at http://localhost:9292

## Environment Variables

```bash
# Pact Broker Configuration
PACT_BROKER_URL=http://localhost:9292
PACT_BROKER_USERNAME=admin
PACT_BROKER_PASSWORD=admin

# CI/CD
CI=true  # Enables result publishing
```

## Resources

- [Pact Documentation](https://docs.pact.io/)
- [Pact JS Guide](https://github.com/pact-foundation/pact-js)
- [Contract Testing Best Practices](https://docs.pact.io/best_practices)
- [Pact Broker User Guide](https://docs.pact.io/pact_broker)