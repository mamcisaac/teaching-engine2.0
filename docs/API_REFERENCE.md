# API_REFERENCE.md - Teaching Engine 2.0 API Documentation

> **Last Updated**: 2025-07-03  
> **Version**: 2.0  
> **API Version**: v1

---

## 📋 Overview

Teaching Engine 2.0 provides a comprehensive REST API for managing educational planning data, curriculum tracking, AI-powered teaching assistance, and parent communications. The API follows RESTful conventions with JSON request/response format and uses HTTP-only cookie-based authentication.

### Base URLs

- **Production**: `https://api.teachingengine.school/api`
- **Development**: `http://localhost:3000/api`

### API Versioning

All endpoints are prefixed with `/api` and follow RESTful conventions. The current implementation supports v1 functionality.

---

## 🔐 Authentication

### HTTP-Only Cookie Authentication

All API endpoints require authentication via HTTP-only cookies containing JWT tokens. This provides enhanced security compared to Bearer token authentication.

#### Authentication Process

The API uses a dual-token system:

- **Access Token**: Short-lived (24 hours) for API requests
- **Refresh Token**: Long-lived (7 days) for token renewal

#### Authentication Headers

```http
Content-Type: application/json
Accept: application/json
Cookie: authToken=<jwt_access_token>; refreshToken=<jwt_refresh_token>
```

#### Getting Authenticated

**Login Endpoint**: `POST /api/auth/login`

```json
{
  "email": "teacher@school.edu",
  "password": "secure_password"
}
```

**Response:**

