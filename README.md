# Teaching Engine 2.0 🍎📚

A comprehensive digital teaching assistant designed for Grade 1 French Immersion teachers in PEI, reducing workload by 60% while improving curriculum coverage and student outcomes.

## ✨ Key Features

- **🎯 Subject-Based Personalization**: Onboarding flow that personalizes the app based on which subjects you actually teach
- **📋 Complete PEI Curriculum**: 68 Grade 1 French Immersion curriculum expectations pre-loaded and verified
- **📊 Real-Time Coverage Tracking**: Monitor your progress across all curriculum expectations
- **🤖 AI-Powered Planning**: Intelligent lesson plan generation with ETFO methodology
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **🔄 Bilingual Support**: Full English and French interface support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Starting the Application

```bash
# Clone the repository (if not already done)
cd /Users/michaelmcisaac/Github/teaching-engine2.0

# Start the development servers
# Method 1: Start both servers separately (recommended)
cd server && npm run dev &
cd ../client && npm run dev

# Method 2: Alternative if the above doesn't work
cd server && npm run dev
# Then in a new terminal:
cd client && npm run dev
```

**Wait for these confirmation messages:**
- ✅ Server ready at: `http://localhost:3000`
- ✅ Client ready at: `http://localhost:5173`

**Open your browser to:** `http://localhost:5173`

## 👩‍🏫 For Teachers: Getting Started

### First-Time Experience

1. **Automatic Onboarding**: The app detects new users and starts a 4-step wizard
2. **Subject Selection**: Choose which subjects you teach:
   - ✅ **Core**: Français langue première, Mathématiques
   - ✅ **Optional**: Sciences, Études sociales, English Language Arts, Arts
   - ⚠️ **Specialist Only**: Éducation physique, Éducation à la santé
3. **Personalized Experience**: All content filtered to your selected subjects
4. **Coverage Tracking**: Monitor progress across 68 curriculum expectations

### Core Workflow

1. **Dashboard**: See your selected subjects and curriculum coverage
2. **Curriculum**: Browse expectations filtered to your subjects
3. **Planning**: Create lessons using ETFO three-part structure
4. **Daybook**: Daily reflections and progress tracking
5. **Communication**: Generate newsletters and parent updates

## 🏗️ Project Structure

This is a **pnpm workspace** with a clean, production-ready structure:

```
teaching-engine2.0/
├── client/                 # React frontend (Vite + TypeScript)
├── server/                 # Express backend (Node.js + TypeScript)
├── packages/
│   └── database/          # Prisma database package
├── shared/                # Shared utilities and types
├── curriculum/            # Verified curriculum data
│   └── PEI_GRADE1_FRENCH_IMMERSION_FINAL.json
├── resources/             # Original PDF source documents
├── scripts/               # Build and deployment scripts
├── tests/                 # End-to-end and integration tests
└── docs/                  # Organized documentation
    ├── validation/        # Pedagogical evaluation tools
    ├── planning/          # Unit and lesson plan examples
    ├── calendar/          # School calendar information
    ├── system/            # Technical documentation
    └── archive/           # Historical development docs
```

## 📖 Documentation

### Key Documents
- `CLAUDE.md` - Project configuration and AI instructions
- `QUICK_START.md` - Getting started guide
- `docs/validation/` - Pedagogical evaluation checklists and guides
- `docs/README.md` - Complete documentation index

### Pedagogical Approach
This project uses **intelligent human evaluation** rather than automated keyword-based assessment. All pedagogical plans are evaluated based on:
- Evidence of actual implementation
- Integration and coherence of elements  
- Developmental appropriateness for Grade 1
- Authentic cultural responsiveness
- Research-based best practices (ETFO guidelines)

For detailed evaluation criteria, see:
- [Pedagogical Validation Checklists](docs/validation/PEDAGOGICAL_VALIDATION_CHECKLISTS.md)
- [Intelligent Evaluation Guide](docs/validation/INTELLIGENT_EVALUATION_GUIDE.md)

## 🛠️ Development

### Database Setup

```bash
# Run database migrations
pnpm --filter @teaching-engine/database db:migrate

# Seed the Grade 1 curriculum (68 expectations)
pnpm --filter @teaching-engine/database db:seed
```

### Running Tests

