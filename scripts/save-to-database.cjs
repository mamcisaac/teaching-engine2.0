/**
 * Save to Database
 * Stores validated lessons in the database
 */

const { PrismaClient } = require('@prisma/client');

class LessonDatabaseSaver {
  constructor(options = {}) {
    this.options = {
      batchSize: 20,
      verbose: true,
      dryRun: false,
      ...options
    };
    
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:../packages/database/dev.db'
        }
      }
    });
    
    this.saveResults = {
      totalSaved: 0,
      totalSkipped: 0,
      errors: [],
      savedUnits: []
    };
  }

  /**
   * Save all lessons from generation results
   */
  async saveAllLessons(generationResults) {
    console.log('\n💾 Starting database save process...');
    
    if (this.options.dryRun) {
      console.log('🔍 DRY RUN MODE - No actual database changes will be made');
    }
    
    try {
      for (const unitResult of generationResults.successful) {
        await this.saveUnitLessons(unitResult);
      }
      
      await this.generateSaveReport();
      return this.saveResults;
      
    } catch (error) {
      console.error('❌ Fatal error during save:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Save lessons for a single unit
   */
  async saveUnitLessons(unitResult) {
    const { unitId, unitTitle, lessons } = unitResult;
    
    console.log(`\n📁 Saving ${lessons.length} lessons for: ${unitTitle}`);
    
    // Check for existing lessons to avoid duplicates
    const existingLessons = await this.checkExistingLessons(unitId);
    
    if (existingLessons.length > 0) {
      console.log(`  ⚠️  Found ${existingLessons.length} existing lessons`);
      
      if (this.options.overwrite) {
        console.log('  🗑️  Removing existing lessons...');
        if (!this.options.dryRun) {
          await this.deleteExistingLessons(unitId);
        }
      } else {
        console.log('  ⏭️  Skipping unit (use --overwrite to replace)');
        this.saveResults.totalSkipped += lessons.length;
        return;
      }
    }
    
    // Save lessons in batches
    const batches = this.createBatches(lessons, this.options.batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`  📦 Saving batch ${i + 1}/${batches.length} (${batch.length} lessons)`);
      
      if (!this.options.dryRun) {
        await this.saveLessonBatch(batch, unitId);
      }
      
      this.saveResults.totalSaved += batch.length;
    }
    
    this.saveResults.savedUnits.push({
      unitId: unitId,
      unitTitle: unitTitle,
      lessonCount: lessons.length
    });
    
    console.log(`  ✅ ${lessons.length} lessons saved successfully`);
  }

  /**
   * Check for existing lessons
   */
  async checkExistingLessons(unitPlanId) {
    return await this.prisma.eTFOLessonPlan.findMany({
      where: { unitPlanId: unitPlanId },
      select: { id: true, title: true }
    });
  }

  /**
   * Delete existing lessons
   */
  async deleteExistingLessons(unitPlanId) {
    return await this.prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: unitPlanId }
    });
  }

  /**
   * Save a batch of lessons
   */
  async saveLessonBatch(lessons, unitPlanId) {
    const lessonData = lessons.map(lesson => this.prepareLessonData(lesson, unitPlanId));
    
    try {
      // Use createMany for efficiency
      await this.prisma.eTFOLessonPlan.createMany({
        data: lessonData,
        skipDuplicates: true
      });
    } catch (error) {
      console.error(`  ❌ Error saving batch:`, error.message);
      this.saveResults.errors.push({
        unitId: unitPlanId,
        error: error.message,
        lessons: lessons.map(l => l.title)
      });
      throw error;
    }
  }

  /**
   * Prepare lesson data for database insertion
   */
  prepareLessonData(lesson, unitPlanId) {
    // Calculate proper date
    const lessonDate = lesson.date || new Date();
    
    // Prepare materials (handle both array and string)
    let materials = lesson.materials;
    if (Array.isArray(materials)) {
      materials = JSON.stringify(materials);
    } else if (typeof materials === 'object') {
      materials = JSON.stringify(materials);
    }
    
    // Prepare accommodations and modifications
    const accommodations = this.prepareJsonField(lesson.differentiation?.forIEP);
    const modifications = this.prepareJsonField(lesson.differentiation?.forStruggling);
    
    // Prepare three-part lesson content
    const mindsOnContent = this.prepareActivityContent(lesson.mindsOn);
    const actionContent = this.prepareActivityContent(lesson.action);
    const consolidationContent = this.prepareActivityContent(lesson.consolidation);
    
    // Prepare success criteria
    const successCriteria = this.prepareJsonField(lesson.successCriteria);
    
    // Prepare assessment
    const assessmentStrategies = this.prepareAssessmentStrategies(lesson);
    
    return {
      // Required fields
      userId: lesson.userId || 1, // Default to Emily's user ID
      title: lesson.title || `Lesson ${lesson.lessonNumber}`,
      unitPlanId: unitPlanId,
      date: lessonDate,
      duration: 45, // Always 45 minutes for ETFO
      
      // Three-part lesson structure
      mindsOn: mindsOnContent,
      action: actionContent,
      consolidation: consolidationContent,
      
      // French content
      titleFr: lesson.titleFr || lesson.title,
      mindsOnFr: lesson.mindsOnFr || mindsOnContent,
      actionFr: lesson.actionFr || actionContent,
      consolidationFr: lesson.consolidationFr || consolidationContent,
      
      // Learning goals and criteria
      learningGoals: lesson.learningGoals || '',
      learningGoalsFr: lesson.learningGoalsFr || lesson.learningGoals || '',
      successCriteria: successCriteria,
      
      // Materials and grouping
      materials: materials,
      grouping: lesson.grouping || 'Mixed (whole class, partners, small groups)',
      
      // Differentiation
      accommodations: accommodations,
      modifications: modifications,
      
      // Assessment
      assessmentStrategies: assessmentStrategies,
      
      // Vocabulary
      vocabulary: this.prepareJsonField(lesson.vocabulary),
      
      // Safety
      safetyConsiderations: lesson.safety || null,
      
      // Additional fields
      indigenousConnections: lesson.indigenousConnections || null,
      crossCurricularLinks: lesson.crossCurricularLinks || null,
      lessonNumber: lesson.lessonNumber || 1,
      
      // Metadata
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Prepare activity content as string
   */
  prepareActivityContent(activity) {
    if (!activity) return '';
    
    if (typeof activity === 'string') return activity;
    
    let content = '';
    
    if (activity.description) {
      content = activity.description;
    }
    
    if (activity.activities && Array.isArray(activity.activities)) {
      const activityDescriptions = activity.activities.map((act, i) => {
        return `${i + 1}. ${act.name || 'Activity'} (${act.duration || '?'} min): ${act.description || ''}`;
      });
      content = activityDescriptions.join('\n');
    }
    
    if (activity.materials && Array.isArray(activity.materials)) {
      content += `\nMaterials: ${activity.materials.join(', ')}`;
    }
    
    if (activity.grouping) {
      content += `\nGrouping: ${activity.grouping}`;
    }
    
    return content;
  }

  /**
   * Prepare assessment strategies
   */
  prepareAssessmentStrategies(lesson) {
    const strategies = [];
    
    // From consolidation
    if (lesson.consolidation?.assessmentStrategy) {
      strategies.push(lesson.consolidation.assessmentStrategy);
    }
    
    // From assessment field
    if (lesson.assessmentStrategies) {
      if (Array.isArray(lesson.assessmentStrategies)) {
        strategies.push(...lesson.assessmentStrategies);
      } else {
        strategies.push(lesson.assessmentStrategies);
      }
    }
    
    // Default if none provided
    if (strategies.length === 0) {
      strategies.push('Observation', 'Conversation', 'Student products');
    }
    
    return JSON.stringify(strategies);
  }

  /**
   * Prepare JSON field
   */
  prepareJsonField(field) {
    if (!field) return null;
    if (typeof field === 'string') return field;
    return JSON.stringify(field);
  }

  /**
   * Create batches
   */
  createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Generate save report
   */
  async generateSaveReport() {
    console.log('\n' + '=' .repeat(60));
    console.log('💾 DATABASE SAVE REPORT');
    console.log('=' .repeat(60));
    console.log(`✅ Total Saved: ${this.saveResults.totalSaved} lessons`);
    console.log(`⏭️  Total Skipped: ${this.saveResults.totalSkipped} lessons`);
    console.log(`📚 Units Saved: ${this.saveResults.savedUnits.length}`);
    
    if (this.saveResults.errors.length > 0) {
      console.log(`\n❌ Errors: ${this.saveResults.errors.length}`);
      this.saveResults.errors.forEach(error => {
        console.log(`  - ${error.unitId}: ${error.error}`);
      });
    }
    
    if (this.options.dryRun) {
      console.log('\n🔍 DRY RUN - No actual changes were made');
    }
    
    console.log('=' .repeat(60));
    
    // Verify in database
    if (!this.options.dryRun && this.saveResults.totalSaved > 0) {
      const totalInDb = await this.prisma.eTFOLessonPlan.count();
      console.log(`\n📊 Total lessons now in database: ${totalInDb}`);
    }
  }
}

// Export for use
module.exports = { LessonDatabaseSaver };

// Test if run directly
if (require.main === module) {
  const saver = new LessonDatabaseSaver({
    dryRun: true,
    verbose: true
  });
  
  // Create sample data
  const sampleResults = {
    successful: [
      {
        unitId: 'test-unit-123',
        unitTitle: 'Sample Unit',
        lessons: [
          {
            lessonNumber: 1,
            title: 'Introduction Lesson',
            learningGoals: 'Students will learn basics',
            successCriteria: ['Can do task 1', 'Can do task 2'],
            vocabulary: ['word1', 'word2'],
            mindsOn: {
              duration: 8,
              description: 'Opening activity'
            },
            action: {
              duration: 27,
              activities: [
                { name: 'Main activity', duration: 27, description: 'Learning task' }
              ]
            },
            consolidation: {
              duration: 10,
              description: 'Closing reflection',
              assessmentStrategy: 'Observation'
            },
            differentiation: {
              forStruggling: ['Extra support'],
              forIEP: ['Modified task'],
              forELL: ['Visual aids'],
              forAdvanced: ['Extension work']
            },
            materials: ['paper', 'pencils'],
            safety: 'N/A'
          }
        ]
      }
    ]
  };
  
  saver.saveAllLessons(sampleResults)
    .then(results => {
      console.log('\n✅ Test save complete (dry run)');
    })
    .catch(error => {
      console.error('\n❌ Test save failed:', error);
    });
}