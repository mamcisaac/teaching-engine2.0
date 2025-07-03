# Database Schema Documentation

**Last Updated:** July 3, 2025  
**Version:** 2.0.0  
**Database:** SQLite (development), PostgreSQL (production)

## Overview

Teaching Engine 2.0 uses a comprehensive database schema designed around the ETFO
(Elementary Teachers' Federation of Ontario) 5-level planning hierarchy. The schema
supports bilingual education (English/French), curriculum intelligence, collaborative
planning, and activity discovery.

### Database Design Philosophy

1. **ETFO-Aligned Planning Hierarchy**: Five planning levels from curriculum
   expectations to daily reflections
2. **Bilingual Support**: French and English content fields throughout
3. **Curriculum Intelligence**: AI-powered clustering and semantic search
4. **Collaborative Planning**: Team-based sharing and collaboration features
5. **Activity Discovery**: External activity integration and rating system

### Technology Stack

- **ORM**: Prisma
- **Development**: SQLite
- **Production**: PostgreSQL
- **Vector Storage**: JSON embeddings for AI features

## Core Planning Models (ETFO Hierarchy)

The Teaching Engine 2.0 database implements the ETFO 5-level planning hierarchy:

```
Level 1: CurriculumExpectation  (Provincial curriculum standards)
    ↓
Level 2: LongRangePlan         (Yearly/term overview)
    ↓
Level 3: UnitPlan              (Multi-week thematic units)
    ↓
Level 4: ETFOLessonPlan        (Individual lesson plans)
    ↓
Level 5: DaybookEntry          (Daily reflections and observations)
```

### Level 1: CurriculumExpectation

**Purpose**: Stores provincial curriculum standards and expectations

```sql
model CurriculumExpectation {
  id              String   @id @default(cuid())
  code            String   @unique     // e.g., "A1.2", "B2.3"
  description     String               // English description
  strand          String               // Major curriculum category
  substrand       String?              // Subcategory if applicable
  grade           Int
  subject         String

  -- Bilingual Support
  descriptionFr   String?             // French description
  strandFr        String?             // French strand name
  substrandFr     String?             // French substrand name

  -- Import Tracking
  importId        String?             // Link to CurriculumImport

  -- Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Key Features**:

- Unique curriculum codes (e.g., "A1.2")
- Bilingual content support (English/French)
- Hierarchical organization (strand/substrand)
- Links to all planning levels through junction tables

**Example Data**:

```json
{
  "code": "A1.2",
  "description": "Use reading comprehension strategies to make meaning from texts",
  "strand": "Reading",
  "substrand": "Reading Comprehension",
  "grade": 3,
  "subject": "Language Arts",
  "descriptionFr": "Utiliser des stratégies de compréhension en lecture"
}
```

### Level 2: LongRangePlan

**Purpose**: Yearly or term-based curriculum planning overview

```sql
model LongRangePlan {
  id            String   @id @default(cuid())
  userId        Int      // Teacher who created the plan
  title         String
  academicYear  String   // e.g., "2024-2025"
  term          String?  // "Full Year", "Term 1", "Term 2"
  grade         Int
  subject       String

  -- Planning Details
  description   String?
  goals         String?              // Overall learning goals
  themes        Json?                // Array of major themes

  -- ETFO-Aligned Fields
  overarchingQuestions  String?      // Big questions for the year
  assessmentOverview    String?      // Assessment strategy
  resourceNeeds         String?      // Required materials/resources
  professionalGoals     String?      // Teacher development goals

  -- Bilingual Support
  titleFr       String?
  descriptionFr String?
  goalsFr       String?
}
```

**Key Features**:

- Academic year and term organization
- Professional development integration
- Assessment planning overview
- Resource requirement tracking

### Level 3: UnitPlan

**Purpose**: Multi-week thematic units with detailed planning

```sql
model UnitPlan {
  id              String   @id @default(cuid())
  userId          Int
  title           String
  longRangePlanId String   // Parent long-range plan

  -- Planning Details
  description     String?
  bigIdeas        String?  // Key concepts/enduring understandings
  essentialQuestions Json? // Array of guiding questions

  -- Timeline
  startDate       DateTime
  endDate         DateTime
  estimatedHours  Int?

  -- Assessment Planning
  assessmentPlan  String?  // How learning will be assessed
  successCriteria Json?    // Array of success criteria

  -- ETFO-Aligned Fields
  crossCurricularConnections String?
  learningSkills          Json?      // Learning skills focus
  culminatingTask         String?    // Final assessment task
  keyVocabulary          Json?      // Key terms
  priorKnowledge         String?    // Prerequisites
  parentCommunicationPlan String?   // Family communication
  fieldTripsAndGuestSpeakers String?
  differentiationStrategies Json?
  indigenousPerspectives   String?
  environmentalEducation   String?
  socialJusticeConnections String?
  technologyIntegration    String?
  communityConnections     String?
}
```

**Key Features**:

- Comprehensive ETFO-aligned planning fields
- Assessment and success criteria tracking
- Cross-curricular connections
- Differentiation strategies
- Indigenous perspectives integration

### Level 4: ETFOLessonPlan

**Purpose**: Individual lesson plans with three-part structure

```sql
model ETFOLessonPlan {
  id         String   @id @default(cuid())
  userId     Int
  title      String
  unitPlanId String   // Parent unit plan

  -- Lesson Details
  date       DateTime
  duration   Int      // in minutes
  grade      Int?     // Denormalized for performance
  subject    String?  // Denormalized for performance
  language   String?  // Teaching language

  -- Three-Part Lesson Structure (ETFO Standard)
  mindsOn    String?  // Introduction/hook
  action     String?  // Main learning activities
  consolidation String? // Closure/assessment

  -- Planning Details
  learningGoals String?
  materials    Json?    // Array of required materials
  grouping     String?  // "whole class", "small group", etc.

  -- Differentiation
  accommodations Json?  // Array of accommodations
  modifications  Json?  // Array of modifications
  extensions     Json?  // Array of extensions

  -- Assessment
  assessmentType String? // "diagnostic", "formative", "summative"
  assessmentNotes String?

  -- Substitute Teacher Support
  isSubFriendly Boolean @default(true)
  subNotes      String?
}
```

**Key Features**:

- ETFO three-part lesson structure
- Comprehensive differentiation support
- Assessment integration
- Substitute teacher compatibility

### Level 5: DaybookEntry

**Purpose**: Daily reflections and observations

```sql
model DaybookEntry {
  id           String         @id @default(cuid())
  userId       Int
  date         DateTime
  lessonPlanId String?        @unique // Optional lesson link

  -- Reflection Prompts
  whatWorked   String?        // What went well?
  whatDidntWork String?       // What could be improved?
  nextSteps    String?        // What to do differently next time?

  -- Student Observations
  studentEngagement String?   // Notes on engagement levels
  studentChallenges String?   // Observed difficulties
  studentSuccesses  String?   // Notable achievements

  -- General Notes
  notes        String?        // Any other observations
  privateNotes String?        // Notes not for sharing

  -- Quick Indicators
  overallRating Int?          // 1-5 scale
  wouldReuseLesson Boolean?
}
```

**Key Features**:

- Structured reflection prompts
- Student observation tracking
- Rating system for lesson effectiveness
- Private notes capability

## Junction Tables (Many-to-Many Relationships)

### Planning Level Connections

Each planning level connects to curriculum expectations through junction tables:

```sql
-- Long-Range Plans to Curriculum Expectations
model LongRangePlanExpectation {
  longRangePlanId String
  expectationId   String
  plannedTerm     String? // Which term this expectation is planned for

  @@id([longRangePlanId, expectationId])
}

-- Unit Plans to Curriculum Expectations
model UnitPlanExpectation {
  unitPlanId    String
  expectationId String

  @@id([unitPlanId, expectationId])
}

-- Lesson Plans to Curriculum Expectations
model ETFOLessonPlanExpectation {
  lessonPlanId  String
  expectationId String

  @@id([lessonPlanId, expectationId])
}

-- Daybook Entries to Curriculum Expectations
model DaybookEntryExpectation {
  daybookEntryId String
  expectationId String
  coverage      String? // "introduced", "developing", "consolidated"

  @@id([daybookEntryId, expectationId])
}
```

## Supporting Models

### User Management

```sql
model User {
  id       Int      @id @default(autoincrement())
  email    String   @unique
  password String
  name     String
  role     String   @default("teacher")
  preferredLanguage String @default("en")

  -- Relationships to all planning levels
  longRangePlans LongRangePlan[]
  unitPlans UnitPlan[]
  etfoLessonPlans ETFOLessonPlan[]
  daybookEntries DaybookEntry[]

  -- Additional relationships for features
  subjects Subject[]
  events CalendarEvent[]
  students Student[]
  -- ... (many more relationships)
}
```

### Student Management

```sql
model Student {
  id          Int    @id @default(autoincrement())
  firstName   String
  lastName    String
  grade       Int
  userId      Int    // Teacher who manages this student

  -- Student data
  artifacts   StudentArtifact[]
  reflections StudentReflection[]
  parentSummaries ParentSummary[]
  goals       StudentGoal[]
}

model StudentReflection {
  id          Int      @id @default(autoincrement())
  studentId   Int
  content     String?
  date        DateTime?
  emoji       String?   // e.g. "🙂", "😐", "😕"
  voicePath   String?   // path to optional recording
  unitPlanId  String?   // Link to specific unit

  -- AI Classification (A3 Enhancement)
  suggestedOutcomeIds  String?    // JSON array of suggested outcomes
  selTags              String?    // SEL/competency tags
  classificationConfidence Float? // AI confidence (0-1)
  classificationRationale  String? // AI reasoning
  classifiedAt         DateTime?
}
```

### Calendar and Events

```sql
model CalendarEvent {
  id          Int                 @id @default(autoincrement())
  title       String
  description String?
  start       DateTime
  end         DateTime
  allDay      Boolean             @default(false)
  eventType   CalendarEventType   // PD_DAY, ASSEMBLY, TRIP, HOLIDAY, CUSTOM
  source      CalendarEventSource @default(MANUAL)
  teacherId   Int?
  schoolId    Int?
}

model UnavailableBlock {
  id                Int                  @id @default(autoincrement())
  teacherId         Int?
  date              DateTime
  startMin          Int
  endMin            Int
  reason            String
  blockType         UnavailableBlockType // TEACHER_ABSENCE, STUDENT_PULL_OUT
  affectedStudentIds String?
}
```

## Curriculum Intelligence Models

### Curriculum Import System

```sql
model CurriculumImport {
  id                String           @id @default(cuid())
  userId            Int
  filename          String?          // For planner agent compatibility
  originalName      String?          // Original uploaded filename
  mimeType          String?          // File MIME type
  fileSize          Int?             // File size in bytes
  filePath          String?          // Path to uploaded file
  grade             Int?             // Grade level for import
  subject           String?          // Subject area
  status            ImportStatus     @default(UPLOADING)
  sourceFormat      String?          // "pdf", "docx", "csv", "manual"
  rawText           String?          // Extracted text from document
  parsedData        String?          // JSON of parsed curriculum data
  errorMessage      String?          // Error details if parsing fails
  totalOutcomes     Int              @default(0)
  processedOutcomes Int              @default(0)
  errorLog          Json?            // Array of error objects
  metadata          Json?            // Additional import metadata
}

enum ImportStatus {
  UPLOADING
  PROCESSING
  READY_FOR_REVIEW
  CONFIRMED
  COMPLETED
  FAILED
  CANCELLED
}
```

### AI Clustering System

```sql
model ExpectationCluster {
  id             String           @id @default(cuid())
  importId       String           // Parent import session
  clusterName    String           // Human-readable cluster name
  clusterType    String           // "theme", "skill", "concept"
  expectationIds Json             // Array of expectation IDs
  centroid       Json?            // Centroid embedding vector
  confidence     Float            @default(0.0) // Clustering confidence (0-1)
  suggestedTheme String?          // AI-suggested theme name
  metadata       Json?            // Additional cluster metadata
}

model CurriculumExpectationEmbedding {
  id            String                @id @default(cuid())
  expectationId String                @unique
  embedding     Json                  // Array of float values
  model         String                // e.g., "text-embedding-3-small"
}
```

## Activity Discovery Models

### External Activity Integration

```sql
model ExternalActivity {
  id                String   @id @default(cuid())
  externalId        String   // ID from source platform
  source            String   // "TPT", "Khan", "OER", etc.
  url               String
  title             String
  description       String?
  thumbnailUrl      String?

  -- Activity Details
  duration          Int?     // in minutes
  activityType      String   // "video", "worksheet", "game", etc.
  gradeMin          Int
  gradeMax          Int
  subject           String
  language          String   @default("en")

  -- Materials and Requirements
  materials         Json     // Array of required materials
  technology        Json?    // Tech requirements
  groupSize         String?  // "individual", "pairs", etc.

  -- Quality and Ratings
  sourceRating      Float?   // Rating from source platform
  sourceReviews     Int?     // Number of reviews on source
  internalRating    Float?   // Our users' ratings
  internalReviews   Int?     // Our users' review count

  -- Curriculum Alignment
  curriculumTags    Json     // Array of curriculum codes
  learningGoals     Json?    // Extracted learning objectives

  -- Metadata
  isFree            Boolean  @default(true)
  price             Float?
  license           String?  // Copyright/usage terms
  lastVerified      DateTime @default(now())
  isActive          Boolean  @default(true)
}
```

### Activity Import and Rating

```sql
model ActivityImport {
  id              String           @id @default(cuid())
  userId          Int
  activityId      String
  lessonPlanId    String?          // Where it was imported
  lessonSection   String?          // "mindsOn", "action", "consolidation"
  customizations  Json?            // User's modifications
  notes           String?          // Teacher's notes
  timesUsed       Int              @default(1)
  lastUsed        DateTime         @default(now())
  effectiveness   Int?             // 1-5 rating after use
}

model ActivityRating {
  id          String           @id @default(cuid())
  userId      Int
  activityId  String
  rating      Int              // 1-5 stars
  review      String?
  wouldRecommend Boolean?
  gradeUsed   Int?             // Context of use
  subjectUsed String?
  workedWell  String?          // What worked
  challenges  String?          // What didn't work

  @@unique([userId, activityId])
}
```

## Collaboration Models

### Team Management

```sql
model Team {
  id              String   @id @default(cuid())
  name            String
  description     String?
  grade           Int?     // Optional grade level focus
  subject         String?  // Optional subject focus
  schoolName      String?  // School affiliation
  schoolBoard     String?  // School board/district

  -- Team Settings
  isPublic        Boolean  @default(false)
  requiresApproval Boolean @default(true)
  allowGuests     Boolean  @default(false)

  -- Team Identification
  teamCode        String   @unique @default(cuid())
  ownerId         Int

  -- Customization
  avatarUrl       String?
  coverImageUrl   String?
}

model TeamMember {
  id          String   @id @default(cuid())
  teamId      String
  userId      Int
  role        TeamRole @default(MEMBER)
  joinedAt    DateTime @default(now())
  emailNotifications Boolean @default(true)

  @@unique([teamId, userId])
}

enum TeamRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}
```

### Plan Sharing

```sql
model SharedPlan {
  id              String   @id @default(cuid())
  planType        String   // 'long-range', 'unit', 'lesson', 'daybook'
  planId          String   // ID of the specific plan
  sharedById      Int
  sharedWithId    Int?     // Null for public links
  teamId          String?  // If shared with a team

  -- Permissions
  canEdit         Boolean  @default(false)
  canCopy         Boolean  @default(true)
  canComment      Boolean  @default(true)
  canReshare      Boolean  @default(false)

  -- Sharing Link
  shareCode       String   @unique @default(cuid())
  isPublicLink    Boolean  @default(false)
  linkExpiresAt   DateTime?

  -- Usage Tracking
  viewCount       Int      @default(0)
  copyCount       Int      @default(0)
  lastViewedAt    DateTime?

  message         String?  // Optional message from sharer
}
```

## Template System

### Plan Templates

```sql
model PlanTemplate {
  id              String           @id @default(cuid())
  title           String
  titleFr         String?
  description     String?
  descriptionFr   String?
  type            TemplateType     // UNIT_PLAN, LESSON_PLAN
  category        TemplateCategory // BY_SUBJECT, BY_GRADE, etc.

  -- Template Metadata
  subject         String?          // Optional subject filter
  gradeMin        Int?             // Minimum grade level
  gradeMax        Int?             // Maximum grade level
  tags            Json             // Array of tags
  keywords        Json             // Array of keywords

  -- Template Ownership
  isSystem        Boolean          @default(false)
  createdByUserId Int?
  isPublic        Boolean          @default(false)

  -- Template Content
  content         Json             // Full template content

  -- Type-specific fields
  estimatedWeeks  Int?             // For unit plans
  unitStructure   Json?            // For unit plans
  estimatedMinutes Int?            // For lesson plans
  lessonStructure Json?            // For lesson plans

  -- Usage tracking
  usageCount      Int              @default(0)
  lastUsedAt      DateTime?
  averageRating   Float?           @default(0)
}

