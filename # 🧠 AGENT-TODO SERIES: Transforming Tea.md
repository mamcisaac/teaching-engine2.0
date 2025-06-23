# 🧠 AGENT-TODO SERIES: Transforming Teaching-Engine 2.0 into Curriculum-Aligned Planning App

## 🎯 Project Goal
Restructure Teaching-Engine 2.0 to fully implement the planning model described in the ETFO resource *Planning for Student Learning*. The core model consists of five explicitly defined levels of planning:

1. **Curriculum Expectations** – Overall and Specific expectations extracted from official curriculum documents
2. **Long-Range Plans** – Year/term overview with proposed units, timelines, and high-level learning goals
3. **Unit Plans** – Medium-range plans with essential questions, assessment strategies, learning goals, cross-curricular connections
4. **Lesson Plans** – Individual or multi-day instructional sequences aligned to units and expectations
5. **Daybook Entries** – Daily planning logs with real-time notes, print-ready schedules, and reflection space

All five levels must exist as separate entities with clearly defined UI workflows, data models, and API endpoints. No legacy abstractions like "milestones" or "activities" should subsume multiple levels.

---

-- Carefully review Implementation Blueprint for ETFO-Aligned Planning Workflow.md and AGENT-todo.md

--

## ✅ PREREQUISITE TASKS (Setup and Cleanup)

### [A1] REMOVE FEATURE CREEP

#### Description
The current system contains modules for assessment building and student timelines. These are beyond the scope of this project.

#### Explicit Steps:
1. Identify all files, components, API routes, DB tables, and tests related to:
   - `assessment_builder`
   - `rubric`, `rubric_criteria`
   - `student_timeline`, `timeline_snapshots`
2. Delete these files and remove all relevant references in:
   - Frontend routing/navigation components
   - Backend route handlers and services
   - Prisma schema (drop related tables)
   - Remove migrations related to these features
3. Ensure newsletter generation code remains intact
4. Re-run build and test suite to verify no regressions

#### Success Criteria
- No trace of assessment or timeline code remains
- Application compiles and boots without error
- Newsletter still works as expected

---

## 🧱 CORE REFACTORING TASKS

### [B1] DEFINE PLANNING LEVEL MODELS

#### Description
Implement one database model per planning level. Each model should reflect the structure of planning templates found in *Planning for Student Learning* (ETFO, 2024).

#### Implementation Steps
Create the following Prisma models and migrations:

1. `CurriculumExpectation`
   - Fields: `id`, `subject`, `grade`, `code`, `type` ('overall' | 'specific'), `description`
   - Relationships: links to all planning levels

2. `LongRangePlan`
   - Fields: `id`, `teacherId`, `term`, `subject`, `title`, `overview`, `timelineJson`, `bigIdeas`, `learningGoals`, `assessmentStrategies`, `reflection`
   - Links: many-to-many with CurriculumExpectation

3. `UnitPlan`
   - Fields: `id`, `longRangePlanId`, `title`, `durationWeeks`, `bigIdeas`, `essentialQuestions`, `learningGoals`, `successCriteria`, `assessmentFor`, `assessmentAs`, `assessmentOf`, `crossCurricularLinks`, `reflection`
   - Links: many-to-many with CurriculumExpectation, many UnitPlans to one LongRangePlan

4. `LessonPlan`
   - Fields: `id`, `unitPlanId`, `title`, `date`, `learningIntention`, `successCriteria`, `activitiesJson`, `resources`, `accommodations`, `assessmentStrategy`, `reflection`
   - Links: many-to-many with CurriculumExpectation

5. `DaybookEntry`
   - Fields: `id`, `date`, `teacherId`, `summaryJson`, `linkedLessonIds`, `subNotes`, `endOfDayReflection`
   - Links: many-to-many with LessonPlan

#### Success Criteria
- All five models created
- Relationships and foreign keys enforced
- Models reflect exact fields used in book templates
- Covered by type-safe backend CRUD logic

### [B2] REMOVE LEGACY MODELS (milestone, activity, context)

#### Description
Old abstractions like `Milestone`, `Activity`, and `PlanningContext` must be removed.

#### Implementation Steps
1. Locate all frontend and backend code referencing these models
2. Migrate any necessary data to new LongRangePlan, UnitPlan, or LessonPlan records
3. Remove from Prisma schema and generate new migration
4. Delete frontend components using them
5. Refactor any remaining logic to use new planning flow

#### Success Criteria
- Legacy models are gone
- Nothing uses `milestone`, `activity`, or `context`
- App still boots and renders the dashboard without error





---

## 📥 [C1] IMPLEMENT AI-ASSISTED CURRICULUM IMPORT

### Description
This task enables the user to upload or select a Grade 1 French Immersion curriculum document (PEI English School Board), automatically extract structured expectations (Overall/Specific), and populate the planning workspace with editable curriculum records.

This is the entry point for all planning and the foundation for aligning Long-Range, Unit, Lesson, and Daybook plans.

