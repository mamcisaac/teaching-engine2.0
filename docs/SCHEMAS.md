# Database Schema Documentation

**Last Updated:** July 3, 2025  
**Version:** 2.0.0  
**Database:** SQLite (development), PostgreSQL (production)

## Overview

Teaching Engine 2.0 uses a comprehensive database schema designed around the ETFO (Elementary Teachers' Federation of Ontario) 5-level planning hierarchy. The schema supports bilingual education (English/French), curriculum intelligence, collaborative planning, activity discovery, and template systems.

### Database Design Philosophy

1. **ETFO-Aligned Planning Hierarchy**: Five planning levels from curriculum expectations to daily reflections
2. **Bilingual Support**: French and English content fields throughout
3. **Curriculum Intelligence**: AI-powered clustering and semantic search
4. **Collaborative Planning**: Team-based sharing and collaboration features
5. **Activity Discovery**: External activity integration and rating system
6. **Template System**: Reusable unit and lesson plan templates
7. **Student Portfolio**: Comprehensive student tracking and assessment

### Technology Stack

- **ORM**: Prisma
- **Development**: SQLite
- **Production**: PostgreSQL (planned)
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
  code            String   @unique     -- e.g., "A1.2", "B2.3"
  description     String               -- English description
  strand          String               -- Major curriculum category
  substrand       String?              -- Subcategory if applicable
  grade           Int
  subject         String

  -- Bilingual Support
  descriptionFr   String?             -- French description
  strandFr        String?             -- French strand name
  substrandFr     String?             -- French substrand name

  -- Import Tracking
  importId        String?             -- Link to CurriculumImport
  import          CurriculumImport?

  -- Relationships to planning levels
  longRangePlans  LongRangePlanExpectation[]
  unitPlans       UnitPlanExpectation[]
  lessonPlans     ETFOLessonPlanExpectation[]
  daybookEntries  DaybookEntryExpectation[]

  -- AI features
  embedding       CurriculumExpectationEmbedding?

  -- Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([subject, grade])
  @@index([code])
}
```

**Key Features**:

- Unique curriculum codes (e.g., "A1.2")
- Bilingual content support (English/French)
- Hierarchical organization (strand/substrand)
- Links to all planning levels through junction tables
- AI embedding support for semantic search

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
  userId        Int      -- Teacher who created the plan
  user          User     @relation(fields: [userId], references: [id])

  title         String
  academicYear  String   -- e.g., "2024-2025"
  term          String?  -- "Full Year", "Term 1", "Term 2"
  grade         Int
  subject       String

  -- Planning Details
  description   String?
  goals         String?              -- Overall learning goals
  themes        Json?                -- Array of major themes

  -- ETFO-Aligned Fields
  overarchingQuestions  String?      -- Big questions for the year
  assessmentOverview    String?      -- Assessment strategy
  resourceNeeds         String?      -- Required materials/resources
  professionalGoals     String?      -- Teacher development goals

  -- Bilingual Support
  titleFr       String?
  descriptionFr String?
  goalsFr       String?

  -- Relationships
  expectations  LongRangePlanExpectation[]
  unitPlans     UnitPlan[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId, academicYear])
  @@index([userId, subject, grade])
}
```

### Level 3: UnitPlan

**Purpose**: Multi-week thematic units with detailed planning

```sql
model UnitPlan {
  id              String   @id @default(cuid())
  userId          Int
  user            User     @relation(fields: [userId], references: [id])

  title           String
  longRangePlanId String
  longRangePlan   LongRangePlan @relation(fields: [longRangePlanId], references: [id])

  -- Planning Details
  description     String?
  bigIdeas        String?  -- Key concepts/enduring understandings
  essentialQuestions Json? -- Array of guiding questions

  -- Timeline
  startDate       DateTime
  endDate         DateTime
  estimatedHours  Int?

  -- Bilingual Support
  titleFr         String?
  descriptionFr   String?
  bigIdeasFr      String?

  -- Assessment Planning
  assessmentPlan  String?  -- How learning will be assessed
  successCriteria Json?    -- Array of success criteria

  -- ETFO-Aligned Planning Fields
  crossCurricularConnections String?  -- Links to other subject areas
  learningSkills          Json?      -- Array of learning skills focus
  culminatingTask         String?    -- Final assessment task description
  keyVocabulary          Json?      -- Array of key terms
  priorKnowledge         String?    -- Prerequisites for the unit
  parentCommunicationPlan String?   -- How to communicate with families
  fieldTripsAndGuestSpeakers String? -- Community connections
  differentiationStrategies Json?   -- Support for diverse learners
  indigenousPerspectives   String?  -- Indigenous knowledge integration
  environmentalEducation   String?  -- Environmental learning connections
  socialJusticeConnections String?  -- Equity and social justice themes
  technologyIntegration    String?  -- Technology use in the unit
  communityConnections     String?  -- Local partnerships and connections

  -- Relationships
  expectations    UnitPlanExpectation[]
  lessonPlans     ETFOLessonPlan[]
  resources       UnitPlanResource[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId, startDate])
  @@index([longRangePlanId])
}
```

