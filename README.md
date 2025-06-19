# Teaching Engine 2.0 - Elementary Curriculum Planner

> A comprehensive web-based curriculum planning and management system designed specifically for elementary school teachers in Canada. This tool streamlines yearly planning, weekly scheduling, progress tracking, parent communication, and emergency preparedness - all in one integrated platform.

![CI](https://github.com/mamcisaac/teaching-engine2.0/actions/workflows/ci.yml/badge.svg)

## 🎯 Project Vision

Teaching Engine 2.0 aims to be the "digital teaching assistant" that reduces administrative overhead for elementary teachers by 80%, allowing them to focus on what matters most - teaching. By consolidating curriculum mapping, lesson planning, resource management, progress tracking, and parent communication into a single intuitive interface, we eliminate the need for multiple spreadsheets, documents, and manual cross-referencing.

## ✨ Core Features

### Currently Implemented (Phases 0-3)

- **Subject-Milestone-Activity Hierarchy**: Organize curriculum into subjects, break down into milestones (units/goals), and populate with specific activities
- **Progress Tracking**: Automatic calculation of completion percentages at activity, milestone, and subject levels
- **CRUD Operations**: Full create, read, update, delete functionality for all entities
- **Responsive UI**: Modern React interface with Tailwind CSS and shadcn/ui components
- **Data Persistence**: SQLite database with Prisma ORM for reliable local storage
- **Docker Deployment**: Containerized application for easy deployment
- **Test Coverage**: Comprehensive unit, integration, and E2E tests

### Phase 4 - Implemented Features

1. **Weekly Planner Automation**: Intelligent activity suggestions generate a weekly schedule.
2. **Resource Management**: File uploads and material lists are automatically created from activity notes.
3. **Progress Alerts**: Notifications warn when milestones are falling behind.
4. **Newsletter Generator**: Content is collected from completed activities for easy parent updates.
5. **Emergency Sub Plans**: One-click PDFs provide substitute teachers with the current plan.
6. **Notes & Reflection Management**: Private notes can be added to activities and days; public notes appear in newsletters.

### Phase 5 - Curriculum Intelligence (Partially Implemented)

#### Completed Features

- **Language-Sensitive Assessment Builder**: Create French Immersion assessments with bilingual rubric criteria
  - Pre-defined rubric templates for oral, reading, writing, and mixed assessments
  - Custom rubric criteria support with JSON format
  - Fully integrated with existing assessment system
- **Visual Resource Organizer**: Manage visual teaching resources with curriculum integration
  - Upload and tag images, PDFs, videos, and audio files
  - Link resources to specific outcomes and activities
  - Integrated resource selector in Daily Planner and Newsletter Editor
  - Automatic file type detection and validation
- **Parent Communication Center**: Centralized hub for parent communications
  - Create bilingual newsletters (French/English) with activity links
  - Link messages to classroom activities and learning outcomes
  - Export in multiple formats (PDF, HTML, Markdown)
  - Manage all parent communications from one location
- **Student Timeline Generator**: Comprehensive timeline interface for visualizing student learning journeys
  - Interactive week-based timeline with horizontal scroll navigation
  - Aggregates events from activities, assessments, themes, and newsletters
  - Outcome coverage statistics and next milestone tracking
  - Filtering by subject, outcome, or theme with real-time updates
  - Color-coded event types with contextual metadata display
- **AI Activity Generator**: AI-powered activity suggestion system for uncovered curriculum outcomes
  - Generates developmentally appropriate Grade 1 activities for French Immersion
  - Editable suggestions with theme awareness and material tracking
  - Direct integration with weekly planner for seamless workflow
  - Mock generator for development with OpenAI integration ready

#### In Progress

- **Provincial Curriculum Integration**: Import PEI (and other provincial) curriculum standards
  - Run `pnpm curriculum:import pei-fi-1` to import PEI French Immersion Grade 1 outcomes
  - Use `--overwrite` flag to reset existing outcomes
- **AI-Powered Planning**: Use embeddings to automatically generate milestone-activity mappings
- **Standards Alignment**: Track coverage of official learning outcomes
  - Real-time coverage status (covered/partial/uncovered)
  - Detailed coverage statistics and reporting
  - Integration with curriculum standards
- **Holiday-Aware Scheduling**: Integrate school calendar for accurate pacing

## 🏗️ Technical Architecture

### Tech Stack

| Layer    | Technology                                                          |
| -------- | ------------------------------------------------------------------- |
| Frontend | React 18, TypeScript, Vite, TanStack Query, Tailwind CSS, shadcn/ui |
| Backend  | Node.js 18/20, Express, TypeScript                                  |
| Database | Prisma 5, SQLite (development), PostgreSQL (production ready)       |
| Testing  | Jest (backend), Vitest (frontend), Playwright (E2E)                 |
| DevOps   | GitHub Actions, Docker, pnpm workspaces                             |

### Project Structure

```
teaching-engine2.0/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # UI components (Cards, Forms, etc.)
│   │   ├── api.ts        # API client with React Query hooks
│   │   └── App.tsx       # Main application component
├── server/                # Express backend API
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── prisma.ts     # Prisma client wrapper
│   │   ├── validation.ts # Request schemas
│   │   └── index.ts      # Express application setup
├── packages/
│   └── database/         # Shared Prisma database package
│       ├── prisma/       # Schema and migrations
│       └── src/          # Generated client and exports
├── tests/                # E2E Playwright tests
├── scripts/              # Utility scripts
└── docker-compose.yml    # Container orchestration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or 20
- pnpm 8+
- Docker (optional)

### Development Setup

1. **Clone and Install**

   ```bash
   git clone https://github.com/mamcisaac/teaching-engine2.0.git
   cd teaching-engine2.0
   pnpm install
   ```

2. **Database Setup**

   ```bash
   # Copy environment template
   cp server/.env.offline server/.env

   # Run migrations and generate Prisma client
   pnpm --filter @teaching-engine/database db:migrate
   # Seed sample data
   pnpm --filter @teaching-engine/database db:seed
   ```

3. **Start Development Servers**
   ```bash
   pnpm run dev
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

### Docker Deployment

```bash
docker compose up --build
```

Access the application at http://localhost:3000

## 📚 Feature Documentation

### Assessment Builder

The Language-Sensitive Assessment Builder helps create French Immersion assessments with appropriate rubric criteria:

- Access via Activities page → Create Activity → Assessment type
- Choose from pre-defined rubric templates or create custom criteria
- Supports oral, reading, writing, and mixed assessment types

### Visual Resource Organizer

Manage visual teaching resources:

- Upload resources via the Resources page
- Supported formats: Images (JPG, PNG, GIF), PDFs, Videos (MP4, WebM), Audio (MP3, WAV)
- Tag resources with subjects and outcomes for easy filtering
- Use resources in Daily Planner and Newsletter Editor

### Parent Communication Center

Centralized parent communication management:

- Create messages from Weekly Planner or Messages page
- Link activities and outcomes to provide context
- Export newsletters in multiple formats
- Track communication history

### Student Timeline Generator

Visualize student learning journeys with an interactive timeline:

- Access via the Timeline page or dashboard quick access
- View activities, assessments, themes, and newsletters in chronological order
- Filter by subject, outcome, or theme to focus on specific learning areas
- Navigate through different time periods (3-month windows)
- Track outcome coverage statistics and upcoming milestones
- Color-coded events: blue (activities), purple (assessments), green (themes), yellow (newsletters)

### AI Activity Generator

Generate activities for uncovered curriculum outcomes:

- Available in the Weekly Planner for outcomes lacking sufficient activities
- Click "Generate Activity" for any uncovered outcome
- Edit generated suggestions before adding to your plan
- Automatically includes materials list and theme connections
- Supports French Immersion Grade 1 curriculum requirements
- Integrates seamlessly with existing milestone and activity structure

## API

### Calendar Events

- `POST /api/calendar-events/sync/ical` – Import an external iCal feed. Each
  event from the feed is stored as a holiday `CalendarEvent`.

### Report Deadlines

- `GET /api/report-deadlines?teacherId=` – List deadlines for a teacher.
- `POST /api/report-deadlines` – Create a new deadline.
- `PUT /api/report-deadlines/:id` – Update an existing deadline.
- `DELETE /api/report-deadlines/:id` – Remove a deadline.

### Curriculum Outcomes

- `GET /api/outcomes` – List all curriculum outcomes.
- `GET /api/outcomes?subject=FRA&grade=1` – Filter outcomes by subject and grade.
- `GET /api/outcomes?search=keyword` – Search outcomes by code or description.

### Timeline

- `GET /api/timeline/events` – Get timeline events with optional filtering by date range, subject, outcome, or theme.
- `GET /api/timeline/summary` – Get timeline summary with outcome coverage statistics and next milestone.

### AI Suggestions

- `GET /api/ai-suggestions` – List AI-generated activity suggestions.
- `POST /api/ai-suggestions` – Create a new AI activity suggestion for an outcome.
- `PUT /api/ai-suggestions/:id` – Update an existing suggestion.
- `DELETE /api/ai-suggestions/:id` – Remove a suggestion.
- `POST /api/ai-suggestions/:id/add-to-plan` – Add suggestion to weekly plan as an activity.

## 🧪 Testing

```bash
# Set up test environment
cp server/.env.test.example server/.env.test

# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# All tests with coverage
pnpm run test:all
```

Unit tests cover the iCal import logic and integration tests ensure the
`/api/report-deadlines` CRUD endpoints behave correctly.

If the automatic Playwright installation fails (e.g., due to restricted `sudo` access in CI), install browsers and dependencies manually:

```bash
pnpm exec playwright install-deps
pnpm exec playwright install
```

## 📋 Usage Guide

### Basic Workflow

1. **Initial Setup**: Create subjects for your curriculum (Math, Science, Language Arts, etc.)
2. **Add Milestones**: Define major units or learning goals with target completion dates
3. **Create Activities**: Populate milestones with specific lessons, assignments, and projects
4. **Track Progress**: Mark activities as complete to automatically update progress bars
5. **Plan Weekly**: Use the weekly planner to schedule activities across your timetable
   - Use AI Activity Generator for uncovered outcomes
   - At least one activity must exist to auto-fill a plan
6. **Monitor Progress**: View the Student Timeline to visualize learning journeys and track outcome coverage
7. **Communicate**: Generate parent newsletters from completed activities

### Key Concepts

- **Subject**: Top-level curriculum area (e.g., Mathematics)
- **Milestone**: Major learning unit or goal (e.g., "Multiplication Mastery")
- **Activity**: Specific lesson or task (e.g., "Times tables worksheet")
- **Progress**: Automatic calculation based on completed vs. total activities

## 🤝 Agent Collaboration Guidelines

This project is designed for autonomous agent implementation. Agents should:

1. **Follow Existing Patterns**: Study phases 0-3 implementation for coding style and architecture
2. **Maintain Test Coverage**: Write tests before implementation (TDD approach)
3. **Use Conventional Commits**: `feat:`, `fix:`, `docs:`, `test:`, `chore:`
4. **Branch Strategy**: Create feature branches like `feat/4a-weekly-planner`
5. **Atomic Commits**: Small, focused commits that pass all tests
6. **Documentation**: Update relevant docs with each feature

## 🛡️ Security & Performance

- Input validation on all API endpoints
- Parameterized queries prevent SQL injection
- Rate limiting on API routes (Phase 4)
- Efficient database queries with Prisma
- React Query for optimal caching
- Lazy loading for large datasets

## 📝 License

MIT License - see LICENSE file for details

## 🙋 Support & Contribution

- **Issues**: Report bugs or request features via GitHub Issues
- **Discussions**: Join project discussions for design decisions
- **PRs**: Contributions welcome! See AGENTS.md for implementation guidelines

---

**Note**: This is an active development project. Phase 4 features are implemented and Phase 5 is currently in progress. See AGENTS-TODO.md for the detailed implementation roadmap.
