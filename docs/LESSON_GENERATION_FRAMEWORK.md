# Lesson Generation Framework for Grade 1 French Immersion

## Overview

The Lesson Generation Framework is an intelligent system designed to automatically create contextually appropriate, pedagogically sound lesson plans for Emily McIsaac's Grade 1 French Immersion classroom at West Kent Elementary, PEI. The framework generates lessons that follow ETFO (Elementary Teachers' Federation of Ontario) best practices and align perfectly with existing unit plans and curriculum expectations.

## Key Features

### 🎯 **ETFO-Aligned Structure**
- **Three-Part Lesson Format**: Every lesson follows the proven ETFO structure
  - **Minds On** (15 minutes): Activates prior knowledge and engages students
  - **Action** (25 minutes): Main learning activity with hands-on exploration
  - **Consolidation** (10 minutes): Reflection and sharing of learning

### 🇫🇷 **French Immersion Excellence**
- **Bilingual Content**: French Immersion lessons include both English and French content
- **Age-Appropriate Language**: Content suitable for 6-7 year old learners
- **Cultural Integration**: Incorporates francophone perspectives and traditions
- **Language Development**: Focuses on oral communication, reading, and writing skills

### 📚 **Subject Integration**
The framework generates lessons for all Grade 1 subjects:
- **Français (Immersion)**: 8 units with authentic French language learning
- **Mathématiques**: 8 units with hands-on mathematics exploration
- **Sciences de la nature**: 7 units with inquiry-based science discovery
- **Sciences humaines**: 5 units focusing on community and identity
- **Arts visuels**: 6 units with creative expression and art techniques
- **Formation personnelle et sociale**: 6 units for social-emotional learning

### 🎨 **Contextual Intelligence**
- **Unit Theme Alignment**: Each lesson is perfectly aligned with its unit's big ideas and essential questions
- **Progressive Learning**: Lessons build upon each other throughout the unit
- **Realistic Timing**: Lessons are scheduled appropriately within unit timeframes
- **Unique Titles**: Every lesson has a unique, descriptive title across the entire system

### 🔧 **Pedagogical Excellence**
- **Differentiation Built-In**: Accommodations for diverse learners included
- **Assessment Integration**: Appropriate formative, diagnostic, and summative assessments
- **Material Planning**: Realistic, accessible materials for each lesson
- **Substitute-Friendly**: Clear instructions and organized materials for substitute teachers

## Technical Architecture

### Core Components

#### `LessonGenerationFramework.ts`
The main service class that orchestrates lesson generation:
- Connects to database and validates user permissions
- Analyzes unit contexts and generates appropriate lesson counts
- Creates lessons using subject-specific templates and activities
- Ensures unique titles and proper curriculum expectation mapping

#### `generate-all-lessons.ts`
Command-line script for generating all lessons:
- Provides comprehensive logging and progress tracking
- Includes error handling and graceful recovery
- Displays detailed statistics upon completion

#### `lesson-generation.ts` (API Routes)
REST API endpoints for web-based lesson generation:
- `/api/lesson-generation/generate-all` - Generate lessons for all units
- `/api/lesson-generation/status` - Check framework status
- `/api/lesson-generation/generate-unit/:unitId` - Generate lessons for specific unit

## Usage Instructions

### Prerequisites

1. **Emily's Account Setup**: Ensure Emily McIsaac's user account exists (`emmcisaac@gmail.com`)
2. **Unit Plans**: All unit plans must be seeded and properly configured
3. **Curriculum Expectations**: Curriculum expectations must be linked to unit plans
4. **Database Access**: Proper database connectivity and permissions

### Method 1: Command Line (Recommended)

```bash
# From the scripts directory
cd scripts
npm run generate-lessons

# Alternative using tsx directly
tsx scripts/generate-all-lessons.ts
```

**Benefits:**
- Comprehensive logging and progress tracking
- Detailed error reporting and troubleshooting guidance
- Statistics breakdown by subject
- Graceful handling of interruptions

### Method 2: API Endpoints

