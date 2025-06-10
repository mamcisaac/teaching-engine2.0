## 🗓️ A. SCHOOL EVENT & CALENDAR SYNC INTEGRATION

### 🎯 GOAL:

Allow the system to automatically or manually account for school-level events like PD days, assemblies, holidays, and field trips, preventing instructional blocks from being scheduled during those periods.

### ✅ SUCCESS CRITERIA:

* Teacher can view, add, and delete school events from a unified calendar interface
* External iCal feeds (e.g., school board calendar) can be imported and refreshed
* Weekly and daily planners automatically treat events as non-instructional blocks
* Sub plans and material prep UIs show events so teachers/subs can plan around them

---

### 🔧 BACKEND TASKS

**1. `CalendarEvent` DB Model**

```ts
type CalendarEvent = {
  id: UUID
  title: string
  description?: string
  start: DateTime
  end: DateTime
  allDay: boolean
  eventType: 'PD_DAY' | 'ASSEMBLY' | 'TRIP' | 'HOLIDAY' | 'CUSTOM'
  source: 'MANUAL' | 'ICAL_FEED' | 'SYSTEM'
  teacherId: UUID  // nullable if shared event
  schoolId: UUID   // for future multi-user use
}
```

**2. `GET /calendar-events?from=&to=`**

* Inputs: `from` and `to` as ISO 8601 strings
* Output: list of `CalendarEvent` objects within date range
* Used by all planners to block out unavailable time

**3. `POST /calendar-events`**

* Input: JSON `CalendarEvent` payload (from manual creation)
* Output: saved event

**4. `POST /calendar-sync/ical`**

* Input: `{ feedUrl: string }`
* Parses `.ics` feed (e.g., Google Calendar), saves all upcoming events tagged to `schoolId`
* Associates new or updated events from iCal with type = `ICAL_FEED`

---

### 🎨 FRONTEND TASKS

**1. `CalendarViewComponent`**

* Month view with event display
* “+ Add Event” opens modal to create manual events (using POST `/calendar-events`)
* Option to “Import from iCal” with URL input
* Events color-coded by type

**2. `EventEditorModal`**

* Form with fields for title, start/end, type, allDay toggle
* Submit posts to `/calendar-events`

**3. Integration: `WeeklyPlannerComponent`**

* Blocks off hours/days marked with `CalendarEvent`
* Tooltip shows event title if teacher hovers over blocked slot

---

### 🔁 INTER-MODULE INTEGRATION

* **Weekly planner must query `/calendar-events` for the current week** and prevent activity assignments during any overlapping event periods.
* **Sub plan generation must fetch and print calendar events** occurring during the plan window.

---

### 🧪 FUNCTIONAL TEST EXAMPLE

#### Input:

* Event: `{"title": "School Assembly", "start": "2025-02-14T09:00", "end": "2025-02-14T10:30", "allDay": false}`

#### Expected:

* Weekly planner will not allow assignment of any activity during that window on Feb 14.
* Emergency sub plan PDF includes:

  ```
  NOTE: Assembly scheduled from 9:00–10:30. No instruction during this time.
  ```

---

## 📆 B. SHORT WEEK HANDLING & WEEKLY BUFFER TIME

### 🎯 GOAL:

Ensure lesson planning logic adjusts automatically for short weeks by:

* Skipping or rescheduling low-priority lessons
* Suggesting condensed activities
* Preserving daily/weekly buffer blocks for flexibility

### ✅ SUCCESS CRITERIA:

* Planner detects <5-day weeks and adjusts scheduled load
* Optional teacher setting to “auto-omit” lowest-priority activity when necessary
* Daily plan always includes at least one unscheduled buffer block

---

### 🔧 BACKEND TASKS

**1. Update `generateWeeklySchedule()` Signature**

```ts
generateWeeklySchedule({
  availableBlocks: DailyBlock[],    // filtered by CalendarEvents
  milestonePriorities: Map<UUID, number>,
  pacingStrategy: 'strict' | 'relaxed',
  preserveBuffer: boolean
}): WeekPlan
```

**2. `filterAvailableBlocksByCalendar()`**

* Inputs: teacher’s time blocks (e.g., 8:30–3:00), and `/calendar-events`
* Outputs: only instructional time blocks, excluding breaks and events

**3. `scheduleBufferBlockPerDay()`**

* Algorithmically inserts a named placeholder (e.g., “Open Block”) into one free slot per day/week

---

### 🎨 FRONTEND TASKS

**1. Weekly Plan Configuration Panel**

* New checkbox: “Preserve daily buffer block”
* New toggle: “Skip lowest priority activity on short weeks”

**2. Weekly Planner UI**

* Clearly shows unassigned buffer blocks (e.g., greyed-out “Flex Time” slot)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

#### Input:

