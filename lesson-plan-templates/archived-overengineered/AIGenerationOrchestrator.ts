/**
 * 🎯 AI GENERATION ORCHESTRATOR
 * Master controller for AI lesson generation
 * Ensures all rules, patterns, and validations are applied
 */

import { LessonPlanTemplate, SubjectType } from './types/LessonPlanTemplate';
import { LessonGenerationContext } from './types/LessonContext';
import { validatePreGeneration, handleExtremeContext } from './ai-rules/PreGenerationValidator';
import { validateAIGeneration, GRADE1_FRENCH_IMMERSION_RULES } from './ai-rules/GenerationRules';
import { EXCELLENT_GRADE1_PATTERNS } from './ai-rules/PositivePatterns';
import { TemplateValidator } from './validation/TemplateValidator';

export class AIGenerationOrchestrator {
  
  /**
   * Master generation flow for AI
   * This is what the AI system would call to generate a lesson
   */
  static async generateLesson(
    subject: SubjectType,
    unitPlanId: string,
    context: LessonGenerationContext,
    specificRequirements?: {
      focusConcept?: string;
      mustIncludeVocabulary?: string[];
      avoidActivities?: string[];
      specialConsiderations?: string[];
    }
  ): Promise<{
    success: boolean;
    lesson?: LessonPlanTemplate;
    errors?: string[];
    warnings?: string[];
    recommendations?: string[];
  }> {
    
    // STEP 1: Pre-generation validation
    const preValidation = validatePreGeneration(context, subject);
    if (!preValidation.canGenerate) {
      return {
        success: false,
        errors: preValidation.errors,
        warnings: preValidation.warnings,
        recommendations: preValidation.recommendations
      };
    }
    
    // STEP 2: Check for extreme contexts
    const extremeCheck = handleExtremeContext(context);
    if (!extremeCheck.shouldProceed) {
      return {
        success: false,
        errors: [extremeCheck.alternativeSuggestion || 'Cannot generate lesson for this context'],
        warnings: preValidation.warnings
      };
    }
    
    // STEP 3: Select appropriate template and patterns
    const selectedPatterns = this.selectPatternsForContext(context, subject);
    
    // STEP 4: Apply generation rules
    const generationConstraints = this.buildGenerationConstraints(context, subject);
    
    // STEP 5: Call AI generation (this would be the actual AI call)
    const generatedLesson = await this.callAIGeneration(
      subject,
      unitPlanId,
      context,
      selectedPatterns,
      generationConstraints,
      specificRequirements
    );
    
    // STEP 6: Validate generated content
    const aiValidation = validateAIGeneration(generatedLesson, context, subject);
    if (!aiValidation.isValid) {
      // Try to fix common issues
      const fixedLesson = this.attemptAutoFix(generatedLesson, aiValidation.violations);
      
      // Re-validate
      const revalidation = validateAIGeneration(fixedLesson, context, subject);
      if (!revalidation.isValid) {
        return {
          success: false,
          errors: revalidation.violations,
          warnings: preValidation.warnings
        };
      }
      
      generatedLesson = fixedLesson;
    }
    
    // STEP 7: Template validation (ETFO compliance, etc.)
    const templateValidation = TemplateValidator.validateTemplate(generatedLesson);
    if (!templateValidation.isValid) {
      return {
        success: false,
        errors: templateValidation.errors.map(e => e.message),
        warnings: templateValidation.warnings.map(w => w.message)
      };
    }
    
    // STEP 8: Final quality check
    if (templateValidation.score < 80) {
      return {
        success: false,
        errors: ['Quality score too low: ' + templateValidation.score],
        warnings: preValidation.warnings,
        recommendations: templateValidation.recommendations
      };
    }
    
    // SUCCESS: Return the perfect lesson
    return {
      success: true,
      lesson: generatedLesson,
      warnings: [
        ...preValidation.warnings,
        ...templateValidation.warnings.map(w => w.message)
      ],
      recommendations: [
        ...preValidation.recommendations,
        ...templateValidation.recommendations
      ]
    };
  }
  
