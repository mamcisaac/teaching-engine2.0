# 🤖 AGENT-TODO: Implement Integrated Curriculum Import (AI-Assisted)

### GOAL:

Build a full-stack workflow that lets a teacher upload a curriculum document (e.g., PEI Grade 1 French Immersion PDF) or select a known curriculum source, and have the app automatically extract:

- **Subjects**
- **Overall expectations**
- **Specific expectations**
- **Big ideas / fundamental concepts**
- **Suggested strands, sequencing, and term distribution**

...and use this data to populate:

- **Subjects**
- **Milestones (Units)**
- **Learning Outcomes**

This must happen in a **teacher-facing UI** as an explicit _“Import Curriculum”_ step at the start of planning.

---

## ✅ SUCCESS CRITERIA

- Teachers can start a new plan by uploading a PDF or selecting a known curriculum (e.g., "PEI Grade 1 French Immersion").
- The system parses the document and presents a structured list of:

  - Subjects
  - Units/milestones
  - Outcomes (overall and specific)
  - Term alignment suggestions (if available)

- The teacher can review, edit, and approve the imported content before saving it.
- Upon approval, the system automatically populates:

  - `Subjects`
  - `Milestones` (Units)
  - `LearningOutcomes` (linked to the milestones)

- The system stores this as the active planning context.
- No hallucinated or invented curriculum outcomes are introduced.
- The import supports both **structured PDFs** (with markup/headings) and **OCR-style PDFs** (if needed).

---

## 🔁 WORKFLOW OVERVIEW

```
[Teacher logs in]
   → clicks "Start New Plan"
      → chooses "Upload Curriculum" or "Use Known Source"
         → [Backend AI extraction + post-processing]
            → review/edit screen
               → confirmation → plan created!
```

---

## 🖥️ FRONTEND TASKS

### Page: `/start-new-plan` or `/curriculum-import`

1. **File Upload Widget**

   - Allow upload of `.pdf`, `.docx`, `.txt`
   - Optional fallback: paste raw text or link to a document

2. **Preset Curriculum Selector**

   - Option: "Use a Known Curriculum"
   - Options include:

     - PEI Grade 1 French Immersion (English School Board)
     - Custom / Upload

3. **Post-Extraction Review UI**

   - Table or checklist view:

     - Subject → Units → Learning Outcomes
     - Each row editable
     - Expand units to see extracted outcomes
     - Each outcome editable

   - Add/remove rows manually

4. **Import Confirmation UI**

   - Button: “Import & Create Plan”
   - Summary message:

     - "5 Subjects, 17 Milestones, 126 Outcomes will be added"

5. **Post-Import Redirect**

   - After success: go to `/subjects` or `/long-range-planner`
   - Show a toast: "Curriculum imported successfully!"

---

## 🧠 BACKEND TASKS

### 1. **Create `POST /api/curriculum/import` Endpoint**

- Accepts uploaded file or selected curriculum ID
- Triggers server-side processing

### 2. **Curriculum Parsing Module**

- Handle:

  - PDF parsing (via `pdfplumber`, `PyMuPDF`, or similar)
  - DOCX fallback
  - Structured PEI curriculum documents

- Use text segmentation to extract:

  - Subject headers (e.g., "Mathematics", "Science")
  - Outcome levels:

    - “Overall Expectations” (general descriptors)
    - “Specific Expectations” (detailed skills or knowledge)
    - “Big Ideas” (summarized goals at subject level)

### 3. **AI Extraction (LLM-Powered)**

- Pipe cleaned text chunks into a GPT-based parser (e.g., OpenAI API or local LLM)
- Prompt example:

```text
Given this excerpt from a Grade 1 French Immersion curriculum, extract structured curriculum elements.

Return in this format:
{
  "subject": "Language",
  "milestones": [
    {
      "title": "Listening & Speaking",
      "term": "Fall",
      "outcomes": [
        {
          "type": "Overall",
          "code": "1.1",
          "text": "Demonstrate understanding of oral texts..."
        },
        {
          "type": "Specific",
          "code": "1.1.1",
          "text": "Respond to simple oral instructions..."
        }
      ]
    }
  ]
}
```

