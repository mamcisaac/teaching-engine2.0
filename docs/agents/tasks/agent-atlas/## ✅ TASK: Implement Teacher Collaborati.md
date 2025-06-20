## ✅ TASK: Implement Teacher Collaboration Portal

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a structured **collaboration layer** that enables teachers—especially those teaching the same grade or in similar immersion contexts—to share plans, tag each other in outcomes, leave comments on units or activities, and optionally adopt or remix shared teaching materials.

---

### 🔹 GOAL

Allow teachers to:

- Join collaboration groups (e.g., “Grade 1 Immersion Team”, “École François-Buote”)
- Share activities, resources, and theme plans with collaborators
- Comment on shared units or outcomes
- Co-annotate outcomes (e.g., leave notes, strategies, cautions)
- Mark favorites or adopted plans for reuse

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Create or join a collaboration group
  - Browse and view group-shared content
  - Share own activities, themes, or outcome annotations
  - Leave threaded comments or reactions on shared items
  - Copy any item into their own planner for reuse (“Adopt this”)

- Shared content is clearly marked and permissioned
- Teachers retain ownership and editing rights over their own content

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add Collaboration Models

```prisma
model CollaborationGroup {
  id        Int      @id @default(autoincrement())
  name      String
  createdBy Int
  createdAt DateTime @default(now())
}

model GroupMembership {
  id        Int      @id @default(autoincrement())
  groupId   Int
  userId    Int
  role      String   // "admin", "member"
}

model SharedItem {
  id          Int      @id @default(autoincrement())
  type        String   // "activity", "theme", "annotation"
  itemId      Int
  ownerId     Int
  groupId     Int
  sharedAt    DateTime @default(now())
  commentThreadId Int?
}
```

Migrate:

```bash
npx prisma migrate dev --name create_collaboration_portal
npx prisma generate
```

#### 🟢 2. API Endpoints

- `POST /api/groups`
- `POST /api/groups/:id/join`
- `POST /api/groups/:id/share`
- `GET /api/groups/:id/shared-items`
- `POST /api/shared-items/:id/comments`

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Collaboration Hub

Component: `CollaborationPortal.tsx`

- Tabs:

  - 📂 My Groups
  - 🔍 Explore Shared Items
  - 💬 Comments & Updates

- Each group card:

  - Title
  - Members
  - “View Shared Items” → shared content feed

#### 🔵 4. Share Modal (integrated across app)

Component: `ShareWithGroupModal.tsx`

- Used when sharing:

  - Activity
  - Theme plan
  - Outcome annotation

- Select group(s)
- Add optional message or context

Button: `🔗 Share with my team`

#### 🔵 5. Shared Items Feed

Component: `SharedItemsFeed.tsx`

- Infinite scroll or paged view
- Cards:

  - Item preview
  - Owner name
  - “💬 Comments (3)” → opens thread
  - “🪄 Adopt this into my planner”
  - “⭐ Favourite”

Filter by:

- Type (activity/theme/annotation)
- Domain/outcome
- Contributor

#### 🔵 6. Comments and Threading

Component: `ItemCommentThread.tsx`

- Markdown editor
- Reply nesting
- Mention (@name) support

---

### 🔗 INTEGRATION NOTES

- Ownership: only owners can edit original item; collaborators can adopt and modify their _copy_
- Permissions: groups must have admins/moderators; sharing requires group membership
- Visibility: allow toggles for “Private”, “My groups”, “Public (read-only)”

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Share item:**

```http
POST /api/groups/2/share
{
  type: "theme",
  itemId: 8,
  ownerId: 11,
  commentThreadId: null
}
```

**Add comment:**

```http
POST /api/shared-items/19/comments
{
  authorId: 11,
  body: "Love this winter theme—did you use this with CO.14 as well?",
  parentId: null
}
```

Rendered Card:

> ❄️ **Theme: Winter Words and Weather**
> Shared by Mme. Boudreau | 3 Comments
> “Love this winter theme…”
> 🔄 Adopt | 💬 Comment | ⭐ Favorite

---

### 🚩 RISKS

- Version control: once adopted, shared items should not auto-update for adopters
- Clarity of ownership must be preserved
- Comments should be non-evaluative and supportive (consider community moderation tools later)
