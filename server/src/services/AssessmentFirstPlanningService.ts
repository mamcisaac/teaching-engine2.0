import type { PrismaClient } from '@prisma/client';

import { logger } from '../logger';
import { BaseService } from './base/BaseService';

export interface AssessmentDesignPlan {
  performance_task: {
    scenario: string;
    role: string;
    audience: string;
    format: string;
    authentic_context: string;
    real_world_application: string;
  };
  rubric: {
    criteria: AssessmentCriterion[];
    scoring_levels: ScoringLevel[];
    holistic_or_analytic: 'holistic' | 'analytic';
  };
  success_criteria: string[];
  evidence_collection: {
    observations: string[];
    conversations: string[];
    products: string[];
  };
  assessment_timeline: AssessmentCheckpoint[];
  differentiation_considerations: {
    accommodations: string[];
    modifications: string[];
    extensions: string[];
  };
}

export interface AssessmentCriterion {
  name: string;
  description: string;
  weight: number; // 1-4 scale
  learning_target: string;
  curriculum_expectation: string;
}

export interface ScoringLevel {
  level: number;
  label: string;
  description: string;
  qualitative_descriptors: string[];
}

export interface AssessmentCheckpoint {
  timing: string; // e.g., "Beginning", "Week 2", "End of Unit"
  purpose: 'diagnostic' | 'formative' | 'summative';
  method: string;
  success_indicators: string[];
}

export interface PlanningWorkflow {
  step: number;
  phase: 'desired_results' | 'assessment_evidence' | 'learning_plan';
  title: string;
  description: string;
  required_inputs: string[];
  outputs: string[];
  validation_criteria: string[];
  is_completed: boolean;
}

export interface LessonActivityValidation {
  is_aligned: boolean;
  alignment_score: number; // 0-1
  issues: string[];
  suggestions: string[];
  assessment_gaps: string[];
}