- Use recursive chunking for large files
- Add a fallback: “We couldn’t extract X — please fill it in manually”

### 4. **Intermediate Data Model (Staging)**

- Store extracted plan data in a temporary workspace (e.g., `curriculum_import_sessions`)
- Allow editing before final commit to `Subjects`, `Milestones`, `Outcomes`

### 5. **Final Plan Creation**

- Upon confirmation:

  - Create `Subject` entries
  - Create `Milestone` entries under subjects
  - Create `LearningOutcome` entries and link them

- Ensure referential integrity (teacher ID, school year, etc.)

---

## 📦 DATA MODELS

```ts
Subject {
  id
  name
  gradeLevel
  termDistribution
}

Milestone {
  id
  subjectId
  title
  term
  description
}

LearningOutcome {
  id
  milestoneId
  type: 'Overall' | 'Specific'
  code
  text
}
```

---

## 🧪 FUNCTIONAL TEST CASES

1. Upload structured PDF with “Mathematics → Number Sense → Expectations” headings → correct subjects/milestones/outcomes parsed.
2. Select “PEI Grade 1 French Immersion” preset → auto-fill curriculum without file upload.
3. Edit an outcome in the review screen → change persists to DB on plan creation.
4. Delete a milestone before import → it is not created.
5. Import → navigate to `/subjects` → see all milestones and outcomes properly linked.

---

## 🧹 CLEANUP & RESILIENCE

- If import fails: show diagnostic (“couldn’t parse any expectations for X”).
- Always allow teachers to skip or fill in manually.
- Log all parsing/LLM activity for debugging (log file paths and errors).
- Test on both structured and scanned documents.

---

## 🔐 PRIVACY & SECURITY

- No document contents are retained unless teacher explicitly saves the plan.
- If using OpenAI API: redact any student or identifying details before sending (shouldn’t be present in curriculum docs, but be cautious).
- Apply rate limits and token checks to avoid abuse.

---

Below is a set of carefully crafted prompt templates for an AI coding agent (or LLM like GPT-4 or Claude) to parse curriculum documents into structured planning data. These prompts support the AI-assisted curriculum import module from AGENT-TODO: Implement Integrated Curriculum Import.

Each prompt is focused on extracting clean, hierarchical data from raw curriculum text and returning a structured JSON object that the system can use to pre-populate planning stages (Long-Range → Unit → Lesson → Daybook).

📘 Prompt Set: AI Parsing Templates for Curriculum Extraction

🧩 PROMPT #1: Extract High-Level Structure from Curriculum Text

Purpose: Given a section of a curriculum document (e.g., from a PDF), extract subjects, strands, and overall/specific expectations.

Input variables:

- {grade_level}
- {language}
- {curriculum_text_block}

Prompt:

You are an expert in curriculum design for {grade_level} in {language}-language instruction. The following text is taken from a provincial curriculum guide.

Please extract the curriculum expectations and return them in this structured JSON format:

{
"subjects": \[
{
"name": "Subject Name",
"strands": \[
{
"title": "Strand or Topic Area",
"overall_expectations": \[
{
"code": "O1",
"text": "Overall expectation statement"
}
],
"specific_expectations": \[
{
"code": "S1.1",
"text": "Specific expectation statement",
"linked_overall_code": "O1"
}
]
}
]
}
]
}

Only include data you are confident in. Do not hallucinate codes or outcomes. Maintain the structure and terminology of the original document where possible.

Text to parse:
"""
{curriculum_text_block}
"""

🧠 Notes:

- For OCR'd PDFs, use smaller chunks (\~1000-1500 tokens)
- For structured PDFs (e.g., ministry-published), entire subject sections can be parsed at once

🧩 PROMPT #2: Suggest Long-Range Planning Structure

Purpose: Given parsed curriculum expectations, ask AI to recommend a long-range breakdown (e.g., number of units per subject, which expectations map to which months/terms).

