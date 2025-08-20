/**
 * 🎯 PERFECT LESSON PLAN TEMPLATE VALIDATOR
 * Comprehensive validation system for Grade 1 French Immersion templates
 * 
 * Validates:
 * - ETFO compliance and timing
 * - Grade 1 developmental appropriateness  
 * - French Immersion integration
 * - Safety protocols
 * - Indigenous perspectives
 * - Educational quality
 */

import { LessonPlanTemplate, SubjectType, SafetyLevel } from '../types/LessonPlanTemplate';

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  errors: ValidationError[];
  warnings: ValidationWarning[];
  recommendations: string[];
}

export interface ValidationError {
  category: 'structure' | 'etfo' | 'safety' | 'educational' | 'french-immersion' | 'indigenous';
  severity: 'critical' | 'major' | 'minor';
  message: string;
  field?: string;
}

export interface ValidationWarning {
  category: 'optimization' | 'enhancement' | 'consideration';
  message: string;
  suggestion: string;
}

export class TemplateValidator {
  
  /**
   * Comprehensive validation of a lesson plan template
   */
  static validateTemplate(template: LessonPlanTemplate): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: string[] = [];
    
    // Core structure validation
    this.validateStructure(template, errors, warnings);
    
    // ETFO compliance validation
    this.validateETFOCompliance(template, errors, warnings);
    
    // Grade 1 developmental appropriateness
    this.validateGrade1Appropriateness(template, errors, warnings);
    
    // French Immersion integration
    this.validateFrenchImmersionIntegration(template, errors, warnings);
    
    // Safety protocols validation
    this.validateSafetyProtocols(template, errors, warnings);
    
    // Indigenous perspectives validation
    this.validateIndigenousPerspectives(template, errors, warnings);
    
    // Educational quality validation
    this.validateEducationalQuality(template, errors, warnings);
    
    // Subject-specific validation
    this.validateSubjectSpecificRequirements(template, errors, warnings);
    
    // Generate recommendations
    this.generateRecommendations(template, recommendations);
    
    // Calculate score
    const score = this.calculateScore(errors, warnings);
    