```json
{
  "user": {
    "id": 5,
    "email": "teacher@school.edu",
    "name": "Sarah Johnson",
    "role": "teacher"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

The server automatically sets HTTP-only cookies:

- `authToken`: Contains the access token
- `refreshToken`: Contains the refresh token

#### Authentication Levels

- **Teacher**: Full access to their curriculum data and student information
- **Administrator**: Extended access to system management features

#### Session Management

**Check Session**: `GET /api/auth/me`

```json
{
  "user": {
    "id": 5,
    "email": "teacher@school.edu",
    "name": "Sarah Johnson",
    "role": "teacher"
  }
}
```

**Logout**: `POST /api/auth/logout`

```json
{
  "message": "Logged out successfully"
}
```

---

## 📚 Curriculum Management

### Curriculum Expectations

#### Get Curriculum Expectations

**Endpoint**: `GET /api/curriculum-expectations`

#### Query Parameters

| Parameter | Type   | Required | Description                            |
| --------- | ------ | -------- | -------------------------------------- |
| subject   | string | No       | Filter by subject name                 |
| grade     | number | No       | Filter by grade level (1-12)           |
| strand    | string | No       | Filter by curriculum strand            |
| search    | string | No       | Search in code, description, or French |

#### Response

```json
[
  {
    "id": "uuid-string",
    "code": "A1.1",
    "description": "Demonstrate listening comprehension by responding appropriately to simple instructions",
    "descriptionFr": "Démontrer la compréhension à l'écoute en répondant de manière appropriée aux instructions simples",
    "subject": "French Language Arts",
    "grade": 1,
    "strand": "Oral Communication",
    "substrand": "Listening",
    "unitPlans": [],
    "lessonPlans": []
  }
]
```

#### Create Curriculum Expectation

**Endpoint**: `POST /api/curriculum-expectations`

```json
{
  "code": "A1.2",
  "description": "Express ideas and feelings using familiar vocabulary and simple phrases",
  "descriptionFr": "Exprimer des idées et des sentiments en utilisant un vocabulaire familier et des phrases simples",
  "subject": "French Language Arts",
  "grade": 1,
  "strand": "Oral Communication",
  "substrand": "Speaking"
}
```

#### Search Curriculum Expectations

**Endpoint**: `POST /api/curriculum-expectations/search`

```json
{
  "query": "listening comprehension",
  "limit": 10,
  "filters": {
    "subject": "French Language Arts",
    "grade": 1
  }
}
```

#### Get Coverage Report

**Endpoint**: `GET /api/curriculum-expectations/coverage/report`

Query Parameters: `subject`, `grade`, `startDate`, `endDate`

```json
{
  "total": 45,
  "covered": 32,
  "percentage": 71,
  "byStrand": {
    "Oral Communication": { "total": 12, "covered": 8 },
    "Reading": { "total": 15, "covered": 12 }
  },
  "uncovered": [
    {
      "id": "uuid",
      "code": "A1.5",
      "description": "...",
      "strand": "Oral Communication"
    }
  ]
}
```

### Curriculum Import

#### Import Curriculum Document

**Endpoint**: `POST /api/curriculum-import`

**Content-Type**: `multipart/form-data`

| Field   | Type   | Required | Description                    |
| ------- | ------ | -------- | ------------------------------ |
| file    | File   | Yes      | PDF or CSV curriculum document |
| grade   | string | Yes      | Target grade level             |
| subject | string | Yes      | Subject area                   |

---

## 📅 Planning Management

### Long-Range Plans

#### Get Long-Range Plans

**Endpoint**: `GET /api/long-range-plans`

```json
[
  {
    "id": "uuid",
    "title": "Grade 1 French Language Arts - Year Plan",
    "academicYear": "2024-2025",
    "grade": 1,
    "subject": "French Language Arts",
    "description": "Annual planning for Grade 1 FLA curriculum",
    "unitPlans": [],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

#### Create Long-Range Plan

**Endpoint**: `POST /api/long-range-plans`

```json
{
  "title": "Grade 1 French Language Arts - Year Plan",
  "academicYear": "2024-2025",
  "grade": 1,
  "subject": "French Language Arts",
  "description": "Focus on oral communication development"
}
```

### Unit Plans

#### Get Unit Plans

**Endpoint**: `GET /api/unit-plans`

#### Create Unit Plan

**Endpoint**: `POST /api/unit-plans`

```json
{
  "title": "Winter Theme Unit",
  "longRangePlanId": "uuid",
  "startDate": "2024-01-15",
  "endDate": "2024-02-09",
  "description": "Exploring winter through vocabulary, stories, and activities",
  "estimatedHours": 20
}
```

### ETFO Lesson Plans

#### Get Lesson Plans

**Endpoint**: `GET /api/etfo-lesson-plans`

#### Create Lesson Plan

**Endpoint**: `POST /api/etfo-lesson-plans`

```json
{
  "title": "Winter Vocabulary Introduction",
  "unitPlanId": "uuid",
  "date": "2024-01-15",
  "duration": 60,
  "learningGoals": ["Students will learn 10 winter vocabulary words"],
  "successCriteria": ["Can use winter words in sentences"],
  "materials": ["flashcards", "whiteboard", "winter images"],
  "mindsOnActivities": "Quick winter word association game",
  "actionActivities": "Interactive vocabulary practice",
  "consolidationActivities": "Winter word bingo",
  "assessmentStrategy": "Observe student participation and vocabulary usage",
  "differentiation": "Visual supports for ELL students",
  "expectationIds": ["uuid1", "uuid2"]
}
```

### Daybook Entries

#### Get Daybook Entries

**Endpoint**: `GET /api/daybook-entries`

#### Create Daybook Entry

**Endpoint**: `POST /api/daybook-entries`

```json
{
  "date": "2024-01-15",
  "lessonPlanId": "uuid",
  "reflectionNotes": "Students were very engaged with winter vocabulary. Need more visual supports for ELL students.",
  "completionStatus": "completed",
  "nextSteps": "Review vocabulary tomorrow, add action words"
}
```

---

## 🤖 AI-Powered Features

### AI Activity Generation

#### Generate Activities

**Endpoint**: `POST /api/ai-activities/generate`

```json
{
  "searchQuery": "winter vocabulary games",
  "lessonContext": {
    "title": "Winter Vocabulary",
    "grade": 1,
    "subject": "French Language Arts",
    "learningGoals": ["Learn winter vocabulary"],
    "duration": 30,
    "section": "action"
  },
  "specificRequirements": {
    "activityType": "game",
    "materials": ["low-cost", "classroom-friendly"],
    "groupSize": "whole class",
    "language": "fr"
  },
  "useSearchResults": true
}
```

#### Response

```json
{
  "activity": {
    "title": "Bingo d'hiver",
    "description": "Interactive bingo game using winter vocabulary words",
    "detailedInstructions": [
      "Distribute bingo cards with winter images",
      "Call out French winter words",
      "Students mark corresponding images",
      "First to complete a line wins"
    ],
    "duration": 30,
    "activityType": "game",
    "materials": ["bingo cards", "winter pictures", "markers"],
    "groupSize": "whole class",
    "learningGoals": ["Recognize winter vocabulary", "Practice listening skills"],
    "assessmentSuggestions": ["Observe student recognition", "Check for understanding"],
    "differentiation": {
      "support": ["Visual cues", "Peer assistance"],
      "extension": ["Create own bingo cards", "Use words in sentences"]
    }
  },
  "searchResults": [
    {
      "title": "Winter Vocabulary Games",
      "source": "Educational Resource",
      "similarity": 0.89
    }
  ]
}
```

#### Enhance Activity

**Endpoint**: `POST /api/ai-activities/enhance`

```json
{
  "activityId": "uuid",
  "enhancements": {
    "addDifferentiation": true,
    "addAssessment": true,
    "adaptForGrade": 2,
    "translateTo": "en"
  }
}
```

#### Save Generated Activity

**Endpoint**: `POST /api/ai-activities/save`

```json
{
  "activity": {
    "title": "Winter Bingo",
    "description": "Interactive vocabulary game",
    "detailedInstructions": ["Step 1", "Step 2"],
    "duration": 30,
    "activityType": "game",
    "materials": ["cards", "markers"],
    "groupSize": "whole class",
    "learningGoals": ["Vocabulary recognition"],
    "assessmentSuggestions": ["Observation"],
    "differentiation": {
      "support": ["Visual aids"],
      "extension": ["Create variations"]
    }
  },
  "metadata": {
    "lessonPlanId": "uuid",
    "basedOnActivities": ["uuid1", "uuid2"]
  }
}
```

### AI Planning Assistant

#### Generate Lesson Plan

**Endpoint**: `POST /api/ai-planning/generate-lesson`

```json
{
  "unitPlanId": "uuid",
  "lessonTitle": "Winter Animals",
  "duration": 60,
  "learningGoals": ["Identify winter animals", "Use descriptive vocabulary"],
  "expectationIds": ["uuid1", "uuid2"],
  "preferences": {
    "includeTechnology": false,
    "activityTypes": ["hands-on", "interactive"],
    "language": "fr"
  }
}
```

#### Get AI Status

**Endpoint**: `GET /api/ai/status`

```json
{
  "status": "operational",
  "services": {
    "activityGeneration": "available",
    "lessonPlanning": "available",
    "contentTranslation": "available"
  },
  "limits": {
    "requestsPerHour": 100,
    "remaining": 95
  }
}
```

---

## 👥 Student Management

### Students

#### Get Students

**Endpoint**: `GET /api/students`

```json
[
  {
    "id": 1,
    "firstName": "Marie",
    "lastName": "Dupont",
    "grade": 1,
    "enrollmentDate": "2024-09-01",
    "accommodations": ["Visual supports", "Extended time"],
    "artifacts": [],
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

#### Create Student

**Endpoint**: `POST /api/students`

```json
{
  "firstName": "Pierre",
  "lastName": "Martin",
  "grade": 1,
  "enrollmentDate": "2024-09-01",
  "accommodations": ["Quiet workspace"]
}
```

### Student Artifacts

#### Create Artifact

**Endpoint**: `POST /api/students/:id/artifacts`

```json
{
  "title": "Winter Drawing",
  "description": "Student's artwork depicting winter scene",
  "artifactType": "artwork",
  "subject": "Art",
  "dateCreated": "2024-01-15",
  "reflectionNotes": "Shows understanding of winter elements"
}
```

---

## 📬 Communication System

### Parent Newsletters

#### Generate Newsletter

**Endpoint**: `POST /api/newsletters/generate-newsletter`

```json
{
  "studentIds": [1, 2, 3],
  "from": "2024-01-15T00:00:00Z",
  "to": "2024-01-19T23:59:59Z",
  "tone": "friendly",
  "focusAreas": ["vocabulary", "math"],
  "includeArtifacts": true,
  "includeReflections": true,
  "includeLearningGoals": true,
  "includeUpcomingEvents": true
}
```

#### Response

```json
{
  "newsletter": {
    "title": "Weekly Learning Update - January 15-19",
    "titleFr": "Mise à jour hebdomadaire - 15-19 janvier",
    "sections": [
      {
        "id": "learning-highlights",
        "title": "Learning Highlights",
        "titleFr": "Points forts de l'apprentissage",
        "content": "This week, students explored winter vocabulary...",
        "contentFr": "Cette semaine, les élèves ont exploré le vocabulaire d'hiver...",
        "isEditable": true,
        "order": 1
      }
    ],
    "studentIds": [1, 2, 3],
    "dateFrom": "2024-01-15T00:00:00Z",
    "dateTo": "2024-01-19T23:59:59Z"
  }
}
```

#### Save Newsletter

**Endpoint**: `POST /api/newsletters/save`

```json
{
  "title": "Weekly Update",
  "titleFr": "Mise à jour hebdomadaire",
  "studentIds": [1, 2, 3],
  "dateFrom": "2024-01-15T00:00:00Z",
  "dateTo": "2024-01-19T23:59:59Z",
  "tone": "friendly",
  "sections": [
    {
      "id": "highlights",
      "title": "This Week's Learning",
      "titleFr": "L'apprentissage de cette semaine",
      "content": "Students learned...",
      "contentFr": "Les élèves ont appris...",
      "isEditable": true,
      "order": 1
    }
  ],
  "isDraft": true
}
```

### Parent Summary

#### Generate Parent Summary

**Endpoint**: `POST /api/parent-summary/generate`

```json
{
  "studentId": 1,
  "dateRange": {
    "from": "2024-01-01",
    "to": "2024-01-31"
  },
  "includeArtifacts": true,
  "includeReflections": true,
  "language": "both"
}
```

---

## 🔍 Activity Discovery

### Search Activities

**Endpoint**: `GET /api/activities/search`

Query Parameters:

- `query`: Search term
- `gradeLevel`: Grade level filter
- `subject`: Subject filter
- `language`: Language preference (fr/en)
- `limit`: Results limit

```json
{
  "activities": [
    {
      "id": "uuid",
      "title": "Winter Vocabulary Bingo",
      "description": "Interactive vocabulary game",
      "source": "Teachers Pay Teachers",
      "grade": 1,
      "subject": "French Language Arts",
      "language": "fr",
      "similarity": 0.92
    }
  ],
  "totalCount": 150,
  "sources": ["TeachersPayTeachers", "Ontario Curriculum", "Open Educational Resources"]
}
```

### Activity Collections

#### Get Collections

**Endpoint**: `GET /api/activity-collections`

#### Create Collection

**Endpoint**: `POST /api/activity-collections`

```json
{
  "name": "Winter Theme Activities",
  "description": "Collection of winter-themed learning activities",
  "activityIds": ["uuid1", "uuid2", "uuid3"],
  "isPublic": false
}
```

---

## 📊 Progress and Analytics

### ETFO Progress Tracking

#### Get Progress Overview

**Endpoint**: `GET /api/etfo/progress`

```json
{
  "curriculum": {
    "totalExpectations": 95,
    "covered": 67,
    "inProgress": 15,
    "notStarted": 13,
    "completionPercentage": 70.5
  },
  "planning": {
    "longRangePlans": 3,
    "unitPlans": 12,
    "lessonPlans": 45,
    "daybookEntries": 42
  },
  "bySubject": [
    {
      "subject": "French Language Arts",
      "totalExpectations": 45,
      "covered": 32,
      "completionPercentage": 71.1
    }
  ]
}
```

#### Get Subject Breakdown

**Endpoint**: `GET /api/etfo/subjects/:subject/progress`

---

## 🔧 Batch Processing

### Batch API

#### Submit Batch Request

**Endpoint**: `POST /api/batch`

```json
{
  "requests": [
    {
      "id": "req1",
      "method": "GET",
      "url": "/api/curriculum-expectations",
      "headers": {}
    },
    {
      "id": "req2",
      "method": "POST",
      "url": "/api/students",
      "headers": { "Content-Type": "application/json" },
      "body": { "firstName": "Jean", "lastName": "Doe" }
    }
  ]
}
```

#### Response

```json
{
  "responses": [
    {
      "id": "req1",
      "status": 200,
      "body": [...],
      "headers": {}
    },
    {
      "id": "req2",
      "status": 201,
      "body": {...},
      "headers": {}
    }
  ]
}
```

---

## 🔔 Notifications

### Get Notifications

**Endpoint**: `GET /api/notifications`

```json
[
  {
    "id": "uuid",
    "type": "curriculum_update",
    "title": "New Curriculum Expectations Available",
    "message": "Grade 1 French Language Arts curriculum has been updated",
    "isRead": false,
    "createdAt": "2024-01-15T10:00:00Z",
    "actionUrl": "/curriculum-expectations?grade=1"
  }
]
```

### Mark as Read

**Endpoint**: `PUT /api/notifications/:id/read`

---

## 🤝 Collaboration Features

### Teams

#### Get Teams

**Endpoint**: `GET /api/teams`

#### Create Team

**Endpoint**: `POST /api/teams`

```json
{
  "name": "Grade 1 Teaching Team",
  "description": "Collaborative team for Grade 1 teachers",
  "memberEmails": ["teacher1@school.ca", "teacher2@school.ca"]
}
```

### Sharing

#### Share Resource

**Endpoint**: `POST /api/sharing/share`

```json
{
  "resourceType": "lesson-plan",
  "resourceId": "uuid",
  "recipientEmails": ["colleague@school.ca"],
  "permissions": ["read", "comment"],
  "message": "Here's the winter vocabulary lesson we discussed"
}
```

### Comments

#### Add Comment

**Endpoint**: `POST /api/comments`

```json
{
  "resourceType": "lesson-plan",
  "resourceId": "uuid",
  "content": "Great activity! My students loved the winter bingo game.",
  "parentCommentId": null
}
```

---

## ⚠️ Error Handling

For comprehensive bug tracking and troubleshooting guidance, see [Bug Reference Guide](./BUG_REFERENCE.md).

### Standard Error Response

```json
{
  "status": "error",
  "message": "Request validation failed",
  "code": "VALIDATION_ERROR"
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

| Code                 | Description               |
| -------------------- | ------------------------- |
| VALIDATION_ERROR     | Request validation failed |
| AUTHENTICATION_ERROR | Authentication failed     |
| AUTHORIZATION_ERROR  | Insufficient permissions  |
| NOT_FOUND            | Resource not found        |
| CONFLICT             | Resource already exists   |
| RATE_LIMIT           | Too many requests         |

---

## 🔧 API Integration Troubleshooting

This section provides comprehensive guidance for resolving common integration issues when working with the Teaching Engine 2.0 API.

### 🔐 Common Authentication Issues

#### Cookie Handling Problems

**Problem**: Authentication cookies not being sent or received properly.

**Root Causes**:

- Browser security policies blocking cookies
- Incorrect cookie domain or path settings
- Missing `credentials: 'include'` in fetch requests
- HTTP/HTTPS mixed content issues

**Solutions**:

1. **Frontend Cookie Configuration**:

```javascript
// Correct way to make authenticated requests
const response = await fetch('/api/curriculum-expectations', {
  method: 'GET',
  credentials: 'include', // Essential for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});
```

2. **Axios Configuration**:

```javascript
// Global axios configuration
axios.defaults.withCredentials = true;

// Or per-request
const response = await axios.get('/api/students', {
  withCredentials: true,
});
```

3. **Development Environment Setup**:

```javascript
// For cross-origin requests in development
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password }),
});
```

**Prevention**:

- Always set `credentials: 'include'` or `withCredentials: true`
- Ensure consistent protocol (HTTP/HTTPS) across requests
- Check browser console for CORS-related cookie errors

#### Token Expiration Issues

**Problem**: Requests failing with 401 errors due to expired tokens.

**Root Causes**:

- Access token expired (24-hour lifetime)
- Refresh token expired (7-day lifetime)
- No automatic token refresh mechanism

**Solutions**:

1. **Implement Token Refresh Logic**:

```javascript
class APIClient {
  async makeRequest(url, options = {}) {
    let response = await fetch(url, {
      ...options,
      credentials: 'include',
    });

    // If token expired, try to refresh
    if (response.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry original request
        response = await fetch(url, {
          ...options,
          credentials: 'include',
        });
      }
    }

    return response;
  }

  async refreshToken() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      return response.ok;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }
}
```

2. **React Hook for Authentication**:

```javascript
function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        setIsAuthenticated(response.ok);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated };
}
```

**Prevention**:

- Implement automatic token refresh
- Check authentication status before critical requests
- Handle 401 responses gracefully with user feedback

#### CORS Configuration Issues

**Problem**: Cross-origin requests blocked by browser.

**Root Causes**:

- Missing or incorrect CORS headers
- Preflight request failures
- Credential-enabled requests without proper CORS setup

**Solutions**:

1. **Server-Side CORS Configuration** (for reference):

```javascript
// Express.js CORS setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
```

2. **Frontend Request Handling**:

```javascript
// Handle CORS preflight for complex requests
const response = await fetch('/api/ai-activities/generate', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestData),
});
```

**Prevention**:

- Use same-origin requests when possible
- Ensure proper CORS configuration in production
- Test cross-origin scenarios in development

### 📝 API Request Problems

#### Malformed Request Issues

**Problem**: Requests failing with 400 Bad Request errors.

**Root Causes**:

- Incorrect JSON formatting
- Missing required headers
- Invalid data types in request body
- Encoding issues

**Solutions**:

1. **Request Validation Helper**:

```javascript
function validateRequest(data, schema) {
  const errors = [];

  if (schema.required) {
    schema.required.forEach((field) => {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });
  }

  if (schema.types) {
    Object.keys(schema.types).forEach((field) => {
      if (data[field] && typeof data[field] !== schema.types[field]) {
        errors.push(`Invalid type for ${field}: expected ${schema.types[field]}`);
      }
    });
  }

  return errors;
}

// Usage
const schema = {
  required: ['title', 'grade', 'subject'],
  types: {
    grade: 'number',
    estimatedHours: 'number',
  },
};

const errors = validateRequest(unitPlanData, schema);
if (errors.length > 0) {
  console.error('Validation errors:', errors);
  return;
}
```

2. **Request Builder Pattern**:

```javascript
class RequestBuilder {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  setHeaders(headers) {
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  async post(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.headers,
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Request failed: ${error.message}`);
    }

    return response.json();
  }
}
```

**Prevention**:

- Use TypeScript or JSON schema validation
- Implement request interceptors for consistent formatting
- Log request/response data during development

#### Validation Error Handling

**Problem**: Server returning validation errors for seemingly correct data.

**Root Causes**:

- Data type mismatches
- Missing nested object properties
- Date format inconsistencies
- Field length restrictions

**Solutions**:

1. **Comprehensive Error Handler**:

```javascript
function handleValidationErrors(error) {
  if (error.code === 'VALIDATION_ERROR') {
    if (error.details) {
      error.details.forEach((detail) => {
        console.error(`Field: ${detail.field}, Error: ${detail.message}`);
      });
    }

    // Show user-friendly messages
    const userMessage = error.details
      .map((detail) => `${detail.field}: ${detail.message}`)
      .join(', ');

    alert(`Please fix the following: ${userMessage}`);
  }
}

