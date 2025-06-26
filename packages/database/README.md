# Teaching Engine 2.0 Database Package

This package contains the Prisma database schema and related tooling for Teaching Engine 2.0.

## 📊 Database Architecture

### Tech Stack
- **ORM**: Prisma 5.x
- **Development DB**: SQLite (local development)
- **Production DB**: PostgreSQL (deployment)
- **Migration Strategy**: Prisma Migrate

### Schema Organization

The database follows a **5-level ETFO-aligned planning hierarchy**:

1. **CurriculumExpectation** - Provincial curriculum outcomes
2. **LongRangePlan** - Yearly/term planning overview  
3. **UnitPlan** - Multi-week thematic units
4. **ETFOLessonPlan** - Individual lesson plans
5. **DaybookEntry** - Daily reflections and notes

## 🗃️ Core Model Groups

### 👨‍🏫 User & Authentication
- `User` - Teacher accounts and preferences
- `Subject` - Subject areas and languages

### 📅 Calendar & Scheduling  
- `CalendarEvent` - All calendar events (PD days, holidays, assemblies)
- `UnavailableBlock` - Time blocks when teaching isn't available

### 📚 ETFO Planning Models (Active)
- `CurriculumExpectation` - Curriculum outcomes and expectations
- `CurriculumExpectationEmbedding` - AI vector embeddings for clustering
- `LongRangePlan` / `LongRangePlanExpectation` - Annual planning
- `UnitPlan` / `UnitPlanExpectation` / `UnitPlanResource` - Unit planning
- `ETFOLessonPlan` / `ETFOLessonPlanExpectation` / `ETFOLessonPlanResource` - Lesson planning
- `DaybookEntry` / `DaybookEntryExpectation` - Daily reflections

### 🎯 Curriculum Intelligence (Phase 5)
- `CurriculumImport` - File import sessions (PDF, DOCX, CSV)
- `ExpectationCluster` - AI-generated outcome groupings

### 👨‍👩‍👧‍👦 Student Management
- `Student` - Student profiles
- `StudentGoal` - Student learning goals
- `StudentReflection` - Student reflection entries
- `StudentArtifact` - Student work samples
- `ParentSummary` - Parent communication summaries
- `ParentMessage` - Parent newsletters and messages

### 🔄 Substitute Teaching
- `ClassRoutine` - Classroom procedures for subs
- `SubPlanRecord` - Generated substitute plans

### 🎲 Activity Discovery (Phase 4)
- `ExternalActivity` - Activities from external sources (TPT, Khan Academy, etc.)
- `ActivityImport` - Teacher imports of external activities
- `ActivityRating` - Teacher ratings and reviews
- `ActivityCollection` / `ActivityCollectionItem` - Curated activity collections

## 🗄️ Archived Models

**Legacy models have been archived** as of Phase 5 (January 2025). See [`schema.archive.prisma`](./prisma/schema.archive.prisma) for:

### Archived Planning Models
- `PlanningConversation` → Replaced by ETFO planning workflow
- `AIGeneratedPlan` → Replaced by ETFOLessonPlan with AI integration
- `TeacherPreferences` → Simplified to User.preferredLanguage
- `ThematicUnit` → Replaced by UnitPlan

### Archived Organization Models  
- `MaterialList` → Replaced by UnitPlanResource/ETFOLessonPlanResource
- `Notification` → Integrated into ETFO workflow notifications
- `Newsletter` → Replaced by ParentMessage
- `ReportDeadline` → Replaced by CalendarEvent (CUSTOM type)
- `YearPlanEntry` → Replaced by LongRangePlan/UnitPlan
- `ShareLink` → Sharing simplified
- `EquipmentBooking` → Moved to external systems
- `Holiday` → Replaced by CalendarEvent (HOLIDAY type)

### Archived Daily Systems
- `OralRoutineTemplate` / `DailyOralRoutine` → Integrated into ETFOLessonPlan
- `ReflectionJournalEntry` → Replaced by DaybookEntry
- `SubstituteInfo` → Replaced by ClassRoutine

### Archived Media & Language Tools
- `MediaResource` → Moved to cloud storage with lesson plan references
- `CognatePair` → Moved to external vocabulary tools

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm package manager

### Development Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed database with sample data
pnpm db:seed

# Open Prisma Studio (database GUI)
pnpm db:studio
```

### Environment Configuration

Create a `.env` file:

```env
# Development (SQLite)
DATABASE_URL="file:./dev.db"

