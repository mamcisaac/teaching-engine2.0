# Email Testing Documentation

This directory contains comprehensive email testing infrastructure for the Teaching Engine application.

## Overview

The email testing system replaces mocked email services with real email testing using:
- **MailHog** for development and local testing
- **In-memory provider** for CI/CD environments
- **Real SMTP testing** to verify email content, formatting, and attachments

## Architecture

### Test Email Providers

1. **MailHogTestProvider** (`emailTestHelper.ts`)
   - Uses real SMTP server (MailHog) for local development
   - Tests actual email delivery and formatting
   - Provides web UI for visual email inspection
   - Handles attachments and HTML content

2. **InMemoryTestProvider** (`emailTestHelper.ts`)
   - Lightweight in-memory email storage
   - Used in CI environments where Docker isn't available
   - Maintains same API as MailHog provider

### Test Email Service

The `TestEmailService` (`testEmailService.ts`) provides:
- Unified interface for email testing
- Bulk email operations
- Retry mechanisms
- Email content validation
- Attachment handling

## Setup

### Prerequisites

Choose one of the following options:

#### Option 1: Docker (Recommended)
```bash
# Start MailHog using Docker Compose
docker-compose -f docker-compose.test.yml up -d mailhog

# Verify MailHog is running
curl http://localhost:8025/api/v1/messages
```

#### Option 2: Direct Installation
```bash
# Install MailHog directly
go install github.com/mailhog/MailHog@latest

# Start MailHog
mailhog
```

#### Option 3: CI/Automatic
The test setup automatically falls back to in-memory provider if MailHog isn't available.

### Environment Variables

```bash
# Optional: Set email testing mode
EMAIL_TEST_MODE=mailhog  # or 'memory' for in-memory testing

# MailHog configuration (default values)
MAILHOG_SMTP_PORT=1025
MAILHOG_HTTP_PORT=8025
MAILHOG_HOST=localhost
```

## Usage

### Running Email Tests

```bash
# Run all email tests
npm test -- tests/email-service.test.ts
npm test -- tests/email-templates.test.ts
npm test -- tests/unreadNotifications.test.ts

# Run with coverage
npm run test:coverage -- tests/email-*.test.ts

# Run with MailHog web UI for visual inspection
# Start MailHog, then run tests, then open http://localhost:8025
```

### Test Structure

#### 1. Basic Email Testing
```typescript
import { getTestEmailService } from './helpers/testEmailService';
import { generateTestEmail, expectEmailContent } from './helpers/emailTestHelper';

const testEmailService = getTestEmailService();

// Send test email
await testEmailService.sendEmail(
  generateTestEmail(),
  'Test Subject',
  'Test message content'
);

// Verify email was sent
const emails = await testEmailService.getEmails();
expect(emails).toHaveLength(1);

expectEmailContent(emails[0], {
  subject: 'Test Subject',
  text: 'Test message content'
});
```

#### 2. Newsletter Testing
```typescript
// Test newsletter sending with PDF attachment
const newsletter = await prisma.newsletter.create({
  data: { title: 'Test Newsletter', content: '<h1>HTML Content</h1>' }
});

const parentContact = await prisma.parentContact.create({
  data: { name: 'Parent', email: generateTestEmail(), studentName: 'Student' }
});

// Send newsletter via API
await request(app)
  .post(`/api/newsletters/${newsletter.id}/send`)
  .set('Authorization', `Bearer ${token}`);

// Verify email with attachment
const emails = await testEmailService.getEmails();
expect(emails[0].attachments).toHaveLength(1);
expect(emails[0].attachments[0].filename).toBe('newsletter.pdf');
```

#### 3. Template Testing
```typescript
import { renderTemplate } from '../src/services/newsletterGenerator';

// Test template rendering
const html = renderTemplate('weekly', {
  title: 'Weekly Newsletter',
  content: '<h2>This week\'s highlights</h2>'
});

expect(html).toContain('Weekly Newsletter');
expect(html).toContain('<style>'); // CSS included
expect(html).toContain('<html>');  // Complete HTML document
```

