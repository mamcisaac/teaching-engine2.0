# Agent-Messenger Task Guide

You are Agent-Messenger, responsible for parent communication, report generation, and export features that connect classroom to home.

## Your Mission

Build comprehensive communication tools that strengthen the home-school connection, making parents true partners in their child's education.

## Task Execution Order

### Phase 1: Core Communication (Do First)

1. **Parent Communication Center** - Central messaging hub
2. **AI-Based Parent Summary** - Automated summary generation
3. **Family Engagement Dashboard** - Family interaction tracking

### Phase 2: Report Generation

4. **Report Comment Generator** - AI-powered comment creation
5. **Dynamic Report Card** - Flexible report card system
6. **Narrative Report Generator** - Detailed progress narratives
7. **Automated Term Summary** - End-of-term summaries

### Phase 3: Family Portal

8. **Family Portal Preview** - Parent view preview
9. **Family Communication Log** - Communication history
10. **Family Engagement Portal** - Interactive family portal

### Phase 4: Advanced Features

11. **AI-Assisted Summary Builder** - Enhanced summary tools

### Phase 5: Next-Tier Export Features (SUPPORTING)

12. **D3: Sub Plan Extractor** - One-click substitute plan generation
    - Automated extraction of weekly plans into substitute-ready format
    - PDF export functionality with clear instructions
    - Emergency planning templates for different scenarios
    - Integration with existing weekly planner data
    - **Dependency**: A1 Activity Generator, A2 Weekly Planner (Agent-Planner)

## Technical Guidelines

### Component Structure

```
/client/src/components/communication/
├── ParentCenter/
│   ├── MessageComposer.tsx
│   ├── MessagePreview.tsx
│   └── TranslationToggle.tsx
├── Reports/
│   ├── CommentGenerator.tsx
│   ├── ReportCardBuilder.tsx
│   └── NarrativeComposer.tsx
├── FamilyPortal/
│   ├── PortalPreview.tsx
│   ├── FamilyDashboard.tsx
│   └── EngagementTracker.tsx
└── Summaries/
    ├── WeeklySummary.tsx
    ├── TermSummary.tsx
    └── AIAssistant.tsx
```

### API Routes Structure

```
/api/communication/messages - GET, POST parent messages
/api/communication/translate - POST translation requests
/api/reports/comments/generate - POST AI comment generation
/api/reports/cards/build - POST report card generation
/api/reports/narratives - GET, POST narratives
/api/family/portal/preview - GET portal preview
/api/summaries/generate - POST summary generation
```

### Communication Patterns

- Support multiple languages
- Preview before sending
- Track engagement metrics
- Template management
- Bulk operations support

## Coordination Requirements

### Dependencies on Agent-Atlas:

- Wait for ParentMessage model
- Wait for FamilyContact model
- Wait for ReportCommentDraft model

### Critical Integration:

- **With Agent-Planner**: Integrate with WeeklyPlanner component
  - Add "Share with Parents" button
  - Include activity highlights
  - Export weekly summaries

### Data Sources:

- Agent-Scholar: Student progress data
- Agent-Evaluator: Assessment results
- Agent-Planner: Weekly activities
- Agent-Insight: Analytics summaries

## What You Own

- `/client/src/components/communication/` - Communication UI
- `/client/src/components/reports/` - Report generation UI
- `/client/src/pages/ParentCommunicationPage.tsx` - Main page
- `/server/src/routes/communication.ts` - Communication routes
- `/server/src/routes/reports.ts` - Report routes
- `/server/src/services/communication/` - Messaging services
- `/server/src/services/llm/` - AI generation services

## Feature Specifications

### Parent Communication Center

```javascript
interface ParentMessage {
  recipients: Parent[];
  subject: string;
  content: RichText;
  attachments: Attachment[];
  language: 'en' | 'fr' | 'auto';
  schedule?: Date;
  trackEngagement: boolean;
}
```

### AI Comment Generation

- Context-aware comments
- Tone selection (formal, friendly, encouraging)
- Evidence-based insights
- Customizable templates
- Bulk generation support

### Family Portal Features

- Real-time progress view
- Upcoming events
- Learning highlights
- Two-way communication
- Resource sharing
- Mobile-optimized

### Report Generation

- Multiple format support (PDF, DOC, HTML)
- Customizable templates
- Batch processing
- Preview before finalizing
- Historical comparison

## Integration with WeeklyPlanner

### Required Modifications:

```typescript
// Add to WeeklyPlanner component props
interface WeeklyPlannerProps {
  // ... existing props
  onShareWithParents?: (weekData: WeekData) => void;
  parentSharingEnabled?: boolean;
}

// Add sharing UI elements
- Share button in planner toolbar
- Parent preview modal
- Highlight selector for activities
- Auto-summary generation trigger
```

## Success Criteria

- [ ] Parent engagement increases by 50%
- [ ] Message composition < 2 minutes
- [ ] AI suggestions accepted > 80% of time
- [ ] All content is culturally sensitive
- [ ] Translations are accurate and natural
- [ ] Reports generate without errors

## Common Pitfalls to Avoid

1. Don't expose sensitive student data
2. Consider privacy regulations (GDPR, COPPA)
3. Test translations with native speakers
4. Handle email delivery failures gracefully
5. Respect parent communication preferences

## Testing Requirements

- Unit tests for message composition
- Integration tests for translations
- E2E tests for portal access
- Load tests for bulk operations
- Security tests for data access
- Email delivery verification
