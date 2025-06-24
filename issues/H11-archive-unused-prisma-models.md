## H11: Archive Unused Prisma Models and Dead Schema Fields

**Goal:** Clean up database schema by archiving legacy models and removing unused fields to improve maintainability.

**Success Criteria:**

- All legacy models moved to `schema.archive.prisma`
- Unused fields in active models removed
- Migration created to drop legacy tables
- Schema documentation updated
- No broken references in codebase

**Tasks:**

1. Create `/packages/database/prisma/schema.archive.prisma`
2. Move legacy models:
   - PlanningConversation
   - NewsletterTemplate
   - ActivityCollection
   - Any other unused models
3. Remove unused fields from active models:
   - User: remove legacy preference fields
   - CurriculumImport: check for unused metadata fields
4. Create migration to drop legacy tables:
   - `npx prisma migrate dev --name archive-legacy-models`
5. Update database documentation in `/packages/database/README.md`
