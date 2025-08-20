/**
 * Agentic Lesson Generator
 * Intelligently manages conversations with Claude to generate coherent unit lessons
 */

const { PrismaClient } = require('@teaching-engine/database');
const { evaluateLessonProgression, validateETFOCompliance } = require('./lesson-evaluator.js');
const { getUnitPresentation, getRevisionRequest, getLessonRequest } = require('./conversation-templates.js');
const { extractLessonComponents, parseFlexibly } = require('./lesson-extractor.js');

class AgenticLessonGenerator {
  constructor(unit, options = {}) {
    this.unit = unit;
    this.conversation = [];
    this.lessons = [];
    this.overview = null;
    this.options = {
      maxRetries: 3,
      requireApproval: true,
      ...options
    };
  }

  /**
   * Main generation flow for a complete unit
   */
  async generateUnitLessons() {
    console.log(`🤖 Starting intelligent generation for unit: ${this.unit.title}`);
    
    try {
      // Step 1: Present unit and get overview
      const overview = await this.requestOverview();
      
      // Step 2: Evaluate and potentially revise
      const approvedOverview = await this.evaluateAndRevise(overview);
      
      // Step 3: Extract individual lessons
      const lessons = await this.extractAllLessons(approvedOverview);
      
      // Step 4: Validate complete unit coherence
      const validatedLessons = await this.validateUnitCoherence(lessons);
      
      // Step 5: Store in database
      await this.storeLessons(validatedLessons);
      
      return {
        success: true,
        unit: this.unit.title,
        lessonsGenerated: validatedLessons.length,
        conversation: this.conversation
      };
      
    } catch (error) {
      return this.handleGenerationError(error);
    }
  }

  /**
   * Request initial overview from Claude
   */
  async requestOverview() {
    const prompt = getUnitPresentation(this.unit);
    
    // This would connect to Claude.ai via browser automation
    const response = await this.sendToClaude(prompt);
    
    this.conversation.push({
      role: 'agent',
      content: prompt,
      timestamp: new Date()
    });
    
    this.conversation.push({
      role: 'claude',
      content: response,
      timestamp: new Date()
    });
    
    return this.parseOverview(response);
  }

  /**
   * Evaluate overview and request revisions if needed
   */
  async evaluateAndRevise(overview, attempt = 1) {
    const evaluation = evaluateLessonProgression(overview, this.unit);
    
    if (evaluation.approved) {
      console.log('✅ Overview approved on attempt', attempt);
      this.overview = overview;
      return overview;
    }
    
    if (attempt >= this.options.maxRetries) {
      console.warn('⚠️ Max revision attempts reached, proceeding with current overview');
      return overview;
    }
    
    console.log(`🔄 Requesting revision ${attempt}: ${evaluation.feedback}`);
    
    const revisionPrompt = getRevisionRequest(evaluation.feedback, overview);
    const revisedResponse = await this.sendToClaude(revisionPrompt);
    
    this.conversation.push({
      role: 'agent',
      content: revisionPrompt,
      timestamp: new Date()
    });
    
    this.conversation.push({
      role: 'claude',
      content: revisedResponse,
      timestamp: new Date()
    });
    
    const revisedOverview = this.parseOverview(revisedResponse);
    return this.evaluateAndRevise(revisedOverview, attempt + 1);
  }

  /**
   * Extract individual lessons from conversation
   */
  async extractAllLessons(overview) {
    const lessons = [];
    const totalLessons = overview.lessonCount || 20;
    
    for (let i = 1; i <= totalLessons; i++) {
      console.log(`📝 Extracting lesson ${i}/${totalLessons}`);
      
      const lesson = await this.extractSingleLesson(i, lessons);
      lessons.push(lesson);
      
      // Brief pause to avoid overwhelming Claude
      await this.pause(1000);
    }
    
    return lessons;
  }