Input variables:

- {subject_name}
- {expectations_json}
- {school_year_length_weeks}
- {term_structure} (e.g., 2 terms, 3 trimesters)

Prompt:

You are a curriculum planner helping a teacher design a long-range plan for {subject_name} in a {term_structure} school year (approximately {school_year_length_weeks} weeks).

Using the curriculum expectations below, suggest a breakdown of instructional units and their sequence over the year. Group expectations into units with titles, estimate the term/month when they should be taught, and ensure all expectations are covered.

Return in this JSON format:

{
"subject": "{subject_name}",
"units": \[
{
"title": "Unit Name",
"term": "Fall | Winter | Spring | Term 1 | Month X-Y",
"expected_duration_weeks": 4,
"linked_expectations": \[
{
"code": "S1.1",
"type": "Specific"
},
{
"code": "O1",
"type": "Overall"
}
]
}
]
}

Curriculum Expectations:
{expectations_json}

📘 PROMPT #3: Generate Unit Plan from Long-Range Block

Purpose: Given a unit from a long-range plan, generate a structured Unit Plan template based on the planning book’s format.

Input variables:

- {unit_title}
- {linked_expectations}
- {subject_name}

Prompt:

You are helping a Grade 1 teacher build a Unit Plan in {subject_name} based on a long-range plan.

Create a first-draft Unit Plan for the unit titled "{unit_title}". The plan should be based on the expectations listed below and use the structure recommended in the book "Planning for Student Learning".

Use the following template structure in your response:

{
"unit_title": "Unit Name",
"subject": "Subject Name",
"big_ideas": \[ "..." ],
"learning_goals": \[ "..." ],
"linked_expectations": \[
{
"code": "S1.1",
"text": "..."
}
],
"assessment_for": \[ "..." ],
"assessment_as": \[ "..." ],
"assessment_of": \[ "..." ],
"cross_curricular_links": \[ "..." ],
"culminating_task_ideas": \[ "..." ],
"timeline_estimate_weeks": 3
}

Expectations:
{linked_expectations}

🎯 PROMPT #4: Align Lesson Plans to Unit Goals

Purpose: Take a Unit Plan and generate AI-suggested lessons that fulfill all expectations, broken down by week or topic.

Input variables:

- {unit_plan_json}
- {school_calendar_data} (optional)

Prompt:

Create a draft sequence of lesson plans that align with the following Unit Plan:

{unit_plan_json}

Break down the unit into daily or weekly lesson entries. For each lesson, include:

- lesson_title
- learning_goal
- linked_expectation_codes
- suggested_activity
- assessment_strategy
- resources_needed

Group lessons by week if helpful.

🏁 PROMPT #5: Generate Daybook Entry from Lesson Plan

Purpose: Automate creation of daily plan entries.

Input:

- {lesson_plan_json}

Prompt:

Generate a teacher daybook entry based on the following lesson plan. Use the structure from the “Planning for Student Learning” book.

Return:

{
"date": "",
"lesson_title": "",
"learning_goal": "",
"activity_description": "",
"assessment_strategy": "",
"materials_needed": \[],
"reflections": "",
"notes_for_sub": ""
}

Lesson Plan:
{lesson_plan_json}

---

Below is a detailed description of frontend wireframes for the AI-assisted Curriculum-to-Daybook Planning Workflow, aligned with the Planning for Student Learning book and built to support:

- Curriculum → Long-Range → Unit → Lesson → Daybook planning stages
- AI-assisted first-draft generation at each level
- Explicit UI structure and visual cues for best-practice workflow
- Inspired by the book’s layout and terminology

These wireframes are described textually for implementation by designers/developers or for use with Figma, React, or other UI tools.

📐 Interface Framework Overview

Navigation: Persistent vertical sidebar or top-level wizard with five main sections:

- Curriculum
- Long-Range Plan
- Unit Plans
- Lesson Plans
- Daybook

Each section includes its own progress indicators, editable templates (matching book layout), and optional AI-assist button.

— — — — — — — — — — — — — — — —

