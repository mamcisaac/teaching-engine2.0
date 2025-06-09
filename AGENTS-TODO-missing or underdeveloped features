Below is a rigorously detailed **AGENTS-TODO** task list for the critical missing or underdeveloped features, with clear implementation steps and explicit success criteria. Each section corresponds to one of the previously identified recommendations for improvement.

---

## 🗓️ 1. Timetable Management and Schedule-Constrained Planning

### ❗Goal:

Ensure weekly activity scheduling respects the teacher’s fixed timetable (e.g., subject blocks, prep time, specialist classes) and avoids suggesting activities in non-teaching periods.

### ✅ Success Criteria:

* Teacher can input/edit a visual timetable (e.g., Math at 9–10am, Prep 11:30–12, etc.)
* Weekly planner only assigns activities to available subject-specific slots
* Activities are not scheduled during prep, recess, or unassigned blocks
* Teachers see a week view that reflects their real-world class structure

### 📋 Tasks:

**\[Frontend]**

* `CreateTimetableUIComponent`: Build an interactive weekly grid editor (e.g., 30-min blocks 8:30–3:00) allowing teachers to mark subject slots, breaks, and prep time.
* `DisplayTimetableInPlanner`: Show the defined timetable overlay in the weekly planner view (e.g., greyed out blocks for prep, labeled blocks for each subject).

**\[Backend]**

* `TeacherTimetableModel`: Create DB model for teacher schedules: `day`, `startTime`, `endTime`, `subject`.
* `UpdateWeeklyPlanAlgorithm`: Modify the `generateWeeklySchedule` function to:

  * Place activities only in valid subject blocks
  * Leave prep and breaks unscheduled
  * Warn if not enough slots are available to schedule all desired activities

---

## 📆 2. Daily Lesson Plan View & Printable Schedule

### ❗Goal:

Automatically generate detailed daily lesson plans from the weekly schedule, including time blocks, instructions, transitions, and assessment notes.

### ✅ Success Criteria:

* Clicking on a day in the weekly plan shows a full daily schedule with all blocks
* Teacher can drag/drop activities and manually fill in missing blocks
* Printable daily plan includes:

  * Time slots
  * “Daily why” objective
  * Activity instructions
  * Materials
  * Assessment notes

### 📋 Tasks:

**\[Frontend]**

* `DailyPlanEditor`: Visual editor for structuring a day's lessons, tied to the timetable
* `PrintableDailyPlanView`: PDF export of the daily plan with proper formatting
* `AutoPopulateFromWeeklyPlan`: Fill daily slots with activities based on weekly plan + timetable

**\[Backend]**

* `DailyPlanModel`: Store per-day structured plans linked to weekly plan and activity list
* `GenerateDefaultDailyPlanFromWeekly`: API endpoint to generate a stub daily plan with time slots, placeholder notes
* `LinkEmergencySubPlanToDailyPlan`: Emergency plan uses latest saved daily plan, with optional override

---

## 📰 3. Newsletter Automation and Distribution

### ❗Goal:

Generate, preview, and send a newsletter using the data already in the system—recent activities, uploaded photos, upcoming topics—without requiring manual re-entry.

### ✅ Success Criteria:

* Clicking "Generate Newsletter" for a date range pre-fills newsletter draft
* Draft includes completed activities with summaries, milestones met, and class photos
* Teacher can edit and save draft
* Can export to PDF and/or send to stored list of parent emails

### 📋 Tasks:

**\[Backend]**

* `NewsletterAutoDraftService`: Generate newsletter content based on:

  * Completed activities
  * Progress updates (e.g., milestones hit)
  * Upcoming scheduled items
* `ParentContactModel`: Store parent email list per class
* `SendNewsletterAPI`: Endpoint to email PDF newsletter using SendGrid (or other provider)

**\[Frontend]**

* `NewsletterGenerationUI`: Interface to select week range, generate draft, and preview auto-filled content
* `EditNewsletterWithSuggestions`: Rich text editor with pre-filled content blocks for each section
* `ExportAndSendOptions`: UI buttons to export PDF and to email all parent contacts

**\[Templates]**

* `weekly_newsletter.hbs`: Improve template to support dynamic sections (e.g., “What we did”, “Photos”, “Coming up”)

---

## 📁 4. Resource Management and Bulk Material Prep

### ❗Goal:

Ensure the teacher has a clear checklist of all materials needed for the week, and can download all printable resources in one click.

### ✅ Success Criteria:

* Materials list auto-generated from all activities in the weekly/daily plans
* Teacher sees interactive checklist UI with checkboxes
* Printable resources flagged in each activity are downloadable as a ZIP file
* Teacher can preview and print any document from the week’s plan

### 📋 Tasks:

**\[Backend]**

