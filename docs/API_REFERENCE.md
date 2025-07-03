# API_REFERENCE.md - Teaching Engine 2.0 API Documentation

> **Last Updated**: 2025-07-03  
> **Version**: 1.0  
> **API Version**: v1

---

## 📋 Overview

Teaching Engine 2.0 provides a comprehensive REST API for managing educational planning data, curriculum tracking, parent communications, and AI-powered teaching assistance. The API follows RESTful conventions with JSON request/response format.

### Base URLs

- **Production**: `https://api.teachingengine.school/api`
- **Development**: `http://localhost:3000/api`

### API Versioning

All endpoints are versioned. Current version is `v1` and is included in the base URL.

---

## 🔐 Authentication

### JWT Token Authentication

All API endpoints require authentication via JWT (JSON Web Token).

#### Required Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

#### Authentication Levels

- **Teacher**: Full access to their curriculum data and student information
- **Administrator**: Read access to all teacher data + system management
- **Parent**: Limited read access to their child's information (future feature)

#### Getting a Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "teacher@school.edu",
  "password": "secure_password"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 5,
      "email": "teacher@school.edu",
      "name": "Sarah Johnson",
      "role": "teacher"
    },
    "expiresAt": "2024-01-26T15:30:00Z"
  }
}
```

---

## 🎓 Curriculum Management

### Get Curriculum Expectations

Retrieve curriculum expectations with filtering and pagination.

**Endpoint**: `GET /curriculum/expectations`

#### Query Parameters

| Parameter | Type   | Required | Description                            |
| --------- | ------ | -------- | -------------------------------------- |
| page      | number | No       | Page number (default: 1)               |
| limit     | number | No       | Items per page (default: 20, max: 100) |
| subject   | string | No       | Filter by subject code                 |
| grade     | string | No       | Filter by grade level                  |
| search    | string | No       | Search in description and code         |

#### Response

```json
{
  "success": true,
  "data": {
    "expectations": [
      {
        "id": 1,
        "code": "FLA1.1",
        "description": "Demonstrate listening comprehension by responding appropriately to simple instructions",
        "subject": "French Language Arts",
        "grade": "Grade 1",
        "strand": "Oral Communication",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 95,
      "itemsPerPage": 20
    }
  }
}
```

### Create Curriculum Expectation

**Endpoint**: `POST /curriculum/expectations`

#### Request Body

```json
{
  "code": "FLA1.2",
  "description": "Express ideas and feelings using familiar vocabulary and simple phrases",
  "subject": "French Language Arts",
  "grade": "Grade 1",
  "strand": "Oral Communication"
}
```

---

## 📅 Planning Management

### Long-Range Plans

#### Get Long-Range Plans

**Endpoint**: `GET /planning/long-range`

#### Create Long-Range Plan

**Endpoint**: `POST /planning/long-range`

```json
{
  "title": "Grade 1 French Language Arts - Year Plan",
  "academicYear": "2024-2025",
  "grade": "Grade 1",
  "subject": "French Language Arts",
  "expectationIds": [1, 2, 3, 4, 5],
  "notes": "Focus on oral communication development"
}
```

### Unit Plans

#### Get Unit Plans

**Endpoint**: `GET /planning/units`

#### Create Unit Plan

**Endpoint**: `POST /planning/units`

```json
{
  "title": "Winter Theme Unit",
  "longRangePlanId": 1,
  "startDate": "2024-01-15",
  "endDate": "2024-02-09",
  "description": "Exploring winter through vocabulary, stories, and activities",
  "expectationIds": [1, 3, 5],
  "estimatedHours": 20
}
```

### Lesson Plans

#### Get Lesson Plans

**Endpoint**: `GET /planning/lessons`

#### Create Lesson Plan

**Endpoint**: `POST /planning/lessons`

```json
{
  "title": "Winter Vocabulary Introduction",
  "unitPlanId": 1,
  "date": "2024-01-15",
  "duration": 60,
  "objective": "Students will learn and use 10 winter-related vocabulary words",
  "materials": ["flashcards", "whiteboard", "winter images"],
  "activities": [
    {
      "title": "Vocabulary Introduction",
      "duration": 15,
      "description": "Introduce winter words with visual aids",
      "type": "direct_instruction"
    }
  ],
  "assessment": "Observe student participation and vocabulary usage",
  "expectationIds": [1]
}
```

### Daybook Entries

#### Get Daybook Entries

**Endpoint**: `GET /planning/daybook`

#### Create Daybook Entry

**Endpoint**: `POST /planning/daybook`

```json
{
  "date": "2024-01-15",
  "lessonPlanId": 1,
  "reflectionNotes": "Students were very engaged with winter vocabulary. Need more visual supports for ELL students.",
  "completionStatus": "completed",
  "nextSteps": "Review vocabulary tomorrow, add action words",
  "studentHighlights": [
    {
      "studentId": 15,
      "note": "Alex showed excellent participation and helped peers"
    }
  ]
}
```

---

## 🤖 AI-Powered Features

### Activity Generation

#### Generate Activities

**Endpoint**: `POST /ai/activities/generate`

```json
{
  "expectationIds": [1, 3],
  "activityType": "game",
  "duration": 30,
  "materials": ["available", "low-cost"],
  "languageLevel": "beginner",
  "preferences": {
    "interactive": true,
    "movement": false,
    "technology": false
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "title": "Winter Word Bingo",
        "description": "Interactive bingo game using winter vocabulary words",
        "duration": 30,
        "materials": ["bingo cards", "winter pictures", "markers"],
        "instructions": [
          "Distribute bingo cards with winter images",
          "Call out French winter words",
          "Students mark corresponding images",
          "First to complete a line wins"
        ],
        "expectations": [
          {
            "id": 1,
            "alignment": "Students demonstrate listening comprehension"
          }
        ],
        "confidence": 0.89
      }
    ],
    "metadata": {
      "generationTime": 1.2,
      "totalGenerated": 3,
      "averageConfidence": 0.85
    }
  }
}
```

### Curriculum Import

#### Import Curriculum Document

**Endpoint**: `POST /ai/curriculum/import`

```json
{
  "fileUrl": "/uploads/ontario_fla_grade1.pdf",
  "grade": "Grade 1",
  "subject": "French Language Arts",
  "extractionOptions": {
    "includeExamples": true,
    "groupByStrand": true,
    "includeAssessment": false
  }
}
```

---

## 💬 Communication System

### Parent Messages

#### Get Messages

**Endpoint**: `GET /communication/messages`

#### Query Parameters

| Parameter | Type   | Description                                           |
| --------- | ------ | ----------------------------------------------------- |
| type      | string | Filter by: 'newsletter', 'individual', 'announcement' |
| status    | string | Filter by: 'draft', 'sent', 'scheduled'               |
| dateFrom  | string | Start date (ISO 8601)                                 |
| dateTo    | string | End date (ISO 8601)                                   |

#### Create Message

**Endpoint**: `POST /communication/messages`

```json
{
  "title": "Winter Learning Update",
  "timeframe": "Week of January 15-19, 2024",
  "contentFr": "Cette semaine, nous avons exploré le thème de l'hiver...",
  "contentEn": "This week, we explored the theme of winter...",
  "type": "newsletter",
  "linkedOutcomes": [1, 5, 12],
  "linkedActivities": [23, 24, 25]
}
```

#### Send Message

**Endpoint**: `POST /communication/messages/:id/send`

```json
{
  "recipients": [
    {
      "type": "email",
      "address": "parent@example.com",
      "name": "Marie Dubois",
      "language": "fr"
    }
  ],
  "options": {
    "trackOpens": true,
    "trackClicks": true,
    "priority": "normal"
  }
}
```

### Content Generation

#### Generate Suggestions

**Endpoint**: `POST /communication/suggestions`

```json
{
  "weekStart": "2024-01-15",
  "weekEnd": "2024-01-19",
  "tone": "friendly",
  "language": "both",
  "includeActivities": true
}
```

#### Translate Content

**Endpoint**: `POST /communication/translate`

```json
{
  "text": "Cette semaine, nous avons exploré le thème de l'hiver.",
  "fromLanguage": "fr",
  "toLanguage": "en",
  "context": "newsletter"
}
```

---

## 📊 Progress Tracking

### Progress Analytics

#### Get Curriculum Progress

**Endpoint**: `GET /progress/curriculum`

#### Response

```json
{
  "success": true,
  "data": {
    "overall": {
      "totalExpectations": 95,
      "covered": 67,
      "inProgress": 15,
      "notStarted": 13,
      "completionPercentage": 70.5
    },
    "bySubject": [
      {
        "subject": "French Language Arts",
        "totalExpectations": 45,
        "covered": 32,
        "completionPercentage": 71.1
      }
    ],
    "byStrand": [
      {
        "strand": "Oral Communication",
        "subject": "French Language Arts",
        "covered": 8,
        "total": 12,
        "completionPercentage": 66.7
      }
    ],
    "timeline": [
      {
        "month": "January",
        "expectationsCovered": 12,
        "cumulativeTotal": 67
      }
    ]
  }
}
```

#### Get Weekly Progress

**Endpoint**: `GET /progress/weekly`

```json
{
  "success": true,
  "data": {
    "currentWeek": {
      "weekOf": "2024-01-15",
      "planneHours": 25,
      "completedHours": 22,
      "activitiesCompleted": 15,
      "activitiesPlanned": 18,
      "expectationsCovered": 8
    },
    "trends": {
      "averageCompletion": 0.88,
      "improvementAreas": ["math problem solving", "reading comprehension"],
      "strongAreas": ["oral communication", "creative writing"]
    }
  }
}
```

---

## 📁 Resource Management

### File Uploads

#### Upload Resource

**Endpoint**: `POST /resources/upload`

**Content-Type**: `multipart/form-data`

#### Form Fields

| Field          | Type     | Required | Description                          |
| -------------- | -------- | -------- | ------------------------------------ |
| file           | File     | Yes      | Resource file (images, PDFs, videos) |
| title          | string   | Yes      | Resource title                       |
| description    | string   | No       | Resource description                 |
| tags           | string[] | No       | Searchable tags                      |
| linkedEntities | object   | No       | Link to lessons, activities, etc.    |

#### Response

```json
{
  "success": true,
  "data": {
    "id": 123,
    "fileName": "winter_images.zip",
    "originalName": "winter_images.zip",
    "fileUrl": "/uploads/resources/123_winter_images.zip",
    "fileSize": 2048576,
    "mimeType": "application/zip",
    "title": "Winter Theme Images",
    "uploadedAt": "2024-01-15T14:30:00Z"
  }
}
```

#### Get Resources

**Endpoint**: `GET /resources`

#### Query Parameters

| Parameter | Type     | Description                                              |
| --------- | -------- | -------------------------------------------------------- |
| type      | string   | Filter by file type: 'image', 'pdf', 'video', 'document' |
| tags      | string[] | Filter by tags                                           |
| search    | string   | Search in title and description                          |
| linkedTo  | string   | Filter by linked entity type                             |

---

## 📈 Reporting

### Generate Reports

#### Student Progress Report

**Endpoint**: `POST /reports/student-progress`

```json
{
  "studentId": 15,
  "term": "Term 2",
  "format": "pdf",
  "includeComments": true,
  "language": "both"
}
```

#### Curriculum Coverage Report

**Endpoint**: `POST /reports/curriculum-coverage`

```json
{
  "dateFrom": "2024-01-01",
  "dateTo": "2024-01-31",
  "subjects": ["French Language Arts", "Mathematics"],
  "format": "pdf",
  "includeAnalytics": true
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "reportId": "rpt_123456789",
    "downloadUrl": "/api/downloads/rpt_123456789",
    "fileName": "curriculum_coverage_january_2024.pdf",
    "format": "pdf",
    "generatedAt": "2024-01-31T15:30:00Z",
    "expiresAt": "2024-02-07T15:30:00Z"
  }
}
```

---

## ⚠️ Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "field": "email",
      "constraint": "must be a valid email address"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T15:30:00Z",
    "requestId": "req_123456789",
    "version": "1.0"
  }
}
```