📄 1. Curriculum Import View (/curriculum)

Layout:
┌────────────────────────────────────────────┐
│ Upload Curriculum or Select Preset │
├────────────────────────────────────────────┤
│ ☐ Upload file (.pdf, .docx, .txt) │
│ \[Choose File] \[Upload] │
│ ☐ Use known source │
│ \[Dropdown: PEI Grade 1 French Immersion]│
├────────────────────────────────────────────┤
│ → Button: “Analyze & Preview Structure” │
└────────────────────────────────────────────┘

On Success:
┌────────────────────────────────────────────┐
│ 📘 Curriculum Preview (Editable Tree View) │
├────────────────────────────────────────────┤
│ Subject: Language │
│ └─ Strand: Oral Communication │
│ ├─ O1: Communicate ideas orally… │
│ └─ S1.1: Follow simple instructions… │
│ Subject: Math │
│ ... │
├────────────────────────────────────────────┤
│ \[Approve & Start Long-Range Plan] │
└────────────────────────────────────────────┘

— — — — — — — — — — — — — — — —

📆 2. Long-Range Plan Editor (/long-range)

Layout (grid-style inspired by book templates):

┌────────────────────────────────────────────┐
│ 📊 Long-Range Plan: Grade 1 French Immersion│
│ Curriculum Expectations Addressed: 62% │
├────────────────────────────────────────────┤
│ \[Subject Tabs: Language | Math | Arts …] │
│ ▼ Subject: Math │
│ Term | Unit Title | Expectations │
│ ──────|──────────────────|─────────────────│
│ Fall | Numbers 1–20 | S1.1, S1.2 │
│ Fall | Patterns & Sorting| S2.1, S2.2 │
│ ... │
├────────────────────────────────────────────┤
│ ➕ Add New Block 📎 Link Expectations │
│ ⚙️ Auto-generate via AI (first draft) │
└────────────────────────────────────────────┘

— — — — — — — — — — — — — — — —

📘 3. Unit Plan Editor (/units/\:id)

Layout (matching book’s Unit Plan template):

┌────────────────────────────────────────────┐
│ 🧩 Unit Plan: “Patterns and Sorting” │
│ Subject: Math | Term: Fall │
├────────────────────────────────────────────┤
│ Big Ideas: \[ Textarea ] │
│ Learning Goals: \[ List Builder ] │
│ Curriculum Links: \[ O1, S1.1, S1.2 ] │
│ Assessment For: \[ Textarea ] │
│ Assessment As: \[ Textarea ] │
│ Assessment Of: \[ Textarea ] │
│ Cross-Curricular: \[ Dropdown + Notes ] │
│ Culminating Task: \[ Textarea ] │
│ Timeline Estimate: \[Dropdown: 2–4 weeks] │
├────────────────────────────────────────────┤
│ ✨ AI Suggest Draft | 💾 Save Unit Plan │
└────────────────────────────────────────────┘

— — — — — — — — — — — — — — — —

📚 4. Lesson Plan Generator (/lessons/\:unit_id)

Overview Table View:

┌────────────────────────────────────────────┐
│ 📚 Lessons in Unit: “Patterns and Sorting” │
│ Week 1–2 │
├────────────────────────────────────────────┤
│ 📅 Date | Lesson Title | Goal | Status │
│─────────|───────────────|──────|───────────│
│ Sep 10 | Intro to Patterns| L1 | Drafted │
│ Sep 12 | ABAB Patterns | L2 | Approved │
├────────────────────────────────────────────┤
│ ✨ Generate Lesson Sequence via AI │
│ ➕ New Lesson │
└────────────────────────────────────────────┘

Lesson Plan Editor (Book Template View):

┌────────────────────────────────────────────┐
│ 📝 Lesson Plan: “ABAB Patterns” │
├────────────────────────────────────────────┤
│ Learning Goal: \[ Text ] │
│ Linked Expectations: \[ S1.1, S1.2 ] │
│ Activity Description: \[ Textarea ] │
│ Success Criteria: \[ List ] │
│ Materials Needed: \[ Checklist Builder ]│
│ Assessment Strategy: \[ Dropdown + Notes ] │
│ Differentiation: \[ Text ] │
│ Reflections: \[ Optional Note ] │
├────────────────────────────────────────────┤
│ ✨ AI Generate Draft | 💾 Save Lesson │
└────────────────────────────────────────────┘