### Frontend Steps
1. **Create Page `/curriculum-import`**
   - Options: "Upload curriculum PDF/DOCX" or "Select known curriculum"
   - File upload component (accept `.pdf`, `.docx`, `.txt`)
   - Dropdown selector: "PEI Grade 1 French Immersion"
   - Show loading state while AI extraction runs

2. **Display Review Interface**
   - Render subject breakdown: Subject → Expectation Blocks
   - Each expectation should have:
     - Type: Overall / Specific
     - Code (e.g., 1.1.3)
     - Text
     - Editable fields
   - Allow deletion, reordering, and inline corrections

3. **Final Confirmation Screen**
   - Summary of: subjects, number of expectations per subject
   - Button: "Create Curriculum Set"
   - On success, redirect to `/curriculum`

### Backend Steps
1. **Create Endpoint `POST /api/curriculum/import`**
   - Accept: uploaded file or `curriculumId` for preset
   - Return: structured JSON with parsed expectations

2. **Parsing Pipeline**
   - If file: Use `pdfplumber` or `PyMuPDF` to extract text
   - If preset: load static copy from `resources/curricula/pei-grade1.json`

3. **LLM Integration**
   - Chunk text into 1–2 page blocks
   - Prompt LLM: "Extract subject, grade, expectation code, type (overall/specific), and description"
   - Retry failed chunks and reassemble

4. **Temporary Staging Table**
   - Save results in a `CurriculumImportSession` (with teacherId, timestamp, content array)
   - Only commit to `CurriculumExpectation` table after user confirmation

5. **Validation**
   - Check all required fields
   - Ensure no expectations have identical code + text + subject duplicates

### Success Criteria
- Teachers can import curriculum via upload or known source
- Extracted expectations are accurate and editable
- System stores confirmed curriculum in `CurriculumExpectation`
- This set becomes the foundation for planning across all levels

---

## 🗂 [D1–D5] UI FOR PLANNING STAGES (ETFO-Aligned)

### [D1] CURRICULUM EXPECTATIONS UI

#### Purpose
Allow teachers to browse, search, edit, and filter the imported curriculum expectations (Overall and Specific) that serve as the foundation for all subsequent planning stages.

#### UI Design
- Page route: `/curriculum`
- Tabbed interface for each subject (e.g., Language Arts, Math, Science, etc.)
- Sub-tabs: "Overall Expectations" and "Specific Expectations"
- Filters:
  - Search box (text or code match)
  - Dropdown for type (Overall, Specific)
  - Checkbox toggle for "Included in Plans" vs "Unplanned"
- Table columns:
  - ✅ Selection checkbox
  - Code (e.g., 1.M.1)
  - Description (editable inline)
  - Linked Plans (badge count with hover details)

#### Success Criteria
- Teachers can view, edit, and select expectations
- Expectations track inclusion across planning levels

---

### [D2] LONG-RANGE PLANS UI

#### Purpose
Support creation of high-level year or term-long plans that define the major units to be taught, their sequencing, and the curriculum expectations they will address.

#### UI Design
- Page route: `/long-range`
- View type: Table layout + modal creation/edit
- Table columns:
  - Term (e.g., Term 1, Term 2)
  - Subject
  - Unit Title
  - Big Idea
  - Curriculum Expectations (multi-select from curriculum pool)
- Button: "Create Long-Range Plan"
- Modal Form Fields:
  - Term
  - Subject
  - Big Ideas
  - Overall Learning Goals
  - Timeline (weeks or date range)
  - Selected Expectations (typeahead multi-select)
  - AI: "Suggest Units From Expectations"

#### Success Criteria
- Teacher can create, edit, and delete Long-Range Plans
- Each Long-Range Plan links to expectations and enables Unit planning

---

### [D3] UNIT PLANS UI

#### Purpose
Allow teachers to develop scaffolded instructional units aligned to their Long-Range Plans, including assessments, learning goals, and links to curriculum expectations.

#### UI Design
- Page route: `/units`
- Unit list: collapsible cards or Kanban columns by term
- Card click opens modal editor
- Modal Fields:
  - Title
  - Duration (weeks or lesson count)
  - Big Ideas
  - Essential Questions
  - Learning Goals
  - Success Criteria
  - Assessment For/As/Of
  - Cross-Curricular Connections
  - Selected Expectations
  - Teacher Reflection Notes
  - AI button: "Generate Unit Plan Draft"

#### Success Criteria
- Teachers can generate, refine, and link Unit Plans
- Units can be filtered by subject, term, or plan origin

---

### [D4] LESSON PLANS UI

#### Purpose
Enable teachers to design instructional sessions based on Unit Plans, including step-by-step activities, timing, assessment checks, and linked expectations.

#### UI Design
- Page route: `/lessons`
- Calendar or list view with lesson title and date
- Click opens lesson editor pane
- Editor Fields:
  - Lesson Title
  - Date and Time
  - Duration
  - Learning Intention
  - Success Criteria
  - Intro → Instruction → Wrap-Up fields
  - Resources
  - Accommodations
  - Assessment Methods
  - AI button: "Generate Lesson Plan From Unit"

