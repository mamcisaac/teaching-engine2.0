# Features Documentation

This document describes the features in Teaching Engine 2.0, specifically optimized for Grade 1 French Immersion teaching in PEI.

## Teacher Onboarding & Subject Selection

### Overview

A comprehensive 4-step onboarding flow that personalizes the Teaching Engine experience based on which subjects each teacher actually teaches, recognizing that not all teachers teach every subject (e.g., specialist teachers handle PE, Health, Music).

### Features

- **Automatic Onboarding**: Appears for new users on first login
- **4-Step Wizard Process**:
  1. Welcome & ETFO Planning Introduction
  2. 5-Level Planning Hierarchy Explanation
  3. **Subject Selection** - Core feature for personalization
  4. Feature Overview & AI Assistant Tour
- **Smart Subject Selection**:
  - **Core Subjects**: Français langue première, Mathématiques (with warnings if not selected)
  - **Optional Subjects**: Sciences, Études sociales, English Language Arts, Arts
  - **Specialist Subjects**: Éducation physique, Éducation à la santé
- **Persistent Storage**: Subject selections saved to localStorage
- **Subject Management**: Teachers can update subject selection from dashboard

### Technical Implementation

- React Context API for onboarding state management
- localStorage persistence with `STORAGE_KEYS` constants
- Validation system ensuring core subjects are addressed
- Confirmation dialogs for missing core subjects

### API Integration

- No backend storage required - uses client-side localStorage
- Integrates with curriculum filtering throughout the application

## Grade 1 French Immersion Curriculum System

### Overview

Comprehensive curriculum database with 68 Grade 1 French Immersion expectations specifically aligned with PEI standards, organized by subject and integrated with the ETFO planning methodology.

### Features

- **Complete Curriculum Coverage**: 68 detailed Grade 1 expectations across all subjects
- **Subject Organization**:
  - **Français langue première**: 15 expectations (oral communication, reading, writing)
  - **Mathématiques**: 20 expectations (numbers, patterns, measurement, geometry, data)
  - **Sciences et technologie**: 10 expectations (biology, physics, earth/space, inquiry)
  - **Études sociales**: 8 expectations (heritage/identity, people/environments)
  - **Arts**: 10 expectations (visual arts, drama, music, dance)
  - **English Language Arts**: 5 expectations (for French Immersion context)
- **Subject-Based Filtering**: Teachers only see curriculum for their selected subjects
- **Coverage Tracking**: Real-time progress indicators for each subject
- **Search & Discovery**: Full-text search across expectations with subject filtering

### Database Schema