```bash
# Generate all lessons via API
POST /api/lesson-generation/generate-all
Authorization: Bearer <emily_auth_token>

# Check framework status
GET /api/lesson-generation/status
Authorization: Bearer <emily_auth_token>

# Generate lessons for specific unit
POST /api/lesson-generation/generate-unit/:unitId
Authorization: Bearer <emily_auth_token>
```

**Benefits:**
- Integration with web dashboard
- Real-time progress updates
- User-friendly error messages
- Selective unit generation

### Method 3: Direct Service Usage

```typescript
import { PrismaClient } from '@prisma/client';
import { LessonGenerationFramework } from '../server/src/services/LessonGenerationFramework';

const prisma = new PrismaClient();
const framework = new LessonGenerationFramework(prisma);

// Generate all lessons
await framework.generateAllLessons();

// Health check
const status = await framework.checkHealth();
console.log(status);
```

## Generated Lesson Structure

### Sample Lesson Output

Each generated lesson includes:

```typescript
{
  title: "Exploring Family Vocabulary Through Stories",
  titleFr: "Leçon 3: Découvrir famille et moi",
  duration: 60, // minutes
  grade: 1,
  language: "fr", // French Immersion
  subject: "Français (Immersion)",
  
  // ETFO Three-Part Structure
  mindsOn: "Welcome circle: Introduce today's learning about...",
  mindsOnFr: "Cercle de bienvenue : Introduire l'apprentissage...",
  action: "Interactive read-aloud with family vocabulary focus...",
  actionFr: "Lecture interactive à voix haute avec focus sur...",
  consolidation: "Partner share: Turn and talk about...",
  consolidationFr: "Partage avec partenaire : Tournez et parlez...",
  
  // Learning and Assessment
  learningGoals: "Students will use family vocabulary to communicate...",
  learningGoalsFr: "Les élèves utiliseront le vocabulaire familial...",
  assessmentType: "formative",
  assessmentNotes: "Monitor student use of family vocabulary...",
  
  // Resources and Support
  materials: ["French picture books", "family photo cards", "chart paper"],
  accommodations: ["Visual supports", "Partner support", "Extra processing time"],
  grouping: "pairs",
  
  // Substitute Teacher Support
  isSubFriendly: true,
  subNotes: "All materials organized and labeled. Lesson follows...",
  
  // Curriculum Integration
  expectations: ["linked_expectation_ids"],
  unitPlanId: "unit_plan_id",
  date: "2025-10-15"
}
```

## Subject-Specific Features

### 🇫🇷 Français (Immersion)
- **Bilingual content** in all sections
- **Phonological awareness** activities
- **Authentic French materials** and resources
- **Oral communication** emphasis
- **Cultural connections** to francophone communities

### 🔢 Mathématiques
- **Hands-on manipulatives** in every lesson
- **Real-world problem solving** scenarios
- **Number sense development** through play
- **Mathematical thinking** and communication
- **Visual and concrete representations**

### 🔬 Sciences de la nature
- **Inquiry-based learning** approach
- **Observation and recording** skills
- **Hands-on investigations** with everyday materials
- **Scientific vocabulary** development
- **Environmental connections** to PEI

### 🏘️ Sciences humaines
- **Community helper focus** with local connections
- **Family and cultural diversity** respect
- **Map skills** and spatial awareness
- **Social skill development** through cooperation
- **PEI community integration**

### 🎨 Arts visuels
- **Multi-media exploration** with various materials
- **Technique development** appropriate for Grade 1
- **Creative expression** and artistic vocabulary
- **Art appreciation** and cultural connections
- **Process-focused learning** over product

### 🤝 Formation personnelle et sociale
- **Social-emotional learning** integrated throughout
- **Conflict resolution** and problem-solving skills
- **Friendship and empathy** development
- **Self-regulation strategies** and mindfulness
- **Community building** and collaboration

## Quality Assurance

### Automated Validation
- **Unique Titles**: System tracks and prevents duplicate lesson titles
- **Date Validation**: Lessons scheduled within unit timeframes only
- **Subject Integrity**: French lessons stay in French, Math in Math, etc.
- **Grade Appropriateness**: Content validated for 6-7 year old learners
- **ETFO Compliance**: Three-part structure enforced

