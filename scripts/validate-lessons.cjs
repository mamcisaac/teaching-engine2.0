/**
 * Validate Lessons
 * Quality validation for generated lessons
 */

class LessonValidator {
  constructor(options = {}) {
    this.options = {
      strict: true,
      verbose: false,
      ...options
    };
    
    this.validationResults = {
      totalLessons: 0,
      valid: 0,
      warnings: 0,
      errors: 0,
      issues: []
    };
  }

  /**
   * Validate a complete set of unit lessons
   */
  validateUnitLessons(lessons, unit) {
    console.log(`\n🔍 Validating ${lessons.length} lessons for: ${unit.title}`);
    
    const unitValidation = {
      unitId: unit.id,
      unitTitle: unit.title,
      expectedCount: unit.lessonCount,
      actualCount: lessons.length,
      valid: true,
      issues: [],
      warnings: [],
      lessonValidations: []
    };
    
    // Check lesson count
    if (lessons.length !== unit.lessonCount) {
      unitValidation.valid = false;
      unitValidation.issues.push(
        `Expected ${unit.lessonCount} lessons, got ${lessons.length}`
      );
    }
    
    // Validate each lesson
    lessons.forEach((lesson, index) => {
      const lessonValidation = this.validateSingleLesson(lesson, index + 1, unit);
      unitValidation.lessonValidations.push(lessonValidation);
      
      if (!lessonValidation.valid) {
        unitValidation.valid = false;
      }
      
      unitValidation.issues.push(...lessonValidation.issues);
      unitValidation.warnings.push(...lessonValidation.warnings);
    });
    
    // Validate unit-level coherence
    const coherenceValidation = this.validateCoherence(lessons, unit);
    unitValidation.issues.push(...coherenceValidation.issues);
    unitValidation.warnings.push(...coherenceValidation.warnings);
    
    // Validate curriculum coverage
    const coverageValidation = this.validateCurriculumCoverage(lessons, unit);
    unitValidation.issues.push(...coverageValidation.issues);
    unitValidation.warnings.push(...coverageValidation.warnings);
    
    // Validate vocabulary distribution
    const vocabularyValidation = this.validateVocabularyDistribution(lessons, unit);
    unitValidation.issues.push(...vocabularyValidation.issues);
    unitValidation.warnings.push(...vocabularyValidation.warnings);
    
    // Calculate statistics
    unitValidation.stats = {
      structureValid: lessons.filter(l => this.validateLessonStructure(l).valid).length,
      timingValid: lessons.filter(l => this.validateTiming(l).valid).length,
      differentiationValid: lessons.filter(l => this.validateDifferentiation(l).valid).length,
      gradeAppropriate: lessons.filter(l => this.validateGradeAppropriate(l).valid).length
    };
    
    // Update totals
    this.validationResults.totalLessons += lessons.length;
    if (unitValidation.valid) {
      this.validationResults.valid += lessons.length;
    }
    this.validationResults.warnings += unitValidation.warnings.length;
    this.validationResults.errors += unitValidation.issues.length;
    
    return unitValidation;
  }