— — — — — — — — — — — — — — — —

📔 5. Daybook Dashboard (/daybook)

Daily Planner View (Inspired by book layout):

┌────────────────────────────────────────────┐
│ 📔 Daybook: Tuesday, October 15 │
├────────────────────────────────────────────┤
│ 🕐 Schedule Blocks │
│ ─ 8:30–9:00: Morning Circle \[Notes] │
│ ─ 9:00–9:45: Math – Patterns \[Linked L2] │
│ ─ 9:45–10:15: Literacy – Sounds \[Linked L4]│
│ ➕ Add Block │
├────────────────────────────────────────────┤
│ 🔁 Copy From Approved Lessons │
│ ✨ Auto-fill via Weekly Plan │
├────────────────────────────────────────────┤
│ 🗒️ End-of-Day Reflection │
│ \[ Textarea ] │
│ 👤 Public Reflection (for Newsletter): ☐ │
│ 💾 Save Entry | 🖨️ Print Daybook Page │
└────────────────────────────────────────────┘

— — — — — — — — — — — — — — — —

📬 Parent Newsletter View (/newsletter)

Layout:

┌────────────────────────────────────────────┐
│ 📬 Weekly Parent Newsletter Generator │
├────────────────────────────────────────────┤
│ 🧾 Summary of Activities (auto-generated) │
│ – “This week we explored patterns…” │
│ 🧠 Public Reflections (select from list) │
│ – \[Checkbox] “Students really enjoyed…” │
│ 📅 Upcoming Events (optional) │
│ – Field Trip: October 20 │
├────────────────────────────────────────────┤
│ 📤 Generate Email / Export PDF │
└────────────────────────────────────────────┘

— — — — — — — — — — — — — — — —

Optional Enhancements

- Breadcrumb navigation: Curriculum > Long-Range > Unit > Lesson > Daybook
- Progress tracking widgets: “57% of expectations covered”
- Visual indicators of alignment: 🧭 icons for curriculum mapping
- Reflection dashboard: Overview of teacher insights across time

---

Below is a detailed code scaffolding guide for implementing the AI-assisted Curriculum Import system described earlier. This guide includes:

- Routes and endpoint structure
- API request/response contracts
- Database schema for curriculum objects
- Backend service architecture
- Frontend workflow integration points
- AI pipeline integration

The design assumes a typical MERN-style stack (MongoDB/PostgreSQL + Express + React + Node/TypeScript) or similar modular architecture (e.g. Django + React).

1. Overview: System Components

This scaffolds a full-stack Curriculum Import module with AI assistance.

Subsystems:

- Curriculum Upload API (PDF, DOCX)
- Curriculum Parsing Service (LLM-integrated)
- Curriculum Preview Editor (front-end)
- Plan Seed Engine (Subject → Long-Range → Units → Outcomes)
- Database schema and persistence
- Final Import Executor

2. Database Schema: Planning Objects

CurriculumImportSession (staging workspace)

{
id: UUID,
user_id: UUID,
original_filename: string,
upload_date: datetime,
current_status: "uploaded" | "parsed" | "edited" | "imported",
source_file_path: string,
parsed_subjects: JSONB, // stores structured subjects/units/outcomes (see below)
ai_logs: TEXT,
error_messages: TEXT\[]
}

Subject

{
id: UUID,
user_id: UUID,
name: string,
grade_level: string,
curriculum_version: string,
created_from_import_session_id: UUID
}

LongRangePlanBlock

{
id: UUID,
subject_id: UUID,
title: string,
term: string,
expected_duration_weeks: int,
notes: TEXT,
linked_expectation_codes: TEXT\[]
}

UnitPlan