  /**
   * Select appropriate patterns based on context
   */
  private static selectPatternsForContext(
    context: LessonGenerationContext,
    subject: SubjectType
  ): typeof EXCELLENT_GRADE1_PATTERNS {
    const selected = [];
    
    // Always include core patterns
    selected.push(...EXCELLENT_GRADE1_PATTERNS.filter(p => 
      p.category === 'instruction' || p.category === 'assessment'
    ));
    
    // Add engagement patterns based on energy
    if (context.energy.expectedEnergyLevel === 'low' || 
        context.energy.expectedEnergyLevel === 'very-low') {
      selected.push(...EXCELLENT_GRADE1_PATTERNS.filter(p => 
        p.category === 'engagement' && p.pattern.includes('Mystery')
      ));
    }
    
    // Add vocabulary patterns for French-heavy subjects
    if (subject === 'Français (Immersion)' || 
        context.temporal.monthOfYear <= 11) {
      selected.push(...EXCELLENT_GRADE1_PATTERNS.filter(p => 
        p.category === 'vocabulary'
      ));
    }
    
    // Add behavior patterns for challenging times
    if (context.temporal.dayOfWeek === 'Friday' ||
        context.temporal.timeOfDay === 'end-of-day') {
      selected.push(...EXCELLENT_GRADE1_PATTERNS.filter(p => 
        p.category === 'behavior'
      ));
    }
    
    // Add transition patterns for after recess/lunch
    if (context.temporal.timeOfDay === 'after-recess' ||
        context.temporal.timeOfDay === 'after-lunch') {
      selected.push(...EXCELLENT_GRADE1_PATTERNS.filter(p => 
        p.category === 'transition'
      ));
    }
    
    return selected;
  }
  
  /**
   * Build specific constraints for this generation
   */
  private static buildGenerationConstraints(
    context: LessonGenerationContext,
    subject: SubjectType
  ): any {
    const rules = GRADE1_FRENCH_IMMERSION_RULES;
    const month = context.temporal.monthOfYear;
    
    return {
      maxVocabulary: rules.vocabularyRules.maxPerLesson.get(month) || 3,
      frenchPercentage: rules.languageRules.frenchPercentageByMonth.get(month) || 30,
      maxActivityDuration: rules.attentionRules.maxContinuousInstruction,
      requiredMovementBreaks: rules.attentionRules.requiredMovementBreaks,
      bannedPatterns: rules.bannedPatterns,
      mandatoryElements: rules.ALWAYS,
      prohibitedElements: rules.NEVER,
      energyLevel: context.energy.expectedEnergyLevel,
      timeConstraints: {
        prepTime: context.temporal.timeOfDay === 'morning' ? 15 : 10,
        flexibilityNeeded: context.temporal.dayOfWeek === 'Friday'
      }
    };
  }
  
  /**
   * Simulate AI generation (in reality, this would call GPT-4 or similar)
   */
  private static async callAIGeneration(
    subject: SubjectType,
    unitPlanId: string,
    context: LessonGenerationContext,
    patterns: any[],
    constraints: any,
    specificRequirements?: any
  ): Promise<LessonPlanTemplate> {
    // This is where the actual AI call would happen
    // For now, returning a mock structure to show the system works
    
    const mockLesson: LessonPlanTemplate = {
      id: `ai-generated-${Date.now()}`,
      subject,
      unitPlanId,
      title: 'AI Generated Lesson',
      duration: 45,
      generationContext: context,
      
      learningGoals: [{
        id: 'goal-1',
        statement: 'Je peux...',
        successCriteria: ['Observable behavior']
      }],
      
      bigIdeas: ['Generated based on subject'],
      essentialQuestions: ['Grade 1 appropriate question'],
      
      vocabulary: [
        { term: 'mot1', definition: 'simple definition', visualSupport: 'image' },
        { term: 'mot2', definition: 'simple definition', gestures: 'gesture' }
      ],
      
      activities: {
        mindsOn: [{
          id: 'minds-on-1',
          phase: 'minds-on',
          title: 'Engagement Activity',
          description: 'Based on patterns',
          duration: 10,
          instructions: ['Step 1', 'Step 2'],
          materials: ['Safe materials only'],
          grouping: 'whole-class',
          differentiation: {
            support: ['Support strategy'],
            core: ['Core activity'],
            extension: ['Extension option']
          },
          isCritical: true
        }],
        action: [{
          id: 'action-1',
          phase: 'action',
          title: 'Main Learning',
          description: 'Core activity',
          duration: 28,
          instructions: ['Guided by constraints'],
          materials: ['From available materials'],
          grouping: 'small-groups',
          differentiation: {
            support: ['Scaffolding'],
            core: ['Main activity'],
            extension: ['Challenge']
          },
          isCritical: true
        }],
        consolidation: [{
          id: 'consolidation-1',
          phase: 'consolidation',
          title: 'Wrap Up',
          description: 'Reflection',
          duration: 7,
          instructions: ['Share learning'],
          materials: [],
          grouping: 'whole-class',
          differentiation: {
            support: ['Simple sharing'],
            core: ['Regular sharing'],
            extension: ['Extended sharing']
          }
        }]
      },
      
      assessments: [{
        id: 'assessment-1',
        type: 'formative',
        method: 'Observation',
        description: 'Observe student engagement',
        phase: 'action',
        successCriteria: ['Participates', 'Uses vocabulary']
      }],
      
      materials: {
        essential: ['Paper', 'Crayons'],
        optional: ['Extra supplies']
      },
      
      safety: {
        level: 'low',
        considerations: ['Age appropriate'],
        procedures: ['Standard procedures']
      },
      
      indigenousPerspectives: 'Authentic integration based on subject',
      
      differentiation: {
        universalDesign: ['Visual supports'],
        accommodations: ['As needed'],
        modifications: ['If required']
      },
      
      prepRequirements: {
        prepTimeMinutes: 15,
        setupNeeded: ['Organize materials']
      },
      
      timingFlexibility: {
        criticalElements: ['Main concept'],
        optionalEnhancements: ['Extensions']
      },
      
      contingencyPlans: {
        ifShortOnTime: 'Focus on critical elements',
        ifInterrupted: 'Pause and resume',
        ifMaterialsMissing: 'Use alternatives'
      },
      
      teacherNotes: ['Generated notes'],
      
      createdAt: new Date(),
      updatedAt: new Date(),
      isTemplate: false,
      templateVersion: '2.0.0'
    };
    
    return mockLesson;
  }
  
