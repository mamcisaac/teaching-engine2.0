# Cross-Agent Requirements for Messenger Features

## Overview

This document outlines features that require implementation by other agents to complete the messenger agent's functionality. Each section includes detailed requirements, API contracts, and integration points.

## 1. Authentication & Security (auth agent)

### Requirements

#### FERPA/COPPA Compliance
- Implement data access controls for parent/student information
- Add consent tracking for minors under 13
- Ensure data retention policies align with educational privacy laws
- Implement audit logging for all data access

#### Data Encryption
```typescript
// Required service methods
interface EncryptionService {
  encryptSensitiveData(data: string): Promise<string>;
  decryptSensitiveData(encrypted: string): Promise<string>;
  encryptFile(buffer: Buffer): Promise<Buffer>;
  decryptFile(buffer: Buffer): Promise<Buffer>;
}
```

#### Audit Trail
```typescript
// Required model in schema.prisma
model AuditLog {
  id          Int      @id @default(autoincrement())
  userId      Int
  action      String   // "view", "create", "update", "delete", "send"
  resource    String   // "parent_contact", "parent_message", "report"
  resourceId  Int?
  metadata    Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([resource, resourceId])
}
```

### Integration Points
- All parent contact CRUD operations must log to audit trail
- Email content must be encrypted at rest
- Report generation must check access permissions
- API endpoints need role-based access control

## 2. AI Integration (ai agent)

### Requirements

#### Enhanced LLM Service
```typescript
// Required enhancements to llmService
interface EnhancedLLMService {
  // Existing method
  generateText(prompt: string, options?: LLMOptions): Promise<string>;
  
  // New methods needed
  generateStructuredData<T>(
    prompt: string, 
    schema: z.ZodSchema<T>,
    options?: LLMOptions
  ): Promise<T>;
  
  translateText(
    text: string,
    fromLang: string,
    toLang: string,
    context?: string
  ): Promise<string>;
  
  scoreContentQuality(
    content: string,
    criteria: QualityCriteria
  ): Promise<QualityScore>;
  
  generatePersonalizedContent(
    template: string,
    studentData: StudentContext,
    options?: PersonalizationOptions
  ): Promise<string>;
}

interface QualityCriteria {
  readability: boolean;
  tone: 'formal' | 'friendly' | 'encouraging';
  gradeLevel: number;
  culturalSensitivity: boolean;
}

interface QualityScore {
  overall: number; // 0-100
  readability: number;
  tone: number;
  appropriateness: number;
  suggestions: string[];
}
```

#### Report Comment Generation
```typescript
// Specific prompts and context needed
interface ReportCommentContext {
  studentName: string;
  subject: string;
  grade: string;
  strengths: string[];
  improvements: string[];
  recentAchievements: string[];
  behaviorNotes?: string[];
  parentConcerns?: string[];
}

// Expected output format
interface GeneratedComment {
  opening: string;      // Positive opening statement
  strengths: string;    // 2-3 sentences on strengths
  improvements: string; // 1-2 sentences on areas to improve
  closing: string;      // Encouraging closing
  nextSteps?: string[]; // Optional specific recommendations
}
```

### Integration Points
- ReportGeneratorService depends on enhanced LLM methods
- Newsletter generation needs quality scoring
- Translation must maintain educational terminology accuracy
- Personalization requires access to student learning profiles

## 3. Mobile/PWA Support (frontend agent)

### Requirements

#### Progressive Web App Setup
```javascript
// Required service worker implementation
// File: /client/public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('te-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/parent-messages',
        '/parent-contacts',
        '/offline.html',
        // Include all critical assets
      ]);
    })
  );
});

// Offline support for viewing messages
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/parent-messages/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((response) => {
          return caches.open('te-dynamic').then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      }).catch(() => {
        return caches.match('/offline.html');
      })
    );
  }
});
```