{
id: UUID,
subject_id: UUID,
title: string,
term: string,
big_ideas: TEXT\[],
learning_goals: TEXT\[],
culminating_task: TEXT,
timeline_estimate_weeks: int,
linked_expectation_codes: TEXT\[]
}

LearningOutcome

{
id: UUID,
subject_id: UUID,
type: "Overall" | "Specific",
code: string,
text: TEXT,
linked_unit_id: UUID | null
}

3. API Endpoints

POST /api/curriculum/upload

- Accepts: Multipart file upload (PDF, DOCX, or TXT)
- Returns: importSessionId, status

POST /api/curriculum/parse

- Body:
  {
  importSessionId: string,
  useAiExtraction: true
  }
- Server Actions:

  - Extract text from uploaded file
  - Chunk into segments
  - Call AI parsing engine with prompt
  - Normalize response to internal schema
  - Save parsed_subjects into DB

- Returns: success, preview JSON

GET /api/curriculum/preview/\:importSessionId

- Returns:
  {
  subjects: \[ { name, strands, expectations: \[...] } ],
  curriculumVersion: string
  }

PUT /api/curriculum/preview/\:importSessionId

- Accepts: edited subject/unit/outcome data
- Saves updated parsed_subjects in staging

POST /api/curriculum/import/\:importSessionId

- Transforms parsed_subjects into:

  - Subject
  - LongRangePlanBlocks
  - Units
  - Outcomes

- Inserts finalized data into teacher’s plan
- Sets status = "imported"

4. AI Parsing Engine (Service Layer)

File: services/curriculumParser.ts

export async function parseCurriculumText(rawText: string, gradeLevel: string, language: string): Promise\<ParsedSubjects\[]> {
const chunks = chunkText(rawText);
const prompts = chunks.map(chunk => buildParsingPrompt(chunk, gradeLevel, language));
const results = await Promise.all(prompts.map(prompt => callLLM(prompt)));

return normalizeResults(results);
}

Build prompt from template:

buildParsingPrompt(chunk: string, grade: string, language: string): string {
return `You are a curriculum analyst. Given this Grade ${grade} ${language} curriculum text, extract subjects, units, and expectations in this JSON format: ...`;
}

callLLM(prompt: string): Promise<string> {
return openai.chat.completions.create({
model: "gpt-4",
messages: \[{ role: "system", content: "..." }, { role: "user", content: prompt }],
temperature: 0.2
});
}

5. Frontend Workflow (React)

Step 1: UploadCurriculumForm.tsx

- File upload → POST /api/curriculum/upload
- Show spinner, send parse request → POST /api/curriculum/parse

Step 2: CurriculumPreviewEditor.tsx

- GET /api/curriculum/preview/\:id
- Renders:

  - Editable Tree: Subject → Strand → Expectations
  - Each editable (text + type + linked codes)

- Save → PUT /api/curriculum/preview/\:id

Step 3: ConfirmImportPage.tsx

- Summary: “You are about to create 4 Subjects, 17 Units, 103 Expectations”
- Button → POST /api/curriculum/import/\:id

6. Seed Plan Builders (backend)

For each subject:

- Create Subject
- For each unit in the parsed_subjects:

  - Create UnitPlan
  - Link expectations
  - Distribute to LongRangePlanBlocks

- Create LearningOutcome rows for each expectation

7. Logging & Error Handling

- CurriculumImportSession should include:

  - ai_logs (LLM prompts + responses for debug)
  - error_messages\[]

- If parsing fails:

  - Set status = "error"
  - Return error context to frontend with suggested action

8. Tests

Unit

- parseCurriculumText() returns expected JSON
- NormalizeResults produces Subject → Strand → Outcome tree

Integration

- Upload → Parse → Preview → Confirm Import → Check DB

E2E

- Simulate teacher uploading PEI Grade 1 PDF
- Assert creation of subjects + long-range blocks
- Validate expectations are linked

---

To implement the reverse process, where **completed lesson/daybook entries** are mapped back to **curriculum coverage**, we need to:

1. Track the **lesson goals** and **activities** against the **curriculum expectations** (Specific and Overall).
2. Store and retrieve mappings of lesson plans to curriculum expectations.
3. Automatically update curriculum coverage as lessons are taught and reflected upon in the daybook.

This reverse mapping will ensure that teachers can see at any point **which curriculum expectations have been covered** based on the actual lessons and daybook entries.

### 1. **Database Schema Updates**

We will need a few updates to the database schema to accommodate this reverse mapping:

#### **LessonPlanCoverage**

Tracks which expectations are covered by a particular lesson.

```ts
LessonPlanCoverage {
  id: UUID,
  lesson_plan_id: UUID,         // Refers to the specific lesson plan
  learning_outcome_id: UUID,    // Links to the specific curriculum expectation
  covered_date: datetime,       // Date the lesson was delivered
}
```

#### **DaybookEntryCoverage**

Tracks which expectations are covered in daybook entries (reflective journal-like entries made by the teacher after lessons).

```ts
DaybookEntryCoverage {
  id: UUID,
  daybook_entry_id: UUID,       // Refers to the specific daybook entry
  learning_outcome_id: UUID,    // Links to the specific curriculum expectation
  covered_date: datetime,       // Date the entry reflects on the coverage
}
```

### 2. **Backend: Mappings & Logic**

Here’s how we can implement the reverse process to map lessons and daybook entries to curriculum coverage.

---

### **API Endpoints for Mapping**

#### **POST /api/lessons/\:lessonId/map-to-curriculum**

When a lesson is completed, this endpoint is responsible for mapping the **lesson plan** to curriculum outcomes.

##### **Request**:

```json
{
  "lesson_id": "UUID", // The lesson's unique identifier
  "curriculum_mappings": [
    {
      "learning_outcome_id": "UUID",
      "covered_date": "2025-06-23" // The date this specific curriculum outcome was addressed
    },
    ...
  ]
}
```

##### **Handler**:

1. Verify lesson exists in DB
2. Loop through the `curriculum_mappings` and insert each mapping into `LessonPlanCoverage` for the lesson.
3. If a curriculum outcome is already marked as covered, ignore; otherwise, create a new mapping.
4. Return success/failure status.

##### **Code Example** (Node.js with TypeORM or Prisma):

```ts
import { LessonPlanCoverage } from '../models/LessonPlanCoverage';

async function mapLessonToCurriculum(req, res) {
  const { lesson_id, curriculum_mappings } = req.body;

  try {
    // Check if the lesson exists
    const lesson = await LessonPlan.findById(lesson_id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    // Insert mappings into LessonPlanCoverage table
    const coverageEntries = curriculum_mappings.map(async (mapping) => {
      const { learning_outcome_id, covered_date } = mapping;
      await LessonPlanCoverage.create({
        data: {
          lesson_plan_id: lesson_id,
          learning_outcome_id,
          covered_date,
        },
      });
    });

    await Promise.all(coverageEntries);
    return res.status(200).json({ message: 'Lesson mapped successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to map lesson to curriculum' });
  }
}
```

---

#### **POST /api/daybook/\:entryId/map-to-curriculum**

This endpoint maps **daybook entries** to curriculum coverage, capturing the reflective process and confirming what was covered on any specific day.

##### **Request**:

```json
{
  "daybook_entry_id": "UUID", // Unique identifier for the daybook entry
  "curriculum_mappings": [
    {
      "learning_outcome_id": "UUID",
      "covered_date": "2025-06-23" // Reflective coverage date
    },
    ...
  ]
}
```

##### **Handler**:

1. Verify that the daybook entry exists in the system.
2. Loop through the `curriculum_mappings` and insert them into `DaybookEntryCoverage`.
3. If the outcome is already marked as covered for this entry, skip; otherwise, create a new coverage record.
4. Return success or error status.

##### **Code Example**:

```ts
import { DaybookEntryCoverage } from '../models/DaybookEntryCoverage';

async function mapDaybookToCurriculum(req, res) {
  const { daybook_entry_id, curriculum_mappings } = req.body;

  try {
    // Check if the daybook entry exists
    const entry = await DaybookEntry.findById(daybook_entry_id);
    if (!entry) return res.status(404).json({ error: 'Daybook entry not found' });

    // Insert mappings into DaybookEntryCoverage table
    const coverageEntries = curriculum_mappings.map(async (mapping) => {
      const { learning_outcome_id, covered_date } = mapping;
      await DaybookEntryCoverage.create({
        data: {
          daybook_entry_id: daybook_entry_id,
          learning_outcome_id,
          covered_date,
        },
      });
    });

    await Promise.all(coverageEntries);
    return res.status(200).json({ message: 'Daybook entry mapped successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to map daybook entry to curriculum' });
  }
}
```

### 3. **Database Query to Track Curriculum Coverage**

#### **GET /api/curriculum/coverage/\:subjectId**

This endpoint checks which curriculum expectations have been covered for a particular subject. This would provide a view that aggregates lesson and daybook entry data.

##### **Request**:

```json
{
  "subject_id": "UUID"
}
```

##### **Handler**:

1. Query the `LessonPlanCoverage` and `DaybookEntryCoverage` tables for the given `subject_id`.
2. Aggregate and return the expectations that have been covered with the corresponding dates.

##### **Code Example**:

```ts
import { LessonPlanCoverage, DaybookEntryCoverage } from '../models';

async function getCurriculumCoverage(req, res) {
  const { subject_id } = req.params;

  try {
    const lessonCoverage = await LessonPlanCoverage.find({
      where: { subject_id },
      include: { learning_outcome: true },
    });

    const daybookCoverage = await DaybookEntryCoverage.find({
      where: { subject_id },
      include: { learning_outcome: true },
    });

    const combinedCoverage = [...lessonCoverage, ...daybookCoverage];
    const coveredExpectations = combinedCoverage.map((entry) => ({
      learning_outcome_id: entry.learning_outcome.id,
      covered_date: entry.covered_date,
    }));

    return res.status(200).json(coveredExpectations);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch curriculum coverage' });
  }
}
```

### 4. **Frontend Workflow Integration**

**Lesson Plan Coverage View (React)**

- In the **Lesson Plan Editor**, after finalizing a lesson, a button triggers the **/api/lessons/\:lessonId/map-to-curriculum** API endpoint.
- The **Daybook Editor** allows the teacher to mark reflective coverage. After creating an entry, a similar process will be triggered via the **/api/daybook/\:entryId/map-to-curriculum** endpoint.

The UI will show curriculum expectations that have been covered based on **Lesson Plans** and **Daybook entries**, showing dates when the teacher covered specific outcomes.

Example of a **Curriculum Coverage Table**:

| Outcome Code | Description                                   | Covered Date |
| ------------ | --------------------------------------------- | ------------ |
| O1           | Communicate ideas orally in French            | 2025-06-23   |
| S1.1         | Respond to simple oral instructions in French | 2025-06-24   |

### 5. **AI Assistance for Tracking**

You can also integrate **AI assistance** that looks at past lessons and daybook entries to suggest which **curriculum expectations** should have been covered based on the current date. This can help highlight gaps in the curriculum.

---

### 6. **Testing**

#### **Unit Tests**

- Ensure the logic for adding curriculum coverage is correct, and that duplicates aren’t inserted.
- Test that the `GET /api/curriculum/coverage/:subjectId` endpoint aggregates both lesson and daybook data accurately.

#### **Integration Tests**

- Simulate a lesson plan submission, mapping it to curriculum outcomes.
- Ensure that the reverse mapping from daybook entries correctly reflects curriculum coverage.

#### **End-to-End Tests**

- Complete a full flow: Upload curriculum, create lesson, map lesson to outcomes, create daybook entry, map daybook to outcomes, check for updated curriculum coverage.

---

By implementing this reverse process, we can ensure that the app not only **automates the planning stages** but also **tracks coverage** as the teacher works through their lessons and reflections, maintaining a clear record of curriculum progression.