  /**
   * Validate a single lesson
   */
  validateSingleLesson(lesson, lessonNumber, unit) {
    const validation = {
      lessonNumber: lessonNumber,
      valid: true,
      issues: [],
      warnings: []
    };
    
    // Check required fields
    const requiredFields = [
      'title', 'learningGoals', 'successCriteria',
      'vocabulary', 'mindsOn', 'action', 'consolidation',
      'differentiation', 'materials'
    ];
    
    requiredFields.forEach(field => {
      if (!lesson[field]) {
        validation.valid = false;
        validation.issues.push(`Lesson ${lessonNumber}: Missing required field '${field}'`);
      }
    });
    
    // Validate time structure (ETFO compliance)
    if (lesson.mindsOn) {
      if (lesson.mindsOn.duration !== 8) {
        validation.issues.push(
          `Lesson ${lessonNumber}: Minds On must be 8 minutes (got ${lesson.mindsOn.duration})`
        );
        validation.valid = false;
      }
    }
    
    if (lesson.action) {
      if (lesson.action.duration !== 27) {
        validation.issues.push(
          `Lesson ${lessonNumber}: Action must be 27 minutes (got ${lesson.action.duration})`
        );
        validation.valid = false;
      }
      
      // Validate activities within Action
      if (lesson.action.activities) {
        const totalActivityTime = lesson.action.activities.reduce(
          (sum, act) => sum + (act.duration || 0), 0
        );
        
        if (Math.abs(totalActivityTime - 27) > 1) {
          validation.warnings.push(
            `Lesson ${lessonNumber}: Action activities total ${totalActivityTime} min (should be 27)`
          );
        }
        
        // Check for variety
        if (lesson.action.activities.length < 2) {
          validation.warnings.push(
            `Lesson ${lessonNumber}: Consider adding more varied activities (only ${lesson.action.activities.length})`
          );
        }
      }
    }
    
    if (lesson.consolidation) {
      if (lesson.consolidation.duration !== 10) {
        validation.issues.push(
          `Lesson ${lessonNumber}: Consolidation must be 10 minutes (got ${lesson.consolidation.duration})`
        );
        validation.valid = false;
      }
      
      // Check for assessment strategy
      if (!lesson.consolidation.assessmentStrategy) {
        validation.warnings.push(
          `Lesson ${lessonNumber}: Missing specific assessment strategy in consolidation`
        );
      }
    }
    
    // Validate success criteria
    if (lesson.successCriteria) {
      if (!Array.isArray(lesson.successCriteria) || lesson.successCriteria.length < 2) {
        validation.warnings.push(
          `Lesson ${lessonNumber}: Should have at least 2-3 success criteria`
        );
      }
    }
    
    // Validate differentiation
    if (lesson.differentiation) {
      const diffCategories = ['forStruggling', 'forIEP', 'forELL', 'forAdvanced'];
      const missingDiff = diffCategories.filter(cat => !lesson.differentiation[cat]);
      
      if (missingDiff.length > 0) {
        validation.warnings.push(
          `Lesson ${lessonNumber}: Missing differentiation for: ${missingDiff.join(', ')}`
        );
      }
    }
    
    // Validate Grade 1 appropriateness
    const grade1Validation = this.validateGrade1Appropriateness(lesson, lessonNumber);
    validation.warnings.push(...grade1Validation.warnings);
    validation.issues.push(...grade1Validation.issues);
    
    return validation;
  }

  /**
   * Validate Grade 1 developmental appropriateness
   */
  validateGrade1Appropriateness(lesson, lessonNumber) {
    const validation = {
      issues: [],
      warnings: []
    };
    
    // Check for movement/physical activity
    const lessonText = JSON.stringify(lesson).toLowerCase();
    const hasMovement = lessonText.includes('move') || 
                       lessonText.includes('stand') || 
                       lessonText.includes('physical') ||
                       lessonText.includes('bouge') ||
                       lessonText.includes('debout');
    
    if (!hasMovement) {
      validation.warnings.push(
        `Lesson ${lessonNumber}: Consider adding movement activities for Grade 1`
      );
    }
    
    // Check for concrete/manipulative use
    const hasConcrete = lessonText.includes('manipulat') ||
                       lessonText.includes('object') ||
                       lessonText.includes('concrete') ||
                       lessonText.includes('hands-on') ||
                       lessonText.includes('concret');
    
    if (!hasConcrete && lessonNumber <= 5) {
      validation.warnings.push(
        `Lesson ${lessonNumber}: Early lessons should emphasize concrete materials`
      );
    }
    
    // Check for partner/group work
    const hasCollaboration = lessonText.includes('partner') ||
                            lessonText.includes('group') ||
                            lessonText.includes('partenaire') ||
                            lessonText.includes('équipe');
    
    if (!hasCollaboration) {
      validation.warnings.push(
        `Lesson ${lessonNumber}: Include partner or group work for social development`
      );
    }
    
    return validation;
  }

  /**
   * Validate unit-level coherence and progression
   */
  validateCoherence(lessons, unit) {
    const validation = {
      issues: [],
      warnings: []
    };
    
    // Check for progressive complexity
    const earlyLessons = lessons.slice(0, 5);
    const middleLessons = lessons.slice(5, 15);
    const lateLessons = lessons.slice(15);
    
    // Early lessons should be more concrete
    earlyLessons.forEach((lesson, i) => {
      const lessonText = JSON.stringify(lesson).toLowerCase();
      if (lessonText.includes('abstract') || lessonText.includes('symbolic')) {
        validation.warnings.push(
          `Lesson ${i + 1}: May be too abstract for early unit introduction`
        );
      }
    });
    
    // Late lessons should prepare for culminating task
    if (lateLessons.length > 0 && unit.culminatingTask) {
      const culminatingMentioned = lateLessons.some(lesson => {
        const text = JSON.stringify(lesson).toLowerCase();
        return text.includes('culminat') || 
               text.includes('final') || 
               text.includes('project') ||
               text.includes('démonstrat');
      });
      
      if (!culminatingMentioned) {
        validation.warnings.push(
          'Final lessons should explicitly prepare for culminating task'
        );
      }
    }
    
    // Check for variety in activities
    const activityTypes = new Set();
    lessons.forEach(lesson => {
      if (lesson.action?.activities) {
        lesson.action.activities.forEach(activity => {
          if (activity.name) {
            activityTypes.add(activity.name.toLowerCase());
          }
        });
      }
    });
    
    if (activityTypes.size < lessons.length / 2) {
      validation.warnings.push(
        `Limited activity variety (${activityTypes.size} unique types for ${lessons.length} lessons)`
      );
    }
    
    return validation;
  }

