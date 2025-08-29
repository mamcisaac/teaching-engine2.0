# ETFO Student Assessment System Architecture

## Overview
The ETFO Student Assessment System is a comprehensive solution for tracking Grade 1 French Immersion student progress following the Growing Success framework.

## System Architecture

### Core Components

#### 1. Database Layer (PostgreSQL + Prisma)
- **Student**: Core student records with basic information
- **StudentArtifact**: Physical/digital evidence of student work
- **StudentArtifactOutcome**: Links artifacts to curriculum expectations
- **StudentOutcomeProgress**: Tracks mastery levels over time

#### 2. API Layer (Express.js)
- `/api/students` - Student CRUD operations
- `/api/artifacts` - File upload and processing
- `/api/mastery` - Assessment tracking
- `/api/analytics` - Performance metrics
- `/api/reports` - Progress report generation
- `/api/evidence-export` - Data export functionality

#### 3. Processing Layer (Bull + Redis)
- Queue-based file processing
- Async artifact analysis
- Batch operations
- Performance optimization

#### 4. Client Layer (React + TypeScript)
- Student management interface
- Assessment tracking UI
- Analytics dashboards
- Evidence triangulation visualization

## Assessment Framework

### ETFO Growing Success Levels
```typescript
enum MasteryLevel {
  NOT_YET = 'NOT_YET',           // Student hasn't demonstrated understanding
  APPROACHING = 'APPROACHING',    // Beginning to show understanding
  MEETING = 'MEETING',            // Meets grade-level expectations
  EXCEEDING = 'EXCEEDING'        // Exceeds expectations
}
```

### Evidence Triangulation
```typescript
enum EvidenceType {
  OBSERVATION = 'OBSERVATION',   // Teacher observations
  CONVERSATION = 'CONVERSATION', // Student-teacher discussions
  PRODUCT = 'PRODUCT'            // Student work products
}
```

## Data Flow

### Assessment Recording Flow
1. Teacher uploads artifact or records observation
2. System processes file (if applicable)
3. Artifact linked to curriculum expectations
4. Mastery level recorded with evidence type
5. Progress tracked over time
6. Analytics updated in real-time

### Report Generation Flow
1. Teacher requests progress report
2. System aggregates assessment data
3. Evidence triangulation calculated
4. Report generated (PDF/CSV)
5. Export delivered to teacher

## Security & Privacy

### Data Protection
- All student data encrypted at rest
- Secure file upload with validation
- Role-based access control
- Audit logging for compliance

### Privacy Compliance
- No parent portal access
- Local storage only (no cloud sync)
- Teacher-only access model
- PIPEDA compliant design

## Performance Optimization

### Caching Strategy
- Redis for session management
- Query result caching
- Static asset optimization
- CDN for client assets

### Scalability
- Queue-based processing
- Database indexing
- Pagination for large datasets
- Lazy loading for UI components

## Integration Points

### Curriculum Alignment
- Links to PEI curriculum expectations
- Grade 1 French Immersion specific
- Subject-based organization
- Cross-curricular connections

### Export Capabilities
- PDF progress reports
- CSV data exports
- Evidence portfolios
- Analytics summaries

## Feature Flags
```env
FEATURE_STUDENT_ASSESSMENT=true  # Enable assessment features
```

## Technology Stack

### Backend
- Node.js + Express.js
- PostgreSQL + Prisma ORM
- Bull queues + Redis
- TypeScript
- Jest for testing

### Frontend
- React 18
- TypeScript
- Vite bundler
- Tailwind CSS
- React Query

### Infrastructure
- Docker containers
- GitHub Actions CI/CD
- PM2 process management
- Nginx reverse proxy

## Development Guidelines

### Code Organization
```
server/
  ├── routes/          # API endpoints
  ├── services/        # Business logic
  ├── processors/      # Queue processors
  └── middleware/      # Express middleware

client/
  ├── components/      # React components
  ├── services/        # API services
  ├── hooks/          # Custom hooks
  └── types/          # TypeScript types
```

### Testing Strategy
- Unit tests for services
- Integration tests for APIs
- E2E tests with Puppeteer
- Performance benchmarks

## Monitoring & Logging

### Application Metrics
- API response times
- Queue processing rates
- Error rates
- User activity

### System Health
- Database connections
- Redis availability
- Disk usage
- Memory consumption

## Future Enhancements

### Planned Features
- [ ] Bulk assessment entry
- [ ] Voice note attachments
- [ ] Student portfolios
- [ ] Advanced analytics
- [ ] Report templates

### Technical Improvements
- [ ] GraphQL API layer
- [ ] WebSocket real-time updates
- [ ] Offline capability
- [ ] Mobile app