export class AssessmentFirstPlanningService extends BaseService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    super('AssessmentFirstPlanningService');
    this.prisma = prisma;
  }

  /**
   * Create a comprehensive assessment plan following UbD Stage 2 principles
   * This must be completed before any lesson activities are designed
   */
  async designAssessmentFirst(parameters: {
    subject: string;
    grade: number;
    learning_outcomes: string[];
    transfer_goals: string[];
    essential_questions: string[];
    unit_duration_weeks: number;
    big_ideas: string[];
  }): Promise<AssessmentDesignPlan> {
    try {
      logger.info(`Designing assessment-first plan for ${parameters.subject}, Grade ${parameters.grade}`);

      // Stage 2 of UbD: Determine Acceptable Evidence
      
      // 1. Design Performance Task (Authentic Assessment)
      const performanceTask = await this.createPerformanceTask(parameters);

      // 2. Create Analytic Rubric aligned to learning outcomes
      const rubric = await this.generateAnalyticRubric(parameters, performanceTask);

      // 3. Define Success Criteria (Student-friendly language)
      const successCriteria = this.generateSuccessCriteria(parameters);

      // 4. Plan Evidence Collection Strategy (Observations, Conversations, Products)
      const evidenceCollection = this.planEvidenceCollection(parameters);

      // 5. Create Assessment Timeline with checkpoints
      const assessmentTimeline = this.createAssessmentTimeline(parameters);

      // 6. Plan Differentiation for Assessment
      const differentiationConsiderations = this.planAssessmentDifferentiation(parameters);

      const assessmentPlan: AssessmentDesignPlan = {
        performance_task: performanceTask,
        rubric,
        success_criteria: successCriteria,
        evidence_collection: evidenceCollection,
        assessment_timeline: assessmentTimeline,
        differentiation_considerations: differentiationConsiderations
      };

      // Save assessment plan to database for tracking
      await this.saveAssessmentPlan(assessmentPlan, parameters);

      logger.info('Assessment-first plan created successfully');
      return assessmentPlan;
    } catch (error) {
      logger.error('Error creating assessment-first plan:', error);
      throw error;
    }
  }

  /**
   * Create an authentic performance task
   */
  private async createPerformanceTask(parameters: {
    subject: string;
    grade: number;
    learning_outcomes: string[];
    transfer_goals: string[];
    big_ideas: string[];
  }): Promise<AssessmentDesignPlan['performance_task']> {
    // Get existing performance task templates for reference
    const templates = await this.prisma.performanceTaskTemplate.findMany({
      where: {
        subject: parameters.subject,
        gradeMin: { lte: parameters.grade },
        gradeMax: { gte: parameters.grade }
      },
      orderBy: { timesUsed: 'desc' },
      take: 5
    });

    // Create task based on subject and grade-level appropriateness
    const taskScenarios = this.generateTaskScenarios(parameters);
    const selectedScenario = this.selectOptimalScenario(taskScenarios, parameters);

    return {
      scenario: selectedScenario.scenario,
      role: selectedScenario.role,
      audience: selectedScenario.audience,
      format: selectedScenario.format,
      authentic_context: selectedScenario.authentic_context,
      real_world_application: selectedScenario.real_world_application
    };
  }

  /**
   * Generate multiple performance task scenarios
   */
  private generateTaskScenarios(parameters: {
    subject: string;
    grade: number;
    learning_outcomes: string[];
    big_ideas: string[];
  }): Array<{
    scenario: string;
    role: string;
    audience: string;
    format: string;
    authentic_context: string;
    real_world_application: string;
    alignment_score: number;
  }> {
    const scenarios: any[] = [];

    // Subject-specific scenario generation
    if (parameters.subject === 'Mathematics') {
      scenarios.push({
        scenario: 'Your class needs to design a new playground for the school. You must create a plan that shows how different shapes and sizes work together.',
        role: 'Young Architect',
        audience: 'School Principal and Students',
        format: 'Visual design with measurements and explanation',
        authentic_context: 'School playground planning',
        real_world_application: 'Architecture and spatial design',
        alignment_score: 0.9
      });

      scenarios.push({
        scenario: 'You are helping your family plan a birthday party. You need to figure out how much food to buy and how to arrange the tables.',
        role: 'Party Planner',
        audience: 'Family Members',
        format: 'Planning chart and presentation',
        authentic_context: 'Family celebration planning',
        real_world_application: 'Budget planning and spatial organization',
        alignment_score: 0.85
      });
    }

    if (parameters.subject === 'Français langue première') {
      scenarios.push({
        scenario: 'Vous devez créer un livre d\'histoires pour les plus jeunes élèves de l\'école pour les aider à apprendre le français.',
        role: 'Auteur de livres pour enfants',
        audience: 'Élèves de maternelle',
        format: 'Livre illustré avec texte simple',
        authentic_context: 'Création littéraire éducative',
        real_world_application: 'Publication et éducation',
        alignment_score: 0.9
      });

      scenarios.push({
        scenario: 'Votre classe organise une présentation pour les parents sur ce que vous avez appris cette année.',
        role: 'Présentateur étudiant',
        audience: 'Parents et familles',
        format: 'Présentation orale avec supports visuels',
        authentic_context: 'Communication scolaire-famille',
        real_world_application: 'Présentation publique',
        alignment_score: 0.85
      });
    }

    if (parameters.subject === 'Sciences et technologie') {
      scenarios.push({
        scenario: 'You discovered a new type of plant in your schoolyard. Create a scientific report to share your findings with other young scientists.',
        role: 'Young Scientist',
        audience: 'Other student scientists and teachers',
        format: 'Scientific poster with observations and drawings',
        authentic_context: 'Scientific discovery and reporting',
        real_world_application: 'Scientific communication',
        alignment_score: 0.9
      });

      scenarios.push({
        scenario: 'Your community wants to make the local park more friendly for animals. Design a plan to help wildlife feel welcome.',
        role: 'Wildlife Conservation Helper',
        audience: 'Community Members and Park Officials',
        format: 'Conservation plan with illustrations',
        authentic_context: 'Environmental stewardship',
        real_world_application: 'Conservation planning',
        alignment_score: 0.85
      });
    }

    if (parameters.subject === 'Études sociales') {
      scenarios.push({
        scenario: 'Your school wants to create a friendship garden where students from all backgrounds feel welcome. Plan what this space should include.',
        role: 'Community Space Designer',
        audience: 'Students, Teachers, and Families',
        format: 'Design proposal with reasons and drawings',
        authentic_context: 'Inclusive community building',
        real_world_application: 'Social planning and inclusion',
        alignment_score: 0.9
      });

      scenarios.push({
        scenario: 'You are helping new students learn about your community. Create a welcome guide that shows them the important places and people.',
        role: 'Community Ambassador',
        audience: 'New Students and Their Families',
        format: 'Illustrated community guide',
        authentic_context: 'Community orientation',
        real_world_application: 'Cultural integration support',
        alignment_score: 0.85
      });
    }

    return scenarios.length > 0 ? scenarios : this.getGenericScenarios(parameters);
  }

  /**
   * Select the optimal scenario based on alignment with learning outcomes
   */
  private selectOptimalScenario(
    scenarios: any[],
    parameters: { learning_outcomes: string[]; transfer_goals: string[]; }
  ): any {
    // Score scenarios based on alignment with learning outcomes and transfer goals
    return scenarios.reduce((best, current) => {
      const currentScore = this.calculateScenarioAlignment(current, parameters);
      const bestScore = this.calculateScenarioAlignment(best, parameters);
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Calculate how well a scenario aligns with learning outcomes
   */
  private calculateScenarioAlignment(
    scenario: any,
    parameters: { learning_outcomes: string[]; transfer_goals: string[]; }
  ): number {
    let alignmentScore = scenario.alignment_score || 0.5;

    // Boost score if scenario connects to multiple learning outcomes
    const outcomeConnections = parameters.learning_outcomes.filter(outcome =>
      scenario.scenario.toLowerCase().includes(outcome.toLowerCase().slice(0, 10))
    ).length;

    alignmentScore += (outcomeConnections * 0.1);

    // Boost score for transfer goal alignment
    const transferConnections = parameters.transfer_goals.filter(goal =>
      scenario.real_world_application.toLowerCase().includes(goal.toLowerCase().slice(0, 10))
    ).length;

    alignmentScore += (transferConnections * 0.15);

    return Math.min(alignmentScore, 1.0);
  }

  /**
   * Generate analytic rubric aligned to learning outcomes
   */
  private async generateAnalyticRubric(
    parameters: { learning_outcomes: string[]; transfer_goals: string[]; grade: number; },
    performanceTask: AssessmentDesignPlan['performance_task']
  ): Promise<AssessmentDesignPlan['rubric']> {
    // Create criteria based on learning outcomes
    const criteria = this.createAssessmentCriteria(parameters.learning_outcomes, parameters.grade);

    // Create 4-level scoring scale appropriate for Grade 1
    const scoringLevels = this.createScoringLevels(parameters.grade);

    return {
      criteria,
      scoring_levels: scoringLevels,
      holistic_or_analytic: 'analytic'
    };
  }

  /**
   * Create assessment criteria from learning outcomes
   */
  private createAssessmentCriteria(learningOutcomes: string[], grade: number): AssessmentCriterion[] {
    const baseCriteria: AssessmentCriterion[] = [
      {
        name: 'Understanding',
        description: 'Shows understanding of key concepts and ideas',
        weight: 4,
        learning_target: 'Demonstrate comprehension of main concepts',
        curriculum_expectation: learningOutcomes[0] || 'General understanding'
      },
      {
        name: 'Application',
        description: 'Uses knowledge and skills in the task',
        weight: 3,
        learning_target: 'Apply learning to solve problems or create something new',
        curriculum_expectation: learningOutcomes[1] || 'Skill application'
      },
      {
        name: 'Communication',
        description: 'Shares ideas clearly through words, pictures, or actions',
        weight: 3,
        learning_target: 'Communicate ideas effectively for the audience',
        curriculum_expectation: 'Communication skills'
      }
    ];

    // Add grade-specific criteria
    if (grade === 1) {
      baseCriteria.push({
        name: 'Effort and Persistence',
        description: 'Shows good effort and keeps trying when work is challenging',
        weight: 2,
        learning_target: 'Demonstrate learning skills and persistence',
        curriculum_expectation: 'Learning skills development'
      });
    }

    return baseCriteria;
  }

  /**
   * Create grade-appropriate scoring levels
   */
  private createScoringLevels(grade: number): ScoringLevel[] {
    if (grade === 1) {
      return [
        {
          level: 4,
          label: 'I can teach others!',
          description: 'Shows excellent understanding and can help others',
          qualitative_descriptors: [
            'Explains ideas very clearly',
            'Shows deep understanding',
            'Helps classmates learn',
            'Goes beyond what was asked'
          ]
        },
        {
          level: 3,
          label: 'I can do this well!',
          description: 'Shows good understanding and can do the work independently',
          qualitative_descriptors: [
            'Shows clear understanding',
            'Works independently most of the time',
            'Explains thinking when asked',
            'Meets all expectations'
          ]
        },
        {
          level: 2,
          label: 'I can do this with help!',
          description: 'Shows some understanding but needs support',
          qualitative_descriptors: [
            'Shows some understanding',
            'Needs some help to complete work',
            'Can explain with prompting',
            'Meets most expectations'
          ]
        },
        {
          level: 1,
          label: 'I\'m learning!',
          description: 'Just beginning to understand, needs lots of support',
          qualitative_descriptors: [
            'Shows beginning understanding',
            'Needs significant support',
            'Can share some ideas',
            'Working toward expectations'
          ]
        }
      ];
    }

    // Default scoring levels for other grades
    return [
      {
        level: 4,
        label: 'Exemplary',
        description: 'Exceeds expectations',
        qualitative_descriptors: ['Exceptional work', 'Goes beyond requirements']
      },
      {
        level: 3,
        label: 'Proficient',
        description: 'Meets expectations',
        qualitative_descriptors: ['Good quality work', 'Meets all criteria']
      },
      {
        level: 2,
        label: 'Developing',
        description: 'Approaching expectations',
        qualitative_descriptors: ['Satisfactory work', 'Meets some criteria']
      },
      {
        level: 1,
        label: 'Beginning',
        description: 'Below expectations',
        qualitative_descriptors: ['Needs improvement', 'Limited evidence']
      }
    ];
  }

  /**
   * Generate student-friendly success criteria
   */
  private generateSuccessCriteria(parameters: {
    learning_outcomes: string[];
    grade: number;
    subject: string;
  }): string[] {
    const baseCriteria = [
      'I can explain what I learned in my own words',
      'I can show my thinking through my work',
      'I can ask good questions about the topic',
      'I can connect my learning to real life'
    ];

    // Add subject-specific criteria
    const subjectCriteria: Record<string, string[]> = {
      'Mathematics': [
        'I can solve problems using different strategies',
        'I can explain why my answer makes sense',
        'I can find and describe patterns'
      ],
      'Français langue première': [
        'Je peux exprimer mes idées clairement en français',
        'Je peux comprendre des textes appropriés à mon niveau',
        'Je peux écouter et répondre aux autres'
      ],
      'Sciences et technologie': [
        'I can make observations and ask scientific questions',
        'I can predict what might happen and test my ideas',
        'I can explain what I discovered'
      ],
      'Études sociales': [
        'I can describe how people are similar and different',
        'I can explain how we can help our community',
        'I can show respect for others\' ideas'
      ]
    };

    return [...baseCriteria, ...(subjectCriteria[parameters.subject] || [])].slice(0, 6);
  }

  /**
   * Plan evidence collection strategy
   */
  private planEvidenceCollection(parameters: {
    subject: string;
    grade: number;
    unit_duration_weeks: number;
  }): AssessmentDesignPlan['evidence_collection'] {
    return {
      observations: [
        'Student explanations during work time',
        'Problem-solving strategies used',
        'Collaboration and communication skills',
        'Persistence when facing challenges',
        'Questions asked during learning'
      ],
      conversations: [
        'One-on-one conferences about learning',
        'Small group discussions about key concepts',
        'Exit ticket conversations',
        'Peer-to-peer teaching moments',
        'Family conference discussions'
      ],
      products: [
        'Performance task final product',
        'Learning journal entries',
        'Practice work samples',
        'Self-reflection artifacts',
        'Photo documentation of learning process'
      ]
    };
  }

  /**
   * Create assessment timeline with checkpoints
   */
  private createAssessmentTimeline(parameters: {
    unit_duration_weeks: number;
    subject: string;
  }): AssessmentCheckpoint[] {
    const checkpoints: AssessmentCheckpoint[] = [];

    // Pre-assessment (Diagnostic)
    checkpoints.push({
      timing: 'Beginning of Unit',
      purpose: 'diagnostic',
      method: 'Pre-assessment activity or KWL chart',
      success_indicators: [
        'Prior knowledge identified',
        'Misconceptions noted',
        'Student interests discovered',
        'Learning goals set'
      ]
    });

    // Mid-unit formative checkpoints
    const weeksCount = Math.max(2, parameters.unit_duration_weeks);
    for (let week = 1; week < weeksCount; week++) {
      checkpoints.push({
        timing: `Week ${week}`,
        purpose: 'formative',
        method: 'Quick check-in, exit ticket, or mini-task',
        success_indicators: [
          'Understanding of key concepts developing',
          'Skills being practiced successfully',
          'Areas needing more support identified',
          'Student confidence growing'
        ]
      });
    }

    // Final assessment (Summative)
    checkpoints.push({
      timing: 'End of Unit',
      purpose: 'summative',
      method: 'Performance task completion and reflection',
      success_indicators: [
        'Learning outcomes demonstrated',
        'Transfer of learning evident',
        'Self-reflection completed',
        'Next steps identified'
      ]
    });

    return checkpoints;
  }

  /**
   * Plan assessment differentiation strategies
   */
  private planAssessmentDifferentiation(parameters: {
    grade: number;
    subject: string;
  }): AssessmentDesignPlan['differentiation_considerations'] {
    return {
      accommodations: [
        'Extended time for completion',
        'Visual supports and graphic organizers',
        'Alternative response formats (drawing, verbal, etc.)',
        'Reduced distractions in environment',
        'Use of assistive technology when appropriate',
        'Break tasks into smaller chunks'
      ],
      modifications: [
        'Simplified success criteria when needed',
        'Modified performance task complexity',
        'Alternative demonstration methods',
        'Adjusted expectations based on IEP goals',
        'Focus on priority learning outcomes'
      ],
      extensions: [
        'Additional complexity in performance task',
        'Leadership roles in group work',
        'Independent research components',
        'Teaching or mentoring opportunities',
        'Cross-curricular connections',
        'Real-world application projects'
      ]
    };
  }

  /**
   * Get generic scenarios for subjects not specifically handled
   */
  private getGenericScenarios(parameters: { subject: string; grade: number; }): any[] {
    return [
      {
        scenario: `You are an expert in ${parameters.subject.toLowerCase()} and need to teach younger students what you have learned.`,
        role: 'Student Expert',
        audience: 'Younger Students',
        format: 'Teaching presentation or demonstration',
        authentic_context: 'Peer education',
        real_world_application: 'Knowledge sharing and teaching',
        alignment_score: 0.7
      }
    ];
  }

  /**
   * Validate that lesson activities align with assessment plan
   */
  async validateLessonAlignment(
    assessmentPlan: AssessmentDesignPlan,
    proposedActivities: {
      minds_on: string;
      action: string;
      consolidation: string;
      learning_goals: string;
    }
  ): Promise<LessonActivityValidation> {
    // Check alignment between assessment and activities
    const alignmentScore = this.calculateActivityAlignment(assessmentPlan, proposedActivities);
    const issues = this.identifyAlignmentIssues(assessmentPlan, proposedActivities);
    const suggestions = this.generateAlignmentSuggestions(issues, assessmentPlan);
    const assessmentGaps = this.identifyAssessmentGaps(assessmentPlan, proposedActivities);

    return {
      is_aligned: alignmentScore >= 0.7 && issues.length === 0,
      alignment_score: alignmentScore,
      issues,
      suggestions,
      assessment_gaps: assessmentGaps
    };
  }

  /**
   * Calculate alignment score between assessment and activities
   */
  private calculateActivityAlignment(
    assessmentPlan: AssessmentDesignPlan,
    activities: { learning_goals: string; action: string; }
  ): number {
    let score = 0.5; // Base score

    // Check if learning goals align with success criteria
    const goalAlignment = assessmentPlan.success_criteria.some(criterion =>
      activities.learning_goals.toLowerCase().includes(criterion.toLowerCase().slice(0, 15))
    );
    if (goalAlignment) score += 0.2;

    // Check if activities prepare students for performance task
    const taskPreparation = activities.action.toLowerCase().includes(
      assessmentPlan.performance_task.format.toLowerCase().slice(0, 10)
    );
    if (taskPreparation) score += 0.2;

    // Check if activities address assessment criteria
    const criteriaAlignment = assessmentPlan.rubric.criteria.some(criterion =>
      activities.action.toLowerCase().includes(criterion.name.toLowerCase())
    );
    if (criteriaAlignment) score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Identify alignment issues
   */
  private identifyAlignmentIssues(
    assessmentPlan: AssessmentDesignPlan,
    activities: any
  ): string[] {
    const issues: string[] = [];

    // Check for missing preparation for performance task
    if (!activities.action.toLowerCase().includes('practice') && 
        !activities.action.toLowerCase().includes('prepare')) {
      issues.push('Activities do not adequately prepare students for the performance task');
    }

    // Check for missing success criteria connection
    const hasSuccessCriteriaConnection = assessmentPlan.success_criteria.some(criterion =>
      activities.learning_goals.toLowerCase().includes(criterion.toLowerCase().slice(0, 10))
    );
    if (!hasSuccessCriteriaConnection) {
      issues.push('Learning goals do not clearly connect to success criteria');
    }

    return issues;
  }

  /**
   * Generate suggestions for better alignment
   */
  private generateAlignmentSuggestions(
    issues: string[],
    assessmentPlan: AssessmentDesignPlan
  ): string[] {
    const suggestions: string[] = [];

    if (issues.includes('Activities do not adequately prepare students for the performance task')) {
      suggestions.push(`Include practice activities for ${assessmentPlan.performance_task.format.toLowerCase()}`);
      suggestions.push('Add scaffolding activities that build toward the final performance task');
    }

    if (issues.includes('Learning goals do not clearly connect to success criteria')) {
      suggestions.push('Revise learning goals to explicitly reference the success criteria');
      suggestions.push('Share success criteria with students at the beginning of lessons');
    }

    return suggestions;
  }

  /**
   * Identify gaps in assessment coverage
   */
  private identifyAssessmentGaps(
    assessmentPlan: AssessmentDesignPlan,
    activities: any
  ): string[] {
    const gaps: string[] = [];

    // Check if all rubric criteria are addressed in activities
    assessmentPlan.rubric.criteria.forEach(criterion => {
      const isAddressed = activities.action.toLowerCase().includes(criterion.name.toLowerCase()) ||
                          activities.learning_goals.toLowerCase().includes(criterion.name.toLowerCase());
      if (!isAddressed) {
        gaps.push(`Assessment criterion "${criterion.name}" not addressed in lesson activities`);
      }
    });

    return gaps;
  }

  /**
   * Save assessment plan to database for tracking
   */
  private async saveAssessmentPlan(
    plan: AssessmentDesignPlan,
    parameters: { subject: string; grade: number; }
  ): Promise<void> {
    try {
      // Create performance task template for reuse
      await this.prisma.performanceTaskTemplate.create({
        data: {
          userId: 1, // This should come from the authenticated user
          title: `${parameters.subject} Performance Task - Grade ${parameters.grade}`,
          subject: parameters.subject,
          gradeMin: parameters.grade,
          gradeMax: parameters.grade,
          scenario: plan.performance_task.scenario,
          role: plan.performance_task.role,
          audience: plan.performance_task.audience,
          format: plan.performance_task.format,
          rubricTemplate: JSON.stringify(plan.rubric),
          isPublic: false,
          timesUsed: 1
        }
      });

      logger.info('Assessment plan saved to database for future reference');
    } catch (error) {
      logger.warn('Could not save assessment plan to database:', error);
      // Don't throw error - this is not critical for the planning process
    }
  }

  /**
   * Get the UbD planning workflow steps to enforce proper sequence
   */
  getUbDPlanningWorkflow(): PlanningWorkflow[] {
    return [
      {
        step: 1,
        phase: 'desired_results',
        title: 'Identify Learning Outcomes',
        description: 'Define what students should know, understand, and be able to do',
        required_inputs: ['curriculum_expectations', 'transfer_goals', 'essential_questions'],
        outputs: ['clear_learning_outcomes', 'success_criteria_draft'],
        validation_criteria: ['Outcomes are specific and measurable', 'Transfer goals identified'],
        is_completed: false
      },
      {
        step: 2,
        phase: 'assessment_evidence',
        title: 'Design Assessment Evidence',
        description: 'Create assessments that will show students have achieved the learning outcomes',
        required_inputs: ['learning_outcomes', 'success_criteria_draft'],
        outputs: ['performance_task', 'rubric', 'evidence_collection_plan'],
        validation_criteria: ['Assessment aligns to outcomes', 'Rubric matches task', 'Evidence plan complete'],
        is_completed: false
      },
      {
        step: 3,
        phase: 'learning_plan',
        title: 'Plan Learning Experiences',
        description: 'Design activities and lessons that prepare students for assessments',
        required_inputs: ['performance_task', 'rubric', 'success_criteria'],
        outputs: ['lesson_activities', 'instructional_strategies', 'materials_list'],
        validation_criteria: ['Activities prepare for assessment', 'Proper scaffolding included'],
        is_completed: false
      }
    ];
  }

  /**
   * Health check for the service
   */
  async checkHealth(): Promise<{ healthy: boolean; details: Record<string, unknown> }> {
    try {
      const templateCount = await this.prisma.performanceTaskTemplate.count();
      return {
        healthy: true,
        details: {
          totalTemplates: templateCount,
          serviceStatus: 'operational'
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}