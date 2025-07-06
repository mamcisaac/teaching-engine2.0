# Teaching Engine 2.0 - Digital Teaching Assistant

> A comprehensive digital teaching assistant for elementary school teachers in Canada. Teaching Engine 2.0 consolidates curriculum planning, resource management, progress tracking, parent communication, and AI-powered assistance into one seamless platform.

![CI](https://github.com/mamcisaac/teaching-engine2.0/actions/workflows/ci.yml/badge.svg)

## 🎯 Mission Accomplished

Teaching Engine 2.0 has achieved its goal of becoming the comprehensive "digital teaching assistant" that reduces administrative overhead for elementary teachers by 60%+. By integrating curriculum mapping, lesson planning, resource management, progress tracking, AI assistance, and parent communication into a single intuitive interface, teachers can now focus on what matters most - teaching.

## ✨ Core Features

### Foundation Features
- **ETFO 5-Level Planning Hierarchy**: Organize curriculum through Curriculum Expectations → Long-Range Plans → Unit Plans → Lesson Plans → Daybook Entries
- **Progress Tracking**: Automatic calculation of completion percentages and curriculum coverage analysis
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
- **Daybook System**: Daily reflection and progress tracking for continuous improvement
- **Progress Insights**: Analytics and trend analysis for curriculum coverage and teaching effectiveness

#### Curriculum Intelligence
- **AI-Powered Curriculum Import**: Parse curriculum documents (PDF/DOC) to extract outcomes
- **Intelligent Outcome Clustering**: Semantic analysis groups related learning objectives
- **Enhanced Planning**: Thematic grouping and cross-curricular connections
- **Bulk Material Generation**: Templates for rapid content creation
- **Service Infrastructure**: Health monitoring and performance optimization

### Special Features

#### Assessment & Evaluation
- **Integrated Assessment Tracking**: Track student progress through daybook entries and lesson plan reflections
- **Bilingual Support**: Full French-English support for all planning and reflection components

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

### Daybook System

Track daily teaching experiences and student progress:

- Create daily reflection entries linked to lesson plans
- Track what worked, challenges faced, and next steps
- Monitor student engagement and progress
- Generate analytics and trends from reflection data
- Export insights for professional development

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

### ETFO Planning

- `GET /api/curriculum-expectations` – Get curriculum expectations with filtering
- `GET /api/long-range-plans` – List long-range plans
- `GET /api/unit-plans` – List unit plans
- `GET /api/etfo-lesson-plans` – List ETFO lesson plans
- `GET /api/daybook-entries` – Get daybook entries and analytics

### AI Suggestions

- `GET /api/ai-suggestions` – List AI-generated activity suggestions.
- `POST /api/ai-suggestions` – Create a new AI activity suggestion for an outcome.
- `PUT /api/ai-suggestions/:id` – Update an existing suggestion.
- `DELETE /api/ai-suggestions/:id` – Remove a suggestion.
- `POST /api/ai-suggestions/:id/add-to-plan` – Add suggestion to weekly plan as an activity.

## 🧪 Testing

We've simplified testing from 20+ commands down to **8 intuitive commands**:

```bash
# Smart test detection - runs the right tests automatically
pnpm test

# Watch mode for TDD
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Debug tests interactively
pnpm test:debug

# Quick smoke test (5 second timeout)
pnpm test:quick

# Fix common test issues
pnpm test:fix

# Run all tests for CI
pnpm test:ci

# Show help
pnpm test:help
```

## 🔍 Code Quality

### Strict Linting

This project enforces strict ESLint rules for high code quality:

```bash
# Run strict linting checks
pnpm lint:strict

# Auto-fix linting issues
pnpm lint:strict:fix

# Standard linting (for CI)
pnpm lint
```

**Key enforcements:**
- No `any` types in TypeScript
- Explicit function return types
- Strict null checks
- Consistent imports/exports
- React best practices

See [docs/strict-linting-guide.md](docs/strict-linting-guide.md) for detailed linting rules and examples.

### Smart Test Detection

The default `pnpm test` command automatically:
- Detects which files have changed
- Runs only the relevant tests  
- Provides enhanced error messages with solutions
- Uses optimal parallelization for speed

### VSCode Integration

Full debugging support with included launch configurations:
- Debug current test file with F5
- Set breakpoints in tests
- Step through test execution

See [docs/TESTING-GUIDE.md](docs/TESTING-GUIDE.md) for complete testing documentation.

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

2. **Create Long-Range Plans**: Define major curriculum areas and yearly goals
   - Link curriculum expectations to long-range planning objectives

3. **Develop Unit Plans**: Break down long-range goals into manageable units
   - Organize expectations thematically or by learning progression
   - Set unit timelines and assessment strategies

4. **Plan Lessons**: Create specific lesson plans within units
   - Use AI planning assistance for content generation
   - Link visual resources and materials

5. **Track Progress**: 
   - Create daybook entries to reflect on lesson effectiveness
   - Monitor curriculum coverage through analytics
   - Review trends in teaching and learning

6. **Communicate**: 
   - Generate bilingual parent newsletters from completed activities
   - Export in multiple formats (PDF, HTML, Markdown)
   - Manage all communications from one hub

### Key Concepts

- **Curriculum Expectations**: Provincial curriculum standards and learning objectives
- **Long-Range Plans**: Yearly planning documents covering major curriculum areas  
- **Unit Plans**: Thematic units organizing expectations into logical teaching sequences
- **Lesson Plans**: Daily lessons with specific activities, materials, and assessments
- **Daybook Entries**: Daily reflections tracking teaching effectiveness and student progress

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
