## ✅ TASK 5 — B1. Shared Planning Workspace

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **shared planning system** that allows multiple teachers (e.g., teaching partners, grade-level teams, French/English splits) to collaboratively build, edit, and reuse instructional plans across a shared workspace.

The shared space supports:

- Outcome-aligned unit or weekly plans
- Commenting and versioning
- Reuse and fork logic
- Role-based access control (view vs edit)

---

### 🔹 GOAL

Allow teachers to:

- Create or join shared workspaces
- Co-author units, weeklies, and activities
- Leave comments or annotations
- Fork shared plans into their personal planner
- See authorship history or contributions

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Create a new shared workspace or join an existing one via invitation
  - Add/edit weekly plans, outcomes, and activities collaboratively
  - Leave comments on any section
  - View and manage workspace members and permissions
  - Fork or import plans from shared space into their own planner

- Shared items:

  - Appear read-only in personal planner until imported
  - Indicate shared authorship and version source

---

### 🔧 BACKEND TASKS

#### 🟢 1. Shared Workspace API

```ts
POST /api/workspaces
{
  "title": "Grade 1 French Literacy",
  "ownerId": 3
}
```

```ts
POST /api/workspaces/invite
{
  "workspaceId": 12,
  "email": "partner@school.edu",
  "role": "editor"
}
```

```ts
GET / api / workspaces / 12 / plans;
```

#### 🟢 2. Plan Forking Endpoint

```ts
POST /api/plans/fork
{
  "sourcePlanId": 42,
  "targetUserId": 6
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Workspace Dashboard

Component: `SharedWorkspaceDashboard.tsx`

- Tabs:

  - \[📚 Shared Plans]
  - \[👥 Members]
  - \[✏️ Annotations]

- Controls:

  - \[➕ Create New Plan]
  - \[📥 Import to My Planner]
  - \[📤 Invite Member]
  - \[🔄 Fork Plan]

#### 🔵 3. Collaborative Plan Editor

Component: `CollaborativePlanner.tsx`

- Realtime edits (or autosync every 5–10 sec)
- Inline \[💬 Comment] system per section
- Indicators: “Edited by Mike · 2 min ago”

---

### 🔗 INTEGRATION NOTES

- Shared plans use same schema as `WeeklyPlan`, `ActivityBlock`, etc.
- Access controlled via `WorkspaceMembership` with role field
- Edits tracked via change log / timestamps

---

### 📁 DATABASE TASKS

```prisma
model SharedWorkspace {
  id        Int @id @default(autoincrement())
  title     String
  ownerId   Int
  createdAt DateTime @default(now())
}

model WorkspaceMembership {
  id           Int @id @default(autoincrement())
  workspaceId  Int
  userId       Int
  role         String // "viewer", "editor"
  joinedAt     DateTime @default(now())
}
```

---

### 🧪 FUNCTIONAL TEST EXAMPLE

1. User A creates a workspace
2. User B joins via invite
3. Both co-edit a weekly plan with math outcomes
4. User B forks plan into their own planner
5. User A sees “Forked by X” notification in dashboard

---

### 🚩 RISKS

- Must enforce clear permission levels (viewer vs editor)
- Conflict resolution for concurrent edits (autosave with overwrite warning)
- Avoid polluting personal planner unless user explicitly forks a shared plan