```sql
model CurriculumExpectation {
  id          String   @id @default(cuid())
  code        String   @unique
  description String
  content     String
  subject     String
  strand      String?
  substrand   String?
  grade       Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### API Endpoints

- `GET /api/curriculum-expectations` - List expectations with subject filtering
- `GET /api/curriculum-expectations/:id` - Get specific expectation details
- Query parameters support for subject filtering and search

### Seeded Data Structure

Each expectation includes:
- **Unique Code**: PEI curriculum reference (e.g., "FLP1.1", "M1.1")
- **Description**: Clear learning outcome description in French
- **Subject**: Filterable subject classification
- **Strand & Substrand**: Detailed curriculum organization
- **Grade Level**: Set to Grade 1 for all current expectations

## Daybook System

### Overview

The Daybook System provides simple daily reflection tracking for teaching effectiveness.

### Features

- **Daily Reflections**: Record what worked, what didn't, and next steps
- **Rating System**: Simple 1-5 rating for lesson effectiveness
- **Bilingual Support**: Reflection fields available in English and French
- **Curriculum Tracking**: Link reflections to specific lesson plans
- **Subject Integration**: Reflections filtered based on selected teaching subjects

### Usage

1. Create daybook entries linked to lesson plans
2. Complete reflection fields (what worked, challenges, next steps)
3. Use for personal teaching improvement and substitute preparation

### API Endpoints

- `GET /api/daybook-entries` - List daybook entries
- `POST /api/daybook-entries` - Create new entry
- `PUT /api/daybook-entries/:id` - Update entry
- `DELETE /api/daybook-entries/:id` - Remove entry

## AI Activity Generator

### Overview

The AI Activity Generator helps teachers create appropriate activities for curriculum outcomes that lack sufficient coverage by using AI to generate contextually relevant suggestions.

### Features

- **Automatic Detection**: Identifies outcomes needing more activities
- **AI-Powered Generation**: Creates developmentally appropriate Grade 1 activities
- **Editable Suggestions**: Teachers can modify generated content before use
- **Theme Integration**: Suggests activities that align with current themes
- **Material Lists**: Automatically generates required materials
- **Seamless Integration**: Add suggestions directly to weekly plans

### Workflow

1. Navigate to Weekly Planner
2. View the "Uncovered Outcomes" panel for outcomes needing attention
3. Click "Generate Activity" for any uncovered outcome
4. Review and edit the AI-generated suggestion in the modal
5. Add the refined activity to your lesson plan or unit plan

### Generated Content

Each AI suggestion includes:

- **Activity Title**: Descriptive name for the activity
- **Description**: Detailed instructions and learning objectives appropriate for Grade 1 French Immersion
- **Materials**: List of required materials and resources
- **Theme Links**: Connections to current thematic units
- **Outcome Alignment**: Clear mapping to Grade 1 PEI curriculum expectations
- **Subject Filtering**: Only generates activities for teacher's selected subjects

### Technical Implementation

- **Mock Generator**: Development mode uses predefined templates
- **OpenAI Integration**: Production-ready for GPT integration
- **Database Storage**: Suggestions stored as `AISuggestedActivity` entities
- **API Integration**: RESTful endpoints for full CRUD operations

### API Endpoints

- `GET /api/ai-suggestions` - List all AI suggestions
- `POST /api/ai-suggestions` - Create new suggestion for outcome
- `PUT /api/ai-suggestions/:id` - Update existing suggestion
- `DELETE /api/ai-suggestions/:id` - Remove suggestion
- `POST /api/ai-suggestions/:id/add-to-plan` - Add to weekly plan

## Database Schema Updates

### Timeline Support

The timeline feature uses existing database entities without requiring schema changes:

- Activities (with completion dates)
- Assessment Results (with dates and scores)
- Thematic Units (with start/end dates)
- Parent Messages (with creation dates)

### AI Suggestions Schema

New `AISuggestedActivity` table:

```sql
model AISuggestedActivity {
  id          Int      @id @default(autoincrement())
  outcomeId   String
  title       String
  description String
  materials   String?
  themeId     Int?
  userId      Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  outcome Outcome       @relation(fields: [outcomeId], references: [id])
  theme   ThematicUnit? @relation(fields: [themeId], references: [id])
  user    User          @relation(fields: [userId], references: [id])
}
```

## Frontend Components

### Onboarding Components

- `TeacherOnboardingFlow.tsx` - 4-step onboarding wizard with subject selection
- `PlanningDashboard.tsx` - Shows selected subjects and curriculum coverage
- `SimpleCurriculumPage.tsx` - Subject-filtered curriculum expectations view
- Dashboard integration with subject display and coverage tracking

### Timeline Components

- `StudentTimeline.tsx` - Main timeline interface with filtering and navigation
- `TimelinePage.tsx` - Page wrapper for timeline component
- Dashboard integration with quick access card

### AI Generator Components

- `UncoveredOutcomesPanel.tsx` - Displays outcomes needing attention
- `AISuggestionModal.tsx` - Modal for editing AI suggestions
- UI components for seamless planner integration

### Navigation Updates

- Subject selection accessible from dashboard
- Curriculum page shows selected subjects prominently
- Coverage indicators throughout planning interface
- Timeline added to main navigation menu
- Dashboard quick access for timeline
- Weekly planner integration for AI suggestions

## Testing Coverage

### Timeline Tests

- Comprehensive API endpoint testing for events and summary
- React component tests with mock data and user interactions
- Accessibility testing for form labels and navigation
- Date range handling and dynamic content testing

### Onboarding & Curriculum Tests

- Onboarding flow testing for all 4 steps
- Subject selection validation and persistence testing
- Curriculum filtering and search functionality testing
- Coverage tracking calculation accuracy testing
- localStorage integration and data persistence testing

### AI Generator Tests

- Backend API testing for all CRUD operations
- Frontend component testing for modal interactions
- Integration testing with weekly planner workflow
- Mock service testing for AI generation logic with subject filtering

## Configuration and Setup

### Environment Variables

No additional environment variables required for basic functionality.

For OpenAI integration (optional):

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-3.5-turbo  # or gpt-4
```

### Development Mode

All features work fully in development mode:

- Onboarding flow with subject selection functional immediately
- 68 Grade 1 curriculum expectations pre-seeded in database
- Subject filtering works across all curriculum views
- Coverage tracking calculates from existing data
- Timeline uses existing data sources
- AI generator uses mock responses (no API key required)

### Production Deployment

Features are production-ready with:

- Comprehensive error handling
- Performance optimized queries
- Responsive design for all screen sizes
- Full accessibility compliance

## Database Setup

To set up the database schema:

```bash
pnpm --filter @teaching-engine/database db:migrate
```

## Troubleshooting

### Common Issues

#### Onboarding Not Appearing

- Clear localStorage and refresh to reset onboarding state
- Check that `onboarded` key is null in localStorage for new users
- Verify TeacherOnboardingFlow component is properly integrated

#### Curriculum Not Filtering by Subject

- Check localStorage for `teacher-subjects` key with selected subjects
- Verify API endpoints support subject filtering query parameters
- Ensure Grade 1 curriculum data is properly seeded with 68 expectations

#### Coverage Tracking Not Updating

- Verify curriculum expectations have proper subject classifications
- Check that teacher's selected subjects match expectation subjects exactly
- Ensure coverage calculation includes all 68 expectations for selected subjects

#### Timeline Not Loading

- Verify database connection and migrations are applied
- Check browser console for API errors
- Ensure adequate test data exists

#### AI Generator Not Working

- Confirm API endpoints are accessible
- Check for JavaScript errors in browser console
- Verify outcome data exists in database

#### Performance Issues

- Timeline queries are optimized but may be slow with large datasets
- Consider pagination for years with extensive activity history
- AI generation is cached to improve response times

### Support

For issues or questions regarding these features:

1. Check the browser console for error messages
2. Review the test files for expected behavior
3. Refer to the API documentation for endpoint details
4. Create an issue in the GitHub repository with detailed reproduction steps