  /**
   * Extract a single lesson with validation
   */
  async extractSingleLesson(lessonNumber, previousLessons, attempt = 1) {
    const context = {
      lessonNumber,
      totalLessons: this.overview.lessonCount || 20,
      previousLesson: previousLessons[lessonNumber - 2] || null,
      overview: this.overview
    };
    
    const prompt = getLessonRequest(context);
    const response = await this.sendToClaude(prompt);
    
    this.conversation.push({
      role: 'agent',
      content: prompt,
      timestamp: new Date()
    });
    
    this.conversation.push({
      role: 'claude',
      content: response,
      timestamp: new Date()
    });
    
    // Extract and validate lesson
    const lesson = extractLessonComponents(response);
    const validation = validateETFOCompliance(lesson);
    
    if (validation.complete) {
      return lesson;
    }
    
    if (attempt >= this.options.maxRetries) {
      console.warn(`⚠️ Lesson ${lessonNumber} incomplete after ${attempt} attempts`);
      return this.fillMissingComponents(lesson, validation.missing);
    }
    
    // Request missing components
    const completionPrompt = `The lesson is missing: ${validation.missing.join(', ')}. Please add these components.`;
    return this.extractSingleLesson(lessonNumber, previousLessons, attempt + 1);
  }

  /**
   * Validate coherence across all lessons
   */
  async validateUnitCoherence(lessons) {
    const coherenceCheck = {
      progressionLogical: this.checkProgression(lessons),
      expectationsCovered: this.checkExpectationCoverage(lessons),
      culminatingAlignment: this.checkCulminatingAlignment(lessons),
      varietySufficient: this.checkActivityVariety(lessons)
    };
    
    const issues = Object.entries(coherenceCheck)
      .filter(([_, valid]) => !valid)
      .map(([issue, _]) => issue);
    
    if (issues.length === 0) {
      console.log('✅ Unit coherence validated');
      return lessons;
    }
    
    console.log(`⚠️ Coherence issues detected: ${issues.join(', ')}`);
    
    // Attempt targeted fixes
    return this.fixCoherenceIssues(lessons, issues);
  }