// Usage
try {
  const response = await fetch('/api/unit-plans', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(unitPlanData),
  });

  if (!response.ok) {
    const error = await response.json();
    handleValidationErrors(error);
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

2. **Data Sanitization Helper**:

```javascript
function sanitizeData(data) {
  const sanitized = { ...data };

  // Convert date strings to proper format
  if (sanitized.startDate) {
    sanitized.startDate = new Date(sanitized.startDate).toISOString().split('T')[0];
  }

  // Ensure numeric fields are numbers
  if (sanitized.grade && typeof sanitized.grade === 'string') {
    sanitized.grade = parseInt(sanitized.grade, 10);
  }

  // Remove empty strings and null values
  Object.keys(sanitized).forEach((key) => {
    if (sanitized[key] === '' || sanitized[key] === null) {
      delete sanitized[key];
    }
  });

  return sanitized;
}
```

**Prevention**:

- Implement client-side validation matching server rules
- Use form libraries with built-in validation
- Test with edge cases and invalid data

### 📊 Response Handling Issues

#### JSON Parsing Errors

**Problem**: Response parsing failing with JSON syntax errors.

**Root Causes**:

- Server returning HTML error pages instead of JSON
- Malformed JSON responses
- Empty response bodies
- Character encoding issues

**Solutions**:

1. **Safe JSON Parser**:

```javascript
async function safeJsonParse(response) {
  const contentType = response.headers.get('content-type');

  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Expected JSON but received: ${contentType || 'unknown'}\nContent: ${text}`);
  }

  try {
    return await response.json();
  } catch (error) {
    const text = await response.text();
    throw new Error(`JSON parse error: ${error.message}\nContent: ${text}`);
  }
}

