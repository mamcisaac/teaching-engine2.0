# Communication API Endpoints

## Overview

This document provides comprehensive documentation for all communication-related API endpoints in Teaching Engine 2.0. These endpoints handle parent communications, newsletters, reports, and message delivery.

## Authentication

All communication endpoints require authentication via JWT token.

### Required Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

### Authentication Levels
- **Teacher**: Can create, edit, and send communications for their assigned classes
- **Administrator**: Read-only access to all communications for oversight
- **Parent**: Read-only access to communications addressed to them (future feature)

## Base URL
```
Production: https://api.teachingengine.school/api
Development: http://localhost:3000/api
```

---

## Parent Messages

### Create Parent Message

Creates a new parent communication (newsletter, individual message, or announcement).

**Endpoint**: `POST /communication/messages`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Message title (max 255 chars) |
| timeframe | string | No | Time period covered (e.g., "Week of Jan 15-19") |
| contentFr | string | No | French content (rich text/markdown) |
| contentEn | string | No | English content (rich text/markdown) |
| type | string | Yes | Message type: 'newsletter', 'individual', 'announcement' |
| linkedOutcomes | number[] | No | Array of outcome IDs |
| linkedActivities | number[] | No | Array of activity IDs |
| attachments | Attachment[] | No | File attachments |

#### Attachment Object
```typescript
interface Attachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}
```

#### Request Example
```json
{
  "title": "Winter Theme Newsletter",
  "timeframe": "Week of January 15-19, 2024",
  "contentFr": "Cette semaine, nous avons exploré le thème de l'hiver...",
  "contentEn": "This week, we explored the theme of winter...",
  "type": "newsletter",
  "linkedOutcomes": [1, 5, 12],
  "linkedActivities": [23, 24, 25],
  "attachments": [
    {
      "fileName": "winter_activities.pdf",
      "fileUrl": "/uploads/files/winter_activities.pdf",
      "fileType": "application/pdf",
      "fileSize": 1024567
    }
  ]
}
```

#### Success Response (201)
```json
{
  "success": true,
  "data": {
    "id": 42,
    "title": "Winter Theme Newsletter",
    "timeframe": "Week of January 15-19, 2024",
    "contentFr": "Cette semaine, nous avons exploré le thème de l'hiver...",
    "contentEn": "This week, we explored the theme of winter...",
    "type": "newsletter",
    "status": "draft",
    "createdAt": "2024-01-19T15:30:00Z",
    "updatedAt": "2024-01-19T15:30:00Z",
    "createdBy": 5,
    "linkedOutcomes": [
      {
        "id": 1,
        "code": "FLA1.1",
        "description": "Oral communication skills"
      }
    ],
    "linkedActivities": [
      {
        "id": 23,
        "title": "Winter Vocabulary Game",
        "highlighted": true
      }
    ],
    "attachments": [
      {
        "id": 15,
        "fileName": "winter_activities.pdf",
        "fileUrl": "/uploads/files/winter_activities.pdf",
        "fileType": "application/pdf",
        "fileSize": 1024567
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-19T15:30:00Z",
    "version": "1.0",
    "requestId": "req_123456789"
  }
}
```

#### Error Responses

| Status | Description | Response Body |
|--------|-------------|---------------|
| 400 | Bad Request | `{"success": false, "error": {"code": "VALIDATION_ERROR", "message": "Title is required"}}` |
| 401 | Unauthorized | `{"success": false, "error": {"code": "AUTH_FAILED", "message": "Invalid or expired token"}}` |
| 403 | Forbidden | `{"success": false, "error": {"code": "AUTH_DENIED", "message": "Insufficient permissions"}}` |
| 413 | Payload Too Large | `{"success": false, "error": {"code": "FILE_TOO_LARGE", "message": "Attachment exceeds size limit"}}` |

---

### Get Parent Messages

Retrieves a list of parent messages with filtering and pagination.

**Endpoint**: `GET /communication/messages`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20, max: 100) |
| type | string | No | Filter by type: 'newsletter', 'individual', 'announcement' |
| status | string | No | Filter by status: 'draft', 'sent', 'scheduled' |
| dateFrom | string | No | Filter from date (ISO 8601) |
| dateTo | string | No | Filter to date (ISO 8601) |
| search | string | No | Search in title and content |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 42,
        "title": "Winter Theme Newsletter",
        "timeframe": "Week of January 15-19, 2024",
        "type": "newsletter",
        "status": "sent",
        "createdAt": "2024-01-19T15:30:00Z",
        "updatedAt": "2024-01-19T16:45:00Z",
        "recipientCount": 25,
        "deliveryRate": 0.96
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 45,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