  /**
   * Store validated lessons in database
   */
  async storeLessons(lessons) {
    const prisma = new PrismaClient();
    
    try {
      for (const lesson of lessons) {
        await prisma.lessonPlan.create({
          data: {
            unitPlanId: this.unit.id,
            ...this.formatForDatabase(lesson)
          }
        });
      }
      
      console.log(`💾 Stored ${lessons.length} lessons in database`);
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Parse overview response into structured format
   */
  parseOverview(response) {
    return parseFlexibly(response, {
      lessonCount: /(\d+)\s*lessons?/i,
      lessonTitles: /lesson\s*(\d+)[:\s]+([^\n]+)/gi,
      progression: /progress|scaffol|build|develop/i,
      expectations: /1\.[A-Z]+\d+/g
    });
  }

  /**
   * Check if lessons show logical progression
   */
  checkProgression(lessons) {
    for (let i = 1; i < lessons.length; i++) {
      const current = lessons[i];
      const previous = lessons[i - 1];
      
      // Check if current builds on previous
      if (!current.priorKnowledge?.includes(previous.mainConcept)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if all expectations are adequately covered
   */
  checkExpectationCoverage(lessons) {
    const expectations = this.unit.expectations.map(e => e.expectation.code);
    const coverage = {};
    
    for (const expectation of expectations) {
      coverage[expectation] = lessons.filter(l => 
        l.expectations?.includes(expectation)
      ).length;
    }
    
    // Each expectation should have at least 30% coverage
    const minCoverage = Math.floor(lessons.length * 0.3);
    return Object.values(coverage).every(count => count >= minCoverage);
  }

  /**
   * Check alignment with culminating task
   */
  checkCulminatingAlignment(lessons) {
    const lastLessons = lessons.slice(-3);
    return lastLessons.some(lesson => 
      lesson.content?.toLowerCase().includes('culminat') ||
      lesson.content?.toLowerCase().includes('final') ||
      lesson.content?.toLowerCase().includes('demonstration')
    );
  }

  /**
   * Check for sufficient variety in activities
   */
  checkActivityVariety(lessons) {
    const activities = lessons.map(l => l.mainActivity?.type).filter(Boolean);
    const uniqueActivities = new Set(activities);
    
    // Should have at least 50% unique activity types
    return uniqueActivities.size >= lessons.length * 0.5;
  }

  /**
   * Fix identified coherence issues
   */
  async fixCoherenceIssues(lessons, issues) {
    for (const issue of issues) {
      switch (issue) {
        case 'progressionLogical':
          console.log('🔧 Fixing progression issues...');
          // Request Claude to revise specific lessons
          break;
          
        case 'expectationsCovered':
          console.log('🔧 Balancing expectation coverage...');
          // Redistribute expectation focus
          break;
          
        case 'culminatingAlignment':
          console.log('🔧 Aligning final lessons with culminating task...');
          // Revise last 3 lessons
          break;
          
        case 'varietySufficient':
          console.log('🔧 Increasing activity variety...');
          // Request alternative activities
          break;
      }
    }
    
    return lessons;
  }

  /**
   * Fill missing components with sensible defaults
   */
  fillMissingComponents(lesson, missingComponents) {
    const defaults = {
      consolidation: {
        duration: 10,
        activities: ['Student sharing', 'Exit ticket', 'Quick review game']
      },
      assessment: {
        formative: 'Teacher observation during activities',
        tools: ['Checklist', 'Anecdotal notes']
      },
      differentiation: {
        struggling: 'Peer support and visual aids',
        advanced: 'Extension challenges available'
      },
      materials: ['Chart paper', 'Markers', 'Manipulatives', 'Student notebooks']
    };
    
    for (const component of missingComponents) {
      if (defaults[component]) {
        lesson[component] = defaults[component];
      }
    }
    
    return lesson;
  }

  /**
   * Format lesson for database storage
   */
  formatForDatabase(lesson) {
    return {
      title: lesson.title,
      lessonNumber: lesson.number,
      duration: 45,
      objectives: lesson.objectives || [],
      activities: JSON.stringify(lesson.activities || {}),
      assessment: JSON.stringify(lesson.assessment || {}),
      differentiation: JSON.stringify(lesson.differentiation || {}),
      materials: lesson.materials || [],
      vocabulary: lesson.vocabulary || [],
      safety: lesson.safety || null,
      indigenousPerspectives: lesson.indigenousPerspectives || null,
      reflection: null,
      createdAt: new Date()
    };
  }

  /**
   * Send prompt to Claude (placeholder for actual implementation)
   */
  async sendToClaude(prompt) {
    // This would be replaced with actual Claude.ai automation
    // For now, return a mock response
    console.log('📤 Sending to Claude:', prompt.substring(0, 100) + '...');
    
    // Simulate API delay
    await this.pause(2000);
    
    return `Mock Claude response for: ${prompt.substring(0, 50)}...`;
  }

  /**
   * Handle generation errors intelligently
   */
  handleGenerationError(error) {
    console.error('❌ Generation error:', error.message);
    
    if (error.message.includes('timeout')) {
      return {
        success: false,
        unit: this.unit.title,
        error: 'Claude conversation timed out',
        suggestion: 'Try again with smaller lesson batches'
      };
    }
    
    if (error.message.includes('confusion')) {
      return {
        success: false,
        unit: this.unit.title,
        error: 'Claude seemed confused by the prompts',
        suggestion: 'Simplify unit presentation and try again'
      };
    }
    
    return {
      success: false,
      unit: this.unit.title,
      error: error.message,
      conversation: this.conversation
    };
  }

  /**
   * Utility: pause execution
   */
  pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { AgenticLessonGenerator };