#### Mobile-Responsive Components
```typescript
// Required responsive utilities
interface ResponsiveConfig {
  breakpoints: {
    mobile: 320;
    tablet: 768;
    desktop: 1024;
  };
  
  // Touch-optimized components needed
  components: {
    'TouchFriendlyButton': React.FC<ButtonProps>;
    'SwipeableMessageList': React.FC<MessageListProps>;
    'MobileNavigation': React.FC<NavProps>;
    'ResponsiveTable': React.FC<TableProps>;
  };
}
```

#### Push Notifications
```typescript
// Required push notification service
interface PushNotificationService {
  requestPermission(): Promise<NotificationPermission>;
  
  subscribeUser(userId: number): Promise<PushSubscription>;
  
  sendNotification(
    userId: number,
    notification: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      data?: Record<string, unknown>;
    }
  ): Promise<void>;
  
  unsubscribeUser(userId: number): Promise<void>;
}
```

### Integration Points
- ParentContactsPage needs mobile-optimized table view
- Email editor must work on mobile devices
- Report viewing needs touch-friendly navigation
- Offline caching for parent messages and summaries

## 4. Analytics Dashboard (analytics agent)

### Requirements

#### Communication Analytics Models
```prisma
// Required analytics models
model CommunicationMetric {
  id              Int      @id @default(autoincrement())
  userId          Int
  messageType     String   // "newsletter", "summary", "report"
  messageId       Int
  recipientCount  Int
  openCount       Int      @default(0)
  clickCount      Int      @default(0)
  responseCount   Int      @default(0)
  bounceCount     Int      @default(0)
  date            DateTime
  createdAt       DateTime @default(now())
  
  user            User     @relation(fields: [userId], references: [id])
  
  @@index([userId, date])
  @@index([messageType])
}

model EngagementEvent {
  id              Int      @id @default(autoincrement())
  deliveryId      Int
  eventType       String   // "open", "click", "reply", "forward"
  timestamp       DateTime
  metadata        Json?    // Click URLs, reply content, etc.
  
  delivery        EmailDelivery @relation(fields: [deliveryId], references: [id])
  
  @@index([deliveryId])
  @@index([eventType])
}
```

#### Analytics API Endpoints
```typescript
// Required analytics endpoints
interface AnalyticsAPI {
  // Communication effectiveness
  GET /api/analytics/communications/overview
  Response: {
    totalSent: number;
    averageOpenRate: number;
    averageClickRate: number;
    topPerformingMessages: MessageStat[];
    engagementTrend: TrendData[];
  }
  
  // Parent engagement
  GET /api/analytics/parent-engagement/:studentId
  Response: {
    communicationFrequency: number;
    responseRate: number;
    preferredChannel: string;
    engagementScore: number;
    lastContact: Date;
  }
  
  // Template effectiveness
  GET /api/analytics/templates/:templateId
  Response: {
    usageCount: number;
    averageOpenRate: number;
    averageResponseTime: number;
    sentimentScore: number;
  }
}
```

#### Dashboard Components
```typescript
// Required visualization components
interface AnalyticsDashboardComponents {
  'CommunicationOverview': React.FC<{
    dateRange: DateRange;
    userId: number;
  }>;
  
  'EngagementHeatmap': React.FC<{
    data: EngagementData[];
    period: 'week' | 'month' | 'term';
  }>;
  
  'ParentEngagementScore': React.FC<{
    students: Student[];
    metrics: ParentEngagementMetric[];
  }>;
  
  'TemplatePerformance': React.FC<{
    templates: EmailTemplate[];
    analytics: TemplateAnalytics[];
  }>;
}
```

### Integration Points
- Email delivery tracking needs webhook endpoints
- Report generation should track viewing analytics
- Parent portal interactions need event tracking
- A/B testing framework for message optimization

## 5. System Integration (integration agent)

### Requirements

#### SIS/LMS Connectors
```typescript
// Required integration interfaces
interface SISConnector {
  // Student Information System integration
  syncStudents(): Promise<Student[]>;
  syncParentContacts(studentId: string): Promise<ParentContact[]>;
  syncGrades(studentId: string, termId: string): Promise<Grade[]>;
  syncAttendance(studentId: string, dateRange: DateRange): Promise<Attendance[]>;
}

interface LMSConnector {
  // Learning Management System integration
  getAssignments(studentId: string): Promise<Assignment[]>;
  getSubmissions(studentId: string): Promise<Submission[]>;
  getActivityLog(studentId: string): Promise<Activity[]>;
  postAnnouncement(content: string, targetIds: string[]): Promise<void>;
}
```

