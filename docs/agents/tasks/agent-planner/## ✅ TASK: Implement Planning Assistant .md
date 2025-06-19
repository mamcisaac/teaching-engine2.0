## ✅ TASK: Implement Planning Assistant Sidebar

---

### 🧠 You are an expert software engineer working on Teaching-Engine 2.0

You are building a **live sidebar tool** that augments the Weekly Planner interface. As teachers add or edit activities, the assistant displays real-time suggestions: related outcomes, recently used vocabulary, theme coverage balance, and missed or underused domains. This assistant improves planning quality, coverage, and consistency while reducing cognitive load.

---

### 🔹 GOAL

Allow teachers to:

- Receive context-aware suggestions during planning
- Auto-link outcomes based on keywords or themes
- Surface underused domains or outcomes
- Insert vocabulary from current themes directly into activities
- Maintain balance across themes and subjects

---

### ✅ SUCCESS CRITERIA

- While editing a weekly plan:

  - Assistant shows outcome suggestions based on entered text
  - Vocabulary relevant to the theme or domain is suggested
  - Themes used this term are summarized with usage frequency
  - Button to “Auto-tag outcomes” for current activity
  - Button to “Insert Vocabulary Bank” into planner block

---

### 🔧 BACKEND TASKS

#### 🟢 1. Create Suggestion Engine Service

Input:

- Current planner block:

  - Title
  - Description
  - Theme
  - Week
  - Domain

Output:

- `suggestedOutcomes`: array of outcome IDs ranked by relevance
- `themeCoverageSummary`: recent themes used in term with usage count
- `recommendedVocabulary`: vocab entries matching this block’s domain/theme

Endpoint:

```ts
POST /api/assistant/planner-hints
{
  title: "Fire Station Visit",
  description: "Students will roleplay...",
  domain: "oral",
  week: 6,
  theme: "Community"
}
```

Returns:

```json
{
  "suggestedOutcomes": [12, 14],
  "recommendedVocabulary": ["les pompiers", "le camion", "protéger"],
  "themeCoverageSummary": {
    "Community": 8,
    "Seasons": 2
  }
}
```

---

### 🎨 FRONTEND TASKS

#### 🔵 2. Sidebar Component

Component: `PlanningAssistantSidebar.tsx`

Live, collapsible panel next to each weekly planner entry.

Sections:

- ✅ **Outcome Suggestions**

  - List of 2–4 suggested outcomes
  - \[➕ Add Outcome] to activity

- 📚 **Vocabulary Suggestions**

  - List of recent vocab entries by domain/theme
  - \[➕ Insert All] \[➕ Choose]

- 🧩 **Theme Coverage**

  - Term-so-far: theme usage count (bar chart or list)

- 🚨 **Unlinked Domains**

  - If a domain hasn’t been planned in last 2–3 weeks → alert

#### 🔵 3. Auto-Tag Outcomes

Button: \[✨ Auto-Link Outcomes]

- Runs backend matcher and attaches relevant outcome IDs

#### 🔵 4. Vocabulary Insertion Tool

Button: \[📘 Add Vocabulary List]

- Inserts a bullet list of selected words into planner description

---

### 🔗 INTEGRATION NOTES

- Works alongside the PlannerEditor interface
- Pulls from:

  - Outcome matrix
  - Theme usage model
  - Vocabulary growth tracker

- Future integration: AI-based phrasing enhancement of planner text

---

### 🧪 FUNCTIONAL TEST EXAMPLE

**Call:**

```http
POST /api/assistant/planner-hints
{
  title: "Fire Station Visit",
  description: "Students will roleplay calling 911 and dressing as firefighters...",
  domain: "oral",
  week: 6,
  theme: "Community"
}
```

Returns:

```json
{
  "suggestedOutcomes": [21, 24],
  "recommendedVocabulary": ["les pompiers", "urgence", "aider"],
  "themeCoverageSummary": {
    "Community": 7,
    "Seasons": 2,
    "Feelings": 0
  }
}
```

Rendered Sidebar:

> ✅ **Suggested Outcomes**
>
> - \[✓] Use full sentences when giving information
> - [ ] Ask and answer simple questions about real-world topics

> 📘 **Vocabulary Suggestions**
>
> - les pompiers, urgence, aider
>   \[📎 Insert List] \[🧠 Mark as Practiced]

> 🧩 **Theme Summary**
>
> - Community: 7 uses
> - Seasons: 2
> - Feelings: 0 🔸

---

### 🚩 RISKS

- Suggestions may overwhelm if not ranked or filtered well
- Teacher edits should never be overwritten—assistant must be assistive, not prescriptive
- Avoid hallucination: suggestions must come only from existing database entries