enum TemplateType {
  UNIT_PLAN
  LESSON_PLAN
}

enum TemplateCategory {
  BY_SUBJECT
  BY_GRADE
  BY_THEME
  BY_SEASON
  BY_SKILL
  CUSTOM
}
```

## Resource Management

### Resource Library

```sql
model ResourceLibraryItem {
  id              String   @id @default(cuid())
  title           String
  titleFr         String?
  description     String?
  descriptionFr   String?

  -- Resource Details
  resourceType    String   // 'lesson', 'worksheet', 'assessment', etc.
  fileUrl         String?
  thumbnailUrl    String?
  content         String?  // For inline content

  -- Categorization
  subject         String
  gradeMin        Int
  gradeMax        Int
  language        String   @default("en")

  -- French Immersion Support
  isFrenchImmersion Boolean @default(false)
  frenchLevel     String?  // 'core', 'extended', 'immersion'

  -- Organization
  categories      Json     // Array of categories
  tags            Json     // Array of searchable tags
  curriculumCodes Json     // Array of curriculum codes

  -- Contributor Information
  contributorId   Int
  schoolName      String?
  schoolBoard     String?

  -- Quality Metrics
  averageRating   Float?   @default(0)
  viewCount       Int      @default(0)
  downloadCount   Int      @default(0)
  bookmarkCount   Int      @default(0)

  -- Moderation
  isApproved      Boolean  @default(false)
  approvedAt      DateTime?
  approvedBy      Int?

  -- Versioning
  version         Int      @default(1)
  previousVersionId String?
}
```

## Database Indexes and Performance

### Primary Indexes

```sql
-- Performance-critical indexes
@@index([userId, date])                    -- DaybookEntry
@@index([userId, startDate])              -- UnitPlan
@@index([userId, academicYear])           -- LongRangePlan
@@index([subject, grade])                 -- CurriculumExpectation
@@index([grade, subject])                 -- ETFOLessonPlan
@@index([userId, status])                 -- CurriculumImport
@@index([source, externalId])             -- ExternalActivity
@@index([teamId, userId])                 -- TeamMember
@@index([planType, planId])               -- SharedPlan
```

### Composite Indexes

```sql
-- Junction table performance
@@index([longRangePlanId, expectationId]) -- LongRangePlanExpectation
@@index([unitPlanId, expectationId])      -- UnitPlanExpectation
@@index([lessonPlanId, expectationId])    -- ETFOLessonPlanExpectation
@@index([daybookEntryId, expectationId])  -- DaybookEntryExpectation
```

### Search Indexes

```sql
-- Full-text search support
@@index([isActive, lastVerified])         -- ExternalActivity
@@index([subject, gradeMin, gradeMax])    -- ResourceLibraryItem
@@index([activityType, language])         -- ExternalActivity
@@index([type, category])                 -- PlanTemplate
```

## Validation Rules and Constraints

### Data Integrity Rules

1. **Curriculum Expectations**: Unique codes within grade/subject combinations
2. **Planning Hierarchy**: Unit plans must belong to long-range plans
3. **Date Constraints**: End dates must be after start dates
4. **User Permissions**: Users can only access their own plans unless shared
5. **Grade Ranges**: Grade values must be between 1-12
6. **Rating Constraints**: All ratings must be between 1-5

### Foreign Key Constraints

```sql
-- Cascade deletes for hierarchy
LongRangePlan.userId -> User.id (CASCADE)
UnitPlan.longRangePlanId -> LongRangePlan.id (CASCADE)
ETFOLessonPlan.unitPlanId -> UnitPlan.id (CASCADE)
DaybookEntry.lessonPlanId -> ETFOLessonPlan.id (SET NULL)