#### Success Criteria
- Teacher can plan each day’s lesson in structure aligned to ETFO
- AI drafts available and editable
- Lessons link directly to Unit Plans and expectations

---

### [D5] DAYBOOK UI

#### Purpose
Provide a daily view of teaching activities drawn from scheduled Lesson Plans, supporting printing, substitute prep, and teacher reflections.

#### UI Design
- Page route: `/daybook`
- Weekly grid view (Mon–Fri)
- Each day cell contains:
  - Lessons (auto-pulled from scheduled lesson plans)
  - Editable notes (e.g., class configuration, observations)
  - Print icons: “Print Day,” “Print Week,” “Supply Version”
  - Reflection textarea with autosave
- End-of-day prompt suggestions: “What went well?” “What will I change?”

#### Success Criteria
- Daybook reflects active lesson plans
- Entries are printable and exportable
- Reflections are captured per day
- Substitutes can use simplified version

---

---

## 🤖 [E1–E5] AI-FIRST-DRAFT INTEGRATIONS

### [E1] AI ASSISTANT SERVICE MODULE

#### Purpose
Centralize logic for all AI-assisted draft generation used throughout the planning workflow. This includes prompting, model interfacing, and result validation.

#### Implementation Steps
- Create `aiDraftService.ts` in `backend/services/`
- Provide a function for each AI stage (see E2–E5)
- Use OpenAI GPT-4 API with retry logic and function call fallback
- Log each request/response pair to support debugging
- Structure prompts to include:
  - Planning level and stage
  - Curriculum expectations as context
  - Prior linked content (e.g., long-range units → unit planning)

#### Example Usage
```ts
const draft = await aiDraftService.generateUnitPlan({
  expectations: [...],
  longRangePlanOverview: 'Living Things – 6 weeks – Term 1',
});
```

#### Success Criteria
- Reusable draft functions available for all levels
- Inputs and outputs strictly typed and documented

---

### [E2] CURRICULUM → LONG-RANGE PLAN DRAFTS

#### Purpose
Generate a set of 4–6 units for the year or term based on selected curriculum expectations. These become the teacher's Long-Range Plan.

#### Prompt Structure
```text
You are an instructional planning expert. Given the following Grade 1 curriculum expectations, generate a high-level year plan that breaks them into 4–6 instructional units. For each unit, provide:
- Unit Title
- Subject
- Term (Fall/Winter/Spring)
- Big Idea
- Linked expectations (codes only)
```

#### Inputs
- Selected expectations
- Subject and grade

#### Output
- Array of unit drafts with metadata for direct insertion into `LongRangePlan`

#### Success Criteria
- Units are coherent, curriculum-aligned, and well-distributed
- Big Ideas match expectation themes

---

### [E3] UNIT PLAN DRAFTS

#### Purpose
Help teachers jumpstart Unit planning by producing structured, editable drafts aligned to best practices.

#### Prompt Structure
```text
Create a detailed instructional unit plan for Grade 1 students based on the following expectations:
[Expectation list]
Return in structured format:
- Unit Title
- Big Ideas
- Essential Questions
- Learning Goals
- Success Criteria
- Assessment For/As/Of
- Cross-Curricular Opportunities
- Duration in weeks
```

#### Inputs
- Unit metadata
- Linked expectations

#### Output
- Draft matching structure of UnitPlan modal form

#### Success Criteria
- Teacher can approve/edit/replace draft
- Draft uses grade-appropriate language and pedagogical framing

---

### [E4] LESSON PLAN DRAFTS

#### Purpose
Rapidly draft full lesson plans from selected expectations and unit context, saving teacher time while ensuring alignment.

#### Prompt Structure
```text
Design a Grade 1 lesson for the following curriculum expectations and context:
Expectations: [...]
Unit Theme: “Living Things in Winter”
Include:
- Lesson Title
- Learning Intention
- Success Criteria
- Materials Required
- Step-by-step plan (Intro, Body, Wrap-up)
- Assessment Method
- Optional Accommodations
```

#### Inputs
- Lesson context (unit, date, duration)
- Expectations

#### Output
- Structured lesson fields for editing and saving

#### Success Criteria
- Output fills 75%+ of lesson fields
- Instruction is scaffolded and clear
- Draft is editable and can be saved directly

---

### [E5] DAYBOOK + SUB PLAN BUNDLES

#### Purpose
Automate weekly/daybook views and supply-teacher plans with summaries and AI-generated context for fast printing or export.

#### Prompt Structure
```text
Summarize the following scheduled lessons into a substitute-friendly plan. For each day:
- Provide an overview of activities
- Highlight key learning intentions
- List required materials
- Give a short teacher note
```

#### Inputs
- Lessons from calendar week
- School context metadata (e.g., class size, routines)

#### Output
- Printable daybook summary in markdown or HTML
- Optional PDF export for substitute plan

#### Success Criteria
- Substitute plan has clear instructional sequence
- Weekly bundle available for print/export

---