#### cURL Example
```bash
curl -X GET "https://api.teachingengine.school/api/communication/messages?type=newsletter&page=1&limit=10" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json"
```

#### JavaScript Example
```javascript
const response = await fetch('/api/communication/messages?type=newsletter&page=1', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
if (data.success) {
  console.log('Messages:', data.data.messages);
}
```

---

### Get Single Parent Message

Retrieves detailed information about a specific parent message.

**Endpoint**: `GET /communication/messages/:id`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Message ID |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": 42,
    "title": "Winter Theme Newsletter",
    "timeframe": "Week of January 15-19, 2024",
    "contentFr": "Cette semaine, nous avons exploré le thème de l'hiver...",
    "contentEn": "This week, we explored the theme of winter...",
    "type": "newsletter",
    "status": "sent",
    "createdAt": "2024-01-19T15:30:00Z",
    "updatedAt": "2024-01-19T16:45:00Z",
    "sentAt": "2024-01-19T16:45:00Z",
    "createdBy": {
      "id": 5,
      "name": "Sarah Johnson",
      "email": "sarah.johnson@school.edu"
    },
    "linkedOutcomes": [
      {
        "id": 1,
        "code": "FLA1.1",
        "description": "Oral communication skills",
        "subject": "French Language Arts"
      }
    ],
    "linkedActivities": [
      {
        "id": 23,
        "title": "Winter Vocabulary Game",
        "description": "Interactive game to learn winter-related vocabulary",
        "highlighted": true
      }
    ],
    "attachments": [
      {
        "id": 15,
        "fileName": "winter_activities.pdf",
        "fileUrl": "/uploads/files/winter_activities.pdf",
        "fileType": "application/pdf",
        "fileSize": 1024567,
        "downloadCount": 12
      }
    ],
    "deliveryStats": {
      "totalRecipients": 25,
      "delivered": 24,
      "failed": 1,
      "opened": 18,
      "clicked": 7
    }
  }
}
```

---

### Update Parent Message

Updates an existing parent message (only allowed for draft messages).

**Endpoint**: `PATCH /communication/messages/:id`

#### Request Body
Same parameters as create, but all are optional.

#### Success Response (200)
Returns updated message object same as GET single message.

---

### Delete Parent Message

Deletes a parent message (only allowed for draft messages).

**Endpoint**: `DELETE /communication/messages/:id`

#### Success Response (204)
No content returned.

---

## Content Generation

### Generate Content Suggestions

Generates AI-powered content suggestions based on weekly planner data.

**Endpoint**: `POST /communication/suggestions`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| weekStart | string | Yes | Week start date (ISO 8601) |
| weekEnd | string | Yes | Week end date (ISO 8601) |
| includeActivities | boolean | No | Include activity highlights (default: true) |
| includeOutcomes | boolean | No | Include outcome progress (default: true) |
| tone | string | No | Content tone: 'formal', 'friendly', 'celebratory' (default: 'friendly') |
| language | string | No | Generation language: 'fr', 'en', 'both' (default: 'both') |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "section": "highlights",
        "contentFr": "Cette semaine, les élèves ont excellé dans...",
        "contentEn": "This week, students excelled in...",
        "confidence": 0.85,
        "sourceActivities": [23, 24, 25]
      },
      {
        "section": "celebrations",
        "contentFr": "Félicitations à la classe pour...",
        "contentEn": "Congratulations to the class for...",
        "confidence": 0.92,
        "sourceData": {
          "milestones": [5, 12],
          "achievements": ["vocabulary_growth", "participation_increase"]
        }
      }
    ],
    "metadata": {
      "generationTime": 1.24,
      "dataSourcesUsed": ["weekly_plan", "student_progress", "outcome_tracking"],
      "suggestionsCount": 6
    }
  }
}
```

---

### Auto-Populate from Weekly Plan

Automatically populates message content from weekly planner data.

**Endpoint**: `POST /communication/auto-populate`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| messageId | number | Yes | Target message ID |
| weekId | number | Yes | Source week ID |
| sections | string[] | Yes | Sections to populate: ['highlights', 'upcoming', 'outcomes'] |
| overwrite | boolean | No | Overwrite existing content (default: false) |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "messageId": 42,
    "populatedSections": ["highlights", "upcoming"],
    "contentUpdated": {
      "contentFr": "Updated French content...",
      "contentEn": "Updated English content...",
      "linkedOutcomes": [1, 5, 12],
      "linkedActivities": [23, 24, 25]
    },
    "warnings": [
      "Existing content in 'outcomes' section was preserved due to overwrite=false"
    ]
  }
}
```

---

### Translate Content

Translates text content between French and English.

**Endpoint**: `POST /communication/translate`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| text | string | Yes | Text to translate |
| fromLanguage | string | Yes | Source language: 'fr' or 'en' |
| toLanguage | string | Yes | Target language: 'fr' or 'en' |
| context | string | No | Context for better translation: 'newsletter', 'report', 'individual' |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "originalText": "Cette semaine, nous avons exploré le thème de l'hiver.",
    "translatedText": "This week, we explored the theme of winter.",
    "fromLanguage": "fr",
    "toLanguage": "en",
    "confidence": 0.94,
    "alternativeTranslations": [
      "This week, we investigated the winter theme.",
      "This week, we studied the winter topic."
    ]
  }
}
```