-- Restrict deletes for shared content
SharedPlan.sharedById -> User.id (RESTRICT)
TeamMember.userId -> User.id (RESTRICT)
```

## Common Query Patterns

### Curriculum Coverage Analysis

```sql
-- Get all expectations covered in a long-range plan
SELECT ce.code, ce.description, lrpe.plannedTerm
FROM CurriculumExpectation ce
JOIN LongRangePlanExpectation lrpe ON ce.id = lrpe.expectationId
WHERE lrpe.longRangePlanId = ?
ORDER BY ce.strand, ce.code;

-- Find uncovered expectations for a grade/subject
SELECT ce.code, ce.description
FROM CurriculumExpectation ce
WHERE ce.grade = ? AND ce.subject = ?
  AND NOT EXISTS (
    SELECT 1 FROM LongRangePlanExpectation lrpe
    JOIN LongRangePlan lrp ON lrpe.longRangePlanId = lrp.id
    WHERE lrpe.expectationId = ce.id
      AND lrp.userId = ?
      AND lrp.academicYear = ?
  );
```

### Planning Workflow Queries

```sql
-- Get all unit plans for a long-range plan with lesson counts
SELECT up.id, up.title, up.startDate, up.endDate,
       COUNT(elp.id) as lessonCount
FROM UnitPlan up
LEFT JOIN ETFOLessonPlan elp ON up.id = elp.unitPlanId
WHERE up.longRangePlanId = ?
GROUP BY up.id, up.title, up.startDate, up.endDate
ORDER BY up.startDate;