#### Webhook Infrastructure
```typescript
// Required webhook handling
interface WebhookService {
  // Incoming webhooks from email providers
  handleSendGridWebhook(event: SendGridEvent): Promise<void>;
  handleMailgunWebhook(event: MailgunEvent): Promise<void>;
  
  // Outgoing webhooks to external systems
  registerWebhook(
    url: string,
    events: WebhookEvent[],
    secret: string
  ): Promise<WebhookRegistration>;
  
  triggerWebhook(
    registration: WebhookRegistration,
    event: WebhookEvent,
    data: unknown
  ): Promise<void>;
}

type WebhookEvent = 
  | 'message.sent'
  | 'message.delivered'
  | 'message.opened'
  | 'message.clicked'
  | 'report.generated'
  | 'contact.updated';
```

### Integration Points
- Parent contact sync from SIS
- Grade data import for report cards
- Calendar integration for school events
- Two-way sync with communication platforms

## 6. Infrastructure Requirements

### Database Migrations
```sql
-- Required indexes for performance
CREATE INDEX idx_email_delivery_status ON "EmailDelivery"(status, "createdAt");
CREATE INDEX idx_email_delivery_recipient ON "EmailDelivery"("recipientEmail");
CREATE INDEX idx_parent_contact_email ON "ParentContact"(email);

-- Full-text search for messages
CREATE INDEX idx_parent_message_search ON "ParentMessage" 
  USING gin(to_tsvector('english', title || ' ' || "contentEn"));
CREATE INDEX idx_parent_message_search_fr ON "ParentMessage" 
  USING gin(to_tsvector('french', title || ' ' || "contentFr"));
```

### Background Jobs
```typescript
// Required job queue implementation
interface JobQueue {
  // Email sending jobs
  queueBulkEmail(job: {
    recipients: string[];
    messageId: number;
    messageType: 'newsletter' | 'summary';
  }): Promise<JobId>;
  
  // Report generation jobs
  queueReportGeneration(job: {
    studentId: number;
    reportType: string;
    options: ReportOptions;
  }): Promise<JobId>;
  
  // Analytics processing
  queueAnalyticsUpdate(job: {
    metricType: string;
    data: unknown;
  }): Promise<JobId>;
}
```

### Caching Strategy
```typescript
// Required caching layer
interface CacheService {
  // Cache parent contacts for quick access
  cacheParentContacts(userId: number, contacts: ParentContact[]): Promise<void>;
  getParentContacts(userId: number): Promise<ParentContact[] | null>;
  
  // Cache email templates
  cacheTemplate(templateId: number, template: EmailTemplate): Promise<void>;
  getTemplate(templateId: number): Promise<EmailTemplate | null>;
  
  // Cache generated reports temporarily
  cacheReport(reportId: string, report: GeneratedReport, ttl: number): Promise<void>;
  getReport(reportId: string): Promise<GeneratedReport | null>;
}
```

## Testing Requirements

### E2E Test Scenarios
1. Complete parent communication flow (create → send → track)
2. Report generation with real student data
3. Bulk import of parent contacts
4. Mobile app offline/online sync
5. Multi-language content generation

### Performance Benchmarks
- Bulk email: 1000 recipients in < 30 seconds
- Report generation: < 5 seconds per student
- API response time: < 200ms for list endpoints
- Dashboard load time: < 2 seconds

## Security Checklist
- [ ] All parent data encrypted at rest
- [ ] API rate limiting implemented
- [ ] CORS properly configured
- [ ] Input sanitization on all endpoints
- [ ] File upload size limits enforced
- [ ] Session timeout for sensitive operations
- [ ] Two-factor authentication for admin features

---

**Note**: This document should be reviewed and updated as cross-agent features are implemented. Each agent should reference their specific section when implementing messenger-related features.