* Teacher sets “Preserve daily buffer: YES”
* Week of March 17–21 has a PD day on March 17
* 6 activities are due across 5 days

#### Expected:

* Planner:

  * Recognizes only 4 instructional days
  * Drops or reschedules 1 activity based on priority
  * Leaves one buffer block per remaining day

---

## 🧍‍♀️ C. TEACHER UNAVAILABILITY & PULL-OUT PERIOD BLOCKING

### 🎯 GOAL:

Allow teachers to block personal unavailable periods (e.g., workshops, sick days), and prevent scheduling of high-stakes instruction during known student pull-outs (e.g., EAL/SLP).

### ✅ SUCCESS CRITERIA:

* Teachers can mark unavailable time (half-day granularity or finer)
* Teachers can create named “pull-out” schedules and tag students
* Planner deprioritizes or blocks major activities during those times
* Pull-out times visually appear in daily planning and sub plans

---

### 🔧 BACKEND TASKS

**1. `UnavailableBlock` Model**

```ts
type UnavailableBlock = {
  id: UUID
  teacherId: UUID
  date: Date
  startTime: Time
  endTime: Time
  reason: string  // e.g. "Workshop", "EAL Pull-out"
  blockType: 'TEACHER_ABSENCE' | 'STUDENT_PULL_OUT'
  affectedStudentIds?: UUID[] // nullable if global
}
```

**2. `/unavailable-blocks` endpoints**

* `GET /unavailable-blocks?from&to`
* `POST /unavailable-blocks`
* Used in scheduling + emergency plan generation

**3. Adjust planner**

* When `blockType === STUDENT_PULL_OUT` and activity is tagged as “foundational,” deprioritize scheduling in that slot
* If `blockType === TEACHER_ABSENCE`, block entire slot

---

### 🎨 FRONTEND TASKS

**1. `UnavailableTimeEditorModal`**

* Allow teacher to create:

  * Date, start, end
  * Reason
  * Block type (pull-out or absence)
  * (Optional) affected students

**2. Daily Plan & Weekly Planner**

* Show pull-out blocks as lightly-shaded regions
* Show hard teacher absences as unavailable

---

### 🧪 FUNCTIONAL TEST EXAMPLE

#### Input:

* Student pull-out every Tuesday 10:00–10:30
* Activity “Introduction to Division” marked “foundational”
* Activity “Math Game Review” marked “enrichment”

#### Expected:

* Planner prefers to schedule foundational lessons outside pull-out blocks
* Planner is allowed to schedule enrichment activities during those blocks

---

## 📣 D. AUTOMATED MID-TERM COMMUNICATION TRIGGERS

### 🎯 GOAL:

Enable timed communication outputs, such as prompting teachers to send newsletters or updates mid-term.

### ✅ SUCCESS CRITERIA:

* System prompts teacher at pre-defined dates (e.g. Term 2 midpoint) to send newsletter
* Suggests auto-generated summary using completed lessons
* Newsletter draft uses LLM API for polished content

---

### 🔧 BACKEND TASKS

**1. `NewsletterTriggerScheduler` Cron Job**

* Runs daily to check if term midpoint reached
* If yes, inserts notification:
  `type: 'NEWSLETTER_SUGGESTION'`, `dueDate: termMidpoint + 2 days`

**2. `GET /newsletter-suggestions?teacherId`**

* Returns whether newsletter should be prompted

**3. `POST /newsletter-draft`**

* Triggers LLM API (e.g. GPT-4) with:

```json
{
  "completedActivities": [...],
  "classMilestones": [...],
  "teacherTone": "warm, professional",
  "term": "Term 2",
  "includeUpcomingTopics": true
}
```

* Output: structured markdown or HTML draft with sections:

  * Overview
  * What We’ve Learned
  * What’s Coming Up
  * Photos or Highlights

---

### 🎨 FRONTEND TASKS

**1. Notification Bell + Inbox**

* Show “It’s time to send a newsletter!” with link to draft

**2. `NewsletterDraftViewer`**

* Renders LLM-generated draft with edit options
* Allows 1-click export to PDF or 1-click “Send to Parents”

---

### 🧪 FUNCTIONAL TEST EXAMPLE

#### Input:

* Completed: “Counting to 100”, “Basic addition”, “Shapes”
* Upcoming: “Subtraction basics”

#### Expected LLM Output:

```md
Dear families,

Over the past few weeks, we’ve explored numbers, shapes, and early addition. Your children have worked hard mastering how to count to 100 and identify geometric forms...

Next, we’ll begin learning about subtraction!...
```

---

I’ll continue with the remaining areas (reporting deadlines, year-at-a-glance view, equipment booking, etc.) in a follow-up response. Would you like this output delivered in a GitHub-compatible Markdown format or split into subtasks for an AI agent orchestration system (e.g. `AGENT.yaml` + scripts)?