  /**
   * Validate curriculum expectation coverage
   */
  validateCurriculumCoverage(lessons, unit) {
    const validation = {
      issues: [],
      warnings: []
    };
    
    if (!unit.expectations || unit.expectations.length === 0) {
      return validation;
    }
    
    // Track which expectations are addressed
    const expectationsCovered = new Map();
    unit.expectations.forEach(exp => {
      expectationsCovered.set(exp.code, 0);
    });
    
    // Count coverage across lessons
    lessons.forEach((lesson, index) => {
      const lessonText = JSON.stringify(lesson).toLowerCase();
      
      unit.expectations.forEach(exp => {
        if (lessonText.includes(exp.code.toLowerCase()) ||
            (exp.description && lessonText.includes(exp.description.toLowerCase().substring(0, 20)))) {
          expectationsCovered.set(exp.code, expectationsCovered.get(exp.code) + 1);
        }
      });
    });
    
    // Check for uncovered or undercovered expectations
    expectationsCovered.forEach((count, code) => {
      if (count === 0) {
        validation.issues.push(
          `Expectation ${code} not addressed in any lesson`
        );
      } else if (count < 3) {
        validation.warnings.push(
          `Expectation ${code} only addressed ${count} time(s) - consider more coverage`
        );
      }
    });
    
    return validation;
  }

  /**
   * Validate vocabulary distribution
   */
  validateVocabularyDistribution(lessons, unit) {
    const validation = {
      issues: [],
      warnings: []
    };
    
    if (!unit.keyVocabulary || unit.keyVocabulary.length === 0) {
      return validation;
    }
    
    // Track vocabulary usage
    const vocabularyUsed = new Set();
    const vocabularyCount = new Map();
    
    lessons.forEach((lesson, index) => {
      if (lesson.vocabulary && Array.isArray(lesson.vocabulary)) {
        lesson.vocabulary.forEach(term => {
          vocabularyUsed.add(term);
          vocabularyCount.set(term, (vocabularyCount.get(term) || 0) + 1);
        });
      }
    });
    
    // Check for missing vocabulary
    const missingTerms = unit.keyVocabulary.filter(term => !vocabularyUsed.has(term));
    
    if (missingTerms.length > 0) {
      validation.warnings.push(
        `${missingTerms.length} vocabulary terms not used: ${missingTerms.slice(0, 5).join(', ')}...`
      );
    }
    
    // Check for overuse
    vocabularyCount.forEach((count, term) => {
      if (count > lessons.length / 3) {
        validation.warnings.push(
          `Term "${term}" may be overused (${count} times in ${lessons.length} lessons)`
        );
      }
    });
    
    // Check distribution
    const avgTermsPerLesson = vocabularyUsed.size / lessons.length;
    if (avgTermsPerLesson < 2) {
      validation.warnings.push(
        'Consider distributing more vocabulary across lessons'
      );
    }
    
    return validation;
  }

  /**
   * Validate lesson structure
   */
  validateLessonStructure(lesson) {
    const validation = { valid: true, issues: [] };
    
    // Check required components
    if (!lesson.mindsOn || !lesson.action || !lesson.consolidation) {
      validation.valid = false;
      validation.issues.push('Missing ETFO structure components');
    }
    
    // Check for proper structure in each component
    if (lesson.mindsOn && (!lesson.mindsOn.description || !lesson.mindsOn.duration)) {
      validation.valid = false;
      validation.issues.push('Incomplete Minds On section');
    }
    
    if (lesson.action && (!lesson.action.activities || lesson.action.activities.length === 0)) {
      validation.valid = false;
      validation.issues.push('No activities in Action section');
    }
    
    if (lesson.consolidation && (!lesson.consolidation.description || !lesson.consolidation.duration)) {
      validation.valid = false;
      validation.issues.push('Incomplete Consolidation section');
    }
    
    return validation;
  }

  /**
   * Validate timing
   */
  validateTiming(lesson) {
    const validation = { valid: true, issues: [] };
    
    // Check ETFO timing: 8 min Minds On, 27 min Action, 10 min Consolidation
    if (lesson.mindsOn?.duration !== 8) {
      validation.valid = false;
      validation.issues.push(`Minds On should be 8 minutes, got ${lesson.mindsOn?.duration}`);
    }
    
    if (lesson.action?.duration !== 27) {
      validation.valid = false;
      validation.issues.push(`Action should be 27 minutes, got ${lesson.action?.duration}`);
    }
    
    if (lesson.consolidation?.duration !== 10) {
      validation.valid = false;
      validation.issues.push(`Consolidation should be 10 minutes, got ${lesson.consolidation?.duration}`);
    }
    
    return validation;
  }