-- Get recent daybook entries with lesson information
SELECT db.id, db.date, db.overallRating, db.whatWorked,
       elp.title as lessonTitle, up.title as unitTitle
FROM DaybookEntry db
LEFT JOIN ETFOLessonPlan elp ON db.lessonPlanId = elp.id
LEFT JOIN UnitPlan up ON elp.unitPlanId = up.id
WHERE db.userId = ?
ORDER BY db.date DESC
LIMIT 10;
```

### Activity Discovery Queries

```sql
-- Find activities by curriculum alignment
SELECT ea.id, ea.title, ea.description, ea.internalRating,
       ea.duration, ea.activityType
FROM ExternalActivity ea
WHERE ea.isActive = true
  AND ea.gradeMin <= ? AND ea.gradeMax >= ?
  AND ea.subject = ?
  AND JSON_EXTRACT(ea.curriculumTags, '$') LIKE '%' || ? || '%'
ORDER BY ea.internalRating DESC NULLS LAST;

-- Get teacher's imported activities with effectiveness ratings
SELECT ai.id, ea.title, ai.timesUsed, ai.effectiveness,
       ai.lastUsed, ai.notes
FROM ActivityImport ai
JOIN ExternalActivity ea ON ai.activityId = ea.id
WHERE ai.userId = ?
ORDER BY ai.lastUsed DESC;
```

### Collaboration Queries

```sql
-- Get team members with their roles
SELECT u.name, u.email, tm.role, tm.joinedAt
FROM TeamMember tm
JOIN User u ON tm.userId = u.id
WHERE tm.teamId = ?
ORDER BY tm.role, u.name;