### Level 4: ETFOLessonPlan

**Purpose**: Individual lesson plans with ETFO three-part structure

```sql
model ETFOLessonPlan {
  id         String   @id @default(cuid())
  userId     Int
  user       User     @relation(fields: [userId], references: [id])

  title      String
  unitPlanId String
  unitPlan   UnitPlan @relation(fields: [unitPlanId], references: [id])

  -- Denormalized fields for performance and filtering
  grade      Int?     -- Denormalized from LongRangePlan
  subject    String?  -- Denormalized from LongRangePlan
  language   String?  -- Teaching language (e.g., "en", "fr")

  -- Lesson Details
  date       DateTime
  duration   Int      -- in minutes

  -- Three-part lesson structure (ETFO standard)
  mindsOn    String?  -- Introduction/hook
  action     String?  -- Main learning activities
  consolidation String? -- Closure/assessment

  -- Planning Details
  learningGoals String?
  materials    Json?    -- Array of required materials
  grouping     String?  -- "whole class", "small group", "pairs", "individual"

  -- Bilingual Support
  titleFr      String?
  mindsOnFr    String?
  actionFr     String?
  consolidationFr String?
  learningGoalsFr String?

  -- Differentiation
  accommodations Json?  -- Array of accommodations
  modifications  Json?  -- Array of modifications
  extensions     Json?  -- Array of extensions

  -- Assessment
  assessmentType String? -- "diagnostic", "formative", "summative"
  assessmentNotes String?

  -- Substitute teacher friendly
  isSubFriendly Boolean @default(true)
  subNotes      String?

  -- Relationships
  expectations  ETFOLessonPlanExpectation[]
  daybookEntry  DaybookEntry?
  resources     ETFOLessonPlanResource[]
  activityImports ActivityImport[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId, date])
  @@index([unitPlanId])
  @@index([grade, subject])
  @@index([language])
}
```

### Level 5: DaybookEntry

**Purpose**: Daily reflections and observations

```sql
model DaybookEntry {
  id           String         @id @default(cuid())
  userId       Int
  user         User           @relation(fields: [userId], references: [id])

  date         DateTime
  lessonPlanId String?        @unique
  lessonPlan   ETFOLessonPlan? @relation(fields: [lessonPlanId], references: [id])

  -- Reflection prompts
  whatWorked   String?        -- What went well?
  whatDidntWork String?       -- What could be improved?
  nextSteps    String?        -- What to do differently next time?

  -- Student observations
  studentEngagement String?    -- Notes on engagement levels
  studentChallenges String?    -- Observed difficulties
  studentSuccesses  String?    -- Notable achievements

  -- General notes
  notes        String?        -- Any other observations
  privateNotes String?        -- Notes not for sharing

  -- Bilingual support
  whatWorkedFr String?
  whatDidntWorkFr String?
  nextStepsFr  String?
  notesFr      String?

  -- Quick indicators
  overallRating Int?          -- 1-5 scale
  wouldReuseLesson Boolean?

  -- Relationships
  expectations DaybookEntryExpectation[]

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([userId, date])
}
```

## Junction Tables (Many-to-Many Relationships)

### Planning Level Connections

Each planning level connects to curriculum expectations through junction tables:

```sql
-- Long-Range Plans to Curriculum Expectations
model LongRangePlanExpectation {
  longRangePlan   LongRangePlan         @relation(fields: [longRangePlanId], references: [id], onDelete: Cascade)
  longRangePlanId String
  expectation     CurriculumExpectation @relation(fields: [expectationId], references: [id], onDelete: Cascade)
  expectationId   String
  plannedTerm     String?               -- Which term this expectation is planned for

  @@id([longRangePlanId, expectationId])
}

-- Unit Plans to Curriculum Expectations
model UnitPlanExpectation {
  unitPlan      UnitPlan              @relation(fields: [unitPlanId], references: [id], onDelete: Cascade)
  unitPlanId    String
  expectation   CurriculumExpectation @relation(fields: [expectationId], references: [id], onDelete: Cascade)
  expectationId String

  @@id([unitPlanId, expectationId])
}

-- Lesson Plans to Curriculum Expectations
model ETFOLessonPlanExpectation {
  lessonPlan    ETFOLessonPlan        @relation(fields: [lessonPlanId], references: [id], onDelete: Cascade)
  lessonPlanId  String
  expectation   CurriculumExpectation @relation(fields: [expectationId], references: [id], onDelete: Cascade)
  expectationId String

  @@id([lessonPlanId, expectationId])
}

-- Daybook Entries to Curriculum Expectations
model DaybookEntryExpectation {
  daybookEntry  DaybookEntry          @relation(fields: [daybookEntryId], references: [id], onDelete: Cascade)
  daybookEntryId String
  expectation   CurriculumExpectation @relation(fields: [expectationId], references: [id], onDelete: Cascade)
  expectationId String
  coverage      String?               -- "introduced", "developing", "consolidated"

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

  -- Core planning relationships
  subjects Subject[]
  longRangePlans LongRangePlan[]
  unitPlans UnitPlan[]
  etfoLessonPlans ETFOLessonPlan[]
  daybookEntries DaybookEntry[]

  -- Calendar and scheduling
  events    CalendarEvent[]
  unavailableBlocks UnavailableBlock[]

  -- Student management
  students Student[]
  parentMessages ParentMessage[]
  newsletters Newsletter[]

  -- Curriculum and import system
  curriculumImports CurriculumImport[]
  classRoutines ClassRoutine[]
  subPlanRecords SubPlanRecord[]

  -- Activity discovery
  activityImports ActivityImport[]
  activityRatings ActivityRating[]
  activityCollections ActivityCollection[]

  -- Template system
  createdTemplates PlanTemplate[]
  weeklyPlannerState WeeklyPlannerState?
  recentPlanAccess RecentPlanAccess[]

  -- Collaboration
  ownedTeams Team[] @relation("TeamOwner")
  teamMemberships TeamMember[]
  sharedPlans SharedPlan[] @relation("PlanSharer")
  receivedPlans SharedPlan[] @relation("PlanReceiver")
  planComments PlanComment[]
  sentInvitations TeamInvitation[] @relation("InvitationSender")
  receivedInvitations TeamInvitation[] @relation("InvitationReceiver")
  resourceContributions ResourceLibraryItem[] @relation("ResourceContributor")
  resourceBookmarks ResourceBookmark[]
}
```

### Student Management

```sql
model Student {
  id          Int    @id @default(autoincrement())
  firstName   String
  lastName    String
  grade       Int
  userId      Int
  user        User   @relation(fields: [userId], references: [id])

  artifacts   StudentArtifact[]
  reflections StudentReflection[]
  parentSummaries ParentSummary[]
  goals       StudentGoal[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, lastName])
}

model StudentGoal {
  id         Int       @id @default(autoincrement())
  studentId  Int
  student    Student   @relation(fields: [studentId], references: [id])
  text       String
  unitPlanId String?   -- Optional link to UnitPlan for unit-specific goals
  createdAt  DateTime  @default(now())
  status     String    @default("active") -- "active" | "completed" | "abandoned"
}

model StudentReflection {
  id          Int      @id @default(autoincrement())
  studentId   Int
  student     Student  @relation(fields: [studentId], references: [id])
  content     String?
  text        String?   -- Keep both content and text for compatibility
  date        DateTime? -- Optional date
  emoji       String?   -- e.g. "🙂", "😐", "😕"
  voicePath   String?   -- path to optional recording
  unitPlanId  String?   -- Optional link to UnitPlan for unit-specific reflections

  -- A3 Enhancement: AI Classification fields
  suggestedOutcomeIds  String?    -- JSON array of suggested outcome IDs
  selTags              String?    -- JSON array of SEL/competency tags
  classificationConfidence Float? -- AI confidence score (0-1)
  classificationRationale  String? -- AI rationale for suggestions
  classifiedAt         DateTime?  -- When classification was performed

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model StudentArtifact {
  id          Int      @id @default(autoincrement())
  studentId   Int
  student     Student  @relation(fields: [studentId], references: [id])
  title       String
  description String?
  fileUrl     String?
  outcomeIds  String   @default("[]") -- JSON array of outcome IDs
  createdAt   DateTime @default(now())
}

model ParentSummary {
  id          Int      @id @default(autoincrement())
  studentId   Int
  student     Student  @relation(fields: [studentId], references: [id])
  dateFrom    DateTime
  dateTo      DateTime
  focus       String?  @default("[]") -- JSON array of focus areas
  contentFr   String
  contentEn   String
  isDraft     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
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
  eventType   CalendarEventType
  source      CalendarEventSource @default(MANUAL)
  teacherId   Int?
  teacher     User?               @relation(fields: [teacherId], references: [id])
  schoolId    Int?
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
}

enum CalendarEventType {
  PD_DAY
  ASSEMBLY
  TRIP
  HOLIDAY
  CUSTOM
}

enum CalendarEventSource {
  MANUAL
  ICAL_FEED
  SYSTEM
}

model UnavailableBlock {
  id                Int                  @id @default(autoincrement())
  teacherId         Int?
  teacher           User?               @relation(fields: [teacherId], references: [id])
  date              DateTime
  startMin          Int
  endMin            Int
  reason            String
  blockType         UnavailableBlockType
  affectedStudentIds String?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
}

enum UnavailableBlockType {
  TEACHER_ABSENCE
  STUDENT_PULL_OUT
}
```

