# Teaching Engine 2.0 - Project Goals & Intentions

## 🎯 Core Mission

Teaching Engine 2.0 is designed to be the **ultimate digital teaching assistant** for elementary school teachers. Our goal is to reduce teacher workload by 60% while improving curriculum coverage and student outcomes through intelligent automation and planning tools.

## 🏗️ Architectural Philosophy

### Intentional Design Decisions

1. **Simplicity Over Complexity**

   - Every feature must reduce teacher workload, not add to it
   - UI should be intuitive for non-technical users
   - One-click solutions preferred over multi-step processes

2. **Data-Driven Intelligence**

   - All suggestions based on actual curriculum data
   - Progress tracking drives automated recommendations
   - Real-time adaptation to teaching pace and style

3. **Professional Integration**

   - Seamless fit into existing teacher workflows
   - Export capabilities for standard formats (PDF, DOCX)
   - Emergency preparedness built into core functionality

4. **Reliability First**
   - 99.9% uptime target
   - Graceful degradation when services are unavailable
   - Comprehensive error handling and user feedback

## 🎓 Target User Profile

### Primary Users: Elementary Teachers

- **Experience Level**: Mixed (new teachers to 30+ year veterans)
- **Technical Comfort**: Low to moderate
- **Time Constraints**: Extreme (60+ hour work weeks common)
- **Pain Points**:
  - Curriculum planning takes 10+ hours weekly
  - Tracking coverage across subjects is manual
  - Parent communication requires significant time
  - Substitute planning is always last-minute

### Use Cases We Optimize For

1. **Sunday Planning Session** (2-3 hours) → Reduced to 30 minutes
2. **Daily Activity Tracking** (10 minutes) → Reduced to 2 minutes
3. **Monthly Parent Newsletter** (45 minutes) → Reduced to 5 minutes
4. **Emergency Sub Plans** (30 minutes) → Reduced to 2 minutes

## 🚀 Product Roadmap & Phases

### Phase 0-3: Foundation (COMPLETED)

**Goal**: Establish robust MVP with core CRUD operations

- ✅ Subject, Milestone, Activity management
- ✅ React UI with forms and visualizations
- ✅ SQLite database with Prisma ORM
- ✅ Comprehensive test suite (90%+ coverage)
- ✅ CI/CD pipeline and Docker deployment

### Phase 4: Intelligent Automation (IN PROGRESS)

**Goal**: Transform from data manager to intelligent assistant

#### 4.1 Weekly Planner Automation

- **Intention**: Replace manual weekly planning with AI suggestions
- **Success Criteria**: 95% teacher acceptance rate of suggestions
- **Key Features**:
  - Drag-and-drop calendar interface
  - Considers unit plan timelines and pacing
  - Respects teacher preferences and style
  - One-click "auto-fill" optimal scheduling

#### 4.2 Resource Management System

- **Intention**: Eliminate resource hunting and preparation chaos
- **Success Criteria**: 80% reduction in resource prep time
- **Key Features**:
  - Centralized file storage with tagging
  - Automatic material list generation
  - Bulk download for weekly resources
  - Integration with activity planning

#### 4.3 Progress Alert System

- **Intention**: Proactive curriculum pacing management
- **Success Criteria**: Zero missed unit deadlines and curriculum coverage gaps
- **Key Features**:
  - Daily automated progress checks
  - Smart notifications (email + in-app)
  - Suggested corrective actions
  - Calendar integration for deadlines

#### 4.4 Newsletter Generator

- **Intention**: Automate parent communication from activity data
- **Success Criteria**: 90% reduction in newsletter creation time
- **Key Features**:
  - Template system with smart placeholders
  - Photo integration from resources
  - Multiple export formats
  - LLM enhancement for engaging content

#### 4.5 Emergency Sub Plans

- **Intention**: Always-ready substitute teacher documentation
- **Success Criteria**: Sub plans available within 2 minutes
- **Key Features**:
  - Real-time plan generation from current activities
  - Student roster with accommodation notes
  - Classroom procedures and schedules
  - 3-day lookahead for extended absences

### Phase 5: Curriculum Intelligence (FUTURE)

**Goal**: AI-powered curriculum mapping from official standards

#### 5.1 Curriculum Import Wizard

- **Intention**: Eliminate manual curriculum setup
- **Success Criteria**: Full grade curriculum imported in <2 minutes
- **Key Features**:
  - PDF parsing of official PEI curriculum documents
  - AI clustering of learning expectations into thematic units
  - Intelligent activity suggestions for each outcome
  - Customizable pacing based on school calendar

#### 5.2 Standards Compliance Tracking