    return {
      isValid: errors.filter(e => e.severity === 'critical').length === 0,
      score,
      errors,
      warnings,
      recommendations
    };
  }
  
  /**
   * Validates basic template structure
   */
  private static validateStructure(template: LessonPlanTemplate, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Required fields
    const requiredFields = ['id', 'subject', 'title', 'duration', 'learningGoals', 'activities', 'vocabulary'];
    
    for (const field of requiredFields) {
      if (!template[field as keyof LessonPlanTemplate]) {
        errors.push({
          category: 'structure',
          severity: 'critical',
          message: `Missing required field: ${field}`,
          field
        });
      }
    }
    
    // Duration must be exactly 45 minutes
    if (template.duration !== 45) {
      errors.push({
        category: 'structure',
        severity: 'critical',
        message: 'Duration must be exactly 45 minutes for Grade 1 lessons',
        field: 'duration'
      });
    }
    
    // Learning goals validation
    if (template.learningGoals.length === 0) {
      errors.push({
        category: 'structure',
        severity: 'major',
        message: 'At least one learning goal is required'
      });
    }
    
    if (template.learningGoals.length > 3) {
      warnings.push({
        category: 'optimization',
        message: 'More than 3 learning goals may be overwhelming for Grade 1',
        suggestion: 'Consider focusing on 1-2 primary learning goals'
      });
    }
    
    // Vocabulary validation
    if (template.vocabulary.length === 0) {
      errors.push({
        category: 'french-immersion',
        severity: 'major',
        message: 'Vocabulary is required for French Immersion lessons'
      });
    }
    
    if (template.vocabulary.length > 8) {
      warnings.push({
        category: 'optimization',
        message: 'More than 8 vocabulary words may be too many for Grade 1',
        suggestion: 'Consider focusing on 3-5 key vocabulary words'
      });
    }
  }
  
  /**
   * Validates ETFO three-part structure compliance
   */
  private static validateETFOCompliance(template: LessonPlanTemplate, errors: ValidationError[], warnings: ValidationWarning[]): void {
    const { mindsOn, action, consolidation } = template.activities;
    
    // Check that all three parts exist
    if (!mindsOn || mindsOn.length === 0) {
      errors.push({
        category: 'etfo',
        severity: 'critical',
        message: 'Minds On phase is required for ETFO compliance'
      });
    }
    
    if (!action || action.length === 0) {
      errors.push({
        category: 'etfo',
        severity: 'critical',
        message: 'Action phase is required for ETFO compliance'
      });
    }
    
    if (!consolidation || consolidation.length === 0) {
      errors.push({
        category: 'etfo',
        severity: 'critical',
        message: 'Consolidation phase is required for ETFO compliance'
      });
    }
    
    // Timing validation
    const mindsOnTime = mindsOn?.reduce((sum, activity) => sum + activity.duration, 0) || 0;
    const actionTime = action?.reduce((sum, activity) => sum + activity.duration, 0) || 0;
    const consolidationTime = consolidation?.reduce((sum, activity) => sum + activity.duration, 0) || 0;
    
    if (mindsOnTime < 10 || mindsOnTime > 15) {
      errors.push({
        category: 'etfo',
        severity: 'major',
        message: 'Minds On phase must be 10-15 minutes'
      });
    }
    
    if (actionTime < 25 || actionTime > 30) {
      errors.push({
        category: 'etfo',
        severity: 'major',
        message: 'Action phase must be 25-30 minutes'
      });
    }
    
    if (consolidationTime < 5 || consolidationTime > 10) {
      errors.push({
        category: 'etfo',
        severity: 'major',
        message: 'Consolidation phase must be 5-10 minutes'
      });
    }
    
    // Total timing check
    const totalTime = mindsOnTime + actionTime + consolidationTime;
    if (Math.abs(totalTime - 45) > 2) {
      errors.push({
        category: 'etfo',
        severity: 'major',
        message: `Total activity time (${totalTime}min) should equal lesson duration (45min)`
      });
    }
  }
  
  /**
   * Validates Grade 1 developmental appropriateness
   */
  private static validateGrade1Appropriateness(template: LessonPlanTemplate, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Check learning goals for Grade 1 language
    template.learningGoals.forEach((goal, index) => {
      if (goal.statement.length > 100) {
        warnings.push({
          category: 'optimization',
          message: `Learning goal ${index + 1} is quite long for Grade 1`,
          suggestion: 'Consider simplifying the language for 6-7 year olds'
        });
      }
      
      // Check for Grade 1 appropriate "I can" statements
      if (!goal.statement.toLowerCase().includes('je peux') && !goal.statement.toLowerCase().includes('je sais')) {
        warnings.push({
          category: 'enhancement',
          message: `Learning goal ${index + 1} could use Grade 1 friendly language`,
          suggestion: 'Consider using "Je peux..." or "Je sais..." statements'
        });
      }
    });
    
    // Check activity duration appropriateness
    template.activities.action?.forEach((activity, index) => {
      if (activity.duration > 15) {
        warnings.push({
          category: 'consideration',
          message: `Action activity ${index + 1} is ${activity.duration} minutes - may be long for Grade 1 attention spans`,
          suggestion: 'Consider breaking into smaller segments or adding movement breaks'
        });
      }
    });
    
    // Check for hands-on/concrete learning
    const hasManipulatives = template.materials.manipulatives && template.materials.manipulatives.length > 0;
    if (!hasManipulatives && ['Mathématiques', 'Sciences de la nature'].includes(template.subject)) {
      warnings.push({
        category: 'enhancement',
        message: 'Grade 1 learners benefit from concrete manipulatives',
        suggestion: 'Consider adding hands-on materials for concrete learning'
      });
    }
  }
  
  /**
   * Validates French Immersion integration
   */
  private static validateFrenchImmersionIntegration(template: LessonPlanTemplate, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Check for French vocabulary
    if (template.vocabulary.length === 0) {
      errors.push({
        category: 'french-immersion',
        severity: 'major',
        message: 'French vocabulary is essential for immersion lessons'
      });
    }
    
    // Check that vocabulary includes French definitions
    template.vocabulary.forEach((vocab, index) => {
      if (!vocab.definition || vocab.definition.trim().length === 0) {
        errors.push({
          category: 'french-immersion',
          severity: 'minor',
          message: `Vocabulary item ${index + 1} missing French definition`
        });
      }
    });
    
    // Check for visual supports (important for language learners)
    const hasVisualSupports = template.vocabulary.some(v => v.visualSupport) || 
                              template.materials.essential.some(m => m.toLowerCase().includes('carte') || m.toLowerCase().includes('image'));
    
    if (!hasVisualSupports) {
      warnings.push({
        category: 'enhancement',
        message: 'Visual supports are crucial for French Immersion learners',
        suggestion: 'Add visual cards, images, or other visual supports'
      });
    }
    
    // Check for gestures/kinesthetic support
    const hasGestureSupport = template.vocabulary.some(v => v.gestures);
    if (!hasGestureSupport) {
      warnings.push({
        category: 'enhancement',
        message: 'Gestures help Grade 1 French Immersion students',
        suggestion: 'Consider adding gesture support for key vocabulary'
      });
    }
  }
  
  /**
   * Validates safety protocols
   */
  private static validateSafetyProtocols(template: LessonPlanTemplate, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!template.safety) {
      errors.push({
        category: 'safety',
        severity: 'critical',
        message: 'Safety protocols are required for all Grade 1 lessons'
      });
      return;
    }
    
    // Check safety level appropriateness
    const subjectSafetyRequirements: Record<SubjectType, SafetyLevel[]> = {
      'Sciences de la nature': ['medium', 'high'],
      'Arts visuels': ['medium', 'high'],
      'Formation personnelle et sociale': ['high'],
      'Français (Immersion)': ['low', 'medium'],
      'Mathématiques': ['low', 'medium'],
      'Sciences humaines': ['medium']
    };
    
    const requiredLevels = subjectSafetyRequirements[template.subject];
    if (requiredLevels && !requiredLevels.includes(template.safety.level)) {
      warnings.push({
        category: 'consideration',
        message: `Safety level ${template.safety.level} may not be appropriate for ${template.subject}`,
        suggestion: `Consider ${requiredLevels.join(' or ')} safety level`
      });
    }
    
    // Check for Grade 1 specific safety considerations
    const grade1SafetyKeywords = ['supervision', 'adulte', 'sécuritaire', 'approprié'];
    const hasGrade1Safety = template.safety.considerations.some(consideration =>
      grade1SafetyKeywords.some(keyword => consideration.toLowerCase().includes(keyword))
    );
    
    if (!hasGrade1Safety) {
      warnings.push({
        category: 'enhancement',
        message: 'Safety considerations should be specific to Grade 1 age group',
        suggestion: 'Add considerations about adult supervision and age-appropriate materials'
      });
    }
  }
  
  /**
   * Validates Indigenous perspectives integration
   */
  private static validateIndigenousPerspectives(template: LessonPlanTemplate, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!template.indigenousPerspectives || template.indigenousPerspectives.trim().length === 0) {
      errors.push({
        category: 'indigenous',
        severity: 'critical',
        message: 'Indigenous perspectives are mandatory for PEI curriculum'
      });
      return;
    }
    
    // Check for authentic Mi'kmaq content
    const mikmaqKeywords = ['mi\'kmaq', 'mikmaq', 'territoire', 'traditionnel', 'aînés', 'enseignements'];
    const hasMikmaqContent = mikmaqKeywords.some(keyword => 
      template.indigenousPerspectives.toLowerCase().includes(keyword)
    );
    
    if (!hasMikmaqContent) {
      warnings.push({
        category: 'enhancement',
        message: 'Indigenous perspectives should specifically reference Mi\'kmaq knowledge',
        suggestion: 'Include specific Mi\'kmaq teachings, territory acknowledgment, or traditional knowledge'
      });
    }
    
    // Check length - should be substantial
    if (template.indigenousPerspectives.length < 50) {
      warnings.push({
        category: 'enhancement',
        message: 'Indigenous perspectives seem brief',
        suggestion: 'Consider expanding to include more meaningful Indigenous connections'
      });
    }
  }
  
  /**
   * Validates educational quality
   */
  private static validateEducationalQuality(template: LessonPlanTemplate, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Check assessment alignment with learning goals
    const hasFormativeAssessment = template.assessments.some(a => a.type === 'formative');
    if (!hasFormativeAssessment) {
      warnings.push({
        category: 'enhancement',
        message: 'Formative assessment helps track student progress',
        suggestion: 'Add formative assessment strategies'
      });
    }
    
    // Check differentiation quality
    if (!template.differentiation) {
      errors.push({
        category: 'educational',
        severity: 'major',
        message: 'Differentiation strategies are required for inclusive education'
      });
    } else {
      const { support, core, extension } = template.differentiation.universalDesign || {};
      if (!support || !core || !extension) {
        warnings.push({
          category: 'enhancement',
          message: 'Universal Design for Learning should include support, core, and extension strategies',
          suggestion: 'Ensure all three levels of differentiation are addressed'
        });
      }
    }
    
    // Check for authentic learning connections
    if (!template.homeConnection || template.homeConnection.length < 20) {
      warnings.push({
        category: 'enhancement',
        message: 'Home connections help reinforce learning',
        suggestion: 'Add meaningful connections to home and community'
      });
    }
    
    // NEW: Check practical planning elements
    if (!template.prepRequirements) {
      warnings.push({
        category: 'enhancement',
        message: 'Prep requirements help teachers plan effectively',
        suggestion: 'Add preparation time and setup requirements'
      });
    }
    
    if (!template.timingFlexibility) {
      warnings.push({
        category: 'enhancement',
        message: 'Timing flexibility helps manage real classroom situations',
        suggestion: 'Identify critical vs optional elements'
      });
    }
    
    if (!template.contingencyPlans) {
      warnings.push({
        category: 'enhancement',
        message: 'Contingency plans help when things don\'t go as planned',
        suggestion: 'Add backup plans for common classroom situations'
      });
    }
  }
  
  /**
   * Validates subject-specific requirements
   */
  private static validateSubjectSpecificRequirements(template: LessonPlanTemplate, errors: ValidationError[], warnings: ValidationWarning[]): void {
    switch (template.subject) {
      case 'Sciences de la nature':
        this.validateScienceRequirements(template, errors, warnings);
        break;
      case 'Mathématiques':
        this.validateMathRequirements(template, errors, warnings);
        break;
      case 'Arts visuels':
        this.validateArtsRequirements(template, errors, warnings);
        break;
      case 'Formation personnelle et sociale':
        this.validateHealthFPSRequirements(template, errors, warnings);
        break;
      case 'Sciences humaines':
        this.validateSocialStudiesRequirements(template, errors, warnings);
        break;
      case 'Français (Immersion)':
        this.validateFrenchRequirements(template, errors, warnings);
        break;
    }
  }
  
  private static validateScienceRequirements(template: LessonPlanTemplate, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Science should have inquiry focus
    const hasInquiry = template.activities.action?.some(activity => 
      activity.description.toLowerCase().includes('exploration') ||
      activity.description.toLowerCase().includes('observation') ||
      activity.description.toLowerCase().includes('investigation')
    );
    
    if (!hasInquiry) {
      warnings.push({
        category: 'enhancement',
        message: 'Science lessons should include inquiry-based learning',
        suggestion: 'Add exploration, observation, or investigation activities'
      });
    }
    
    // Should have safety considerations for manipulation
    if (template.safety.level === 'low') {
      warnings.push({
        category: 'consideration',
        message: 'Science activities often require medium or high safety protocols',
        suggestion: 'Review safety level for hands-on science activities'
      });
    }
  }
  
  private static validateMathRequirements(template: LessonPlanTemplate, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Math should have concrete materials
    const hasManipulatives = template.materials.manipulatives && template.materials.manipulatives.length > 0;
    if (!hasManipulatives) {
      warnings.push({
        category: 'enhancement',
        message: 'Grade 1 math benefits from concrete manipulatives',
        suggestion: 'Add hands-on materials like blocks, counters, or shapes'
      });
    }
    
    // Should have problem-solving component
    const hasProblemSolving = template.assessments.some(a => 
      a.method.toLowerCase().includes('problème') || 
      a.description.toLowerCase().includes('résolution')
    );
    
    if (!hasProblemSolving) {
      warnings.push({
        category: 'enhancement',
        message: 'Math lessons should include problem-solving assessment',
        suggestion: 'Add problem-solving observation or assessment'
      });
    }
  }
  
  private static validateArtsRequirements(template: LessonPlanTemplate, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Arts should focus on process over product
    const hasProcessFocus = template.assessments.some(a => 
      a.description.toLowerCase().includes('processus') ||
      a.description.toLowerCase().includes('créatif')
    );
    
    if (!hasProcessFocus) {
      warnings.push({
        category: 'enhancement',
        message: 'Arts education should emphasize creative process',
        suggestion: 'Add assessment of creative process, not just final product'
      });
    }
  }
  
  private static validateHealthFPSRequirements(template: LessonPlanTemplate, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Should have trauma-informed approaches
    if (template.safety.level !== 'high') {
      warnings.push({
        category: 'consideration',
        message: 'Health/FPS lessons require high-level safety protocols for emotional safety',
        suggestion: 'Consider high safety level for emotional and personal topics'
      });
    }
    
    // Should have emotional safety considerations
    const hasEmotionalSafety = template.safety.considerations.some(c => 
      c.toLowerCase().includes('émotionnel') ||
      c.toLowerCase().includes('trauma') ||
      c.toLowerCase().includes('respectueux')
    );
    
    if (!hasEmotionalSafety) {
      warnings.push({
        category: 'enhancement',
        message: 'Health/FPS requires emotional safety considerations',
        suggestion: 'Add emotional safety and trauma-informed approaches'
      });
    }
  }
  
  private static validateSocialStudiesRequirements(template: LessonPlanTemplate, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Should have community connections
    const hasCommunityConnection = template.crossCurricular?.some(c => 
      c.connection.toLowerCase().includes('communauté')
    ) || template.homeConnection?.toLowerCase().includes('communauté');
    
    if (!hasCommunityConnection) {
      warnings.push({
        category: 'enhancement',
        message: 'Social Studies should connect to community',
        suggestion: 'Add connections to local community and citizenship'
      });
    }
  }
  
  private static validateFrenchRequirements(template: LessonPlanTemplate, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Should have oral language component
    const hasOralLanguage = template.activities.action?.some(activity =>
      activity.description.toLowerCase().includes('discussion') ||
      activity.description.toLowerCase().includes('oral') ||
      activity.description.toLowerCase().includes('parler')
    );
    
    if (!hasOralLanguage) {
      warnings.push({
        category: 'enhancement',
        message: 'French lessons should include oral language development',
        suggestion: 'Add speaking and listening activities'
      });
    }
  }
  
  /**
   * Generates improvement recommendations
   */
  private static generateRecommendations(template: LessonPlanTemplate, recommendations: string[]): void {
    // Add template-specific recommendations based on analysis
    recommendations.push('Ensure all activities are tested before implementation');
    recommendations.push('Prepare all materials in advance and have backups ready');
    recommendations.push('Practice French pronunciation of new vocabulary');
    recommendations.push('Have extension activities ready for early finishers');
    recommendations.push('Consider individual student needs and adjust accordingly');
    
    if (template.subject === 'Formation personnelle et sociale') {
      recommendations.push('Review school policies for sensitive topic discussions');
      recommendations.push('Inform parents/guardians about topics being covered');
    }
    
    if (['Sciences de la nature', 'Arts visuels'].includes(template.subject)) {
      recommendations.push('Test all materials for safety and age-appropriateness');
      recommendations.push('Have cleanup supplies readily available');
    }
  }
  
  /**
   * Calculates overall quality score
   */
  private static calculateScore(errors: ValidationError[], warnings: ValidationWarning[]): number {
    let score = 100;
    
    // Deduct points for errors
    errors.forEach(error => {
      switch (error.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'major':
          score -= 10;
          break;
        case 'minor':
          score -= 5;
          break;
      }
    });
    
    // Deduct points for warnings
    warnings.forEach(warning => {
      score -= 2;
    });
    
    return Math.max(0, score);
  }
}