## Curriculum Intelligence Models

### Curriculum Import System

```sql
model CurriculumImport {
  id                String           @id @default(cuid())
  userId            Int
  user              User             @relation(fields: [userId], references: [id])
  filename          String?          -- For planner agent compatibility
  originalName      String?          -- Original uploaded filename
  mimeType          String?          -- File MIME type
  fileSize          Int?             -- File size in bytes
  filePath          String?          -- Path to uploaded file
  grade             Int?             -- Grade level for import
  subject           String?          -- Subject area
  status            ImportStatus     @default(UPLOADING)
  sourceFormat      String?          -- "pdf" | "docx" | "csv" | "manual"
  sourceFile        String?          -- Path or URL to original file
  rawText           String?          -- Extracted text from document
  parsedData        String?          -- JSON string of parsed curriculum data
  errorMessage      String?          -- Error details if parsing fails
  totalOutcomes     Int              @default(0)
  processedOutcomes Int              @default(0)
  errorLog          Json?            -- Array of error objects with details
  metadata          Json?            -- Additional import metadata
  processedAt       DateTime?        -- When processing completed
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  completedAt       DateTime?

  clusters          ExpectationCluster[]
  curriculumExpectations CurriculumExpectation[] @relation("CurriculumExpectationImport")

  @@index([userId, status])
  @@index([createdAt])
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

model ExpectationCluster {
  id             String           @id @default(cuid())
  importId       String
  import         CurriculumImport @relation(fields: [importId], references: [id], onDelete: Cascade)
  clusterName    String           -- Human-readable cluster name
  clusterType    String           -- "theme" | "skill" | "concept"
  expectationIds Json             -- Array of expectation IDs in this cluster
  centroid       Json?            -- Centroid embedding vector for the cluster
  confidence     Float            @default(0.0) -- Clustering confidence score (0-1)
  suggestedTheme String?          -- AI-suggested theme name
  metadata       Json?            -- Additional cluster metadata
  createdAt      DateTime         @default(now())

  @@index([importId])
  @@index([clusterType])
}

model CurriculumExpectationEmbedding {
  id            String                @id @default(cuid())
  expectationId String                @unique
  expectation   CurriculumExpectation @relation(fields: [expectationId], references: [id], onDelete: Cascade)
  embedding     Json                  -- Array of float values
  model         String                -- e.g., "text-embedding-3-small"
  createdAt     DateTime              @default(now())
  updatedAt     DateTime              @updatedAt

  @@index([expectationId])
}
```

### Substitute Planning

```sql
model ClassRoutine {
  id          Int      @id @default(autoincrement())
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  title       String
  description String
  category    String   -- "morning", "transition", "dismissal", "behavior", "emergency", "other"
  timeOfDay   String?  -- Optional time indicator like "9:00 AM" or "After recess"
  priority    Int      @default(0) -- Higher priority routines shown first
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, category])
  @@index([userId, isActive])
}

model SubPlanRecord {
  id              Int      @id @default(autoincrement())
  userId          Int
  user            User     @relation(fields: [userId], references: [id])
  date            DateTime
  daysCount       Int      @default(1) -- Number of days included
  content         Json     -- Full generated content
  includeGoals    Boolean  @default(true)
  includeRoutines Boolean  @default(true)
  includePlans    Boolean  @default(true)
  anonymized      Boolean  @default(false)
  notes           String?  -- Additional notes from teacher
  createdAt       DateTime @default(now())

  @@index([userId, date])
  @@index([userId, createdAt])
}
```