- **Intention**: Guarantee 100% curriculum coverage
- **Success Criteria**: Real-time compliance dashboard
- **Key Features**:
  - Automatic mapping of activities to standards
  - Gap analysis and recommendations
  - Provincial reporting integration
  - Evidence collection for assessments

## 🔧 Technical Standards & Conventions

### Code Quality Requirements

- **TypeScript**: Strict mode, explicit types, zero `any` usage
- **Test Coverage**: Minimum 85% for new features
- **Performance**: <2 second load times for all pages
- **Accessibility**: WCAG AA compliance
- **Security**: Input validation, SQL injection prevention

### Architecture Patterns

1. **Backend**: RESTful API with Express/Fastify
2. **Database**: PostgreSQL in production, SQLite for development
3. **Frontend**: React with TypeScript, TanStack Query
4. **Styling**: Tailwind CSS utility classes only
5. **Testing**: Jest/Vitest unit tests, Playwright E2E tests

### File Organization Principles

```
/server/src/
  /routes/          # API endpoints grouped by feature
  /services/        # Business logic and external integrations
  /models/          # Database models and types
  /utils/           # Shared utilities and helpers
  /tests/           # Unit and integration tests

/client/src/
  /components/      # Reusable UI components
  /pages/           # Top-level route components
  /hooks/           # Custom React hooks
  /types/           # TypeScript type definitions
  /utils/           # Frontend utilities
```

## 🤖 Agent Development Guidelines

### For AI Coding Agents Working on This Project

#### Core Principles

1. **Teacher-First Thinking**: Every decision should make teachers' lives easier
2. **Data Integrity**: Never compromise on data accuracy or loss prevention
3. **Performance Awareness**: Teachers work on older hardware with slower internet
4. **Accessibility**: Many teachers have varying technical abilities

#### Implementation Standards

1. **Always Write Tests First**: TDD approach prevents regressions
2. **Follow Existing Patterns**: Study current code before adding new patterns
3. **Document Decisions**: Update this file with architectural choices
4. **Validate with Real Data**: Use realistic teacher scenarios for testing

#### Quality Gates

- [ ] All tests pass (`pnpm test`)
- [ ] TypeScript compiles without errors (`pnpm build`)
- [ ] Linting passes (`pnpm lint`)
- [ ] E2E tests cover new user workflows
- [ ] Performance impact measured and documented
- [ ] Accessibility tested with screen reader

#### Communication Requirements

- Update agent logs (`AGENT-[NAME]-LOG.md`) with progress
- Create detailed commit messages following conventional commits
- Document any deviations from this guide with rationale
- Flag any unclear requirements for human review

### Agent Coordination

Multiple agents may work on this project simultaneously. To prevent conflicts:

1. **Claim Features**: Update AGENTS-TODO.md when starting work
2. **Communicate Changes**: Log database schema changes immediately
3. **Share Learning**: Document patterns that other agents should follow
4. **Merge Carefully**: Always pull latest before pushing changes

## 📊 Success Metrics

### User Experience Metrics

- **Planning Time Reduction**: Target 70% decrease (10 hours → 3 hours weekly)
- **User Adoption**: 90% feature utilization within 30 days
- **Error Rate**: <1% of user actions result in errors
- **Support Tickets**: <2 tickets per teacher per month

### Technical Metrics

- **Page Load Speed**: <2 seconds for all pages
- **API Response Time**: <500ms for CRUD operations
- **Uptime**: 99.9% availability target
- **Test Coverage**: >90% code coverage maintained

### Educational Impact Metrics

- **Curriculum Coverage**: 100% of required outcomes addressed
- **Milestone Completion**: 95% on-time completion rate
- **Parent Engagement**: 40% increase in newsletter readership
- **Teacher Satisfaction**: >4.5/5 in quarterly surveys

## 🛡️ Security & Privacy Considerations

### Data Protection

- **Student Privacy**: FERPA compliance required
- **Teacher Data**: Encrypted at rest and in transit
- **File Storage**: Secure upload with virus scanning
- **Access Control**: Role-based permissions system

### Compliance Requirements

- **Provincial Standards**: Align with PEI Education regulations
- **Accessibility**: AODA/ADA compliance for public education
- **Data Retention**: Follow school board policies
- **Audit Trail**: Log all data modifications

## 🌟 Vision Statement

Teaching Engine 2.0 will become the indispensable tool that every elementary teacher relies on daily. When complete, teachers will be able to:

- Plan an entire week of lessons in 30 minutes
- Never miss a curriculum requirement
- Communicate effectively with parents automatically
- Always be prepared for unexpected absences
- Focus on teaching instead of administrative tasks

**Success looks like**: A teacher saying "I can't imagine teaching without Teaching Engine 2.0" and meaning it from their heart.

---

_This document serves as the north star for all development decisions. When in doubt, choose the path that best serves elementary teachers and their students._
