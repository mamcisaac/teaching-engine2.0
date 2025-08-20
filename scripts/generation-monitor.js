/**
 * Generation Monitor
 * Oversees the entire generation process for all units
 */

const { AgenticLessonGenerator } = require('./agentic-lesson-generator.js');
const { PrismaClient } = require('@teaching-engine/database');
const fs = require('fs');
const path = require('path');

class GenerationMonitor {
  constructor(options = {}) {
    this.options = {
      maxConcurrent: 1, // Sequential by default for Claude conversation
      retryFailures: true,
      saveProgress: true,
      progressFile: 'generation-progress.json',
      ...options
    };
    
    this.progress = this.loadProgress();
    this.results = {
      successful: [],
      needsRevision: [],
      failed: [],
      skipped: []
    };
  }

  /**
   * Generate lessons for all units
   */
  async generateAllUnits() {
    console.log('🚀 Starting agentic generation for all units...\n');
    
    const units = await this.fetchAllUnits();
    console.log(`📚 Found ${units.length} units to process\n`);
    
    for (const unit of units) {
      // Skip if already processed successfully
      if (this.progress.completed.includes(unit.id)) {
        console.log(`⏭️  Skipping ${unit.title} (already completed)`);
        this.results.skipped.push(unit);
        continue;
      }
      
      await this.processUnit(unit);
      
      // Save progress after each unit
      if (this.options.saveProgress) {
        this.saveProgress();
      }
      
      // Brief pause between units
      await this.pause(5000);
    }
    
    return this.generateReport();
  }

