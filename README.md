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

### Phase 5 - Curriculum Intelligence (To Be Implemented)

- **Provincial Curriculum Integration**: Import PEI (and other provincial) curriculum standards
- **AI-Powered Planning**: Use embeddings to automatically generate milestone-activity mappings
- **Standards Alignment**: Track coverage of official learning outcomes
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
│   │   ├── prisma.ts     # Prisma client setup
│   │   ├── validation.ts # Request schemas
│   │   └── index.ts      # Express application setup
├── prisma/               # Database schema and migrations
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
   pnpm db:deploy
   # Seed sample data
   pnpm db:seed
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

## API

### Calendar Events

- `POST /api/calendar-events/sync/ical` – Import an external iCal feed. Each
  event from the feed is stored as a holiday `CalendarEvent`.

### Report Deadlines

- `GET /api/report-deadlines?teacherId=` – List deadlines for a teacher.
- `POST /api/report-deadlines` – Create a new deadline.
- `PUT /api/report-deadlines/:id` – Update an existing deadline.
- `DELETE /api/report-deadlines/:id` – Remove a deadline.

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
5. **Plan Weekly**: Use the weekly planner (Phase 4) to schedule activities across your timetable. At least one activity must exist to auto-fill a plan
6. **Communicate**: Generate parent newsletters from completed activities (Phase 4)

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