-- Find shared plans accessible to a user
SELECT sp.id, sp.planType, sp.planId, sp.shareCode,
       sharer.name as sharedBy, sp.sharedAt
FROM SharedPlan sp
JOIN User sharer ON sp.sharedById = sharer.id
WHERE sp.sharedWithId = ?
   OR sp.teamId IN (
     SELECT tm.teamId FROM TeamMember tm WHERE tm.userId = ?
   )
ORDER BY sp.sharedAt DESC;
```

## Migration Patterns

### Adding New Planning Fields

When adding new fields to planning models:

1. **Add nullable fields first** to avoid breaking existing data
2. **Use JSON fields for arrays** to maintain SQLite compatibility
3. **Add bilingual support** for user-facing content
4. **Update validation rules** in the application layer
5. **Add appropriate indexes** for query performance

### Example Migration Pattern

```sql
-- Add new field to existing model
ALTER TABLE UnitPlan ADD COLUMN indigenousPerspectives TEXT;
ALTER TABLE UnitPlan ADD COLUMN environmentalEducation TEXT;

-- Add bilingual support
ALTER TABLE UnitPlan ADD COLUMN indigenousPerspectivesFr TEXT;
ALTER TABLE UnitPlan ADD COLUMN environmentalEducationFr TEXT;