// Usage
const response = await fetch('/api/students');
const data = await safeJsonParse(response);
```

2. **Response Interceptor**:

```javascript
function createAPIClient() {
  return {
    async request(url, options = {}) {
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        ...options,
      });

      // Handle different response types
      if (response.status === 204) {
        return null; // No content
      }

      if (!response.ok) {
        const error = await safeJsonParse(response);
        throw new APIError(error.message, response.status, error.code);
      }

      return await safeJsonParse(response);
    },
  };
}
```

**Prevention**:

- Always check response content type
- Handle empty responses gracefully
- Implement proper error response formatting on server

#### Timeout Issues

**Problem**: Requests timing out before completion.

**Root Causes**:

- Long-running AI operations
- Large file uploads
- Network connectivity issues
- Server overload

**Solutions**:

1. **Request Timeout Handler**:

```javascript
function withTimeout(promise, timeout = 30000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    }),
  ]);
}

// Usage for long-running operations
const generateActivity = async (data) => {
  try {
    const response = await withTimeout(
      fetch('/api/ai-activities/generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      60000, // 60 seconds for AI operations
    );

    return await response.json();
  } catch (error) {
    if (error.message === 'Request timeout') {
      throw new Error('The AI service is taking longer than expected. Please try again.');
    }
    throw error;
  }
};
```

2. **Retry Logic with Exponential Backoff**:

```javascript
async function retryRequest(requestFn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = Math.pow(2, i) * 1000; // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
```

**Prevention**:

- Set appropriate timeouts for different operation types
- Implement progress indicators for long operations
- Use chunked processing for large datasets

### 🚦 Rate Limiting Issues

#### Rate Limit Exceeded Errors

**Problem**: Receiving 429 Too Many Requests errors.

**Root Causes**:

- Too many concurrent requests
- Burst limit exceeded
- Hourly rate limit reached
- No rate limit handling

**Solutions**:

1. **Rate Limit Handler**:

```javascript
class RateLimitedClient {
  constructor() {
    this.requestQueue = [];
    this.isProcessing = false;
    this.rateLimitInfo = {};
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ url, options, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const { url, options, resolve, reject } = this.requestQueue.shift();

      try {
        const response = await fetch(url, {
          ...options,
          credentials: 'include',
        });

        // Update rate limit info
        this.updateRateLimitInfo(response.headers);

        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after') || 60;
          await this.delay(retryAfter * 1000);

          // Re-queue the request
          this.requestQueue.unshift({ url, options, resolve, reject });
          continue;
        }

        resolve(response);
      } catch (error) {
        reject(error);
      }

      // Respect rate limits
      if (this.rateLimitInfo.remaining < 10) {
        await this.delay(1000); // Wait 1 second between requests
      }
    }

    this.isProcessing = false;
  }

  updateRateLimitInfo(headers) {
    this.rateLimitInfo = {
      limit: headers.get('x-ratelimit-limit'),
      remaining: headers.get('x-ratelimit-remaining'),
      reset: headers.get('x-ratelimit-reset'),
    };
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

2. **Batch Processing for Multiple Requests**:

```javascript
async function batchRequests(requests, batchSize = 5) {
  const results = [];

  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (request) => {
        try {
          const response = await fetch(request.url, {
            ...request.options,
            credentials: 'include',
          });
          return await response.json();
        } catch (error) {
          return { error: error.message };
        }
      }),
    );

    results.push(...batchResults);

    // Wait between batches
    if (i + batchSize < requests.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}
```

**Prevention**:

- Implement request queuing
- Use the batch API for multiple operations
- Monitor rate limit headers
- Implement intelligent retry strategies

### 🌐 Network Issues

#### Connectivity Problems

**Problem**: Requests failing due to network connectivity issues.

**Root Causes**:

- Intermittent network connection
- DNS resolution failures
- Proxy configuration issues
- Firewall blocking requests

**Solutions**:

1. **Network Status Monitor**:

```javascript
class NetworkMonitor {
  constructor() {
    this.isOnline = navigator.onLine;
    this.requestQueue = [];

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueuedRequests();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async makeRequest(url, options = {}) {
    if (!this.isOnline) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push({ url, options, resolve, reject });
      });
    }

    try {
      return await fetch(url, {
        ...options,
        credentials: 'include',
      });
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        // Network error - queue for retry
        return new Promise((resolve, reject) => {
          this.requestQueue.push({ url, options, resolve, reject });
        });
      }
      throw error;
    }
  }

  async processQueuedRequests() {
    while (this.requestQueue.length > 0 && this.isOnline) {
      const { url, options, resolve, reject } = this.requestQueue.shift();

      try {
        const response = await fetch(url, {
          ...options,
          credentials: 'include',
        });
        resolve(response);
      } catch (error) {
        reject(error);
      }
    }
  }
}
```

2. **Connection Health Check**:

```javascript
async function checkConnectivity() {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      cache: 'no-cache',
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Usage
setInterval(async () => {
  const isConnected = await checkConnectivity();
  if (!isConnected) {
    console.warn('API connectivity issues detected');
    // Show user notification
  }
}, 30000); // Check every 30 seconds
```

**Prevention**:

- Implement offline capability where possible
- Use service workers for request caching
- Provide clear user feedback about connectivity status

### 🔍 Data Validation Issues

#### Schema Validation Errors

**Problem**: Data not matching expected schema format.

**Root Causes**:

- Missing required fields
- Incorrect data types
- Invalid field formats
- Nested object structure issues

**Solutions**:

1. **Client-Side Schema Validator**:

```javascript
function createValidator(schema) {
  return function validate(data) {
    const errors = [];

    // Check required fields
    if (schema.required) {
      schema.required.forEach((field) => {
        if (!data.hasOwnProperty(field) || data[field] === undefined || data[field] === null) {
          errors.push(`Missing required field: ${field}`);
        }
      });
    }

    // Check data types
    if (schema.properties) {
      Object.keys(schema.properties).forEach((field) => {
        if (data[field] !== undefined) {
          const expectedType = schema.properties[field].type;
          const actualType = Array.isArray(data[field]) ? 'array' : typeof data[field];

          if (actualType !== expectedType) {
            errors.push(`Invalid type for ${field}: expected ${expectedType}, got ${actualType}`);
          }
        }
      });
    }

    // Check format constraints
    if (schema.formats) {
      Object.keys(schema.formats).forEach((field) => {
        if (data[field] && !schema.formats[field].test(data[field])) {
          errors.push(`Invalid format for ${field}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };
}

