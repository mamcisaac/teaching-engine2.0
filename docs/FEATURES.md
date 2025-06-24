# Features Documentation

This document describes the features in Teaching Engine 2.0.

## Daybook Analytics System

### Overview

The Daybook Analytics System provides comprehensive insights into teaching effectiveness and student progress through daily reflection data analysis.

### Features

- **Teaching Trend Analysis**: Track rating patterns and engagement trends over time
- **Theme Extraction**: Identify common success and challenge patterns from reflection text
- **Actionable Recommendations**: Generate data-driven suggestions for teaching improvement
- **Coverage Visualization**: Monitor curriculum expectation coverage with analytics
- **Progress Insights**: View teaching effectiveness through quantified reflection data
- **Export Capabilities**: Generate PDF reports for professional development documentation

### Analytics Types

- **Rating Trends**: Track lesson effectiveness ratings over time (improving/declining/stable)
- **Engagement Analysis**: Sentiment analysis of student engagement observations
- **Theme Identification**: Extract common keywords from "what worked" and "challenges" reflections
- **Recommendation Engine**: Generate actionable insights based on reflection patterns

### Usage

1. Create daybook entries linked to lesson plans
2. Complete reflection fields (what worked, challenges, next steps)
3. View analytics through the insights endpoint
4. Export trends for professional development conversations

### API Endpoints

- `GET /api/daybook-entries/insights/summary` - Get comprehensive analytics and recommendations

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
- **Description**: Detailed instructions and learning objectives
- **Materials**: List of required materials and resources
- **Theme Links**: Connections to current thematic units
- **Outcome Alignment**: Clear mapping to curriculum outcomes

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

### Timeline Components

- `StudentTimeline.tsx` - Main timeline interface with filtering and navigation
- `TimelinePage.tsx` - Page wrapper for timeline component
- Dashboard integration with quick access card

### AI Generator Components

- `UncoveredOutcomesPanel.tsx` - Displays outcomes needing attention
- `AISuggestionModal.tsx` - Modal for editing AI suggestions
- UI components for seamless planner integration

### Navigation Updates

- Timeline added to main navigation menu
- Dashboard quick access for timeline
- Weekly planner integration for AI suggestions

## Testing Coverage

### Timeline Tests

- Comprehensive API endpoint testing for events and summary
- React component tests with mock data and user interactions
- Accessibility testing for form labels and navigation
- Date range handling and dynamic content testing

### AI Generator Tests

- Backend API testing for all CRUD operations
- Frontend component testing for modal interactions
- Integration testing with weekly planner workflow
- Mock service testing for AI generation logic

## Configuration and Setup

### Environment Variables

No additional environment variables required for basic functionality.

For OpenAI integration (optional):

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-3.5-turbo  # or gpt-4
```

### Development Mode

Both features work fully in development mode:

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