-- Update schema version
UPDATE schema_version SET version = version + 1;
```

### Data Migration Best Practices

1. **Preserve existing data** during schema changes
2. **Use transactions** for multi-step migrations
3. **Validate data integrity** after migrations
4. **Maintain backward compatibility** where possible
5. **Document breaking changes** in migration notes

## Performance Considerations

### Database Optimization

1. **Denormalized fields** for common queries (grade, subject in lesson plans)
2. **Composite indexes** for junction tables
3. **JSON fields** for flexible array storage
4. **Pagination** for large result sets
5. **Lazy loading** for related data

### Caching Strategy

1. **Curriculum expectations** cached by grade/subject
2. **User planning data** cached per academic year
3. **Activity search results** cached by search parameters
4. **Template content** cached for reuse
5. **Team membership** cached for permission checks

### Monitoring and Maintenance

1. **Query performance tracking** for slow queries
2. **Index usage analysis** for optimization
3. **Data growth monitoring** for capacity planning
4. **Regular VACUUM operations** for SQLite
5. **Connection pool monitoring** for PostgreSQL

---

## Related Documentation

- [API Reference](./API_REFERENCE.md) - API endpoints and request/response formats
- [Data Flow](./DATA_FLOW.md) - System architecture and data patterns
- [Features](./FEATURES.md) - Feature overview and implementation details
- [Testing Guide](./TESTING_GUIDE.md) - Database testing strategies

---

_This documentation is maintained as part of the Teaching Engine 2.0 development
process. For questions or clarifications, refer to the project's GitHub repository
or contact the development team._