// Schema definitions
const lessonPlanSchema = {
  required: ['title', 'unitPlanId', 'date', 'duration'],
  properties: {
    title: { type: 'string' },
    unitPlanId: { type: 'string' },
    date: { type: 'string' },
    duration: { type: 'number' },
    learningGoals: { type: 'array' },
    materials: { type: 'array' },
  },
  formats: {
    date: /^\d{4}-\d{2}-\d{2}$/,
    unitPlanId: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  },
};

// Usage
const validator = createValidator(lessonPlanSchema);
const result = validator(lessonPlanData);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

2. **Data Transformation Helper**:

```javascript
function transformData(data, transformations) {
  const transformed = { ...data };

  Object.keys(transformations).forEach((field) => {
    const transform = transformations[field];

    if (transformed[field] !== undefined) {
      switch (transform.type) {
        case 'date':
          transformed[field] = new Date(transformed[field]).toISOString().split('T')[0];
          break;
        case 'number':
          transformed[field] = Number(transformed[field]);
          break;
        case 'array':
          if (typeof transformed[field] === 'string') {
            transformed[field] = transformed[field].split(',').map((s) => s.trim());
          }
          break;
      }
    }
  });

  return transformed;
}

// Usage
const transformations = {
  grade: { type: 'number' },
  startDate: { type: 'date' },
  materials: { type: 'array' },
};

const transformedData = transformData(formData, transformations);
```