## Activity Discovery Models

### External Activity Integration

```sql
model ExternalActivity {
  id                String   @id @default(cuid())
  externalId        String   -- ID from source platform
  source            String   -- "TPT", "Khan", "OER", etc.
  url               String
  title             String
  description       String?
  thumbnailUrl      String?

  -- Activity details
  duration          Int?     -- in minutes
  activityType      String   -- "video", "worksheet", "game", "experiment", "handson"
  gradeMin          Int
  gradeMax          Int
  subject           String
  language          String   @default("en")

  -- Materials and requirements
  materials         Json     -- Array of required materials
  technology        Json?    -- Tech requirements
  groupSize         String?  -- "individual", "pairs", "small group", "whole class"

  -- Quality and ratings
  sourceRating      Float?   -- Rating from source platform
  sourceReviews     Int?     -- Number of reviews on source
  internalRating    Float?   -- Our users' ratings
  internalReviews   Int?     -- Our users' review count

  -- Curriculum alignment
  curriculumTags    Json     -- Array of curriculum codes
  learningGoals     Json?    -- Extracted learning objectives

  -- Metadata
  isFree            Boolean  @default(true)
  price             Float?
  license           String?  -- Copyright/usage terms
  lastVerified      DateTime @default(now())
  isActive          Boolean  @default(true)

  -- Relations
  imports           ActivityImport[]
  ratings           ActivityRating[]
  collections       ActivityCollectionItem[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([source, externalId])
  @@index([subject, gradeMin, gradeMax])
  @@index([activityType, language])
  @@index([isActive, lastVerified])
}

model ActivityImport {
  id              String           @id @default(cuid())
  userId          Int
  user            User             @relation(fields: [userId], references: [id])
  activityId      String
  activity        ExternalActivity @relation(fields: [activityId], references: [id])

  -- Where it was imported to
  lessonPlanId    String?
  lessonPlan      ETFOLessonPlan?  @relation(fields: [lessonPlanId], references: [id])
  lessonSection   String?          -- "mindsOn", "action", "consolidation"

  -- Customizations made
  customizations  Json?            -- User's modifications
  notes           String?          -- Teacher's notes

  -- Usage tracking
  timesUsed       Int              @default(1)
  lastUsed        DateTime         @default(now())
  effectiveness   Int?             -- 1-5 rating after use

  createdAt       DateTime         @default(now())

  @@index([userId, activityId])
  @@index([lessonPlanId])
}

model ActivityRating {
  id          String           @id @default(cuid())
  userId      Int
  user        User             @relation(fields: [userId], references: [id])
  activityId  String
  activity    ExternalActivity @relation(fields: [activityId], references: [id])

  rating      Int              -- 1-5 stars
  review      String?
  wouldRecommend Boolean?

  -- Context of use
  gradeUsed   Int?
  subjectUsed String?
  workedWell  String?          -- What worked
  challenges  String?          -- What didn't work

  createdAt   DateTime         @default(now())

  @@unique([userId, activityId])
  @@index([activityId, rating])
}

model ActivityCollection {
  id          String     @id @default(cuid())
  userId      Int
  user        User       @relation(fields: [userId], references: [id])

  name        String
  description String?
  isPublic    Boolean    @default(false)

  items       ActivityCollectionItem[]

  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([userId, isPublic])
}

model ActivityCollectionItem {
  collectionId String
  collection   ActivityCollection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  activityId   String
  activity     ExternalActivity   @relation(fields: [activityId], references: [id], onDelete: Cascade)
  addedAt      DateTime          @default(now())

  @@id([collectionId, activityId])
}
```

## Template System

### Plan Templates

