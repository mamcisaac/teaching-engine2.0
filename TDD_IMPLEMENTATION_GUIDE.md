# TDD Implementation Guide for Teaching Engine 2.0

## 🚦 Test Files Created (RED State)

This guide provides a complete roadmap for implementing all features using the Test-Driven Development approach. All test files have been created in RED state (failing) and are ready for implementation.

---

## 📋 Implementation Priority Order

### Phase 1: High Priority Features (Weeks 1-3)

#### 1. Lesson Completion Tracking (Issue #292) ⭐⭐⭐
**Files Created:**
- ✅ `/server/src/routes/__tests__/lesson-completions.test.ts`
- ✅ `/client/src/components/lesson-completion/__tests__/LessonCompletionCheckbox.test.tsx`
- ✅ `/client/src/hooks/__tests__/useLessonCompletions.test.ts`
- ✅ `/tests/e2e/lesson-completion-tracking.spec.ts`

**Implementation Steps:**
1. Create database migration for LessonCompletion model
2. Implement backend API endpoints (follow test specifications)
3. Create controlled checkbox component (NO internal state)
4. Implement useLessonCompletions hook (single instance only)
5. Integrate with TodayView
6. Run E2E tests to verify

**Critical Requirements:**
- Parent component manages ALL state
- Checkbox response < 100ms
- Zero console errors
- Must pass ALL verification gates

---

#### 2. Weekly Dashboard (Issue #305) ⭐⭐⭐
**Files Created:**
- ✅ `/tests/e2e/weekly-dashboard.spec.ts`

**Implementation Steps:**
1. Update router to redirect to /week after login
2. Implement drag-and-drop using react-dnd or similar
3. Add quick-add buttons to empty slots
4. Implement today highlight CSS
5. Add week navigation controls
6. Implement print styles

**Critical Requirements:**
- Must be default route after login
- Drag operations < 500ms
- Load time < 2 seconds
- Mobile responsive

---

#### 3. Quick Assessment Grid (Issue #312) ⭐⭐⭐
**Files Created:**
- ✅ `/server/src/routes/__tests__/quick-assessments.test.ts`

**Implementation Steps:**
1. Extend Assessment model for batch operations
2. Create 5x5 grid component for 25 students
3. Implement keyboard shortcuts (1-4 for levels)
4. Add auto-grouping algorithm
5. Integrate with Daybook
6. Add offline queue support

**Critical Requirements:**
- Assess 25 students in ≤ 90 seconds
- 4-level system: NOT_YET/APPROACHING/MEETING/EXCEEDING
- Generate differentiation groups
- Offline capable

---

### Phase 2: Critical Support Features (Weeks 4-5)

#### 4. Curriculum Coverage Dashboard (Issue #306) ⭐⭐
**Files Created:**
- ✅ `/tests/e2e/curriculum-coverage.spec.ts`

**Implementation Steps:**
1. Create coverage calculation service
2. Build subject-level progress bars
3. Implement uncovered expectations list
4. Add "Plan Lesson" quick actions
5. Create filter and search functionality
6. Add visual indicators

**Requirements:**
- Track all 68 Grade 1 expectations
- Load in < 2 seconds
- One-click lesson planning
- Virtualized lists for performance

---

#### 5. One-Click Substitute Plan (Issue #307) ⭐⭐
**Files Created:**
- ✅ `/tests/e2e/substitute-plan.spec.ts`

**Implementation Steps:**
1. Create SubstituteInfo settings form
2. Implement PDF generation service
3. Add "Sub Plan" button to Today/Week views
4. Build PDF template with sections
5. Add offline caching
6. Test on mobile devices

**Critical Requirements:**
- Must work at 6 AM on mobile
- One click generation
- Include all safety information
- Work offline

---

### Phase 3: Enhancement Features (Weeks 6-7)

#### 6. Per-Lesson Quick Reflections (Issue #308) ⭐
**Implementation Steps:**
1. Add reflection fields to DaybookEntry
2. Create inline reflection component
3. Implement autosave (2 second delay)
4. Add status chips (👍/👌/👎)
5. Create daily rollup panel
6. Integrate with Teaching Mode

---

#### 7. Planning Cascade View (Issue #309) ⭐
**Implementation Steps:**
1. Create hierarchical data API
2. Build collapsible tree component
3. Add expectation highlighting
4. Implement keyboard navigation
5. Add search/filter capability
6. Optimize for 500+ lessons

---

#### 8. Anecdotal Notes (Issue #318) ⭐
**Implementation Steps:**
1. Extend Assessment.notes field
2. Create quick note entry component
3. Add auto-context from lessons
4. Implement autosave
5. Mobile optimize for circulation

---

#### 9. Student Progress Dashboard (Issue #319) ⭐
**Implementation Steps:**
1. Create aggregation service
2. Build text-based summary component
3. Implement PDF report generation
4. Add parent-friendly formatting
5. Mobile optimize for conferences

---

## 🔄 TDD Workflow for Each Feature

### Step 1: RED Phase ❌
```bash
# Run the test to see it fail
npm test [test-file-name]

# Verify meaningful failure messages
# Commit the failing test
git commit -m "test: [RED] Add failing tests for [feature]"
```

### Step 2: GREEN Phase ✅
```bash
# Write minimal code to pass the test
# Run test again
npm test [test-file-name]

# All tests should pass
git commit -m "feat: [GREEN] Implement [feature] to pass tests"
```

### Step 3: REFACTOR Phase 🔄
```bash
# Improve code while keeping tests green
# Run tests after each change
npm test [test-file-name]

# Commit improvements
git commit -m "refactor: Improve [feature] implementation"
```

---

## 🏗️ Database Schema Requirements

### New Models Needed:

```prisma
model LessonCompletion {
  id               String   @id @default(uuid())
  userId           Int      
  lessonId         String   
  completedAt      DateTime @default(now())
  actualDuration   Int?     
  notes            String?  @db.Text
  wentWell         Boolean  @default(true)
  needsFollowUp    Boolean  @default(false)
  
  @@unique([userId, lessonId])
}

model DifferentiationGroups {
  id               String   @id @default(uuid())
  lessonId         String
  targetDate       DateTime
  reteachingIds    Int[]
  supportIds       Int[]
  independentIds   Int[]
  extensionIds     Int[]
  createdAt        DateTime @default(now())
}

model SubstituteInfo {
  id                String   @id @default(uuid())
  userId            Int      @unique
  classRoutines     String?  @db.Text
  attendanceLocation String?
  dismissalProcedures String? @db.Text
  emergencyContacts String?  @db.Text
  medicalAlerts     String?  @db.Text
  safetyProcedures  String?  @db.Text
  studentNotes      String?  @db.Text
  updatedAt         DateTime @updatedAt
}
```

---

## 🎯 Success Criteria Checklist

### For Each Feature Implementation:

#### Code Quality
- [ ] All tests passing (100%)
- [ ] Zero TypeScript errors
- [ ] Zero ESLint warnings
- [ ] Code coverage > 80%

#### Performance
- [ ] Response times meet requirements
- [ ] Mobile performance verified
- [ ] Memory usage acceptable
- [ ] Offline support working

#### User Experience
- [ ] Keyboard accessible
- [ ] Screen reader compatible
- [ ] Mobile responsive
- [ ] Error messages helpful

#### Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Manual testing completed

---

## 🚨 Common Pitfalls to Avoid

### 1. State Management
❌ **DON'T:** Create multiple instances of the same hook
✅ **DO:** Use single hook instance in parent, pass props to children

### 2. Test Manipulation
❌ **DON'T:** Change test expectations to make them pass
✅ **DO:** Fix the implementation to match test requirements

### 3. Optimistic Updates
❌ **DON'T:** Wait for server response before updating UI
✅ **DO:** Update immediately, rollback on error

### 4. Mobile Testing
❌ **DON'T:** Test only on desktop
✅ **DO:** Test every feature on mobile viewport

### 5. Accessibility
❌ **DON'T:** Add ARIA attributes as afterthought
✅ **DO:** Include accessibility from the start

---

## 📊 Testing Commands

### Run All Tests
```bash
# Backend tests
cd server && npm test

# Frontend tests  
cd client && npm test

# E2E tests
npm run test:e2e
```

### Run Specific Test File
```bash
# Backend
cd server && npm test lesson-completions.test.ts

# Frontend
cd client && npm test LessonCompletionCheckbox.test.tsx

# E2E
npm run test:e2e lesson-completion-tracking
```

### Run with Coverage
```bash
# Backend
cd server && npm run test:coverage

# Frontend
cd client && npm run test:coverage
```

### Watch Mode (Development)
```bash
# Frontend
cd client && npm run test:watch

# Backend
cd server && npm run test:watch
```

---

## 🔍 Verification Process

### Before Marking Any Feature Complete:

1. **Run all tests**
   ```bash
   npm run test:all
   ```

2. **Check TypeScript**
   ```bash
   npm run typecheck
   ```

3. **Check linting**
   ```bash
   npm run lint
   ```

4. **Manual testing**
   - Desktop browser
   - Mobile browser
   - Different screen sizes
   - Keyboard navigation
   - Screen reader

5. **Performance testing**
   - Response times
   - Memory usage
   - Network requests

6. **Documentation**
   - Update API docs
   - Update user guide
   - Add to changelog

---

## 📈 Progress Tracking

### Phase 1 (High Priority)
- [ ] Lesson Completion Tracking
- [ ] Weekly Dashboard
- [ ] Quick Assessment Grid

### Phase 2 (Critical Support)
- [ ] Curriculum Coverage
- [ ] Substitute Plans

### Phase 3 (Enhancements)
- [ ] Quick Reflections
- [ ] Planning Cascade
- [ ] Anecdotal Notes
- [ ] Student Progress

---

## 🎓 Learning Resources

### TDD Best Practices
- [Test-Driven Development by Example](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)
- [Growing Object-Oriented Software, Guided by Tests](https://www.amazon.com/Growing-Object-Oriented-Software-Guided-Tests/dp/0321503627)

### React Testing
- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing React Apps](https://jestjs.io/docs/tutorial-react)

### E2E Testing
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [E2E Testing Best Practices](https://testingjavascript.com/)

---

## 💡 Tips for Success

1. **Start with the test**: Always write the test first
2. **Keep tests simple**: One assertion per test when possible
3. **Test behavior, not implementation**: Focus on what, not how
4. **Use descriptive names**: Test names should explain the requirement
5. **Maintain test independence**: Tests shouldn't depend on each other
6. **Mock sparingly**: Prefer integration tests over heavy mocking
7. **Commit frequently**: Small, focused commits
8. **Refactor confidently**: Tests give you safety to improve

---

## 🚀 Getting Started

1. **Choose a feature** from Phase 1
2. **Read the test file** completely
3. **Run the test** to see it fail
4. **Implement incrementally** to make tests pass
5. **Refactor** once green
6. **Move to next test**
7. **Celebrate** when all tests pass!

---

## 📞 Support

If you encounter issues:
1. Check the test file for requirements
2. Review the GitHub issue for context
3. Consult the TDD_TEST_SUITE_SUMMARY.md
4. Ask for clarification on ambiguous requirements

Remember: The tests are the specification. Make them pass, and you've implemented the feature correctly!

---

*Happy Testing and Coding! 🎉*