  /**
   * Validate differentiation
   */
  validateDifferentiation(lesson) {
    const validation = { valid: true, issues: [] };
    
    if (!lesson.action?.differentiation) {
      validation.valid = false;
      validation.issues.push('Missing differentiation strategies');
      return validation;
    }
    
    const diff = lesson.action.differentiation;
    const requiredStrategies = ['forStruggling', 'forAdvanced', 'forELL', 'forIEP'];
    
    requiredStrategies.forEach(strategy => {
      if (!diff[strategy] || diff[strategy].length === 0) {
        validation.valid = false;
        validation.issues.push(`Missing differentiation for ${strategy}`);
      }
    });
    
    return validation;
  }

  /**
   * Validate grade appropriateness
   */
  validateGradeAppropriate(lesson) {
    const validation = { valid: true, issues: [] };
    
    // Check for Grade 1 appropriate content
    const lessonText = JSON.stringify(lesson).toLowerCase();
    
    // Check for inappropriate complexity
    const tooComplex = [
      'multiplication', 'division', 'fractions', 'decimals',
      'algebraic', 'equation', 'formula', 'theorem'
    ];
    
    tooComplex.forEach(term => {
      if (lessonText.includes(term)) {
        validation.valid = false;
        validation.issues.push(`Content may be too complex for Grade 1: "${term}"`);
      }
    });
    
    // Check for age-appropriate language
    if (lesson.vocabulary) {
      const complexWords = lesson.vocabulary.filter(word => word.length > 12);
      if (complexWords.length > 2) {
        validation.issues.push(`Some vocabulary may be too complex: ${complexWords.join(', ')}`);
      }
    }
    
    return validation;
  }

  /**
   * Generate validation report
   */
  generateReport() {
    const report = {
      summary: {
        totalLessons: this.validationResults.totalLessons,
        validLessons: this.validationResults.valid,
        warnings: this.validationResults.warnings,
        errors: this.validationResults.errors,
        validationRate: (this.validationResults.valid / this.validationResults.totalLessons * 100).toFixed(1) + '%'
      },
      details: this.validationResults.issues,
      timestamp: new Date().toISOString()
    };
    
    console.log('\n' + '=' .repeat(60));
    console.log('📋 VALIDATION REPORT');
    console.log('=' .repeat(60));
    console.log(`Total Lessons: ${report.summary.totalLessons}`);
    console.log(`Valid Lessons: ${report.summary.validLessons}`);
    console.log(`Validation Rate: ${report.summary.validationRate}`);
    console.log(`Warnings: ${report.summary.warnings}`);
    console.log(`Errors: ${report.summary.errors}`);
    console.log('=' .repeat(60));
    
    return report;
  }
}

// Export for use
module.exports = { LessonValidator };

// Test if run directly
if (require.main === module) {
  const validator = new LessonValidator({ verbose: true });
  
  // Create sample lesson for testing
  const sampleLesson = {
    title: 'Counting to 5 / Compter jusqu\'à 5',
    learningGoals: 'Students will count objects to 5',
    successCriteria: ['I can count to 5', 'I can match numbers to quantities'],
    vocabulary: ['un', 'deux', 'trois'],
    mindsOn: {
      duration: 8,
      description: 'Number song and movement',
      grouping: 'whole class'
    },
    action: {
      duration: 27,
      activities: [
        { name: 'Counting practice', duration: 15 },
        { name: 'Number games', duration: 12 }
      ]
    },
    consolidation: {
      duration: 10,
      description: 'Share counting strategies',
      assessmentStrategy: 'Observation'
    },
    differentiation: {
      forStruggling: ['Use counters'],
      forIEP: ['Modified numbers'],
      forELL: ['Visual supports'],
      forAdvanced: ['Count to 10']
    },
    materials: ['counters', 'number cards']
  };
  
  const sampleUnit = {
    id: 'test-123',
    title: 'Number Foundations',
    lessonCount: 1,
    expectations: [{ code: '1.N1', description: 'Count to 50' }],
    keyVocabulary: ['un', 'deux', 'trois', 'quatre', 'cinq']
  };
  
  const validation = validator.validateUnitLessons([sampleLesson], sampleUnit);
  console.log('\n✅ Sample validation complete');
  console.log('Valid:', validation.valid);
  console.log('Issues:', validation.issues.length);
  console.log('Warnings:', validation.warnings.length);
}