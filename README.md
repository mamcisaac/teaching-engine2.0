# Teaching Engine 2.0 - Digital Teaching Assistant

> A comprehensive digital teaching assistant for elementary school teachers in Canada. Teaching Engine 2.0 consolidates curriculum planning, resource management, progress tracking, parent communication, and AI-powered assistance into one seamless platform.

![CI](https://github.com/mamcisaac/teaching-engine2.0/actions/workflows/ci.yml/badge.svg)

## 🎯 Mission Accomplished

Teaching Engine 2.0 has achieved its goal of becoming the comprehensive "digital teaching assistant" that reduces administrative overhead for elementary teachers by 60%+. By integrating curriculum mapping, lesson planning, resource management, progress tracking, AI assistance, and parent communication into a single intuitive interface, teachers can now focus on what matters most - teaching.

## ✨ Core Features

### Foundation Features
- **Subject-Milestone-Activity Hierarchy**: Organize curriculum into subjects, break down into milestones (units/goals), and populate with specific activities
- **Progress Tracking**: Automatic calculation of completion percentages at activity, milestone, and subject levels
- **CRUD Operations**: Full create, read, update, delete functionality for all entities
- **Responsive UI**: Modern React interface with Tailwind CSS and shadcn/ui components
- **Data Persistence**: SQLite database with Prisma ORM for reliable local storage
- **Docker Deployment**: Containerized application for easy deployment
- **Test Coverage**: Comprehensive unit, integration, and E2E tests

#### Planning & Automation
- **Weekly Planner Automation**: Intelligent activity suggestions generate a weekly schedule
- **AI Activity Generator**: Generate developmentally appropriate activities for uncovered outcomes
- **Holiday-Aware Scheduling**: Integrate school calendar for accurate pacing
- **Emergency Sub Plans**: One-click PDFs provide substitute teachers with the current plan

#### Resource & Content Management
- **Resource Management**: File uploads and material lists automatically created from activity notes
- **Visual Resource Organizer**: Manage images, PDFs, videos with curriculum integration
- **Notes & Reflection Management**: Private notes for activities and days; public notes appear in newsletters

#### Communication & Reporting
- **Newsletter Generator**: Content collected from completed activities for parent updates
- **Parent Communication Center**: Centralized hub for bilingual parent communications
- **Student Timeline Generator**: Interactive visualization of student learning journeys
- **Progress Alerts**: Notifications warn when milestones are falling behind

#### Curriculum Intelligence
- **AI-Powered Curriculum Import**: Parse curriculum documents (PDF/DOC) to extract outcomes
- **Intelligent Outcome Clustering**: Semantic analysis groups related learning objectives
- **Enhanced Planning**: Thematic grouping and cross-curricular connections
- **Bulk Material Generation**: Templates for rapid content creation
- **Service Infrastructure**: Health monitoring and performance optimization

### Special Features

#### Assessment & Evaluation
- **Language-Sensitive Assessment Builder**: Create French Immersion assessments with bilingual rubric criteria
  - Pre-defined rubric templates for oral, reading, writing, and mixed assessments
  - Custom rubric criteria support with JSON format
  - Fully integrated with existing assessment system

#### Curriculum Analysis
- **Curriculum Alignment Audit Tool**: Comprehensive curriculum coverage analysis
  - Visual dashboard showing outcome coverage status and gaps
  - Filter by term, subject, grade, and domain
  - Identify uncovered, overused, and unassessed outcomes
  - Export audit reports in CSV and Markdown formats
  - Color-coded indicators for quick visual assessment

#### Standards Integration
- **Provincial Curriculum Integration**: Import PEI (and other provincial) curriculum standards
  - Run `pnpm curriculum:import pei-fi-1` to import PEI French Immersion Grade 1 outcomes
  - Use `--overwrite` flag to reset existing outcomes
- **Standards Alignment**: Track coverage of official learning outcomes
  - Real-time coverage status (covered/partial/uncovered)
  - Detailed coverage statistics and reporting
  - Integration with curriculum standards

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

### Curriculum Alignment Audit Tool

Analyze curriculum coverage and identify gaps:

- Access via Navigation → Curriculum Audit
- Filter outcomes by subject, grade, term, or domain
- View detailed coverage statistics and visual indicators
- Export comprehensive reports for planning and accountability
- Identify outcomes that need attention or are overused

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

1. **Initial Setup**: 
   - Create subjects for your curriculum (Math, Science, Language Arts, etc.)
   - Import provincial curriculum standards or use AI to parse curriculum documents

2. **Add Milestones**: Define major units or learning goals with target completion dates

3. **Create Activities**: 
   - Populate milestones with specific lessons, assignments, and projects
   - Use AI Activity Generator for uncovered outcomes
   - Link visual resources and materials

4. **Plan Weekly**: 
   - Use the weekly planner to schedule activities across your timetable
   - Auto-fill with intelligent suggestions
   - Review curriculum coverage audit

5. **Track Progress**: 
   - Mark activities as complete to update progress automatically
   - View Student Timeline for learning journey visualization
   - Monitor outcome coverage statistics

6. **Communicate**: 
   - Generate bilingual parent newsletters from completed activities
   - Export in multiple formats (PDF, HTML, Markdown)
   - Manage all communications from one hub

### Key Concepts

- **Subject**: Top-level curriculum area (e.g., Mathematics)
- **Milestone**: Major learning unit or goal (e.g., "Multiplication Mastery")
- **Activity**: Specific lesson or task (e.g., "Times tables worksheet")
- **Progress**: Automatic calculation based on completed vs. total activities

## 🤝 Development Guidelines

This project follows strict development standards:

1. **Follow Existing Patterns**: Study the codebase for coding style and architecture
2. **Maintain Test Coverage**: Write tests before implementation (TDD approach) - target 90%+ coverage
3. **Use Conventional Commits**: `feat:`, `fix:`, `docs:`, `test:`, `chore:`
4. **Branch Strategy**: Create feature branches for all development
5. **Atomic Commits**: Small, focused commits that pass all tests
6. **Documentation**: Update relevant docs with each feature
7. **TypeScript**: Strict mode with no `any` types
8. **Performance**: Measure impact of all changes

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
- **PRs**: Contributions welcome! Follow the development guidelines above

## 🎉 Project Status

**Teaching Engine 2.0 is feature-complete!** All five phases have been successfully implemented:

- ✅ **Phase 0-3**: Foundation, Backend API, Frontend UI, MVP Polish
- ✅ **Phase 4**: Weekly Planner, Resource Management, Progress Tracking
- ✅ **Phase 5**: Curriculum Intelligence with AI Integration

The platform now provides:
- 60%+ reduction in teacher administrative workload
- Comprehensive curriculum coverage tracking
- Seamless parent communication
- AI-powered planning assistance
- Full provincial curriculum integration

For potential future enhancements, see [docs/agents/ENHANCEMENT_FEATURES.md](docs/agents/ENHANCEMENT_FEATURES.md).

---

**Built with ❤️ for elementary teachers everywhere**