### Available Test Helpers

#### Email Generation
```typescript
import { generateTestEmail } from './helpers/emailTestHelper';

const uniqueEmail = generateTestEmail(); // test-abc123@test.example.com
const customDomain = generateTestEmail('myschool.edu'); // test-abc123@myschool.edu
```

#### Content Validation
```typescript
import { expectEmailContent } from './helpers/emailTestHelper';

expectEmailContent(email, {
  to: ['recipient@example.com'],
  subject: 'Expected Subject',
  text: 'Expected content',
  from: 'sender@example.com'
});
```

#### Bulk Operations
```typescript
const result = await testEmailService.sendBulkEmails(
  ['user1@test.com', 'user2@test.com'],
  'Bulk Subject',
  'Bulk message'
);

expect(result.sent).toBe(2);
expect(result.failed).toHaveLength(0);
```

#### Retry Testing
```typescript
await testEmailService.sendEmailWithRetry(
  'recipient@test.com',
  'Subject',
  'Message',
  undefined, // no attachment
  3,         // max retries
  1000       // retry delay ms
);
```

## Test Coverage

### Email Functionality
- ✅ Newsletter creation and sending
- ✅ PDF attachment generation and delivery
- ✅ HTML email template rendering
- ✅ Bulk email operations
- ✅ Email retry mechanisms
- ✅ Unicode and special character handling
- ✅ Email address validation
- ✅ Delivery failure handling

### Template Testing
- ✅ Weekly newsletter template
- ✅ Monthly newsletter template  
- ✅ Daily update template
- ✅ Template content injection
- ✅ CSS styling verification
- ✅ HTML structure validation
- ✅ XSS prevention testing

### Integration Testing
- ✅ API endpoint email sending
- ✅ Authentication-protected email operations
- ✅ Database integration with email features
- ✅ Error handling and recovery
- ✅ Concurrent email operations

## Debugging

### MailHog Web Interface
When using MailHog, open http://localhost:8025 to:
- View all sent emails visually
- Inspect email headers and metadata
- Download attachments
- Clear email queue manually

### Common Issues

#### MailHog Not Starting
```bash
# Check if port is already in use
lsof -i :1025
lsof -i :8025

# Check Docker status
docker ps | grep mailhog

# Check logs
docker-compose -f docker-compose.test.yml logs mailhog
```

#### Tests Failing in CI
The system automatically falls back to in-memory provider in CI environments. Set `CI=true` to test this mode locally:
```bash
CI=true npm test -- tests/email-service.test.ts
```

#### Attachment Issues
Verify PDF generation:
```typescript
// Test PDF content
const attachment = email.attachments[0];
expect(attachment.content.toString().startsWith('%PDF')).toBe(true);
expect(attachment.content.length).toBeGreaterThan(100);
```

### Performance Considerations
- MailHog stores emails in memory by default
- Use `MH_STORAGE=maildir` for persistent storage in development
- In-memory provider is faster for large test suites
- Clear emails between tests to prevent memory issues

## Future Enhancements

### Planned Features
- [ ] Email template preview generation
- [ ] Advanced email analytics testing
- [ ] Multi-language email template testing
- [ ] Email scheduling and queuing tests
- [ ] SMTP authentication testing
- [ ] Email bounce handling tests

### Integration Opportunities
- [ ] Playwright E2E email verification
- [ ] Performance testing for bulk operations
- [ ] Load testing email delivery
- [ ] Email accessibility testing
- [ ] Mobile email client testing

## Maintenance

### Updating Test Data
Email test data is generated dynamically using `randomBytes()` to ensure uniqueness across test runs.

### Adding New Email Features
1. Add email functionality to main application
2. Create corresponding test in appropriate test file
3. Use existing test helpers for consistency
4. Verify both MailHog and in-memory providers work
5. Update this documentation

### Test Environment Cleanup
The system automatically cleans up:
- Email queues between tests
- MailHog processes on exit
- Docker containers on teardown
- Temporary test data

Manual cleanup if needed:
```bash
docker-compose -f docker-compose.test.yml down -v
```