## 🗓️ A. SCHOOL EVENT & CALENDAR SYNC INTEGRATION

### 🎯 GOAL:

Allow the system to automatically or manually account for school-level events like PD days, assemblies, holidays, and field trips, preventing instructional blocks from being scheduled during those periods.

### ✅ SUCCESS CRITERIA:

- Teacher can view, add, and delete school events from a unified calendar interface
- External iCal feeds (e.g., school board calendar) can be imported and refreshed
- Weekly and daily planners automatically treat events as non-instructional blocks
- Sub plans and material prep UIs show events so teachers/subs can plan around them

---

### 🔧 BACKEND TASKS

**1. `CalendarEvent` DB Model**

```ts
type CalendarEvent = {
  id: UUID;
  title: string;
  description?: string;
  start: DateTime;
  end: DateTime;
  allDay: boolean;
  eventType: 'PD_DAY' | 'ASSEMBLY' | 'TRIP' | 'HOLIDAY' | 'CUSTOM';
  source: 'MANUAL' | 'ICAL_FEED' | 'SYSTEM';
  teacherId: UUID; // nullable if shared event
  schoolId: UUID; // for future multi-user use
};
```

**2. `GET /calendar-events?from=&to=`**

- Inputs: `from` and `to` as ISO 8601 strings
- Output: list of `CalendarEvent` objects within date range
- Used by all planners to block out unavailable time

**3. `POST /calendar-events`**

- Input: JSON `CalendarEvent` payload (from manual creation)
- Output: saved event

**4. `POST /calendar-sync/ical`**

- Input: `{ feedUrl: string }`
- Parses `.ics` feed (e.g., Google Calendar), saves all upcoming events tagged to `schoolId`
- Associates new or updated events from iCal with type = `ICAL_FEED`

---

### 🎨 FRONTEND TASKS

**1. `CalendarViewComponent`**

- Month view with event display
- “+ Add Event” opens modal to create manual events (using POST `/calendar-events`)
- Option to “Import from iCal” with URL input
- Events color-coded by type

**2. `EventEditorModal`**

- Form with fields for title, start/end, type, allDay toggle
- Submit posts to `/calendar-events`

**3. Integration: `WeeklyPlannerComponent`**

- Blocks off hours/days marked with `CalendarEvent`
- Tooltip shows event title if teacher hovers over blocked slot

---

### 🔁 INTER-MODULE INTEGRATION

- **Weekly planner must query `/calendar-events` for the current week** and prevent activity assignments during any overlapping event periods.
- **Sub plan generation must fetch and print calendar events** occurring during the plan window.

---

### 🧪 FUNCTIONAL TEST EXAMPLE

#### Input:

- Event: `{"title": "School Assembly", "start": "2025-02-14T09:00", "end": "2025-02-14T10:30", "allDay": false}`

#### Expected:

- Weekly planner will not allow assignment of any activity during that window on Feb 14.
- Emergency sub plan PDF includes:

  ```
  NOTE: Assembly scheduled from 9:00–10:30. No instruction during this time.
  ```

---

## 📆 B. SHORT WEEK HANDLING & WEEKLY BUFFER TIME

### 🎯 GOAL:

Ensure lesson planning logic adjusts automatically for short weeks by:

- Skipping or rescheduling low-priority lessons
- Suggesting condensed activities
- Preserving daily/weekly buffer blocks for flexibility

### ✅ SUCCESS CRITERIA:

- Planner detects <5-day weeks and adjusts scheduled load
- Optional teacher setting to “auto-omit” lowest-priority activity when necessary
- Daily plan always includes at least one unscheduled buffer block

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

- Inputs: teacher’s time blocks (e.g., 8:30–3:00), and `/calendar-events`
- Outputs: only instructional time blocks, excluding breaks and events

**3. `scheduleBufferBlockPerDay()`**

- Algorithmically inserts a named placeholder (e.g., “Open Block”) into one free slot per day/week

---

### 🎨 FRONTEND TASKS

**1. Weekly Plan Configuration Panel**

- New checkbox: “Preserve daily buffer block”
- New toggle: “Skip lowest priority activity on short weeks”

**2. Weekly Planner UI**

