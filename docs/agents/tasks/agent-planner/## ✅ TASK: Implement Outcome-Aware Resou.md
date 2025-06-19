## ✅ TASK: Implement Outcome-Aware Resource Recommendation Panel

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are enhancing the platform's ability to support Grade 1 French Immersion teachers in PEI by suggesting pedagogically appropriate, open-license teaching resources. Your task is to implement a system that analyzes activity-outcome links and recommends **external or internal resources**—worksheets, songs, videos, or PDFs—aligned to that outcome. Start with hardcoded mappings and rules, and later the system will support AI expansion.

---

### 🔹 GOAL

Help teachers quickly find and attach contextually relevant resources (videos, handouts, songs, etc.) to their activities using a semi-automated suggestion panel based on linked curriculum outcomes and activity subject.

---

### ✅ SUCCESS CRITERIA

- On any activity edit/view screen, show a “Suggested Resources” panel.
- Suggested resources are based on:

  - Linked outcomes
  - Subject type
  - Activity title keywords

- Teachers can preview and attach resources directly to the activity.
- System gracefully handles no suggestions.
- Backend serves a ranked list of suggestions via API (initially hardcoded for a few outcomes).

---

### 🔧 BACKEND TASKS

#### 🟢 1. Create `resources/suggestions.ts` service

Add a function: `getResourceSuggestions(activityId: number): ResourceSuggestion[]`

Steps:

- Fetch the activity by ID, including:

  - subject
  - title
  - linked outcomes (`ActivityOutcome`)

- Based on:

  - Outcome codes (e.g. “CO.0” → oral language)
  - Subject (e.g. “francais”)
  - Keywords in title (e.g. “syllable”, “song”)

- Return a list of resource suggestions:

```ts
type ResourceSuggestion = {
  title: string;
  type: 'worksheet' | 'video' | 'audio' | 'link';
  description?: string;
  url: string;
  rationale: string; // why this was recommended
};
```

#### 🟢 2. Add route: `GET /api/resources/suggestions?activityId=123`

Returns up to 5 recommended resources for the given activity.

Start with hardcoded rules like:

```ts
if (outcome.code.startsWith('CO.')) {
  suggestions.push({
    title: 'French Listening Song – Les Animaux',
    type: 'audio',
    url: 'https://www.youtube.com/watch?v=8eSgTKJx2f8',
    rationale: 'This supports oral comprehension (CO.0)',
  });
}
```

Later versions can use embeddings or AI document search.

---

### 🎨 FRONTEND TASKS

#### 🔵 3. Add “Suggested Resources” Panel to `ActivityModal.tsx`

- Display in a sidebar or below resource upload field.
- Call `GET /api/resources/suggestions?activityId=123`
- Render as cards:

  - Title
  - Icon (e.g. video, file, link)
  - Brief rationale
  - “Preview” button (open in new tab)
  - “Attach to Activity” button

#### 🔵 4. Support attaching a suggested resource

- On click “Attach”, convert `ResourceSuggestion` to a real `Resource` linked to the activity (use existing file/link schema).
- Persist in DB via `POST /api/resources`.

#### 🔵 5. Graceful fallback

- If no suggestions are available, show:

> “No suggestions found. Try linking an outcome or adding keywords to your activity title.”

---

### 🔗 INTEGRATION NOTES

- Existing `Resource` model supports file uploads and URLs—reuse.
- You may need to create a synthetic `Resource` record from a suggestion (with `url` and `title` only).
- Suggested resources are external (YouTube, OpenEd, CPF, etc.)—always open in new tab.
- Avoid duplication: if resource already attached, don’t show again.

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Backend test:**

```http
GET /api/resources/suggestions?activityId=42
→
[
  {
    title: "Syllable Clapping Game (PDF)",
    type: "worksheet",
    url: "https://example.com/syllables.pdf",
    rationale: "Linked to phonological awareness (CO.1)"
  }
]
```

**Frontend test:**

- On editing activity linked to CO.1, suggestions include:

  - 📄 “Syllable Clapping Game”
  - 🎵 “French Rhyming Song”
  - 🌐 “Listening Comprehension Game”

Clicking “Attach” adds it to the activity’s `resources[]` array.

---

### 🚩 RISKS

- Ensure resource links are safe, appropriate, and from reputable sources.
- Avoid suggesting resources when no outcome is linked or subject is missing.
- For AI extensions, sanitize user data and only use public materials.
