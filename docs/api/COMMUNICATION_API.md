# Communication API Documentation

## Overview

The Communication API provides endpoints for managing parent communications, including sending newsletters, parent summaries, and tracking email delivery status.

## Base URL

All endpoints are prefixed with `/api/communication`

## Authentication

All endpoints require authentication via JWT token in the Authorization header or cookie.

## Endpoints

### Send Parent Message

Sends a parent message/newsletter to multiple recipients via email.

**Endpoint:** `POST /api/communication/parent-messages/:id/send`

**Parameters:**
- `id` (path parameter) - The ID of the parent message to send

**Request Body:**
```json
{
  "recipients": [
    {
      "email": "parent@example.com",
      "name": "Parent Name"
    }
  ],
  "language": "en" // Optional: "en" or "fr", defaults to "en"
}
```

**Validation Rules:**
- Recipients array is required and must not be empty
- Each recipient must have a valid email address
- Recipient names must be 1-100 characters
- Language must be either "en" or "fr"

**Response:**
```json
{
  "success": true,
  "message": "Newsletter sent to 5 recipients",
  "sentCount": 5
}
```

**Rate Limits:**
- 10 requests per hour per user
- Maximum 100 recipients per request

**Error Responses:**
- `400` - Invalid request data or validation error
- `404` - Parent message not found
- `429` - Rate limit exceeded
- `500` - Server error during sending

---

### Send Parent Summary

Sends a parent summary for a specific student to recipients.

**Endpoint:** `POST /api/communication/parent-summaries/:id/send`

**Parameters:**
- `id` (path parameter) - The ID of the parent summary to send

**Request Body:**
```json
{
  "recipients": [
    {
      "email": "parent@example.com",
      "name": "Parent Name"
    }
  ],
  "language": "fr" // Optional: "en" or "fr", defaults to "en"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Parent summary sent to 2 recipients",
  "sentCount": 2
}
```

**Rate Limits:**
- 10 requests per hour per user
- Maximum 100 recipients per request

---

### Get Parent Message Deliveries

Retrieves email delivery status and statistics for a parent message.

**Endpoint:** `GET /api/communication/parent-messages/:id/deliveries`

**Parameters:**
- `id` (path parameter) - The ID of the parent message

**Response:**
```json
{
  "deliveries": [
    {
      "id": 1,
      "recipientEmail": "parent@example.com",
      "recipientName": "Parent Name",
      "subject": "Weekly Newsletter - Week of Jan 15",
      "language": "en",
      "status": "sent",
      "sentAt": "2024-01-15T10:30:00Z",
      "failureReason": null,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "stats": {
    "total": 25,
    "sent": 23,
    "delivered": 20,
    "failed": 2,
    "pending": 0
  }
}
```

**Delivery Status Values:**
- `pending` - Email queued but not yet sent
- `sent` - Email successfully sent to provider
- `delivered` - Email confirmed delivered by provider
- `failed` - Email failed to send
- `bounced` - Email bounced back

---

### Get Parent Summary Deliveries

Retrieves email delivery status for a parent summary.

**Endpoint:** `GET /api/communication/parent-summaries/:id/deliveries`

**Parameters:**
- `id` (path parameter) - The ID of the parent summary

**Response:** Same format as parent message deliveries

---

### Get All Parent Contacts

Retrieves all unique parent contacts across all students for the authenticated teacher.

**Endpoint:** `GET /api/communication/parent-contacts`

**Response:**
```json
[
  {
    "email": "parent1@example.com",
    "name": "John Doe"
  },
  {
    "email": "parent2@example.com",
    "name": "Jane Smith"
  }
]
```

**Notes:**
- Returns deduplicated list of parent contacts
- Contacts are aggregated from all students belonging to the teacher

---

### Get Student Parent Contacts

Retrieves parent contacts for a specific student.

**Endpoint:** `GET /api/communication/students/:studentId/parent-contacts`

**Parameters:**
- `studentId` (path parameter) - The ID of the student

**Response:**
```json
[
  {
    "email": "mother@example.com",
    "name": "Mary Johnson"
  },
  {
    "email": "father@example.com",
    "name": "Robert Johnson"
  }
]
```

## Email Delivery

### Email Service Configuration

The system supports two email providers:
1. **SendGrid** (recommended) - Set `SENDGRID_API_KEY` environment variable
2. **SMTP** - Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

If neither is configured, emails will be logged but not sent (development mode).

### Retry Logic

Failed email deliveries are automatically retried with exponential backoff:
- Maximum 3 retry attempts
- Initial delay: 1 second
- Maximum delay: 4 seconds
- Only temporary failures are retried

### Security Features

1. **Input Sanitization** - All HTML content is sanitized to prevent XSS
2. **Email Validation** - Strict validation of email addresses
3. **Rate Limiting** - Prevents abuse and spam
4. **Authorization** - Users can only send their own messages

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Human-readable error message",
  "details": {
    // Additional error details if available
  }
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Resource not found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

## Best Practices

1. **Batch Recipients** - Send to multiple recipients in one request rather than individual requests
2. **Handle Failures** - Check delivery status and retry failed sends
3. **Respect Rate Limits** - Implement client-side rate limiting
4. **Validate Emails** - Validate email addresses before sending
5. **Use Appropriate Language** - Send emails in the recipient's preferred language

## Examples

### Send a Newsletter with cURL

```bash
curl -X POST https://api.example.com/api/communication/parent-messages/123/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": [
      {"email": "parent1@example.com", "name": "Parent One"},
      {"email": "parent2@example.com", "name": "Parent Two"}
    ],
    "language": "en"
  }'
```

### Check Delivery Status

```bash
curl https://api.example.com/api/communication/parent-messages/123/deliveries \
  -H "Authorization: Bearer YOUR_TOKEN"
```