```sql
model PlanTemplate {
  id              String           @id @default(cuid())

  -- Template identification
  title           String
  titleFr         String?
  description     String?
  descriptionFr   String?
  type            TemplateType
  category        TemplateCategory

  -- Template metadata
  subject         String?          -- Optional subject filter
  gradeMin        Int?             -- Minimum grade level
  gradeMax        Int?             -- Maximum grade level
  tags            Json             -- Array of tags for searchability
  keywords        Json             -- Array of keywords for search

  -- Template ownership
  isSystem        Boolean          @default(false) -- System-provided templates
  createdByUserId Int?
  createdByUser   User?            @relation(fields: [createdByUserId], references: [id])
  isPublic        Boolean          @default(false) -- Can other teachers use this?

  -- Template content (JSON structure based on type)
  content         Json             -- Full template content

  -- Unit Plan specific fields (when type = UNIT_PLAN)
  estimatedWeeks  Int?             -- Typical duration in weeks
  unitStructure   Json?            -- Predefined lesson sequence structure

  -- Lesson Plan specific fields (when type = LESSON_PLAN)
  estimatedMinutes Int?            -- Typical duration in minutes
  lessonStructure Json?            -- Three-part lesson structure template

  -- Usage tracking
  usageCount      Int              @default(0)
  lastUsedAt      DateTime?

  -- Ratings and feedback
  ratings         TemplateRating[]
  averageRating   Float?           @default(0)

  -- Template variations
  variations      TemplateVariation[]

  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@index([type, category])
  @@index([subject, gradeMin, gradeMax])
  @@index([isSystem, isPublic])
  @@index([createdByUserId])
  @@index([usageCount])
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

model TemplateRating {
  id          String       @id @default(cuid())
  templateId  String
  template    PlanTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  userId      Int
  rating      Int          -- 1-5 stars
  comment     String?
  createdAt   DateTime     @default(now())

  @@unique([templateId, userId])
  @@index([templateId, rating])
}

model TemplateVariation {
  id              String       @id @default(cuid())
  templateId      String
  template        PlanTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)

  name            String       -- e.g., "Simplified Version", "Extended Version"
  nameFr          String?
  description     String?
  modificationNotes String?     -- What's different in this variation
  content         Json         -- Modified template content

  createdAt       DateTime     @default(now())

  @@index([templateId])
}
```

### Weekly Planner State

```sql
model WeeklyPlannerState {
  id                 String   @id @default(cuid())
  userId             Int      @unique
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  -- View preferences
  defaultView        String   @default("week") -- "week" | "month" | "agenda"
  timeSlotDuration   Int      @default(30) -- minutes (15, 30, 60)
  showWeekends       Boolean  @default(false)
  startOfWeek        Int      @default(1) -- 0=Sunday, 1=Monday
  workingHours       String   @default("{\"start\":\"08:00\",\"end\":\"16:00\"}")

  -- UI preferences
  sidebarExpanded    Boolean  @default(true)
  showMiniCalendar   Boolean  @default(true)
  showResourcePanel  Boolean  @default(true)
  compactMode        Boolean  @default(false)
  theme              String   @default("light") -- "light" | "dark" | "system"

  -- Planning preferences
  autoSave           Boolean  @default(true)
  autoSaveInterval   Int      @default(30) -- seconds
  showUncoveredOutcomes Boolean @default(true)
  defaultLessonDuration Int   @default(60) -- minutes

  -- Current state
  currentWeekStart   DateTime @default(now())
  lastActiveView     String?  -- For restoring user's position
  draftChanges       String?  -- Unsaved changes as JSON string

  -- Advanced features
  undoHistory        String   @default("[]") -- Array of undo states as JSON string
  redoHistory        String   @default("[]") -- Array of redo states as JSON string
  maxHistorySize     Int      @default(50)

  -- Offline support
  lastSyncedAt       DateTime @default(now())
  hasOfflineChanges  Boolean  @default(false)
  offlineData        String?  -- IndexedDB sync data as JSON string

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@index([userId])
  @@index([userId, lastSyncedAt])
  @@index([userId, hasOfflineChanges])
  @@index([currentWeekStart])
}

model RecentPlanAccess {
  id              String   @id @default(cuid())
  userId          Int
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  planType        String   -- 'long-range', 'unit', 'lesson', 'daybook'
  planId          String   -- ID of the specific plan
  lastAccessed    DateTime @default(now())
  accessCount     Int      @default(1)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, planType, planId])
  @@index([userId, lastAccessed])
  @@index([planType, planId])
}
```

## Communication Models

### Parent Communication

```sql
model ParentMessage {
  id           Int      @id @default(autoincrement())
  userId       Int
  user         User     @relation(fields: [userId], references: [id])
  title        String
  timeframe    String
  contentFr    String
  contentEn    String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Newsletter {
  id          String    @id @default(cuid())
  userId      Int
  user        User      @relation(fields: [userId], references: [id])

  title       String
  titleFr     String

  studentIds  Json      -- Array of student IDs
  dateFrom    DateTime
  dateTo      DateTime

  tone        String    -- "friendly" | "formal" | "informative"
  sections    Json      -- Array of newsletter sections

  isDraft     Boolean   @default(true)
  sentAt      DateTime?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId])
  @@index([isDraft])
}
```

## Collaboration Models

### Team Management