- Clearly shows unassigned buffer blocks (e.g., greyed-out “Flex Time” slot)

---

### 🧪 FUNCTIONAL TEST EXAMPLE

#### Input:

- Teacher sets “Preserve daily buffer: YES”
- Week of March 17–21 has a PD day on March 17
- 6 activities are due across 5 days

#### Expected:

- Planner:

  - Recognizes only 4 instructional days
  - Drops or reschedules 1 activity based on priority
  - Leaves one buffer block per remaining day

---

## 🧍‍♀️ C. TEACHER UNAVAILABILITY & PULL-OUT PERIOD BLOCKING

### 🎯 GOAL:

Allow teachers to block personal unavailable periods (e.g., workshops, sick days), and prevent scheduling of high-stakes instruction during known student pull-outs (e.g., EAL/SLP).

### ✅ SUCCESS CRITERIA:

- Teachers can mark unavailable time (half-day granularity or finer)
- Teachers can create named “pull-out” schedules and tag students
- Planner deprioritizes or blocks major activities during those times
- Pull-out times visually appear in daily planning and sub plans

---

### 🔧 BACKEND TASKS

**1. `UnavailableBlock` Model**

```ts
type UnavailableBlock = {
  id: UUID;
  teacherId: UUID;
  date: Date;
  startTime: Time;
  endTime: Time;
  reason: string; // e.g. "Workshop", "EAL Pull-out"
  blockType: 'TEACHER_ABSENCE' | 'STUDENT_PULL_OUT';
  affectedStudentIds?: UUID[]; // nullable if global
};
```

**2. `/unavailable-blocks` endpoints**

- `GET /unavailable-blocks?from&to`
- `POST /unavailable-blocks`
- Used in scheduling + emergency plan generation

**3. Adjust planner**

- When `blockType === STUDENT_PULL_OUT` and activity is tagged as “foundational,” deprioritize scheduling in that slot
- If `blockType === TEACHER_ABSENCE`, block entire slot

---

### 🎨 FRONTEND TASKS

**1. `UnavailableTimeEditorModal`**

- Allow teacher to create:

  - Date, start, end
  - Reason
  - Block type (pull-out or absence)
  - (Optional) affected students

**2. Daily Plan & Weekly Planner**

- Show pull-out blocks as lightly-shaded regions
- Show hard teacher absences as unavailable

---

### 🧪 FUNCTIONAL TEST EXAMPLE

#### Input:

- Student pull-out every Tuesday 10:00–10:30
- Activity “Introduction to Division” marked “foundational”
- Activity “Math Game Review” marked “enrichment”

#### Expected:

- Planner prefers to schedule foundational lessons outside pull-out blocks
- Planner is allowed to schedule enrichment activities during those blocks

---

## 📣 D. AUTOMATED MID-TERM COMMUNICATION TRIGGERS

### 🎯 GOAL:

Enable timed communication outputs, such as prompting teachers to send newsletters or updates mid-term.

### ✅ SUCCESS CRITERIA:

- System prompts teacher at pre-defined dates (e.g. Term 2 midpoint) to send newsletter
- Suggests auto-generated summary using completed lessons
- Newsletter draft uses LLM API for polished content

---

### 🔧 BACKEND TASKS

**1. `NewsletterTriggerScheduler` Cron Job**

- Runs daily to check if term midpoint reached
- If yes, inserts notification:
  `type: 'NEWSLETTER_SUGGESTION'`, `dueDate: termMidpoint + 2 days`

**2. `GET /newsletter-suggestions?teacherId`**

- Returns whether newsletter should be prompted

**3. `POST /newsletter-draft`**

- Triggers LLM API (e.g. GPT-4) with:

```json
{
  "completedActivities": [...],
  "classMilestones": [...],
  "teacherTone": "warm, professional",
  "term": "Term 2",
  "includeUpcomingTopics": true
}
```

- Output: structured markdown or HTML draft with sections:

  - Overview
  - What We’ve Learned
  - What’s Coming Up
  - Photos or Highlights

---

### 🎨 FRONTEND TASKS

**1. Notification Bell + Inbox**

- Show “It’s time to send a newsletter!” with link to draft