  /**
   * Attempt to fix common AI generation issues
   */
  private static attemptAutoFix(lesson: any, violations: string[]): any {
    const fixed = { ...lesson };
    
    for (const violation of violations) {
      if (violation.includes('Too many vocabulary')) {
        // Reduce vocabulary to limit
        fixed.vocabulary = fixed.vocabulary.slice(0, 3);
      }
      
      if (violation.includes('attention limit')) {
        // Break up long activities
        if (fixed.activities?.action) {
          fixed.activities.action = fixed.activities.action.map((a: any) => ({
            ...a,
            duration: Math.min(a.duration, 10)
          }));
        }
      }
      
      if (violation.includes('movement breaks')) {
        // Add movement to action activities
        if (fixed.activities?.action?.[0]) {
          fixed.activities.action[0].instructions.push('Stand and stretch');
        }
      }
      
      if (violation.includes('banned pattern')) {
        // Remove banned patterns from instructions
        const bannedWords = ['discuss', 'reflect', 'independently', 'quietly'];
        if (fixed.activities) {
          Object.values(fixed.activities).forEach((phaseActivities: any) => {
            phaseActivities.forEach((activity: any) => {
              activity.instructions = activity.instructions.map((inst: string) => {
                let cleaned = inst;
                bannedWords.forEach(word => {
                  cleaned = cleaned.replace(new RegExp(word, 'gi'), '');
                });
                return cleaned;
              });
            });
          });
        }
      }
    }
    
    return fixed;
  }
}

// Example usage for AI system
export async function exampleAIGeneration() {
  const context: LessonGenerationContext = {
    temporal: {
      monthOfYear: 10,
      weekOfSchoolYear: 8,
      dayOfWeek: 'Tuesday',
      timeOfDay: 'morning',
      season: 'fall'
    },
    progression: {
      lessonsCompletedInUnit: 3,
      totalLessonsInUnit: 10,
      keyConceptsPreviouslyTaught: ['colors', 'numbers 1-5'],
      vocabularyPreviouslyIntroduced: ['rouge', 'bleu', 'un', 'deux', 'trois'],
      skillsCurrentlyDeveloping: ['counting', 'color identification']
    },
    constraints: {
      maxNewVocabularyPerLesson: 3,
      maxContinuousFocusMinutes: 8,
      frenchToEnglishRatio: 0.4,
      concreteToAbstractRatio: 0.95,
      movementBreaksRequired: 2
    },
    classroom: {
      typicalClassSize: 22,
      availableManipulatives: ['unifix cubes', 'counting bears'],
      availableTechnology: ['smartboard'],
      commonClassroomMaterials: ['crayons', 'paper', 'glue']
    },
    routines: {
      morningRoutines: ['calendar', 'weather'],
      establishedSignals: ['clap pattern', 'chime']
    },
    energy: {
      expectedEnergyLevel: 'moderate',
      attentionChallenges: [],
      recommendedPacing: 'normal'
    },
    cultural: {
      upcomingEvents: [],
      culturalObservances: [],
      schoolEvents: [],
      seasonalConsiderations: ['fall leaves changing']
    }
  };
  
  const result = await AIGenerationOrchestrator.generateLesson(
    'Mathématiques',
    'unit-123',
    context,
    {
      focusConcept: 'Counting to 10',
      mustIncludeVocabulary: ['quatre', 'cinq']
    }
  );
  
  if (result.success) {
    console.log('✅ Lesson generated successfully!');
    console.log('Quality score:', TemplateValidator.validateTemplate(result.lesson!).score);
  } else {
    console.log('❌ Generation failed:', result.errors);
  }
}