---

## Export and Delivery

### Export Message

Exports a message to various formats (HTML, PDF, Markdown).

**Endpoint**: `POST /communication/messages/:id/export`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| format | string | Yes | Export format: 'html', 'pdf', 'markdown' |
| language | string | No | Language version: 'fr', 'en', 'both' (default: 'both') |
| includeAttachments | boolean | No | Include attachments in export (default: true) |
| template | string | No | Template to use: 'default', 'formal', 'colorful' |
| options | object | No | Format-specific options |

#### PDF Options
```typescript
interface PDFOptions {
  pageSize: 'A4' | 'letter';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  includeHeader: boolean;
  includeFooter: boolean;
  watermark?: string;
}
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "exportId": "exp_123456789",
    "downloadUrl": "/api/downloads/exp_123456789",
    "fileName": "winter_newsletter_2024-01-19.pdf",
    "fileSize": 1048576,
    "format": "pdf",
    "expiresAt": "2024-01-20T15:30:00Z",
    "metadata": {
      "pageCount": 3,
      "processingTime": 2.1,
      "template": "default"
    }
  }
}
```

#### cURL Example
```bash
curl -X POST "https://api.teachingengine.school/api/communication/messages/42/export" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "pdf",
    "language": "both",
    "includeAttachments": true,
    "template": "formal"
  }'
```

---

### Send Message

Sends a message to specified recipients via email or family portal.

**Endpoint**: `POST /communication/messages/:id/send`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| recipients | Recipient[] | Yes | Array of recipients |
| sendTime | string | No | Scheduled send time (ISO 8601) |
| options | SendOptions | No | Delivery options |

#### Recipient Object
```typescript
interface Recipient {
  type: 'email' | 'portal';
  address: string;
  name?: string;
  studentId?: number;
  language?: 'fr' | 'en';
}
```

#### Send Options
```typescript
interface SendOptions {
  includeAttachments: boolean;
  trackOpens: boolean;
  trackClicks: boolean;
  replyTo?: string;
  priority: 'low' | 'normal' | 'high';
  deliveryConfirmation: boolean;
}
```

#### Request Example
```json
{
  "recipients": [
    {
      "type": "email",
      "address": "parent1@example.com",
      "name": "Marie Dubois",
      "studentId": 15,
      "language": "fr"
    },
    {
      "type": "email",
      "address": "parent2@example.com",
      "name": "John Smith",
      "studentId": 16,
      "language": "en"
    }
  ],
  "sendTime": "2024-01-19T17:00:00Z",
  "options": {
    "includeAttachments": true,
    "trackOpens": true,
    "trackClicks": true,
    "priority": "normal",
    "deliveryConfirmation": true
  }
}
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "messageId": 42,
    "deliveryId": "del_123456789",
    "scheduledFor": "2024-01-19T17:00:00Z",
    "recipientCount": 25,
    "estimatedDeliveryTime": "2024-01-19T17:05:00Z",
    "deliveryStatus": "scheduled",
    "trackingEnabled": true
  }
}
```

---

### Get Delivery Status

Retrieves delivery status and analytics for a sent message.