**Prevention**:

- Use TypeScript for compile-time type checking
- Implement form validation libraries
- Create reusable validation schemas

### 🔨 Integration Examples

#### Complete Authentication Flow

```javascript
class TeachingEngineAPI {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
    this.isAuthenticated = false;
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      this.isAuthenticated = true;
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async checkSession() {
    try {
      const response = await fetch(`${this.baseURL}/auth/me`, {
        credentials: 'include',
      });

      this.isAuthenticated = response.ok;
      return response.ok ? await response.json() : null;
    } catch (error) {
      this.isAuthenticated = false;
      return null;
    }
  }

  async makeAuthenticatedRequest(endpoint, options = {}) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      this.isAuthenticated = false;
      throw new Error('Session expired');
    }

    return response;
  }
}
```

#### Curriculum Management Integration

```javascript
class CurriculumManager {
  constructor(apiClient) {
    this.api = apiClient;
  }

  async searchExpectations(filters = {}) {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await this.api.makeAuthenticatedRequest(
      `/curriculum-expectations?${queryParams}`,
    );

    return await response.json();
  }

  async createExpectation(data) {
    const validator = createValidator(expectationSchema);
    const validation = validator(data);

    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const response = await this.api.makeAuthenticatedRequest('/curriculum-expectations', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return await response.json();
  }

  async getCoverageReport(filters) {
    const queryParams = new URLSearchParams(filters);

    const response = await this.api.makeAuthenticatedRequest(
      `/curriculum-expectations/coverage/report?${queryParams}`,
    );

    return await response.json();
  }
}
```

