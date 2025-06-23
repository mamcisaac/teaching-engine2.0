# 🧠 AGENT-TODO SERIES: Transforming Teaching-Engine 2.0 into Curriculum-Aligned Planning App

## 🎯 Project Goal

Restructure Teaching-Engine 2.0 to fully implement the ETFO-style planning model described in _Planning for Student Learning_. This includes five distinct planning levels (Curriculum Expectations → Long-Range Plans → Unit Plans → Lesson Plans → Daybook Entries), structured data models, AI-supported workflows, and a streamlined UI aligned to the book’s templates.

---

## ✅ PREREQUISITE TASKS (Setup and Cleanup)

### [A1] REMOVE FEATURE CREEP

- 🔥 Remove Assessment Builder (code, DB models, UI)
- 🔥 Remove Student Timeline (code, DB models, UI)
- ✅ Retain Parent Newsletter system
- ✅ Ensure newsletter pulls only from planned activities + public reflections

---

-- Carefully review Implementation Blueprint for ETFO-Aligned Planning Workflow.md and AGENT-todo.md

## 🧱 CORE REFACTORING TASKS

### [B1] CREATE NEW PLANNING DATA MODELS

- [ ] Define and migrate DB schema for:
  - `CurriculumExpectation` (type, code, subject, grade, description)
  - `LongRangePlan`
  - `UnitPlan`
  - `LessonPlan`
  - `DaybookEntry`
- [ ] Define relationships:
  - Expectations linked to LongRange, Unit, and Lesson levels
  - DaybookEntries linked to LessonPlans and calendar dates

### [B2] RENAME AND DEPRECATE `Milestone`, `Activity`, and `PlanningContext`

- [ ] Delete or rename all legacy models that don’t map cleanly to ETFO levels
- [ ] Migrate any relevant data to the new structure or drop

---

## 💡 CURRICULUM IMPORT WORKFLOW

### [C1] AI-ASSISTED CURRICULUM IMPORT

- [ ] Create `/curriculum-import` page with:
  - [ ] Upload widget (PDF/DOCX)
  - [ ] Selector for known curricula (e.g., "PEI Grade 1 French Immersion")
- [ ] Backend extraction pipeline:
  - [ ] Parse and chunk PDF
  - [ ] Prompt OpenAI/GPT for curriculum breakdown by subject and expectations
  - [ ] Store extracted data to `CurriculumExpectation`
- [ ] Review UI:
  - [ ] Show extracted subjects → outcomes → details
  - [ ] Enable editing, deleting, correcting any fields
  - [ ] Save to database only after teacher confirms

---

## 📘 PLANNING WORKFLOW STAGES

### [D1] CURRICULUM EXPECTATIONS UI

- [ ] Page `/curriculum`:
  - [ ] List expectations with filters (subject, code, text)
  - [ ] Allow selecting which to cover in this school year
  - [ ] Track planned/unplanned coverage

### [D2] LONG-RANGE PLANS UI

- [ ] Page `/long-range`:
  - [ ] Form: Term, Subject, Big Ideas, Year Plan Overview
  - [ ] Table layout for Units: Unit Name | Term | Big Idea | Linked Expectations
  - [ ] Link selected expectations to this plan
  - [ ] Auto-enable Unit Plan creation for each row

### [D3] UNIT PLANS UI

- [ ] Page `/units`:
  - [ ] Template-based form with:
    - Title, Duration
    - Essential Questions
    - Learning Goals, Success Criteria
    - Assessment _For/As/Of_
    - Cross-Curricular Connections, Reflections
  - [ ] Inline AI assistance: generate draft from linked expectations

### [D4] LESSON PLANS UI

- [ ] Page `/lessons`:
  - [ ] Structured editor: Lesson Title, Date, Time, Instructional Flow (Intro–Body–Wrap), Assessment method
  - [ ] Select linked expectations (auto-filled from unit)
  - [ ] Inline reflection field, filled post-delivery
  - [ ] Suggest daily/weekly plan bundles

### [D5] DAYBOOK UI

- [ ] Page `/daybook`:
  - [ ] Daily calendar view
  - [ ] Auto-populate from scheduled LessonPlans
  - [ ] Print button for substitute plans
  - [ ] End-of-Day Reflection field

---

## 🤖 AI GENERATION TASKS (PER STAGE)

### [E1] SETUP AI ASSISTANT MODULE

- [ ] Create a `aiDraftService` module
- [ ] Connect to OpenAI API with structured prompts

### [E2] CURRICULUM → LONG-RANGE PLAN DRAFT

- [ ] Prompt: suggest 4–6 units from selected expectations
- [ ] Return: Unit Names, Big Ideas, Term Placement, Overall Goals

### [E3] UNIT PLAN DRAFT

- [ ] Prompt: for each Unit, generate:
  - Learning Goals
  - Success Criteria
  - Assessment suggestions
  - Essential Questions

### [E4] LESSON PLAN DRAFT

- [ ] Prompt: for selected expectation(s), generate:
  - Learning Intention
  - Step-by-step Instruction (Begin–Middle–End)
  - Success Criteria
  - Formative Assessment plan

### [E5] DAYBOOK BUNDLE GENERATOR

- [ ] Summarize daily schedule based on linked lessons
- [ ] Pre-fill reflection with guiding questions
- [ ] Include substitute-focused summary view

---

## 🧪 TESTS AND VALIDATION

### [F1] INTEGRATION TESTS

- [ ] Verify all stages create DB records with expected links
- [ ] Test curriculum coverage calculation
- [ ] Ensure navigation enforces planning order

### [F2] USER ACCEPTANCE TESTS

- [ ] Confirm that a teacher can:
  - Import curriculum
  - Build long-range plan from expectations
  - Create unit/lesson/daybook entries
  - Generate substitute-ready weekly plan

---

## 🧭 FINAL SUCCESS CHECKLIST

- [ ] No legacy planning objects remain
- [ ] UI reflects ETFO’s 5-stage structure
- [ ] AI assistance embedded in every stage
- [ ] Plans printable and reflect curriculum alignment
- [ ] Weekly/daybook bundles printable and shareable
- [ ] Curriculum expectations tracked for full coverage
