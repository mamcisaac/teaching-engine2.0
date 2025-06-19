## ✅ TASK: Implement Learning Artifact Gallery

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are creating a system that allows teachers to collect and manage **digital evidence of learning**. These artifacts are visual or multimedia files uploaded from any device, tagged with outcomes and students, and optionally linked to planner activities or reflections. This supports triangulated assessment, qualitative reporting, and pedagogical documentation practices.

---

### 🔹 GOAL

Allow teachers to:

- Upload, view, tag, and organize learning artifacts
- Link each artifact to students, outcomes, domains, or activities
- Browse artifacts by student, outcome, or term
- View artifact counts or examples from within planning and assessment tools
- Export curated artifacts for student profiles or reporting

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Upload files (images, video, audio, PDF)
  - Tag each artifact with:

    - One or more students
    - One or more outcomes
    - Domain, theme, or activity

  - View artifacts in:

    - Grid (thumbnail) mode
    - Filterable table mode

  - Preview file contents inline
  - Search and filter by:

    - Student
    - Outcome
    - Term
    - Domain

  - Export selected artifacts with metadata

---

### 🔧 BACKEND TASKS

#### 🟢 1. Create `LearningArtifact` model

```prisma
model LearningArtifact {
  id             Int      @id @default(autoincrement())
  fileUrl        String
  thumbnailUrl   String?
  uploadedBy     Int
  studentIds     Int[]
  outcomeIds     Int[]
  domain         String?
  themeId        Int?
  activityId     Int?
  fileType       String   // "image", "video", "audio", "pdf", etc.
  notes          String?
  createdAt      DateTime @default(now())
}
```

Migrate:

```bash
npx prisma migrate dev --name create_learning_artifacts
npx prisma generate
```

#### 🟢 2. Add Upload & Query Endpoints

- `POST /api/artifacts/upload`
- `GET /api/artifacts?filters=...`
- `PATCH /api/artifacts/:id` (update metadata)
- `POST /api/artifacts/export`

> Use multipart/form-data for file upload. Store URLs in S3-compatible or local storage system.

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Upload Form Component

Component: `ArtifactUploader.tsx`

Inputs:

- File (accepts images, video, audio, PDF)
- Students (multi-select)
- Outcomes (multi-select)
- Domain / Theme / Activity (optional)
- Notes (markdown field)
- \[🟢 Upload] button

Drag-and-drop zone encouraged.

#### 🔵 4. Artifact Gallery Viewer

Component: `ArtifactGallery.tsx`

Modes:

- 📷 **Grid view**: thumbnail previews (sortable)
- 📄 **Table view**: metadata-rich rows

Filters:

- Student
- Outcome
- Term
- File type
- Domain

Each entry:

- Thumbnail or icon
- Metadata (students, domain, outcome codes)
- Click to expand or play

#### 🔵 5. Artifact Modal Preview

Component: `ArtifactViewerModal.tsx`

Content:

- Full file viewer (image, audio/video player, PDF embed)
- Metadata summary
- \[🧠 Link to Reflection], \[🧾 Tag Outcomes], \[❌ Delete]

#### 🔵 6. Export Panel

Component: `ArtifactExportPanel.tsx`

- Select multiple artifacts
- Export to:

  - ZIP download
  - CSV metadata
  - Markdown doc with embeds

- Optional filters:

  - Student
  - Domain
  - Outcome
  - Date range

---

### 🔗 INTEGRATION NOTES

- Preview key artifacts from:

  - Outcome Matrix cell popovers
  - Student Profile → Artifacts tab
  - Reflection Logbook (evidence-linked)

- Use same tagging conventions as Reflections and Planner Activities
- Implement storage quotas and file size warnings

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Upload Artifact:**

```http
POST /api/artifacts/upload
FormData:
  file: "IMG_0248.jpg"
  studentIds: [12, 13]
  outcomeIds: [21]
  domain: "writing"
  notes: "Paired writing sample – snow day journal"
```

Rendered Entry:

> 🖼️ IMG_0248.jpg
> 📚 Outcomes: CO.21 | 🧠 Domain: Writing
> 👤 Students: Alex, Maya
> “Paired writing sample – snow day journal”
> \[▶ View] \[🧾 Edit Metadata]

---

### 🚩 RISKS

- Upload latency and storage scale—optimize thumbnails and use lazy loading
- Sensitive file content—ensure teacher-only visibility and audit logs
- Tagging inconsistency—encourage structured metadata entry