### Pedagogical Standards
- **Curriculum Alignment**: Every lesson links to specific expectations
- **Differentiation**: Accommodations included for diverse learners
- **Assessment Integration**: Appropriate assessment types and notes
- **Material Realism**: Accessible, common classroom materials
- **Time Management**: Realistic activity timing and transitions

### Content Quality
- **Age-Appropriate Language**: Vocabulary and concepts suitable for Grade 1
- **Cultural Sensitivity**: Inclusive and respectful content
- **Safety Considerations**: Age-appropriate materials and activities
- **Accessibility**: Multiple ways to access and demonstrate learning
- **Engagement**: Active, hands-on learning experiences

## Troubleshooting

### Common Issues

#### Framework Health Check Fails
```bash
Error: Emily's user account not found
```
**Solution**: Ensure main database seed has been run with Emily's account

#### Unit Plans Missing
```bash
Error: No unit plans found for Emily
```
**Solution**: Run unit plan seeding scripts for all subjects

#### Curriculum Expectations Not Linked
```bash
Warning: Some units have no curriculum expectations
```
**Solution**: Verify curriculum expectation seeding and unit linking

#### Database Connection Issues
```bash
Error: Database connection failed
```
**Solution**: Check DATABASE_URL environment variable and database accessibility

### Recovery Procedures

#### Partial Generation Failure
If generation fails partway through:
1. Check logs for specific unit or subject that failed
2. Run framework health check to assess current state
3. Re-run generation (framework skips existing lessons)
4. Use unit-specific generation for problematic units

#### Duplicate Title Detection
If duplicate titles are created:
1. System automatically appends numbers to ensure uniqueness
2. Review and manually update titles as needed
3. Future generations will respect existing titles

#### Performance Issues
For large lesson generation tasks:
1. Monitor system resources during generation
2. Consider generating by subject or smaller batches
3. Use API endpoints for web-based progress tracking

## Integration with Teaching Engine

### Dashboard Integration
- Lessons appear automatically in Emily's lesson plan dashboard
- Calendar view shows lessons scheduled within unit timeframes
- Search and filter functionality works with generated lessons
- Edit and customize generated lessons as needed

### Assessment Tracking
- Generated lessons link to curriculum expectations
- Daybook entries can be created for each lesson after teaching
- Progress tracking shows curriculum coverage
- Assessment data collection through normal workflows

### Resource Planning
- Material lists inform resource ordering and preparation
- Accommodation notes support IEP and differentiation planning
- Substitute teacher notes ensure continuity of learning
- Calendar integration helps with weekly and monthly planning

## Future Enhancements

### Planned Features
- **AI Content Enhancement**: Integration with OpenAI for more dynamic content
- **Learning Style Adaptation**: Lessons adapted for different learning preferences
- **Seasonal Integration**: Automatic seasonal and cultural event integration
- **Parent Communication**: Generated newsletter content about upcoming lessons
- **Professional Development**: Lesson analysis and teaching tip integration

### Customization Options
- **Teacher Preferences**: Adaptable templates based on teaching style
- **School Requirements**: Integration with school-specific policies
- **Assessment Preferences**: Customizable assessment types and frequencies
- **Material Constraints**: Adaptation based on available resources
- **Time Flexibility**: Adjustable lesson durations and structures

## Support and Maintenance

### Documentation
- **API Documentation**: Complete REST API reference
- **Database Schema**: Lesson plan and related table documentation
- **Code Comments**: Comprehensive inline documentation
- **User Guides**: Step-by-step usage instructions

### Monitoring
- **Health Checks**: Automated framework status monitoring
- **Performance Metrics**: Generation time and success rate tracking
- **Error Logging**: Comprehensive error capture and reporting
- **Usage Analytics**: Lesson generation and usage statistics

### Updates
- **Curriculum Changes**: Framework adapts to curriculum updates
- **Pedagogical Best Practices**: Integration of new research and methods
- **Technical Improvements**: Performance and reliability enhancements
- **User Feedback**: Continuous improvement based on Emily's experience

---

**Created for Emily McIsaac's Grade 1 French Immersion Classroom**  
*West Kent Elementary School, Prince Edward Island*  
*Academic Year 2025-2026*

For technical support or questions about the Lesson Generation Framework, please refer to the system documentation or contact the development team.