### HTTP Status Codes

| Status | Description           |
| ------ | --------------------- |
| 200    | Success               |
| 201    | Created               |
| 204    | No Content            |
| 400    | Bad Request           |
| 401    | Unauthorized          |
| 403    | Forbidden             |
| 404    | Not Found             |
| 409    | Conflict              |
| 413    | Payload Too Large     |
| 429    | Rate Limit Exceeded   |
| 500    | Internal Server Error |

### Common Error Codes

| Code                | Description               |
| ------------------- | ------------------------- |
| VALIDATION_ERROR    | Request validation failed |
| AUTH_FAILED         | Authentication failed     |
| AUTH_DENIED         | Insufficient permissions  |
| NOT_FOUND           | Resource not found        |
| DUPLICATE_ENTRY     | Resource already exists   |
| RATE_LIMIT_EXCEEDED | Too many requests         |
| FILE_TOO_LARGE      | File exceeds size limit   |
| UNSUPPORTED_FORMAT  | File format not supported |

---

## 🔄 Rate Limiting

### Rate Limits by Endpoint Category

| Category        | Requests/Hour | Burst Limit |
| --------------- | ------------- | ----------- |
| Authentication  | 100           | 10          |
| Curriculum CRUD | 1000          | 50          |
| Planning CRUD   | 2000          | 100         |
| AI Generation   | 100           | 10          |
| File Uploads    | 200           | 20          |
| Communication   | 500           | 25          |
| Reports         | 50            | 5           |

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1642694400
```

---

## 🔧 Pagination

### Standard Pagination Parameters

| Parameter | Default | Max | Description    |
| --------- | ------- | --- | -------------- |
| page      | 1       | -   | Page number    |
| limit     | 20      | 100 | Items per page |

### Pagination Response Format

```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 95,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 🔍 Filtering and Search

