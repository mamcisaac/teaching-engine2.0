## ✅ TASK: Implement Multimodal Evidence Gallery

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a flexible, privacy-conscious **artifact capture and viewing system** that allows teachers to upload and organize diverse forms of student evidence. Each item is optionally tagged to curriculum outcomes, themes, dates, and domains. This enables holistic documentation of student learning and supports reporting, reflection, and parent sharing.

---

### 🔹 GOAL

Enable teachers to:

- Upload artifacts (image, audio, video, document)
- Tag each with:

  - Student(s)
  - Date
  - Linked outcome(s)
  - Theme or domain
  - Description / observation (Fr/En)

- View per-student galleries and outcome-based evidence collections
- Use artifacts in reflections, reports, and planning

---

### ✅ SUCCESS CRITERIA

- Teachers can:

  - Upload a file and attach metadata
  - View artifacts per student, per outcome, or per theme
  - Filter gallery by type, time period, or outcome
  - See visual timeline of student work

- Artifacts:

  - Stored securely
  - Playable/previewable in browser
  - Can be referenced in reports or parent summaries

---

### 🔧 BACKEND TASKS

#### 🟢 1. Create `Artifact` model

```prisma
model Artifact {
  id          Int      @id @default(autoincrement())
  studentId   Int
  fileType    String   // "image", "audio", "video", "pdf", "docx", etc.
  filePath    String
  descriptionFr String?
  descriptionEn String?
  linkedOutcomes Int[]
  themeId     Int?
  domain      String?  // oral, writing, etc.
  uploadedAt  DateTime @default(now())
}
```

Migration:

```bash
npx prisma migrate dev --name create_artifact_gallery
npx prisma generate
```

#### 🟢 2. Add upload & listing endpoints

- `POST /api/students/:id/artifacts` (multipart)
- `GET /api/students/:id/artifacts`
- `GET /api/artifacts?outcomeId=xx`
- `GET /api/artifacts?themeId=xx`

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Artifact Uploader

Component: `ArtifactUploader.tsx`

Inputs:

- File picker (accept image/audio/video/doc/pdf)
- Outcome linker (autocomplete)
- Theme selector
- Date picker
- Domain selector (oral/writing/reading)
- Textarea: Description (Fr/En)

After upload:

- Preview pane with playback or thumbnail
- Option to edit metadata

#### 🔵 4. Evidence Gallery Viewer

Component: `EvidenceGallery.tsx`

Modes:

- 📚 By Outcome → list artifacts demonstrating a learning outcome
- 👤 By Student → timeline or grid of all student work
- 🎨 By Theme → filter for theme-linked documentation

Filter controls:

- Artifact type
- Date range
- Domain

Buttons:

- “🧠 Use in Reflection”
- “📰 Include in Report”
- “🔗 Copy Link”

#### 🔵 5. Playback/Preview Panel

Component: `ArtifactPreview.tsx`

- Play audio/video inline
- View PDF/images with zoom
- Display metadata and linked outcomes

---

### 🔗 INTEGRATION NOTES

- Store files under `/uploads/artifacts/{studentId}/{uuid}.{ext}`
- Reuse audio and image storage utilities from reflections and vocab
- Make sure download links are secure and scoped to authorized users
- Artifacts should **not** be visible to other students

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Upload artifact:**

```http
POST /api/students/17/artifacts
Content-Type: multipart/form-data
Fields:
- file: `chant_hiver.mp3`
- outcomeIds: [12]
- themeId: 3
- domain: "oral"
- descriptionFr: "Alex chante 'Bonjour l’hiver' avec confiance."
```

**Expected View:**

> 🎵 `chant_hiver.mp3`
> Outcome: CO.12 | Theme: Winter | Domain: Oral
> “Alex chante ‘Bonjour l’hiver’ avec confiance.”
> \[▶️ Play]

---

### 🚩 RISKS

- Audio and video file handling must be robust across devices
- Privacy of student artifacts is critical—confirm secure access policies
- Must stay lightweight—avoid becoming a heavy media CMS
