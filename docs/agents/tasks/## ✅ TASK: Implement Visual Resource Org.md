## ✅ TASK: Implement Visual Resource Organizer

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are designing a system that enables teachers to manage **visual teaching resources** (e.g., image cards, posters, PDF handouts, short video clips) within the planning tool. These resources support visual scaffolding in early literacy and oral language development and must be easily accessible from activities, thematic units, and parent newsletters.

---

### 🔹 GOAL

Build a resource library system where teachers can upload, tag, and insert visual media into lesson plans. Visuals can be linked to outcomes, activities, and newsletters. This must work seamlessly across the bilingual interface and allow file previews (e.g. image thumbnails, PDF pages).

---

### ✅ SUCCESS CRITERIA

- Teachers can upload, tag, and manage files (image, PDF, video, audio).
- Files can be:

  - Linked to curriculum outcomes and activities
  - Filtered by theme, subject, language
  - Previewed in-browser

- Teachers can insert visuals into:

  - Daily/Weekly Plans
  - Newsletter PDFs
  - Assessment instructions

- All media is scoped to the user (private by default).

---

### 🔧 BACKEND TASKS

#### 🟢 1. Add `MediaResource` model

In `prisma/schema.prisma`:

```prisma
model MediaResource {
  id             Int      @id @default(autoincrement())
  userId         Int
  title          String
  filePath       String
  fileType       String   // "image", "pdf", "video", "audio"
  tags           String[]
  linkedOutcomes Outcome[] @relation("MediaOutcomes")
  linkedActivities Activity[] @relation("MediaActivities")
  createdAt      DateTime @default(now())
}
```

Run:

```bash
npx prisma migrate dev --name add_media_resource_library
npx prisma generate
```

#### 🟢 2. Create upload endpoint and file storage logic

- Endpoint: `POST /api/resources/upload`
- Store file in `/uploads/{userId}/{filename}`
- Accept types: jpg/png/pdf/mp4/mp3
- Use Multer (or similar middleware) with MIME validation

Add route:

```ts
POST / api / resources / metadata; // to store title, tags, associations
```

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Build Resource Library UI

Component: `ResourceLibrary.tsx`

- Show grid/list of uploaded resources:

  - Thumbnail preview (image or icon)
  - Title
  - File type tag
  - Linked items: activities, outcomes

- Filters:

  - By subject
  - By tag (e.g. “fall”, “weather”)
  - By file type

#### 🔵 4. Upload + Tagging Modal

Component: `UploadResourceModal.tsx`

- Fields:

  - Title
  - File upload (drag-and-drop or browse)
  - Tags (multi-input)
  - Link to outcomes/activities

- Upload button triggers backend storage and saves metadata.

#### 🔵 5. Embed in Daily Plan / Newsletter

In `DailyPlanner.tsx`, `ActivityEditor.tsx`, and `NewsletterEditor.tsx`:

- Add “Insert Resource” button
- Modal selector shows thumbnails
- On select:

  - Insert image inline (or link if PDF/video)
  - Store reference to resource ID in rendered markdown/PDF

#### 🔵 6. Enable Preview & Download

- Allow preview of:

  - Images: `<img>` or canvas
  - PDFs: render 1st page
  - Videos: `<video>` tag with controls
  - Audio: `<audio>` tag

Enable download and copy-link.

---

### 🔗 INTEGRATION NOTES

- Use user-level scoping; only show resources uploaded by that user.
- Do not require linking to an activity or outcome—can be used as general library.
- Optimize for drag-and-drop usability in future refinements.

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Upload Resource:**

```http
POST /api/resources/metadata
{
  title: "Winter Vocabulary Poster",
  fileType: "image",
  filePath: "/uploads/42/winter-vocab.jpg",
  tags: ["winter", "vocabulary", "visual"],
  linkedActivityIds: [14],
  linkedOutcomeIds: [12]
}
```

**Planner View:**

> \[🖼️ Winter Vocabulary Poster] — Click to preview
> _Linked to Activity: “Write about winter”_

**Newsletter Output:**

> _“This week, we practiced winter vocabulary. See our poster below!”_
> !\[winter-vocab.jpg]

---

### 🚩 RISKS

- Avoid loading all files at once — use pagination or lazy loading.
- Enforce strict file type validation — don’t allow .exe or unrecognized MIME.
- Maintain accessible previews (alt-text, ARIA) for screen readers.