* `AutoExtractMaterialsFromActivityNotes`: Improve regex/NLP to extract material names even from freeform text
* `BuildWeeklyMaterialListService`: Given weekly plan, return materials checklist grouped by day/activity
* `ZipPrintableResourcesEndpoint`: Package all activity-linked printable files for a week into one downloadable ZIP

**\[Frontend]**

* `WeeklyMaterialsChecklistUI`: Show grouped list of needed materials with checkboxes and links to relevant activities
* `DownloadAllPrintablesButton`: Allows teacher to fetch all printable files for the week in one ZIP
* `FlagMissingPrintables`: Alert if scheduled activities have missing resources

---

## 🔗 5. Integration of Planning, Resources, and Progress Tracking

### ❗Goal:

Unify the system flow so that weekly planning, daily execution, materials prep, progress updates, and communications work in sync.

### ✅ Success Criteria:

* Progress alerts influence planning suggestions (e.g., if behind on Math, planner recommends more Math)
* Material checklist updates when plan is adjusted
* Newsletter pulls directly from progress and plan data
* Notifications surface clearly in UI and link to actionable next steps

### 📋 Tasks:

**\[Backend]**

* `PlanningIntegrationWithProgress`: Update planning algorithm to consider milestone urgency when selecting activities
* `ReactiveMaterialListUpdate`: Regenerate material list whenever weekly/daily plan is updated
* `ProgressInfluencesNewsletterContent`: Include milestone completion summaries automatically in newsletter drafts

**\[Frontend]**

* `PlannerNotificationBanner`: Surface progress alerts in weekly planner with one-click “Insert Recovery Activity”
* `MaterialsReminderPrompt`: After planning, prompt user to review/print materials
* `AutoNewsletterPrompt`: On Fridays, offer to generate a newsletter from weekly summary

---

## 🛠️ 6. Strengthen Existing Core Features

### ❗Goal:

Ensure features marked “done” are actually useful and production-ready (e.g., weekly planner, newsletter, emergency sub plan, alerts).

### ✅ Success Criteria:

* Weekly planner generates multiple activities per day with subject balancing
* Newsletter generator includes actual content generation logic
* Emergency plan reflects actual daily plan content, not placeholders
* Progress alerts actually reach the teacher via visible notifications or emails

### 📋 Tasks:

**\[Weekly Planner]**

* `MultiActivityPerDayPlannerLogic`: Schedule multiple blocks per day per subject, based on timetable
* `SubjectBalancingRules`: Avoid front-loading or omitting subjects

**\[Newsletter]**

* `ContentTemplateBlocks`: Add weekly highlights, class photos, and learning goals to draft generation
* `EmailServiceIntegration`: Set up SendGrid or Mailgun API for email delivery

**\[Emergency Plan]**

* `PullRealDailyPlan`: Replace hardcoded sample with latest saved daily plan
* `IncludeContactAndProcedureFields`: Allow teacher to pre-fill school routines, contacts, etc.

**\[Alerts]**

* `NotificationCenterComponent`: Build frontend UI to show all triggered alerts
* `EmailFallbackForIn-App Alerts`: If not read in-app in 48h, alert is emailed

---

## 🔁 7. Requirements Audit and Task Mapping

### ❗Goal:

Ensure every line item in the Implementation Plan is represented by an implemented feature or a corresponding task.

### ✅ Success Criteria:

* Every outcome in the Implementation Plan is either “Implemented,” “Planned,” or “Deferred (v2)”
* New tasks are created for anything omitted
* All key objectives are traceable to one or more AGENT tasks

### 📋 Tasks:

* `CreateRequirementsTraceabilityMatrix`: List all Implementation Plan goals and map to current tasks/features
* `FlagMissingFeatures`: Identify any plan goal not implemented or assigned a task
* `CreateAGENTTasksFromTraceabilityGaps`: For each missing item, write an explicit task with success criteria

---

## 🎯 8. Polished UX and Workflow Alignment

### ❗Goal:

Make the tool feel like an integrated assistant, not a disconnected set of tools.

### ✅ Success Criteria:

* Main dashboard shows teacher’s week at a glance (schedule, materials, newsletter status)
* Common actions are available contextually (e.g., after planning, prompt for newsletter or printables)
* Workflow is intuitive and clearly sequenced from week generation → resource prep → communication

### 📋 Tasks:

**\[Frontend]**

* `UnifiedWeekViewComponent`: Combine planner, material checklist, and newsletter generator into one dashboard
* `PostPlanningActionPrompts`: After generating a plan, automatically prompt to generate materials and newsletter
* `TeacherOnboardingFlow`: Add onboarding/tutorial overlay for new users to guide through workflow

---

Would you like me to also:

* Break these into prioritized tiers (e.g., must-have vs polish)?
* Generate GitHub issues in Markdown format?
* Generate a JSON schema that a coding agent could use to auto-assign tasks?

Let me know how you’d like to proceed.