**Endpoint**: `GET /communication/messages/:id/delivery`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| detailed | boolean | No | Include detailed recipient status (default: false) |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "messageId": 42,
    "deliveryStatus": "completed",
    "sentAt": "2024-01-19T17:00:00Z",
    "completedAt": "2024-01-19T17:05:00Z",
    "summary": {
      "totalRecipients": 25,
      "delivered": 24,
      "failed": 1,
      "pending": 0,
      "bounced": 0,
      "opened": 18,
      "clicked": 7,
      "complained": 0,
      "unsubscribed": 0
    },
    "engagement": {
      "openRate": 0.75,
      "clickRate": 0.29,
      "deliveryRate": 0.96,
      "averageTimeToOpen": "2h 15m",
      "topClickedLinks": [
        {
          "url": "https://school.edu/winter-resources",
          "clicks": 5,
          "description": "Winter learning resources"
        }
      ]
    },
    "recipients": [
      {
        "address": "parent1@example.com",
        "status": "delivered",
        "deliveredAt": "2024-01-19T17:02:00Z",
        "openedAt": "2024-01-19T19:30:00Z",
        "lastClickAt": "2024-01-19T19:35:00Z",
        "clickCount": 2
      }
    ]
  }
}
```

---

## Report Generation

### Generate Report Comments

Generates AI-powered comments for report cards based on student data.

**Endpoint**: `POST /reports/comments/generate`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| studentId | number | Yes | Student ID |
| term | string | Yes | Term identifier (e.g., "Term 2") |
| domain | string | Yes | Subject domain: 'oral', 'reading', 'writing', 'math' |
| tone | string | No | Comment tone: 'formal', 'warm', 'growth-oriented' |
| language | string | No | Generate in: 'fr', 'en', 'both' (default: 'both') |
| includeNextSteps | boolean | No | Include next steps section (default: true) |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "studentId": 15,
    "term": "Term 2",
    "domain": "oral",
    "comments": {
      "french": {
        "strengths": "Alex démontre une excellente participation aux discussions de classe...",
        "growth": "Un domaine à développer serait l'utilisation de vocabulaire plus précis...",
        "nextSteps": "Pour le prochain trimestre, nous nous concentrerons sur..."
      },
      "english": {
        "strengths": "Alex demonstrates excellent participation in class discussions...",
        "growth": "An area for development would be using more precise vocabulary...",
        "nextSteps": "For next term, we will focus on..."
      }
    },
    "metadata": {
      "confidence": 0.87,
      "dataSourcesUsed": ["reflections", "assessments", "observations"],
      "evidenceCount": 12,
      "generationTime": 1.8
    }
  }
}
```

---

### Build Report Card

Compiles a complete report card for a student.

**Endpoint**: `POST /reports/cards/build`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| studentId | number | Yes | Student ID |
| term | string | Yes | Term identifier |
| format | string | No | Output format: 'pdf', 'html', 'json' (default: 'pdf') |
| template | string | No | Report template: 'standard', 'detailed', 'summary' |
| includeComments | boolean | No | Include narrative comments (default: true) |
| language | string | No | Report language: 'fr', 'en', 'both' (default: 'both') |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "reportId": "rpt_123456789",
    "studentId": 15,
    "term": "Term 2",
    "downloadUrl": "/api/downloads/rpt_123456789",
    "fileName": "report_card_alex_term2.pdf",
    "format": "pdf",
    "generatedAt": "2024-01-19T15:30:00Z",
    "expiresAt": "2024-01-26T15:30:00Z",
    "metadata": {
      "pageCount": 4,
      "template": "standard",
      "language": "both",
      "processingTime": 3.2
    }
  }
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Specific field validation error",
      "constraint": "Validation constraint that failed"
    }
  },
  "meta": {
    "timestamp": "2024-01-19T15:30:00Z",
    "requestId": "req_123456789",
    "version": "1.0"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| AUTH_FAILED | 401 | Authentication failed |
| AUTH_DENIED | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource conflict |
| RATE_LIMIT | 429 | Rate limit exceeded |
| FILE_TOO_LARGE | 413 | File size exceeds limit |
| UNSUPPORTED_FORMAT | 415 | Unsupported file format |
| INTERNAL_ERROR | 500 | Internal server error |
| SERVICE_UNAVAILABLE | 503 | External service unavailable |

---

## Rate Limits

### Default Limits

| Endpoint Category | Requests per Hour | Burst Limit |
|-------------------|-------------------|-------------|
| Message CRUD | 1000 | 50 |
| Content Generation | 100 | 10 |
| Export Operations | 50 | 5 |
| Email Sending | 200 | 20 |
| File Uploads | 100 | 10 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642694400
X-RateLimit-Retry-After: 3600
```

---

## Webhooks (Future Feature)

### Delivery Status Webhooks

```json
{
  "event": "message.delivered",
  "data": {
    "messageId": 42,
    "recipientEmail": "parent@example.com",
    "deliveredAt": "2024-01-19T17:02:00Z",
    "deliveryId": "del_123456789"
  },
  "timestamp": "2024-01-19T17:02:00Z"
}
```

### Engagement Webhooks

```json
{
  "event": "message.opened",
  "data": {
    "messageId": 42,
    "recipientEmail": "parent@example.com",
    "openedAt": "2024-01-19T19:30:00Z",
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.1"
  },
  "timestamp": "2024-01-19T19:30:00Z"
}
```