```sql
model Team {
  id              String   @id @default(cuid())
  name            String
  description     String?

  -- Team identification
  grade           Int?     -- Optional grade level focus
  subject         String?  -- Optional subject focus
  schoolName      String?  -- School affiliation
  schoolBoard     String?  -- School board/district

  -- Team settings
  isPublic        Boolean  @default(false) -- Can anyone request to join?
  requiresApproval Boolean @default(true)  -- Do join requests need approval?
  allowGuests     Boolean  @default(false) -- Can non-members view shared content?

  -- Team ownership
  ownerId         Int
  owner           User     @relation("TeamOwner", fields: [ownerId], references: [id])

  -- Team customization
  teamCode        String   @unique @default(cuid()) -- For easy sharing/joining
  avatarUrl       String?
  coverImageUrl   String?

  -- Relationships
  members         TeamMember[]
  invitations     TeamInvitation[]
  sharedCalendars TeamCalendar[]
  sharedResources TeamResource[]
  discussions     TeamDiscussion[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([ownerId])
  @@index([isPublic])
  @@index([teamCode])
  @@index([grade, subject])
}

model TeamMember {
  id          String   @id @default(cuid())
  teamId      String
  team        Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  userId      Int
  user        User     @relation(fields: [userId], references: [id])

  role        TeamRole @default(MEMBER)
  joinedAt    DateTime @default(now())

  -- Member preferences
  emailNotifications Boolean @default(true)

  @@unique([teamId, userId])
  @@index([userId])
  @@index([teamId, role])
}

enum TeamRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

model SharedPlan {
  id              String   @id @default(cuid())

  -- What is being shared
  planType        String   -- 'long-range', 'unit', 'lesson', 'daybook'
  planId          String   -- ID of the specific plan

  -- Sharing details
  sharedById      Int
  sharedBy        User     @relation("PlanSharer", fields: [sharedById], references: [id])
  sharedWithId    Int?     -- Null for public links
  sharedWith      User?    @relation("PlanReceiver", fields: [sharedWithId], references: [id])
  teamId          String?  -- If shared with a team

  -- Permissions
  canEdit         Boolean  @default(false)
  canCopy         Boolean  @default(true)
  canComment      Boolean  @default(true)
  canReshare      Boolean  @default(false)

  -- Sharing link
  shareCode       String   @unique @default(cuid())
  isPublicLink    Boolean  @default(false)
  linkExpiresAt   DateTime?

  -- Usage tracking
  viewCount       Int      @default(0)
  copyCount       Int      @default(0)
  lastViewedAt    DateTime?

  -- Metadata
  message         String?  -- Optional message from sharer
  sharedAt        DateTime @default(now())

  @@index([sharedById])
  @@index([sharedWithId])
  @@index([teamId])
  @@index([shareCode])
  @@index([planType, planId])
}
```

## Resource Models

### Resource Resources

```sql
model UnitPlanResource {
  id         String   @id @default(cuid())
  unitPlanId String
  unitPlan   UnitPlan @relation(fields: [unitPlanId], references: [id])

  title      String
  type       String   -- "document", "video", "website", "book", etc.
  url        String?
  notes      String?

  createdAt  DateTime @default(now())
}

model ETFOLessonPlanResource {
  id           String         @id @default(cuid())
  lessonPlanId String
  lessonPlan   ETFOLessonPlan @relation(fields: [lessonPlanId], references: [id])

  title        String
  type         String         -- "handout", "slide", "video", etc.
  url          String?
  content      String?        -- For inline content

  createdAt    DateTime       @default(now())
}
```

## Database Indexes and Performance

### Primary Indexes

```sql
-- Performance-critical indexes for the ETFO planning hierarchy
@@index([userId, date])                    -- DaybookEntry
@@index([userId, startDate])              -- UnitPlan
@@index([userId, academicYear])           -- LongRangePlan
@@index([subject, grade])                 -- CurriculumExpectation
@@index([grade, subject])                 -- ETFOLessonPlan
@@index([language])                       -- ETFOLessonPlan
@@index([userId, status])                 -- CurriculumImport
@@index([userId, lastName])               -- Student
@@index([userId, category])               -- ClassRoutine
@@index([userId, isActive])               -- ClassRoutine

-- Activity discovery indexes
@@index([subject, gradeMin, gradeMax])    -- ExternalActivity
@@index([activityType, language])         -- ExternalActivity
@@index([isActive, lastVerified])         -- ExternalActivity
@@index([userId, activityId])             -- ActivityImport
@@index([lessonPlanId])                   -- ActivityImport

-- Template system indexes
@@index([type, category])                 -- PlanTemplate
@@index([subject, gradeMin, gradeMax])    -- PlanTemplate
@@index([isSystem, isPublic])             -- PlanTemplate
@@index([usageCount])                     -- PlanTemplate

-- Collaboration indexes
@@index([teamId, userId])                 -- TeamMember
@@index([planType, planId])               -- SharedPlan
@@index([shareCode])                      -- SharedPlan
@@index([userId, lastAccessed])           -- RecentPlanAccess

-- Import and curriculum intelligence indexes
@@index([importId])                       -- ExpectationCluster
@@index([clusterType])                    -- ExpectationCluster
@@index([expectationId])                  -- CurriculumExpectationEmbedding
```

