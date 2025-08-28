# Student Assessment System API Documentation

## Overview

This API provides ETFO-compliant student assessment tracking for Grade 1 French Immersion classrooms. The system supports the 4-level Growing Success framework with evidence triangulation.

**Base URL**: `http://localhost:3000/api`

## Authentication

All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Core Concepts

- **ETFO Levels**: NOT_YET → APPROACHING → MEETING → EXCEEDING
- **Evidence Types**: OBSERVATION, CONVERSATION, PRODUCT
- **Artifacts**: Photos, videos, audio, documents, and notes
- **Storage Quota**: 5GB per student
- **Processing**: Asynchronous with job queues

## Endpoints

### Students Management

#### List Students
```http
GET /api/students
```

Response:
```json
{
  "students": [
    {
      "id": "clx123",
      "firstName": "Emma",
      "lastName": "Johnson",
      "studentId": "EJ001",
      "grade": "1",
      "email": "emma.j@school.ca",
      "artifactCount": 15,
      "createdAt": "2024-08-15T10:00:00.000Z"
    }
  ],
  "total": 25
}
```

#### Create Student
```http
POST /api/students
Content-Type: application/json

{
  "firstName": "Emma",
  "lastName": "Johnson", 
  "studentId": "EJ001",
  "grade": "1",
  "email": "emma.j@school.ca",
  "parentEmail": "johnson.family@email.ca",
  "notes": "Speaks French at home"
}
```

#### Bulk Import Students (CSV)
```http
POST /api/students/import/csv
Content-Type: multipart/form-data

csvFile: [CSV file with headers: firstName,lastName,studentId,grade,email,parentEmail,notes]
skipDuplicates: true
updateExisting: false
```

#### Get CSV Template
```http
GET /api/students/template/csv
```
Downloads: `student_import_template.csv`

#### Export Students to CSV
```http
GET /api/students/export/csv
```
Downloads: `students_2024-08-27.csv`

### Storage Quota Management

#### Class Quota Report
```http
GET /api/students/quota/report
```

Response:
```json
{
  "summary": {
    "totalStudents": 25,
    "totalUsage": "2.3 GB",
    "averageUsage": "9.2%", 
    "studentsOverWarning": 2,
    "studentsOverCritical": 0,
    "studentsOverQuota": 0
  },
  "students": [
    {
      "studentId": "clx123",
      "studentName": "Emma Johnson",
      "totalUsage": "450.2 MB",
      "usagePercent": 9.0,
      "status": "OK",
      "artifactCount": 15
    }
  ]
}
```

#### Individual Student Quota
```http
GET /api/students/{studentId}/quota
```

Response:
```json
{
  "studentId": "clx123",
  "studentName": "Emma Johnson",
  "totalUsage": "450.2 MB",
  "quota": "5.0 GB",
  "usagePercent": 9.0,
  "status": "OK",
  "largestFiles": [
    {
      "id": "artifact123",
      "title": "Math Journal Video",
      "size": "25.3 MB",
      "type": "VIDEO",
      "date": "2024-08-20T14:30:00.000Z"
    }
  ]
}
```

### Artifacts (Student Work)

#### Upload Photo
```http
POST /api/artifacts/upload/photo
Content-Type: multipart/form-data

photo: [image file]
studentId: clx123
title: "Math Problem Solving"
description: "Student explaining their strategy"
outcomes: [
  {
    "outcomeId": "math-ns-1-1",
    "evidenceType": "PRODUCT",
    "teacherNote": "Shows understanding of number concepts",
    "confidenceLevel": "HIGH"
  }
]
```

Response:
```json
{
  "id": "artifact123",
  "title": "Math Problem Solving",
  "artifactType": "PHOTO",
  "filePath": "/uploads/artifacts/images/12345_photo.jpg",
  "url": "https://storage.example.com/...",
  "processingStatus": "PENDING",
  "dateCollected": "2024-08-27T10:30:00.000Z",
  "createdAt": "2024-08-27T10:30:00.000Z"
}
```

#### Upload Video
```http
POST /api/artifacts/upload/video
Content-Type: multipart/form-data

video: [video file]
studentId: clx123
title: "French Oral Presentation"
description: "Student presenting about their family"
```

#### Upload Audio
```http
POST /api/artifacts/upload/audio
Content-Type: multipart/form-data

audio: [audio file]
studentId: clx123
title: "Reading Assessment"
description: "Student reading French text aloud"
```

#### Upload Document
```http
POST /api/artifacts/upload/document
Content-Type: multipart/form-data

document: [PDF, DOC, or TXT file]
studentId: clx123
title: "Written Work Sample"
description: "Student's creative writing assignment"
```

#### Batch Upload
```http
POST /api/artifacts/upload/batch
Content-Type: multipart/form-data

files: [multiple files]
studentId: clx123
titles: ["Work 1", "Work 2"]
descriptions: ["First sample", "Second sample"]
```

#### Get Artifact Details
```http
GET /api/artifacts/{artifactId}
```

Response:
```json
{
  "id": "artifact123",
  "title": "Math Problem Solving",
  "description": "Student explaining their strategy",
  "artifactType": "PHOTO",
  "fileName": "math_work.jpg",
  "fileSize": 2048576,
  "mimeType": "image/jpeg",
  "fileUrl": "https://storage.example.com/...",
  "metadata": {
    "dimensions": { "width": 1920, "height": 1080 },
    "processingTime": 1250
  },
  "dateCollected": "2024-08-27T10:30:00.000Z",
  "processingStatus": "COMPLETED",
  "student": {
    "id": "clx123",
    "firstName": "Emma",
    "lastName": "Johnson"
  },
  "outcomes": [
    {
      "outcomeId": "math-ns-1-1",
      "evidenceType": "PRODUCT",
      "teacherNote": "Shows understanding of number concepts",
      "confidenceLevel": "HIGH",
      "outcome": {
        "code": "1.NS.1",
        "description": "Demonstrate understanding of numbers 0-10",
        "subject": "Mathematics"
      }
    }
  ]
}
```