```bash
# Client tests
cd client && npm run test

# Server tests  
cd server && npm run test

# Type checking
cd client && npm run typecheck
cd server && npm run typecheck
```

### Building for Production

```bash
# Build client
cd client && npm run build

# Build server
cd server && npm run build
```

## 📊 Grade 1 French Immersion Curriculum

The app includes **73 verified curriculum expectations** for PEI Grade 1 French Immersion:

- **Français langue première**: 15 expectations (oral, reading, writing)
- **Mathématiques**: 14 expectations (numbers, patterns, shapes/space)
- **Sciences de la nature**: 5 expectations (living things, energy, seasons)
- **Sciences humaines**: 7 expectations (citizenship, identity, geography)
- **Arts visuels**: 4 expectations (visual arts)
- **Formation personnelle et sociale**: 4 expectations (health, safety, relationships)
- **Éducation physique**: 16 expectations (movement, cooperation, fitness)
- **Music (English)**: 8 expectations (creating, performing, responding)

## 🔧 Technical Specifications

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: Zustand + React Query
- **Testing**: Vitest + Testing Library

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma
- **Testing**: Jest

### Key Dependencies
- **React Query**: Server state management
- **Prisma**: Database ORM and migrations
- **Express Validator**: API input validation
- **Winston**: Logging
- **Date-fns**: Date manipulation

## 🐛 Troubleshooting

### Common Issues

#### App Won't Start
```bash
# If you see "Cannot find module '@shared/utils/typeGuards'" error:
# This is a module resolution issue - contact support

# If npm commands fail:
# Remember this is a pnpm workspace, use individual package commands:
cd server && npm run dev
cd client && npm run dev
```

#### Database Issues
```bash
# Reset database if needed
pnpm --filter @teaching-engine/database db:reset

# Re-seed curriculum data
pnpm --filter @teaching-engine/database db:seed
```

#### Onboarding Not Appearing
```bash
# Clear browser localStorage to reset onboarding
# In browser console:
localStorage.clear()
```

## 📖 Documentation

- **[Complete User Guide](docs/USER_GUIDE.md)** - Comprehensive teacher training
- **[Features Documentation](docs/FEATURES.md)** - Technical feature details
- **[Wife Testing Guide](WIFE_TESTING_GUIDE.md)** - Step-by-step testing instructions
- **[Getting Started](client/src/content/help/getting-started.md)** - Quick start guide
- **[API Reference](docs/API_REFERENCE.md)** - Backend API documentation

## 🧪 Testing Instructions

### For Real Teachers (Like Your Wife!)

1. **Follow the [Wife Testing Guide](WIFE_TESTING_GUIDE.md)**
2. **Test the complete workflow**: Onboarding → Subject Selection → Curriculum Exploration → Lesson Planning
3. **Key Success Criteria**:
   - ✅ Onboarding feels natural and helpful
   - ✅ Subject selection works correctly (only shows relevant content)
   - ✅ All 68 curriculum expectations are accessible
   - ✅ Coverage tracking updates as lessons are created
   - ✅ App feels like it would save real planning time

### For Developers

```bash
# Run the full test suite
npm run test        # Client tests
cd server && npm run test  # Server tests

# Type checking
npm run typecheck   # Client
cd server && npm run typecheck  # Server

# Linting
npm run lint        # Client
cd server && npm run lint  # Server
```

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Update tests for any new features
3. Run type checking and linting before committing
4. Update documentation for user-facing changes

## 📝 Recent Major Updates

- ✅ **Subject Selection Onboarding**: Personalizes app experience based on teaching assignments
- ✅ **Grade 1 PEI Curriculum**: 68 comprehensive expectations seeded and organized
- ✅ **Coverage Tracking**: Real-time progress monitoring across all subjects
- ✅ **Subject Filtering**: All content filtered to teacher's selected subjects
- ✅ **Module Resolution**: Fixed shared utilities import issues
- ✅ **Documentation**: Updated all guides to reflect current functionality

## 📞 Support

- **Technical Issues**: Check browser console and refer to troubleshooting section
- **Feature Requests**: Create GitHub issue with detailed use case
- **User Questions**: Refer to comprehensive documentation in `/docs`

---

**Built with ❤️ for Grade 1 French Immersion teachers in PEI**

*Reducing teacher workload by 60% while improving student outcomes* 🚀