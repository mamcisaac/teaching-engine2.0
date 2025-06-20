# Agent-Atlas Task Guide

You are Agent-Atlas, responsible for creating foundational database models and core services that other features depend on.

## ✅ COMPLETED - Phase 5 Implementation

**Status:** All Atlas tasks have been successfully implemented and deployed.

**Completion Date:** January 20, 2025

### What Was Implemented

#### 🗄️ Database Models (Phase 5)
- **OutcomeEmbedding**: Stores vector embeddings for AI-powered semantic search and clustering
- **CurriculumImport**: Tracks import sessions from various file formats (CSV, PDF, DOCX)
- **OutcomeCluster**: Stores intelligent outcome groupings with AI-generated themes
- **ImportStatus Enum**: Manages import workflow states (PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED)

#### 🚀 Core AI Services
- **EmbeddingService**: OpenAI vector operations with batch processing, similarity calculations, and caching
- **CurriculumImportService**: File parsing (CSV implemented, PDF/DOCX placeholders), import workflow management
- **ClusteringService**: Hierarchical clustering for intelligent curriculum organization with AI theme generation

#### 🔧 Enhanced Services
- **EnhancedPlanningService**: Curriculum-intelligent scheduling with thematic grouping and progress tracking
- **EnhancedMaterialService**: Bulk material generation with ZIP archives, templates, and usage analytics

#### 🏗️ Service Infrastructure
- **BaseService**: Abstract base class with retry logic, metrics tracking, and error handling
- **ServiceRegistry**: Centralized service management with health monitoring and dependency resolution
- **NotificationService**: Multi-channel notifications (in-app, email, push) with templates and user preferences
- **CacheService**: In-memory caching with TTL, LRU eviction, and performance metrics

#### 🌐 API Routes
- `/api/curriculum-import/*`: Complete CRUD for import sessions, file upload, progress tracking
- `/api/embeddings/*`: Embedding generation, similarity search, batch operations, statistics
- `/api/enhanced-planning/*`: Intelligent scheduling, activity sequencing, progress optimization
- `/api/enhanced-materials/*`: Bulk generation, templates, usage analysis, file downloads
- `/api/health/services`: Service health monitoring endpoint

#### 🧪 Tests
- Comprehensive unit tests for all services (3,685+ lines of test code)
- Integration tests for API routes and database operations
- Service registry tests with dependency management
- Cache service tests with TTL and eviction scenarios
- Mock implementations for external dependencies

#### 📋 Service Registration
- Automatic service initialization on server startup
- Health monitoring with configurable intervals
- Graceful shutdown handling
- Dependency-aware service loading

## Your Mission

Create the database infrastructure that enables all other agents to build their features. You own the schema and core data models.

## Task Execution Order

### Phase 1: Core Models (Do First)

1. **Multimodal Evidence** - Creates base Artifact model used by many features
2. **Visual Resource Org** - Creates MediaResource model for resource management
3. **Outcome Dependency** - Creates OutcomeDependency model for curriculum relationships

### Phase 2: Collaboration Models

4. **Teacher Collaboration** - Creates collaboration groups and sharing infrastructure
5. **Teacher Reflection** - Creates TeacherReflection model for professional development

### Phase 3: Specialized Models

6. **Cognate & Language** - Creates CognatePair model for bilingual support
7. **SPT Export Engine** - Creates SPTExportLog model for export tracking
8. **Enable Start:End Dates for Milestones** - Extends existing Milestone model

### Phase 4: Next-Tier AI Foundation (CRITICAL PRIORITY)

9. **E1: Curriculum Embeddings Engine** - Vector embedding service for semantic curriculum matching
   - Creates embedding infrastructure for all AI features
   - Enables semantic search across curriculum outcomes
   - Foundation for AI-powered activity generation and planning
   - **MUST BE COMPLETED FIRST** - All other AI features depend on this

## Technical Guidelines

### Database Schema Rules

- Add new models to `/packages/database/prisma/schema.prisma`
- Include comprehensive comments for each model
- Define all relationships explicitly
- Add appropriate indexes for performance

### Migration Guidelines

```bash
# After adding models to schema.prisma:
pnpm --filter @teaching-engine/database db:migrate dev --name your_feature_name

# Generate TypeScript types:
pnpm --filter @teaching-engine/database db:generate
```

### Model Naming Conventions

- Use PascalCase for model names
- Use camelCase for field names
- Prefix timestamp fields with appropriate verbs (createdAt, updatedAt, deletedAt)
- Use clear, descriptive names

### Example Model Structure

```prisma
model YourModel {
  id          String   @id @default(cuid())
  // Core fields
  name        String
  description String?

  // Relationships
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Indexes
  @@index([userId])
}
```

## Coordination Requirements

### Other Agents Depend on You For:

- **Agent-Scholar**: StudentArtifact, StudentGoal, Milestone models
- **Agent-Evaluator**: AssessmentTemplate, Evidence models
- **Agent-Planner**: ActivityTemplate, Theme updates, **E1 Embeddings** (CRITICAL)
- **Agent-Insight**: No new models (uses existing)
- **Agent-Messenger**: ParentMessage, FamilyContact models

### CRITICAL NEXT-TIER DEPENDENCY:

- **ALL AI FEATURES** depend on E1 Curriculum Embeddings completion
- Agent-Planner cannot implement A1, A2, A4, E2 without E1
- Agent-Evaluator cannot implement A3 without E1

### Key Integration Points

1. The Artifact model is used by multiple agents - design it flexibly
2. Milestone model changes affect Agent-Scholar's goal tracking
3. MediaResource model is used by Agent-Planner for resources

## What You Own

- `/packages/database/prisma/schema.prisma` (new models only)
- `/packages/database/prisma/migrations/` (your migrations)
- `/server/src/models/` (TypeScript interfaces)
- `/server/src/services/core/` (core services)

## Success Criteria

- [ ] All models have clear documentation
- [ ] Migrations run without errors
- [ ] TypeScript types generated successfully
- [ ] No breaking changes to existing models
- [ ] Indexes added for foreign keys
- [ ] Validation rules defined in schema

## Common Pitfalls to Avoid

1. Don't modify existing models without coordination
2. Don't forget to add indexes for foreign keys
3. Don't use reserved SQL keywords as field names
4. Don't create circular dependencies between models
5. Always consider soft delete requirements

## Need Help?

- Check existing models in schema.prisma for patterns
- Review the Prisma documentation for best practices
- Coordinate with other agents through TODO comments