#### AI Integration with Error Handling

```javascript
class AIAssistant {
  constructor(apiClient) {
    this.api = apiClient;
  }

  async generateActivity(request) {
    try {
      const response = await this.api.makeAuthenticatedRequest('/ai-activities/generate', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Activity generation failed');
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('rate limit')) {
        throw new Error('AI service is currently busy. Please try again in a few minutes.');
      }

      if (error.message.includes('timeout')) {
        throw new Error('AI generation is taking longer than expected. Please try again.');
      }

      throw error;
    }
  }

  async checkAIStatus() {
    try {
      const response = await this.api.makeAuthenticatedRequest('/ai/status');
      return await response.json();
    } catch (error) {
      return {
        status: 'unavailable',
        message: 'Unable to check AI service status',
      };
    }
  }
}
```

### 🔗 Cross-References

- **Authentication Details**: See [Authentication](#-authentication) section
- **Error Codes**: See [Error Handling](#️-error-handling) section
- **Rate Limits**: See [Rate Limiting](#-rate-limiting) section
- **Bug Tracking**: See [Bug Reference Guide](./BUG_REFERENCE.md)
- **Data Schemas**: See [Database Schemas](../SCHEMAS.md)

### 📋 Quick Troubleshooting Checklist

**Before Opening Support Issues:**

1. **Authentication**:
   - [ ] Check if `credentials: 'include'` is set
   - [ ] Verify cookies are being sent
   - [ ] Test with `/api/auth/me` endpoint

2. **Request Format**:
   - [ ] Content-Type header is set to `application/json`
   - [ ] Request body is valid JSON
   - [ ] Required fields are present

3. **Network**:
   - [ ] Check browser console for CORS errors
   - [ ] Verify API endpoint URLs are correct
   - [ ] Test with simple GET request first

4. **Data Validation**:
   - [ ] Check field data types match expectations
   - [ ] Verify date formats are YYYY-MM-DD
   - [ ] Ensure UUIDs are properly formatted

5. **Error Handling**:
   - [ ] Check response status codes
   - [ ] Parse error messages from response body
   - [ ] Implement retry logic for 429 errors

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

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1642694400
```

---

## 🔍 Health and Monitoring

### Health Check

**Endpoint**: `GET /api/health`

```json
{
  "status": "ok"
}
```

### Detailed Health Check

**Endpoint**: `GET /api/health/detailed`

```json
{
  "status": "ok",
  "services": {
    "database": "healthy",
    "ai": "healthy",
    "embeddings": "healthy"
  },
  "performance": {
    "averageResponseTime": 120,
    "errorRate": 0.001
  }
}
```

### Service Health

**Endpoint**: `GET /api/health/services`

```json
{
  "healthy": true,
  "services": [
    {
      "name": "database",
      "status": "healthy",
      "lastCheck": "2024-01-15T15:30:00Z"
    },
    {
      "name": "ai-service",
      "status": "healthy",
      "lastCheck": "2024-01-15T15:30:00Z"
    }
  ]
}
```

---

## 📚 Additional Resources

### Related Documentation

- **Data Flow Architecture**: See `../DATA_FLOW.md`
- **Database Schemas**: See `../SCHEMAS.md`
- **Development Setup**: See `../ROADMAP.md`

### Security Features

- HTTP-only cookie authentication
- CSRF protection on form submissions
- Input sanitization and validation
- Rate limiting per endpoint category
- Advanced XSS protection

### File Upload Support

- Curriculum documents (PDF, CSV)
- Student artifacts (images, documents)
- Resource materials
- Maximum file size: 10MB
- Supported formats: PDF, CSV, JPG, PNG, DOCX

---

_This API reference covers the complete endpoints of Teaching Engine 2.0 based on the actual implementation. All endpoints require HTTP-only cookie authentication unless otherwise specified. For additional implementation details or specific integration questions, refer to the project repository._