  /**
   * Process a single unit
   */
  async processUnit(unit) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📖 Processing: ${unit.title}`);
    console.log(`   Subject: ${unit.longRangePlan.subject}`);
    console.log(`   Expectations: ${unit.expectations.map(e => e.expectation.code).join(', ')}`);
    console.log(`${'='.repeat(60)}\n`);
    
    try {
      const generator = new AgenticLessonGenerator(unit, {
        maxRetries: this.options.retryFailures ? 3 : 1
      });
      
      const result = await generator.generateUnitLessons();
      
      if (result.success) {
        console.log(`✅ Successfully generated ${result.lessonsGenerated} lessons`);
        this.results.successful.push({
          unit: unit.title,
          lessons: result.lessonsGenerated,
          conversationLength: result.conversation.length
        });
        this.progress.completed.push(unit.id);
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error(`❌ Failed to generate lessons: ${error.message}`);
      
      // Attempt recovery
      const recovered = await this.attemptRecovery(unit, error);
      
      if (recovered) {
        this.results.needsRevision.push({
          unit: unit.title,
          issue: error.message,
          recovery: recovered
        });
      } else {
        this.results.failed.push({
          unit: unit.title,
          error: error.message
        });
        this.progress.failed.push({
          unitId: unit.id,
          error: error.message,
          timestamp: new Date()
        });
      }
    }
  }

  /**
   * Attempt to recover from generation failure
   */
  async attemptRecovery(unit, error) {
    console.log('🔧 Attempting recovery...');
    
    // Different recovery strategies based on error type
    if (error.message.includes('timeout')) {
      return await this.recoverFromTimeout(unit);
    }
    
    if (error.message.includes('confusion')) {
      return await this.recoverFromConfusion(unit);
    }
    
    if (error.message.includes('incomplete')) {
      return await this.recoverFromIncomplete(unit);
    }
    
    return null;
  }

  /**
   * Recover from timeout by splitting generation
   */
  async recoverFromTimeout(unit) {
    console.log('⏱️  Timeout detected - trying smaller batches...');
    
    try {
      // Generate in smaller chunks
      const generator = new AgenticLessonGenerator(unit, {
        batchSize: 5 // Generate 5 lessons at a time
      });
      
      const lessons = [];
      const totalLessons = 20;
      
      for (let i = 0; i < totalLessons; i += 5) {
        const batch = await generator.generateLessonBatch(i + 1, Math.min(i + 5, totalLessons));
        lessons.push(...batch);
      }
      
      return {
        strategy: 'batched generation',
        lessons: lessons.length
      };
    } catch (error) {
      console.error('Batch recovery failed:', error.message);
      return null;
    }
  }

  /**
   * Recover from confusion with simpler prompts
   */
  async recoverFromConfusion(unit) {
    console.log('🤔 Confusion detected - simplifying prompts...');
    
    try {
      const generator = new AgenticLessonGenerator(unit, {
        simplifiedMode: true,
        skipOverview: true
      });
      
      const result = await generator.generateUnitLessons();
      
      if (result.success) {
        return {
          strategy: 'simplified prompts',
          lessons: result.lessonsGenerated
        };
      }
    } catch (error) {
      console.error('Simplified recovery failed:', error.message);
    }
    
    return null;
  }

  /**
   * Recover from incomplete generation
   */
  async recoverFromIncomplete(unit) {
    console.log('📝 Incomplete generation - filling gaps...');
    
    // Check what lessons were successfully generated
    const existingLessons = await this.checkExistingLessons(unit.id);
    
    if (existingLessons.length > 0) {
      console.log(`Found ${existingLessons.length} existing lessons`);
      
      // Generate only missing lessons
      const totalNeeded = 20;
      const missingNumbers = [];
      
      for (let i = 1; i <= totalNeeded; i++) {
        if (!existingLessons.find(l => l.lessonNumber === i)) {
          missingNumbers.push(i);
        }
      }
      
      if (missingNumbers.length > 0) {
        console.log(`Generating ${missingNumbers.length} missing lessons: ${missingNumbers.join(', ')}`);
        
        // Generate missing lessons
        const generator = new AgenticLessonGenerator(unit);
        const missingLessons = await generator.generateSpecificLessons(missingNumbers);
        
        return {
          strategy: 'gap filling',
          existing: existingLessons.length,
          generated: missingLessons.length
        };
      }
    }
    
    return null;
  }

  /**
   * Fetch all units from database
   */
  async fetchAllUnits() {
    const prisma = new PrismaClient();
    
    try {
      const units = await prisma.unitPlan.findMany({
        include: {
          longRangePlan: true,
          expectations: {
            include: {
              expectation: true
            }
          }
        },
        orderBy: [
          { longRangePlan: { subject: 'asc' } },
          { startDate: 'asc' }
        ]
      });
      
      return units;
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Check existing lessons for a unit
   */
  async checkExistingLessons(unitId) {
    const prisma = new PrismaClient();
    
    try {
      const lessons = await prisma.lessonPlan.findMany({
        where: { unitPlanId: unitId },
        select: { id: true, lessonNumber: true, title: true }
      });
      
      return lessons;
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Load progress from file
   */
  loadProgress() {
    const progressPath = path.join(__dirname, '..', this.options.progressFile);
    
    if (fs.existsSync(progressPath)) {
      try {
        const data = fs.readFileSync(progressPath, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        console.warn('Could not load progress file, starting fresh');
      }
    }
    
    return {
      completed: [],
      failed: [],
      lastUpdate: null
    };
  }

  /**
   * Save progress to file
   */
  saveProgress() {
    const progressPath = path.join(__dirname, '..', this.options.progressFile);
    
    this.progress.lastUpdate = new Date();
    
    fs.writeFileSync(
      progressPath,
      JSON.stringify(this.progress, null, 2)
    );
  }

  /**
   * Generate final report
   */
  generateReport() {
    const report = {
      summary: {
        total: this.results.successful.length + 
               this.results.needsRevision.length + 
               this.results.failed.length + 
               this.results.skipped.length,
        successful: this.results.successful.length,
        revised: this.results.needsRevision.length,
        failed: this.results.failed.length,
        skipped: this.results.skipped.length
      },
      details: this.results,
      timestamp: new Date()
    };
    
    // Save report
    const reportPath = path.join(__dirname, '..', 'generation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 GENERATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${report.summary.successful} units`);
    console.log(`🔧 Revised: ${report.summary.revised} units`);
    console.log(`❌ Failed: ${report.summary.failed} units`);
    console.log(`⏭️  Skipped: ${report.summary.skipped} units`);
    console.log('='.repeat(60));
    console.log(`📄 Full report saved to: generation-report.json`);
    
    return report;
  }

  /**
   * Utility: pause execution
   */
  pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Run generation if called directly
 */
if (require.main === module) {
  const monitor = new GenerationMonitor({
    saveProgress: true,
    retryFailures: true
  });
  
  monitor.generateAllUnits()
    .then(report => {
      console.log('\n✨ Generation process complete!');
      process.exit(report.summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { GenerationMonitor };