### Progress Reports (PDF Generation)

#### Generate Student Report
```http
GET /api/reports/student/{studentId}?includeArtifacts=true&includeProgressChart=true&subject=Mathematics&startDate=2024-06-01&endDate=2024-08-31
```

Downloads: `Emma_Johnson_Progress_Report_2024-08-27.pdf`

#### Generate Class Report  
```http
GET /api/reports/class?subject=Mathematics&startDate=2024-06-01&endDate=2024-08-31
```

Downloads: `Class_Progress_Overview_2024-08-27.pdf`

#### Available Reports
```http
GET /api/reports/available
```

Response:
```json
{
  "reportTypes": [
    {
      "type": "student",
      "name": "Individual Student Report",
      "description": "Detailed progress report for a specific student",
      "available": true,
      "options": {
        "includeArtifacts": "Include recent work samples",
        "includeProgressChart": "Include visual progress charts"
      }
    }
  ],
  "options": {
    "subjects": ["Mathematics", "Français", "Sciences"],
    "studentCount": 25
  }
}
```

### Mastery Tracking

#### Update Student Progress
```http
POST /api/mastery/update
Content-Type: application/json

{
  "studentId": "clx123",
  "outcomeId": "math-ns-1-1", 
  "currentLevel": "MEETING",
  "areasForGrowth": "Continue practicing counting beyond 10",
  "strengths": "Strong understanding of number recognition",
  "teacherNotes": "Demonstrates mastery consistently",
  "strongestEvidence": {
    "artifactId": "artifact123",
    "evidenceType": "PRODUCT",
    "description": "Math journal showing number work"
  }
}
```

#### Get Progress Overview
```http
GET /api/mastery/student/{studentId}?subject=Mathematics
GET /api/mastery/overview/{studentId}?subject=Mathematics (alias)
```

Response:
```json
{
  "student": {
    "id": "clx123",
    "name": "Emma Johnson"
  },
  "progress": [
    {
      "outcomeId": "math-ns-1-1",
      "currentLevel": "MEETING",
      "previousLevel": "APPROACHING",
      "totalEvidencePieces": 3,
      "lastAssessmentDate": "2024-08-20T00:00:00.000Z",
      "outcome": {
        "code": "1.NS.1",
        "description": "Demonstrate understanding of numbers 0-10",
        "subject": "Mathematics",
        "strand": "Number Sense"
      }
    }
  ],
  "summary": {
    "totalOutcomes": 15,
    "exceeding": 2,
    "meeting": 8, 
    "approaching": 4,
    "notYet": 1
  }
}
```

### System Health and Monitoring

#### Health Check
```http
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-08-27T10:30:00.000Z",
  "services": {
    "database": true,
    "storage": true,
    "queues": true
  },
  "stats": {
    "totalStudents": 25,
    "totalArtifacts": 450,
    "storageUsed": "2.3 GB",
    "queueDepth": 3
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "code": "ERROR_CODE",
  "details": [...] // Optional additional details
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate)
- `413` - Payload Too Large (quota exceeded)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Rate Limits

- **Artifact uploads**: 10 per minute per student
- **Bulk operations**: 5 per hour
- **Report generation**: 3 per 10 minutes
- **General API**: 100 per minute

### File Upload Limits

- **Photos**: 10MB max
- **Videos**: 100MB max  
- **Audio**: 50MB max
- **Documents**: 25MB max
- **CSV imports**: 1MB max

## SDK Examples

### Upload Student Photo with Progress Tracking

```javascript
// Upload file
const formData = new FormData();
formData.append('photo', file);
formData.append('studentId', 'clx123');
formData.append('title', 'Math Problem Solving');

const response = await fetch('/api/artifacts/upload/photo', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log('Upload started:', result.id);

// Check processing status
const checkStatus = async (artifactId) => {
  const statusResponse = await fetch(`/api/artifacts/${artifactId}`);
  const artifact = await statusResponse.json();
  
  if (artifact.processingStatus === 'COMPLETED') {
    console.log('Processing complete:', artifact.thumbnailUrl);
  } else if (artifact.processingStatus === 'FAILED') {
    console.error('Processing failed:', artifact.processingError);
  } else {
    setTimeout(() => checkStatus(artifactId), 2000); // Check again in 2s
  }
};

checkStatus(result.id);
```

### Generate Progress Report

```javascript
const generateReport = async (studentId, options = {}) => {
  const params = new URLSearchParams({
    includeArtifacts: 'true',
    includeProgressChart: 'true',
    ...options
  });
  
  const response = await fetch(`/api/reports/student/${studentId}?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  
  // Download file
  const a = document.createElement('a');
  a.href = url;
  a.download = `student_report_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
};
```

## Production Deployment Notes

### Required Environment Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost:5432/teaching_engine
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secure-secret-key
STORAGE_PATH=/app/uploads
MAX_FILE_SIZE=104857600
```

### Dependencies

- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- FFmpeg (for video processing)
- Sharp (for image processing)

### Performance Characteristics

- **Concurrent uploads**: Handles 25 students uploading simultaneously
- **Response time**: <2 seconds for uploads, <5 seconds for reports
- **Storage**: Automatic cleanup and quota management
- **Reliability**: Transactional safety, automatic retries, circuit breakers

For production deployment, ensure all background services are initialized:

```javascript
import { initializeServices } from './services/initializeServices';
await initializeServices();
```

This will start:
- Bull job queues for async processing
- Cleanup cron jobs for maintenance  
- Health monitoring and alerting
- Error recovery systems