**2. `NewsletterDraftViewer`**

- Renders LLM-generated draft with edit options
- Allows 1-click export to PDF or 1-click “Send to Parents”

---

### 🧪 FUNCTIONAL TEST EXAMPLE

#### Input:

- Completed: “Counting to 100”, “Basic addition”, “Shapes”
- Upcoming: “Subtraction basics”

#### Expected LLM Output:

```md
Dear families,

Over the past few weeks, we’ve explored numbers, shapes, and early addition. Your children have worked hard mastering how to count to 100 and identify geometric forms...

Next, we’ll begin learning about subtraction!...
```

---

## 🕒 E. REPORTING DEADLINES & ASSESSMENT WINDOWS

### 🎯 Goal

Capture key reporting deadlines (e.g. mid-term reports, end-of-term grades due) and ensure assessments are scheduled—and grading time reserved—well before those dates.

### ✅ Success Criteria

- Teacher can **add/edit** any number of academic deadlines in the UI.
- Planner **rejects** any “Assessment”-type activity scheduled after its deadline or automatically **reschedules** it earlier.
- A **notification** appears 14 days before each deadline reminding the teacher to schedule and grade assessments.

---

### 🔧 Backend Tasks

1. **Model: `ReportDeadline`**

   ```ts
   type ReportDeadline = {
     id: UUID;
     teacherId: UUID;
     name: string; // e.g. "Mid-term Grades Due"
     date: Date; // calendar cutoff
     remindDaysBefore: number; // default: 14
   };
   ```

2. **Endpoints**

   - `GET /report-deadlines?teacherId=` → `[ReportDeadline]`
   - `POST /report-deadlines` _(body: ReportDeadline sans `id`)_ → `ReportDeadline`
   - `PUT /report-deadlines/:id` → updated `ReportDeadline`
   - `DELETE /report-deadlines/:id`

3. **Scheduling Logic Hook**

   - In `generateWeeklySchedule()` before finalizing:

     ```ts
     // Pseudocode
     for each plannedActivity in weekPlan.activities:
       if plannedActivity.type === 'ASSESSMENT':
         matchingDeadline = findDeadlineFor(plannedActivity.milestone)
         if plannedActivity.date > matchingDeadline.date:
           throw SchedulingError('Assessment scheduled past deadline')
     ```

   - Alternatively, auto-reschedule to latest available slot **≤** deadline.

4. **Notification Cron Job**

   - Daily at 02:00 server time:

     1. Fetch all `ReportDeadline` for each teacher
     2. If `today + remindDaysBefore === deadline.date`, create a `Notification`

        ```ts
        createNotification({
          teacherId,
          type: 'ASSESSMENT_REMINDER',
          message: `Schedule and grade assessments for "${name}" due ${deadline.date}.`,
          data: { deadlineId },
        });
        ```

---

### 🎨 Frontend Tasks

1. **`ReportDeadlinesEditor` Component**

   - Table listing all deadlines with columns: Name, Date, RemindDaysBefore, Actions (Edit/Delete).
   - “Add Deadline” button → opens modal with form fields matching `ReportDeadline` model.

2. **Planner Integration**

   - In `WeeklyPlannerComponent`, if an assessment is scheduled too late, show an inline alert:

     > “⚠️ ‘Math Quiz’ is after the ‘Mid-term Grades Due’ on 2025-02-14. Please reschedule.”

3. **Notification Center**

   - Display “Schedule and grade assessments for Mid-term Grades Due on Feb 14” 14 days before.
   - Clicking the notification links to the `ReportDeadlinesEditor`.

---

### 🔗 Integration Notes

- Tie `plannedActivity.milestone` to a relevant `ReportDeadline` via a lookup table (e.g., milestone.deadlineId).
- Ensure the cron job writes to the shared `Notification` table that the front end polls or websockets.

---

### 🧪 Functional Test Example

- **Setup:** Teacher adds deadline

  ```json
  {
    "name": "Mid-term Grades Due",
    "date": "2025-02-14",
    "remindDaysBefore": 14
  }
  ```

