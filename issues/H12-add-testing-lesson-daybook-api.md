## H12: Add Testing for Lesson + Daybook API Flows

**Goal:** Ensure critical ETFO planning flows are properly tested with integration tests covering the full teacher workflow.

**Success Criteria:**

- 90%+ test coverage for ETFO routes
- Integration tests for complete workflows
- Edge cases covered (missing data, conflicts)
- Performance benchmarks established
- CI/CD tests passing

**Tasks:**

1. Create `/server/tests/integration/etfo-lesson-plans.test.ts`:
   - CRUD operations
   - Expectation linking
   - Daybook entry creation
   - Substitute plan generation
2. Create `/server/tests/integration/etfo-workflow.test.ts`:
   - Full planning flow test
   - Curriculum → LRP → Unit → Lesson → Daybook
   - Coverage tracking
3. Add unit tests for services:
   - `reportGeneratorService.test.ts`
   - `curriculumImportService.test.ts`
   - `embeddingService.test.ts`
4. Add E2E tests in `/tests/e2e/`:
   - `teacher-planning-flow.spec.ts`
   - `curriculum-import.spec.ts`
5. Add performance benchmarks:
   - AI generation response times
   - Database query optimization