### Common Filter Parameters

- **Date Ranges**: `dateFrom`, `dateTo` (ISO 8601 format)
- **Text Search**: `search` (searches titles, descriptions, codes)
- **Status Filters**: `status` (varies by endpoint)
- **Category Filters**: `type`, `subject`, `grade`, etc.

### Search Examples

```http
GET /planning/lessons?search=winter&dateFrom=2024-01-01&subject=French
GET /curriculum/expectations?grade=Grade%201&strand=Oral%20Communication
GET /communication/messages?type=newsletter&status=sent
```

---

## 📚 Additional Resources

### Related Documentation

- **Data Flow Architecture**: See `../DATA_FLOW.md`
- **Database Schemas**: See `../SCHEMAS.md`
- **Development Setup**: See `../ROADMAP.md`

### External Integrations

- **Google Drive**: For file storage and sharing
- **Email Services**: For parent communication delivery
- **Calendar Systems**: For holiday and event integration

### SDK and Libraries

- **JavaScript/TypeScript SDK**: Available via npm
- **cURL Examples**: Included throughout this documentation
- **Postman Collection**: Available in project repository

---

_This API reference covers the core endpoints of Teaching Engine 2.0. For additional endpoints, implementation details, or specific integration questions, refer to the project repository or contact the development team._