- **Action:** Schedule an assessment on `2025-02-15`
- **Expected:** Planner shows error and suggests next available slot on or before `2025-02-14`.
- **On 2025-01-31**, notification appears in the teacher’s Dashboard prompting grading.

---

## 🌐 F. YEAR-AT-A-GLANCE & COLLABORATION

### 🎯 Goal

Provide a scrollable overview of the entire school year—displaying curriculum units, events, assessments, and shareable views for colleagues.

### ✅ Success Criteria

- Teacher can view all plans and events on a **12-month calendar**.
- Exportable **PDF/PNG** of the year view.
- Ability to generate a **read-only share link** (tokenized URL).

---

### 🔧 Backend Tasks

1. **Model: `YearPlanEntry`**

   ```ts
   type YearPlanEntry = {
     id: UUID;
     teacherId: UUID;
     entryType: 'UNIT' | 'ASSESSMENT' | 'EVENT';
     title: string;
     start: Date;
     end: Date;
     colorCode?: string; // optional hex for visualization
   };
   ```

2. **Endpoint: `GET /year-plan?teacherId=&year=`**

   - Returns `[YearPlanEntry]` for Jan 1–Dec 31 of that year.

3. **Endpoint: `POST /share/year-plan`**

   - Input: `{ teacherId, year }`
   - Output: `{ shareToken: string, expiresAt: DateTime }`
   - Persists a `ShareLink` record: `{ token, type: 'YEAR_PLAN', teacherId, year, expiresAt }`

---

### 🎨 Frontend Tasks

1. **`YearAtAGlanceComponent`**

   - Uses a calendar library (e.g., FullCalendar month view) to render entries from `/year-plan`.
   - Color-codes by `entryType`.
   - Navigation: jump to term start, today, next month.

2. **Export & Share**

   - “Export” button → calls backend to generate PDF snapshot of view.
   - “Share” button → POST `/share/year-plan`, displays generated URL (read-only).

---

### 🔗 Integration Notes

- Pull data from multiple sources: units (from curriculum planner), events (calendar events), deadlines (as special entries).
- Ensure shared link only reads—not writes—to avoid unauthorized changes.

---

### 🧪 Functional Test Example

- **Entries:**

  - Unit “Numbers to 20”, Jan 6–Jan 31
  - Holiday “Family Day”, Feb 17 (allDay)
  - Assessment “First Quiz”, Feb 10

- **Expected:** All three appear in their respective dates on the year calendar.

---

## 🧰 G. LOGISTICS & EQUIPMENT BOOKING

### 🎯 Goal

Track and remind teachers of equipment or resource bookings requiring lead time (e.g., iPad carts, gym equipment, consumable orders).

### ✅ Success Criteria

- Teacher can request equipment by **date needed** and **lead time**.
- System sends reminders at `neededDate – leadTime` and twice again in the week leading up.
- Dashboard shows upcoming booking deadlines.

---

### 🔧 Backend Tasks

1. **Model: `EquipmentBooking`**

   ```ts
   type EquipmentBooking = {
     id: UUID;
     teacherId: UUID;
     resourceName: string; // e.g., "iPad Cart"
     neededBy: Date; // date when resource must be available
     leadTimeDays: number; // default 14
     status: 'REQUESTED' | 'CONFIRMED' | 'CANCELLED';
   };
   ```

2. **Endpoints**

   - `GET /equipment-bookings?teacherId` → `[EquipmentBooking]`
   - `POST /equipment-bookings` → `EquipmentBooking`
   - `PUT /equipment-bookings/:id` → updated `EquipmentBooking`

3. **Cron Job: `BookingReminderService`**

   - Daily at 08:00:

     ```ts
     for each booking:
       reminderDates = [
         booking.neededBy.minus({ days: booking.leadTimeDays }),
         booking.neededBy.minus({ days: Math.floor(booking.leadTimeDays/2) }),
         booking.neededBy.minus({ days: 1 })
       ]
       if today in reminderDates:
         createNotification({
           teacherId,
           type: 'BOOKING_REMINDER',
           message: `Prepare booking for ${booking.resourceName} needed on ${booking.neededBy}.`,
           data: { bookingId }
         })
     ```

---

### 🎨 Frontend Tasks