### Junction Table Indexes

```sql
-- Junction table performance for ETFO hierarchy
@@index([longRangePlanId, expectationId]) -- LongRangePlanExpectation
@@index([unitPlanId, expectationId])      -- UnitPlanExpectation
@@index([lessonPlanId, expectationId])    -- ETFOLessonPlanExpectation
@@index([daybookEntryId, expectationId])  -- DaybookEntryExpectation
```

## Common Query Examples

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

### ETFO Planning Workflow

```sql
-- Get complete planning hierarchy for a user
SELECT
  lrp.title as longRangeTitle,
  up.title as unitTitle,
  elp.title as lessonTitle,
  db.date as daybookDate,
  db.overallRating
FROM LongRangePlan lrp
LEFT JOIN UnitPlan up ON lrp.id = up.longRangePlanId
LEFT JOIN ETFOLessonPlan elp ON up.id = elp.unitPlanId
LEFT JOIN DaybookEntry db ON elp.id = db.lessonPlanId
WHERE lrp.userId = ? AND lrp.academicYear = ?
ORDER BY up.startDate, elp.date;
```

### Template System Queries

```sql
-- Find templates by grade and subject
SELECT t.id, t.title, t.description, t.averageRating, t.usageCount
FROM PlanTemplate t
WHERE t.isPublic = true
  AND t.type = 'UNIT_PLAN'
  AND t.gradeMin <= ? AND t.gradeMax >= ?
  AND (t.subject = ? OR t.subject IS NULL)
ORDER BY t.averageRating DESC, t.usageCount DESC;
```

## Migration Patterns

### ETFO Schema Updates

When adding new planning fields:

1. **Add nullable fields first** to avoid breaking existing data
2. **Use JSON fields for arrays** to maintain SQLite compatibility
3. **Add bilingual support** for user-facing content (titleFr, descriptionFr)
4. **Update validation rules** in the application layer
5. **Add appropriate indexes** for query performance

### Example Migration Pattern

```sql
-- Add new ETFO-aligned field to UnitPlan
ALTER TABLE UnitPlan ADD COLUMN indigenousPerspectives TEXT;
ALTER TABLE UnitPlan ADD COLUMN indigenousPerspectivesFr TEXT;

-- Add index for new field if needed for search
CREATE INDEX idx_unitplan_indigenous ON UnitPlan(indigenousPerspectives);
```

## Performance Considerations

### Database Optimization

1. **Denormalized fields** for performance (grade, subject in ETFOLessonPlan)
2. **Composite indexes** for junction tables in the ETFO hierarchy
3. **JSON fields** for flexible array storage (materials, tags, etc.)
4. **Pagination** for large result sets
5. **Lazy loading** for related planning data

### SQLite Specific Optimizations

1. **PRAGMA foreign_keys = ON** for referential integrity
2. **WAL mode** for better concurrent access
3. **Regular VACUUM** operations for space reclamation
4. **JSON functions** for efficient JSON field queries
5. **Prepared statements** for repeated queries

### Caching Strategy

1. **Curriculum expectations** cached by grade/subject combinations
2. **User planning data** cached per academic year
3. **Activity search results** cached by search parameters
4. **Template content** cached for reuse
5. **Team membership** cached for permission checks

---

## Related Documentation

- [API Reference](./API_REFERENCE.md) - API endpoints and request/response formats
- [Data Flow](./DATA_FLOW.md) - System architecture and data patterns
- [Features](./FEATURES.md) - Feature overview and implementation details
- [Testing Guide](./TESTING_GUIDE.md) - Testing approach and implementation details

---

_This documentation accurately reflects the Teaching Engine 2.0 database schema as implemented in the Prisma schema.prisma file. For questions or clarifications, refer to the project's GitHub repository or contact the development team._