# Production (PostgreSQL)
# DATABASE_URL="postgresql://user:password@localhost:5432/teaching_engine"
```

## 🛠️ Available Scripts

```bash
# Generate Prisma client
pnpm db:generate

# Create and apply migrations
pnpm db:migrate

# Reset database (destructive!)
pnpm db:push --force-reset

# Seed database with test data
pnpm db:seed

# Open Prisma Studio
pnpm db:studio

# Validate schema
pnpm db:validate
```

## 📋 Migration Guide

### From Legacy Models to ETFO System

If you have existing data from legacy models, use these migration patterns:

#### Planning Migration
```typescript
// Old: AIGeneratedPlan → New: ETFOLessonPlan
// Old: ThematicUnit → New: UnitPlan
// Old: PlanningConversation → New: ETFO workflow
```

#### Organization Migration  
```typescript
// Old: MaterialList → New: UnitPlanResource + ETFOLessonPlanResource
// Old: YearPlanEntry → New: LongRangePlan + UnitPlan
// Old: ReportDeadline → New: CalendarEvent (type: CUSTOM)
```

#### Daily Systems Migration
```typescript
// Old: ReflectionJournalEntry → New: DaybookEntry
// Old: DailyOralRoutine → New: ETFOLessonPlan activities
// Old: SubstituteInfo → New: ClassRoutine
```

### Data Recovery

If you need to recover data from archived models:

1. Check git history for the archive date (January 2025)
2. Reference `schema.archive.prisma` for model definitions  
3. Use database backup files if available
4. Contact the development team for migration assistance

## 🔍 Development Guidelines

### Schema Changes
1. **Never modify production directly** - always use migrations
2. **Test migrations locally** before deploying
3. **Document breaking changes** in migration comments
4. **Archive unused models** rather than deleting immediately

### Model Design Principles
1. **ETFO Alignment** - Follow Ontario education standards
2. **Bilingual Support** - Include French fields where needed
3. **Audit Trail** - Include createdAt/updatedAt timestamps
4. **Relationships** - Use proper foreign keys and indexes
5. **Flexibility** - Use JSON fields for variable data structures

### Performance Considerations
1. **Index frequently queried fields** (userId, dates, status)
2. **Use pagination** for large result sets
3. **Optimize N+1 queries** with proper includes
4. **Monitor query performance** in production

## 🔧 Troubleshooting

### Common Issues

#### "Database not found"
```bash
# Reset and recreate database
pnpm db:push --force-reset
pnpm db:seed
```

#### "Prisma client out of sync" 
```bash
# Regenerate client
pnpm db:generate
```

#### "Migration conflicts"
```bash
# Check migration status
npx prisma migrate status

# Reset if needed (development only!)
npx prisma migrate reset
```

#### "Schema validation errors"
```bash
# Validate schema syntax
npx prisma validate

# Format schema file
npx prisma format
```

### Database Debugging

```bash
# View database contents
pnpm db:studio

# Export schema as SQL
npx prisma db pull

# Check migration history
ls -la migrations/
```

## 📈 Schema Statistics

### Current Active Models: **21 core models**
- Planning: 8 models (ETFO hierarchy)
- User/Student: 6 models  
- Activity Discovery: 4 models
- Calendar/Scheduling: 2 models
- Curriculum Intelligence: 3 models

### Archived Models: **18 legacy models**
- See `schema.archive.prisma` for complete list

### Total Relationships: **45+ foreign key relationships**
- Proper cascade deletes configured
- Indexes on all relationship fields

## 🤝 Contributing

### Making Schema Changes

1. **Create a feature branch** for schema changes
2. **Update the schema** in `prisma/schema.prisma`
3. **Generate migration** with descriptive name
4. **Test migration** thoroughly in development  
5. **Update this README** if adding new model groups
6. **Submit PR** with migration and documentation

### Migration Naming Convention
```bash
# Good examples:
npx prisma migrate dev --name add-lesson-plan-resources
npx prisma migrate dev --name archive-legacy-models  
npx prisma migrate dev --name optimize-curriculum-indexes

# Avoid generic names:
npx prisma migrate dev --name update
npx prisma migrate dev --name fix
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Teaching Engine 2.0 Project Goals](../../PROJECT_GOALS.md)
- [ETFO Planning Documentation](../../docs/agents/ETFO_PLANNING_GUIDE.md)
- [API Route Documentation](../../server/src/routes/README.md)

---

**Last Updated**: January 2025  
**Schema Version**: Phase 5 (ETFO-aligned with archived legacy models)  
**Maintainer**: Teaching Engine 2.0 Development Team