1. **`EquipmentBookingForm`**

   - Fields: Resource Name, Needed By (date picker), Lead Time (number)
   - Submit → `POST /equipment-bookings`

2. **`EquipmentBookingDashboard`**

   - List upcoming bookings with status badges
   - Highlight any reminders triggered today

---

### 🔗 Integration Notes

- Tie notifications into the same `NotificationCenter` used by other modules.
- Allow clicking notification to navigate to the booking’s detail page.

---

## 🗒️ H. ENHANCED EMERGENCY SUB PLAN

### 🎯 Goal

Produce a substitute-teacher plan that **exactly mirrors** the teacher’s actual daily plan—incorporating lessons, calendar events, pull-outs, and contact info.

### ✅ Success Criteria

- Sub plan PDF content is drawn from the **stored `DailyPlan`** for the selected date
- Includes any `CalendarEvent` and `UnavailableBlock` for that day
- Editable fields for school contacts and special instructions

---

### 🔧 Backend Tasks

1. **Service: `SubPlanService.generate(date, teacherId)`**

   - Fetch:

     - `DailyPlan` entries (time, activity, instructions)
     - `CalendarEvent` overlapping date
     - `UnavailableBlock` for date

   - Compose JSON:

     ```json
     {
       "date":"2025-06-15",
       "schedule":[
         { "time":"09:00","activity":"Math - Counting to 20" },
         { "time":"09:45","note":"Assembly (see CalendarEvent.title)" },
         …
       ],
       "pullOuts":[…],
       "contacts": { "principal":"…", "office":"…" }
     }
     ```

   - Render via PDF template (e.g. Handlebars `.hbs`) to a byte stream.

2. **Endpoint: `POST /sub-plan/generate?date=YYYY-MM-DD` → PDF**

---

### 🎨 Frontend Tasks

1. **`SubPlanGenerator` Component**

   - Date picker defaults to **today**
   - “Generate” button fetches `/sub-plan/generate`
   - Preview PDF in an embedded viewer
   - “Edit Contacts” button opens modal to set contact fields saved in teacher profile

2. **`ContactInfoEditor` Modal**

   - Fields: Principal Name, Phone, Office Procedures, Emergency Exits, etc.

---

### 🔗 Integration Notes

- Use the same `DailyPlanModel` and `CalendarEvent` queries as the main planner.
- Ensure PDF template has placeholders for all sections.

---

## ✅ I. TESTING & VALIDATION SUITE

### 🎯 Goal

Guarantee end-to-end functionality through automated tests covering all new calendar-related features.

### ✅ Success Criteria

- **Unit tests** for all new backend logic (e.g. `filterAvailableBlocksByCalendar`, `generateWeeklySchedule` adjustments)
- **Integration tests** hitting each new endpoint (e.g. `/calendar-events`, `/report-deadlines`)
- **E2E tests** simulating teacher workflows (create event → generate weekly plan → confirm blocked slot)

---

### 🔧 Testing Tasks

1. **Backend Unit Tests**

   - `CalendarServiceTest`: verify that iCal import populates `CalendarEvent` correctly
   - `SchedulerTest`: short-week and buffer logic
   - `AssessmentDeadlineTest`: error on late assessment scheduling

2. **Backend Integration Tests**

   - Test each CRUD endpoint with valid/invalid input
   - Test notification cron triggers under simulated date conditions

3. **Frontend E2E Tests (Cypress/Puppeteer)**

   - **Scenario:** Teacher imports iCal → planner blocks event → emergency sub plan includes event
   - **Scenario:** Teacher adds deadline → schedules assessment past date → sees inline error

---

# Priority & Sequence

1. **A ➔ B ➔ E** (Calendar import → planner adjustments → reporting windows)
2. **C ➔ D** (Pull-outs & booking → enhance sub plans)
3. **G** (Equipment booking)
4. **F** (Year-at-a-glance & sharing)
5. **I** (Testing & validation)

---

This AGENTS-TODO leaves no ambiguity: each feature has its data model, endpoints, UI components, integration points, and concrete examples. Implement these in sequence, verifying success criteria at each step, to transform the prototype into a robust, classroom-ready planning system.
