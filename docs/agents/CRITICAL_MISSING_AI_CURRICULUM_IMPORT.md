# ⚠️ CRITICAL MISSING FEATURE: AI-Powered Curriculum Import

## Status: NOT IMPLEMENTED ❌

Despite being listed in PR descriptions and marked as "the most important piece" by stakeholders, the **AI-Powered Curriculum Import** feature is completely missing from the codebase.

## What This Feature Should Do

The AI-Powered Curriculum Import is intended to:

1. **Accept various curriculum document formats** (PDF, DOC, DOCX, TXT)
2. **Use AI to parse and extract learning outcomes** from unstructured curriculum documents
3. **Automatically organize outcomes into subjects and grade levels**
4. **Map outcomes to the existing database structure**
5. **Provide a review interface** for teachers to verify and adjust the AI's parsing
6. **Save hours of manual data entry** when setting up a new curriculum

## Why This Is Critical

- Teachers currently must **manually enter every outcome** one by one
- Setting up a full curriculum can take **days of tedious data entry**
- This feature was identified as the **#1 time-saver** for teacher onboarding
- Without it, adoption is severely limited as teachers won't invest the setup time

## Technical Requirements

### Backend Components Needed

```typescript
// 1. File upload and processing service
class CurriculumImportService {
  async uploadDocument(file: Buffer, mimeType: string): Promise<string>
  async extractText(documentId: string): Promise<string>
  async parseWithAI(text: string): Promise<ParsedCurriculum>
  async saveToDB(curriculum: ParsedCurriculum, userId: number): Promise<ImportResult>
}

// 2. AI parsing with OpenAI/Claude
interface ParsedCurriculum {
  subject: string
  grade: number
  outcomes: Array<{
    code: string
    description: string
    strand?: string
    substrand?: string
  }>
}

// 3. API endpoints
POST /api/curriculum/import/upload
GET  /api/curriculum/import/:id/status
POST /api/curriculum/import/:id/review
POST /api/curriculum/import/:id/confirm
```

### Frontend Components Needed

```typescript
// 1. Upload interface
<CurriculumImportWizard>
  <FileUploadStep />
  <ProcessingStep />
  <ReviewStep />
  <ConfirmationStep />
</CurriculumImportWizard>

// 2. Review and edit interface
<OutcomeReviewTable>
  - Show AI-parsed outcomes
  - Allow editing/correction
  - Bulk actions (approve/reject)
  - Manual additions
</OutcomeReviewTable>
```

### Database Changes Needed

```prisma
model CurriculumImport {
  id          Int      @id @default(autoincrement())
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  filename    String
  status      ImportStatus
  rawText     String?
  parsedData  Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum ImportStatus {
  UPLOADING
  PROCESSING
  READY_FOR_REVIEW
  CONFIRMED
  FAILED
}
```

## Implementation Priority

This should be **Priority 1** for Phase 5 completion because:

1. It's a major blocker for teacher adoption
2. It was promised in multiple PR descriptions
3. It enables all other features by populating the curriculum data
4. Manual curriculum entry is the #1 pain point in user feedback

## Estimated Effort

- **Backend API & AI Integration**: 3-4 days
- **Frontend Wizard & Review UI**: 2-3 days
- **Testing & Edge Cases**: 2 days
- **Total**: ~1 week with focused effort

## Related But Implemented Features

Note: The following AI features HAVE been implemented:

- ✅ AI Activity Generator (generates activities for uncovered outcomes)
- ✅ AI Newsletter Content Generation
- ✅ AI Emergency Substitute Plans

Only the Curriculum Import remains unimplemented.

---

**Action Required**: This feature must be implemented before the Teaching Engine 2.0 can be considered feature-complete for Phase 5.
